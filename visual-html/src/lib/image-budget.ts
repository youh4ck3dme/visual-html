export const IDEAL_AI_IMAGE_BYTES = 700 * 1024;
export const WARNING_AI_IMAGE_BYTES = 1_200 * 1024;
export const HARD_AI_IMAGE_BYTES = 1_800_000;
export const MAX_AI_IMAGE_DIMENSION = 1600;

export type ImageBudgetStatus = "good" | "warning" | "heavy";

export interface ImageBudgetReport {
  status: ImageBudgetStatus;
  label: string;
  detail: string;
  recommendation: string;
}

export function imageBudgetReport(
  sizeBytes: number,
  width: number,
  height: number,
): ImageBudgetReport {
  const longestSide = Math.max(width, height);

  if (sizeBytes <= IDEAL_AI_IMAGE_BYTES && longestSide <= 1400) {
    return {
      status: "good",
      label: "Good for AI",
      detail: "This image is light enough for reliable OCR + synthesis.",
      recommendation: "Target met: <=700 KB and <=1400 px longest side.",
    };
  }

  if (sizeBytes <= WARNING_AI_IMAGE_BYTES && longestSide <= MAX_AI_IMAGE_DIMENSION) {
    return {
      status: "warning",
      label: "Acceptable but heavier",
      detail: "This image should usually work, but synthesis may be slower.",
      recommendation: "Best target: <=700 KB. Acceptable ceiling: <=1.2 MB and <=1600 px.",
    };
  }

  return {
    status: "heavy",
    label: "Heavy for AI",
    detail: "This screenshot is likely to increase timeout risk during synthesis.",
    recommendation: "Resize/compress to <=700 KB if possible, maximum <=1.2 MB for reliable runs.",
  };
}
