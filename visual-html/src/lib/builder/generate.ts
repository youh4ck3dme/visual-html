import { promptLibrary } from "@/lib/builder";
import { getPromptMock } from "@/lib/builder/prompt-library";
import type { GenerationMode } from "@/types/builder";

export type BuilderGenerateVia = "ai" | "offline";

export type BuilderGenerateResult =
  | { type: "code"; content: string; via: BuilderGenerateVia }
  | { type: "explanation"; content: string; via: BuilderGenerateVia };

const BUILDER_MISTRAL_KEY_1 = "builder_mistral_api_key_1";
const BUILDER_MISTRAL_KEY_2 = "builder_mistral_api_key_2";
const BUILDER_MISTRAL_MODEL = "builder_mistral_model";
const BUILDER_MAX_TOKENS = 8000;

const modeLabels: Record<GenerationMode, string> = {
  build: "Building a new app...",
  refine: "Preparing current app for refinement...",
  fix: "Inspecting current app for targeted fixes...",
  explain: "Reading current app for explanation...",
};

export function sanitizeBuilderApiKey(key: string): string {
  return key.trim().replace(/^["']+|["']+$/g, "");
}

export function getBuilderMistralKeys(): string[] {
  if (typeof window === "undefined") return [];
  return [
    sanitizeBuilderApiKey(localStorage.getItem(BUILDER_MISTRAL_KEY_1) ?? ""),
    sanitizeBuilderApiKey(localStorage.getItem(BUILDER_MISTRAL_KEY_2) ?? ""),
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
  localStorage.setItem(BUILDER_MISTRAL_KEY_1, sanitizeBuilderApiKey(keys.key1));
  localStorage.setItem(BUILDER_MISTRAL_KEY_2, sanitizeBuilderApiKey(keys.key2));
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
Build exactly what the user asks for in one self-contained HTML file.
Use semantic HTML, accessible patterns, and responsive CSS in a <style> block.
Put interactivity in a <script> block when needed. Use complete realistic content — no placeholder filler.
Honor the requested visual style (light marketing pages, dark apps, games, dashboards, etc.) — do not force a theme the user did not ask for.
If existing HTML is provided, modify it per the request while preserving unrelated features.
Output ONLY raw HTML starting with <!DOCTYPE html>. No markdown fences, no commentary.`;

const explainSystemPrompt = `You are a concise frontend code reviewer.
Explain the provided single-file HTML app clearly. Do not rewrite code or output HTML.`;

export function enrichBuildPrompt(promptText: string, templateId?: string): string {
  if (!templateId) return promptText.trim();
  const template = promptLibrary.find((item) => item.id === templateId);
  if (!template) return promptText.trim();

  return `${template.prompt.trim()}

Starter template: "${template.title}".
Deliver a complete, production-quality single-file page that fulfills the description above.
Include realistic copy, working UI mechanics, and polished styling appropriate to this template.
Do not return a generic placeholder card or unrelated layout.`;
}

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

async function readMistralError(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { message?: string; error?: { message?: string } };
    return body.message || body.error?.message || response.statusText || `HTTP ${response.status}`;
  } catch {
    return response.statusText || `HTTP ${response.status}`;
  }
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
          max_tokens: BUILDER_MAX_TOKENS,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
        }),
      });
      if (!response.ok) {
        const detail = await readMistralError(response);
        throw new Error(`Mistral key ${index + 1} failed (${response.status}): ${detail}`);
      }
      const data = (await response.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      const content = data.choices?.[0]?.message?.content;
      if (!content?.trim()) throw new Error("Empty Mistral response");
      return content;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error("Mistral API error");
    }
  }
  throw lastError || new Error("No browser Mistral keys configured");
}

async function generateWithServer(
  serverChat: ServerChat,
  systemPrompt: string,
  userPrompt: string,
): Promise<string> {
  const result = await serverChat({
    systemPrompt,
    userPrompt,
    model: getBuilderMistralModel(),
  });
  if (!result.ok) {
    throw new Error(result.message);
  }
  if (!result.content.trim()) {
    throw new Error("Empty server AI response");
  }
  return result.content;
}

async function generateWithAi(
  systemPrompt: string,
  userPrompt: string,
  serverChat: ServerChat,
  preferServerAi = false,
): Promise<string> {
  const errors: string[] = [];
  const hasBrowserKeys = getBuilderMistralKeys().length > 0;

  if (preferServerAi) {
    try {
      return await generateWithServer(serverChat, systemPrompt, userPrompt);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Server Mistral failed";
      throw new Error(
        `Server AI failed. Check MISTRAL_API_KEY in visual-html/.env.local and restart npm run dev. ${message}`,
      );
    }
  }

  const attempts: Array<() => Promise<string>> = [
    () => generateWithServer(serverChat, systemPrompt, userPrompt),
    ...(hasBrowserKeys
      ? [() => generateWithMistralBrowser(systemPrompt, userPrompt)]
      : []),
  ];

  for (const attempt of attempts) {
    try {
      return await attempt();
    } catch (error) {
      errors.push(error instanceof Error ? error.message : "AI request failed");
    }
  }

  const hasUnauthorized = errors.some((message) => /401|unauthorized/i.test(message));
  if (hasUnauthorized) {
    throw new Error(
      `Mistral API key rejected (401 Unauthorized). Use a valid key from console.mistral.ai in Settings or set MISTRAL_API_KEY in .env.local. ${errors.join(" | ")}`,
    );
  }

  throw new Error(errors.join(" | "));
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
      via: "offline",
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
  return { type: "code", via: "offline", content: getPromptMock(promptText) };
}

export async function generateBuilderCode(
  promptText: string,
  onStepChange: (step: number, status: string) => void,
  serverChat: ServerChat,
  previousCode?: string,
  mode: GenerationMode = previousCode?.trim() ? "refine" : "build",
  templateId?: string,
  preferServerAi = false,
): Promise<BuilderGenerateResult> {
  const hasBrowserKeys = getBuilderMistralKeys().length > 0;
  const hasExistingCode = Boolean(previousCode?.trim());
  const effectivePrompt = enrichBuildPrompt(promptText, templateId);

  onStepChange(0, "Connecting...");
  await sleep(200);

  if ((mode === "refine" || mode === "fix" || mode === "explain") && !hasExistingCode) {
    throw new Error(`${mode} needs an existing app first.`);
  }

  const userPromptByMode: Record<GenerationMode, string> = {
    build: `Build a new standalone single-file app:\n${effectivePrompt}`,
    refine: `Update this app:\n${effectivePrompt}\n\nExisting HTML:\n${previousCode}`,
    fix: `Fix this app:\n${effectivePrompt}\n\nExisting HTML:\n${previousCode}`,
    explain: `Question:\n${effectivePrompt}\n\nExisting HTML:\n${previousCode}`,
  };

  const systemPrompt = mode === "explain" ? explainSystemPrompt : codeSystemPrompt;
  const userPrompt = userPromptByMode[mode];

  try {
    onStepChange(1, modeLabels[mode]);
    onStepChange(2, mode === "explain" ? "Preparing explanation..." : "Generating HTML...");

    const responseText = await generateWithAi(systemPrompt, userPrompt, serverChat, preferServerAi);

    onStepChange(3, "Finalizing...");
    await sleep(300);

    if (mode === "explain") {
      onStepChange(4, "Done");
      return {
        type: "explanation",
        via: "ai",
        content: responseText.trim() || "No explanation returned.",
      };
    }

    onStepChange(4, "Complete!");
    return { type: "code", via: "ai", content: normalizeGeneratedHtml(responseText) };
  } catch (error) {
    if (!hasBrowserKeys) {
      try {
        return await runOfflineDemo(effectivePrompt, mode, hasExistingCode, onStepChange);
      } catch {
        onStepChange(4, "Failed");
        throw error instanceof Error ? error : new Error("Builder generation failed");
      }
    }

    onStepChange(4, "Failed");
    const message = error instanceof Error ? error.message : "Builder generation failed";
    throw new Error(
      `Mistral generation failed. Check your API keys, model, and network connection. ${message}`,
    );
  }
}
