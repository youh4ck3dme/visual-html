import { AlertTriangle, Check, Loader2 } from "lucide-react";

import { useT } from "@/hooks/use-t";
import { localizedPhaseLabel } from "@/lib/i18n/helpers";
import type { MessageKey } from "@/lib/i18n/messages";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import type { GenerationPhase, GenerationSensor } from "@/types/generation";

export type LoadPhase = GenerationPhase | "refining";

const GENERATE_STEP_IDS: GenerationPhase[] = [
  "validating",
  "rate_limited_check",
  "uploading_to_blob",
  "ocr",
  "synthesizing",
  "json_repair",
  "sanitizing",
  "done",
];

function localizedSensorMessage(
  t: (key: MessageKey, params?: Record<string, string | number>) => string,
  sensor: GenerationSensor,
): string {
  if (sensor.phase === "synthesizing") {
    if (sensor.message === "Applying your refinement...") return t("phase.message.refining");
    if (sensor.message === "Continuing code generation...") return t("phase.message.continuing");
  }
  const key = `phase.message.${sensor.phase}` as MessageKey;
  return t(key);
}

export function LoadingSteps({ sensor }: { sensor: GenerationSensor }) {
  const { t, locale } = useT();

  if (sensor.phase === "synthesizing" && sensor.message === "Applying your refinement...") {
    return (
      <div className="glass-inset space-y-3 px-4 py-3 text-sm text-muted-foreground">
        <div className="flex items-center gap-3">
          <Loader2 className="h-4 w-4 shrink-0 animate-spin text-primary" aria-hidden />
          <span className="truncate">{t("phase.message.refining")}</span>
          <span className="ml-auto tabular-nums text-foreground">{sensor.progress}%</span>
        </div>
        <Progress value={sensor.progress} aria-label={t("loading.refinementProgressAria")} />
      </div>
    );
  }

  const activeIndex = GENERATE_STEP_IDS.findIndex((s) => s === sensor.phase);

  return (
    <div className="glass-inset space-y-3 px-4 py-3 text-sm" aria-live="polite">
      <div className="flex items-center gap-3">
        {sensor.status === "failed" ? (
          <AlertTriangle className="h-4 w-4 shrink-0 text-destructive" aria-hidden />
        ) : sensor.status === "success" ? (
          <Check className="h-4 w-4 shrink-0 text-primary" aria-hidden />
        ) : (
          <Loader2 className="h-4 w-4 shrink-0 animate-spin text-primary" aria-hidden />
        )}
        <div className="min-w-0 flex-1">
          <div className="truncate font-medium text-foreground">
            {localizedPhaseLabel(locale, sensor.phase)} · {localizedSensorMessage(t, sensor)}
          </div>
          <div className="text-xs text-muted-foreground">{t("loading.progressNote")}</div>
        </div>
        <span className="tabular-nums text-foreground">{sensor.progress}%</span>
      </div>
      <Progress value={sensor.progress} aria-label={t("loading.generationProgressAria")} />
      <ol className="space-y-2">
        {GENERATE_STEP_IDS.map((stepId, i) => {
          const done = sensor.status === "success" || i < activeIndex;
          const active = i === activeIndex && sensor.status === "running";
          const failed = i === activeIndex && sensor.status === "failed";
          const stepLabel = t(`loading.step.${stepId}` as MessageKey);
          return (
            <li
              key={stepId}
              className={cn(
                "flex items-center gap-3",
                active || failed ? "text-foreground" : "text-muted-foreground",
                !done && !active && !failed && "opacity-50",
              )}
            >
              {done ? (
                <Check className="h-4 w-4 shrink-0 text-primary" aria-hidden />
              ) : active ? (
                <Loader2 className="h-4 w-4 shrink-0 animate-spin text-primary" aria-hidden />
              ) : failed ? (
                <AlertTriangle className="h-4 w-4 shrink-0 text-destructive" aria-hidden />
              ) : (
                <span className="h-4 w-4 shrink-0 rounded-full border border-current" aria-hidden />
              )}
              <span className="truncate">{stepLabel}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
