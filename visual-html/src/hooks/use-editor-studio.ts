"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";

import { useSettingsDialog } from "@/components/app/settings-context";
import { useBuilderWorkspace } from "@/hooks/use-builder-workspace-consumer";
import { hasBuilderAiAccess } from "@/lib/builder/generate";
import { promptCategories, promptLibrary, type PromptItem } from "@/lib/builder/prompt-library";
import { getBuilderOrchestrationMode } from "@/lib/builder/orchestration-mode";
import { scanGeneratedHtml } from "@/lib/builder/risk-scanner";
import type { MessageKey } from "@/lib/i18n/messages";
import { scrollIntoViewRespectingMotion } from "@/lib/motion-prefs";
import { buildSingleFileHtml } from "@/lib/utils/build-single-file-html";
import { resolveQualityPolishFixPrompt } from "@/lib/builder/quality-fix-prompts";
import { getBuilderQualityProfileId } from "@/lib/builder/quality-profiles";
import { useT } from "@/hooks/use-t";
import type { GenerationMode, OutputSource } from "@/types/builder";

export type StudioChatMessage = { id: string; sender: "user" | "ai"; text: string };

const MODES: Array<{ mode: GenerationMode; labelKey: MessageKey; hintKey: MessageKey }> = [
  { mode: "build", labelKey: "builder.mode.build", hintKey: "builder.mode.buildHint" },
  { mode: "refine", labelKey: "builder.mode.refine", hintKey: "builder.mode.refineHint" },
  { mode: "fix", labelKey: "builder.mode.fix", hintKey: "builder.mode.fixHint" },
  { mode: "explain", labelKey: "builder.mode.explain", hintKey: "builder.mode.explainHint" },
];

const STEP_KEYS: MessageKey[] = [
  "builder.step.connect",
  "builder.step.synthesize",
  "builder.step.css",
  "builder.step.scripts",
];

const SOURCE_BADGE: Record<OutputSource, string> = {
  empty: "border-shell-border text-shell-muted",
  demo: "border-amber-500/50 text-amber-500",
  ai: "border-emerald-500/50 text-emerald-500",
  manual: "border-primary/50 text-primary",
};

const RISK_LABEL_KEYS: Record<string, MessageKey> = {
  "External script": "builder.risk.externalScript",
  "Inline event handlers": "builder.risk.inlineHandlers",
  "Nested iframe": "builder.risk.nestedIframe",
  "Possible secret": "builder.risk.possibleSecret",
};

export const STUDIO_MODES = MODES;
export const STUDIO_STEP_KEYS = STEP_KEYS;
export const STUDIO_SOURCE_BADGE = SOURCE_BADGE;
export { promptCategories, promptLibrary };

type UseEditorStudioOptions = {
  startTemplateId?: string;
};

