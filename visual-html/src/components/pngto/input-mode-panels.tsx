import { useServerFn } from "@tanstack/react-start";
import { FileUp, Link2, Loader2, Type } from "lucide-react";
import { useCallback, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useT } from "@/hooks/use-t";
import { fetchImageFromUrl } from "@/lib/generate.functions";
import {
  loadImage,
  optimizeUpload,
  uploadedImageFromBase64,
  type UploadedImage,
} from "@/lib/image-upload";
import { parseProjectImportFile } from "@/lib/project-import";
import { descriptionToUploadedImage } from "@/lib/text-to-image";
import type { SavedProject } from "@/types/project";
import { cn } from "@/lib/utils";

export function UrlInputPanel({
  onFile,
  onError,
  className,
}: {
  onFile: (img: UploadedImage) => void;
  onError: (msg: string) => void;
  className?: string;
}) {
  const { t } = useT();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const fetchFn = useServerFn(fetchImageFromUrl);

  const handleLoad = useCallback(async () => {
    const trimmed = url.trim();
    if (!trimmed) {
      onError(t("input.url.error.empty"));
      return;
    }

    setLoading(true);
    try {
      const result = await fetchFn({ data: { url: trimmed } });
      if (!result.ok) {
        onError(result.error.message);
        return;
      }

      const draft = uploadedImageFromBase64(result.base64, result.mimeType, result.fileName, 1, 1);
      const optimized = await optimizeUpload(draft.file);
      const img = await loadImage(optimized.dataUrl);
      onFile({ ...optimized, width: img.naturalWidth, height: img.naturalHeight });
    } catch (e) {
      onError(e instanceof Error ? e.message : t("input.url.error.fetchFailed"));
    } finally {
      setLoading(false);
    }
  }, [fetchFn, onError, onFile, t, url]);

  return (
    <div
      className={cn(
        "space-y-4 rounded-lg border border-workspace-border bg-workspace-surface p-4 sm:p-5",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-info/10 text-info">
          <Link2 className="h-4 w-4" aria-hidden />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-workspace-foreground">{t("input.url.title")}</p>
          <p className="text-xs text-workspace-muted">{t("input.url.hint")}</p>
        </div>
      </div>
      <Input
        type="url"
        inputMode="url"
        placeholder={t("input.url.placeholder")}
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        aria-label={t("input.url.placeholder")}
        data-testid="input-url-field"
      />
      <Button
        type="button"
        className="w-full bg-primary text-primary-foreground hover:bg-primary-hover"
        disabled={loading}
        onClick={() => void handleLoad()}
        data-testid="input-url-load"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
        {loading ? t("input.url.loading") : t("input.url.action")}
      </Button>
    </div>
  );
}

export function TextInputPanel({
  onFile,
  onError,
  onDescription,
  className,
}: {
  onFile: (img: UploadedImage) => void;
  onError: (msg: string) => void;
  onDescription: (description: string) => void;
  className?: string;
}) {
  const { t } = useT();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleApply = useCallback(async () => {
    const trimmed = text.trim();
    if (!trimmed) {
      onError(t("input.text.error.empty"));
      return;
    }

    setLoading(true);
    try {
      onDescription(trimmed);
      onFile(await descriptionToUploadedImage(trimmed));
    } catch (e) {
      onError(e instanceof Error ? e.message : t("input.text.error.renderFailed"));
    } finally {
      setLoading(false);
    }
  }, [onDescription, onError, onFile, t, text]);

  return (
    <div
      className={cn(
        "space-y-4 rounded-lg border border-workspace-border bg-workspace-surface p-4 sm:p-5",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-info/10 text-info">
          <Type className="h-4 w-4" aria-hidden />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-workspace-foreground">{t("input.text.title")}</p>
          <p className="text-xs text-workspace-muted">{t("input.text.hint")}</p>
        </div>
      </div>
      <Textarea
        rows={6}
        placeholder={t("input.text.placeholder")}
        value={text}
        onChange={(e) => setText(e.target.value)}
        aria-label={t("input.text.placeholder")}
        data-testid="input-text-field"
      />
      <Button
        type="button"
        className="w-full bg-primary text-primary-foreground hover:bg-primary-hover"
        disabled={loading}
        onClick={() => void handleApply()}
        data-testid="input-text-apply"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
        {loading ? t("input.text.loading") : t("input.text.action")}
      </Button>
    </div>
  );
}

export function ImportInputPanel({
  onImported,
  onError,
  className,
}: {
  onImported: (projects: SavedProject[]) => Promise<string | null>;
  onError: (msg: string) => void;
  className?: string;
}) {
  const { t } = useT();
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  const handleFile = useCallback(
    async (file: File | undefined) => {
      if (!file) return;
      setLoading(true);
      try {
        const raw = await file.text();
        const parsed = parseProjectImportFile(JSON.parse(raw) as unknown);
        if (parsed.length === 0) {
          onError(t("input.import.error.invalid"));
          return;
        }
        const projectId = await onImported(parsed);
        if (!projectId) {
          onError(t("input.import.error.persistFailed"));
        }
      } catch {
        onError(t("input.import.error.invalid"));
      } finally {
        setLoading(false);
      }
    },
    [onError, onImported, t],
  );

  return (
    <div
      className={cn(
        "space-y-4 rounded-lg border border-workspace-border bg-workspace-surface p-4 sm:p-5",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-info/10 text-info">
          <FileUp className="h-4 w-4" aria-hidden />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-workspace-foreground">{t("input.import.title")}</p>
          <p className="text-xs text-workspace-muted">{t("input.import.hint")}</p>
        </div>
      </div>
      <Button
        type="button"
        variant="outline"
        className="w-full"
        disabled={loading}
        onClick={() => inputRef.current?.click()}
        data-testid="input-import-choose"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
        {loading ? t("input.import.loading") : t("input.import.action")}
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        aria-label={t("input.import.action")}
        onChange={(e) => {
          void handleFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
    </div>
  );
}
