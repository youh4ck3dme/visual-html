import { beforeEach, describe, expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { screen, waitFor } from "@testing-library/react";

import { RefinementBox } from "@/components/pngto/refinement-box";
import { LocaleSwitcher } from "@/components/pngto/locale-switcher";
import { messages, type MessageKey } from "@/lib/i18n/messages";
import { LOCALE_STORAGE_KEY } from "@/lib/locale";
import { renderWithProviders } from "@/test/test-utils";

const REFINEMENT_CHIP_KEYS = [
  "refinement.chip.improveFidelity",
  "refinement.chip.makeResponsive",
  "refinement.chip.improveSemantics",
  "refinement.chip.simplifyWrappers",
  "refinement.chip.convertTailwind",
  "refinement.chip.optimizeSeo",
] as const satisfies readonly MessageKey[];

describe.each(["en", "sk"] as const)("buttons › refinement-box (%s)", (locale) => {
  beforeEach(() => {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  });

  it.each(REFINEMENT_CHIP_KEYS)("quick chip %s — submits instruction", async (key) => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    const label = messages[locale][key];

    renderWithProviders(<RefinementBox onSubmit={onSubmit} />);
    await waitFor(() => expect(screen.getByRole("button", { name: label })).toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: label }));
    expect(onSubmit).toHaveBeenCalledOnce();
    expect(onSubmit.mock.calls[0][0]).toBeTruthy();
  });

  it("Refine — disabled when textarea empty", async () => {
    renderWithProviders(<RefinementBox onSubmit={vi.fn()} />);
    const buttonLabel = messages[locale]["refinement.button"];
    await waitFor(() =>
      expect(screen.getByRole("button", { name: new RegExp(buttonLabel, "i") })).toBeDisabled(),
    );
  });

  it("Refine — submits custom instruction", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    renderWithProviders(<RefinementBox onSubmit={onSubmit} />);

    const inputLabel = messages[locale]["refinement.inputAria"];
    await waitFor(() => expect(screen.getByLabelText(inputLabel)).toBeInTheDocument());

    await user.type(screen.getByLabelText(inputLabel), "Add dark mode");
    await user.click(
      screen.getByRole("button", { name: new RegExp(messages[locale]["refinement.button"], "i") }),
    );
    expect(onSubmit).toHaveBeenCalledWith("Add dark mode");
  });

  it.each(REFINEMENT_CHIP_KEYS)("quick chip %s — disabled when busy", async (key) => {
    const label = messages[locale][key];
    renderWithProviders(<RefinementBox onSubmit={vi.fn()} disabled />);
    await waitFor(() => expect(screen.getByRole("button", { name: label })).toBeDisabled());
  });
});

describe("buttons › refinement-box locale switcher", () => {
  beforeEach(() => {
    localStorage.setItem(LOCALE_STORAGE_KEY, "en");
  });

  it("shows EN chips then SK chips after locale switch", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <>
        <LocaleSwitcher />
        <RefinementBox onSubmit={vi.fn()} />
      </>,
    );

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: messages.en["refinement.chip.makeResponsive"] }),
      ).toBeInTheDocument();
    });

    await user.click(screen.getByLabelText("SK"));

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: messages.sk["refinement.chip.makeResponsive"] }),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: messages.en["refinement.chip.makeResponsive"] }),
      ).not.toBeInTheDocument();
    });

    expect(
      screen.getByRole("button", { name: messages.sk["refinement.chip.improveFidelity"] }),
    ).toHaveTextContent("Zlepšiť vernosť");
    expect(
      screen.getByRole("button", { name: messages.sk["refinement.chip.convertTailwind"] }),
    ).toHaveTextContent("Previesť na Tailwind");
  });
});
