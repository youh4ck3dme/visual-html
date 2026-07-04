"use client";

import { useEffect, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useT } from "@/hooks/use-t";
import {
  formatTraceDuration,
  traceHasFailedStep,
  type BuilderGenerationTrace,
  type BuilderTraceStep,
  type BuilderTraceStepId,
  type BuilderTraceStepStatus,
} from "@/lib/builder/generation-trace";
import type { BuilderGenerationMetrics } from "@/lib/builder/generation-metrics";
import {
  healthFindingMessageKey,
  healthFindingTitleKey,
  type HtmlHealthCategory,
  type HtmlHealthCheckResult,
  type HtmlHealthFinding,
  type HtmlHealthSeverity,
} from "@/lib/builder/html-health-check";
import { shouldOfferQualityPolishFix } from "@/lib/builder/quality-fix-prompts";
import { BUILDER_ORCHESTRATION_MODE_META } from "@/lib/builder/orchestration-mode";
import type { MessageKey } from "@/lib/i18n/messages";
import { cn } from "@/lib/utils";

const TRACE_STEP_KEYS: Record<BuilderTraceStepId, MessageKey> = {
  planning: "builder.trace.step.planning",
  building: "builder.trace.step.building",
  buildingA: "builder.trace.step.buildingA",
  buildingB: "builder.trace.step.buildingB",
  judging: "builder.trace.step.judging",
  reviewing: "builder.trace.step.reviewing",
  finalizing: "builder.trace.step.finalizing",
};

const TRACE_STATUS_KEYS: Record<BuilderTraceStepStatus, MessageKey> = {
  pending: "builder.trace.status.pending",
  running: "builder.trace.status.running",
  waitingToRetry: "builder.trace.waitingToRetry",
  retrying: "builder.trace.retrying",
  success: "builder.trace.status.success",
  failed: "builder.trace.status.failed",
  cancelled: "builder.trace.status.cancelled",
  skipped: "builder.trace.status.skipped",
};

const STATUS_CLASS: Record<BuilderTraceStepStatus, string> = {
  pending: "text-shell-muted",
  running: "text-primary",
  waitingToRetry: "text-amber-500",
  retrying: "text-amber-500",
  success: "text-emerald-500",
  failed: "text-destructive",
  cancelled: "text-amber-500",
  skipped: "text-shell-muted/70",
};

const HEALTH_CATEGORY_KEYS: Record<HtmlHealthCategory, MessageKey> = {
  structure: "builder.health.category.structure",
  security: "builder.health.category.security",
  accessibility: "builder.health.category.accessibility",
  responsive: "builder.health.category.responsive",
  motion: "builder.health.category.motion",
  visual: "builder.health.category.visual",
  javascript: "builder.health.category.javascript",
  parallax: "builder.health.category.parallax",
  performance: "builder.health.category.performance",
};

const HEALTH_SEVERITY_CLASS: Record<HtmlHealthSeverity, string> = {
  critical: "text-destructive",
  warning: "text-amber-500",
  info: "text-shell-muted",
};

type BuilderGenerationTracePanelProps = {
  trace: BuilderGenerationTrace;
  metrics?: BuilderGenerationMetrics | null;
  health?: HtmlHealthCheckResult | null;
  onApplyPolishFix?: () => void;
};

function TraceStepRow({ step }: { step: BuilderTraceStep }) {
  const { t } = useT();
  const showLastError =
    step.lastErrorMessage &&
    (step.status === "failed" ||
      step.status === "retrying" ||
      step.status === "waitingToRetry" ||
      (step.retryCount ?? 0) > 0);
  const statusLabel =
    step.timedOut && step.status === "failed"
      ? t("builder.trace.timedOut")
      : t(TRACE_STATUS_KEYS[step.status]);

  return (
    <div
      className="rounded-md border border-shell-border/60 bg-shell/40 px-2 py-1.5"
      data-testid={`builder-trace-step-${step.id}`}
      data-trace-status={step.status}
      data-trace-retry-count={step.retryCount ?? 0}
      data-trace-timed-out={step.timedOut ? "true" : "false"}
      data-trace-fallback-used={step.usedFallback ? "true" : "false"}
    >
      <div className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-2">
        <span className="truncate text-[11px] font-medium">{t(TRACE_STEP_KEYS[step.id])}</span>
        <span className={cn("text-[10px] font-semibold uppercase", STATUS_CLASS[step.status])}>
          {statusLabel}
        </span>
        <span
          className="text-[10px] tabular-nums text-shell-muted"
          data-testid={`builder-trace-duration-${step.id}`}
        >
          {formatTraceDuration(step.durationMs)}
          {(step.retryCount ?? 0) > 0 && step.status === "success" && (
            <span
              className="ml-1 text-amber-500/90"
              data-testid={`builder-trace-retried-${step.id}`}
            >
              · {t("builder.trace.retriedOnce")}
            </span>
          )}
        </span>
      </div>
      {step.status === "waitingToRetry" && step.retryDelayMs != null && (
        <p
          className="mt-1 text-[10px] text-amber-500/90"
          data-testid={`builder-trace-retry-delay-${step.id}`}
        >
          {t("builder.trace.retryDelay")}: {formatTraceDuration(step.retryDelayMs)}
        </p>
      )}
      {step.timedOut && step.timeoutMs != null && (
        <p
          className="mt-1 text-[10px] text-destructive/90"
          data-testid={`builder-trace-timeout-${step.id}`}
        >
          {t("builder.trace.timeoutAfter", {
            duration: formatTraceDuration(step.timeoutMs),
          })}
        </p>
      )}
      {step.usedFallback && (
        <p
          className="mt-1 text-[10px] text-amber-500/90"
          data-testid={`builder-trace-fallback-${step.id}`}
        >
          {t("builder.trace.fallbackUsed")}
        </p>
      )}
      {showLastError && (
        <p
          className="mt-1 truncate text-[10px] text-shell-muted"
          title={step.lastErrorMessage}
          data-testid={`builder-trace-last-error-${step.id}`}
        >
          {t("builder.trace.lastError")}: {step.lastErrorMessage}
        </p>
      )}
    </div>
  );
}

