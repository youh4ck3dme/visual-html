import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Crosshair,
  FileSearch,
  Loader2,
  Scan,
  Sparkles,
  Target,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import {
  analyzeImageForensics,
  buildForensicOptions,
  FORENSIC_PRESETS,
  ZONE_COLORS,
  type ForensicPreset,
  type ForensicZone,
  type ForensicsReport,
} from "@/lib/image-forensics";
import { cn } from "@/lib/utils";
import { formatBytes } from "@/lib/utils/download";
import type { GenerationOptions } from "@/types/generation";

export type ForensicLightboxProps = {
  open: boolean;
  onClose: () => void;
  src: string;
  alt: string;
  fileName?: string;
  width: number;
  height: number;
  fileSize?: number;
  options: GenerationOptions;
  busy?: boolean;
  onGenerate: (nextOptions: GenerationOptions) => void;
};

const WARNING_STYLES = {
  info: "border-info/30 bg-info/10 text-info",
  warn: "border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-100",
  critical: "border-destructive/40 bg-destructive/10 text-destructive",
} as const;

export function ForensicLightbox({
  open,
  onClose,
  src,
  alt,
  fileName,
  width,
  height,
  fileSize,
  options,
  busy = false,
  onGenerate,
}: ForensicLightboxProps) {
  const [report, setReport] = useState<ForensicsReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);
  const [fidelity, setFidelity] = useState(82);
  const [showHeatmap, setShowHeatmap] = useState(true);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setReport(null);
    setSelectedZoneId(null);
    void analyzeImageForensics(src, width, height, fileSize ?? 0)
      .then((data) => {
        setReport(data);
        setSelectedZoneId(
          data.zones.find((z) => z.type === "content")?.id ?? data.zones[0]?.id ?? null,
        );
      })
      .finally(() => setLoading(false));
  }, [open, src, width, height, fileSize]);

  const selectedZone = useMemo(
    () => report?.zones.find((z) => z.id === selectedZoneId) ?? null,
    [report, selectedZoneId],
  );

  const selectedPreset = useMemo(
    () => FORENSIC_PRESETS.find((p) => p.id === selectedPresetId) ?? null,
    [selectedPresetId],
  );

  const triggerGenerate = (mode: "full" | "region") => {
    const zone = mode === "region" ? selectedZone : null;
    const next = buildForensicOptions(options, fidelity, zone, selectedPreset);
    onGenerate(next);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent
        className={cn(
          "flex h-[min(92vh,880px)] max-h-[92vh] w-[min(96vw,1320px)] max-w-[min(96vw,1320px)] flex-col gap-0 overflow-hidden border-shell-border bg-shell p-0",
          "duration-300 motion-reduce:duration-0",
          "[&>button.absolute]:hidden",
        )}
      >
        <DialogTitle className="sr-only">Forensic screenshot analysis</DialogTitle>

        <header className="flex items-center justify-between border-b border-shell-border px-4 py-3">
          <div className="flex items-center gap-2">
            <FileSearch className="h-4 w-4 text-primary" aria-hidden />
            <div>
              <p className="text-sm font-semibold text-foreground">Forensic scan</p>
              <p className="text-[11px] text-shell-muted">
                {fileName} · {width}×{height}
                {fileSize != null ? ` · ${formatBytes(fileSize)}` : ""}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-md text-shell-muted hover:bg-shell-hover"
            aria-label="Close forensic view"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="grid min-h-0 flex-1 grid-cols-1 md:grid-cols-[220px_minmax(0,1fr)_250px]">
          {/* LEFT — what AI sees */}
          <aside className="flex min-h-0 flex-col border-b border-shell-border md:border-b-0 md:border-r">
            <div className="border-b border-shell-border px-3 py-2">
              <p className="text-[10px] font-bold uppercase tracking-wide text-shell-muted">
                Left · Structure
              </p>
            </div>
            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3">
              {loading && (
                <div className="flex items-center gap-2 text-xs text-shell-muted">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Scanning pixels…
                </div>
              )}

              {report && (
                <>
                  <p className="text-xs text-shell-muted">{report.aspectProfile}</p>

                  <div className="space-y-1.5">
                    <p className="text-[10px] font-bold uppercase text-shell-muted">UI zones</p>
                    {report.zones.map((zone) => (
                      <button
                        key={zone.id}
                        type="button"
                        onClick={() => setSelectedZoneId(zone.id)}
                        className={cn(
                          "w-full rounded-lg border px-2.5 py-2 text-left text-xs transition-colors",
                          selectedZoneId === zone.id
                            ? "border-primary bg-primary/10 text-foreground"
                            : "border-shell-border bg-shell-elevated hover:border-primary/40",
                        )}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold">{zone.label}</span>
                          <span className="text-[10px] text-shell-muted">{zone.confidence}%</span>
                        </div>
                        <p className="mt-0.5 text-[10px] text-shell-muted">{zone.detail}</p>
                      </button>
                    ))}
                  </div>

                  <div className="space-y-1.5">
                    <p className="text-[10px] font-bold uppercase text-shell-muted">OCR hints</p>
                    {report.ocrHints.map((hint) => (
                      <p key={hint} className="text-[11px] text-shell-muted">
                        · {hint}
                      </p>
                    ))}
                  </div>

                  <div className="space-y-1.5">
                    <p className="text-[10px] font-bold uppercase text-shell-muted">Warnings</p>
                    {report.warnings.length === 0 && (
                      <p className="text-[11px] text-emerald-600 dark:text-emerald-300">
                        No blockers detected.
                      </p>
                    )}
                    {report.warnings.map((w) => (
                      <div
                        key={w.id}
                        className={cn(
                          "rounded-md border px-2 py-1.5 text-[10px]",
                          WARNING_STYLES[w.severity],
                        )}
                      >
                        <div className="flex items-center gap-1 font-semibold">
                          <AlertTriangle className="h-3 w-3 shrink-0" />
                          {w.title}
                        </div>
                        <p className="mt-0.5 opacity-80">{w.detail}</p>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </aside>

          {/* CENTER — image + zones */}
          <main className="relative flex min-h-[240px] items-center justify-center bg-black/95 p-3 md:min-h-0">
            <div className="relative max-h-full max-w-full">
              <img
                src={src}
                alt={alt}
                className="max-h-[min(58vh,640px)] max-w-full object-contain"
              />
              {report && showHeatmap && (
                <div
                  className="pointer-events-none absolute inset-0 grid opacity-50"
                  style={{
                    gridTemplateColumns: `repeat(8, 1fr)`,
                    gridTemplateRows: `repeat(8, 1fr)`,
                  }}
                  aria-hidden
                >
                  {report.densityMap.map((v, i) => (
                    <div
                      key={i}
                      className="border border-white/5"
                      style={{ backgroundColor: `rgba(56,189,248,${v * 0.65})` }}
                    />
                  ))}
                </div>
              )}
              {report?.zones.map((zone) => (
                <button
                  key={zone.id}
                  type="button"
                  onClick={() => setSelectedZoneId(zone.id)}
                  aria-label={`Select zone: ${zone.label}`}
                  className={cn(
                    "absolute border-2 transition-all motion-safe:duration-200",
                    selectedZoneId === zone.id
                      ? "border-primary ring-2 ring-primary/50"
                      : "border-white/40 hover:border-primary/80",
                  )}
                  style={{
                    left: `${zone.bounds.x * 100}%`,
                    top: `${zone.bounds.y * 100}%`,
                    width: `${zone.bounds.w * 100}%`,
                    height: `${zone.bounds.h * 100}%`,
                    backgroundColor: ZONE_COLORS[zone.type],
                  }}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => setShowHeatmap((v) => !v)}
              className="absolute bottom-3 left-3 rounded-md border border-white/20 bg-black/60 px-2 py-1 text-[10px] text-white hover:bg-black/80"
            >
              <Scan className="mr-1 inline h-3 w-3" />
              Heatmap {showHeatmap ? "on" : "off"}
            </button>
          </main>

          {/* RIGHT — actions */}
          <aside className="flex min-h-0 flex-col border-t border-shell-border md:border-l md:border-t-0">
            <div className="border-b border-shell-border px-3 py-2">
              <p className="text-[10px] font-bold uppercase tracking-wide text-shell-muted">
                Right · Actions
              </p>
            </div>
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-3">
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase text-shell-muted">1-click presets</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {FORENSIC_PRESETS.map((preset) => (
                    <PresetButton
                      key={preset.id}
                      preset={preset}
                      active={selectedPresetId === preset.id}
                      onClick={() =>
                        setSelectedPresetId((id) => (id === preset.id ? null : preset.id))
                      }
                    />
                  ))}
                </div>
                {selectedPreset && (
                  <p className="text-[10px] text-shell-muted">{selectedPreset.focusHint}</p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase text-shell-muted">
                  <span>Fidelity</span>
                  <span>{fidelity}%</span>
                </div>
                <Slider
                  value={[fidelity]}
                  min={20}
                  max={100}
                  step={1}
                  onValueChange={([v]) => setFidelity(v)}
                  aria-label="Generation fidelity"
                />
                <p className="text-[10px] text-shell-muted">
                  {fidelity >= 85 ? "Pixel-perfect" : fidelity >= 55 ? "Balanced" : "Simplified"}
                </p>
              </div>

              {report && (
                <div className="rounded-lg border border-shell-border bg-shell-elevated px-3 py-2 text-[11px] text-shell-muted">
                  <p>
                    Est. tokens:{" "}
                    <span className="font-semibold text-foreground">
                      {report.tokenEstimate.min.toLocaleString()}–
                      {report.tokenEstimate.max.toLocaleString()}
                    </span>
                  </p>
                  <p className="mt-0.5">Est. time: ~{report.tokenEstimate.seconds}s</p>
                </div>
              )}

              {selectedZone && (
                <div className="rounded-lg border border-primary/30 bg-primary/5 px-3 py-2">
                  <p className="flex items-center gap-1 text-xs font-semibold text-primary">
                    <Target className="h-3.5 w-3.5" />
                    Target: {selectedZone.label}
                  </p>
                  <p className="mt-1 text-[10px] text-shell-muted">
                    Right panel locked to region-only generation.
                  </p>
                </div>
              )}

              <div className="space-y-2 pt-1">
                <Button
                  className="w-full"
                  disabled={busy || loading || !selectedZone}
                  onClick={() => triggerGenerate("region")}
                >
                  <Crosshair className="h-4 w-4" />
                  Generate this section
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  disabled={busy || loading}
                  onClick={() => triggerGenerate("full")}
                >
                  <Sparkles className="h-4 w-4" />
                  Generate full page
                </Button>
              </div>
            </div>
          </aside>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function PresetButton({
  preset,
  active,
  onClick,
}: {
  preset: ForensicPreset;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-lg border px-2 py-2 text-left text-[11px] transition-colors",
        active
          ? "border-primary bg-primary/10 font-semibold text-foreground"
          : "border-shell-border bg-shell-elevated hover:border-primary/40",
      )}
    >
      <span className="mr-1">{preset.icon}</span>
      {preset.label}
    </button>
  );
}
