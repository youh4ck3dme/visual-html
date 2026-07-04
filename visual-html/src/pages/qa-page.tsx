import { getRouteApi, Link } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { useMemo } from "react";

import { TopCreditBar } from "@/components/pngto/home-workspace";
import { VisualSidebar } from "@/components/pngto/sidebar-nav";
import { Button } from "@/components/ui/button";
import { useProjects } from "@/hooks/use-projects";
import { useT } from "@/hooks/use-t";
import type { MessageKey } from "@/lib/i18n/messages";
import { runProjectQa, type QaCheck, type QaStatus } from "@/lib/project-qa";
import { cn } from "@/lib/utils";

const qaRouteApi = getRouteApi("/qa/$projectId");

const CHECK_LABEL_KEYS: Record<string, MessageKey> = {
  "html-nonempty": "qa.check.htmlNonempty",
  "css-for-classes": "qa.check.cssForClasses",
  "viewport-meta": "qa.check.viewportMeta",
  "document-title": "qa.check.documentTitle",
  "image-alt": "qa.check.imageAlt",
  "external-resources": "qa.check.externalResources",
  "inline-scripts": "qa.check.inlineScripts",
  "output-size": "qa.check.outputSize",
  "generation-warnings": "qa.check.generationWarnings",
  "generation-assumptions": "qa.check.generationAssumptions",
};

const STATUS_STYLES: Record<QaStatus, string> = {
  pass: "border-emerald-500/40 bg-emerald-500/5",
  warn: "border-amber-500/40 bg-amber-500/5",
  fail: "border-destructive/40 bg-destructive/5",
};

function StatusIcon({ status }: { status: QaStatus }) {
  if (status === "pass") return <CheckCircle2 className="h-5 w-5 text-emerald-500" aria-hidden />;
  if (status === "warn") return <AlertTriangle className="h-5 w-5 text-amber-500" aria-hidden />;
  return <XCircle className="h-5 w-5 text-destructive" aria-hidden />;
}

function QaCard({ check, label }: { check: QaCheck; label: string }) {
  return (
    <article
      className={cn("rounded-lg border p-4", STATUS_STYLES[check.status])}
      data-testid={`qa-card-${check.id}`}
      data-qa-status={check.status}
    >
      <div className="flex items-start gap-3">
        <StatusIcon status={check.status} />
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-foreground">{label}</h3>
          <p className="mt-1 text-sm text-shell-muted">{check.detail}</p>
        </div>
      </div>
    </article>
  );
}

export function QaPage() {
  const { t } = useT();
  const { projectId } = qaRouteApi.useParams();
  const { getProject } = useProjects();
  const project = getProject(projectId);

  const checks = useMemo(
    () => (project ? runProjectQa(project.result, project.name) : []),
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
              <h1 className="text-lg font-semibold text-foreground">{t("qa.notFound.title")}</h1>
              <p className="mt-2 text-sm text-shell-muted">{t("qa.notFound.description")}</p>
              <Button asChild className="mt-6" variant="outline">
                <Link to="/projects" data-testid="qa-back-to-projects">
                  {t("qa.backToProjects")}
                </Link>
              </Button>
            </section>
          </main>
        </div>
      </div>
    );
  }

  const passCount = checks.filter((c) => c.status === "pass").length;
  const warnCount = checks.filter((c) => c.status === "warn").length;
  const failCount = checks.filter((c) => c.status === "fail").length;

  return (
    <div className="visual-shell min-h-dvh">
      <VisualSidebar />
      <div className="min-h-dvh pb-[4.5rem] md:pl-16 md:pb-0">
        <TopCreditBar />
        <main className="mx-auto max-w-5xl px-4 py-6 pb-8 sm:px-6 sm:py-10">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-lg font-semibold text-foreground">
                {t("qa.title", { name: project.name })}
              </h1>
              <p className="mt-1 text-sm text-shell-muted">
                {t("qa.summary", { pass: passCount, warn: warnCount, fail: failCount })}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="outline" data-testid="qa-back-to-project">
                <Link to="/projects/$projectId" params={{ projectId: project.id }}>
                  <ArrowLeft className="h-4 w-4" aria-hidden />
                  {t("qa.backToProject")}
                </Link>
              </Button>
              <Button asChild variant="outline" data-testid="qa-open-export">
                <Link to="/export/$projectId" params={{ projectId: project.id }}>
                  {t("qa.openExport")}
                </Link>
              </Button>
            </div>
          </div>

          <section className="grid gap-3" data-testid="qa-results">
            {checks.map((check) => (
              <QaCard
                key={check.id}
                check={check}
                label={t(CHECK_LABEL_KEYS[check.id] ?? "qa.check.unknown")}
              />
            ))}
          </section>
        </main>
      </div>
    </div>
  );
}
