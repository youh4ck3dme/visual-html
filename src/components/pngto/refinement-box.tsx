import { useState } from "react";
import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const QUICK = [
  {
    label: "Improve fidelity",
    instruction:
      "Improve visual fidelity: add complete CSS for every class, recreate the screenshot as a print-like layout when relevant, add doctype/charset/viewport, table borders, right-aligned numbers, page margins, and @media print styles. Do not change verified text; mark uncertain OCR values visibly and add warnings. For bank statements and wide transaction tables, use A4 landscape sizing: 297mm page width on screen where practical, @page size A4 landscape, compact rows, and enough horizontal space for all columns.",
  },
  { label: "Make responsive", instruction: "Make it responsive" },
  { label: "Improve semantics", instruction: "Improve semantic structure" },
  { label: "Simplify wrappers", instruction: "Remove unnecessary wrappers" },
  { label: "Convert to Tailwind", instruction: "Convert to Tailwind" },
  { label: "Optimize SEO", instruction: "Optimize for SEO" },
];

export function RefinementBox({
  onSubmit,
  disabled,
}: {
  onSubmit: (instruction: string) => void;
  disabled?: boolean;
}) {
  const [text, setText] = useState("");
  const submit = () => {
    const t = text.trim();
    if (!t) return;
    onSubmit(t);
    setText("");
  };
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {QUICK.map((q) => (
          <button
            key={q.label}
            type="button"
            disabled={disabled}
            onClick={() => onSubmit(q.instruction)}
            className="rounded-full border border-shell-border bg-surface px-2.5 py-1 text-[11px] text-shell-muted hover:bg-surface-strong hover:text-foreground disabled:opacity-50"
          >
            {q.label}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <label htmlFor="refinement-instruction" className="sr-only">
          Refinement instruction
        </label>
        <Textarea
          id="refinement-instruction"
          name="refinementInstruction"
          rows={2}
          maxLength={2000}
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={disabled}
          placeholder="Refine the generated code…"
          className="flex-1"
        />
        <Button onClick={submit} disabled={disabled || !text.trim()} className="self-end">
          <Sparkles className="h-4 w-4" aria-hidden /> Refine
        </Button>
      </div>
    </div>
  );
}
