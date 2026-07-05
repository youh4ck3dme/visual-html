import { describe, expect, it } from "vitest";

import { isLikelyIncompleteHtml } from "@/lib/generation-output-gate";

describe("generation-output-gate", () => {
  it("flags empty and unclosed document shells", () => {
    expect(isLikelyIncompleteHtml({ html: "" })).toBe(true);
    expect(
      isLikelyIncompleteHtml({
        html: "<html><body><div><p>Hi",
      }),
    ).toBe(true);
  });

  it("accepts balanced minimal documents", () => {
    expect(
      isLikelyIncompleteHtml({
        html: "<html><body><main><p>Hi</p></main></body></html>",
      }),
    ).toBe(false);
  });
});
