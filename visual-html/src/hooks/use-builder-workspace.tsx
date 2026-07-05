import { useServerFn } from "@tanstack/react-start";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";

import { builderAiStatus, builderChat } from "@/lib/builder.functions";
import {
  generateBuilderCode,
  getBuilderMistralKeys,
  getBuilderMistralModel,
  hasBuilderAiAccess,
  isAbortError,
  isBuilderOrchestrationError,
  isTimeoutError,
} from "@/lib/builder/generate";
import {
  createMetricsFromTrace,
  type BuilderGenerationMetrics,
} from "@/lib/builder/generation-metrics";
import type { BuilderGenerationTrace } from "@/lib/builder/generation-trace";
import type { HtmlHealthCheckResult } from "@/lib/builder/html-health-check";
import {
  getBuilderOrchestrationMode,
  type BuilderOrchestrationMode,
} from "@/lib/builder/orchestration-mode";
import { promptLibrary, type PromptItem } from "@/lib/builder/prompt-library";
import {
  getBuilderQualityProfileId,
  type BuilderQualityProfileId,
} from "@/lib/builder/quality-profiles";
import {
  BuilderWorkspaceContext,
  type BuilderWorkspaceContextValue,
} from "@/hooks/builder-workspace-context";
import {
  readStoredWorkspace,
  writeStoredWorkspace,
  type BuilderChatMessage,
  type StoredWorkspace,
} from "@/lib/builder/workspace-storage";
import { useT } from "@/hooks/use-t";
import type { MessageKey } from "@/lib/i18n/messages";
import type { GenerationMode, OutputSource, VersionRecord } from "@/types/builder";

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

const newId = () => crypto.randomUUID();

function makeVersion(code: string, source: OutputSource, label: string): VersionRecord {
  return {
    id: newId(),
    label,
    source,
    code,
    createdAt: new Date().toISOString(),
  };
}

