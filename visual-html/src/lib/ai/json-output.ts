import { generateOutputSchema, type GenerateOutput } from "@/lib/validation/generation";

export type GenerateOutputParseResult =
  | { ok: true; data: GenerateOutput; extracted: string }
  | { ok: false; extracted: string; reason: string };

const OUTPUT_STRING_FIELDS = [
  "html",
  "css",
  "javascript",
  "explanation",
  "accessibilityNotes",
  "responsiveNotes",
] as const;

const OUTPUT_ARRAY_FIELDS = ["assumptions", "warnings"] as const;

export function extractJsonBlob(raw: string): string {
  const source = raw.trim();
  const firstBrace = source.indexOf("{");
  if (firstBrace === -1) return source;

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let index = firstBrace; index < source.length; index += 1) {
    const char = source[index];

    if (inString) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (char === "\\") {
        escaped = true;
        continue;
      }
      if (char === '"') {
        inString = false;
      }
      continue;
    }

    if (char === '"') {
      inString = true;
      continue;
    }

    if (char === "{") {
      depth += 1;
      continue;
    }

    if (char === "}") {
      depth -= 1;
      if (depth === 0) {
        return source.slice(firstBrace, index + 1);
      }
    }
  }

  return source.slice(firstBrace);
}

function findStringValueEnd(source: string, valueStart: number): number {
  let escaped = false;

  for (let index = valueStart; index < source.length; index += 1) {
    const char = source[index];
    if (escaped) {
      escaped = false;
      continue;
    }
    if (char === "\\") {
      escaped = true;
      continue;
    }
    if (char === '"') return index;
  }

  return -1;
}

function extractCompleteStringField(source: string, field: string): string | undefined {
  const match = new RegExp(`"${field}"\\s*:\\s*"`).exec(source);
  if (!match) return undefined;

  const valueStart = match.index + match[0].length;
  const valueEnd = findStringValueEnd(source, valueStart);
  if (valueEnd === -1) return undefined;

  try {
    return JSON.parse(`"${source.slice(valueStart, valueEnd)}"`) as string;
  } catch {
    return undefined;
  }
}

function findArrayValueEnd(source: string, valueStart: number): number {
  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let index = valueStart; index < source.length; index += 1) {
    const char = source[index];

    if (inString) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (char === "\\") {
        escaped = true;
        continue;
      }
      if (char === '"') inString = false;
      continue;
    }

    if (char === '"') {
      inString = true;
      continue;
    }
    if (char === "[") depth += 1;
    if (char === "]") {
      depth -= 1;
      if (depth === 0) return index;
    }
  }

  return -1;
}

function extractCompleteArrayField(source: string, field: string): string[] | undefined {
  const match = new RegExp(`"${field}"\\s*:\\s*\\[`).exec(source);
  if (!match) return undefined;

  const valueStart = match.index + match[0].length - 1;
  const valueEnd = findArrayValueEnd(source, valueStart);
  if (valueEnd === -1) return undefined;

  try {
    const value = JSON.parse(source.slice(valueStart, valueEnd + 1)) as unknown;
    if (!Array.isArray(value)) return undefined;
    return value.filter((item) => item != null).map((item) => String(item));
  } catch {
    return undefined;
  }
}

export function recoverPartialGenerateOutput(raw: string): GenerateOutput | null {
  const extracted = extractJsonBlob(raw);
  const partial: Record<string, unknown> = {};

  for (const field of OUTPUT_STRING_FIELDS) {
    const value = extractCompleteStringField(extracted, field);
    if (value !== undefined) partial[field] = value;
  }

  for (const field of OUTPUT_ARRAY_FIELDS) {
    const value = extractCompleteArrayField(extracted, field);
    if (value !== undefined) partial[field] = value;
  }

  const hasUsableCode =
    (typeof partial.html === "string" && partial.html.trim().length > 0) ||
    (typeof partial.css === "string" && partial.css.trim().length > 0) ||
    (typeof partial.javascript === "string" && partial.javascript.trim().length > 0);

  if (!hasUsableCode) return null;

  const warnings = Array.isArray(partial.warnings) ? partial.warnings : [];
  partial.warnings = [
    ...warnings,
    "AI output was truncated; recovered the complete fields that were available.",
  ];

  const parsed = generateOutputSchema.safeParse(partial);
  return parsed.success ? parsed.data : null;
}

export function prepareJsonRepairInput(raw: string, maxChars = 16_000): string {
  const extracted = extractJsonBlob(raw);
  if (extracted.length <= maxChars) return extracted;

  const snippet = extracted.slice(0, maxChars);
  let depth = 0;
  let inString = false;
  let escaped = false;
  let lastFieldBoundary = -1;

  for (let index = 0; index < snippet.length; index += 1) {
    const char = snippet[index];

    if (inString) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (char === "\\") {
        escaped = true;
        continue;
      }
      if (char === '"') inString = false;
      continue;
    }

    if (char === '"') {
      inString = true;
      continue;
    }
    if (char === "{" || char === "[") depth += 1;
    if (char === "}" || char === "]") depth -= 1;
    if (char === "," && depth === 1) lastFieldBoundary = index;
  }

  if (lastFieldBoundary > 20) {
    return `${snippet.slice(0, lastFieldBoundary)}\n}`;
  }

  return `${snippet}\n/* truncated before a complete field boundary */`;
}

function describeValidationError(error: {
  issues: Array<{ path: Array<PropertyKey>; message: string }>;
}) {
  return error.issues
    .slice(0, 6)
    .map((issue) => `${issue.path.join(".") || "root"}: ${issue.message}`)
    .join("; ");
}

export function parseGenerateOutput(raw: string): GenerateOutputParseResult {
  const extracted = extractJsonBlob(raw);

  let value: unknown;
  try {
    value = JSON.parse(extracted);
  } catch (error) {
    return {
      ok: false,
      extracted,
      reason: `JSON parse failed: ${(error as Error).message}`,
    };
  }

  const parsed = generateOutputSchema.safeParse(value);
  if (!parsed.success) {
    return {
      ok: false,
      extracted,
      reason: `JSON schema validation failed: ${describeValidationError(parsed.error)}`,
    };
  }

  return { ok: true, data: parsed.data, extracted };
}
