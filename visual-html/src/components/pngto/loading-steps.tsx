import { AlertTriangle, Check, Loader2 } from "lucide-react";

import { PHASE_LABELS } from "@/lib/generation-diagnostics";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import type { GenerationPhase, GenerationSensor } from "@/types/generation";

export type LoadPhase = GenerationPhase | "refining";

const GENERATE_STEPS: { id: GenerationPhase; label: string }[] = [
  { id: "validating", label: "Validating input" },
  { id: "rate_limited_check", label: "Checking usage limits" },
  { id: "uploading_to_blob", label: "Preparing image for OCR" },
  { id: "ocr", label: "Reading screenshot text and structure" },
  { id: "synthesizing", label: "Generating semantic HTML and CSS" },
  { id: "json_repair", label: "Repairing structured output if needed" },
  { id: "sanitizing", label: "Preparing safe preview output" },
  { id: "done", label: "Done" },
];

export function LoadingSteps({ sensor }: { sensor: GenerationSensor }) {
  if (sensor.phase === "synthesizing" && sensor.message === "Applying your refinement...") {
    return (
      <div className="glass-inset space-y-3 px-4 py-3 text-sm text-muted-foreground">
        <div className="flex items-center gap-3">
          <Loader2 className="h-4 w-4 shrink-0 animate-spin text-primary" aria-hidden />
          <span className="truncate">Applying your refinement...</span>
          <span className="ml-auto tabular-nums text-foreground">{sensor.progress}%</span>
        </div>
        <Progress value={sensor.progress} aria-label="Refinement progress" />
      </div>
    );
  }

  const activeIndex = GENERATE_STEPS.findIndex((s) => s.id === sensor.phase);

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
            {PHASE_LABELS[sensor.phase]} · {sensor.message}
          </div>
          <div className="text-xs text-muted-foreground">
            Progress reflects completed pipeline phases, not a model timer.
          </div>
        </div>
        <span className="tabular-nums text-foreground">{sensor.progress}%</span>
      </div>
      <Progress value={sensor.progress} aria-label="Generation progress" />
      <ol className="space-y-2">
        {GENERATE_STEPS.map((step, i) => {
          const done = sensor.status === "success" || i < activeIndex;
          const active = i === activeIndex && sensor.status === "running";
          const failed = i === activeIndex && sensor.status === "failed";
          return (
            <li
              key={step.id}
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
              <span className="truncate">{step.label}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
