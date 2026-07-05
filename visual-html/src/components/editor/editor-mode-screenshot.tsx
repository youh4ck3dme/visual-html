"use client";

import { Link, useNavigate } from "@tanstack/react-router";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { useCallback, useMemo, useState, type FormEvent, type ReactNode } from "react";

import { OutputPanel } from "@/components/app/output-panel";
import { BuilderHtmlHealthPanel } from "@/components/builder/builder-generation-trace";
import { EditorChatPanel } from "@/components/editor/editor-chat-panel";
import { EditorDeviceFrame } from "@/components/editor/editor-device-frame";
import { EditorLayout } from "@/components/editor/editor-layout";
import { EditorPreviewStage } from "@/components/editor/editor-preview-stage";
import { EditorPromptBar } from "@/components/editor/editor-prompt-bar";
import { ScreenshotChatBubble } from "@/components/editor/editor-screenshot-chat-bubble";
import { PreviewSkeleton } from "@/components/editor/preview-skeleton";
import {
  ImportInputPanel,
  TextInputPanel,
  UrlInputPanel,
} from "@/components/pngto/input-mode-panels";
import { ModeTabs, TopCreditBar } from "@/components/pngto/home-workspace";
import { ImagePreview } from "@/components/pngto/image-preview";
import { LoadingSteps } from "@/components/pngto/loading-steps";
import { RefinementBox } from "@/components/pngto/refinement-box";
import { UploadDropzone } from "@/components/pngto/upload-dropzone";
import { Button } from "@/components/ui/button";
import { useGenerationWorkflow } from "@/hooks/use-generation-workflow";
import { useIphoneViewportProfile } from "@/hooks/use-iphone-viewport-profile";
import { useIsMobile } from "@/hooks/use-mobile";
import { useT } from "@/hooks/use-t";
import { useProjects } from "@/hooks/use-projects";
import { localizedDiagnosticTitle, localizedPhaseLabel } from "@/lib/i18n/helpers";
import { runHtmlHealthCheck } from "@/lib/builder/html-health-check";
import { resolveQualityPolishFixPrompt } from "@/lib/builder/quality-fix-prompts";
import type { InputMode } from "@/lib/input-mode";
import { validateJsxSnippet } from "@/lib/validation/jsx-validator.stub";
import { buildSingleFileHtml } from "@/lib/utils/build-single-file-html";
import type { SavedProject } from "@/types/project";
import type { ApiError } from "@/types/generation";

type EditorModeScreenshotProps = {
  /** Load an existing project from the URL search param. */
  projectId?: string;
  /** @deprecated Use `projectId` instead. */
  projectIdFromUrl?: string;
};

