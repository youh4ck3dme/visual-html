import { beforeEach, describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";

import { GenerationPipelineCard } from "@/components/editor/generation-pipeline-card";
import { messages } from "@/lib/i18n/messages";
import { LOCALE_STORAGE_KEY } from "@/lib/locale";
import { renderWithProviders } from "@/test/test-utils";

describe.each(["en", "sk"] as const)("GenerationPipelineCard (%s)", (locale) => {
  beforeEach(() => {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  });

  it("renders pipeline steps with aria-live status", () => {
    const validating = messages[locale]["phase.validating"];
    const uploading = messages[locale]["loading.step.uploading_to_blob"];

    renderWithProviders(
      <GenerationPipelineCard
        title={`${messages[locale]["phase.uploading_to_blob"]} · ${uploading}`}
        subtitle="Progress reflects completed pipeline phases, not a model timer."
        progress={10}
        steps={[
          { id: "a", label: validating },
          { id: "b", label: uploading },
        ]}
        activeIndex={1}
        status="running"
        progressAriaLabel={messages[locale]["editor.previewLoadingAria"]}
      />,
    );

    const status = screen.getByRole("status");
    expect(status).toHaveAttribute("aria-live", "polite");
    expect(screen.getByText(validating)).toBeInTheDocument();
    expect(screen.getByText(uploading)).toBeInTheDocument();
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

  it("exposes running status while busy", () => {
    renderWithProviders(
      <GenerationPipelineCard
        title="Building HTML..."
        progress={25}
        steps={[{ id: "build", label: "Building HTML" }]}
        activeIndex={0}
        status="running"
        progressAriaLabel="Generation progress"
        testId="pipeline-busy"
      />,
    );
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText("Building HTML...")).toBeInTheDocument();
  });
});
