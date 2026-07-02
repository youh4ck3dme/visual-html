import { generateOutputSchema, type GenerateOutput } from "@/lib/validation/generation";

export type GenerateOutputParseResult =
  | { ok: true; data: GenerateOutput; extracted: string }
  | { ok: false; extracted: string; reason: string };

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
