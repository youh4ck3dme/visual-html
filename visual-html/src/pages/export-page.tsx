import { getRouteApi, Link } from "@tanstack/react-router";
import { ArrowLeft, Check, Copy, Download } from "lucide-react";
import { useMemo, useState } from "react";

import { PreviewFrame } from "@/components/pngto/preview-frame";
import { TopCreditBar } from "@/components/pngto/home-workspace";
import { VisualSidebar } from "@/components/pngto/sidebar-nav";
import { Button } from "@/components/ui/button";
import { useProjects } from "@/hooks/use-projects";
import { useT } from "@/hooks/use-t";
import { buildProjectExportHtml, projectExportFilename } from "@/lib/project-export";
import { downloadTextFile } from "@/lib/utils/download";

const exportRouteApi = getRouteApi("/export/$projectId");

export function ExportPage() {
  const { t } = useT();
  const { projectId } = exportRouteApi.useParams();
  const { getProject } = useProjects();
  const project = getProject(projectId);
  const [copied, setCopied] = useState(false);

  const exportHtml = useMemo(
    () => (project ? buildProjectExportHtml(project.result, project.name) : ""),
    [project],
  );

  if (!project) {
    return (
      <div className="visual-shell min-h-dvh">
        <VisualSidebar />
        <div className="min-h-dvh pb-[4.5rem] md:pl-16 md:pb-0">
          <TopCreditBar />
          <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
            <section className="shell-card p-8 text-center">
              <h1 className="text-lg font-semibold text-foreground">
                {t("export.notFound.title")}
              </h1>
              <p className="mt-2 text-sm text-shell-muted">{t("export.notFound.description")}</p>
              <Button asChild className="mt-6" variant="outline">
                <Link to="/projects" data-testid="export-back-to-projects">
                  {t("export.backToProjects")}
                </Link>
              </Button>
            </section>
          </main>
        </div>
      </div>
    );
  }

  const copyHtml = async () => {
    try {
      await navigator.clipboard.writeText(exportHtml);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  };

  const downloadHtml = () => {
    downloadTextFile(projectExportFilename(project.name), exportHtml);
  };

  return (
    <div className="visual-shell min-h-dvh">
      <VisualSidebar />
      <div className="min-h-dvh pb-[4.5rem] md:pl-16 md:pb-0">
        <TopCreditBar />
        <main className="mx-auto max-w-5xl px-4 py-6 pb-8 sm:px-6 sm:py-10">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-lg font-semibold text-foreground">
                {t("export.title", { name: project.name })}
              </h1>
              <p className="mt-1 text-sm text-shell-muted">{t("export.subtitle")}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={copyHtml} data-testid="export-copy-html">
                {copied ? (
                  <Check className="h-4 w-4" aria-hidden />
                ) : (
                  <Copy className="h-4 w-4" aria-hidden />
                )}
                {copied ? t("export.copied") : t("export.copyHtml")}
              </Button>
              <Button variant="outline" onClick={downloadHtml} data-testid="export-download-html">
                <Download className="h-4 w-4" aria-hidden />
                {t("export.downloadHtml")}
              </Button>
              <Button asChild variant="outline" data-testid="export-back-to-project">
                <Link to="/projects/$projectId" params={{ projectId: project.id }}>
                  <ArrowLeft className="h-4 w-4" aria-hidden />
                  {t("export.backToProject")}
                </Link>
              </Button>
            </div>
          </div>

          <section className="shell-card p-4" data-testid="export-preview">
            <PreviewFrame
              srcDoc={exportHtml}
              allowJs={false}
              title={t("export.previewTitle", { name: project.name })}
              className="h-130"
            />
          </section>
        </main>
      </div>
    </div>
  );
}
