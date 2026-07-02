import { Check, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

// Real pipeline phases the client can observe, each tied to an in-flight request.
export type LoadPhase = "ocr" | "synthesizing" | "refining";

const GENERATE_STEPS: { id: Exclude<LoadPhase, "refining">; label: string }[] = [
  { id: "ocr", label: "Reading text & structure from image (OCR)…" },
  { id: "synthesizing", label: "Generating semantic HTML & CSS…" },
];

export function LoadingSteps({ phase }: { phase: LoadPhase }) {
  if (phase === "refining") {
    return (
      <div className="glass-inset flex items-center gap-3 px-4 py-3 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 shrink-0 animate-spin text-primary" aria-hidden />
        <span className="truncate">Applying your refinement…</span>
      </div>
    );
  }

  const activeIndex = GENERATE_STEPS.findIndex((s) => s.id === phase);

  return (
    <ol className="glass-inset space-y-2 px-4 py-3 text-sm" aria-live="polite">
      {GENERATE_STEPS.map((step, i) => {
        const done = i < activeIndex;
        const active = i === activeIndex;
        return (
          <li
            key={step.id}
            className={cn(
              "flex items-center gap-3",
              active ? "text-foreground" : "text-muted-foreground",
              !done && !active && "opacity-50",
            )}
          >
            {done ? (
              <Check className="h-4 w-4 shrink-0 text-primary" aria-hidden />
            ) : active ? (
              <Loader2 className="h-4 w-4 shrink-0 animate-spin text-primary" aria-hidden />
            ) : (
              <span className="h-4 w-4 shrink-0 rounded-full border border-current" aria-hidden />
            )}
            <span className="truncate">{step.label}</span>
          </li>
        );
      })}
    </ol>
  );
}
