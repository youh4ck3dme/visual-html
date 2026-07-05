"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useSettingsDialog } from "@/components/app/settings-context";
import { builderAiStatus, builderChat } from "@/lib/builder.functions";
import {
  generateBuilderCode,
  hasBuilderAiAccess,
  isAbortError,
  isBuilderOrchestrationError,
  isTimeoutError,
} from "@/lib/builder/generate";
import {
  getBuilderOrchestrationMode,
  type BuilderOrchestrationMode,
} from "@/lib/builder/orchestration-mode";
import { promptCategories, promptLibrary, type PromptItem } from "@/lib/builder/prompt-library";
import { scanGeneratedHtml } from "@/lib/builder/risk-scanner";
import type { MessageKey } from "@/lib/i18n/messages";
import { buildSingleFileHtml } from "@/lib/utils/build-single-file-html";
import {
  createMetricsFromTrace,
  type BuilderGenerationMetrics,
} from "@/lib/builder/generation-metrics";
import type { HtmlHealthCheckResult } from "@/lib/builder/html-health-check";
import { APPLE_GLASS_QUALITY_POLISH_FIX_PROMPT } from "@/lib/builder/quality-fix-prompts";
import {
  getBuilderQualityProfileId,
  type BuilderQualityProfileId,
} from "@/lib/builder/quality-profiles";
import type { BuilderGenerationTrace } from "@/lib/builder/generation-trace";
import { useT } from "@/hooks/use-t";
import type { GenerationMode, OutputSource, VersionRecord } from "@/types/builder";

export type StudioChatMessage = { id: string; sender: "user" | "ai"; text: string };
interface StoredWorkspace {
  currentCategory: string;
  messages: StudioChatMessage[];
  generatedCode: string;
  outputSource: OutputSource;
  versions: VersionRecord[];
  generationMode: GenerationMode;
}

const WORKSPACE_STORAGE_KEY = "vibecraft_workspace_v1";

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

const STATUS_KEYS: Record<string, MessageKey> = {
  "Initializing build...": "builder.status.initializingBuild",
  "Connecting...": "builder.status.connecting",
  "Building a new app...": "builder.status.building",
  "Preparing current app for refinement...": "builder.status.preparingRefine",
  "Inspecting current app for targeted fixes...": "builder.status.inspectingFix",
  "Reading current app for explanation...": "builder.status.readingExplain",
  "Generating HTML...": "builder.status.generatingHtml",
  "Planning architecture...": "builder.status.planningArchitecture",
  "Building HTML...": "builder.status.buildingHtml",
  "Reviewing and repairing...": "builder.status.reviewingRepairing",
  "Building candidate variants...": "builder.status.buildingVariants",
  "Judging candidates...": "builder.status.judgingCandidates",
  Cancelled: "builder.status.cancelled",
  "Preparing explanation...": "builder.status.preparingExplanation",
  "Finalizing...": "builder.status.finalizing",
  "Complete!": "builder.status.complete",
  Done: "builder.status.done",
  Failed: "builder.status.failed",
  "Loading offline template...": "builder.status.loadingTemplate",
  "Explanation ready.": "builder.status.explanationReady",
};

const RISK_LABEL_KEYS: Record<string, MessageKey> = {
  "External script": "builder.risk.externalScript",
  "Inline event handlers": "builder.risk.inlineHandlers",
  "Nested iframe": "builder.risk.nestedIframe",
  "Possible secret": "builder.risk.possibleSecret",
};

const SOURCE_BADGE: Record<OutputSource, string> = {
  empty: "border-shell-border text-shell-muted",
  demo: "border-amber-500/50 text-amber-500",
  ai: "border-emerald-500/50 text-emerald-500",
  manual: "border-primary/50 text-primary",
};

export const STUDIO_MODES = MODES;
export const STUDIO_STEP_KEYS = STEP_KEYS;
export const STUDIO_SOURCE_BADGE = SOURCE_BADGE;
export { promptCategories, promptLibrary };

