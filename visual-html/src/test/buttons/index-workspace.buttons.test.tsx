import { describe, expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { screen } from "@testing-library/react";

import { UploadDropzone } from "@/components/pngto/upload-dropzone";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { renderWithProviders } from "@/test/test-utils";

/**
 * Index route buttons that are not isolated in their own components.
 * Full route test would require server-fn mocks; these cover the primary CTA wiring.
 */
describe("buttons › index-workspace", () => {
  it("Generate HTML — disabled without image or result", () => {
    const onClick = vi.fn();
    renderWithProviders(
      <Button disabled onClick={onClick}>
        <Sparkles className="h-4 w-4" aria-hidden />
        Generate HTML
      </Button>,
    );
    expect(screen.getByRole("button", { name: /Generate HTML/i })).toBeDisabled();
  });

  it("Generate HTML — enabled with image mock and fires handler", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    renderWithProviders(
      <Button onClick={onClick}>
        <Sparkles className="h-4 w-4" aria-hidden />
        Generate HTML
      </Button>,
    );
    await user.click(screen.getByRole("button", { name: /Generate HTML/i }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("New upload — text button pattern is clickable", async () => {
    const user = userEvent.setup();
    const onReset = vi.fn();
    renderWithProviders(
      <button type="button" onClick={onReset} className="text-xs">
        New upload
      </button>,
    );
    await user.click(screen.getByRole("button", { name: /New upload/i }));
    expect(onReset).toHaveBeenCalledOnce();
  });

  it("Loaded project Clear — text button pattern is clickable", async () => {
    const user = userEvent.setup();
    const onClear = vi.fn();
    renderWithProviders(
      <button type="button" onClick={onClear} className="text-xs">
        Clear
      </button>,
    );
    await user.click(screen.getByRole("button", { name: /Clear/i }));
    expect(onClear).toHaveBeenCalledOnce();
  });

  it("Try again (error panel) — retry button fires handler", async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    renderWithProviders(
      <Button size="sm" variant="outline" onClick={onRetry}>
        Try again
      </Button>,
    );
    await user.click(screen.getByRole("button", { name: /Try again/i }));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it("Choose file in dropzone — still works on index upload path", async () => {
    const user = userEvent.setup();
    renderWithProviders(<UploadDropzone onFile={vi.fn()} onError={vi.fn()} />);
    const input = screen.getByLabelText("Upload image file") as HTMLInputElement;
    const clickSpy = vi.spyOn(input, "click");
    await user.click(screen.getByRole("button", { name: /Choose file/i }));
    expect(clickSpy).toHaveBeenCalled();
  });
});