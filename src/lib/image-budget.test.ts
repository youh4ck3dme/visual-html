import { describe, expect, it } from "vitest";

import { imageBudgetReport } from "@/lib/image-budget";

describe("image budget", () => {
  it("marks <=700 KB and <=1400px images as good for AI", () => {
    const report = imageBudgetReport(650 * 1024, 1200, 900);

    expect(report.status).toBe("good");
    expect(report.recommendation).toContain("<=700 KB");
  });

  it("marks <=1.2 MB images as acceptable but heavier", () => {
    const report = imageBudgetReport(1_000 * 1024, 1500, 1000);

    expect(report.status).toBe("warning");
    expect(report.recommendation).toContain("<=1.2 MB");
  });

  it("marks larger screenshots as heavy for AI", () => {
    const report = imageBudgetReport(1_500 * 1024, 1600, 1200);

    expect(report.status).toBe("heavy");
    expect(report.recommendation).toContain("<=700 KB");
  });
});
