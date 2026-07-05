import { beforeEach, describe, expect, it } from "vitest";
import userEvent from "@testing-library/user-event";
import { screen, waitFor } from "@testing-library/react";

import { EditorModeScreenshot } from "@/components/editor/editor-mode-screenshot";
import { messages } from "@/lib/i18n/messages";
import { LOCALE_STORAGE_KEY } from "@/lib/locale";
import { makeSavedProject, seedProjectsStorage } from "@/test/mocks/sample-project";
import { renderWithProviders } from "@/test/test-utils";

describe.each(["en", "sk"] as const)("buttons › editor-mode-screenshot (%s)", (locale) => {
  beforeEach(() => {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  });

  it("Generate HTML — disabled without image", async () => {
    renderWithProviders(<EditorModeScreenshot />);
    const btn = await screen.findByTestId("generate-html");
    expect(btn).toBeDisabled();
    expect(btn).toHaveTextContent(messages[locale]["index.generateHtml"]);
  });

  it("loaded project Clear — clears banner", async () => {
    const user = userEvent.setup();
    const [project] = seedProjectsStorage();
    renderWithProviders(<EditorModeScreenshot projectId={project.id} />);

    const clear = await screen.findByTestId("clear-loaded-project");
    expect(clear).toHaveTextContent(messages[locale]["index.loadedProject.clear"]);
    await user.click(clear);

    await waitFor(() => {
      expect(screen.queryByTestId("clear-loaded-project")).not.toBeInTheDocument();
    });
  });

  it("upload dropzone — choose file control is present", async () => {
    renderWithProviders(<EditorModeScreenshot />);
    const choose = await screen.findByTestId("upload-choose-file");
    expect(choose).toBeInTheDocument();
    expect(choose).toHaveTextContent(messages[locale]["upload.chooseFile"]);
  });
});