export function useEditorStudio({ startTemplateId }: UseEditorStudioOptions = {}) {
  const { t } = useT();
  const { openSettings, open: settingsOpen } = useSettingsDialog();
  const workspace = useBuilderWorkspace();

  const [previewTab, setPreviewTab] = useState<"preview" | "code">("preview");
  const [previewAllowJs, setPreviewAllowJs] = useState(false);
  const [copied, setCopied] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const starterLaunchRef = useRef(false);
  const wasGeneratingRef = useRef(false);

  const {
    hydrated,
    currentCategory,
    setCurrentCategory,
    messages,
    generatedCode,
    setGeneratedCode,
    outputSource,
    setOutputSource,
    versions,
    setVersions,
    generationMode,
    setGenerationMode,
    isGenerating,
    isCancelling,
    showCancelledNotice,
    activeStep,
    stepStatusText,
    error,
    inputVal,
    setInputVal,
    hasByokAccess,
    setHasByokAccess,
    serverAiConfigured,
    orchestrationMode,
    setOrchestrationMode,
    qualityProfileId,
    setQualityProfileId,
    currentGenerationTrace,
    lastGenerationMetrics,
    lastHtmlHealthCheck,
    activeTemplateId,
    handleCancelGeneration,
    handleSendPrompt,
    handleSelectPrompt,
    handleNewChat,
    handleRestore,
    makeVersionRecord,
    resetForTemplateDeepLink,
  } = workspace;

  const hasAiAccess = hasByokAccess || serverAiConfigured;
  const risks = useMemo(() => scanGeneratedHtml(generatedCode), [generatedCode]);
  const previewHasJs = useMemo(() => /<script\b/i.test(generatedCode), [generatedCode]);
  const previewDoc = useMemo(
    () =>
      buildSingleFileHtml(
        { html: generatedCode, css: "", javascript: "" },
        { allowJs: previewAllowJs && previewHasJs, title: "VibeCraft Preview" },
      ),
    [generatedCode, previewAllowJs, previewHasJs],
  );
  const prompts = promptLibrary.filter((p) => p.category === currentCategory);
  const hasUnsaved = Boolean(generatedCode) && generatedCode !== (versions.at(-1)?.code || "");
  const modeHint = MODES.find((m) => m.mode === generationMode)?.hintKey;

  const localizeRisk = useCallback(
    (label: string, detail: string): { label: string; detail: string } => {
      const labelKey = RISK_LABEL_KEYS[label];
      if (label === "Inline event handlers") {
        const countMatch = detail.match(/^(\d+)/);
        return {
          label: labelKey ? t(labelKey) : label,
          detail: t("builder.risk.inlineHandlersDetail", { count: countMatch?.[1] ?? 0 }),
        };
      }
      if (label === "Nested iframe") {
        return {
          label: labelKey ? t(labelKey) : label,
          detail: t("builder.risk.nestedIframeDetail"),
        };
      }
      if (label === "Possible secret") {
        return {
          label: labelKey ? t(labelKey) : label,
          detail: t("builder.risk.possibleSecretDetail"),
        };
      }
      return { label: labelKey ? t(labelKey) : label, detail };
    },
    [t],
  );

  useEffect(() => {
    if (settingsOpen) return;
    setHasByokAccess(hasBuilderAiAccess());
    setOrchestrationMode(getBuilderOrchestrationMode());
    setQualityProfileId(getBuilderQualityProfileId());
  }, [settingsOpen, setHasByokAccess, setOrchestrationMode, setQualityProfileId]);

  useEffect(() => {
    scrollIntoViewRespectingMotion(messagesEndRef.current);
  }, [messages, isGenerating, stepStatusText]);

  useEffect(() => {
    const wasGenerating = wasGeneratingRef.current;
    wasGeneratingRef.current = isGenerating;
    if (wasGenerating && !isGenerating && generatedCode) {
      setPreviewAllowJs(false);
    }
  }, [isGenerating, generatedCode]);

  useEffect(() => {
    if (!hydrated || !startTemplateId || starterLaunchRef.current) return;
    const prompt = promptLibrary.find((item) => item.id === startTemplateId);
    if (!prompt) return;
    starterLaunchRef.current = true;
    resetForTemplateDeepLink(prompt.category);
    handleSelectPrompt(prompt);
  }, [hydrated, startTemplateId, resetForTemplateDeepLink, handleSelectPrompt]);

  const sourceLabel = (source: OutputSource) => t(`builder.source.${source}`);
  const activeTemplateTitle = activeTemplateId
    ? t(`builder.template.${activeTemplateId}.title` as MessageKey)
    : null;

  const handlePromptSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (inputVal.trim() && !isGenerating && !isCancelling) {
      void handleSendPrompt(inputVal.trim());
    }
  };

  const handleApplyQualityPolishFix = useCallback(() => {
    if (!generatedCode.trim() || isGenerating || isCancelling) return;
    setGenerationMode("fix");
    setInputVal(
      resolveQualityPolishFixPrompt(qualityProfileId, inputVal || generatedCode.slice(0, 200)),
    );
  }, [
    generatedCode,
    inputVal,
    isCancelling,
    isGenerating,
    qualityProfileId,
    setGenerationMode,
    setInputVal,
  ]);

  const handleFixWithAi = useCallback(
    (consoleMessage: string) => {
      setGenerationMode("fix");
      setInputVal(`Fix this runtime error in the preview: ${consoleMessage}`);
    },
    [setGenerationMode, setInputVal],
  );

  const handleNewChatWithPreviewReset = useCallback(() => {
    handleNewChat();
    setPreviewAllowJs(false);
  }, [handleNewChat]);

  const handleSelectPromptWithPreviewReset = useCallback(
    (prompt: PromptItem) => {
      setPreviewAllowJs(false);
      handleSelectPrompt(prompt);
    },
    [handleSelectPrompt],
  );

  return {
    t,
    openSettings,
    hydrated,
    currentCategory,
    setCurrentCategory,
    messages,
    generatedCode,
    setGeneratedCode,
    outputSource,
    setOutputSource,
    versions,
    setVersions,
    generationMode,
    setGenerationMode,
    isGenerating,
    isCancelling,
    showCancelledNotice,
    activeStep,
    stepStatusText,
    error,
    inputVal,
    setInputVal,
    hasByokAccess,
    serverAiConfigured,
    previewTab,
    setPreviewTab,
    previewAllowJs,
    setPreviewAllowJs,
    copied,
    setCopied,
    currentGenerationTrace,
    lastGenerationMetrics,
    lastHtmlHealthCheck,
    activeTemplateId,
    messagesEndRef,
    hasAiAccess,
    risks,
    previewHasJs,
    previewDoc,
    prompts,
    hasUnsaved,
    modeHint,
    localizeRisk,
    makeVersion: makeVersionRecord,
    handleCancelGeneration,
    handleSendPrompt,
    handleSelectPrompt: handleSelectPromptWithPreviewReset,
    handleNewChat: handleNewChatWithPreviewReset,
    handleRestore,
    sourceLabel,
    activeTemplateTitle,
    handlePromptSubmit,
    handleApplyQualityPolishFix,
    handleFixWithAi,
    orchestrationMode,
    qualityProfileId,
  };
}