function MetricsSummary({ metrics }: { metrics: BuilderGenerationMetrics }) {
  const { t } = useT();
  const modeLabelKey = BUILDER_ORCHESTRATION_MODE_META[metrics.mode].labelKey;

  return (
    <div
      className="mb-2 flex flex-wrap gap-x-3 gap-y-1 rounded-md border border-shell-border/60 bg-shell/50 px-2 py-1.5 text-[10px] text-shell-muted"
      data-testid="builder-trace-metrics-summary"
    >
      <span>
        {t("builder.trace.mode")}:{" "}
        <span className="font-semibold text-foreground">{t(modeLabelKey)}</span>
      </span>
      {metrics.totalDurationMs != null && (
        <span>
          {t("builder.trace.total")}:{" "}
          <span className="font-semibold tabular-nums text-foreground">
            {formatTraceDuration(metrics.totalDurationMs)}
          </span>
        </span>
      )}
      <span data-testid="builder-metrics-ai-calls">
        {t("builder.metrics.aiCalls")}:{" "}
        <span className="font-semibold tabular-nums text-foreground">{metrics.totalAiCalls}</span>
      </span>
      <span data-testid="builder-metrics-retries">
        {t("builder.metrics.retries")}:{" "}
        <span className="font-semibold tabular-nums text-foreground">{metrics.totalRetries}</span>
      </span>
      <span data-testid="builder-metrics-timeouts">
        {t("builder.metrics.timeouts")}:{" "}
        <span className="font-semibold tabular-nums text-foreground">{metrics.totalTimeouts}</span>
      </span>
      <span data-testid="builder-metrics-fallbacks">
        {t("builder.metrics.fallbacks")}:{" "}
        <span className="font-semibold tabular-nums text-foreground">{metrics.totalFallbacks}</span>
      </span>
    </div>
  );
}

function HealthChip({ label, active, testId }: { label: string; active: boolean; testId: string }) {
  return (
    <span
      data-testid={testId}
      className={cn(
        "rounded-full border px-2 py-0.5 text-[10px] font-medium",
        active
          ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-500"
          : "border-shell-border/70 bg-shell/40 text-shell-muted",
      )}
    >
      {label}
    </span>
  );
}

function HealthFindingRow({ finding }: { finding: HtmlHealthFinding }) {
  const { t } = useT();

  return (
    <div
      className="rounded-md border border-shell-border/50 bg-shell/30 px-2 py-1.5"
      data-testid={`builder-health-finding-${finding.id}`}
      data-health-severity={finding.severity}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-[11px] font-medium">
          {t(healthFindingTitleKey(finding.id))}
        </span>
        <span
          className={cn(
            "shrink-0 text-[10px] font-semibold uppercase",
            HEALTH_SEVERITY_CLASS[finding.severity],
          )}
        >
          {t(`builder.health.${finding.severity}`)}
        </span>
      </div>
      <p className="mt-0.5 text-[10px] text-shell-muted">
        {t(healthFindingMessageKey(finding.id))}
      </p>
      <p className="mt-0.5 text-[10px] text-shell-muted/80">
        {t(HEALTH_CATEGORY_KEYS[finding.category])}
      </p>
    </div>
  );
}

