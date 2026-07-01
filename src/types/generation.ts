export type OutputMode = "static" | "single-file" | "tailwind" | "component";
export type ResponsivenessMode = "mobile-first" | "desktop-first" | "adaptive";
export type StylingMode = "vanilla-css" | "css-modules" | "tailwind" | "inline-css";
export type AccessibilityLevel = "standard" | "strict";

export interface GenerationOptions {
  outputMode: OutputMode;
  stylingMode: StylingMode;
  responsiveness: ResponsivenessMode;
  accessibilityLevel: AccessibilityLevel;
  additionalInstructions?: string;
}

export interface GenerateHtmlInput {
  imageBase64: string;
  mimeType: string;
  options: GenerationOptions;
}

export interface GenerateHtmlResult {
  html: string;
  css: string;
  javascript: string;
  explanation: string;
  accessibilityNotes: string;
  responsiveNotes: string;
  assumptions: string[];
  warnings: string[];
}

export type ApiErrorCode =
  | "INVALID_FILE"
  | "FILE_TOO_LARGE"
  | "UNSUPPORTED_FORMAT"
  | "AI_TIMEOUT"
  | "AI_INVALID_RESPONSE"
  | "RATE_LIMITED"
  | "MISSING_API_KEY"
  | "SERVER_ERROR";

export interface ApiError {
  code: ApiErrorCode;
  message: string;
}