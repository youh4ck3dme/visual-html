"use client";

import { useState, type ReactNode, type RefObject } from "react";
import { Check, Code, Copy, Download, Eye, RefreshCw, Smartphone } from "lucide-react";
import { toast } from "sonner";

import { EditorDeviceFrame } from "@/components/editor/editor-device-frame";
import { CodeBlock } from "@/components/pngto/code-block";
import { PreviewFrame } from "@/components/pngto/preview-frame";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useT } from "@/hooks/use-t";
import { cn } from "@/lib/utils";
import { downloadTextFile } from "@/lib/utils/download";

type BuilderTab = "preview" | "code";

export type OutputPanelProps = {
  /** Full HTML document for iframe preview */
  previewDoc: string;
  previewTitle?: string;
  previewClassName?: string;

  /** Builder-style preview/code tabs (controlled) */
  activeTab?: BuilderTab;
  onTabChange?: (tab: BuilderTab) => void;
  tabTestIdPrefix?: string;

  /** Single editable code buffer (builder) */
  code?: string;
  onCodeChange?: (value: string) => void;
  codeReadOnly?: boolean;

  /** Split source tabs (generation result) */
  html?: string;
  css?: string;
  javascript?: string;
  notesContent?: ReactNode;

  /** JavaScript preview opt-in */
  showAllowJs?: boolean;
  hasJs?: boolean;
  allowJs?: boolean;
  onAllowJsChange?: (checked: boolean) => void;
  onAllowJsBeforeEnable?: () => boolean;
  allowJsInputId?: string;
  allowJsTestId?: string;

  /** Download / copy actions */
  showDownload?: boolean;
  downloadFileName?: string;
  downloadContent?: string;
  downloadTestId?: string;
  showCopy?: boolean;
  onCopy?: () => void | Promise<void>;
  copied?: boolean;
  copyTestId?: string;
  copyLabel?: string;

  /** Empty preview state */
  isEmpty?: boolean;
  emptyTitle?: string;
  emptyHint?: string;

  /** Extra toolbar content (badges, history, etc.) */
  headerActions?: ReactNode;

  /** Layout preset */
  variant?: "generation" | "builder" | "mobile";

  /** Mobile-only */
  previewRefreshKey?: number;
  previewSectionRef?: RefObject<HTMLElement | null>;
  onRefreshPreview?: () => void;
  showDeviceChrome?: boolean;
  extraTabs?: ReactNode;

  /** Preview console bridge callback */
  onConsoleEntry?: (entry: import("@/lib/preview-console-bridge").PreviewConsoleEntry) => void;

  className?: string;
};

