import type { Mock } from "vitest";

import { MOCK_FORENSIC_REPORT } from "@/test/mocks/forensic-report";
import { SAMPLE_GENERATE_RESULT } from "@/test/mocks/sample-image";

const DEFAULT_OCR_MARKDOWN = "# Mock OCR\n\nNav | Home | About";
const DEFAULT_BUILDER_HTML = "<!DOCTYPE html><html><body>AI</body></html>";

type ServerFnMockBag = {
  runOcr: Mock;
  generateHtml: Mock;
  refineHtml: Mock;
  continueHtml: Mock;
  builderChat: Mock;
  builderAiStatus: Mock;
};

function requireMocks(): ServerFnMockBag {
  const mocks = globalThis.__PNGTO_TEST_SERVER_FN_MOCKS__;
  if (!mocks) {
    throw new Error(
      "Server function mocks are not initialized. Ensure src/test/setup-mocks.ts runs before tests.",
    );
  }
  return mocks;
}

export function applyDefaultServerFnMocks(mocks: ServerFnMockBag): void {
  mocks.runOcr.mockReset();
  mocks.runOcr.mockResolvedValue({ ok: true, ocrMarkdown: DEFAULT_OCR_MARKDOWN });

  mocks.generateHtml.mockReset();
  mocks.generateHtml.mockResolvedValue({ ok: true, data: SAMPLE_GENERATE_RESULT });

  mocks.refineHtml.mockReset();
  mocks.refineHtml.mockResolvedValue({ ok: true, data: SAMPLE_GENERATE_RESULT });

  mocks.continueHtml.mockReset();
  mocks.continueHtml.mockResolvedValue({ ok: true, data: SAMPLE_GENERATE_RESULT });

  mocks.builderChat.mockReset();
  mocks.builderChat.mockResolvedValue({ ok: true, content: DEFAULT_BUILDER_HTML });

  mocks.builderAiStatus.mockReset();
  mocks.builderAiStatus.mockResolvedValue({ serverKeysConfigured: false });
}

export function resetServerFnMocks(): void {
  applyDefaultServerFnMocks(requireMocks());
}

export function resetForensicsMock(): void {
  const mock = getForensicsMock();
  mock.mockReset();
  mock.mockResolvedValue(MOCK_FORENSIC_REPORT);
}

export const runOcrMock = {
  get mock() {
    return requireMocks().runOcr;
  },
};

export const generateHtmlMock = {
  get mock() {
    return requireMocks().generateHtml;
  },
};

export const refineHtmlMock = {
  get mock() {
    return requireMocks().refineHtml;
  },
};

export const continueHtmlMock = {
  get mock() {
    return requireMocks().continueHtml;
  },
};

export const builderChatMock = {
  get mock() {
    return requireMocks().builderChat;
  },
};

/** Convenience accessors used by tests (same references as useServerFn registry). */
export function getServerFnMocks(): ServerFnMockBag {
  return requireMocks();
}

export function getForensicsMock(): Mock {
  const mock = globalThis.__PNGTO_FORENSICS_MOCK__;
  if (!mock) {
    throw new Error(
      "Forensics mock is not initialized. Ensure src/test/setup-mocks.ts runs before tests.",
    );
  }
  return mock;
}
