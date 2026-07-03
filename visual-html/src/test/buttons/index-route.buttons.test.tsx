import { beforeEach, describe, expect, it } from "vitest";
import userEvent from "@testing-library/user-event";
import { screen, waitFor } from "@testing-library/react";

import { renderPageAt } from "@/test/page-router";
import {
  clearProjectsStorage,
  makeSavedProject,
  seedProjectsStorage,
} from "@/test/mocks/sample-project";

describe("buttons › index route", () => {
  beforeEach(() => clearProjectsStorage());

  it("Generate HTML — disabled without image", async () => {
    await renderPageAt("/");
    expect(await screen.findByRole("button", { name: /Generate HTML/i })).toBeDisabled();
  });

  it("View in Projects — links to project detail when result loaded from project", async () => {
    seedProjectsStorage([makeSavedProject({ id: "from-url", name: "Loaded project" })]);
    await renderPageAt("/?project=from-url");
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /Continue code generation/i })).toBeInTheDocument(),
    );
    const link = screen.getByRole("link", { name: /View in Projects/i });
    expect(link).toHaveAttribute("href", "/projects/from-url");
  });

  it("Loaded project Clear — resets banner", async () => {
    const user = userEvent.setup();
    seedProjectsStorage([makeSavedProject({ id: "from-url", name: "Loaded project" })]);
    await renderPageAt("/?project=from-url");
    await waitFor(() => expect(screen.getByText("Loaded project")).toBeInTheDocument());
    await user.click(screen.getByRole("button", { name: "Clear" }));
    await waitFor(() => expect(screen.queryByText("Loaded project")).not.toBeInTheDocument());
  });

  it("Open in editor from projects — round-trip via project card", async () => {
    const user = userEvent.setup();
    seedProjectsStorage([makeSavedProject({ id: "round-1", name: "Round trip" })]);
    await renderPageAt("/projects");
    await user.click(screen.getByRole("link", { name: /Round trip/i }));
    await waitFor(() => expect(screen.getByRole("link", { name: /Open in editor/i })));
    const editor = screen.getByRole("link", { name: /Open in editor/i });
    expect(editor).toHaveAttribute("href", "/?project=round-1");
  });
});