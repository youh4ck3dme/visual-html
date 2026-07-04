import { enrichBuildPrompt, getPromptMock } from "@/lib/builder/prompt-library";
import {
  builderSystemPrompt,
  codeSystemPrompt,
  explainSystemPrompt,
  judgeSystemPrompt,
  plannerSystemPrompt,
  reviewerSystemPrompt,
} from "@/lib/builder/prompts";
import {
  createBuilderGenerationTrace,
  emitTraceUpdate,
  finalizeBuilderGenerationTrace,
  markTraceStepFallbackUsed,
  markTraceStepSkipped,
  type BuilderGenerationTrace,
  type BuilderTraceContext,
} from "@/lib/builder/generation-trace";
import {
  abortableSleep,
  BuilderOrchestrationError,
  isAbortError,
  isBuilderOrchestrationError,
  isFallbackSafeError,
  isTimeoutError,
  runBuilderStep,
} from "@/lib/builder/orchestration-error";
import {
  createMetricsFromTrace,
  type BuilderGenerationMetrics,
} from "@/lib/builder/generation-metrics";
import { runHtmlHealthCheck, type HtmlHealthCheckResult } from "@/lib/builder/html-health-check";
import {
  getBuilderQualityProfileId,
  resolveBuilderQualityProfile,
  type BuilderQualityProfile,
  type BuilderQualityProfileId,
} from "@/lib/builder/quality-profiles";
import { getStepTimeoutMs } from "@/lib/builder/step-timeout";
export {
  BuilderGenerationAbortedError,
  BuilderOrchestrationError,
  BuilderStepTimeoutError,
  isAbortError,
  isBuilderOrchestrationError,
  isFallbackSafeError,
  isTimeoutError,
  type BuilderGenerationStep,
} from "@/lib/builder/orchestration-error";
import {
  getBuilderOrchestrationMode,
  type BuilderOrchestrationMode,
} from "@/lib/builder/orchestration-mode";
import type { GenerationMode } from "@/types/builder";

export type { BuilderOrchestrationMode } from "@/lib/builder/orchestration-mode";

export type BuilderGenerateVia = "ai" | "offline";
export type MistralKeySlot = "primary" | "secondary" | "auto";
export type AiRole = "planner" | "builder" | "reviewer" | "judge" | "explainer" | "fast";

export type BuilderGenerateResult =
  | { type: "code"; content: string; via: BuilderGenerateVia }
  | { type: "explanation"; content: string; via: BuilderGenerateVia };

const BUILDER_MISTRAL_KEY_1 = "builder_mistral_api_key_1";
const BUILDER_MISTRAL_KEY_2 = "builder_mistral_api_key_2";
const BUILDER_MISTRAL_MODEL = "builder_mistral_model";
const BUILDER_MAX_TOKENS = 8000;

export type GenerateBuilderCodeOptions = {
  preferServerAi?: boolean;
  orchestrationMode?: BuilderOrchestrationMode;
  signal?: AbortSignal;
  onTraceUpdate?: (trace: BuilderGenerationTrace) => void;
  onMetricsUpdate?: (metrics: BuilderGenerationMetrics) => void;
  onHealthCheckUpdate?: (result: HtmlHealthCheckResult) => void;
  qualityProfileId?: BuilderQualityProfileId;
};

export type {
  BuilderQualityProfile,
  BuilderQualityProfileId,
} from "@/lib/builder/quality-profiles";
export { enrichBuildPrompt } from "@/lib/builder/prompt-library";

export type {
  BuilderGenerationMetrics,
  BuilderStepMetrics,
} from "@/lib/builder/generation-metrics";
export type {
  HtmlHealthCategory,
  HtmlHealthCheckResult,
  HtmlHealthFinding,
  HtmlHealthSeverity,
} from "@/lib/builder/html-health-check";

export type {
  BuilderGenerationTrace,
  BuilderTraceStep,
  BuilderTraceStepId,
  BuilderTraceStepStatus,
} from "@/lib/builder/generation-trace";

const modeLabels: Record<GenerationMode, string> = {
  build: "Building a new app...",
  refine: "Preparing current app for refinement...",
  fix: "Inspecting current app for targeted fixes...",
  explain: "Reading current app for explanation...",
};

