import { afterEach, describe, expect, it } from "vitest";

import { getMistralKeyPool, shouldFailoverToNextKey } from "./mistral-keys";

const ENV_KEYS = [
  "MISTRAL_API_KEY",
  "MISTRAL_API_KEY_FALLBACK",
  "MISTRAL_API_KEYS",
  "MISTRAL_OCR_API_KEY",
  "MISTRAL_OCR_API_KEY_FALLBACK",
  "MISTRAL_OCR_API_KEYS",
  "MISTRAL_CHAT_API_KEY",
  "MISTRAL_CHAT_API_KEY_FALLBACK",
  "MISTRAL_CHAT_API_KEYS",
  "MISTRAL_SYNTHESIS_API_KEY",
  "MISTRAL_SYNTHESIS_API_KEY_FALLBACK",
  "MISTRAL_SYNTHESIS_API_KEYS",
  "MISTRAL_GENERATE_API_KEY",
  "MISTRAL_GENERATE_API_KEY_FALLBACK",
  "MISTRAL_GENERATE_API_KEYS",
] as const;

function clearMistralEnv() {
  for (const key of ENV_KEYS) delete process.env[key];
}

describe("getMistralKeyPool", () => {
  afterEach(() => {
    clearMistralEnv();
  });

  it("returns primary then fallback keys in order", () => {
    process.env.MISTRAL_API_KEY = "primary";
    process.env.MISTRAL_API_KEY_FALLBACK = "fallback";
    expect(getMistralKeyPool("chat")).toEqual(["primary", "fallback"]);
  });

  it("dedupes keys across env sources", () => {
    process.env.MISTRAL_API_KEY = "shared";
    process.env.MISTRAL_API_KEY_FALLBACK = "shared";
    process.env.MISTRAL_API_KEYS = "shared,other";
    expect(getMistralKeyPool("ocr")).toEqual(["shared", "other"]);
  });

  it("prefers dedicated OCR and chat keys for parallel orchestration", () => {
    process.env.MISTRAL_API_KEY = "global";
    process.env.MISTRAL_OCR_API_KEY = "ocr-only";
    process.env.MISTRAL_CHAT_API_KEY = "chat-only";

    expect(getMistralKeyPool("ocr")).toEqual(["ocr-only", "global"]);
    expect(getMistralKeyPool("chat")).toEqual(["chat-only", "global"]);
  });

  it("orders role-specific fallback keys before the global pool", () => {
    process.env.MISTRAL_API_KEY = "global";
    process.env.MISTRAL_API_KEY_FALLBACK = "global-fallback";
    process.env.MISTRAL_OCR_API_KEY = "ocr-primary";
    process.env.MISTRAL_OCR_API_KEY_FALLBACK = "ocr-fallback";
    process.env.MISTRAL_OCR_API_KEYS = "ocr-extra";
    process.env.MISTRAL_CHAT_API_KEY = "chat-primary";
    process.env.MISTRAL_CHAT_API_KEY_FALLBACK = "chat-fallback";
    process.env.MISTRAL_CHAT_API_KEYS = "chat-extra";

    expect(getMistralKeyPool("ocr")).toEqual([
      "ocr-primary",
      "ocr-fallback",
      "ocr-extra",
      "global",
      "global-fallback",
    ]);
    expect(getMistralKeyPool("chat")).toEqual([
      "chat-primary",
      "chat-fallback",
      "chat-extra",
      "global",
      "global-fallback",
    ]);
  });

  it("keeps legacy synthesis and generate aliases for chat keys", () => {
    process.env.MISTRAL_API_KEY = "global";
    process.env.MISTRAL_SYNTHESIS_API_KEY = "synthesis-primary";
    process.env.MISTRAL_GENERATE_API_KEY_FALLBACK = "generate-fallback";
    process.env.MISTRAL_SYNTHESIS_API_KEYS = "synthesis-extra";

    expect(getMistralKeyPool("chat")).toEqual([
      "synthesis-primary",
      "generate-fallback",
      "synthesis-extra",
      "global",
    ]);
  });
});

describe("shouldFailoverToNextKey", () => {
  it("fails over on rate limit and payment errors", () => {
    expect(shouldFailoverToNextKey(429, "", true)).toBe(true);
    expect(shouldFailoverToNextKey(402, "", true)).toBe(true);
  });

  it("does not fail over when no keys remain", () => {
    expect(shouldFailoverToNextKey(429, "", false)).toBe(false);
  });

  it("fails over on quota hints in auth-like responses", () => {
    expect(shouldFailoverToNextKey(403, '{"message":"Monthly quota exceeded"}', true)).toBe(true);
  });
});
