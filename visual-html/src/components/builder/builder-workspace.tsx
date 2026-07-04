"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Check,
  Code,
  Copy,
  Download,
  Eye,
  Folder,
  Gamepad2,
  Globe,
  Key,
  LayoutDashboard,
  Plus,
  RefreshCw,
  RotateCcw,
  Save,
  Settings,
  Shield,
  Sparkles,
  Trash2,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useT } from "@/hooks/use-t";
import { builderChat } from "@/lib/builder.functions";
import {
  clearBuilderSettings,
  generateBuilderCode,
  getBuilderMistralKeys,
  getBuilderMistralModel,
  hasBuilderAiAccess,
  saveBuilderSettings,
} from "@/lib/builder/generate";
import { promptCategories, promptLibrary, type PromptItem } from "@/lib/builder/prompt-library";
import { scanGeneratedHtml } from "@/lib/builder/risk-scanner";
import type { MessageKey } from "@/lib/i18n/messages";
import { PreviewFrame } from "@/components/pngto/preview-frame";
import { cn } from "@/lib/utils";
import { buildSingleFileHtml } from "@/lib/utils/build-single-file-html";
import { downloadTextFile } from "@/lib/utils/download";
import type { GenerationMode, OutputSource, VersionRecord } from "@/types/builder";

type ChatMessage = { id: string; sender: "user" | "ai"; text: string };
interface StoredWorkspace {
  currentCategory: string;
  messages: ChatMessage[];
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
const CAT_ICON: Record<string, ReactNode> = {
  User: <Folder className="h-4 w-4" />,
  Globe: <Globe className="h-4 w-4" />,
  Wrench: <Wrench className="h-4 w-4" />,
  Gamepad2: <Gamepad2 className="h-4 w-4" />,
  LayoutDashboard: <LayoutDashboard className="h-4 w-4" />,
};

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

export function BuilderWorkspace() {
  const { t } = useT();
  const [hydrated, setHydrated] = useState(false);
  const [currentCategory, setCurrentCategory] = useState("portfolios");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [generatedCode, setGeneratedCode] = useState("");
  const [outputSource, setOutputSource] = useState<OutputSource>("empty");
  const [versions, setVersions] = useState<VersionRecord[]>([]);
  const [generationMode, setGenerationMode] = useState<GenerationMode>("build");
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [stepStatusText, setStepStatusText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [inputVal, setInputVal] = useState("");
  const [hasAiAccess, setHasAiAccess] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [previewTab, setPreviewTab] = useState<"preview" | "code">("preview");
  const [previewAllowJs, setPreviewAllowJs] = useState(false);
  const [copied, setCopied] = useState(false);
  const [key1, setKey1] = useState("");
  const [key2, setKey2] = useState("");
  const [model, setModel] = useState("mistral-large-latest");
  const [showKeys, setShowKeys] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatFn = useServerFn(builderChat);
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
    const keys = getBuilderMistralKeys();
    setKey1(keys[0] || "");
    setKey2(keys[1] || "");
    setModel(getBuilderMistralModel());
    setHasAiAccess(hasBuilderAiAccess());
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- one-time workspace hydration
  }, []);

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

