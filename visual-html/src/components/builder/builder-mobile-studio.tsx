import {
  ArrowRight,
  Code,
  Eye,
  LayoutGrid,
  Menu,
  MoreHorizontal,
  Play,
  RefreshCw,
  Smartphone,
  Square,
  Type,
  ImageIcon,
} from "lucide-react";
import type { FormEvent, ReactNode } from "react";

import { AppLogo } from "@/components/pngto/app-logo";
import { PreviewFrame } from "@/components/pngto/preview-frame";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useT } from "@/hooks/use-t";
import type { MessageKey } from "@/lib/i18n/messages";
import type { PromptItem } from "@/lib/builder/prompt-library";
import { cn } from "@/lib/utils";

const TEMPLATE_PREVIEW: Record<string, string> = {
  "photo-portfolio": "from-amber-950/80 via-stone-900 to-black",
  "wordpress-landing": "from-teal-900/70 via-emerald-950 to-black",
  "kanban-board": "from-fuchsia-950/60 via-zinc-900 to-black",
  "memory-game": "from-violet-950/70 via-zinc-900 to-black",
  "snake-game": "from-green-950/70 via-zinc-900 to-black",
  "tic-tac-toe": "from-blue-950/70 via-zinc-900 to-black",
  "pomodoro-timer": "from-orange-950/70 via-zinc-900 to-black",
};

type BuilderMobileStudioProps = {
  prompts: PromptItem[];
  activeTemplateId: string | null;
  activeTemplateTitle: string | null;
  generationMode: string;
  previewTab: "preview" | "code";
  generatedCode: string;
  previewDoc: string;
  previewAllowJs: boolean;
  previewHasJs: boolean;
  isGenerating: boolean;
  isCancelling: boolean;
  inputVal: string;
  hasAiAccess: boolean;
  onSelectPrompt: (prompt: PromptItem) => void;
  onPreviewTab: (tab: "preview" | "code") => void;
  onInputChange: (value: string) => void;
  onSubmit: (e: FormEvent) => void;
  onOpenSettings: () => void;
};

