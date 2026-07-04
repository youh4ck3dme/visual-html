import { geminiGenerate } from "@/lib/ai/gemini.provider.stub";

export type AiProvider = "mistral" | "gemini";

export interface ProviderRouter {
  generate(provider: AiProvider, prompt: string): Promise<string>;
}

/** P6 stub — routes to configured providers; Gemini throws until configured. */
export const providerRouter: ProviderRouter = {
  async generate(provider, prompt) {
    if (provider === "gemini") return geminiGenerate(prompt);
    throw new Error("Use existing Mistral pipeline for mistral provider");
  },
};
