import { describe, expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { screen } from "@testing-library/react";

import { ErrorPageFixture } from "@/test/fixtures/error-page-fixture";
import { NotFoundComponent } from "@/test/fixtures/not-found-fixture";
import { renderWithProviders } from "@/test/test-utils";

describe("buttons › root pages", () => {
  it("404 Go home — links to /", () => {
    renderWithProviders(<NotFoundComponent />);
    const link = screen.getByRole("link", { name: /Go home/i });
    expect(link).toHaveAttribute("href", "/");
  });

  it("error page Go home — links to /", () => {
    renderWithProviders(<ErrorPageFixture error={new Error("test")} reset={() => {}} />);
    expect(screen.getByTestId("error-page-go-home")).toHaveAttribute("href", "/");
  });

  it("error page Try again — calls reset", async () => {
    const user = userEvent.setup();
    const reset = vi.fn();
    renderWithProviders(<ErrorPageFixture error={new Error("test")} reset={reset} />);
    await user.click(screen.getByTestId("error-page-retry"));
    expect(reset).toHaveBeenCalledOnce();
  });
});
