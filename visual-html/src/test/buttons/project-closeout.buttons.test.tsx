import { beforeEach, describe, expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { screen, waitFor } from "@testing-library/react";

import { BuilderWorkspace } from "@/components/builder/builder-workspace";
import * as download from "@/lib/utils/download";
import { renderPageAt } from "@/test/page-router";
import {
  clearProjectsStorage,
  makeSavedProject,
  seedProjectsStorage,
  waitForProjectLinks,
} from "@/test/mocks/sample-project";
import { renderWithProviders } from "@/test/test-utils";

vi.mock("@/lib/utils/download", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/utils/download")>();
  return { ...actual, downloadTextFile: vi.fn() };
});

const PROJECT_ID = "closeout-1";

async function seedAndOpenDetail() {
  const project = makeSavedProject({ id: PROJECT_ID, name: "Closeout UI" });
  seedProjectsStorage([project]);
  const ctx = await renderPageAt("/projects");
  await waitForProjectLinks(/Closeout UI/);
  await userEvent.setup().click(screen.getByRole("link", { name: /Closeout UI/i }));
  await waitFor(() => expect(screen.getByRole("heading", { level: 1, name: "Closeout UI" })));
  return { ctx, project };
}

describe("buttons › project closeout", () => {
  beforeEach(() => {
    clearProjectsStorage();
    localStorage.removeItem("vibecraft_workspace_v1");
    vi.mocked(download.downloadTextFile).mockClear();
  });

  it("export valid project renders preview", async () => {
    seedProjectsStorage([makeSavedProject({ id: PROJECT_ID, name: "Closeout UI" })]);
    await renderPageAt(`/export/${PROJECT_ID}`);
    await waitFor(() => expect(screen.getByTestId("export-preview")).toBeInTheDocument());
    expect(screen.getByTestId("preview-frame-iframe")).toBeInTheDocument();
  });

  it("export invalid project shows not-found", async () => {
    await renderPageAt("/export/missing-id");
    expect(await screen.findByText(/Project not found/i)).toBeInTheDocument();
    expect(screen.getByTestId("export-back-to-projects")).toHaveAttribute("href", "/projects");
  });

  it("export download button triggers download", async () => {
    const user = userEvent.setup();
    seedProjectsStorage([makeSavedProject({ id: PROJECT_ID, name: "Closeout UI" })]);
    await renderPageAt(`/export/${PROJECT_ID}`);
    await waitFor(() => expect(screen.getByTestId("export-download-html")).toBeInTheDocument());
    await user.click(screen.getByTestId("export-download-html"));
    expect(download.downloadTextFile).toHaveBeenCalled();
  });

  it("qa valid project shows QA cards", async () => {
    seedProjectsStorage([makeSavedProject({ id: PROJECT_ID, name: "Closeout UI" })]);
    await renderPageAt(`/qa/${PROJECT_ID}`);
    await waitFor(() => expect(screen.getByTestId("qa-results")).toBeInTheDocument());
    expect(screen.getByTestId("qa-card-html-nonempty")).toBeInTheDocument();
    expect(screen.getByTestId("qa-card-viewport-meta")).toBeInTheDocument();
  });

  it("qa invalid project shows not-found", async () => {
    await renderPageAt("/qa/missing-id");
    expect(await screen.findByText(/Project not found/i)).toBeInTheDocument();
    expect(screen.getByTestId("qa-back-to-projects")).toHaveAttribute("href", "/projects");
  });

  it("project detail has Open in VibeCraft link", async () => {
    await seedAndOpenDetail();
    const link = screen.getByTestId("open-in-vibecraft");
    expect(link).toHaveAttribute("href", `/builder?importProject=${PROJECT_ID}`);
  });

  it("builder importProject imports code into workspace", async () => {
    seedProjectsStorage([makeSavedProject({ id: PROJECT_ID, name: "Closeout UI" })]);
    renderWithProviders(<BuilderWorkspace importProjectId={PROJECT_ID} />);
    await waitFor(() =>
      expect(screen.getByTestId("builder-import-banner")).toHaveTextContent(/Closeout UI/i),
    );
    expect(screen.getByTitle("VibeCraft Preview")).toBeInTheDocument();
  });

  it("invalid builder import shows warning and does not crash", async () => {
    renderWithProviders(<BuilderWorkspace importProjectId="missing-id" />);
    expect(await screen.findByTestId("builder-import-warning")).toBeInTheDocument();
    expect(screen.getByTestId("builder-new-application")).toBeInTheDocument();
    expect(screen.queryByTestId("preview-frame-iframe")).not.toBeInTheDocument();
  });
});
