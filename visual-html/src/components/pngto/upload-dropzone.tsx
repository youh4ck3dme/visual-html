import { useCallback, useRef, useState } from "react";
import { Upload } from "lucide-react";

import { useT } from "@/hooks/use-t";
import { optimizeUpload, type UploadedImage } from "@/lib/image-upload";
import { ALLOWED_MIME, MAX_UPLOAD_BYTES, MAX_UPLOAD_MB } from "@/lib/validation/generation";
import { cn } from "@/lib/utils";
import type { MessageKey } from "@/lib/i18n/messages";

export type { UploadedImage };

const ALLOWED = ALLOWED_MIME as readonly string[];

const ERROR_MESSAGE_KEYS: Record<string, MessageKey> = {
  "Could not read file": "upload.error.couldNotRead",
  "Could not process image": "upload.error.couldNotProcess",
  "Invalid image": "upload.error.invalidImage",
  "Could not optimize image": "upload.error.couldNotOptimize",
  "Could not prepare image for upload": "upload.error.couldNotPrepare",
  "File exceeds size limit": "upload.error.fileTooLarge",
};

export function UploadDropzone({
  onFile,
  onError,
  className,
}: {
  onFile: (img: UploadedImage) => void;
  onError: (msg: string) => void;
  className?: string;
}) {
  const { t } = useT();
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const localizeError = useCallback(
    (message: string) => {
      const key = ERROR_MESSAGE_KEYS[message];
      if (key === "upload.error.fileTooLarge") {
        return t(key, { maxMb: MAX_UPLOAD_MB });
      }
      return key ? t(key) : message;
    },
    [t],
  );

  const handle = useCallback(
    async (file: File | undefined) => {
      if (!file) return;
      if (!ALLOWED.includes(file.type)) {
        onError(t("upload.error.unsupportedFormat"));
        return;
      }
      if (file.size === 0) {
        onError(t("upload.error.emptyFile"));
        return;
      }
      if (file.size > MAX_UPLOAD_BYTES) {
        onError(t("upload.error.fileTooLarge", { maxMb: MAX_UPLOAD_MB }));
        return;
      }
      try {
        onFile(await optimizeUpload(file));
      } catch (e) {
        onError(localizeError((e as Error).message));
      }
    },
    [localizeError, onError, onFile, t],
  );

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        void handle(e.dataTransfer.files?.[0]);
      }}
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-workspace-border bg-workspace-surface px-4 py-10 text-center transition-colors hover:border-info/50 sm:px-6 sm:py-12",
        dragging && "border-info bg-info/5",
        className,
      )}
    >
      <div className="grid h-12 w-12 place-items-center rounded-full bg-info/10 text-info">
        <Upload className="h-5 w-5" aria-hidden />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium text-workspace-foreground">{t("upload.dropTitle")}</p>
        <p className="text-xs text-workspace-muted">
          {t("upload.dropHint", { maxMb: MAX_UPLOAD_MB })}
        </p>
      </div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="mt-2 inline-flex items-center rounded-md border border-workspace-border bg-workspace-surface px-3 py-1.5 text-xs font-medium text-workspace-foreground hover:bg-workspace-tabs"
        data-testid="upload-choose-file"
      >
        {t("upload.chooseFile")}
      </button>
      <input
        id="upload-image-file"
        name="image"
        ref={inputRef}
        type="file"
        accept={ALLOWED.join(",")}
        className="hidden"
        aria-label={t("upload.inputAria")}
        onChange={(e) => {
          void handle(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
    </div>
  );
}