export function EditorModeScreenshot({ projectId, projectIdFromUrl }: EditorModeScreenshotProps) {
  const { t } = useT();
  const isMobile = useIsMobile();
  const iphoneProfile = useIphoneViewportProfile();
  const navigate = useNavigate();
  const { importProjects } = useProjects();
  const workflow = useGenerationWorkflow(projectId ?? projectIdFromUrl);
  const [inputMode, setInputMode] = useState<InputMode>("upload");

  const {
    image,
    loadedProject,
    activeProjectId,
    options,
    setOptions,
    result,
    error,
    sensor,
    saveNotice,
    busy,
    primaryButtonLabel,
    onFileUploaded,
    onUploadError,
    onForensicGenerate,
    onRemoveImage,
    resetForNewImage,
    onPrimaryAction,
    onRetry,
    onRefine,
  } = workflow;

  const previewDoc = useMemo(
    () =>
      result
        ? buildSingleFileHtml(
            { html: result.html, css: result.css, javascript: result.javascript },
            { allowJs: false },
          )
        : "",
    [result],
  );

  const htmlHealth = useMemo(
    () => (previewDoc ? runHtmlHealthCheck(previewDoc) : null),
    [previewDoc],
  );

  const jsxValidationWarning = useMemo(() => {
    if (!result || options.outputMode !== "component") return null;
    const validation = validateJsxSnippet(result.html);
    return validation.ok ? null : validation.error;
  }, [options.outputMode, result]);

  const handleDescription = useCallback(
    (description: string) => {
      setOptions({ ...options, additionalInstructions: description });
    },
    [options, setOptions],
  );

  const handleImportProjects = useCallback(
    async (projects: SavedProject[]) => {
      const importedId = await importProjects(projects);
      if (importedId) {
        void navigate({ to: "/", search: { project: importedId } });
      }
      return importedId;
    },
    [importProjects, navigate],
  );

  const handlePrimarySubmit = (e: FormEvent) => {
    e.preventDefault();
    onPrimaryAction();
  };

  const showInputPanel = !busy;

  const inputPanels = showInputPanel ? (
    <div className="rounded-xl border border-[var(--editor-border)] bg-[var(--editor-bg)] p-3">
      {image ? (
        <ImagePreview
          image={image}
          options={options}
          busy={busy}
          onForensicGenerate={onForensicGenerate}
          onRemove={onRemoveImage}
        />
      ) : loadedProject ? (
        <LoadedProjectBanner project={loadedProject} onClear={resetForNewImage} />
      ) : inputMode === "upload" ? (
        <UploadDropzone onFile={onFileUploaded} onError={onUploadError} />
      ) : inputMode === "url" ? (
        <UrlInputPanel onFile={onFileUploaded} onError={onUploadError} />
      ) : inputMode === "text" ? (
        <TextInputPanel
          onFile={onFileUploaded}
          onError={onUploadError}
          onDescription={handleDescription}
        />
      ) : (
        <ImportInputPanel onImported={handleImportProjects} onError={onUploadError} />
      )}
    </div>
  ) : null;

  const chatTimeline = useMemo(() => {
    const items: ReactNode[] = [];

    if (image) {
      items.push(
        <ScreenshotChatBubble key="upload" sender="user" testId="screenshot-chat-upload">
          {t("index.chat.uploaded", { fileName: image.file.name })}
        </ScreenshotChatBubble>,
      );
    }

    if (busy) {
      items.push(
        <ScreenshotChatBubble key="progress" sender="ai" testId="screenshot-chat-progress">
          <LoadingSteps sensor={sensor} />
        </ScreenshotChatBubble>,
      );
    }

    if (error) {
      items.push(
        <ScreenshotChatBubble key="error" sender="ai" testId="screenshot-chat-error">
          <DiagnosticErrorPanel error={error} onRetry={onRetry} />
        </ScreenshotChatBubble>,
      );
    }

    if (result && !busy) {
      items.push(
        <ScreenshotChatBubble key="done" sender="ai" testId="screenshot-chat-done">
          <p>{t("index.chat.generationComplete")}</p>
        </ScreenshotChatBubble>,
      );
    }

    return items;
  }, [busy, error, image, onRetry, result, sensor, t]);

  const generatePromptBar = (
    <EditorPromptBar
      value=""
      onChange={() => undefined}
      onSubmit={handlePrimarySubmit}
      disabled={(!image && !result) || busy}
      busy={busy}
      submitLabel={primaryButtonLabel}
      testId="generate-html"
    />
  );

  const refinementStrip = (
    <div className="space-y-2 p-3 sm:p-4">
      <RefinementBox onSubmit={onRefine} disabled={busy} />
    </div>
  );

  const desktopFooter = !isMobile ? (result ? refinementStrip : generatePromptBar) : undefined;

  const promptBar = isMobile ? (result ? refinementStrip : generatePromptBar) : undefined;

  const chatPanel = (
    <EditorChatPanel
      header={<ModeTabs value={inputMode} onChange={setInputMode} />}
      footer={desktopFooter}
    >
      <div className="flex flex-col gap-3">
        {inputPanels}
        {chatTimeline}
      </div>
    </EditorChatPanel>
  );

  const previewPanel = (
    <EditorPreviewStage>
      {result ? (
        <div className="motion-safe:animate-in motion-safe:fade-in motion-safe:duration-300 flex h-full flex-col overflow-y-auto p-3 sm:p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-medium">{t("index.generatedOutput")}</h2>
            <div className="flex items-center gap-2 text-xs">
              {saveNotice && (
                <span
                  className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-emerald-700 dark:text-emerald-200"
                  data-testid="index-save-notice"
                >
                  {saveNotice}
                </span>
              )}
              {activeProjectId && (
                <Link
                  to="/projects/$projectId"
                  params={{ projectId: activeProjectId }}
                  className="text-info hover:underline"
                >
                  {t("index.viewInProjects")}
                </Link>
              )}
              <button
                type="button"
                onClick={resetForNewImage}
                className="text-[var(--editor-muted)] hover:text-[var(--editor-fg)]"
              >
                {t("index.newUpload")}
              </button>
            </div>
          </div>
          {jsxValidationWarning && (
            <div
              className="mb-3 flex items-start gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-900 dark:text-amber-100"
              role="status"
              data-testid="jsx-validation-warning"
            >
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
              <p>{t("index.jsxValidation.warning", { error: jsxValidationWarning })}</p>
            </div>
          )}
          <OutputPanel
            variant="generation"
            previewDoc={previewDoc}
            html={result.html}
            css={result.css}
            javascript={result.javascript}
            showDownload
            downloadFileName="generated.html"
            notesContent={
              htmlHealth ? (
                <BuilderHtmlHealthPanel
                  health={htmlHealth}
                  onApplyPolishFix={() =>
                    onRefine(resolveQualityPolishFixPrompt("auto", result.html))
                  }
                />
              ) : null
            }
          />
        </div>
      ) : busy ? (
        <EditorDeviceFrame className="h-full justify-center" profile={iphoneProfile}>
          <PreviewSkeleton className="min-h-[min(55dvh,480px)]" />
        </EditorDeviceFrame>
      ) : (
        <EditorDeviceFrame className="h-full justify-center" profile={iphoneProfile}>
          <div className="flex min-h-[min(55dvh,480px)] flex-col items-center justify-center gap-2 p-6 text-center">
            <p className="text-sm font-semibold text-[var(--editor-fg)]">
              {t("editor.screenshot.emptyTitle")}
            </p>
            <p className="max-w-xs text-xs text-[var(--editor-muted)]">
              {t("editor.screenshot.emptyHint")}
            </p>
          </div>
        </EditorDeviceFrame>
      )}
    </EditorPreviewStage>
  );

  return (
    <EditorLayout
      topBar={<TopCreditBar />}
      chatPanel={chatPanel}
      previewPanel={previewPanel}
      promptBar={promptBar}
    />
  );
}

