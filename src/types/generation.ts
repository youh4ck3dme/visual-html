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
  | "AI_AUTH_ERROR"
  | "AI_INVALID_RESPONSE"
  | "BLOB_UPLOAD_FAILED"
  | "JSON_REPAIR_FAILED"
  | "SANITIZE_FAILED"
  | "RATE_LIMITED"
  | "MISSING_API_KEY"
  | "MISSING_BLOB_TOKEN"
  | "SERVER_ERROR";

export type GenerationPhase =
  | "validating"
  | "rate_limited_check"
  | "uploading_to_blob"
  | "ocr"
  | "synthesizing"
  | "json_repair"
  | "sanitizing"
  | "done"
  | "failed";

export type SensorStatus = "idle" | "running" | "success" | "warning" | "failed";

export interface GenerationDiagnostic {
  code: ApiErrorCode;
  title: string;
  detail: string;
  likelyCause: string;
  suggestedFix: string;
  retryable: boolean;
}

export interface GenerationSensor {
  phase: GenerationPhase;
  progress: number;
  status: SensorStatus;
  message: string;
  diagnostic?: GenerationDiagnostic;
}

export interface ApiError {
  code: ApiErrorCode;
  message: string;
  phase?: GenerationPhase;
  diagnostic?: GenerationDiagnostic;
}