export function BuilderWorkspaceProvider({ children }: { children: ReactNode }) {
  const { t } = useT();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const pathnameRef = useRef(pathname);
  pathnameRef.current = pathname;

  const [hydrated, setHydrated] = useState(false);
  const [currentCategory, setCurrentCategory] = useState("portfolios");
  const [messages, setMessages] = useState<BuilderChatMessage[]>([]);
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

  const generationAbortRef = useRef<AbortController | null>(null);
  const chatFn = useServerFn(builderChat);
  const statusFn = useServerFn(builderAiStatus);
  const hasAiAccess = hasByokAccess || serverAiConfigured;

  const persistWorkspace = useCallback(
    (patch?: Partial<StoredWorkspace>) => {
      writeStoredWorkspace({
        currentCategory: patch?.currentCategory ?? currentCategory,
        messages: patch?.messages ?? messages,
        generatedCode: patch?.generatedCode ?? generatedCode,
        outputSource: patch?.outputSource ?? outputSource,
        versions: patch?.versions ?? versions,
        generationMode: patch?.generationMode ?? generationMode,
      });
    },
    [currentCategory, generatedCode, generationMode, messages, outputSource, versions],
  );

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

  const addAiMessage = useCallback((text: string) => {
    setMessages((prev) => [...prev, { id: newId(), sender: "ai", text }]);
  }, []);

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

  const handleSendPrompt = useCallback(
    async (promptText: string, requestedMode = generationMode, templateId?: string) => {
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
      const nextMessages: BuilderChatMessage[] = [
        ...messages,
        { id: newId(), sender: "user", text: promptText },
      ];
      setMessages(nextMessages);
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
          const withReply: BuilderChatMessage[] = [
            ...nextMessages,
            { id: newId(), sender: "ai", text: result.content },
          ];
          setMessages(withReply);
          persistWorkspace({ messages: withReply });
          return;
        }

        const code = result.content;
        const online = result.via === "ai";
        const src: OutputSource = online ? "ai" : "demo";
        const nextGenerationMode: GenerationMode = "refine";
        const nextVersions = [
          ...versions,
          makeVersion(code, src, versionLabel(requestedMode, online)),
        ];
        const withReply: BuilderChatMessage[] = [
          ...nextMessages,
          { id: newId(), sender: "ai", text: aiReplyText(requestedMode, online) },
        ];

        setGeneratedCode(code);
        setOutputSource(src);
        setGenerationMode(nextGenerationMode);
        setVersions(nextVersions);
        setMessages(withReply);
        persistWorkspace({
          messages: withReply,
          generatedCode: code,
          outputSource: src,
          versions: nextVersions,
          generationMode: nextGenerationMode,
        });

        if (pathnameRef.current !== "/builder") {
          toast.success(t("builder.background.complete"), {
            description: t("builder.background.completeHint"),
            action: {
              label: t("builder.background.openBuilder"),
              onClick: () => {
                void navigate({ to: "/builder" });
              },
            },
          });
        }
      } catch (err) {
        if (isAbortError(err)) {
          setShowCancelledNotice(true);
          setStepStatusText(t("builder.status.cancelled"));
          return;
        }
        const failReply = t("builder.chat.generationFailed");
        const withFail: BuilderChatMessage[] = [
          ...nextMessages,
          { id: newId(), sender: "ai", text: failReply },
        ];
        setMessages(withFail);
        persistWorkspace({ messages: withFail });

        if (isBuilderOrchestrationError(err)) {
          const stepLabel = t(`builder.error.step.${err.step}`);
          const detail = isTimeoutError(err.cause) ? t("builder.error.timeout") : err.message;
          setError(`${stepLabel}: ${detail}`);
        } else {
          setError(err instanceof Error ? err.message : "Unexpected error.");
        }

        if (pathnameRef.current !== "/builder") {
          toast.error(t("builder.background.failed"), {
            description: t("builder.background.failedHint"),
          });
        }
      } finally {
        if (generationAbortRef.current === controller) {
          generationAbortRef.current = null;
        }
        setIsCancelling(false);
        setIsGenerating(false);
      }
    },
    [
      aiReplyText,
      cancelActiveGeneration,
      chatFn,
      generatedCode,
      generationMode,
      localizeStatus,
      messages,
      orchestrationMode,
      persistWorkspace,
      qualityProfileId,
      serverAiConfigured,
      statusFn,
      t,
      versionLabel,
      versions,
      navigate,
    ],
  );

  const handleSelectPrompt = useCallback(
    (prompt: PromptItem) => {
      setActiveTemplateId(prompt.id);
      setInputVal(prompt.prompt);
      setGenerationMode("build");
      void handleSendPrompt(prompt.prompt, "build", prompt.id);
    },
    [handleSendPrompt],
  );

  const handleNewChat = useCallback(() => {
    if (isGenerating) cancelActiveGeneration();
    const freshMessages: BuilderChatMessage[] = [
      { id: "new", sender: "ai", text: t("builder.chat.newWorkspace") },
    ];
    setMessages(freshMessages);
    setGeneratedCode("");
    setOutputSource("empty");
    setVersions([]);
    setGenerationMode("build");
    setInputVal("");
    setActiveTemplateId(null);
    setError(null);
    setCurrentGenerationTrace(null);
    setLastGenerationMetrics(null);
    setLastHtmlHealthCheck(null);
    persistWorkspace({
      messages: freshMessages,
      generatedCode: "",
      outputSource: "empty",
      versions: [],
      generationMode: "build",
    });
  }, [cancelActiveGeneration, isGenerating, persistWorkspace, t]);

  const handleRestore = useCallback(
    (versionId: string) => {
      const version = versions.find((item) => item.id === versionId);
      if (!version) return;
      setGeneratedCode(version.code);
      setOutputSource(version.source);
      addAiMessage(t("builder.chat.restored", { label: version.label }));
      persistWorkspace({
        generatedCode: version.code,
        outputSource: version.source,
      });
    },
    [addAiMessage, persistWorkspace, t, versions],
  );

  const resetForTemplateDeepLink = useCallback(
    (category: string) => {
      const greet: BuilderChatMessage[] = [
        { id: "greet", sender: "ai", text: t("builder.chat.greet") },
      ];
      setCurrentCategory(category);
      setMessages(greet);
      setGeneratedCode("");
      setOutputSource("empty");
      setVersions([]);
      setGenerationMode("build");
      persistWorkspace({
        currentCategory: category,
        messages: greet,
        generatedCode: "",
        outputSource: "empty",
        versions: [],
        generationMode: "build",
      });
    },
    [persistWorkspace, t],
  );

  useEffect(() => {
    const stored = readStoredWorkspace();
    if (stored) {
      setCurrentCategory(stored.currentCategory);
      setMessages(stored.messages);
      setGeneratedCode(stored.generatedCode);
      setOutputSource(stored.outputSource);
      setVersions(stored.versions);
      setGenerationMode(stored.generationMode);
    } else {
      setMessages([{ id: "greet", sender: "ai", text: t("builder.chat.greet") }]);
    }
    setHasByokAccess(hasBuilderAiAccess());
    setOrchestrationMode(getBuilderOrchestrationMode());
    setQualityProfileId(getBuilderQualityProfileId());
    void getBuilderMistralKeys();
    void getBuilderMistralModel();
    void statusFn()
      .then((status) => setServerAiConfigured(status.serverKeysConfigured))
      .catch(() => setServerAiConfigured(false));
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- one-time provider hydration
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    writeStoredWorkspace({
      currentCategory,
      messages,
      generatedCode,
      outputSource,
      versions,
      generationMode,
    });
  }, [hydrated, currentCategory, messages, generatedCode, outputSource, versions, generationMode]);

  useEffect(() => {
    if (!showCancelledNotice) return;
    const timer = globalThis.setTimeout(() => setShowCancelledNotice(false), 4000);
    return () => globalThis.clearTimeout(timer);
  }, [showCancelledNotice]);

  const value = useMemo<BuilderWorkspaceContextValue>(
    () => ({
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
      setActiveTemplateId,
      hasAiAccess,
      cancelActiveGeneration,
      handleCancelGeneration,
      handleSendPrompt,
      handleSelectPrompt,
      handleNewChat,
      handleRestore,
      resetForTemplateDeepLink,
      makeVersionRecord: makeVersion,
      addAiMessage,
      versionLabel,
    }),
    [
      hydrated,
      currentCategory,
      messages,
      generatedCode,
      outputSource,
      versions,
      generationMode,
      isGenerating,
      isCancelling,
      showCancelledNotice,
      activeStep,
      stepStatusText,
      error,
      inputVal,
      hasByokAccess,
      serverAiConfigured,
      orchestrationMode,
      qualityProfileId,
      currentGenerationTrace,
      lastGenerationMetrics,
      lastHtmlHealthCheck,
      activeTemplateId,
      hasAiAccess,
      cancelActiveGeneration,
      handleCancelGeneration,
      handleSendPrompt,
      handleSelectPrompt,
      handleNewChat,
      handleRestore,
      resetForTemplateDeepLink,
      addAiMessage,
      versionLabel,
    ],
  );

  return (
    <BuilderWorkspaceContext.Provider value={value}>{children}</BuilderWorkspaceContext.Provider>
  );
}
