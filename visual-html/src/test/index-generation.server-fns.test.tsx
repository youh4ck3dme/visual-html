import { beforeEach, describe, expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { screen, waitFor } from "@testing-library/react";

import { createApiError } from "@/lib/generation-diagnostics";
import { PROJECTS_STORAGE_KEY } from "@/lib/projects-store";
import { setFakeIndexedDbWriteFailure } from "@/test/mocks/fake-indexeddb";
import { setDesktopViewport } from "@/test/helpers/viewport";
import { renderPageAt } from "@/test/page-router";
import { getServerFnMocks } from "@/test/mocks/server-fns";
import { SAMPLE_GENERATE_RESULT } from "@/test/mocks/sample-image";

const SAMPLE_PNG_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

function makePngFile(name = "test-ui.png"): File {
  const bytes = Uint8Array.from(atob(SAMPLE_PNG_BASE64), (c) => c.charCodeAt(0));
  return new File([bytes], name, { type: "image/png" });
}

async function uploadImageOnIndex() {
  const user = userEvent.setup();
  await renderPageAt("/");
  const input = await screen.findByLabelText("Upload image file");
  await user.upload(input, makePngFile());
  await waitFor(() => expect(screen.getByRole("button", { name: /Generate HTML/i })).toBeEnabled());
  return user;
}

describe("index route › server function mocks", () => {
  beforeEach(() => {
    setDesktopViewport();
    const { runOcr, generateHtml, builderChat } = getServerFnMocks();
    runOcr.mockClear();
    generateHtml.mockClear();
    builderChat.mockClear();
  });

  it("runs OCR then generateHtml independently on success", async () => {
    const { runOcr, generateHtml, builderChat } = getServerFnMocks();
    const user = await uploadImageOnIndex();
    await user.click(screen.getByRole("button", { name: /Generate HTML/i }));

    await waitFor(() => expect(runOcr).toHaveBeenCalledOnce());
    await waitFor(() => expect(generateHtml).toHaveBeenCalledOnce());
    expect(builderChat).not.toHaveBeenCalled();

    expect(runOcr.mock.invocationCallOrder[0]).toBeLessThan(
      generateHtml.mock.invocationCallOrder[0]!,
    );

    await waitFor(() => expect(screen.getByText(/Generated output/i)).toBeInTheDocument(), {
      timeout: 15000,
    });
    await waitFor(() => expect(screen.getByTestId("index-save-notice")).toHaveTextContent(/Saved to Projects/i), {
      timeout: 15000,
    });
  }, 20000);

  it("can simulate OCR success while generateHtml fails", async () => {
    const { runOcr, generateHtml, builderChat } = getServerFnMocks();
    runOcr.mockResolvedValueOnce({ ok: true, ocrMarkdown: "# Isolated OCR markdown" });
    generateHtml.mockResolvedValueOnce({
      ok: false,
      error: createApiError("AI_TIMEOUT", "AI request timed out", "synthesizing"),
    });

    const user = await uploadImageOnIndex();
    await user.click(screen.getByRole("button", { name: /Generate HTML/i }));

    await waitFor(() => expect(runOcr).toHaveBeenCalledOnce());
    await waitFor(() => expect(generateHtml).toHaveBeenCalledOnce());
    expect(builderChat).not.toHaveBeenCalled();

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(/AI generation timeout/i);
    expect(alert).toHaveTextContent(/Phase:/i);
    expect(alert).toHaveTextContent(/Synthesis/i);
    expect(screen.queryByText(/Generated output/i)).not.toBeInTheDocument();
  });

  it("shows diagnostic error UI when OCR fails (generateHtml not called)", async () => {
    const { runOcr, generateHtml, builderChat } = getServerFnMocks();
    runOcr.mockResolvedValueOnce({
      ok: false,
      error: createApiError(
        "BLOB_UPLOAD_FAILED",
        "Failed to upload image for OCR",
        "uploading_to_blob",
      ),
    });

    const user = await uploadImageOnIndex();
    await user.click(screen.getByRole("button", { name: /Generate HTML/i }));

    await waitFor(() => expect(runOcr).toHaveBeenCalledOnce());
    await waitFor(() => expect(screen.getByRole("alert")).toBeInTheDocument());

    expect(generateHtml).not.toHaveBeenCalled();
    expect(builderChat).not.toHaveBeenCalled();

    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent(/Image upload failed/i);
    expect(alert).toHaveTextContent(/Phase:/i);
    expect(alert).toHaveTextContent(/Image upload/i);
  });

  it("falls back to IndexedDB when localStorage is full and keeps generated output", async () => {
    const originalSetItem = Storage.prototype.setItem;
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(function (this: Storage, key, value) {
      if (key === PROJECTS_STORAGE_KEY) {
        throw new DOMException("QuotaExceededError", "QuotaExceededError");
      }
      return originalSetItem.call(this, key, value);
    });

    const user = await uploadImageOnIndex();
    await user.click(screen.getByRole("button", { name: /Generate HTML/i }));

    await waitFor(() => expect(screen.getByText(/Generated output/i)).toBeInTheDocument());
    await waitFor(() =>
      expect(
        screen.getByText(/stored in browser database because local storage is full/i),
      ).toBeInTheDocument(),
    );
    expect(screen.getByTestId("index-save-notice")).toHaveTextContent(/Saved to Projects/i);
  });

  it("shows save failure toast when both storage backends fail but keeps generated output", async () => {
    const originalSetItem = Storage.prototype.setItem;
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(function (this: Storage, key, value) {
      if (key === PROJECTS_STORAGE_KEY) {
        throw new DOMException("QuotaExceededError", "QuotaExceededError");
      }
      return originalSetItem.call(this, key, value);
    });
    setFakeIndexedDbWriteFailure(true);

    const user = await uploadImageOnIndex();
    await user.click(screen.getByRole("button", { name: /Generate HTML/i }));

    await waitFor(() => expect(screen.getByText(/Generated output/i)).toBeInTheDocument(), {
      timeout: 10000,
    });
    await waitFor(
      () => expect(screen.getByText(/Could not save to Projects/i)).toBeInTheDocument(),
      { timeout: 10000 },
    );
    expect(screen.getByText(/browser storage failed/i)).toBeInTheDocument();
    expect(screen.queryByTestId("index-save-notice")).not.toBeInTheDocument();
  }, 20000);

  it("does not satisfy PNG generation when only builderChat mock would succeed", async () => {
    const { runOcr, generateHtml, builderChat } = getServerFnMocks();
    builderChat.mockResolvedValueOnce({
      ok: true,
      content: "<!DOCTYPE html><html><body>Builder only</body></html>",
    });
    runOcr.mockResolvedValueOnce({
      ok: false,
      error: createApiError(
        "AI_INVALID_RESPONSE",
        "OCR provider returned no readable content",
        "ocr",
      ),
    });

    const user = await uploadImageOnIndex();
    await user.click(screen.getByRole("button", { name: /Generate HTML/i }));

    await waitFor(() => expect(screen.getByRole("alert")).toBeInTheDocument());
    expect(generateHtml).not.toHaveBeenCalled();
    expect(builderChat).not.toHaveBeenCalled();
    expect(screen.queryByText("Builder only")).not.toBeInTheDocument();
    expect(screen.queryByText(SAMPLE_GENERATE_RESULT.html)).not.toBeInTheDocument();
  });
});
