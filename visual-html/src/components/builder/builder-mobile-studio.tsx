import { Link } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowRight,
  Check,
  Code,
  Copy,
  Eye,
  FolderKanban,
  LayoutGrid,
  Menu,
  MoreHorizontal,
  Play,
  Plus,
  RefreshCw,
  Smartphone,
  Square,
  Type,
  ImageIcon,
  Wand2,
  X,
} from "lucide-react";
import { useRef, useState, type FormEvent, type ReactNode } from "react";

import { AppLogo } from "@/components/pngto/app-logo";
import { PreviewFrame } from "@/components/pngto/preview-frame";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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

const MENU_ITEMS = [
  { id: "projects", labelKey: "nav.projects" as MessageKey, icon: FolderKanban, to: "/projects" as const },
  { id: "new", labelKey: "nav.new" as MessageKey, icon: Plus, to: "/" as const },
  { id: "builder", labelKey: "nav.builder" as MessageKey, icon: Wand2, to: "/builder" as const },
] as const;

type BuilderMobileStudioProps = {
  prompts: PromptItem[];
  allPrompts: PromptItem[];
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
  stepStatusText: string;
  error: string | null;
  showCancelledNotice: boolean;
  inputVal: string;
  hasAiAccess: boolean;
  onSelectPrompt: (prompt: PromptItem) => void;
  onPreviewTab: (tab: "preview" | "code") => void;
  onInputChange: (value: string) => void;
  onSubmit: (e: FormEvent) => void;
  onCancelGeneration: () => void;
  onOpenSettings: () => void;
};

