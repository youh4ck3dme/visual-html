import { describe, expect, it } from "vitest";

import { annotateGenerateOutputQuality, type GenerateOutput } from "@/lib/validation/generation";

function output(overrides: Partial<GenerateOutput>): GenerateOutput {
  return {
    html: "<div>ok</div>",
    css: "",
    javascript: "",
    explanation: "",
    accessibilityNotes: "",
    responsiveNotes: "",
    assumptions: [],
    warnings: [],
    ...overrides,
  };
}

describe("annotateGenerateOutputQuality", () => {
  it("warns when HTML classes have no CSS", () => {
    const result = annotateGenerateOutputQuality(output({ html: '<div class="header">A</div>' }));
    expect(result.warnings.join("\n")).toContain("HTML uses class attributes");
  });

  it("warns about uncertain OCR tokens", () => {
    const result = annotateGenerateOutputQuality(
      output({ html: "<table><tr><td>Daň. základ: NOTPROVIDED</td></tr></table>" }),
    );
    expect(result.warnings.join("\n")).toContain("uncertain OCR token");
  });

  it("warns when document-like output has no print CSS", () => {
    const result = annotateGenerateOutputQuality(
      output({ html: "<h1>Výpis z Účtu</h1><table><tr><td>1</td></tr></table>", css: "table{}" }),
    );
    expect(result.warnings.join("\n")).toContain("print-focused CSS");
  });

  it("keeps warnings stable when quality requirements are met", () => {
    const result = annotateGenerateOutputQuality(
      output({
        html: '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head><body><table class="statement"><tr><td>ok</td></tr></table></body></html>',
        css: ".statement{border-collapse:collapse}.statement td{border:1px solid #000}@media print{body{margin:0}}",
      }),
    );
    expect(result.warnings).toEqual([]);
  });
});
