import { getPromptMock } from "@/lib/builder/prompt-library";
import type { GenerationMode } from "@/types/builder";

export type BuilderGenerateResult =
  { type: "code"; content: string } | { type: "explanation"; content: string };

const BUILDER_MISTRAL_KEY_1 = "builder_mistral_api_key_1";
const BUILDER_MISTRAL_KEY_2 = "builder_mistral_api_key_2";
const BUILDER_MISTRAL_MODEL = "builder_mistral_model";

const modeLabels: Record<GenerationMode, string> = {
  build: "Building a new app...",
  refine: "Preparing current app for refinement...",
  fix: "Inspecting current app for targeted fixes...",
  explain: "Reading current app for explanation...",
};

export function getBuilderMistralKeys(): string[] {
  if (typeof window === "undefined") return [];
  return [
    localStorage.getItem(BUILDER_MISTRAL_KEY_1)?.trim(),
    localStorage.getItem(BUILDER_MISTRAL_KEY_2)?.trim(),
  ].filter((key): key is string => Boolean(key));
}

export function getBuilderMistralModel(): string {
  if (typeof window === "undefined") return "mistral-large-latest";
  return localStorage.getItem(BUILDER_MISTRAL_MODEL) || "mistral-large-latest";
}

export function hasBuilderAiAccess(): boolean {
  return getBuilderMistralKeys().length > 0;
}

export function saveBuilderSettings(keys: { key1: string; key2: string; model: string }) {
  localStorage.setItem(BUILDER_MISTRAL_KEY_1, keys.key1.trim());
  localStorage.setItem(BUILDER_MISTRAL_KEY_2, keys.key2.trim());
  localStorage.setItem(BUILDER_MISTRAL_MODEL, keys.model.trim() || "mistral-large-latest");
}

export function clearBuilderSettings() {
  localStorage.removeItem(BUILDER_MISTRAL_KEY_1);
  localStorage.removeItem(BUILDER_MISTRAL_KEY_2);
}

type ServerChat = (args: {
  systemPrompt: string;
  userPrompt: string;
  model?: string;
}) => Promise<{ ok: true; content: string } | { ok: false; message: string }>;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const codeSystemPrompt = `You are a world-class frontend web developer.
Build a single-file, highly functional, visually stunning web page/application.
Use modern dark aesthetics, glassmorphic cards, responsive layout, rich interactions.
All CSS in <style>, all JS in <script>. NO placeholders — complete mock data and mechanics.
If existing HTML is provided, modify it per the request while preserving unrelated features.
Output ONLY raw HTML starting with <!DOCTYPE html>. No markdown fences.`;

const explainSystemPrompt = `You are a concise frontend code reviewer.
Explain the provided single-file HTML app clearly. Do not rewrite code or output HTML.`;

function normalizeGeneratedHtml(rawCode: string): string {
  let code = rawCode.trim();
  const fencedMatch = code.match(/```(?:html)?\s*([\s\S]*?)```/i);
  if (fencedMatch?.[1]) code = fencedMatch[1].trim();
  const htmlStart = code.search(/<!doctype html>|<html[\s>]/i);
  if (htmlStart > 0) code = code.slice(htmlStart).trim();
  if (!/<html[\s>]/i.test(code)) {
    code = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Generated App</title></head><body>${code}</body></html>`;
  }
  return code;
}

async function generateWithMistralBrowser(
  systemPrompt: string,
  userPrompt: string,
): Promise<string> {
  const keys = getBuilderMistralKeys();
  const modelName = getBuilderMistralModel();
  let lastError: Error | null = null;

  for (let index = 0; index < keys.length; index += 1) {
    try {
      const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${keys[index]}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: modelName,
          temperature: 0.2,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
        }),
      });
      if (!response.ok) {
        throw new Error(`Mistral key ${index + 1} failed: ${response.status}`);
      }
      const data = (await response.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      const content = data.choices?.[0]?.message?.content;
      if (!content) throw new Error("Empty Mistral response");
      return content;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error("Mistral API error");
    }
  }
  throw lastError || new Error("No browser Mistral keys configured");
}

async function runOfflineDemo(
  promptText: string,
  mode: GenerationMode,
  hasExistingCode: boolean,
  onStepChange: (step: number, status: string) => void,
): Promise<BuilderGenerateResult> {
  if (mode === "explain") {
    onStepChange(4, "Explanation ready.");
    return {
      type: "explanation",
      content: hasExistingCode
        ? "Demo mode: standalone HTML in sandbox. Add BYOK Mistral keys or configure server keys for AI."
        : "No app to explain yet.",
    };
  }
  if (mode !== "build") {
    throw new Error("Refine/fix requires AI. Use Build mode for offline templates.");
  }
  onStepChange(2, "Loading offline template...");
  await sleep(600);
  onStepChange(4, "Complete!");
  return { type: "code", content: getPromptMock(promptText) };
}

export async function generateBuilderCode(
  promptText: string,
  onStepChange: (step: number, status: string) => void,
  serverChat: ServerChat,
  previousCode?: string,
  mode: GenerationMode = previousCode?.trim() ? "refine" : "build",
): Promise<BuilderGenerateResult> {
  const hasBrowserKeys = getBuilderMistralKeys().length > 0;
  const hasExistingCode = Boolean(previousCode?.trim());

  onStepChange(0, "Connecting...");
  await sleep(200);

  if ((mode === "refine" || mode === "fix" || mode === "explain") && !hasExistingCode) {
    throw new Error(`${mode} needs an existing app first.`);
  }

  const userPromptByMode: Record<GenerationMode, string> = {
    build: `Build a new standalone single-file app:\n${promptText}`,
    refine: `Update this app:\n${promptText}\n\nExisting HTML:\n${previousCode}`,
    fix: `Fix this app:\n${promptText}\n\nExisting HTML:\n${previousCode}`,
    explain: `Question:\n${promptText}\n\nExisting HTML:\n${previousCode}`,
  };

  const systemPrompt = mode === "explain" ? explainSystemPrompt : codeSystemPrompt;
  const userPrompt = userPromptByMode[mode];

  try {
    onStepChange(1, modeLabels[mode]);
    onStepChange(2, mode === "explain" ? "Preparing explanation..." : "Generating HTML...");

    let responseText: string;
    if (hasBrowserKeys) {
      responseText = await generateWithMistralBrowser(systemPrompt, userPrompt);
    } else {
      const result = await serverChat({
        systemPrompt,
        userPrompt,
        model: getBuilderMistralModel(),
      });
      if (!result.ok) throw new Error(result.message);
      responseText = result.content;
    }

    onStepChange(3, "Finalizing...");
    await sleep(300);

    if (mode === "explain") {
      onStepChange(4, "Done");
      return { type: "explanation", content: responseText.trim() || "No explanation returned." };
    }

    onStepChange(4, "Complete!");
    return { type: "code", content: normalizeGeneratedHtml(responseText) };
  } catch (error) {
    try {
      return await runOfflineDemo(promptText, mode, hasExistingCode, onStepChange);
    } catch {
      onStepChange(4, "Failed");
      throw error instanceof Error ? error : new Error("Builder generation failed");
    }
  }
}
