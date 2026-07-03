import { beforeEach, describe, expect, it } from "vitest";
import userEvent from "@testing-library/user-event";
import { screen, within } from "@testing-library/react";

import { ProjectCard } from "@/components/pngto/project-card";
import { ProjectsToolbar } from "@/components/pngto/projects-toolbar";
import { renderPageAt } from "@/test/page-router";
import { renderWithProviders } from "@/test/test-utils";
import {
  clearProjectsStorage,
  makeSavedProject,
  seedProjectsStorage,
} from "@/test/mocks/sample-project";

describe("buttons › projects page", () => {
  beforeEach(() => clearProjectsStorage());

  it("New project — links to /", async () => {
    seedProjectsStorage();
    await renderPageAt("/projects");
    const link = screen.getByRole("link", { name: /New project/i });
    expect(link).toHaveAttribute("href", "/");
  });

  it("Create first project — links to / when empty", async () => {
    await renderPageAt("/projects");
    const link = screen.getByRole("link", { name: /Create first project/i });
    expect(link).toHaveAttribute("href", "/");
  });

  it("Sort projects — combobox opens and changes value", async () => {
    const user = userEvent.setup();
    let sort: "updated" | "created" | "name" = "updated";
    renderWithProviders(
      <ProjectsToolbar
        query=""
        sort={sort}
        onQueryChange={() => undefined}
        onSortChange={(v) => {
          sort = v;
        }}
      />,
    );
    await user.click(screen.getByLabelText("Sort projects"));
    await user.click(screen.getByRole("option", { name: /Name A–Z/i }));
    expect(sort).toBe("name");
  });
});

describe("buttons › project-card", () => {
  it("Project card — links to project detail", () => {
    const project = makeSavedProject({ id: "card-1", name: "Dashboard UI" });
    renderWithProviders(<ProjectCard project={project} />);
    const link = screen.getByRole("link", { name: /Dashboard UI/i });
    expect(link).toHaveAttribute("href", "/projects/card-1");
  });
});