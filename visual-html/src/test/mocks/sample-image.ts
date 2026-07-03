import type { UploadedImage } from "@/components/pngto/upload-dropzone";

export const SAMPLE_PNG_DATA_URL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

export function makeUploadedImage(overrides?: Partial<UploadedImage>): UploadedImage {
  const file = new File([new Uint8Array([137, 80, 78, 71])], "test-ui.png", {
    type: "image/png",
  });
  return {
    file,
    dataUrl: SAMPLE_PNG_DATA_URL,
    base64:
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
    mimeType: "image/png",
    width: 1200,
    height: 800,
    ...overrides,
  };
}

export const SAMPLE_GENERATION_OPTIONS = {
  outputMode: "static" as const,
  stylingMode: "vanilla-css" as const,
  responsiveness: "adaptive" as const,
  accessibilityLevel: "strict" as const,
  additionalInstructions: "Test instructions",
};

export const SAMPLE_GENERATE_RESULT = {
  html: "<main><h1>Hello</h1></main>",
  css: "main { color: red; }",
  javascript: "console.log('hi');",
  explanation: "Demo output",
  accessibilityNotes: "Uses semantic main",
  responsiveNotes: "Fluid layout",
  assumptions: ["Logo is decorative"],
  warnings: [],
};
