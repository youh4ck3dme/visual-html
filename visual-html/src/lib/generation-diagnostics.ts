import type {
  ApiError,
  ApiErrorCode,
  GenerationDiagnostic,
  GenerationPhase,
  GenerationSensor,
  SensorStatus,
} from "@/types/generation";

const IMAGE_TIMEOUT_GUIDANCE =
  "Use a screenshot <=700 KB for best reliability; <=1.2 MB is usually acceptable. Keep the longest side <=1600 px and crop unrelated content.";

export const PHASE_PROGRESS: Record<GenerationPhase, number> = {
  validating: 5,
  rate_limited_check: 10,
  uploading_to_blob: 25,
  ocr: 45,
  synthesizing: 75,
  json_repair: 90,
  sanitizing: 90,
  done: 100,
  failed: 100,
};

const PHASE_MESSAGES: Record<GenerationPhase, string> = {
  validating: "Validating image and options...",
  rate_limited_check: "Checking usage limits...",
  uploading_to_blob: "Preparing image for OCR...",
  ocr: "Reading text and structure from the screenshot...",
  synthesizing: "Generating semantic HTML and CSS...",
  json_repair: "Repairing AI JSON output...",
  sanitizing: "Preparing safe preview output...",
  done: "Generation complete.",
  failed: "Generation failed.",
};

export const PHASE_LABELS: Record<GenerationPhase, string> = {
  validating: "Validation",
  rate_limited_check: "Rate limit",
  uploading_to_blob: "Image upload",
  ocr: "OCR",
  synthesizing: "Synthesis",
  json_repair: "JSON repair",
  sanitizing: "Sanitizing",
  done: "Done",
  failed: "Failed",
};

export function createSensor(
  phase: GenerationPhase,
  status: SensorStatus = "running",
  diagnostic?: GenerationDiagnostic,
): GenerationSensor {
  return {
    phase,
    progress: PHASE_PROGRESS[phase],
    status,
    message: diagnostic?.title ?? PHASE_MESSAGES[phase],
    diagnostic,
  };
}

