import { describe, expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { screen } from "@testing-library/react";

import { ResultTabs } from "@/components/pngto/result-tabs";
import { renderWithProviders } from "@/test/test-utils";
import { SAMPLE_GENERATE_RESULT } from "@/test/mocks/sample-image";
import * as download from "@/lib/utils/download";

vi.mock("@/lib/utils/download", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/utils/download")>();
  return { ...actual, downloadTextFile: vi.fn() };
});

describe("buttons › result-tabs", () => {
  it.each(["Preview", "HTML", "CSS", "JS", "Notes"] as const)(
    'tab "%s" — switches content',
    async (tab) => {
      const user = userEvent.setup();
      renderWithProviders(<ResultTabs result={SAMPLE_GENERATE_RESULT} />);
      await user.click(screen.getByRole("tab", { name: tab }));
      expect(screen.getByRole("tab", { name: tab })).toHaveAttribute("data-state", "active");
    },
  );

  it("Download .html — triggers downloadTextFile", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ResultTabs result={SAMPLE_GENERATE_RESULT} />);
    await user.click(screen.getByRole("button", { name: /\.html/i }));
    expect(download.downloadTextFile).toHaveBeenCalledWith(
      "generated.html",
      expect.stringContaining("<main>"),
    );
  });
});
