import { beforeEach, describe, expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { screen, waitFor, within } from "@testing-library/react";

import { PROJECTS_STORAGE_KEY } from "@/lib/projects-store";
import { setFakeIndexedDbWriteFailure } from "@/test/mocks/fake-indexeddb";
import { renderPageAt } from "@/test/page-router";
import {
  clearProjectsStorage,
  makeSavedProject,
  seedProjectsStorage,
  waitForProjectLinks,
} from "@/test/mocks/sample-project";

async function openProjectDetail(
  project = makeSavedProject({ id: "detail-1", name: "Invoice UI" }),
) {
  seedProjectsStorage([project]);
  const ctx = await renderPageAt("/projects");
  await waitForProjectLinks(new RegExp(project.name));
  await userEvent.setup().click(screen.getByRole("link", { name: new RegExp(project.name) }));
  await waitFor(() => expect(screen.getByRole("heading", { level: 1, name: project.name })));
  return ctx;
}

describe("buttons › projects detail", () => {
  beforeEach(() => clearProjectsStorage());

  it("Back to projects (not found) — links to /projects", async () => {
    await renderPageAt("/projects/missing-id");
    expect(await screen.findByText(/Project not found/i)).toBeInTheDocument();
    const link = screen.getByRole("link", { name: /Back to projects/i });
    expect(link).toHaveAttribute("href", "/projects");
  });

  it("All projects — breadcrumb links to /projects", async () => {
    await openProjectDetail();
    const link = screen.getByRole("link", { name: /All projects/i });
    expect(link).toHaveAttribute("href", "/projects");
  });

  it("Rename project — opens inline editor", async () => {
    const user = userEvent.setup();
    await openProjectDetail();
    await user.click(screen.getByLabelText("Rename project"));
    expect(screen.getByLabelText("Project name")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
  });

  it("Save rename — updates project name in storage", async () => {
    const user = userEvent.setup();
    await openProjectDetail();
    await user.click(screen.getByLabelText("Rename project"));
    const input = screen.getByLabelText("Project name");
    await user.clear(input);
    await user.type(input, "Bank statement v2");
    await user.click(screen.getByRole("button", { name: "Save" }));
    await waitFor(() =>
      expect(
        screen.getByRole("heading", { level: 1, name: "Bank statement v2" }),
      ).toBeInTheDocument(),
    );
    const stored = JSON.parse(localStorage.getItem(PROJECTS_STORAGE_KEY) || "[]") as Array<{
      name: string;
    }>;
    expect(stored[0]?.name).toBe("Bank statement v2");
  });

  it("Cancel rename — restores original name", async () => {
    const user = userEvent.setup();
    await openProjectDetail();
    await user.click(screen.getByLabelText("Rename project"));
    await user.clear(screen.getByLabelText("Project name"));
    await user.type(screen.getByLabelText("Project name"), "Temporary");
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.getByRole("heading", { level: 1, name: "Invoice UI" })).toBeInTheDocument();
  });

  it("Open in editor — links to / with project search", async () => {
    await openProjectDetail();
    const link = screen.getByRole("link", { name: /Open in editor/i });
    expect(link).toHaveAttribute("href", "/?project=detail-1");
  });

  it("Delete — removes project after confirm", async () => {
    const user = userEvent.setup();
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);
    const { router } = await openProjectDetail();
    await user.click(screen.getByRole("button", { name: /Delete/i }));
    expect(confirmSpy).toHaveBeenCalled();
    await waitFor(() => expect(router.state.location.pathname).toBe("/projects"));
    expect(localStorage.getItem(PROJECTS_STORAGE_KEY)).toBe("[]");
    confirmSpy.mockRestore();
  });

  it("Save rename — shows toast and keeps original name when storage write fails", async () => {
    const user = userEvent.setup();
    await openProjectDetail();
    setFakeIndexedDbWriteFailure(true);

    const originalSetItem = Storage.prototype.setItem;
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(function (this: Storage, key, value) {
      if (key === PROJECTS_STORAGE_KEY) {
        throw new DOMException("QuotaExceededError", "QuotaExceededError");
      }
      return originalSetItem.call(this, key, value);
    });
    await user.click(screen.getByLabelText("Rename project"));
    const input = screen.getByLabelText("Project name");
    await user.clear(input);
    await user.type(input, "Bank statement v2");
    await user.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() =>
      expect(screen.getByText(/Could not save project changes/i)).toBeInTheDocument(),
    );
    expect(screen.getByRole("heading", { level: 1, name: "Invoice UI" })).toBeInTheDocument();
    const stored = JSON.parse(localStorage.getItem(PROJECTS_STORAGE_KEY) || "[]") as Array<{
      name: string;
    }>;
    expect(stored[0]?.name).toBe("Invoice UI");
  });

  it("Delete — shows toast and keeps project when storage write fails", async () => {
    const user = userEvent.setup();
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);
    const { router } = await openProjectDetail();
    setFakeIndexedDbWriteFailure(true);

    const originalSetItem = Storage.prototype.setItem;
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(function (this: Storage, key, value) {
      if (key === PROJECTS_STORAGE_KEY) {
        throw new DOMException("QuotaExceededError", "QuotaExceededError");
      }
      return originalSetItem.call(this, key, value);
    });
    await user.click(screen.getByRole("button", { name: /Delete/i }));

    await waitFor(() =>
      expect(screen.getByText(/Could not save project changes/i)).toBeInTheDocument(),
    );
    expect(router.state.location.pathname).toBe("/projects/detail-1");
    expect(JSON.parse(localStorage.getItem(PROJECTS_STORAGE_KEY) || "[]")).toHaveLength(1);
    confirmSpy.mockRestore();
  });

  it("Delete — cancelled confirm keeps project", async () => {
    const user = userEvent.setup();
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(false);
    await openProjectDetail();
    await user.click(screen.getByRole("button", { name: /Delete/i }));
    expect(JSON.parse(localStorage.getItem(PROJECTS_STORAGE_KEY) || "[]")).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 1, name: "Invoice UI" })).toBeInTheDocument();
    confirmSpy.mockRestore();
  });

  it("Zoom screenshot thumbnail — opens image lightbox", async () => {
    const user = userEvent.setup();
    await openProjectDetail(
      makeSavedProject({ id: "detail-1", name: "Invoice UI", fileName: "invoice.png" }),
    );
    await user.click(screen.getByLabelText(/Zoom screenshot: invoice.png/i));
    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByAltText("Project screenshot full size")).toBeInTheDocument();
  });

  it("Result tabs Download — available on detail page", async () => {
    const user = userEvent.setup();
    await openProjectDetail();
    await user.click(screen.getByRole("button", { name: /\.html/i }));
    expect(screen.getByRole("button", { name: /\.html/i })).toBeEnabled();
  });
});
