import { describe, expect, it } from "vitest";

import {
  injectConsoleBridge,
  normalizePreviewConsoleMessage,
  parsePreviewConsoleMessage,
} from "@/lib/preview-console-bridge";

describe("preview-console-bridge", () => {
  it("injects bridge script into HTML", () => {
    const doc = "<!DOCTYPE html><html><head></head><body><p>Hi</p></body></html>";
    const out = injectConsoleBridge(doc);
    expect(out).toContain("__pngtoConsoleBridge");
    expect(out).toContain("<script>");
  });

  it("parses legacy console postMessage payloads", () => {
    const entry = parsePreviewConsoleMessage({
      type: "pngto-preview-console",
      level: "error",
      args: ["boom"],
      ts: 123,
    });
    expect(entry).toMatchObject({ level: "error", args: ["boom"], ts: 123 });
  });

  it("normalizePreviewConsoleMessage handles legacy payloads", () => {
    expect(
      normalizePreviewConsoleMessage({
        type: "pngto-preview-console",
        level: "warn",
        args: ["x"],
        ts: 1,
      })?.level,
    ).toBe("warn");
    expect(normalizePreviewConsoleMessage(null)).toBeNull();
  });
});
