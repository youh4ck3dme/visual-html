import { describe, expect, it } from "vitest";

import {
  injectConsoleBridge,
  parsePreviewConsoleMessage,
  PREVIEW_CONSOLE_BRIDGE_SCRIPT,
} from "@/lib/preview-console-bridge";

describe("preview-console-bridge", () => {
  describe("parsePreviewConsoleMessage", () => {
    it("returns null for non-objects", () => {
      expect(parsePreviewConsoleMessage(null)).toBeNull();
      expect(parsePreviewConsoleMessage("log")).toBeNull();
    });

    it("returns null for wrong message type", () => {
      expect(parsePreviewConsoleMessage({ type: "other", level: "log", args: [] })).toBeNull();
    });

    it("returns null for invalid level", () => {
      expect(
        parsePreviewConsoleMessage({ type: "pngto-preview-console", level: "debug", args: [] }),
      ).toBeNull();
    });

    it("parses valid console postMessage payloads", () => {
      const entry = parsePreviewConsoleMessage({
        type: "pngto-preview-console",
        level: "error",
        args: ["boom", { nested: true }],
        ts: 1_700_000_000_000,
      });

      expect(entry).toMatchObject({
        level: "error",
        args: ["boom", "[object Object]"],
        ts: 1_700_000_000_000,
      });
      expect(entry?.id).toMatch(/^1700000000000-/);
    });

    it("defaults ts when missing", () => {
      const before = Date.now();
      const entry = parsePreviewConsoleMessage({
        type: "pngto-preview-console",
        level: "warn",
        args: ["slow"],
      });
      const after = Date.now();

      expect(entry?.ts).toBeGreaterThanOrEqual(before);
      expect(entry?.ts).toBeLessThanOrEqual(after);
    });
  });

  describe("injectConsoleBridge", () => {
    it("injects script before </head> when present", () => {
      const html = "<!doctype html><html><head><title>x</title></head><body></body></html>";
      const out = injectConsoleBridge(html);

      expect(out).toContain(PREVIEW_CONSOLE_BRIDGE_SCRIPT.trim());
      expect(out.indexOf("<script>")).toBeLessThan(out.indexOf("</head>"));
    });

    it("injects at start of body when head is missing", () => {
      const html = "<html><body><p>hi</p></body></html>";
      const out = injectConsoleBridge(html);

      expect(out).toMatch(/<body[^>]*><script>/i);
      expect(out).toContain("hi");
    });

    it("prepends script for fragment-only HTML", () => {
      const html = "<div>fragment</div>";
      const out = injectConsoleBridge(html);

      expect(out.startsWith("<script>")).toBe(true);
      expect(out).toContain("fragment");
    });

    it("does not double-inject when bridge marker exists", () => {
      const html = `<html><head><script>${PREVIEW_CONSOLE_BRIDGE_SCRIPT}</script></head><body></body></html>`;
      expect(injectConsoleBridge(html)).toBe(html);
    });
  });
});