export function BuilderMobileStudio({
  prompts,
  allPrompts,
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
  stepStatusText,
  error,
  showCancelledNotice,
  inputVal,
  hasAiAccess,
  onSelectPrompt,
  onPreviewTab,
  onInputChange,
  onSubmit,
  onCancelGeneration,
  onOpenSettings,
}: BuilderMobileStudioProps) {
  const { t } = useT();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showAllTemplates, setShowAllTemplates] = useState(false);
  const [previewRefreshKey, setPreviewRefreshKey] = useState(0);
  const [copied, setCopied] = useState(false);
  const templatesRef = useRef<HTMLElement>(null);
  const previewSectionRef = useRef<HTMLElement>(null);

  const featured = prompts.slice(0, 3);
  const visibleTemplates = showAllTemplates ? allPrompts : featured;
  const isLive = Boolean(generatedCode.trim());

  const handleRunPreview = () => {
    if (!isLive) return;
    onPreviewTab("preview");
    previewSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleRefreshPreview = () => {
    if (!isLive) return;
    setPreviewRefreshKey((key) => key + 1);
  };

  const handleViewAll = () => {
    setShowAllTemplates(true);
    templatesRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleCopyCode = async () => {
    if (!generatedCode.trim()) return;
    await navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col" data-testid="builder-mobile-studio">
      <header className="vibecraft-studio-elevated sticky top-0 z-20 flex items-center justify-between gap-2 border-b border-shell-border/80 px-3 py-2.5">
        <button
          type="button"
          className="grid h-9 w-9 place-items-center rounded-lg text-shell-muted"
          aria-label={t("builder.mobile.menuAria")}
          data-testid="builder-mobile-menu-trigger"
          onClick={() => setMenuOpen(true)}
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
            className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground disabled:opacity-40"
            aria-label={t("builder.mobile.runPreview")}
            data-testid="builder-mobile-run-preview"
            disabled={!isLive}
            onClick={handleRunPreview}
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

      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="left" className="border-shell-border bg-shell-elevated" data-testid="builder-mobile-menu">
          <SheetHeader>
            <SheetTitle>{t("builder.mobile.navTitle")}</SheetTitle>
            <SheetDescription>{t("nav.appAria")}</SheetDescription>
          </SheetHeader>
          <nav className="mt-6 flex flex-col gap-2" aria-label={t("nav.appAria")}>
            <Link
              to="/"
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-shell-hover"
              aria-label={t("nav.homeAria")}
              onClick={() => setMenuOpen(false)}
            >
              <AppLogo size="xs" className="rounded-md" />
              {t("nav.homeTitle")}
            </Link>
            {MENU_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.id}
                  to={item.to}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-shell-hover"
                  aria-label={t(item.labelKey)}
                  data-testid={`builder-mobile-nav-${item.id}`}
                  onClick={() => setMenuOpen(false)}
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden />
                  {t(item.labelKey)}
                </Link>
              );
            })}
          </nav>
        </SheetContent>
      </Sheet>

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

        {isGenerating && (
          <div
            className="vibecraft-studio-elevated rounded-xl border border-shell-border/80 p-3"
            data-testid="builder-generation-status"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="flex min-w-0 flex-1 items-center gap-2 text-xs font-medium text-primary">
                <RefreshCw
                  className={cn("h-4 w-4 shrink-0", !isCancelling && "animate-spin")}
                  aria-hidden
                />
                <span className="truncate">{stepStatusText}</span>
              </p>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="h-9 shrink-0 border-shell-border bg-shell px-2.5 text-[11px]"
                onClick={onCancelGeneration}
                disabled={isCancelling}
                data-testid="builder-cancel-generation"
                aria-label={t("builder.action.cancelGeneration")}
              >
                <X className="mr-1 h-3 w-3" aria-hidden />
                {t("builder.action.cancelGeneration")}
              </Button>
            </div>
          </div>
        )}

        {showCancelledNotice && !isGenerating && (
          <div
            className="rounded-xl border border-shell-border/80 bg-shell px-3 py-2 text-xs text-shell-muted"
            data-testid="builder-cancelled-notice"
          >
            {t("builder.status.cancelled")}
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="flex gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive"
            data-testid="builder-mobile-error"
          >
            <AlertCircle className="h-4 w-4 shrink-0" aria-hidden />
            <span>
              <strong>{t("builder.errorPrefix")}</strong> {error}
            </span>
          </div>
        )}

        <section ref={templatesRef}>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-wide text-shell-muted">
              {t("builder.starterTemplates")}
            </p>
            <button
              type="button"
              className="text-[10px] font-medium text-primary"
              aria-label={t("builder.mobile.viewAllAria")}
              data-testid="builder-mobile-view-all"
              onClick={handleViewAll}
            >
              {t("builder.mobile.viewAll")}
            </button>
          </div>
          <div className="-mx-3 flex gap-2 overflow-x-auto px-3 pb-1">
            {visibleTemplates.map((p, index) => {
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
                    {index === 0 && !showAllTemplates && (
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

        <section
          ref={previewSectionRef}
          className="vibecraft-studio-elevated overflow-hidden rounded-xl border border-shell-border/80"
        >
          <div className="flex border-b border-shell-border/80">
            <button
              type="button"
              onClick={() => onPreviewTab("preview")}
              data-testid="builder-tab-preview"
              className={cn(
                "flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[9px] font-semibold uppercase",
                previewTab === "preview" ? "border-b-2 border-primary text-primary" : "text-shell-muted",
              )}
            >
              <Eye className="h-3.5 w-3.5" />
              {t("builder.previewTab")}
            </button>
            <button
              type="button"
              onClick={() => onPreviewTab("code")}
              data-testid="builder-tab-code"
              className={cn(
                "flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[9px] font-semibold uppercase",
                previewTab === "code" ? "border-b-2 border-primary text-primary" : "text-shell-muted",
              )}
            >
              <Code className="h-3.5 w-3.5" />
              {t("builder.codeTab")}
            </button>
            <button
              type="button"
              disabled
              aria-disabled
              title={t("builder.mobile.tabFilesSoon")}
              data-testid="builder-tab-files"
              className="flex flex-1 cursor-not-allowed flex-col items-center gap-0.5 py-2.5 text-[9px] font-semibold uppercase text-shell-muted opacity-40"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              {t("builder.mobile.tabFiles")}
            </button>
            <button
              type="button"
              onClick={onOpenSettings}
              data-testid="builder-tab-settings"
              className="flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[9px] font-semibold uppercase text-shell-muted"
            >
              <MoreHorizontal className="h-3.5 w-3.5" />
              {t("builder.mobile.tabSettings")}
            </button>
          </div>

          <div className="flex items-center justify-between gap-2 border-b border-shell-border/80 px-3 py-2">
            <div className="flex items-center gap-1.5 text-[10px] font-medium text-shell-muted">
              <Smartphone className="h-3.5 w-3.5" />
              {t("builder.mobile.deviceIphone17Air")}
            </div>
            <button
              type="button"
              className="text-shell-muted disabled:opacity-40"
              aria-label={t("builder.mobile.refreshPreview")}
              data-testid="builder-mobile-refresh-preview"
              disabled={!isLive}
              onClick={handleRefreshPreview}
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="relative bg-[#202124] p-4">
            <FloatingToolbar comingSoonLabel={t("builder.mobile.comingSoon")} />
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
                    key={previewRefreshKey}
                    srcDoc={previewDoc}
                    allowJs={previewAllowJs && previewHasJs}
                    title={t("builder.previewFrameTitle")}
                    className="h-[min(68dvh,640px)] w-full border-0"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex justify-end">
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => void handleCopyCode()}
                    data-testid="builder-mobile-copy-code"
                  >
                    {copied ? (
                      <Check className="h-3.5 w-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                    {copied ? t("builder.copied") : t("builder.mobile.copyCode")}
                  </Button>
                </div>
                <Textarea
                  aria-label={t("builder.codeEditorAria")}
                  value={generatedCode}
                  readOnly
                  className="min-h-[420px] resize-none border-0 bg-shell font-mono text-[10px]"
                />
              </div>
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
            aria-label={t("builder.action.sendPrompt")}
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

function FloatingToolbar({ comingSoonLabel }: { comingSoonLabel: string }) {
  const items: { icon: ReactNode; label: string }[] = [
    { icon: <Square className="h-3.5 w-3.5" />, label: "Box" },
    { icon: <Type className="h-3.5 w-3.5" />, label: "Text" },
    { icon: <ImageIcon className="h-3.5 w-3.5" />, label: "Image" },
    { icon: <Code className="h-3.5 w-3.5" />, label: "Code" },
    { icon: <LayoutGrid className="h-3.5 w-3.5" />, label: "Grid" },
  ];

  return (
    <div
      className="absolute right-2 top-1/2 z-10 flex -translate-y-1/2 flex-col gap-1 rounded-xl border border-shell-border/60 bg-shell-elevated/90 p-1 shadow-lg backdrop-blur-sm"
      data-testid="builder-mobile-floating-toolbar"
    >
      {items.map((item) => (
        <button
          key={item.label}
          type="button"
          disabled
          aria-disabled
          aria-label={item.label}
          title={comingSoonLabel}
          className="grid h-8 w-8 cursor-not-allowed place-items-center rounded-lg text-shell-muted opacity-40"
        >
          {item.icon}
        </button>
      ))}
    </div>
  );
}