type GenerateAiOptions = {
  keySlot?: MistralKeySlot;
  role?: AiRole;
  jsonMode?: boolean;
  signal?: AbortSignal;
};

type ServerChat = (args: {
  systemPrompt: string;
  userPrompt: string;
  model?: string;
  keySlot?: MistralKeySlot;
  jsonMode?: boolean;
  signal?: AbortSignal;
}) => Promise<{ ok: true; content: string } | { ok: false; message: string }>;

type JudgeResult = {
  winner: "A" | "B";
  reason: string;
  repairInstructions: string[];
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

export function saveBuilderModel(model: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(BUILDER_MISTRAL_MODEL, model.trim() || "mistral-large-latest");
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

function orderBrowserKeys(keys: string[], slot: MistralKeySlot): string[] {
  if (keys.length === 0 || slot === "auto") return keys;
  const primary = keys[0];
  const secondary = keys[1] ?? keys[0];
  const preferred = slot === "primary" ? primary : secondary;
  return [preferred, ...keys.filter((key) => key !== preferred)];
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

function extractJsonPayload(raw: string): string {
  const trimmed = raw.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) return fenced[1].trim();
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start >= 0 && end > start) return trimmed.slice(start, end + 1);
  return trimmed;
}

function parseJudgeResult(raw: string): JudgeResult {
  try {
    const parsed = JSON.parse(extractJsonPayload(raw)) as Partial<JudgeResult>;
    return {
      winner: parsed.winner === "B" ? "B" : "A",
      reason: parsed.reason?.trim() || "Selected best candidate.",
      repairInstructions: Array.isArray(parsed.repairInstructions)
        ? parsed.repairInstructions.filter((item): item is string => typeof item === "string")
        : [],
    };
  } catch {
    return {
      winner: "A",
      reason: "Judge parse failed; defaulting to candidate A.",
      repairInstructions: [],
    };
  }
}

function buildBuilderPrompt(userPrompt: string, planText: string): string {
  return `Original user request:
${userPrompt}

Planning JSON:
${planText}

Generate the complete final HTML document now.`;
}

function buildReviewPrompt(
  userPrompt: string,
  planText: string,
  draftHtml: string,
  repairInstructions: string[] = [],
): string {
  const repairBlock =
    repairInstructions.length > 0
      ? `\n\nRepair instructions:\n${repairInstructions.map((item) => `- ${item}`).join("\n")}`
      : "";

  return `Original user request:
${userPrompt}

Planning JSON:
${planText}

Generated HTML:
${draftHtml}

Audit and repair the HTML. Return only the final corrected HTML.${repairBlock}`;
}

function buildJudgePrompt(
  userPrompt: string,
  planText: string,
  draftA: string,
  draftB: string,
): string {
  return `Original user request:
${userPrompt}

Planning JSON:
${planText}

Candidate A:
${draftA}

Candidate B:
${draftB}

Choose the better candidate and return JSON only.`;
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
  options: GenerateAiOptions = {},
): Promise<string> {
  const keys = orderBrowserKeys(getBuilderMistralKeys(), options.keySlot ?? "auto");
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
        signal: options.signal,
        body: JSON.stringify({
          model: modelName,
          temperature: 0.2,
          max_tokens: BUILDER_MAX_TOKENS,
          ...(options.jsonMode ? { response_format: { type: "json_object" } } : {}),
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
  options: GenerateAiOptions = {},
): Promise<string> {
  const result = await serverChat({
    systemPrompt,
    userPrompt,
    model: getBuilderMistralModel(),
    keySlot: options.keySlot,
    jsonMode: options.jsonMode,
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
  options: GenerateAiOptions = {},
): Promise<string> {
  const errors: string[] = [];
  const hasBrowserKeys = getBuilderMistralKeys().length > 0;

  if (preferServerAi) {
    return generateWithServer(serverChat, systemPrompt, userPrompt, options);
  }

  const attempts: Array<() => Promise<string>> = [
    () => generateWithServer(serverChat, systemPrompt, userPrompt, options),
    ...(hasBrowserKeys
      ? [() => generateWithMistralBrowser(systemPrompt, userPrompt, options)]
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

function traceStep(
  traceContext: BuilderTraceContext | undefined,
  stepId: BuilderTraceContext["stepId"],
): BuilderTraceContext | undefined {
  if (!traceContext) return undefined;
  return {
    ...traceContext,
    stepId,
    timeoutMs: getStepTimeoutMs(stepId, traceContext.trace.mode),
  };
}

async function runFastPipeline(
  userPrompt: string,
  serverChat: ServerChat,
  preferServerAi: boolean,
  onStepChange: (step: number, status: string) => void,
  orchestrationMode: BuilderOrchestrationMode,
  signal?: AbortSignal,
  traceContext?: BuilderTraceContext,
): Promise<string> {
  onStepChange(2, "Generating HTML...");
  return runBuilderStep(
    "building",
    orchestrationMode,
    signal,
    (attemptSignal) =>
      generateWithAi(codeSystemPrompt, userPrompt, serverChat, preferServerAi, {
        keySlot: "secondary",
        role: "fast",
        signal: attemptSignal,
      }),
    traceStep(traceContext, "building"),
  );
}

async function runProPipeline(
  userPrompt: string,
  serverChat: ServerChat,
  preferServerAi: boolean,
  onStepChange: (step: number, status: string) => void,
  orchestrationMode: BuilderOrchestrationMode,
  signal?: AbortSignal,
  traceContext?: BuilderTraceContext,
): Promise<string> {
  onStepChange(2, "Planning architecture...");
  const planText = await runBuilderStep(
    "planning",
    orchestrationMode,
    signal,
    (attemptSignal) =>
      generateWithAi(plannerSystemPrompt, userPrompt, serverChat, preferServerAi, {
        keySlot: "primary",
        role: "planner",
        jsonMode: true,
        signal: attemptSignal,
      }),
    traceStep(traceContext, "planning"),
  );

  onStepChange(2, "Building HTML...");
  const draftHtml = await runBuilderStep(
    "building",
    orchestrationMode,
    signal,
    (attemptSignal) =>
      generateWithAi(
        builderSystemPrompt,
        buildBuilderPrompt(userPrompt, planText),
        serverChat,
        preferServerAi,
        { keySlot: "secondary", role: "builder", signal: attemptSignal },
      ),
    traceStep(traceContext, "building"),
  );

  onStepChange(3, "Reviewing and repairing...");
  return runBuilderStep(
    "reviewing",
    orchestrationMode,
    signal,
    (attemptSignal) =>
      generateWithAi(
        reviewerSystemPrompt,
        buildReviewPrompt(userPrompt, planText, draftHtml),
        serverChat,
        preferServerAi,
        { keySlot: "primary", role: "reviewer", signal: attemptSignal },
      ),
    traceStep(traceContext, "reviewing"),
  );
}

async function runBeastPipeline(
  userPrompt: string,
  serverChat: ServerChat,
  preferServerAi: boolean,
  onStepChange: (step: number, status: string) => void,
  orchestrationMode: BuilderOrchestrationMode,
  signal?: AbortSignal,
  traceContext?: BuilderTraceContext,
): Promise<string> {
  onStepChange(2, "Planning architecture...");
  const planText = await runBuilderStep(
    "planning",
    orchestrationMode,
    signal,
    (attemptSignal) =>
      generateWithAi(plannerSystemPrompt, userPrompt, serverChat, preferServerAi, {
        keySlot: "primary",
        role: "planner",
        jsonMode: true,
        signal: attemptSignal,
      }),
    traceStep(traceContext, "planning"),
  );

  onStepChange(2, "Building candidate variants...");
  const builderPrompt = buildBuilderPrompt(userPrompt, planText);
  const [draftA, draftB] = await Promise.all([
    runBuilderStep(
      "building",
      orchestrationMode,
      signal,
      (attemptSignal) =>
        generateWithAi(builderSystemPrompt, builderPrompt, serverChat, preferServerAi, {
          keySlot: "primary",
          role: "builder",
          signal: attemptSignal,
        }),
      traceStep(traceContext, "buildingA"),
      { maxRetries: 0, failSoft: true },
    ),
    runBuilderStep(
      "building",
      orchestrationMode,
      signal,
      (attemptSignal) =>
        generateWithAi(builderSystemPrompt, builderPrompt, serverChat, preferServerAi, {
          keySlot: "secondary",
          role: "builder",
          signal: attemptSignal,
        }),
      traceStep(traceContext, "buildingB"),
      { maxRetries: 0, failSoft: true },
    ),
  ]);

  if (!draftA && !draftB) {
    throw new BuilderOrchestrationError(
      "Both builder candidates failed.",
      "building",
      orchestrationMode,
    );
  }

  let winnerDraft: string;
  let repairInstructions: string[] = [];

  if (draftA && draftB) {
    onStepChange(3, "Judging candidates...");
    const judgeRaw = await runBuilderStep(
      "judging",
      orchestrationMode,
      signal,
      (attemptSignal) =>
        generateWithAi(
          judgeSystemPrompt,
          buildJudgePrompt(userPrompt, planText, draftA, draftB),
          serverChat,
          preferServerAi,
          { keySlot: "primary", role: "judge", jsonMode: true, signal: attemptSignal },
        ),
      traceStep(traceContext, "judging"),
    );
    const judge = parseJudgeResult(judgeRaw);
    winnerDraft = judge.winner === "B" ? draftB : draftA;
    repairInstructions = judge.repairInstructions;
  } else {
    winnerDraft = draftA ?? draftB!;
    if (traceContext) {
      markTraceStepSkipped(traceContext.trace, "judging", traceContext.onTraceUpdate);
    }
  }

  onStepChange(3, "Reviewing and repairing...");
  return runBuilderStep(
    "reviewing",
    orchestrationMode,
    signal,
    (attemptSignal) =>
      generateWithAi(
        reviewerSystemPrompt,
        buildReviewPrompt(userPrompt, planText, winnerDraft, repairInstructions),
        serverChat,
        preferServerAi,
        { keySlot: "primary", role: "reviewer", signal: attemptSignal },
      ),
    traceStep(traceContext, "reviewing"),
  );
}

function normalizeGenerateOptions(
  options?: GenerateBuilderCodeOptions | boolean,
): GenerateBuilderCodeOptions {
  if (typeof options === "boolean") return { preferServerAi: options };
  return options ?? {};
}

async function runOrchestratedPipeline(
  userPrompt: string,
  serverChat: ServerChat,
  preferServerAi: boolean,
  onStepChange: (step: number, status: string) => void,
  orchestrationMode: BuilderOrchestrationMode,
  signal?: AbortSignal,
  traceContext?: BuilderTraceContext,
): Promise<string> {
  if (orchestrationMode === "fast") {
    return runFastPipeline(
      userPrompt,
      serverChat,
      preferServerAi,
      onStepChange,
      orchestrationMode,
      signal,
      traceContext,
    );
  }
  if (orchestrationMode === "beast") {
    return runBeastPipeline(
      userPrompt,
      serverChat,
      preferServerAi,
      onStepChange,
      orchestrationMode,
      signal,
      traceContext,
    );
  }
  return runProPipeline(
    userPrompt,
    serverChat,
    preferServerAi,
    onStepChange,
    orchestrationMode,
    signal,
    traceContext,
  );
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
  await new Promise((resolve) => setTimeout(resolve, 600));
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
  options?: GenerateBuilderCodeOptions | boolean,
): Promise<BuilderGenerateResult> {
  const {
    preferServerAi = false,
    orchestrationMode = getBuilderOrchestrationMode(),
    signal,
    onTraceUpdate,
    onMetricsUpdate,
    onHealthCheckUpdate,
    qualityProfileId = getBuilderQualityProfileId(),
  } = normalizeGenerateOptions(options);
  const notifyTrace = (nextTrace: BuilderGenerationTrace) => {
    onTraceUpdate?.(nextTrace);
    onMetricsUpdate?.(createMetricsFromTrace(nextTrace));
  };
  const hasBrowserKeys = getBuilderMistralKeys().length > 0;
  const hasExistingCode = Boolean(previousCode?.trim());
  const resolvedQualityProfile = resolveBuilderQualityProfile(qualityProfileId, promptText);
  const effectivePrompt = enrichBuildPrompt(promptText, templateId, resolvedQualityProfile);
  const notifyHealthCheck = (html: string) => {
    const result = runHtmlHealthCheck(html, {
      userPrompt: effectivePrompt,
      qualityProfile: resolvedQualityProfile,
    });
    onHealthCheckUpdate?.(result);
    return result;
  };

  const userPromptByMode: Record<GenerationMode, string> = {
    build: `Build a new standalone single-file app:\n${effectivePrompt}`,
    refine: `Update this app:\n${effectivePrompt}\n\nExisting HTML:\n${previousCode}`,
    fix: `Fix this app:\n${effectivePrompt}\n\nExisting HTML:\n${previousCode}`,
    explain: `Question:\n${effectivePrompt}\n\nExisting HTML:\n${previousCode}`,
  };

  const userPrompt = userPromptByMode[mode];
  const usesOrchestrationTrace = mode !== "explain";
  let trace: BuilderGenerationTrace | undefined;

  if (usesOrchestrationTrace) {
    trace = createBuilderGenerationTrace(orchestrationMode);
    trace.startedAt = Date.now();
    notifyTrace(trace);
  }

  const traceContext: BuilderTraceContext | undefined = trace
    ? { trace, stepId: "building", onTraceUpdate: notifyTrace }
    : undefined;

  try {
    onStepChange(0, "Connecting...");
    await abortableSleep(200, signal, "connecting", orchestrationMode);

    if ((mode === "refine" || mode === "fix" || mode === "explain") && !hasExistingCode) {
      throw new Error(`${mode} needs an existing app first.`);
    }

    onStepChange(1, modeLabels[mode]);

    if (mode === "explain") {
      onStepChange(2, "Preparing explanation...");
      const responseText = await runBuilderStep(
        "explaining",
        orchestrationMode,
        signal,
        (attemptSignal) =>
          generateWithAi(explainSystemPrompt, userPrompt, serverChat, preferServerAi, {
            keySlot: "primary",
            role: "explainer",
            signal: attemptSignal,
          }),
      );
      onStepChange(4, "Done");
      return {
        type: "explanation",
        via: "ai",
        content: responseText.trim() || "No explanation returned.",
      };
    }

    const responseText = await runOrchestratedPipeline(
      userPrompt,
      serverChat,
      preferServerAi,
      onStepChange,
      orchestrationMode,
      signal,
      traceContext,
    );

    onStepChange(3, "Finalizing...");
    await runBuilderStep(
      "finalizing",
      orchestrationMode,
      signal,
      (attemptSignal) => abortableSleep(300, attemptSignal, "finalizing", orchestrationMode),
      traceStep(traceContext, "finalizing"),
    );
    if (trace) {
      finalizeBuilderGenerationTrace(trace);
      notifyTrace(trace);
    }
    onStepChange(4, "Complete!");
    const finalHtml = normalizeGeneratedHtml(responseText);
    notifyHealthCheck(finalHtml);
    return { type: "code", via: "ai", content: finalHtml };
  } catch (error) {
    if (isAbortError(error)) {
      if (trace) {
        finalizeBuilderGenerationTrace(trace);
        notifyTrace(trace);
      }
      onStepChange(4, "Cancelled");
      throw error;
    }

    if (!hasBrowserKeys && mode === "build" && isFallbackSafeError(error)) {
      if (trace) {
        markTraceStepFallbackUsed(trace, notifyTrace);
        finalizeBuilderGenerationTrace(trace);
        notifyTrace(trace);
      }
      try {
        const offlineResult = await runOfflineDemo(
          effectivePrompt,
          mode,
          hasExistingCode,
          onStepChange,
        );
        if (offlineResult.type === "code") {
          notifyHealthCheck(offlineResult.content);
        }
        return offlineResult;
      } catch {
        onStepChange(4, "Failed");
        throw error instanceof Error ? error : new Error("Builder generation failed");
      }
    }

    if (isBuilderOrchestrationError(error)) {
      onStepChange(4, "Failed");
      throw error;
    }

    onStepChange(4, "Failed");
    const message = error instanceof Error ? error.message : "Builder generation failed";
    throw new Error(
      `Mistral generation failed. Check your API keys, model, and network connection. ${message}`,
    );
  }
}
