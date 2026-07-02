import { describe, expect, it } from "vitest";

import { createApiError, createSensor, diagnosticForError } from "@/lib/generation-diagnostics";

import type { GenerationPhase } from "@/types/generation";

describe("generation diagnostics", () => {
  it("maps missing Mistral API key to a non-retryable admin fix", () => {
    const diagnostic = diagnosticForError("MISSING_API_KEY", "missing", "ocr");

    expect(diagnostic.title).toBe("Mistral API key is missing");
    expect(diagnostic.suggestedFix).toContain("MISTRAL_API_KEY");
    expect(diagnostic.retryable).toBe(false);
  });

  it("maps rate limiting to a retryable usage limit diagnostic", () => {
    const error = createApiError("RATE_LIMITED", "Too many requests", "rate_limited_check");

    expect(error.phase).toBe("rate_limited_check");
    expect(error.diagnostic?.title).toBe("Rate limit reached");
    expect(error.diagnostic?.retryable).toBe(true);
  });

  it("maps OCR timeout to the OCR phase", () => {
    const diagnostic = diagnosticForError("AI_TIMEOUT", "AI request timed out", "ocr");

    expect(diagnostic.title).toBe("OCR timeout");
    expect(diagnostic.detail).toContain("timed out");
    expect(diagnostic.retryable).toBe(true);
  });

  it("maps invalid synthesis JSON to a retryable invalid output diagnostic", () => {
    const diagnostic = diagnosticForError(
      "AI_INVALID_RESPONSE",
      "Empty AI response",
      "synthesizing",
    );

    expect(diagnostic.title).toBe("Invalid AI output");
    expect(diagnostic.likelyCause).toContain("expected schema");
    expect(diagnostic.retryable).toBe(true);
  });

  it("maps JSON repair failure to the json_repair phase", () => {
    const error = createApiError(
      "JSON_REPAIR_FAILED",
      "AI returned malformed JSON after repair",
      "json_repair",
    );

    expect(error.phase).toBe("json_repair");
    expect(error.diagnostic?.title).toBe("JSON repair failed");
    expect(error.diagnostic?.retryable).toBe(true);
  });

  it("maps missing Blob token to a non-retryable admin fix", () => {
    const diagnostic = diagnosticForError("MISSING_BLOB_TOKEN", "missing", "uploading_to_blob");

    expect(diagnostic.title).toBe("Blob storage token is missing");
    expect(diagnostic.suggestedFix).toContain("BLOB_READ_WRITE_TOKEN");
    expect(diagnostic.retryable).toBe(false);
  });

  it("creates sensor milestones for real pipeline phases", () => {
    const phases: Array<[GenerationPhase, number]> = [
      ["validating", 5],
      ["rate_limited_check", 10],
      ["uploading_to_blob", 25],
      ["ocr", 45],
      ["synthesizing", 75],
      ["json_repair", 90],
      ["sanitizing", 90],
      ["done", 100],
    ];

    for (const [phase, progress] of phases) {
      expect(createSensor(phase).progress).toBe(progress);
    }
  });
});
