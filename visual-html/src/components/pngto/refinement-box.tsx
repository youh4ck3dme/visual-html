import { useState } from "react";
import { AppLogo } from "@/components/pngto/app-logo";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useT } from "@/hooks/use-t";
import { SEO_REFINEMENT_INSTRUCTION } from "@/lib/builder/quality-fix-prompts";
import type { MessageKey } from "@/lib/i18n/messages";

const QUICK = [
  {
    labelKey: "refinement.chip.improveFidelity" as MessageKey,
    instruction:
      "Improve visual fidelity: add complete CSS for every class, recreate the screenshot as a print-like layout when relevant, add doctype/charset/viewport, table borders, right-aligned numbers, page margins, and @media print styles. Do not change verified text; mark uncertain OCR values visibly and add warnings. For bank statements and wide transaction tables, use A4 landscape sizing: 297mm page width on screen where practical, @page size A4 landscape, compact rows, and enough horizontal space for all columns.",
  },
  { labelKey: "refinement.chip.makeResponsive" as MessageKey, instruction: "Make it responsive" },
  {
    labelKey: "refinement.chip.improveSemantics" as MessageKey,
    instruction: "Improve semantic structure",
  },
  {
    labelKey: "refinement.chip.simplifyWrappers" as MessageKey,
    instruction: "Remove unnecessary wrappers",
  },
  { labelKey: "refinement.chip.convertTailwind" as MessageKey, instruction: "Convert to Tailwind" },
  {
    labelKey: "refinement.chip.optimizeSeo" as MessageKey,
    instruction: SEO_REFINEMENT_INSTRUCTION,
  },
];

export function RefinementBox({
  onSubmit,
  disabled,
}: {
  onSubmit: (instruction: string) => void;
  disabled?: boolean;
}) {
  const { t } = useT();
  const [text, setText] = useState("");
  const submit = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
    setText("");
  };
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {QUICK.map((q) => (
          <button
            key={q.labelKey}
            type="button"
            disabled={disabled}
            onClick={() => onSubmit(q.instruction)}
            className="rounded-full border border-shell-border bg-surface px-2.5 py-1 text-[11px] text-shell-muted hover:bg-surface-strong hover:text-foreground disabled:opacity-50"
          >
            {t(q.labelKey)}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <label htmlFor="refinement-instruction" className="sr-only">
          {t("refinement.inputAria")}
        </label>
        <Textarea
          id="refinement-instruction"
          name="refinementInstruction"
          rows={2}
          maxLength={2000}
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={disabled}
          placeholder={t("refinement.placeholder")}
          className="flex-1"
        />
        <Button
          onClick={submit}
          disabled={disabled || !text.trim()}
          className="self-end"
          data-testid="refine-submit"
        >
          <AppLogo size="xs" className="rounded-md" /> {t("refinement.button")}
        </Button>
      </div>
    </div>
  );
}
