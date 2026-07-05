import { beforeEach, describe, expect, it } from "vitest";
import { screen, waitFor } from "@testing-library/react";

import { EditorModeProjects } from "@/components/editor/editor-mode-projects";
import { messages } from "@/lib/i18n/messages";
import { LOCALE_STORAGE_KEY } from "@/lib/locale";
import { clearProjectsStorage, seedProjectsStorage } from "@/test/mocks/sample-project";
import { renderWithProviders } from "@/test/test-utils";

describe.each(["en", "sk"] as const)("buttons › editor-mode-projects (%s)", (locale) => {
  beforeEach(() => {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    clearProjectsStorage();
  });

  it("New project — links to /", async () => {
    const [project] = seedProjectsStorage();
    renderWithProviders(<EditorModeProjects />);

    await waitFor(() =>
      expect(screen.getByRole("button", { name: new RegExp(project.name) })).toBeInTheDocument(),
    );
    const link = screen.getByTestId("new-project");
    expect(link).toHaveAttribute("href", "/");
    expect(link).toHaveTextContent(messages[locale]["projects.newProject"]);
  });

  it("Create first project — links to builder starter template", async () => {
    renderWithProviders(<EditorModeProjects />);

    const link = await screen.findByTestId("create-first-project");
    expect(link).toHaveAttribute("href", "/builder?template=photo-portfolio");
    expect(link).toHaveTextContent(messages[locale]["projects.empty.cta"]);
  });

  it("shows hydration skeleton before projects load", () => {
    renderWithProviders(<EditorModeProjects />, { withProjects: true });
    expect(screen.getByTestId("projects-loading")).toHaveAttribute(
      "aria-label",
      messages[locale]["projects.loadingAria"],
    );
  });
});
