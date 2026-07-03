import { z } from "zod";

export const MAX_UPLOAD_MB = 10;
export const MAX_UPLOAD_BYTES = MAX_UPLOAD_MB * 1024 * 1024;
export const ALLOWED_MIME = ["image/png", "image/jpeg", "image/webp"] as const;

export const optionsSchema = z.object({
  outputMode: z.enum(["static", "single-file", "tailwind", "component"]),
  stylingMode: z.enum(["vanilla-css", "css-modules", "tailwind", "inline-css"]),
  responsiveness: z.enum(["mobile-first", "desktop-first", "adaptive"]),
  accessibilityLevel: z.enum(["standard", "strict"]),
  additionalInstructions: z.string().max(2000).optional(),
});

// Base64 payload cap: MAX_UPLOAD_BYTES * 4/3 + slack for prefix/newlines.
const MAX_BASE64_LEN = Math.ceil(MAX_UPLOAD_BYTES * 1.4);

const imageBase64Schema = z
  .string()
  .min(32, "Image data is empty")
  .max(MAX_BASE64_LEN, "Image exceeds size limit")
  .regex(/^[A-Za-z0-9+/=\s]+$/, "Invalid base64 payload");

// OCR markdown produced by phase 1 and echoed back by the client for phase 2.
// Derived from the user's own image, so low-risk; capped to bound payload size.
const ocrMarkdownSchema = z.string().max(200_000);

export const ocrInputSchema = z.object({
  imageBase64: imageBase64Schema,
  mimeType: z.enum(ALLOWED_MIME),
});

export const generateInputSchema = z.object({
  imageBase64: imageBase64Schema,
  mimeType: z.enum(ALLOWED_MIME),
  ocrMarkdown: ocrMarkdownSchema.default(""),
  options: optionsSchema,
});

export const refineInputSchema = z.object({
  prior: z.object({
    html: z.string().max(200_000),
    css: z.string().max(200_000),
    javascript: z.string().max(200_000),
  }),
  instruction: z.string().min(2).max(2000),
  options: optionsSchema,
});

export const continueInputSchema = z.object({
  prior: z.object({
    html: z.string().max(200_000),
    css: z.string().max(200_000),
    javascript: z.string().max(200_000),
  }),
  options: optionsSchema,
});

const outputString = z.preprocess((value) => {
  if (value == null) return "";
  if (typeof value === "string") return value;
  return String(value);
}, z.string().default(""));

const outputStringArray = z.preprocess((value) => {
  if (value == null) return [];
  if (typeof value === "string") return value.trim() ? [value] : [];
  if (Array.isArray(value)) {
    return value
      .filter((item) => item != null)
      .map((item) => (typeof item === "string" ? item : String(item)));
  }
  return [String(value)];
}, z.array(z.string()).default([]));

export const generateOutputSchema = z.object({
  html: outputString,
  css: outputString,
  javascript: outputString,
  explanation: outputString,
  accessibilityNotes: outputString,
  responsiveNotes: outputString,
  assumptions: outputStringArray,
  warnings: outputStringArray,
});

const QUALITY_WARNINGS = {
  cssMissingForClasses:
    "Quality gate: HTML uses class attributes but the CSS field is empty. Visual fidelity will be low until matching CSS is generated.",
  documentMetadataMissing:
    "Quality gate: full-document HTML is missing doctype, charset, or viewport metadata.",
  uncertainOcrToken:
    "Quality gate: output contains an uncertain OCR token such as NOTPROVIDED. Verify the source text manually before using this result.",
  printStylesMissing:
    "Quality gate: document-like/tabular output is missing print-focused CSS such as table rules, borders, or @media print.",
} as const;

function appendWarning(warnings: string[], warning: string): string[] {
  return warnings.includes(warning) ? warnings : [...warnings, warning];
}

export function annotateGenerateOutputQuality(output: GenerateOutput): GenerateOutput {
  let warnings = [...output.warnings];
  const html = output.html;
  const css = output.css;
  const hasClasses = /\bclass\s*=/.test(html);
  const isFullDocument = /<html[\s>]/i.test(html) || /<!doctype/i.test(html);
  const isDocumentLike =
    /<table[\s>]/i.test(html) || /invoice|statement|receipt|vypis|výpis/i.test(html);

  if (hasClasses && css.trim().length === 0) {
    warnings = appendWarning(warnings, QUALITY_WARNINGS.cssMissingForClasses);
  }
  if (
    isFullDocument &&
    (!/<!doctype/i.test(html) ||
      !/<meta[^>]+charset/i.test(html) ||
      !/name=["']viewport/i.test(html))
  ) {
    warnings = appendWarning(warnings, QUALITY_WARNINGS.documentMetadataMissing);
  }
  if (/NOTPROVIDED|\bunreadable\b|\bmissing\b|\bplaceholder\b/i.test(html)) {
    warnings = appendWarning(warnings, QUALITY_WARNINGS.uncertainOcrToken);
  }
  if (
    isDocumentLike &&
    (!/@media\s+print/i.test(css) || !/(table|border-collapse)/i.test(css) || !/border/i.test(css))
  ) {
    warnings = appendWarning(warnings, QUALITY_WARNINGS.printStylesMissing);
  }

  return { ...output, warnings };
}

export type GenerateInput = z.infer<typeof generateInputSchema>;
export type OcrInput = z.infer<typeof ocrInputSchema>;
export type ContinueInput = z.infer<typeof continueInputSchema>;
export type RefineInput = z.infer<typeof refineInputSchema>;
export type GenerateOutput = z.infer<typeof generateOutputSchema>;
