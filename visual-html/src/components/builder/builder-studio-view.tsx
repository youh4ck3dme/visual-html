"use client";

import { useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  ChevronDown,
  Folder,
  FolderOpen,
  Gamepad2,
  Globe,
  LayoutDashboard,
  LayoutGrid,
  Plus,
  RotateCcw,
  Save,
  Wrench,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { OutputPanel } from "@/components/app/output-panel";
import { BuilderGenerationTracePanel } from "@/components/builder/builder-generation-trace";
import { EditorChatPanel } from "@/components/editor/editor-chat-panel";
import { EditorConsolePanel } from "@/components/editor/editor-console-panel";
import { GenerationPipelineCard } from "@/components/editor/generation-pipeline-card";
import { EditorLayout } from "@/components/editor/editor-layout";
import { EditorPreviewStage } from "@/components/editor/editor-preview-stage";
import { EditorPromptBar } from "@/components/editor/editor-prompt-bar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { scrollIntoViewRespectingMotion } from "@/lib/motion-prefs";
import {
  promptCategories,
  promptLibrary,
  STUDIO_MODES,
  STUDIO_SOURCE_BADGE,
  STUDIO_STEP_KEYS,
  useEditorStudio,
} from "@/hooks/use-editor-studio";
import type { MessageKey } from "@/lib/i18n/messages";
import type { PreviewConsoleEntry } from "@/lib/preview-console-bridge";
import { cn } from "@/lib/utils";

const CAT_ICON: Record<string, React.ReactNode> = {
  User: <Folder className="h-4 w-4" />,
  Globe: <Globe className="h-4 w-4" />,
  Wrench: <Wrench className="h-4 w-4" />,
  Gamepad2: <Gamepad2 className="h-4 w-4" />,
  LayoutDashboard: <LayoutDashboard className="h-4 w-4" />,
};

type BuilderStudioViewProps = {
  startTemplateId?: string;
};

export function BuilderStudioView({ startTemplateId }: BuilderStudioViewProps = {}) {
  return <BuilderStudioViewInner startTemplateId={startTemplateId} />;
}

function BuilderStudioViewInner({ startTemplateId }: BuilderStudioViewProps = {}) {
  const isMobile = useIsMobile();
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [consoleEntries, setConsoleEntries] = useState<PreviewConsoleEntry[]>([]);
  const [previewRefreshKey, setPreviewRefreshKey] = useState(0);
  const studio = useEditorStudio({ startTemplateId });

  const {
    t,
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
    handleSelectPrompt,
    handleNewChat,
    handleRestore,
    sourceLabel,
    handlePromptSubmit,
    handleApplyQualityPolishFix,
    handleFixWithAi,
  } = studio;

  const modeTabs = (
    <div className="mb-2 flex gap-1 rounded-lg border border-[var(--editor-border)] bg-[var(--editor-bg)] p-1">
      {STUDIO_MODES.map(({ mode, labelKey, hintKey }) => {
        const off = (mode !== "build" && !generatedCode) || isGenerating || isCancelling;
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
                : "text-[var(--editor-muted)]",
              off && "opacity-35",
            )}
            data-testid={`builder-mode-${mode}`}
          >
            {t(labelKey)}
          </button>
        );
      })}
    </div>
  );

  const promptBar = (
    <EditorPromptBar
      value={inputVal}
      onChange={setInputVal}
      onSubmit={handlePromptSubmit}
      busy={isGenerating || isCancelling}
      placeholder={
        isGenerating || isCancelling ? t("builder.inputWorking") : t("builder.inputPlaceholder")
      }
      prefix={modeTabs}
    />
  );

  const consolePanel = previewAllowJs ? (
    <EditorConsolePanel
      entries={consoleEntries}
      onClear={() => setConsoleEntries([])}
      onFixWithAi={handleFixWithAi}
      allowFix={Boolean(generatedCode) && !isGenerating}
    />
  ) : null;

  const desktopTemplatesSection = !isMobile ? (
    <>
      <div className="flex flex-wrap gap-1">
        {promptCategories.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setCurrentCategory(c.id)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-medium",
              currentCategory === c.id
                ? "bg-[var(--editor-hover)] text-[var(--editor-fg)]"
                : "text-[var(--editor-muted)] hover:bg-[var(--editor-hover)]",
            )}
          >
            {CAT_ICON[c.icon]}
            {t(`builder.category.${c.id}` as MessageKey)}
          </button>
        ))}
      </div>
      <details
        className="group rounded-lg border border-[var(--editor-border)] bg-[var(--editor-bg)]"
        open
      >
        <summary className="flex cursor-pointer list-none items-center justify-between px-3 py-2 text-xs font-semibold text-[var(--editor-fg)] marker:content-none">
          {t("builder.starterTemplates")}
          <ChevronDown className="h-4 w-4 text-[var(--editor-muted)] transition-transform group-open:rotate-180" />
        </summary>
        <div className="space-y-2 border-t border-[var(--editor-border)] p-3">
          {prompts.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => handleSelectPrompt(p)}
              className="w-full rounded-lg border border-[var(--editor-border)] bg-[var(--editor-panel)] p-2 text-left hover:border-primary/40"
              data-testid={`builder-template-${p.id}`}
            >
              <p className="text-xs font-semibold">
                {t(`builder.template.${p.id}.title` as MessageKey)}
              </p>
              <p className="mt-0.5 line-clamp-2 text-[11px] text-[var(--editor-muted)]">
                {t(`builder.template.${p.id}.description` as MessageKey)}
              </p>
            </button>
          ))}
        </div>
      </details>
    </>
  ) : null;

  const chatPanel = (
    <EditorChatPanel
      scrollRef={messagesEndRef}
      header={
        isMobile ? (
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-bold">{t("builder.workspaceTitle")}</h2>
              <p className="text-[11px] text-[var(--editor-muted)]">
                {modeHint ? t(modeHint) : ""}
              </p>
            </div>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              data-testid="builder-mobile-view-all"
              onClick={() => setTemplatesOpen(true)}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              {t("editor.templates.viewAll")}
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-bold">{t("builder.workspaceTitle")}</h2>
              <p className="text-[11px] text-[var(--editor-muted)]">
                {modeHint ? t(modeHint) : ""}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <span className="rounded-full border border-[var(--editor-border)] px-2 py-0.5 text-[10px] font-bold uppercase text-[var(--editor-muted)]">
                {t(`builder.mode.${generationMode}` as MessageKey)}
              </span>
              <Button size="sm" onClick={handleNewChat} data-testid="builder-new-application">
                <Plus className="h-4 w-4" /> {t("builder.newApplication")}
              </Button>
            </div>
          </div>
        )
      }
      footer={isMobile ? undefined : promptBar}
    >
      <div className="flex flex-col gap-3">
        {desktopTemplatesSection}
        {messages.map((m) => (
          <div
            key={m.id}
            className={cn(
              "max-w-[85%] text-sm motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-1 motion-safe:duration-200",
              m.sender === "user" ? "self-end" : "self-start",
            )}
          >
            <div
              className={cn(
                "rounded-xl px-3 py-2 leading-relaxed",
                m.sender === "user"
                  ? "rounded-br-none border border-primary/30 bg-primary/10"
                  : "rounded-bl-none border border-[var(--editor-border)] bg-[var(--editor-panel)]",
              )}
            >
              {m.text}
            </div>
          </div>
        ))}
        {isGenerating && (
          <GenerationPipelineCard
            className="max-w-[90%] self-start text-xs"
            title={stepStatusText}
            progress={Math.round((activeStep / Math.max(1, STUDIO_STEP_KEYS.length - 1)) * 100)}
            steps={STUDIO_STEP_KEYS.map((stepKey) => ({
              id: stepKey,
              label: t(stepKey),
            }))}
            activeIndex={activeStep}
            status="running"
            progressAriaLabel={t("loading.generationProgressAria")}
            onCancel={handleCancelGeneration}
            cancelLabel={t("builder.action.cancelGeneration")}
            cancelDisabled={isCancelling}
            cancelAriaLabel={t("builder.action.cancelGeneration")}
            testId="builder-generation-status"
          />
        )}
        {currentGenerationTrace && (
          <BuilderGenerationTracePanel
            trace={currentGenerationTrace}
            metrics={lastGenerationMetrics}
            health={lastHtmlHealthCheck}
            onApplyPolishFix={handleApplyQualityPolishFix}
          />
        )}
        {showCancelledNotice && !isGenerating && (
          <div
            className="max-w-[90%] self-start rounded-xl border border-[var(--editor-border)] px-3 py-2 text-xs text-[var(--editor-muted)]"
            data-testid="builder-cancelled-notice"
          >
            {t("builder.status.cancelled")}
          </div>
        )}
        {error && (
          <div
            className="flex gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
            data-testid="builder-mobile-error"
          >
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>
              <strong>{t("builder.errorPrefix")}</strong> {error}
            </span>
          </div>
        )}
        {!isMobile && consolePanel}
        {!isMobile && (
          <div className="border-t border-[var(--editor-border)] pt-3 text-[11px]">
            <span
              className={cn(
                "mr-2 inline-block h-2 w-2 rounded-full",
                hasAiAccess ? "bg-emerald-500" : "bg-amber-500",
              )}
            />
            {serverAiConfigured
              ? t("builder.serverAiReady")
              : hasByokAccess
                ? t("builder.byokReady")
                : t("builder.demoMode")}
          </div>
        )}
      </div>

      <Sheet open={templatesOpen} onOpenChange={setTemplatesOpen}>
        <SheetContent
          side="bottom"
          className="max-h-[85dvh] overflow-y-auto pb-[max(1.5rem,env(safe-area-inset-bottom,0px))]"
        >
          <SheetHeader>
            <SheetTitle>{t("builder.starterTemplates")}</SheetTitle>
          </SheetHeader>
          <div className="mt-4 grid gap-2">
            {promptLibrary.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  handleSelectPrompt(p);
                  setTemplatesOpen(false);
                }}
                className="min-h-11 rounded-lg border border-[var(--editor-border)] p-3 text-left"
                data-testid={`builder-template-${p.id}`}
              >
                <p className="text-sm font-semibold">
                  {t(`builder.template.${p.id}.title` as MessageKey)}
                </p>
              </button>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </EditorChatPanel>
  );

  const filesTab = (
    <button
      type="button"
      disabled
      title={t("builder.mobile.comingSoon")}
      data-testid="builder-tab-files"
      className="flex min-h-11 flex-1 flex-col items-center justify-center gap-1 py-3 text-xs font-semibold uppercase text-shell-muted opacity-50"
    >
      <FolderOpen className="h-3.5 w-3.5" />
      {t("builder.mobile.tabFiles")}
    </button>
  );

  const previewPanel = (
    <EditorPreviewStage console={isMobile ? consolePanel : undefined}>
      {risks.length > 0 && (
        <div className="flex gap-2 border-b border-amber-500/30 bg-amber-500/10 px-3 py-2 text-amber-600 dark:text-amber-400">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <div className="min-w-0 text-xs">
            <p className="font-semibold">{t("builder.securityWarning")}</p>
            <div className="mt-1 flex flex-wrap gap-1">
              {risks.map((r) => {
                const localized = localizeRisk(r.label, r.detail);
                return (
                  <span key={r.id} className="truncate rounded-full border px-2 py-0.5 text-[10px]">
                    {localized.label}: {localized.detail}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      )}
      <OutputPanel
        variant={isMobile ? "mobile" : "builder"}
        activeTab={previewTab}
        onTabChange={setPreviewTab}
        previewDoc={previewDoc}
        previewTitle={t("builder.previewFrameTitle")}
        previewRefreshKey={previewRefreshKey}
        onRefreshPreview={() => setPreviewRefreshKey((k) => k + 1)}
        showDeviceChrome={isMobile}
        extraTabs={isMobile ? filesTab : undefined}
        code={generatedCode}
        onCodeChange={(value) => {
          setGeneratedCode(value);
          setOutputSource(value.trim() ? "manual" : "empty");
        }}
        isEmpty={!generatedCode}
        showAllowJs={Boolean(generatedCode)}
        hasJs={previewHasJs}
        allowJs={previewAllowJs}
        onAllowJsChange={setPreviewAllowJs}
        onAllowJsBeforeEnable={() => {
          if (risks.length === 0) return true;
          return window.confirm(t("builder.previewJsRiskConfirm"));
        }}
        onConsoleEntry={
          previewAllowJs ? (entry) => setConsoleEntries((p) => [...p, entry]) : undefined
        }
        allowJsInputId="builder-preview-allow-js"
        allowJsTestId="builder-preview-allow-js"
        showCopy={Boolean(generatedCode)}
        copied={copied}
        copyTestId={isMobile ? "builder-mobile-copy-code" : "builder-copy"}
        onCopy={async () => {
          try {
            await navigator.clipboard.writeText(generatedCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          } catch {
            toast.error(t("result.code.copyFailed"));
          }
        }}
        showDownload={Boolean(generatedCode)}
        downloadFileName="vibecraft-application.html"
        downloadContent={generatedCode}
        downloadTestId="builder-download"
        headerActions={
          generatedCode ? (
            <div className="flex flex-wrap items-center gap-1.5">
              <span
                className={cn(
                  "rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase",
                  STUDIO_SOURCE_BADGE[outputSource],
                )}
              >
                {sourceLabel(outputSource)}
                {hasUnsaved ? t("builder.unsavedMarker") : ""}
              </span>
              {versions.length > 0 && (
                <div className="relative">
                  <RotateCcw className="pointer-events-none absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-[var(--editor-muted)]" />
                  <select
                    aria-label={t("builder.historyAria")}
                    value=""
                    onChange={(e) => handleRestore(e.target.value)}
                    className="h-8 w-28 rounded-md border border-[var(--editor-border)] bg-[var(--editor-bg)] pl-7 text-[11px]"
                  >
                    <option value="">
                      {t("builder.historyOption", { count: versions.length })}
                    </option>
                    {[...versions].reverse().map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.label}
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
              {isMobile && previewTab === "code" && (
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  data-testid="builder-mobile-run-preview"
                  onClick={() => {
                    setPreviewTab("preview");
                    scrollIntoViewRespectingMotion(messagesEndRef.current);
                  }}
                >
                  {t("builder.mobile.runPreview")}
                </Button>
              )}
            </div>
          ) : undefined
        }
      />
    </EditorPreviewStage>
  );

  return (
    <EditorLayout
      studioMode
      chatPanel={chatPanel}
      previewPanel={previewPanel}
      promptBar={isMobile ? promptBar : undefined}
      className="vibecraft-studio"
    />
  );
}
