export class GeminiNotConfiguredError extends Error {
  constructor() {
    super("Gemini provider is not configured. Set GEMINI_API_KEY in environment.");
    this.name = "GeminiNotConfiguredError";
  }
}

/** P6 stub — multi-provider support not yet implemented. */
export async function geminiGenerate(_prompt: string): Promise<string> {
  throw new GeminiNotConfiguredError();
}
