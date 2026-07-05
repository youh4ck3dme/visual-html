import { describe, expect, it } from "vitest";

import { validateJsxSnippet } from "@/lib/validation/jsx-validator.stub";

describe("validateJsxSnippet", () => {
  it("accepts basic JSX markup", () => {
    expect(validateJsxSnippet('<div className="card">Hello</div>')).toEqual({ ok: true });
  });

  it("rejects markup without angle brackets", () => {
    expect(validateJsxSnippet("plain text")).toEqual({
      ok: false,
      error: "No JSX-like markup detected",
    });
  });

  it("rejects suspicious script close tags", () => {
    expect(validateJsxSnippet("<div></script>")).toEqual({
      ok: false,
      error: "Suspicious script close tag",
    });
  });
});
