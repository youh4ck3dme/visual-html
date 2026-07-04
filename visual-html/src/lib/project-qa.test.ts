import { describe, expect, it } from "vitest";

import { runProjectQa } from "@/lib/project-qa";
import type { GenerateHtmlResult } from "@/types/generation";

const baseResult: GenerateHtmlResult = {
  html: '<main class="hero"><h1>Hello</h1><img src="x.png" alt="Logo" /></main>',
  css: ".hero { padding: 1rem; }",
  javascript: "",
  explanation: "",
  accessibilityNotes: "",
  responsiveNotes: "",
  assumptions: [],
  warnings: [],
};

describe("runProjectQa", () => {
  it("returns pass checks for valid output", () => {
    const checks = runProjectQa(baseResult, "Demo");
    expect(checks.find((c) => c.id === "html-nonempty")?.status).toBe("pass");
    expect(checks.find((c) => c.id === "viewport-meta")?.status).toBe("pass");
    expect(checks.find((c) => c.id === "document-title")?.status).toBe("pass");
  });

  it("warns when classes exist without CSS", () => {
    const checks = runProjectQa({ ...baseResult, css: "" }, "Demo");
    expect(checks.find((c) => c.id === "css-for-classes")?.status).toBe("warn");
  });

  it("fails when HTML is empty", () => {
    const checks = runProjectQa({ ...baseResult, html: "   " }, "Demo");
    expect(checks.find((c) => c.id === "html-nonempty")?.status).toBe("fail");
  });

  it("includes generation warnings and assumptions", () => {
    const checks = runProjectQa(
      {
        ...baseResult,
        warnings: ["Low contrast heading"],
        assumptions: ["Logo is decorative"],
      },
      "Demo",
    );
    expect(checks.find((c) => c.id === "generation-warnings")?.status).toBe("warn");
    expect(checks.find((c) => c.id === "generation-assumptions")?.status).toBe("warn");
  });
});
