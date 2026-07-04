import { describe, expect, it } from "vitest";

import { createApiError } from "@/lib/generation-diagnostics";
import {
  localizedDiagnosticDetail,
  localizedDiagnosticLikelyCause,
  localizedDiagnosticTitle,
  localizedForensicWarningTitle,
  localizedPresetHint,
  localizedPresetLabel,
  resolveForensicWarningDetail,
} from "@/lib/i18n/helpers";
import { FORENSIC_PRESETS } from "@/lib/image-forensics";

describe("diagnostic i18n helpers", () => {
  it("localizes OCR timeout title in Slovak", () => {
    const error = createApiError("AI_TIMEOUT", "AI request timed out", "ocr");
    expect(localizedDiagnosticTitle("sk", error.code, error.diagnostic!.title, "ocr")).toBe(
      "Timeout OCR",
    );
  });

  it("localizes synthesis timeout title in Slovak", () => {
    const error = createApiError("AI_TIMEOUT", "AI request timed out", "synthesizing");
    expect(
      localizedDiagnosticTitle("sk", error.code, error.diagnostic!.title, "synthesizing"),
    ).toBe("Timeout AI generovania");
  });

  it("localizes known server detail messages in Slovak", () => {
    expect(
      localizedDiagnosticDetail("sk", "BLOB_UPLOAD_FAILED", "Failed to upload image for OCR"),
    ).toBe("Nahratie obrázka pre OCR zlyhalo");
    expect(localizedDiagnosticDetail("sk", "AI_TIMEOUT", "AI request timed out")).toBe(
      "Timeout AI požiadavky",
    );
  });

  it("localizes default detail and likely cause by error code in Slovak", () => {
    const error = createApiError("SERVER_ERROR", "", "synthesizing");
    const diagnostic = error.diagnostic!;

    expect(
      localizedDiagnosticDetail("sk", error.code, diagnostic.detail, error.phase ?? "synthesizing"),
    ).toContain("Server zaznamenal neočakávanú chybu");

    expect(
      localizedDiagnosticLikelyCause("sk", error.code, diagnostic.likelyCause!, error.phase),
    ).toContain("Zlyhala požiadavka na poskytovateľa");
  });

  it("keeps already-localized upload detail as-is", () => {
    const skUploadMessage = "Súbor sa nepodarilo prečítať";
    expect(localizedDiagnosticDetail("sk", "INVALID_FILE", skUploadMessage)).toBe(skUploadMessage);
  });

  it("localizes dynamic AI auth status detail in Slovak", () => {
    expect(
      localizedDiagnosticDetail("sk", "AI_AUTH_ERROR", "AI provider rejected credentials (401)"),
    ).toBe("AI poskytovateľ odmietol prihlasovacie údaje (401)");
  });

  it("maps kebab-case forensic warning ids to Slovak titles", () => {
    expect(localizedForensicWarningTitle("sk", "heavy-file", "Heavy for AI pipeline")).toBe(
      "Ťažké pre AI pipeline",
    );
    expect(localizedForensicWarningTitle("sk", "wide-layout", "Very wide layout")).toBe(
      "Veľmi široký layout",
    );
  });

  it("localizes WordPress landing preset label and hint in Slovak", () => {
    const preset = FORENSIC_PRESETS.find((p) => p.id === "wordpress");
    expect(preset).toBeDefined();
    expect(localizedPresetLabel("sk", preset!)).toBe("WordPress landing");
    expect(localizedPresetHint("sk", preset!)).toContain("Hlavička s menu");
  });

  it("localizes forensic file-size warning detail in Slovak", () => {
    const detail = resolveForensicWarningDetail(
      "sk",
      { id: "warn-file", detail: "This image should usually work, but synthesis may be slower." },
      900_000,
      1200,
      800,
    );
    expect(detail).toContain("syntéza");
  });
});
