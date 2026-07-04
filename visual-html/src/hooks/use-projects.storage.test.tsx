import { beforeEach, describe, expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { screen, waitFor } from "@testing-library/react";

import * as browserEnv from "@/lib/browser-env";
import { useProjects } from "@/hooks/use-projects";
import { PROJECTS_STORAGE_KEY } from "@/lib/projects-store";
import { resetProjectsStorageWarningsForTests } from "@/lib/projects-storage-session";
import { setFakeIndexedDbWriteFailure } from "@/test/mocks/fake-indexeddb";
import { renderWithProviders } from "@/test/test-utils";
import { SAVED_PROJECT_SCHEMA_VERSION } from "@/lib/projects-schema";
import type { SavedProject } from "@/types/project";

const SAMPLE_RESULT = {
  html: "<main>Visible</main>",
  css: "main{color:red}",
  javascript: "",
  explanation: "Demo",
  accessibilityNotes: "",
  responsiveNotes: "",
  assumptions: [],
  warnings: [],
};

function makeProject(overrides: Partial<SavedProject> = {}): SavedProject {
  return {
    schemaVersion: SAVED_PROJECT_SCHEMA_VERSION,
    id: overrides.id ?? "p1",
    name: overrides.name ?? "Landing page",
    createdAt: overrides.createdAt ?? "2026-07-01T10:00:00.000Z",
    updatedAt: overrides.updatedAt ?? "2026-07-03T10:00:00.000Z",
    fileName: overrides.fileName ?? "landing.png",
    imageWidth: 1200,
    imageHeight: 800,
    thumbnailDataUrl: "data:image/jpeg;base64,abc",
    options: {
      outputMode: "static",
      stylingMode: "vanilla-css",
      responsiveness: "adaptive",
      accessibilityLevel: "strict",
    },
    result: SAMPLE_RESULT,
    ...overrides,
  };
}

function ProjectCountProbe() {
  const { projects } = useProjects();
  return <div data-testid="project-count">{projects.length}</div>;
}

function RefreshProbe() {
  const { projects, refresh } = useProjects();
  return (
    <>
      <div data-testid="project-count">{projects.length}</div>
      <button type="button" onClick={() => void refresh()}>
        Refresh projects
      </button>
    </>
  );
}

function SaveProbe() {
  const { projects, saveFromGeneration } = useProjects();
  return (
    <>
      <div data-testid="project-count">{projects.length}</div>
      <div data-testid="latest-html">{projects[0]?.result.html ?? ""}</div>
      <button
        type="button"
        onClick={() =>
          void saveFromGeneration({
            fileName: "hero.png",
            imageWidth: 100,
            imageHeight: 100,
            imageDataUrl: "data:image/png;base64,abc",
            options: makeProject().options,
            result: SAMPLE_RESULT,
          })
        }
      >
        Save project
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
    sessionStorage.clear();
    setFakeIndexedDbWriteFailure(false);
  });

  it("surfaces migration write-back failure when both backends fail", async () => {
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
    setFakeIndexedDbWriteFailure(true);

    renderWithProviders(<ProjectCountProbe />);

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
    setFakeIndexedDbWriteFailure(true);

    const user = userEvent.setup();
    renderWithProviders(<RefreshProbe />);

    await waitFor(() =>
      expect(screen.getByText(/Could not upgrade saved projects/i)).toBeInTheDocument(),
    );

    await user.click(screen.getByRole("button", { name: /Refresh projects/i }));
    await user.click(screen.getByRole("button", { name: /Refresh projects/i }));

    expect(screen.getAllByText(/Could not upgrade saved projects/i)).toHaveLength(1);
  });

  it("falls back to IndexedDB and shows info toast when localStorage is full", async () => {
    mockProjectsStorageWriteFailure();

    const user = userEvent.setup();
    renderWithProviders(<SaveProbe />);

    await user.click(screen.getByRole("button", { name: /Save project/i }));

    await waitFor(() => expect(screen.getByTestId("project-count")).toHaveTextContent("1"));
    expect(screen.getByTestId("latest-html")).toHaveTextContent("Visible");
    await waitFor(() =>
      expect(
        screen.getByText(/stored in browser database because local storage is full/i),
      ).toBeInTheDocument(),
    );
  });

  it("keeps generated output visible when fallback save succeeds", async () => {
    mockProjectsStorageWriteFailure();

    const user = userEvent.setup();
    renderWithProviders(<SaveProbe />);

    await user.click(screen.getByRole("button", { name: /Save project/i }));

    await waitFor(() => expect(screen.getByTestId("latest-html")).toHaveTextContent("Visible"));
    expect(screen.getByTestId("project-count")).toHaveTextContent("1");
  });

  it("renders with empty projects when isBrowser is false (SSR-safe initial state)", () => {
    const isBrowserSpy = vi.spyOn(browserEnv, "isBrowser").mockReturnValue(false);
    renderWithProviders(<ProjectCountProbe />);
    expect(screen.getByTestId("project-count")).toHaveTextContent("0");
    isBrowserSpy.mockRestore();
  });

  it("shows persist failure toast when both backends fail on save", async () => {
    mockProjectsStorageWriteFailure();
    setFakeIndexedDbWriteFailure(true);

    const user = userEvent.setup();
    renderWithProviders(<SaveProbe />);

    await user.click(screen.getByRole("button", { name: /Save project/i }));

    await waitFor(() => expect(screen.getByTestId("project-count")).toHaveTextContent("0"));
    expect(screen.queryByTestId("latest-html")).toHaveTextContent("");
  });
});
