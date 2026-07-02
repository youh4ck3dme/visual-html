import { describe, expect, it } from "vitest";

import {
  extractJsonBlob,
  parseGenerateOutput,
  prepareJsonRepairInput,
  recoverPartialGenerateOutput,
} from "@/lib/ai/json-output";

const validOutput = {
  html: "<main><h1>Hello</h1></main>",
  css: ".card { color: red; }",
  javascript: "",
  explanation: "ok",
  accessibilityNotes: "labels ok",
  responsiveNotes: "adaptive",
  assumptions: [],
  warnings: [],
};

describe("AI JSON output parsing", () => {
  it("extracts JSON from a markdown fence with surrounding prose", () => {
    const raw = `Here is the result:\n\n\`\`\`json\n${JSON.stringify(validOutput)}\n\`\`\`\nDone.`;

    const parsed = parseGenerateOutput(raw);

    expect(parsed.ok).toBe(true);
    if (parsed.ok) expect(parsed.data.html).toContain("Hello");
  });

  it("keeps braces inside CSS strings while finding the JSON boundary", () => {
    const raw = `prefix ${JSON.stringify({ ...validOutput, css: "@media (min-width: 768px) { .card { display: grid; } }" })} suffix {not json}`;

    const extracted = extractJsonBlob(raw);
    const parsed = parseGenerateOutput(raw);

    expect(extracted).toContain("@media");
    expect(parsed.ok).toBe(true);
  });

  it("normalizes common model mistakes in assumptions and warnings", () => {
    const parsed = parseGenerateOutput(
      JSON.stringify({
        html: "<main></main>",
        css: null,
        javascript: null,
        explanation: 123,
        accessibilityNotes: null,
        responsiveNotes: null,
        assumptions: "Text was inferred",
        warnings: "Some icons were unclear",
      }),
    );

    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.data.css).toBe("");
    expect(parsed.data.explanation).toBe("123");
    expect(parsed.data.assumptions).toEqual(["Text was inferred"]);
    expect(parsed.data.warnings).toEqual(["Some icons were unclear"]);
  });

  it("returns a useful reason for malformed JSON", () => {
    const parsed = parseGenerateOutput('{"html":"<main>","css":');

    expect(parsed.ok).toBe(false);
    if (!parsed.ok) expect(parsed.reason).toContain("JSON parse failed");
  });

  it("recovers complete fields before an unterminated later string", () => {
    const raw = `{"html":"<main><section>Recovered</section></main>","css":".page { display: grid; }","javascript":"","explanation":"`;

    const recovered = recoverPartialGenerateOutput(raw);

    expect(recovered?.html).toContain("Recovered");
    expect(recovered?.css).toContain("display: grid");
    expect(recovered?.warnings).toContain(
      "AI output was truncated; recovered the complete fields that were available.",
    );
  });

  it("does not recover when no code fields are complete", () => {
    const recovered = recoverPartialGenerateOutput('{"html":"<main>');

    expect(recovered).toBeNull();
  });

  it("prepares repair input at a complete field boundary", () => {
    const raw = `{"html":"${"x".repeat(200)}","css":"${"y".repeat(200)}","javascript":"${"z".repeat(200)}"`;

    const repairInput = prepareJsonRepairInput(raw, 260);

    expect(repairInput.endsWith("\n}")).toBe(true);
    expect(repairInput).toContain('"html"');
    expect(repairInput).not.toContain('"css":"');
  });
});