export function OutputPanel({
  previewDoc,
  previewTitle,
  previewClassName,
  activeTab,
  onTabChange,
  tabTestIdPrefix = "builder-tab",
  code = "",
  onCodeChange,
  codeReadOnly = false,
  html,
  css,
  javascript,
  notesContent,
  showAllowJs = false,
  hasJs = false,
  allowJs: allowJsProp,
  onAllowJsChange,
  onAllowJsBeforeEnable,
  allowJsInputId = "output-preview-allow-js",
  allowJsTestId = "output-preview-allow-js",
  showDownload = false,
  downloadFileName = "generated.html",
  downloadContent,
  downloadTestId = "download-html",
  showCopy = false,
  onCopy,
  copied: copiedProp,
  copyTestId = "output-copy",
  copyLabel,
  isEmpty = false,
  emptyTitle,
  emptyHint,
  headerActions,
  variant = "builder",
  previewRefreshKey,
  previewSectionRef,
  onRefreshPreview,
  showDeviceChrome = false,
  extraTabs,
  onConsoleEntry,
  className,
}: OutputPanelProps) {
  const { t } = useT();
  const [internalAllowJs, setInternalAllowJs] = useState(false);
  const [internalCopied, setInternalCopied] = useState(false);
  const [internalTab, setInternalTab] = useState<BuilderTab>("preview");

  const allowJsControlled = allowJsProp !== undefined;
  const allowJs = allowJsControlled ? allowJsProp : internalAllowJs;
  const tab = activeTab ?? internalTab;
  const setTab = onTabChange ?? setInternalTab;
  const copied = copiedProp ?? internalCopied;
  const isGeneration = variant === "generation";
  const isMobile = variant === "mobile";
  const previewEnabled = allowJs && hasJs;

  const handleAllowJsChange = (checked: boolean) => {
    if (checked && onAllowJsBeforeEnable && !onAllowJsBeforeEnable()) return;
    if (onAllowJsChange) onAllowJsChange(checked);
    else setInternalAllowJs(checked);
  };

  const handleDownload = () => {
    downloadTextFile(downloadFileName, downloadContent ?? previewDoc);
  };

  const handleCopy = async () => {
    if (onCopy) {
      await onCopy();
      return;
    }
    if (!code.trim()) return;
    try {
      await navigator.clipboard.writeText(code);
      setInternalCopied(true);
      setTimeout(() => setInternalCopied(false), 2000);
    } catch {
      toast.error(t("result.code.copyFailed"));
    }
  };

  const allowJsControl =
    showAllowJs && hasJs ? (
      <label
        htmlFor={allowJsInputId}
        className={cn(
          "flex cursor-pointer items-center gap-1.5 text-shell-muted",
          isMobile ? "text-xs" : "text-xs sm:text-sm",
        )}
      >
        <input
          id={allowJsInputId}
          name="allowPreviewJavaScript"
          type="checkbox"
          checked={allowJs}
          onChange={(e) => handleAllowJsChange(e.target.checked)}
          className="h-4 w-4 accent-primary"
          data-testid={allowJsTestId}
        />
        {t("result.runJsInPreview")}
      </label>
    ) : null;

  const actionButtons = (
    <div className="flex flex-wrap items-center gap-2">
      {allowJsControl}
      {headerActions}
      {showCopy && (
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => void handleCopy()}
          data-testid={copyTestId}
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-emerald-500" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
          {copied ? t("builder.copied") : (copyLabel ?? t("builder.copy"))}
        </Button>
      )}
      {showDownload && (
        <Button
          type="button"
          size="sm"
          variant={isGeneration ? "outline" : "default"}
          onClick={handleDownload}
          data-testid={downloadTestId}
        >
          <Download className="h-4 w-4" aria-hidden />{" "}
          {isGeneration ? t("result.downloadHtml") : t("builder.download")}
        </Button>
      )}
    </div>
  );

  const emptyState = (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 text-center text-shell-muted",
        isMobile ? "min-h-[min(60dvh,420px)] px-4" : "h-full p-6",
      )}
    >
      <Eye className={cn("opacity-40", isMobile ? "h-8 w-8 text-shell-muted" : "h-8 w-8")} />
      <p className={cn("font-semibold text-foreground", isMobile ? "text-sm" : "text-sm")}>
        {emptyTitle ?? t("builder.previewEmptyTitle")}
      </p>
      <p className={cn("text-shell-muted", isMobile ? "text-sm" : "max-w-xs text-xs sm:text-sm")}>
        {emptyHint ?? t("builder.previewEmptyHint")}
      </p>
    </div>
  );

  const previewFrame = (
    <PreviewFrame
      key={previewRefreshKey}
      srcDoc={previewDoc}
      allowJs={previewEnabled}
      title={previewTitle ?? t("builder.previewFrameTitle")}
      className={cn(
        isMobile ? "h-[min(68dvh,640px)] w-full border-0" : "h-full border-0 bg-white",
        previewClassName,
      )}
      onConsoleEntry={onConsoleEntry}
    />
  );

  const codeEditor = (
    <div className={isMobile ? "space-y-2" : "h-full"}>
      {isMobile && showCopy && (
        <div className="flex justify-end">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() => void handleCopy()}
            data-testid={copyTestId}
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-emerald-500" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
            {copied ? t("builder.copied") : (copyLabel ?? t("builder.mobile.copyCode"))}
          </Button>
        </div>
      )}
      <Textarea
        aria-label={t("builder.codeEditorAria")}
        value={code}
        readOnly={codeReadOnly || !onCodeChange}
        spellCheck={false}
        onChange={onCodeChange ? (e) => onCodeChange(e.target.value) : undefined}
        className={cn(
          "font-mono resize-none border-0 bg-shell",
          isMobile
            ? "min-h-[min(60dvh,420px)] text-xs sm:text-sm"
            : "h-full min-h-0 rounded-none text-xs sm:text-sm",
        )}
      />
    </div>
  );

  if (isGeneration) {
    return (
      <div className={cn("space-y-3", className)}>
        <Tabs defaultValue="preview" className="w-full min-w-0">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            <TabsList className="h-auto w-full max-w-full flex-wrap justify-start gap-1 overflow-x-auto p-1 sm:w-auto sm:flex-nowrap">
              <TabsTrigger value="preview">{t("result.tab.preview")}</TabsTrigger>
              <TabsTrigger value="html">{t("result.tab.html")}</TabsTrigger>
              <TabsTrigger value="css">{t("result.tab.css")}</TabsTrigger>
              <TabsTrigger value="js">{t("result.tab.js")}</TabsTrigger>
              <TabsTrigger value="notes">{t("result.tab.notes")}</TabsTrigger>
            </TabsList>
            <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
              {allowJsControl}
              {showDownload && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleDownload}
                  data-testid={downloadTestId}
                >
                  <Download className="h-4 w-4" aria-hidden /> {t("result.downloadHtml")}
                </Button>
              )}
            </div>
          </div>

          <TabsContent value="preview" className="mt-3 min-w-0">
            <PreviewFrame
              srcDoc={previewDoc}
              allowJs={previewEnabled}
              className="min-h-[min(55dvh,480px)] w-full sm:min-h-[480px]"
              onConsoleEntry={onConsoleEntry}
            />
          </TabsContent>
          <TabsContent value="html" className="mt-3">
            <CodeBlock code={html ?? ""} language="html" />
          </TabsContent>
          <TabsContent value="css" className="mt-3">
            <CodeBlock code={css ?? ""} language="css" />
          </TabsContent>
          <TabsContent value="js" className="mt-3">
            <CodeBlock code={javascript ?? ""} language="javascript" />
          </TabsContent>
          <TabsContent value="notes" className="mt-3">
            {notesContent}
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  if (isMobile) {
    return (
      <section
        ref={previewSectionRef}
        className={cn(
          "vibecraft-studio-elevated overflow-hidden rounded-xl border border-shell-border/80",
          className,
        )}
      >
        <div className="flex border-b border-shell-border/80">
          {(["preview", "code"] as const).map((tabName) => (
            <button
              key={tabName}
              type="button"
              onClick={() => setTab(tabName)}
              data-testid={`${tabTestIdPrefix}-${tabName}`}
              className={cn(
                "flex min-h-11 flex-1 flex-col items-center justify-center gap-1 py-3 text-xs font-semibold uppercase",
                tab === tabName ? "border-b-2 border-primary text-primary" : "text-shell-muted",
              )}
            >
              {tabName === "preview" ? (
                <Eye className="h-3.5 w-3.5" />
              ) : (
                <Code className="h-3.5 w-3.5" />
              )}
              {tabName === "preview" ? t("builder.previewTab") : t("builder.codeTab")}
            </button>
          ))}
          {extraTabs}
        </div>

        {tab === "preview" && (
          <div className="flex items-center justify-between gap-2 border-b border-shell-border/80 px-3 py-2">
            <div className="flex min-w-0 items-center gap-1.5 text-xs font-medium text-shell-muted">
              <Smartphone className="h-3.5 w-3.5" />
              {t("builder.mobile.deviceIphone17Air")}
            </div>
            <button
              type="button"
              className="grid h-11 w-11 shrink-0 place-items-center rounded-lg text-shell-muted disabled:opacity-40"
              aria-label={t("builder.mobile.refreshPreview")}
              data-testid="builder-mobile-refresh-preview"
              disabled={isEmpty}
              onClick={onRefreshPreview}
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {tab === "code" && !isEmpty && headerActions && (
          <div className="flex flex-wrap items-center gap-2 border-b border-shell-border/80 px-3 py-2">
            {headerActions}
          </div>
        )}

        <div className="relative bg-[#202124] p-3 sm:p-4">
          {isEmpty ? (
            emptyState
          ) : tab === "preview" ? (
            showDeviceChrome ? (
              <EditorDeviceFrame className="p-0">{previewFrame}</EditorDeviceFrame>
            ) : (
              previewFrame
            )
          ) : (
            codeEditor
          )}
        </div>
      </section>
    );
  }

  return (
    <div className={cn("flex min-w-0 flex-1 flex-col", className)}>
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-shell-border/80 px-3 py-2 sm:px-4">
        <div className="flex min-w-0 gap-1 rounded-lg border border-shell-border bg-shell p-0.5">
          {(["preview", "code"] as const).map((tabName) => (
            <button
              key={tabName}
              type="button"
              onClick={() => setTab(tabName)}
              className={cn(
                "inline-flex min-h-9 items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-semibold sm:min-h-8 sm:py-1",
                tab === tabName ? "bg-shell-elevated text-primary" : "text-shell-muted",
              )}
              data-testid={`${tabTestIdPrefix}-${tabName}`}
            >
              {tabName === "preview" ? (
                <Eye className="h-3.5 w-3.5" />
              ) : (
                <Code className="h-3.5 w-3.5" />
              )}
              {tabName === "preview" ? t("builder.previewTab") : t("builder.codeTab")}
            </button>
          ))}
        </div>
        {!isEmpty && actionButtons}
      </header>
      <div className="relative flex-1 overflow-hidden">
        {isEmpty ? emptyState : tab === "preview" ? previewFrame : codeEditor}
      </div>
    </div>
  );
}
