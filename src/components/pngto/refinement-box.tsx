import { useState } from "react";
import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const QUICK = [
  "Make it responsive",
  "Improve semantic structure",
  "Remove unnecessary wrappers",
  "Convert to Tailwind",
  "Optimize for SEO",
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
            key={q}
            type="button"
            disabled={disabled}
            onClick={() => onSubmit(q)}
            className="rounded-full border border-border bg-white/5 px-2.5 py-1 text-[11px] text-muted-foreground hover:bg-white/10 hover:text-foreground disabled:opacity-50"
          >
            {q}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <Textarea
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