import { beforeEach, describe, expect, it } from "vitest";
import userEvent from "@testing-library/user-event";
import { screen, waitFor, within } from "@testing-library/react";

import { SettingsDialog } from "@/components/app/settings-dialog";
import { SettingsProvider } from "@/components/app/settings-context";
import { EditorHeader } from "@/components/editor/editor-header";
import { messages } from "@/lib/i18n/messages";
import { LOCALE_STORAGE_KEY } from "@/lib/locale";
import { getServerFnMocks } from "@/test/mocks/server-fns";
import { renderWithProviders } from "@/test/test-utils";

function renderEditorHeader() {
  return renderWithProviders(
    <SettingsProvider>
      <EditorHeader />
      <SettingsDialog />
    </SettingsProvider>,
  );
}

describe.each(["en", "sk"] as const)("buttons › editor-header (%s)", (locale) => {
  beforeEach(() => {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  });

  it("PNGtoHTML home — link exists and points to /", () => {
    renderEditorHeader();
    const header = screen.getByTestId("editor-header");
    const home = within(header).getByTestId("nav-home");
    expect(home).toHaveAttribute("href", "/");
    expect(home).toHaveAttribute("aria-label", messages[locale]["nav.homeAria"]);
  });

  it.each([
    ["projects", "nav.projects", "/projects", "nav-projects"],
    ["screenshot", "nav.new", "/", "nav-screenshot"],
    ["studio", "nav.builder", "/builder", "nav-studio"],
  ] as const)("nav %s — link points to %s", (_id, labelKey, href, testId) => {
    renderEditorHeader();
    const link = screen.getByTestId(testId);
    expect(link).toHaveAttribute("href", href);
    expect(link).toHaveAttribute("aria-label", messages[locale][labelKey]);
  });

  it("Settings — opens settings dialog on click", async () => {
    const user = userEvent.setup();
    const { builderAiStatus } = getServerFnMocks();
    builderAiStatus.mockResolvedValue({ serverKeysConfigured: true });
    renderEditorHeader();
    const btn = screen.getByTestId("nav-settings");
    expect(btn).toHaveAttribute("aria-label", messages[locale]["nav.settings"]);
    expect(btn).toBeEnabled();
    await user.click(btn);
    await waitFor(() => expect(screen.getByRole("dialog")).toBeInTheDocument());
  });

  it("Theme (compact header) — click cycles theme", async () => {
    const user = userEvent.setup();
    renderEditorHeader();
    const header = screen.getByTestId("editor-header");
    const themeBtn = within(header).getByTitle(messages[locale]["theme.dark"]);
    const before = localStorage.getItem("pngto-theme");
    await user.click(themeBtn);
    const after = localStorage.getItem("pngto-theme");
    expect(after).not.toBe(before);
  });
});
