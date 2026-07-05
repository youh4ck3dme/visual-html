import { describe, expect, it } from "vitest";

import {
  injectConsoleBridge,
  normalizePreviewConsoleMessage,
  parsePreviewConsoleMessage,
  capPreviewConsoleEntries,
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

  it("injects bridge script with location.origin postMessage target", () => {
    const doc = "<!DOCTYPE html><html><head></head><body></body></html>";
    const out = injectConsoleBridge(doc);
    expect(out).toContain("window.location.origin");
  });

  it("capPreviewConsoleEntries keeps the most recent entries", () => {
    const entries = Array.from({ length: 105 }, (_, i) => ({
      id: `e-${i}`,
      level: "log" as const,
      args: [`msg-${i}`],
      ts: i,
    }));
    const capped = capPreviewConsoleEntries(entries);
    expect(capped).toHaveLength(100);
    expect(capped[0]?.args[0]).toBe("msg-5");
    expect(capped[99]?.args[0]).toBe("msg-104");
  });
});
