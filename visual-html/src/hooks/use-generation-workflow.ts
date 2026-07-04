import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import type { UploadedImage } from "@/components/pngto/upload-dropzone";
import { useT } from "@/hooks/use-t";
import { useProjects } from "@/hooks/use-projects";
import {
  continueHtml,
  generateHtml,
  refineHtml,
  runOcr,
  type ServerResult,
} from "@/lib/generate.functions";
import { createApiError, createSensor } from "@/lib/generation-diagnostics";
import {
  GENERATION_DEFAULTS_CHANGE_EVENT,
  loadGenerationDefaults,
} from "@/lib/generation-defaults";
import { messages } from "@/lib/i18n/messages";
import type { SavedProject } from "@/types/project";
import type {
  ApiError,
  GenerationOptions,
  GenerationSensor,
  GenerateHtmlResult,
} from "@/types/generation";

export { createDefaultGenerationOptions, DEFAULT_GENERATION_OPTIONS } from "@/lib/generation-defaults";

type RetryAction = "generate" | "continue" | "refine";

export type UseGenerationWorkflowResult = {
  image: UploadedImage | null;
  loadedProject: SavedProject | null;
  activeProjectId: string | null;
  options: GenerationOptions;
  setOptions: (options: GenerationOptions) => void;
  result: GenerateHtmlResult | null;
  error: ApiError | null;
  sensor: GenerationSensor;
  saveNotice: string | null;
  busy: boolean;
  primaryButtonLabel: string;
  onFileUploaded: (image: UploadedImage) => void;
  onUploadError: (message: string) => void;
  onForensicGenerate: (nextOptions: GenerationOptions) => void;
  onRemoveImage: () => void;
  resetForNewImage: () => void;
  onPrimaryAction: () => void;
  onRetry: () => void;
  onRefine: (instruction: string) => void;
};

