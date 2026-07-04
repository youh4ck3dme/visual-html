import { describe, expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { screen } from "@testing-library/react";

import { ErrorPageFixture } from "@/test/fixtures/error-page-fixture";
import { renderWithProviders } from "@/test/test-utils";

describe("buttons › error-page", () => {
  it("Try again — calls reset", async () => {
    const user = userEvent.setup();
    const reset = vi.fn();
    renderWithProviders(<ErrorPageFixture error={new Error("boom")} reset={reset} />);
    await user.click(screen.getByTestId("error-page-retry"));
    expect(reset).toHaveBeenCalledOnce();
  });

  it("Go home — links to /", () => {
    renderWithProviders(<ErrorPageFixture error={new Error("boom")} reset={vi.fn()} />);
    expect(screen.getByTestId("error-page-go-home")).toHaveAttribute("href", "/");
  });

  it("Try again — shows translated label", () => {
    renderWithProviders(<ErrorPageFixture error={new Error("boom")} reset={vi.fn()} />);
    expect(screen.getByRole("button", { name: /Try again/i })).toBeInTheDocument();
  });
});
