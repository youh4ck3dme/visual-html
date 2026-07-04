import { describe, expect, it } from "vitest";
import userEvent from "@testing-library/user-event";
import { screen, waitFor } from "@testing-library/react";

import { LocaleSwitcher } from "@/components/pngto/locale-switcher";
import { LOCALE_STORAGE_KEY } from "@/lib/locale";
import { renderWithProviders } from "@/test/test-utils";

describe("buttons › locale-switcher", () => {
  it("EN — sets pngto-locale en", async () => {
    const user = userEvent.setup();
    localStorage.setItem(LOCALE_STORAGE_KEY, "sk");
    renderWithProviders(<LocaleSwitcher />);
    await waitFor(() =>
      expect(screen.getByLabelText("SK")).toHaveAttribute("aria-pressed", "true"),
    );
    await user.click(screen.getByLabelText("EN"));
    expect(localStorage.getItem(LOCALE_STORAGE_KEY)).toBe("en");
  });

  it("SK — sets pngto-locale sk", async () => {
    const user = userEvent.setup();
    localStorage.setItem(LOCALE_STORAGE_KEY, "en");
    renderWithProviders(<LocaleSwitcher />);
    await waitFor(() =>
      expect(screen.getByLabelText("EN")).toHaveAttribute("aria-pressed", "true"),
    );
    await user.click(screen.getByLabelText("SK"));
    expect(localStorage.getItem(LOCALE_STORAGE_KEY)).toBe("sk");
  });

  it("Compact cycle — toggles locale", async () => {
    const user = userEvent.setup();
    localStorage.setItem(LOCALE_STORAGE_KEY, "en");
    renderWithProviders(<LocaleSwitcher compact />);
    await waitFor(() => expect(document.documentElement.lang).toBe("en"));
    await user.click(screen.getByLabelText(/Switch language/i));
    expect(localStorage.getItem(LOCALE_STORAGE_KEY)).toBe("sk");
  });

  it("EN — aria-pressed when active", async () => {
    localStorage.setItem(LOCALE_STORAGE_KEY, "en");
    renderWithProviders(<LocaleSwitcher />);
    await waitFor(() => {
      expect(screen.getByLabelText("EN")).toHaveAttribute("aria-pressed", "true");
      expect(screen.getByLabelText("SK")).toHaveAttribute("aria-pressed", "false");
    });
  });
});
