import { beforeEach, describe, expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { screen, waitFor } from "@testing-library/react";

import { useProjects } from "@/hooks/use-projects";
import { PROJECTS_STORAGE_KEY } from "@/lib/projects-store";
import { resetProjectsStorageWarningsForTests } from "@/lib/projects-storage-session";
import { renderWithProviders } from "@/test/test-utils";
import { Toaster } from "@/components/ui/sonner";

function ProjectCountProbe() {
  const { projects } = useProjects();
  return <div data-testid="project-count">{projects.length}</div>;
}

function RefreshProbe() {
  const { projects, refresh } = useProjects();
  return (
    <>
      <div data-testid="project-count">{projects.length}</div>
      <button type="button" onClick={() => refresh()}>
        Refresh projects
      </button>
    </>
  );
}

function mockProjectsStorageWriteFailure() {
  const originalSetItem = Storage.prototype.setItem;
  return vi.spyOn(Storage.prototype, "setItem").mockImplementation(function (
    this: Storage,
    key,
    value,
  ) {
    if (key === PROJECTS_STORAGE_KEY) {
      throw new DOMException("QuotaExceededError", "QuotaExceededError");
    }
    return originalSetItem.call(this, key, value);
  });
}

describe("use-projects storage failures", () => {
  beforeEach(() => {
    resetProjectsStorageWarningsForTests();
    localStorage.clear();
  });

  it("surfaces migration write-back failure and still loads legacy projects", async () => {
    const legacy = {
      id: "legacy-provider-1",
      name: "Provider legacy",
      createdAt: "2026-06-01T10:00:00.000Z",
      updatedAt: "2026-06-02T10:00:00.000Z",
      fileName: "provider.png",
      thumbnailDataUrl: "data:image/jpeg;base64,abc",
      result: { html: "<main>Provider legacy</main>" },
    };
    localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify([legacy]));
    mockProjectsStorageWriteFailure();

    renderWithProviders(
      <>
        <ProjectCountProbe />
        <Toaster />
      </>,
    );

    await waitFor(() => expect(screen.getByTestId("project-count")).toHaveTextContent("1"));
    await waitFor(() =>
      expect(screen.getByText(/Could not upgrade saved projects/i)).toBeInTheDocument(),
    );
    expect(screen.getByText(/browser storage failed/i)).toBeInTheDocument();
  });

  it("shows migration warning only once per session", async () => {
    const legacy = {
      id: "legacy-provider-2",
      name: "Provider legacy 2",
      createdAt: "2026-06-01T10:00:00.000Z",
      updatedAt: "2026-06-02T10:00:00.000Z",
      fileName: "provider-2.png",
      thumbnailDataUrl: "data:image/jpeg;base64,abc",
      result: { html: "<main>Provider legacy 2</main>" },
    };
    localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify([legacy]));
    mockProjectsStorageWriteFailure();

    const user = userEvent.setup();
    renderWithProviders(
      <>
        <RefreshProbe />
        <Toaster />
      </>,
    );

    await waitFor(() =>
      expect(screen.getByText(/Could not upgrade saved projects/i)).toBeInTheDocument(),
    );

    await user.click(screen.getByRole("button", { name: /Refresh projects/i }));
    await user.click(screen.getByRole("button", { name: /Refresh projects/i }));

    expect(screen.getAllByText(/Could not upgrade saved projects/i)).toHaveLength(1);
  });
});
