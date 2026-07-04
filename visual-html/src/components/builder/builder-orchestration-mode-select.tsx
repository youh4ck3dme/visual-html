"use client";

import { useEffect, useState } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { useT } from "@/hooks/use-t";
import {
  BUILDER_ORCHESTRATION_MODE_EVENT,
  BUILDER_ORCHESTRATION_MODE_META,
  BUILDER_ORCHESTRATION_MODES,
  confirmBeastMode,
  getBuilderOrchestrationMode,
  hasBeastModeBeenConfirmed,
  saveBuilderOrchestrationMode,
  type BuilderOrchestrationMode,
} from "@/lib/builder/orchestration-mode";

type BuilderOrchestrationModeSelectProps = {
  value?: BuilderOrchestrationMode;
  onChange?: (mode: BuilderOrchestrationMode) => void;
};

export function BuilderOrchestrationModeSelect({
  value,
  onChange,
}: BuilderOrchestrationModeSelectProps) {
  const { t } = useT();
  const [mode, setMode] = useState<BuilderOrchestrationMode>(value ?? "pro");
  const [beastConfirmOpen, setBeastConfirmOpen] = useState(false);

  useEffect(() => {
    if (value) {
      setMode(value);
      return;
    }
    setMode(getBuilderOrchestrationMode());
  }, [value]);

  useEffect(() => {
    const syncMode = (event: Event) => {
      const detail = (event as CustomEvent<BuilderOrchestrationMode>).detail;
      if (detail) setMode(detail);
    };

    window.addEventListener(BUILDER_ORCHESTRATION_MODE_EVENT, syncMode);
    return () => window.removeEventListener(BUILDER_ORCHESTRATION_MODE_EVENT, syncMode);
  }, []);

  function applyMode(nextMode: BuilderOrchestrationMode) {
    setMode(nextMode);
    saveBuilderOrchestrationMode(nextMode);
    onChange?.(nextMode);
  }

  function handleChange(nextMode: BuilderOrchestrationMode) {
    if (nextMode === "beast" && !hasBeastModeBeenConfirmed()) {
      setBeastConfirmOpen(true);
      return;
    }
    applyMode(nextMode);
  }

  function confirmBeastSelection() {
    confirmBeastMode();
    applyMode("beast");
    setBeastConfirmOpen(false);
  }

  const selectedMeta = BUILDER_ORCHESTRATION_MODE_META[mode];

  return (
    <>
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <Label htmlFor="builder-orchestration-mode">
            {t("builder.settings.orchestrationMode")}
          </Label>
          <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-xs text-primary">
            {t(selectedMeta.badgeKey)}
          </span>
        </div>

        <select
          id="builder-orchestration-mode"
          value={mode}
          onChange={(event) => handleChange(event.target.value as BuilderOrchestrationMode)}
          className="h-9 w-full rounded-md border border-shell-border bg-shell px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
          data-testid="builder-orchestration-mode"
        >
          {BUILDER_ORCHESTRATION_MODES.map((item) => {
            const meta = BUILDER_ORCHESTRATION_MODE_META[item];
            return (
              <option key={item} value={item} className="bg-shell text-shell-foreground">
                {t(meta.labelKey)} — {t(meta.callsKey)}
              </option>
            );
          })}
        </select>

        <p className="text-[11px] leading-relaxed text-shell-muted">
          {t(selectedMeta.descriptionKey)}
        </p>
        {selectedMeta.warningKey ? (
          <p className="text-[11px] leading-relaxed text-amber-500/90">
            {t(selectedMeta.warningKey)}
          </p>
        ) : null}
      </div>

      <AlertDialog open={beastConfirmOpen} onOpenChange={setBeastConfirmOpen}>
        <AlertDialogContent className="border-shell-border bg-shell-elevated">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("builder.settings.orchestration.beastConfirmTitle")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("builder.settings.orchestration.beastConfirmDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {t("builder.settings.orchestration.beastConfirmCancel")}
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmBeastSelection}>
              {t("builder.settings.orchestration.beastConfirmAction")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
