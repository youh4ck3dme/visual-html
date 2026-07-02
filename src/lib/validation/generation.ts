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

export const generateOutputSchema = z.object({
  html: z.string().default(""),
  css: z.string().default(""),
  javascript: z.string().default(""),
  explanation: z.string().default(""),
  accessibilityNotes: z.string().default(""),
  responsiveNotes: z.string().default(""),
  assumptions: z.array(z.string()).default([]),
  warnings: z.array(z.string()).default([]),
});

export type GenerateInput = z.infer<typeof generateInputSchema>;
export type OcrInput = z.infer<typeof ocrInputSchema>;
export type ContinueInput = z.infer<typeof continueInputSchema>;
export type RefineInput = z.infer<typeof refineInputSchema>;
export type GenerateOutput = z.infer<typeof generateOutputSchema>;