  const handleSendPrompt = async (promptText: string, requestedMode = generationMode) => {
    if (!promptText.trim()) return;
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
      const online = hasBuilderAiAccess();
      const result = await generateBuilderCode(
        promptText,
        (s, status) => {
          setActiveStep(s);
          setStepStatusText(localizeStatus(status));
        },
        (args) => chatFn({ data: args }),
        prev,
        requestedMode,
      );
      if (result.type === "explanation") {
        addAi(result.content);
        return;
      }
      const code = result.content;
      const src: OutputSource = online ? "ai" : "demo";
      setGeneratedCode(code);
      setPreviewAllowJs(false);
      setOutputSource(src);
      setGenerationMode("refine");
      setVersions((p) => [...p, makeVersion(code, src, versionLabel(requestedMode, online))]);
      addAi(aiReplyText(requestedMode, online));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error.");
      addAi(t("builder.chat.generationFailed"));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectPrompt = (p: PromptItem) => {
    setInputVal(p.prompt);
    setGenerationMode("build");
    void handleSendPrompt(p.prompt, "build");
  };
  const handleNewChat = () => {
    setMessages([{ id: "new", sender: "ai", text: t("builder.chat.newWorkspace") }]);
    setGeneratedCode("");
    setPreviewAllowJs(false);
    setOutputSource("empty");
    setVersions([]);
    setGenerationMode("build");
    setInputVal("");
    setError(null);
  };
  const handleRestore = (vid: string) => {
    const v = versions.find((x) => x.id === vid);
    if (!v) return;
    setGeneratedCode(v.code);
    setOutputSource(v.source);
    addAi(t("builder.chat.restored", { label: v.label }));
  };

  const sourceLabel = (source: OutputSource) => t(`builder.source.${source}`);

  return (
    <div className="flex min-h-[calc(100dvh-3rem)] w-full overflow-hidden border border-shell-border bg-shell text-foreground">
      <aside className="flex w-56 shrink-0 flex-col border-r border-shell-border bg-shell-elevated">
        <div className="flex items-center gap-2 border-b border-shell-border px-3 py-4">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-bold">{t("builder.brand")}</p>
            <p className="text-[10px] font-semibold uppercase text-shell-muted">
              {t("builder.brandSubtitle")}
            </p>
          </div>
        </div>
        <div className="border-b border-shell-border p-3">
          <Button
            className="w-full"
            size="sm"
            onClick={handleNewChat}
            data-testid="builder-new-application"
          >
            <Plus className="h-4 w-4" /> {t("builder.newApplication")}
          </Button>
        </div>
        <div className="space-y-1 p-3">
          <p className="px-1 text-[10px] font-bold uppercase text-shell-muted">
            {t("builder.categories")}
          </p>
          {promptCategories.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCurrentCategory(c.id)}
              className={cn(
                "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs",
                currentCategory === c.id
                  ? "bg-shell-hover text-foreground"
                  : "text-shell-muted hover:bg-shell-hover",
              )}
            >
              {CAT_ICON[c.icon]}
              {t(`builder.category.${c.id}` as MessageKey)}
            </button>
          ))}
        </div>
        <div className="flex-1 space-y-2 overflow-y-auto border-t border-shell-border p-3">
          <p className="text-[10px] font-bold uppercase text-shell-muted">
            {t("builder.starterTemplates")}
          </p>
          {prompts.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => handleSelectPrompt(p)}
              className="w-full rounded-lg border border-shell-border bg-shell p-2 text-left hover:border-primary/40 hover:bg-shell-hover"
              data-testid={`builder-template-${p.id}`}
            >
              <p className="text-xs font-semibold">
                {t(`builder.template.${p.id}.title` as MessageKey)}
              </p>
              <p className="mt-0.5 line-clamp-2 text-[11px] text-shell-muted">
                {t(`builder.template.${p.id}.description` as MessageKey)}
              </p>
            </button>
          ))}
        </div>
        <div className="flex items-center justify-between border-t border-shell-border p-3">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "h-2 w-2 rounded-full",
                hasAiAccess ? "bg-emerald-500" : "bg-amber-500",
              )}
            />
            <div>
              <p className="text-[11px] font-semibold">
                {hasAiAccess ? t("builder.byokReady") : t("builder.demoMode")}
              </p>
              <p className="text-[9px] text-shell-muted">
                {hasAiAccess ? t("builder.mistralKeysSet") : t("builder.templatesOnly")}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSettingsOpen(true)}
            aria-label={t("builder.settingsAria")}
            data-testid="builder-settings"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </aside>

      <section className="flex min-w-0 flex-1 flex-col bg-shell">
        <header className="flex items-center justify-between border-b border-shell-border bg-shell-elevated px-4 py-3">
          <div>
            <h2 className="text-sm font-bold">{t("builder.workspaceTitle")}</h2>
            <p className="text-[11px] text-shell-muted">{modeHint ? t(modeHint) : ""}</p>
          </div>
          <span className="rounded-full border border-shell-border px-2 py-0.5 text-[10px] font-bold uppercase text-shell-muted">
            {t(`builder.mode.${generationMode}` as MessageKey)}
          </span>
        </header>
        <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={cn("max-w-[85%] text-sm", m.sender === "user" ? "self-end" : "self-start")}
            >
              <div
                className={cn(
                  "rounded-xl px-3 py-2 leading-relaxed",
                  m.sender === "user"
                    ? "rounded-br-none border border-primary/30 bg-primary/10"
                    : "rounded-bl-none border border-shell-border bg-shell-elevated",
                )}
              >
                {m.text}
              </div>
            </div>
          ))}
          {isGenerating && (
            <div className="max-w-[90%] self-start rounded-xl border border-shell-border bg-shell-elevated p-3 text-xs">
              <p className="flex items-center gap-2 font-medium text-primary">
                <RefreshCw className="h-4 w-4 animate-spin" />
                {stepStatusText}
              </p>
              {STEP_KEYS.map((stepKey, i) => (
                <p
                  key={stepKey}
                  className={cn(
                    "mt-1",
                    activeStep > i
                      ? "text-emerald-500"
                      : activeStep === i
                        ? "text-primary"
                        : "text-shell-muted",
                  )}
                >
                  {activeStep > i ? "✓" : i + 1}. {t(stepKey)}
                </p>
              ))}
            </div>
          )}
          {error && (
            <div className="flex gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>
                <strong>{t("builder.errorPrefix")}</strong> {error}
              </span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <form
          className="border-t border-shell-border bg-shell-elevated p-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (inputVal.trim() && !isGenerating) void handleSendPrompt(inputVal.trim());
          }}
        >
          <div className="mb-2 flex gap-1 rounded-lg border border-shell-border bg-shell p-1">
            {MODES.map(({ mode, labelKey, hintKey }) => {
              const off = (mode !== "build" && !generatedCode) || isGenerating;
              return (
                <button
                  key={mode}
                  type="button"
                  title={t(hintKey)}
                  disabled={off}
                  onClick={() => setGenerationMode(mode)}
                  className={cn(
                    "flex-1 rounded-md px-2 py-1.5 text-[11px] font-bold",
                    generationMode === mode
                      ? "bg-primary text-primary-foreground"
                      : "text-shell-muted",
                    off && "opacity-35",
                  )}
                  data-testid={`builder-mode-${mode}`}
                >
                  {t(labelKey)}
                </button>
              );
            })}
          </div>
          <div className="relative">
            <Input
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              disabled={isGenerating}
              placeholder={isGenerating ? t("builder.inputWorking") : t("builder.inputPlaceholder")}
              className="bg-shell pr-12"
            />
            <Button
              type="submit"
              size="icon"
              className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2"
              disabled={!inputVal.trim() || isGenerating}
              data-testid="builder-send"
            >
              {isGenerating ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <ArrowRight className="h-4 w-4" />
              )}
            </Button>
          </div>
        </form>
      </section>

      <section className="flex min-w-0 flex-1 flex-col border-l border-shell-border bg-shell-elevated">
        <header className="flex flex-wrap items-center justify-between gap-2 border-b border-shell-border px-3 py-2">
          <div className="flex gap-1 rounded-lg border border-shell-border bg-shell p-0.5">
            {(["preview", "code"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setPreviewTab(tab)}
                className={cn(
                  "inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold",
                  previewTab === tab ? "bg-shell-elevated text-primary" : "text-shell-muted",
                )}
                data-testid={`builder-tab-${tab}`}
              >
                {tab === "preview" ? (
                  <Eye className="h-3.5 w-3.5" />
                ) : (
                  <Code className="h-3.5 w-3.5" />
                )}
                {tab === "preview" ? t("builder.previewTab") : t("builder.codeTab")}
              </button>
            ))}
          </div>
          {generatedCode && (
            <div className="flex flex-wrap items-center gap-2">
              {previewHasJs && (
                <label
                  htmlFor="builder-preview-allow-js"
                  className="flex cursor-pointer items-center gap-1.5 text-[11px] text-shell-muted"
                >
                  <input
                    id="builder-preview-allow-js"
                    name="builderAllowPreviewJavaScript"
                    type="checkbox"
                    checked={previewAllowJs}
                    onChange={(e) => {
                      const next = e.target.checked;
                      if (next && risks.length > 0) {
                        const ok = window.confirm(t("builder.previewJsRiskConfirm"));
                        if (!ok) return;
                      }
                      setPreviewAllowJs(next);
                    }}
                    className="h-3.5 w-3.5 accent-primary"
                    data-testid="builder-preview-allow-js"
                  />
                  {t("result.runJsInPreview")}
                </label>
              )}
              <div className="flex flex-wrap items-center gap-1.5">
                <span
                  className={cn(
                    "rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase",
                    SOURCE_BADGE[outputSource],
                  )}
                >
                  {sourceLabel(outputSource)}
                  {hasUnsaved ? t("builder.unsavedMarker") : ""}
                </span>
                {versions.length > 0 && (
                  <div className="relative">
                    <RotateCcw className="pointer-events-none absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-shell-muted" />
                    <select
                      aria-label={t("builder.historyAria")}
                      value=""
                      onChange={(e) => handleRestore(e.target.value)}
                      className="h-8 w-28 rounded-md border border-shell-border bg-shell pl-7 text-[11px]"
                    >
                      <option value="">
                        {t("builder.historyOption", { count: versions.length })}
                      </option>
                      {[...versions].reverse().map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.label} ·{" "}
                          {new Date(v.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                {hasUnsaved && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() =>
                      setVersions((p) => [
                        ...p,
                        makeVersion(generatedCode, "manual", t("builder.version.manualEdit")),
                      ])
                    }
                    data-testid="builder-save-manual"
                  >
                    <Save className="h-3.5 w-3.5" /> {t("builder.saveManual")}
                  </Button>
                )}
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    void navigator.clipboard.writeText(generatedCode);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  data-testid="builder-copy"
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  {copied ? t("builder.copied") : t("builder.copy")}
                </Button>
                <Button
                  size="sm"
                  onClick={() => downloadTextFile("vibecraft-application.html", generatedCode)}
                  data-testid="builder-download"
                >
                  <Download className="h-3.5 w-3.5" /> {t("builder.download")}
                </Button>
              </div>
            </div>
          )}
        </header>
        {risks.length > 0 && (
          <div className="flex gap-2 border-b border-amber-500/30 bg-amber-500/10 px-3 py-2 text-amber-600 dark:text-amber-400">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-semibold">{t("builder.securityWarning")}</p>
              <div className="mt-1 flex flex-wrap gap-1">
                {risks.map((r) => {
                  const localized = localizeRisk(r.label, r.detail);
                  return (
                    <span
                      key={r.id}
                      className={cn(
                        "truncate rounded-full border px-2 py-0.5 text-[10px]",
                        r.level === "danger" ? "border-red-400/40" : "border-amber-400/40",
                      )}
                    >
                      {localized.label}: {localized.detail}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        )}
        <div className="relative flex-1 overflow-hidden">
          {!generatedCode ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center text-shell-muted">
              <Eye className="h-8 w-8 opacity-40" />
              <p className="text-sm font-semibold text-foreground">
                {t("builder.previewEmptyTitle")}
              </p>
              <p className="max-w-xs text-xs">{t("builder.previewEmptyHint")}</p>
            </div>
          ) : previewTab === "preview" ? (
            <PreviewFrame
              srcDoc={previewDoc}
              allowJs={previewAllowJs && previewHasJs}
              title={t("builder.previewFrameTitle")}
              className="h-full border-0 bg-white"
            />
          ) : (
            <Textarea
              aria-label={t("builder.codeEditorAria")}
              value={generatedCode}
              spellCheck={false}
              onChange={(e) => {
                setGeneratedCode(e.target.value);
                setOutputSource(e.target.value.trim() ? "manual" : "empty");
              }}
              className="h-full min-h-0 resize-none rounded-none border-0 bg-shell font-mono text-xs"
            />
          )}
        </div>
      </section>

      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="border-shell-border bg-shell-elevated sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="h-5 w-5 text-primary" /> {t("builder.settings.title")}
            </DialogTitle>
            <DialogDescription>{t("builder.settings.description")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="k1">{t("builder.settings.key1")}</Label>
              <Input
                id="k1"
                type={showKeys ? "text" : "password"}
                value={key1}
                onChange={(e) => setKey1(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="k2">{t("builder.settings.key2")}</Label>
              <Input
                id="k2"
                type={showKeys ? "text" : "password"}
                value={key2}
                onChange={(e) => setKey2(e.target.value)}
              />
              <p className="flex items-center gap-1 text-[11px] text-shell-muted">
                <Shield className="h-3 w-3" /> {t("builder.settings.key2Hint")}
              </p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="model">{t("builder.settings.model")}</Label>
              <select
                id="model"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="h-9 w-full rounded-md border border-shell-border bg-shell px-3 text-sm"
              >
                <option value="mistral-large-latest">{t("builder.settings.modelLarge")}</option>
                <option value="mistral-medium-latest">{t("builder.settings.modelMedium")}</option>
                <option value="codestral-latest">{t("builder.settings.modelCodestral")}</option>
              </select>
            </div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setShowKeys((v) => !v)}
            >
              {showKeys ? t("builder.settings.hideKeys") : t("builder.settings.showKeys")}{" "}
              {t("builder.settings.keysSuffix")}
            </Button>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="secondary"
              size="icon"
              onClick={() => {
                clearBuilderSettings();
                setKey1("");
                setKey2("");
                setHasAiAccess(false);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button type="button" variant="secondary" onClick={() => setSettingsOpen(false)}>
              {t("builder.settings.cancel")}
            </Button>
            <Button
              type="button"
              onClick={() => {
                saveBuilderSettings({ key1, key2, model });
                setHasAiAccess(hasBuilderAiAccess());
                setSettingsOpen(false);
              }}
              data-testid="builder-settings-save"
            >
              {t("builder.settings.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