const readStored = (): StoredWorkspace | null => {
  try {
    const raw = localStorage.getItem(WORKSPACE_STORAGE_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as Partial<StoredWorkspace>;
    if (!Array.isArray(p.messages)) return null;
    return {
      currentCategory: p.currentCategory || "portfolios",
      messages: p.messages,
      generatedCode: p.generatedCode || "",
      outputSource: p.outputSource || (p.generatedCode ? "demo" : "empty"),
      versions: Array.isArray(p.versions) ? p.versions : [],
      generationMode: p.generationMode || (p.generatedCode ? "refine" : "build"),
    };
  } catch {
    return null;
  }
};

type UseEditorStudioOptions = {
  startTemplateId?: string;
};

export function useEditorStudio({ startTemplateId }: UseEditorStudioOptions = {}) {
  const { t } = useT();
  const { openSettings, open: settingsOpen } = useSettingsDialog();
  const [hydrated, setHydrated] = useState(false);
  const [currentCategory, setCurrentCategory] = useState("portfolios");
  const [messages, setMessages] = useState<StudioChatMessage[]>([]);
  const [generatedCode, setGeneratedCode] = useState("");
  const [outputSource, setOutputSource] = useState<OutputSource>("empty");
  const [versions, setVersions] = useState<VersionRecord[]>([]);
  const [generationMode, setGenerationMode] = useState<GenerationMode>("build");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showCancelledNotice, setShowCancelledNotice] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [stepStatusText, setStepStatusText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [inputVal, setInputVal] = useState("");
  const [hasByokAccess, setHasByokAccess] = useState(false);
  const [serverAiConfigured, setServerAiConfigured] = useState(false);
  const [previewTab, setPreviewTab] = useState<"preview" | "code">("preview");
  const [previewAllowJs, setPreviewAllowJs] = useState(false);
  const [copied, setCopied] = useState(false);
  const [orchestrationMode, setOrchestrationMode] = useState<BuilderOrchestrationMode>("pro");
  const [qualityProfileId, setQualityProfileId] = useState<BuilderQualityProfileId>("auto");
  const [currentGenerationTrace, setCurrentGenerationTrace] =
    useState<BuilderGenerationTrace | null>(null);
  const [lastGenerationMetrics, setLastGenerationMetrics] =
    useState<BuilderGenerationMetrics | null>(null);
  const [lastHtmlHealthCheck, setLastHtmlHealthCheck] = useState<HtmlHealthCheckResult | null>(
    null,
  );
  const [activeTemplateId, setActiveTemplateId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const generationAbortRef = useRef<AbortController | null>(null);
  const starterLaunchRef = useRef(false);
  const chatFn = useServerFn(builderChat);
  const statusFn = useServerFn(builderAiStatus);
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
  const id = () => crypto.randomUUID();

  const localizeStatus = useCallback(
    (status: string): string => {
      const startingMatch = status.match(/^Starting (\w+)\.\.\.$/);
      if (startingMatch) {
        const mode = startingMatch[1] as GenerationMode;
        return t("builder.status.starting", { mode: t(`builder.mode.${mode}`) });
      }
      const key = STATUS_KEYS[status];
      return key ? t(key) : status;
    },
    [t],
  );

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

  const versionLabel = useCallback(
    (mode: GenerationMode, online: boolean): string => {
      if (mode === "fix") return t("builder.version.aiFix");
      if (mode === "refine") return t("builder.version.aiRefinement");
      return online ? t("builder.version.aiGeneration") : t("builder.version.demoTemplate");
    },
    [t],
  );

  const aiReplyText = useCallback(
    (mode: GenerationMode, online: boolean): string => {
      if (mode === "fix") return t("builder.chat.fixReply");
      if (mode === "refine") return t("builder.chat.refineReply");
      if (online) return t("builder.chat.generateOnline");
      return t("builder.chat.generateOffline");
    },
    [t],
  );

  const makeVersion = (code: string, source: OutputSource, label: string): VersionRecord => ({
    id: id(),
    label,
    source,
    code,
    createdAt: new Date().toISOString(),
  });

  useEffect(() => {
    const linkedStarter = startTemplateId
      ? promptLibrary.find((item) => item.id === startTemplateId)
      : undefined;

    if (linkedStarter) {
      setCurrentCategory(linkedStarter.category);
      setMessages([{ id: "greet", sender: "ai", text: t("builder.chat.greet") }]);
      setGeneratedCode("");
      setOutputSource("empty");
      setVersions([]);
      setGenerationMode("build");
    } else {
      const s = readStored();
      if (s) {
        setCurrentCategory(s.currentCategory);
        setMessages(s.messages);
        setGeneratedCode(s.generatedCode);
        setOutputSource(s.outputSource);
        setVersions(s.versions);
        setGenerationMode(s.generationMode);
      } else {
        setMessages([{ id: "greet", sender: "ai", text: t("builder.chat.greet") }]);
      }
    }
    setOrchestrationMode(getBuilderOrchestrationMode());
    setQualityProfileId(getBuilderQualityProfileId());
    setHasByokAccess(hasBuilderAiAccess());
    void statusFn()
      .then((status) => setServerAiConfigured(status.serverKeysConfigured))
      .catch(() => setServerAiConfigured(false));
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- one-time workspace hydration
  }, []);

  useEffect(() => {
    if (settingsOpen) return;
    setHasByokAccess(hasBuilderAiAccess());
    setOrchestrationMode(getBuilderOrchestrationMode());
    setQualityProfileId(getBuilderQualityProfileId());
  }, [settingsOpen]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(
      WORKSPACE_STORAGE_KEY,
      JSON.stringify({
        currentCategory,
        messages,
        generatedCode,
        outputSource,
        versions,
        generationMode,
      } satisfies StoredWorkspace),
    );
  }, [hydrated, currentCategory, messages, generatedCode, outputSource, versions, generationMode]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isGenerating, stepStatusText]);

  const addAi = (text: string) => setMessages((p) => [...p, { id: id(), sender: "ai", text }]);

  const cancelActiveGeneration = useCallback(() => {
    generationAbortRef.current?.abort();
    generationAbortRef.current = null;
  }, []);

  const handleCancelGeneration = useCallback(() => {
    if (!isGenerating || isCancelling) return;
    setIsCancelling(true);
    setStepStatusText(t("builder.status.cancelling"));
    cancelActiveGeneration();
  }, [cancelActiveGeneration, isCancelling, isGenerating, t]);

  useEffect(() => {
    if (!showCancelledNotice) return;
    const timer = globalThis.setTimeout(() => setShowCancelledNotice(false), 4000);
    return () => globalThis.clearTimeout(timer);
  }, [showCancelledNotice]);

  const handleSendPrompt = async (
    promptText: string,
    requestedMode = generationMode,
    templateId?: string,
  ) => {
    if (!promptText.trim()) return;
    cancelActiveGeneration();
    const controller = new AbortController();
    generationAbortRef.current = controller;
    setCurrentGenerationTrace(null);
    setLastGenerationMetrics(null);
    setLastHtmlHealthCheck(null);
    setShowCancelledNotice(false);
    setIsCancelling(false);
    setError(null);
    setInputVal("");
    setMessages((p) => [...p, { id: id(), sender: "user", text: promptText }]);
    setIsGenerating(true);
    setActiveStep(0);
    setStepStatusText(
      requestedMode === "build"
        ? t("builder.status.initializingBuild")
        : t("builder.status.starting", { mode: t(`builder.mode.${requestedMode}`) }),
    );
    try {
      const prev = requestedMode === "build" ? undefined : generatedCode.trim() || undefined;
      let useServerAi = serverAiConfigured;
      try {
        const status = await statusFn();
        useServerAi = status.serverKeysConfigured;
        setServerAiConfigured(status.serverKeysConfigured);
      } catch {
        // keep last known server status
      }
      const result = await generateBuilderCode(
        promptText,
        (s, status) => {
          setActiveStep(s);
          setStepStatusText(localizeStatus(status));
        },
        (args) => {
          const { signal: _omit, ...data } = args;
          return chatFn({ data, signal: controller.signal });
        },
        prev,
        requestedMode,
        templateId,
        {
          preferServerAi: useServerAi,
          orchestrationMode,
          qualityProfileId,
          signal: controller.signal,
          onTraceUpdate: (trace) => {
            setCurrentGenerationTrace(trace);
            setLastGenerationMetrics(createMetricsFromTrace(trace));
          },
          onHealthCheckUpdate: setLastHtmlHealthCheck,
        },
      );
      if (result.type === "explanation") {
        addAi(result.content);
        return;
      }
      const code = result.content;
      const online = result.via === "ai";
      const src: OutputSource = online ? "ai" : "demo";
      setGeneratedCode(code);
      setPreviewAllowJs(false);
      setOutputSource(src);
      setGenerationMode("refine");
      setVersions((p) => [...p, makeVersion(code, src, versionLabel(requestedMode, online))]);
      addAi(aiReplyText(requestedMode, online));
    } catch (err) {
      if (isAbortError(err)) {
        setShowCancelledNotice(true);
        setStepStatusText(t("builder.status.cancelled"));
        return;
      }
      if (isBuilderOrchestrationError(err)) {
        const stepLabel = t(`builder.error.step.${err.step}`);
        const detail = isTimeoutError(err.cause) ? t("builder.error.timeout") : err.message;
        setError(`${stepLabel}: ${detail}`);
      } else {
        setError(err instanceof Error ? err.message : "Unexpected error.");
      }
      addAi(t("builder.chat.generationFailed"));
    } finally {
      if (generationAbortRef.current === controller) {
        generationAbortRef.current = null;
      }
      setIsCancelling(false);
      setIsGenerating(false);
    }
  };

  const handleSelectPrompt = (p: PromptItem) => {
    setActiveTemplateId(p.id);
    setInputVal(p.prompt);
    setGenerationMode("build");
    void handleSendPrompt(p.prompt, "build", p.id);
  };

  useEffect(() => {
    if (!hydrated || !startTemplateId || starterLaunchRef.current) return;
    const prompt = promptLibrary.find((item) => item.id === startTemplateId);
    if (!prompt) return;
    starterLaunchRef.current = true;
    handleSelectPrompt(prompt);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- one-time deep link launch
  }, [hydrated, startTemplateId]);
  const handleNewChat = () => {
    if (isGenerating) cancelActiveGeneration();
    setMessages([{ id: "new", sender: "ai", text: t("builder.chat.newWorkspace") }]);
    setGeneratedCode("");
    setPreviewAllowJs(false);
    setOutputSource("empty");
    setVersions([]);
    setGenerationMode("build");
    setInputVal("");
    setActiveTemplateId(null);
    setError(null);
    setCurrentGenerationTrace(null);
    setLastGenerationMetrics(null);
    setLastHtmlHealthCheck(null);
  };
  const handleRestore = (vid: string) => {
    const v = versions.find((x) => x.id === vid);
    if (!v) return;
    setGeneratedCode(v.code);
    setOutputSource(v.source);
    addAi(t("builder.chat.restored", { label: v.label }));
  };

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
    setInputVal(APPLE_GLASS_QUALITY_POLISH_FIX_PROMPT);
  }, [generatedCode, isCancelling, isGenerating]);

  const handleFixWithAi = useCallback((consoleMessage: string) => {
    setGenerationMode("fix");
    setInputVal(`Fix this runtime error in the preview: ${consoleMessage}`);
  }, []);

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
    makeVersion,
    handleCancelGeneration,
    handleSendPrompt,
    handleSelectPrompt,
    handleNewChat,
    handleRestore,
    sourceLabel,
    activeTemplateTitle,
    handlePromptSubmit,
    handleApplyQualityPolishFix,
    handleFixWithAi,
  };
}