export function BuilderHtmlHealthPanel({
  health,
  onApplyPolishFix,
  className,
}: {
  health: HtmlHealthCheckResult;
  onApplyPolishFix?: () => void;
  className?: string;
}) {
  const { t } = useT();
  const shouldExpandDetails = health.criticalCount > 0 || health.score < 85;
  const [showDetails, setShowDetails] = useState(shouldExpandDetails);
  const showPolishFix = shouldOfferQualityPolishFix(health) && onApplyPolishFix;

  useEffect(() => {
    if (health.criticalCount > 0) {
      setShowDetails(true);
    }
  }, [health.criticalCount, health.checkedAt]);

  return (
    <div
      className={cn("mt-3 border-t border-shell-border/60 pt-3", className)}
      data-testid="builder-html-health"
      data-health-score={health.score}
      data-health-critical={health.criticalCount}
      data-health-expanded={showDetails ? "true" : "false"}
    >
      <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-shell-muted">
        <span className="font-semibold text-foreground">{t("builder.health.title")}</span>
        <span data-testid="builder-health-score">
          {t("builder.health.score")}:{" "}
          <span className="font-semibold tabular-nums text-foreground">{health.score}/100</span>
        </span>
        <span data-testid="builder-health-critical-count">
          {t("builder.health.critical")}:{" "}
          <span className="font-semibold tabular-nums text-destructive">
            {health.criticalCount}
          </span>
        </span>
        <span data-testid="builder-health-warning-count">
          {t("builder.health.warning")}:{" "}
          <span className="font-semibold tabular-nums text-amber-500">{health.warningCount}</span>
        </span>
        {health.profile && (
          <>
            <span data-testid="builder-health-profile">
              {t("builder.health.profile")}:{" "}
              <span className="font-semibold text-foreground">
                {t(health.profile.labelKey as MessageKey)}
              </span>
            </span>
            <span data-testid="builder-health-minimum-expected-score">
              {t("builder.health.minimumExpectedScore")}:{" "}
              <span className="font-semibold tabular-nums text-foreground">
                {health.profile.minimumScore}
              </span>
            </span>
          </>
        )}
      </div>

      <div className="mb-2 flex flex-wrap gap-1.5">
        <HealthChip
          label={t("builder.health.chip.viewport")}
          active={health.chips.viewport}
          testId="builder-health-chip-viewport"
        />
        <HealthChip
          label={t("builder.health.chip.reducedMotion")}
          active={health.chips.reducedMotion}
          testId="builder-health-chip-reduced-motion"
        />
        <HealthChip
          label={t("builder.health.chip.mediaQueries")}
          active={health.chips.mediaQueries}
          testId="builder-health-chip-media-queries"
        />
        <HealthChip
          label={t("builder.health.chip.cssVariables")}
          active={health.chips.cssVariables}
          testId="builder-health-chip-css-variables"
        />
        <HealthChip
          label={t("builder.health.chip.externalScripts")}
          active={health.chips.externalScripts}
          testId="builder-health-chip-external-scripts"
        />
      </div>

      {health.findings.length === 0 ? (
        <p className="text-[10px] text-emerald-500/90" data-testid="builder-health-no-issues">
          {t("builder.health.noIssues")}
        </p>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              className="text-[10px] font-medium text-primary hover:underline"
              data-testid="builder-health-details-toggle"
              onClick={() => setShowDetails((value) => !value)}
            >
              {showDetails ? t("builder.health.hideDetails") : t("builder.health.showDetails")}
            </button>
            {showPolishFix && (
              <button
                type="button"
                className="rounded-md border border-primary/30 bg-primary/10 px-2 py-1 text-[10px] font-medium text-primary hover:bg-primary/15"
                data-testid="builder-health-apply-polish-fix"
                title={t("builder.health.applyPolishFixHint")}
                onClick={onApplyPolishFix}
              >
                {t("builder.health.applyPolishFix")}
              </button>
            )}
          </div>
          {showDetails && (
            <div className="mt-2 space-y-1" data-testid="builder-health-findings">
              {health.findings.map((finding) => (
                <HealthFindingRow key={finding.id} finding={finding} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export function BuilderGenerationTracePanel({
  trace,
  metrics,
  health,
  onApplyPolishFix,
}: BuilderGenerationTracePanelProps) {
  const { t } = useT();
  const [openValue, setOpenValue] = useState("");
  const failed = traceHasFailedStep(trace);
  const hasCriticalHealth = (health?.criticalCount ?? 0) > 0;

  useEffect(() => {
    if (failed || hasCriticalHealth) {
      setOpenValue("trace");
    }
  }, [failed, hasCriticalHealth, trace]);

  return (
    <div
      className="max-w-[90%] self-start rounded-xl border border-shell-border/80 bg-shell-elevated/80 backdrop-blur-sm"
      data-testid="builder-generation-trace"
      data-trace-expanded={openValue === "trace" ? "true" : "false"}
      data-trace-failed={failed ? "true" : "false"}
    >
      <Accordion
        type="single"
        collapsible
        value={openValue}
        onValueChange={setOpenValue}
        className="px-3"
      >
        <AccordionItem value="trace" className="border-none">
          <AccordionTrigger
            className="py-2 text-[11px] font-semibold text-shell-muted hover:text-foreground hover:no-underline"
            data-testid="builder-generation-trace-trigger"
          >
            <span>{t("builder.trace.title")}</span>
          </AccordionTrigger>
          <AccordionContent className="pb-3">
            {metrics && <MetricsSummary metrics={metrics} />}
            <div className="space-y-1">
              {trace.steps.map((step) => (
                <TraceStepRow key={step.id} step={step} />
              ))}
            </div>
            {health && (
              <BuilderHtmlHealthPanel health={health} onApplyPolishFix={onApplyPolishFix} />
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
