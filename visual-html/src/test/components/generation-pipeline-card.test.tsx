import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";

import { GenerationPipelineCard } from "@/components/editor/generation-pipeline-card";
import { renderWithProviders } from "@/test/test-utils";

describe("GenerationPipelineCard", () => {
  it("renders pipeline steps with aria-live status", () => {
    renderWithProviders(
      <GenerationPipelineCard
        title="Image upload · Preparing image for OCR..."
        subtitle="Progress reflects completed pipeline phases, not a model timer."
        progress={10}
        steps={[
          { id: "a", label: "Validating input" },
          { id: "b", label: "Preparing image for OCR" },
        ]}
        activeIndex={1}
        status="running"
        progressAriaLabel="Generation progress"
      />,
    );

    const status = screen.getByRole("status");
    expect(status).toHaveAttribute("aria-live", "polite");
    expect(screen.getByText("Validating input")).toBeInTheDocument();
    expect(screen.getByText("Preparing image for OCR")).toBeInTheDocument();
    expect(screen.getByText(/Image upload · Preparing image for OCR/)).toBeInTheDocument();
  });

  it("shows cancel control when onCancel is provided", () => {
    renderWithProviders(
      <GenerationPipelineCard
        title="Building HTML..."
        progress={50}
        steps={[{ id: "build", label: "Building HTML" }]}
        activeIndex={0}
        status="running"
        progressAriaLabel="Generation progress"
        onCancel={() => undefined}
        cancelLabel="Cancel generation"
        testId="builder-generation-status"
      />,
    );

    expect(screen.getByTestId("builder-generation-status")).toBeInTheDocument();
    expect(screen.getByTestId("builder-cancel-generation")).toBeInTheDocument();
  });
});