export function useGenerationWorkflow(projectIdFromUrl?: string): UseGenerationWorkflowResult {
  const { t, locale } = useT();
  const navigate = useNavigate();
  const { getProject, saveFromGeneration } = useProjects();

  const [image, setImage] = useState<UploadedImage | null>(null);
  const [loadedProject, setLoadedProject] = useState<SavedProject | null>(null);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [options, setOptions] = useState<GenerationOptions>(() =>
    loadGenerationDefaults(locale),
  );
  const [result, setResult] = useState<GenerateHtmlResult | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [sensor, setSensor] = useState<GenerationSensor>(createSensor("validating", "idle"));
  const [lastRefineInstruction, setLastRefineInstruction] = useState<string | null>(null);
  const [lastRetryAction, setLastRetryAction] = useState<RetryAction>("generate");
  const [saveNotice, setSaveNotice] = useState<string | null>(null);

  const ocrFn = useServerFn(runOcr);
  const generateFn = useServerFn(generateHtml);
  const continueFn = useServerFn(continueHtml);
  const refineFn = useServerFn(refineHtml);

  useEffect(() => {
    setOptions((prev) => {
      const enDefault = messages.en["options.defaultInstructions"];
      const skDefault = messages.sk["options.defaultInstructions"];
      if (prev.additionalInstructions === enDefault || prev.additionalInstructions === skDefault) {
        return {
          ...prev,
          additionalInstructions: messages[locale]["options.defaultInstructions"],
        };
      }
      return prev;
    });
  }, [locale]);

  useEffect(() => {
    const syncDefaults = () => setOptions(loadGenerationDefaults(locale));
    window.addEventListener(GENERATION_DEFAULTS_CHANGE_EVENT, syncDefaults);
    return () => window.removeEventListener(GENERATION_DEFAULTS_CHANGE_EVENT, syncDefaults);
  }, [locale]);

  useEffect(() => {
    if (!projectIdFromUrl) return;
    const project = getProject(projectIdFromUrl);
    if (!project) return;
    setLoadedProject(project);
    setActiveProjectId(project.id);
    setOptions(project.options);
    setResult(project.result);
    setImage(null);
    setError(null);
    setSensor(createSensor("done", "success"));
  }, [projectIdFromUrl, getProject]);

  const persistResult = useCallback(
    async (data: GenerateHtmlResult) => {
      const source = image;
      const fallback = loadedProject ?? (activeProjectId ? getProject(activeProjectId) : null);

      if (!source && !fallback) return;

      const savedId = await saveFromGeneration({
        fileName: source?.file.name ?? fallback!.fileName,
        imageWidth: source?.width ?? fallback!.imageWidth,
        imageHeight: source?.height ?? fallback!.imageHeight,
        imageDataUrl: source?.dataUrl ?? fallback!.thumbnailDataUrl,
        options,
        result: data,
        projectId: activeProjectId ?? fallback?.id,
      });

      if (savedId) {
        setActiveProjectId(savedId);
        setSaveNotice(t("index.savedToProjects"));
        window.setTimeout(() => setSaveNotice(null), 3000);
        return;
      }

      toast.error(t("index.saveToProjectsFailed.title"), {
        description: t("index.saveToProjectsFailed.description"),
        duration: 8000,
      });
    },
    [activeProjectId, getProject, image, loadedProject, options, saveFromGeneration, t],
  );

  const handleResult = useCallback(
    (res: ServerResult) => {
      if (res.ok) {
        setResult(res.data);
        setError(null);
        setSensor(createSensor("done", "success"));
        void persistResult(res.data);
      } else {
        setError(res.error);
        setSensor(createSensor(res.error.phase ?? "failed", "failed", res.error.diagnostic));
      }
    },
    [persistResult],
  );

  const resetUploadState = useCallback(() => {
    setLastRetryAction("generate");
    setLastRefineInstruction(null);
    setSensor(createSensor("validating", "idle"));
  }, []);

  const resetForNewImage = useCallback(() => {
    setResult(null);
    setError(null);
    setLoadedProject(null);
    setActiveProjectId(null);
    setSaveNotice(null);
    resetUploadState();
    void navigate({ to: "/", search: {} });
  }, [navigate, resetUploadState]);

  const generateMut = useMutation({
    mutationFn: async (optionsOverride?: GenerationOptions): Promise<ServerResult> => {
      if (!image) throw new Error("No image");
      const runOptions = optionsOverride ?? options;

      setError(null);
      setLastRetryAction("generate");
      setLastRefineInstruction(null);
      setSensor(createSensor("validating"));
      setSensor(createSensor("rate_limited_check"));
      setSensor({
        ...createSensor("uploading_to_blob"),
        progress: 10,
        message: "Preparing image for OCR...",
      });
      const ocr = await ocrFn({
        data: { imageBase64: image.base64, mimeType: image.mimeType },
      });
      if (!ocr.ok) return { ok: false, error: ocr.error };

      setSensor(createSensor("ocr"));
      setSensor({
        ...createSensor("synthesizing"),
        progress: 45,
      });
      return generateFn({
        data: {
          imageBase64: image.base64,
          mimeType: image.mimeType,
          ocrMarkdown: ocr.ocrMarkdown,
          options: runOptions,
        },
      });
    },
    onSuccess: handleResult,
    onError: (e) => {
      const apiError = createApiError(
        "SERVER_ERROR",
        (e as Error).message ?? "Unexpected error",
        "failed",
      );
      setError(apiError);
      setSensor(createSensor("failed", "failed", apiError.diagnostic));
    },
  });

  const continueMut = useMutation({
    mutationFn: async (): Promise<ServerResult> => {
      if (!result) throw new Error("No prior result");

      setError(null);
      setLastRetryAction("continue");
      setSensor({
        ...createSensor("synthesizing"),
        progress: 75,
        message: "Continuing code generation...",
      });
      return continueFn({
        data: {
          prior: {
            html: result.html,
            css: result.css,
            javascript: result.javascript,
          },
          options,
        },
      });
    },
    onSuccess: handleResult,
    onError: (e) => {
      const apiError = createApiError(
        "SERVER_ERROR",
        (e as Error).message ?? "Unexpected error",
        "failed",
      );
      setError(apiError);
      setSensor(createSensor("failed", "failed", apiError.diagnostic));
    },
  });

  const refineMut = useMutation({
    mutationFn: async (instruction: string) => {
      if (!result) throw new Error("No prior result");
      setLastRetryAction("refine");
      setLastRefineInstruction(instruction);
      setError(null);
      setSensor({
        ...createSensor("synthesizing"),
        progress: 10,
        message: "Applying your refinement...",
      });
      return refineFn({
        data: {
          prior: {
            html: result.html,
            css: result.css,
            javascript: result.javascript,
          },
          instruction,
          options,
        },
      });
    },
    onSuccess: handleResult,
    onError: (e) => {
      const apiError = createApiError(
        "SERVER_ERROR",
        (e as Error).message ?? "Unexpected error",
        "failed",
      );
      setError(apiError);
      setSensor(createSensor("failed", "failed", apiError.diagnostic));
    },
  });

  const busy = generateMut.isPending || continueMut.isPending || refineMut.isPending;

  const primaryButtonLabel = continueMut.isPending
    ? t("index.continuing")
    : busy
      ? t("index.generating")
      : result
        ? t("index.continueGeneration")
        : t("index.generateHtml");

  const onFileUploaded = useCallback(
    (img: UploadedImage) => {
      setImage(img);
      setLoadedProject(null);
      setActiveProjectId(null);
      setResult(null);
      setError(null);
      setSaveNotice(null);
      resetUploadState();
      void navigate({ to: "/", search: {} });
    },
    [navigate, resetUploadState],
  );

  const onUploadError = useCallback((message: string) => {
    setError(createApiError("INVALID_FILE", message, "validating"));
  }, []);

  const onForensicGenerate = useCallback(
    (nextOptions: GenerationOptions) => {
      setOptions(nextOptions);
      generateMut.mutate(nextOptions);
    },
    [generateMut],
  );

  const onRemoveImage = useCallback(() => {
    setImage(null);
    resetForNewImage();
  }, [resetForNewImage]);

  const onPrimaryAction = useCallback(() => {
    if (result) continueMut.mutate();
    else generateMut.mutate(undefined);
  }, [continueMut, generateMut, result]);

  const onRetry = useCallback(() => {
    if (lastRetryAction === "continue" && result) continueMut.mutate();
    else if (lastRetryAction === "refine" && lastRefineInstruction && result)
      refineMut.mutate(lastRefineInstruction);
    else generateMut.mutate(undefined);
  }, [continueMut, generateMut, lastRefineInstruction, lastRetryAction, refineMut, result]);

  const onRefine = useCallback(
    (instruction: string) => {
      refineMut.mutate(instruction);
    },
    [refineMut],
  );

  return useMemo(
    () => ({
      image,
      loadedProject,
      activeProjectId,
      options,
      setOptions,
      result,
      error,
      sensor,
      saveNotice,
      busy,
      primaryButtonLabel,
      onFileUploaded,
      onUploadError,
      onForensicGenerate,
      onRemoveImage,
      resetForNewImage,
      onPrimaryAction,
      onRetry,
      onRefine,
    }),
    [
      image,
      loadedProject,
      activeProjectId,
      options,
      result,
      error,
      sensor,
      saveNotice,
      busy,
      primaryButtonLabel,
      onFileUploaded,
      onUploadError,
      onForensicGenerate,
      onRemoveImage,
      resetForNewImage,
      onPrimaryAction,
      onRetry,
      onRefine,
    ],
  );
}