function LoadedProjectBanner({ project, onClear }: { project: SavedProject; onClear: () => void }) {
  const { t } = useT();
  return (
    <div className="flex items-center gap-3">
      <img src={project.thumbnailDataUrl} alt="" className="h-16 w-16 rounded-md object-cover" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{project.name}</p>
        <p className="text-xs text-[var(--editor-muted)]">
          {t("index.loadedProject.hint", { fileName: project.fileName })}
        </p>
      </div>
      <button
        type="button"
        onClick={onClear}
        className="text-xs text-[var(--editor-muted)]"
        data-testid="clear-loaded-project"
      >
        {t("index.loadedProject.clear")}
      </button>
    </div>
  );
}

function DiagnosticErrorPanel({ error, onRetry }: { error: ApiError; onRetry: () => void }) {
  const { t, locale } = useT();
  const diagnostic = error.diagnostic;
  const phase = error.phase ?? "failed";
  const title =
    localizedDiagnosticTitle(locale, error.code, diagnostic?.title ?? error.message, phase) ??
    error.message;

  return (
    <div role="alert" className="space-y-3 text-xs text-destructive">
      <div className="flex items-start gap-2">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
        <div>
          <div className="text-sm font-medium">{title}</div>
          <div>
            {t("index.error.phase")} {localizedPhaseLabel(locale, phase)}
          </div>
        </div>
      </div>
      {diagnostic?.retryable && (
        <Button size="sm" variant="outline" onClick={onRetry} data-testid="error-retry">
          <RotateCcw className="h-3.5 w-3.5" />
          {t("index.error.tryAgain")}
        </Button>
      )}
    </div>
  );
}