export function BuilderMobileStudio({
  prompts,
  activeTemplateId,
  activeTemplateTitle,
  generationMode,
  previewTab,
  generatedCode,
  previewDoc,
  previewAllowJs,
  previewHasJs,
  isGenerating,
  isCancelling,
  inputVal,
  hasAiAccess,
  onSelectPrompt,
  onPreviewTab,
  onInputChange,
  onSubmit,
  onOpenSettings,
}: BuilderMobileStudioProps) {
  const { t } = useT();
  const featured = prompts.slice(0, 3);
  const isLive = Boolean(generatedCode.trim());

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="vibecraft-studio-elevated sticky top-0 z-20 flex items-center justify-between gap-2 border-b border-shell-border/80 px-3 py-2.5">
        <button
          type="button"
          className="grid h-9 w-9 place-items-center rounded-lg text-shell-muted"
          aria-label={t("nav.appAria")}
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex min-w-0 flex-1 items-center justify-center gap-2">
          <AppLogo size="xs" className="rounded-md" />
          <div className="min-w-0 text-center">
            <p className="truncate text-sm font-bold leading-tight">{t("builder.brand")}</p>
            <p className="text-[9px] font-semibold uppercase tracking-widest text-shell-muted">
              {t("builder.brandSubtitle")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground"
            aria-label={t("builder.mobile.runPreview")}
          >
            <Play className="h-4 w-4 fill-current" />
          </button>
          <button
            type="button"
            className="grid h-9 w-9 place-items-center rounded-lg text-shell-muted"
            onClick={() => onPreviewTab("code")}
            aria-label={t("builder.codeTab")}
          >
            <Code className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="grid h-9 w-9 place-items-center rounded-lg text-shell-muted"
            onClick={onOpenSettings}
            aria-label={t("builder.settingsAria")}
            data-testid="builder-settings"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
      </header>

      <div className="flex-1 space-y-4 overflow-y-auto px-3 py-4 pb-28">
        <div className="vibecraft-studio-elevated flex items-start justify-between gap-3 rounded-xl border border-shell-border/80 p-3">
          <div>
            <h2 className="text-sm font-bold">{t("builder.workspaceTitle")}</h2>
            <p className="mt-0.5 text-[11px] text-shell-muted">{t("builder.mode.buildHint")}</p>
          </div>
          <span className="shrink-0 rounded-full bg-primary px-2.5 py-1 text-[10px] font-bold uppercase text-primary-foreground">
            {t(`builder.mode.${generationMode}` as MessageKey)}
          </span>
        </div>

        <div className="vibecraft-studio-elevated rounded-xl border border-primary/25 bg-primary/5 p-3">
          <div className="flex gap-3">
            <AppLogo size="sm" className="rounded-lg" />
            <div>
              <p className="text-sm font-semibold text-foreground">{t("builder.mobile.aiReadyTitle")}</p>
              <p className="mt-1 text-[11px] leading-relaxed text-shell-muted">
                {t("builder.mobile.aiReadyHint")}
              </p>
            </div>
          </div>
        </div>

        <section>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-wide text-shell-muted">
              {t("builder.starterTemplates")}
            </p>
            <span className="text-[10px] font-medium text-primary">{t("builder.mobile.viewAll")}</span>
          </div>
          <div className="-mx-3 flex gap-2 overflow-x-auto px-3 pb-1">
            {featured.map((p, index) => {
              const active = activeTemplateId === p.id;
              const title = t(`builder.template.${p.id}.title` as MessageKey);
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => onSelectPrompt(p)}
                  data-testid={`builder-template-${p.id}`}
                  className={cn(
                    "w-36 shrink-0 overflow-hidden rounded-xl border text-left transition-colors",
                    active
                      ? "border-primary/50 ring-1 ring-primary/30"
                      : "border-shell-border/80 hover:border-primary/30",
                  )}
                >
                  <div
                    className={cn(
                      "relative h-24 bg-gradient-to-br",
                      TEMPLATE_PREVIEW[p.id] ?? "from-zinc-800 to-black",
                    )}
                  >
                    {index === 0 && (
                      <span className="absolute left-2 top-2 rounded-full bg-primary px-1.5 py-0.5 text-[8px] font-bold uppercase text-primary-foreground">
                        {t("builder.mobile.newBadge")}
                      </span>
                    )}
                  </div>
                  <p className="line-clamp-2 px-2 py-2 text-[10px] font-semibold leading-snug">{title}</p>
                </button>
              );
            })}
          </div>
        </section>

        {(activeTemplateTitle || isLive) && (
          <div className="vibecraft-studio-elevated flex items-center gap-2 rounded-xl border border-shell-border/80 px-3 py-2">
            <div className="h-10 w-10 shrink-0 rounded-lg bg-gradient-to-br from-amber-900 to-stone-950" />
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase text-shell-muted">{t("builder.mobile.activeProject")}</p>
              <p className="truncate text-xs font-semibold">
                {activeTemplateTitle ?? t("builder.mobile.untitledProject")}
              </p>
            </div>
            {isLive && (
              <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-500">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                {t("builder.mobile.live")}
              </span>
            )}
          </div>
        )}

        <section className="vibecraft-studio-elevated overflow-hidden rounded-xl border border-shell-border/80">
          <div className="flex border-b border-shell-border/80">
            {(
              [
                ["preview", t("builder.previewTab"), Eye],
                ["code", t("builder.codeTab"), Code],
                ["files", t("builder.mobile.tabFiles"), LayoutGrid, true],
                ["settings", t("builder.mobile.tabSettings"), MoreHorizontal, true],
              ] as const
            ).map(([tab, label, Icon, disabled]) => (
              <button
                key={tab}
                type="button"
                disabled={disabled}
                onClick={() => !disabled && onPreviewTab(tab as "preview" | "code")}
                data-testid={tab === "preview" || tab === "code" ? `builder-tab-${tab}` : undefined}
                className={cn(
                  "flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[9px] font-semibold uppercase",
                  previewTab === tab ? "border-b-2 border-primary text-primary" : "text-shell-muted",
                  disabled && "cursor-not-allowed opacity-40",
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between gap-2 border-b border-shell-border/80 px-3 py-2">
            <div className="flex items-center gap-1.5 text-[10px] font-medium text-shell-muted">
              <Smartphone className="h-3.5 w-3.5" />
              {t("builder.mobile.deviceIphone17Air")}
            </div>
            <button type="button" className="text-shell-muted" aria-label={t("builder.mobile.refreshPreview")}>
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="relative bg-workspace p-4">
            <FloatingToolbar />
            {!generatedCode ? (
              <div className="flex min-h-[420px] flex-col items-center justify-center gap-2 px-4 text-center">
                <Eye className="h-8 w-8 text-shell-muted opacity-40" />
                <p className="text-sm font-semibold">{t("builder.previewEmptyTitle")}</p>
                <p className="text-xs text-shell-muted">{t("builder.previewEmptyHint")}</p>
              </div>
            ) : previewTab === "preview" ? (
              <div className="mx-auto w-[min(100%,375px)] rounded-[2rem] border-[3px] border-[#3c4043] bg-black p-1.5 shadow-2xl">
                <div className="overflow-hidden rounded-[1.6rem] bg-white">
                  <PreviewFrame
                    srcDoc={previewDoc}
                    allowJs={previewAllowJs && previewHasJs}
                    title={t("builder.previewFrameTitle")}
                    className="h-[min(68dvh,640px)] w-full border-0"
                  />
                </div>
              </div>
            ) : (
              <Textarea
                aria-label={t("builder.codeEditorAria")}
                value={generatedCode}
                readOnly
                className="min-h-[420px] resize-none border-0 bg-shell font-mono text-[10px]"
              />
            )}
          </div>
        </section>

        {!hasAiAccess && (
          <p className="text-center text-[10px] text-amber-500">{t("builder.templatesOnly")}</p>
        )}
      </div>

      <form
        className="vibecraft-studio-elevated fixed inset-x-0 bottom-[4.5rem] z-20 border-t border-shell-border/80 px-3 py-2"
        onSubmit={onSubmit}
      >
        <div className="relative">
          <AppLogo size="xs" className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-md" />
          <Input
            value={inputVal}
            onChange={(e) => onInputChange(e.target.value)}
            disabled={isGenerating || isCancelling}
            placeholder={
              isGenerating || isCancelling ? t("builder.inputWorking") : t("builder.inputPlaceholder")
            }
            className="h-11 border-shell-border bg-shell pl-10 pr-12 text-sm"
          />
          <Button
            type="submit"
            size="icon"
            className="absolute right-1 top-1/2 h-9 w-9 -translate-y-1/2"
            disabled={!inputVal.trim() || isGenerating || isCancelling}
            data-testid="builder-send"
          >
            {isGenerating ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowRight className="h-4 w-4" />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

function FloatingToolbar() {
  const items: { icon: ReactNode; label: string }[] = [
    { icon: <Square className="h-3.5 w-3.5" />, label: "Box" },
    { icon: <Type className="h-3.5 w-3.5" />, label: "Text" },
    { icon: <ImageIcon className="h-3.5 w-3.5" />, label: "Image" },
    { icon: <Code className="h-3.5 w-3.5" />, label: "Code" },
    { icon: <LayoutGrid className="h-3.5 w-3.5" />, label: "Grid" },
  ];

  return (
    <div className="absolute right-2 top-1/2 z-10 flex -translate-y-1/2 flex-col gap-1 rounded-xl border border-shell-border/60 bg-shell-elevated/90 p-1 shadow-lg backdrop-blur-sm">
      {items.map((item) => (
        <button
          key={item.label}
          type="button"
          aria-label={item.label}
          className="grid h-8 w-8 place-items-center rounded-lg text-shell-muted hover:bg-shell-hover hover:text-foreground"
        >
          {item.icon}
        </button>
      ))}
    </div>
  );
}