export function diagnosticForError(
  code: ApiErrorCode,
  message: string,
  phase: GenerationPhase,
): GenerationDiagnostic {
  switch (code) {
    case "INVALID_FILE":
      return {
        code,
        title: "Invalid image input",
        detail: message || "The uploaded image payload is missing or cannot be read.",
        likelyCause: "The browser sent an empty, corrupted, or unsupported file payload.",
        suggestedFix: "Upload a fresh PNG, JPG, or WebP screenshot and try again.",
        retryable: false,
      };
    case "FILE_TOO_LARGE":
      return {
        code,
        title: "Image is too large",
        detail: message || "The image exceeds the configured upload limit.",
        likelyCause: "The screenshot is larger than the app can safely send to the AI pipeline.",
        suggestedFix: "Resize or compress the screenshot, then generate again.",
        retryable: false,
      };
    case "UNSUPPORTED_FORMAT":
      return {
        code,
        title: "Unsupported image format",
        detail: message || "Only PNG, JPG, and WebP screenshots are accepted.",
        likelyCause: "The selected file is not one of the supported image MIME types.",
        suggestedFix: "Export the screenshot as PNG, JPG, or WebP.",
        retryable: false,
      };
    case "RATE_LIMITED":
      return {
        code,
        title: "Rate limit reached",
        detail: message || "This IP has sent too many generation requests in a short period.",
        likelyCause: "The burst or daily Upstash Redis limit was exceeded.",
        suggestedFix:
          "Wait a little before retrying. If this is your deployment, raise RATE_LIMIT_BURST or RATE_LIMIT_DAILY carefully.",
        retryable: true,
      };
    case "MISSING_API_KEY":
      return {
        code,
        title: "Mistral API key is missing",
        detail: "The server cannot call Mistral because MISTRAL_API_KEY is not configured.",
        likelyCause: "The production or preview environment is missing MISTRAL_API_KEY.",
        suggestedFix: "Add MISTRAL_API_KEY in Vercel Environment Variables and redeploy.",
        retryable: false,
      };
    case "AI_AUTH_ERROR":
      return {
        code,
        title: "Mistral authentication failed",
        detail:
          message || "Mistral rejected the API request with an authentication or permission error.",
        likelyCause:
          "The MISTRAL_API_KEY is invalid, expired, missing permissions, or belongs to the wrong account.",
        suggestedFix: "Rotate the Mistral key, update it in Vercel, and redeploy before retrying.",
        retryable: false,
      };
    case "AI_QUOTA_EXHAUSTED":
      return {
        code,
        title: "Mistral quota exhausted",
        detail: message || "All configured Mistral API keys are rate-limited or out of quota.",
        likelyCause:
          "The active Mistral key has no remaining quota, and no usable fallback key is configured for this environment.",
        suggestedFix:
          "Add MISTRAL_API_KEY_FALLBACK or MISTRAL_API_KEYS in Vercel for Production/Preview/Development, or configure MISTRAL_OCR_API_KEY and MISTRAL_CHAT_API_KEY to split OCR and synthesis usage. Redeploy after changing env vars.",
        retryable: true,
      };
    case "MISSING_BLOB_TOKEN":
      return {
        code,
        title: "Blob storage token is missing",
        detail:
          "The server cannot upload the screenshot because BLOB_READ_WRITE_TOKEN is not configured.",
        likelyCause: "The Vercel Blob environment variable is missing in this environment.",
        suggestedFix: "Add BLOB_READ_WRITE_TOKEN in Vercel Environment Variables and redeploy.",
        retryable: false,
      };
    case "BLOB_UPLOAD_FAILED":
      return {
        code,
        title: "Image upload failed",
        detail: message || "The screenshot could not be uploaded for OCR processing.",
        likelyCause:
          "Vercel Blob rejected the upload, the token is invalid, or the network request failed.",
        suggestedFix: "Check BLOB_READ_WRITE_TOKEN and Vercel Blob status, then retry.",
        retryable: true,
      };
    case "AI_TIMEOUT":
      return {
        code,
        title: phase === "ocr" ? "OCR timeout" : "AI generation timeout",
        detail: message || "The AI provider did not respond before the server timeout.",
        likelyCause:
          "The screenshot may be too large or visually complex, Mistral may be slow, or the network is degraded.",
        suggestedFix: IMAGE_TIMEOUT_GUIDANCE,
        retryable: true,
      };
    case "AI_INVALID_RESPONSE":
      return {
        code,
        title: phase === "ocr" ? "Unreadable OCR response" : "Invalid AI output",
        detail: message || "The AI provider returned an empty or malformed response.",
        likelyCause:
          "The screenshot may be ambiguous, or the model returned text that did not match the expected schema.",
        suggestedFix: "Retry with clearer instructions or a cleaner screenshot.",
        retryable: true,
      };
    case "JSON_REPAIR_FAILED":
      return {
        code,
        title: "JSON repair failed",
        detail: message || "The model output could not be repaired into the required JSON schema.",
        likelyCause:
          "The synthesis model likely produced a response that was too long and got truncated inside a JSON string. The app already tried automatic recovery and repair, but the response was still not usable.",
        suggestedFix:
          "Retry once with the default preset. If it repeats, remove extra instructions, crop or split a large screenshot, and use Continue generation after any recovered partial result.",
        retryable: true,
      };
    case "SANITIZE_FAILED":
      return {
        code,
        title: "Preview sanitization failed",
        detail: message || "The generated HTML could not be prepared safely for preview.",
        likelyCause: "The generated markup contains invalid or unsafe constructs.",
        suggestedFix: "Retry generation or disable risky custom instructions.",
        retryable: true,
      };
    case "SERVER_ERROR":
    default:
      return {
        code,
        title: "Unexpected server error",
        detail: message || "The server hit an unexpected error while processing this request.",
        likelyCause:
          "A provider request failed, configuration is incomplete, or an unhandled server path threw an error.",
        suggestedFix: "Try again. If it persists, inspect Vercel function logs for this phase.",
        retryable: true,
      };
  }
}

export function createApiError(
  code: ApiErrorCode,
  message: string,
  phase: GenerationPhase,
): ApiError {
  return {
    code,
    message,
    phase,
    diagnostic: diagnosticForError(code, message, phase),
  };
}
