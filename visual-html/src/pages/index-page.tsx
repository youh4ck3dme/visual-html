import { getRouteApi, Link } from "@tanstack/react-router";
import { AlertTriangle, RotateCcw, Sparkles } from "lucide-react";

import { useT } from "@/hooks/use-t";
import { useGenerationWorkflow } from "@/hooks/use-generation-workflow";
import {
  localizedDiagnosticDetail,
  localizedDiagnosticFix,
  localizedDiagnosticLikelyCause,
  localizedDiagnosticTitle,
  localizedPhaseLabel,
} from "@/lib/i18n/helpers";
import { CapabilityCards, TrustStrip } from "@/components/pngto/capability-cards";
import { AdvancedSettings, AppWindow, TopCreditBar } from "@/components/pngto/home-workspace";
import { VisualSidebar } from "@/components/pngto/sidebar-nav";
import { UploadDropzone } from "@/components/pngto/upload-dropzone";
import { ImagePreview } from "@/components/pngto/image-preview";
import { GenerationOptionsPanel } from "@/components/pngto/generation-options";
import { ResultTabs } from "@/components/pngto/result-tabs";
import { RefinementBox } from "@/components/pngto/refinement-box";
import { LoadingSteps } from "@/components/pngto/loading-steps";
import { Button } from "@/components/ui/button";
import type { SavedProject } from "@/types/project";
import type { ApiError } from "@/types/generation";

const indexRouteApi = getRouteApi("/");

export function IndexPage() {
  const { t } = useT();
  const { project: projectIdFromUrl } = indexRouteApi.useSearch();
  const workflow = useGenerationWorkflow(projectIdFromUrl);

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

  return (
    <div className="visual-shell min-h-dvh">
      <VisualSidebar />

      <div className="min-h-dvh pb-[4.5rem] md:pl-16 md:pb-0">
        <TopCreditBar />

        <main className="mx-auto max-w-5xl px-4 py-6 pb-8 sm:px-6 sm:py-10 sm:pb-16">
          <div className="relative">
            <AppWindow>
              <div className="space-y-5">
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
                ) : (
                  <UploadDropzone onFile={onFileUploaded} onError={onUploadError} />
                )}

                <AdvancedSettings>
                  <GenerationOptionsPanel value={options} onChange={setOptions} disabled={busy} />
                </AdvancedSettings>

                <Button
                  className="h-11 w-full bg-primary text-primary-foreground hover:bg-primary-hover"
                  size="lg"
                  disabled={(!image && !result) || busy}
                  data-testid="generate-html"
                  onClick={onPrimaryAction}
                >
                  <Sparkles className="h-4 w-4" aria-hidden />
                  {primaryButtonLabel}
                </Button>

                {error && <DiagnosticErrorPanel error={error} onRetry={onRetry} />}

                {busy && <LoadingSteps sensor={sensor} />}
              </div>
            </AppWindow>
          </div>

          {result && (
            <section className="mt-8 space-y-4 rounded-xl border border-shell-border bg-shell-elevated p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <h2 className="text-sm font-medium text-foreground">
                    {t("index.generatedOutput")}
                  </h2>
                  {saveNotice && (
                    <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:text-emerald-200">
                      {saveNotice}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {activeProjectId && (
                    <Link
                      to="/projects/$projectId"
                      params={{ projectId: activeProjectId }}
                      className="text-xs text-info hover:underline"
                    >
                      {t("index.viewInProjects")}
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={resetForNewImage}
                    className="text-xs text-shell-muted hover:text-foreground"
                  >
                    {t("index.newUpload")}
                  </button>
                </div>
              </div>
              <ResultTabs result={result} />
              <div className="border-t border-shell-border pt-4">
                <RefinementBox onSubmit={onRefine} disabled={busy} />
              </div>
            </section>
          )}

          {!result && !busy && <CapabilityCards />}
          <TrustStrip />
        </main>
      </div>
    </div>
  );
}

function LoadedProjectBanner({ project, onClear }: { project: SavedProject; onClear: () => void }) {
  const { t } = useT();

  return (
    <div className="workspace-panel flex items-center gap-3 p-3">
      <img src={project.thumbnailDataUrl} alt="" className="h-16 w-16 rounded-md object-cover" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-workspace-foreground">{project.name}</p>
        <p className="text-xs text-workspace-muted">
          {t("index.loadedProject.hint", { fileName: project.fileName })}
        </p>
      </div>
      <button
        type="button"
        onClick={onClear}
        className="shrink-0 text-xs text-workspace-muted hover:text-workspace-foreground"
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
    diagnostic && error.code
      ? localizedDiagnosticTitle(locale, error.code, diagnostic.title, phase)
      : (diagnostic?.title ?? error.message);
  const detail =
    diagnostic && error.code
      ? localizedDiagnosticDetail(locale, error.code, diagnostic.detail ?? error.message, phase)
      : (diagnostic?.detail ?? error.message);
  const likelyCause =
    diagnostic && error.code && diagnostic.likelyCause
      ? localizedDiagnosticLikelyCause(locale, error.code, diagnostic.likelyCause, phase)
      : diagnostic?.likelyCause;
  const suggestedFix =
    diagnostic && error.code
      ? localizedDiagnosticFix(locale, error.code, diagnostic.suggestedFix)
      : diagnostic?.suggestedFix;

  return (
    <div
      role="alert"
      className="space-y-3 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive"
    >
      <div className="flex items-start gap-2">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
        <div className="min-w-0 space-y-1">
          <div className="text-sm font-medium">{title}</div>
          <div className="text-destructive/80">
            {t("index.error.phase")} {localizedPhaseLabel(locale, phase)}
          </div>
        </div>
      </div>

      <div className="space-y-2 text-destructive/90">
        <p>{detail}</p>
        {likelyCause && (
          <p>
            {t("index.error.likelyCause")} {likelyCause}
          </p>
        )}
        {suggestedFix && (
          <p>
            {t("index.error.suggestedFix")} {suggestedFix}
          </p>
        )}
      </div>

      {diagnostic?.retryable && (
        <Button
          size="sm"
          variant="outline"
          className="h-8 border-destructive/30 bg-workspace-surface text-destructive hover:bg-destructive/10"
          onClick={onRetry}
          data-testid="error-retry"
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden />
          {t("index.error.tryAgain")}
        </Button>
      )}
    </div>
  );
}
