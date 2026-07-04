import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";

import { NotFoundComponent } from "@/test/fixtures/not-found-fixture";
import { renderWithProviders } from "@/test/test-utils";

describe("buttons › root pages", () => {
  it("404 Go home — links to /", () => {
    renderWithProviders(<NotFoundComponent />);
    const link = screen.getByRole("link", { name: /Go home/i });
    expect(link).toHaveAttribute("href", "/");
  });
});
