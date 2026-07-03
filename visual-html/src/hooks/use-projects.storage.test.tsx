import { describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";

import { useProjects } from "@/hooks/use-projects";
import { PROJECTS_STORAGE_KEY } from "@/lib/projects-store";
import { renderWithProviders } from "@/test/test-utils";
import { Toaster } from "@/components/ui/sonner";

function ProjectCountProbe() {
  const { projects } = useProjects();
  return <div data-testid="project-count">{projects.length}</div>;
}

describe("use-projects storage failures", () => {
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

    const originalSetItem = Storage.prototype.setItem;
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(function (this: Storage, key, value) {
      if (key === PROJECTS_STORAGE_KEY) {
        throw new DOMException("QuotaExceededError", "QuotaExceededError");
      }
      return originalSetItem.call(this, key, value);
    });

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
});
