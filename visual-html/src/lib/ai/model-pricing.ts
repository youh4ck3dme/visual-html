export type ModelPricingRow = {
  id: string;
  label: string;
  inputPer1M: number;
  outputPer1M: number;
  currency: "USD";
};

/** Static reference pricing for header model picker (not live billing). */
export const MODEL_PRICING: ModelPricingRow[] = [
  {
    id: "mistral-large-latest",
    label: "Mistral Large",
    inputPer1M: 2,
    outputPer1M: 6,
    currency: "USD",
  },
  {
    id: "mistral-medium-latest",
    label: "Mistral Medium",
    inputPer1M: 0.4,
    outputPer1M: 2,
    currency: "USD",
  },
  {
    id: "pixtral-large-latest",
    label: "Pixtral Large",
    inputPer1M: 2,
    outputPer1M: 6,
    currency: "USD",
  },
  {
    id: "mistral-ocr-latest",
    label: "Mistral OCR",
    inputPer1M: 1,
    outputPer1M: 1,
    currency: "USD",
  },
  {
    id: "codestral-latest",
    label: "Codestral",
    inputPer1M: 0.3,
    outputPer1M: 0.9,
    currency: "USD",
  },
];

export function formatModelPrice(row: ModelPricingRow): string {
  return `$${row.inputPer1M}/$${row.outputPer1M} per 1M in/out`;
}

export function getModelPricing(id: string): ModelPricingRow | undefined {
  return MODEL_PRICING.find((m) => m.id === id);
}
