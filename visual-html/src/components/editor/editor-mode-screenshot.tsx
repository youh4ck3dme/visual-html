"use client";

import { Link, useNavigate } from "@tanstack/react-router";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { useCallback, useMemo, useState, type FormEvent } from "react";

import { OutputPanel } from "@/components/app/output-panel";
import { EditorChatPanel } from "@/components/editor/editor-chat-panel";
import { EditorDeviceFrame } from "@/components/editor/editor-device-frame";
import { EditorLayout } from "@/components/editor/editor-layout";
import { EditorPreviewStage } from "@/components/editor/editor-preview-stage";
import { EditorPromptBar } from "@/components/editor/editor-prompt-bar";
import {
  ImportInputPanel,
  TextInputPanel,
  UrlInputPanel,
} from "@/components/pngto/input-mode-panels";
import { AppWindow, ModeTabs, TopCreditBar } from "@/components/pngto/home-workspace";
import { ImagePreview } from "@/components/pngto/image-preview";
import { LoadingSteps } from "@/components/pngto/loading-steps";
import { RefinementBox } from "@/components/pngto/refinement-box";
import { UploadDropzone } from "@/components/pngto/upload-dropzone";
import { Button } from "@/components/ui/button";
import { useGenerationWorkflow } from "@/hooks/use-generation-workflow";
import { useIsMobile } from "@/hooks/use-mobile";
import { useT } from "@/hooks/use-t";
import { useProjects } from "@/hooks/use-projects";
import { localizedPhaseLabel } from "@/lib/i18n/helpers";
import type { InputMode } from "@/lib/input-mode";
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

  const inputPanels = (
    <>
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
    </>
  );

  const chatBody = (
    <div className="space-y-4">
      {isMobile ? (
        inputPanels
      ) : (
        <AppWindow mode={inputMode} onModeChange={setInputMode}>
          {inputPanels}
        </AppWindow>
      )}

      {!isMobile && !result && (
        <Button
          className="h-11 w-full bg-primary text-primary-foreground hover:bg-primary-hover"
          size="lg"
          disabled={(!image && !result) || busy}
          data-testid="generate-html"
          onClick={onPrimaryAction}
        >
          {primaryButtonLabel}
        </Button>
      )}

      {error && <DiagnosticErrorPanel error={error} onRetry={onRetry} />}
      {busy && <LoadingSteps sensor={sensor} />}
    </div>
  );

  const desktopFooter = !isMobile ? (
    result ? (
      <div className="p-3 sm:p-4">
        <RefinementBox onSubmit={onRefine} disabled={busy} />
      </div>
    ) : undefined
  ) : undefined;

  const promptBar = isMobile ? (
    result ? (
      <div className="space-y-2 p-3 sm:p-4">
        <RefinementBox onSubmit={onRefine} disabled={busy} />
      </div>
    ) : (
      <EditorPromptBar
        value=""
        onChange={() => undefined}
        onSubmit={handlePrimarySubmit}
        disabled={(!image && !result) || busy}
        busy={busy}
        submitLabel={primaryButtonLabel}
        testId="generate-html"
      />
    )
  ) : undefined;

  const chatPanel = (
    <EditorChatPanel
      header={isMobile ? <ModeTabs value={inputMode} onChange={setInputMode} /> : undefined}
      footer={desktopFooter}
    >
      {chatBody}
    </EditorChatPanel>
  );

  const previewPanel = (
    <EditorPreviewStage>
      {result ? (
        <div className="flex h-full flex-col overflow-y-auto p-3 sm:p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-medium">{t("index.generatedOutput")}</h2>
            <div className="flex items-center gap-2 text-xs">
              {saveNotice && (
                <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-emerald-700 dark:text-emerald-200">
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
          <OutputPanel
            variant="generation"
            previewDoc={previewDoc}
            html={result.html}
            css={result.css}
            javascript={result.javascript}
            showDownload
            downloadFileName="generated.html"
            notesContent={null}
          />
        </div>
      ) : (
        <EditorDeviceFrame className="h-full justify-center">
          <div className="flex min-h-[min(55dvh,480px)] flex-col items-center justify-center gap-2 p-6 text-center">
            <p className="text-sm font-semibold text-[var(--editor-fg)]">{t("editor.previewEmpty")}</p>
            <p className="max-w-xs text-xs text-[var(--editor-muted)]">{t("editor.previewEmptyHint")}</p>
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
    <div className="flex items-center gap-3 rounded-lg border border-[var(--editor-border)] p-3">
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
  const title = diagnostic?.title ?? error.message;

  return (
    <div
      role="alert"
      className="space-y-3 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive"
    >
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
