import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { useT } from "@/hooks/use-t";

export function CodeBlock({
  code,
  language,
  className,
}: {
  code: string;
  language?: string;
  className?: string;
}) {
  const { t } = useT();
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error(t("result.code.copyFailed"));
    }
  };
  return (
    <div className={cn("glass-inset relative overflow-hidden", className)}>
      <div className="flex items-center justify-between border-b border-border px-3 py-1.5">
        <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          {language ?? "code"}
        </span>
        <button
          type="button"
          onClick={copy}
          aria-label={t("result.code.copyAria")}
          className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs text-muted-foreground hover:bg-white/10 hover:text-foreground"
          data-testid="code-copy"
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? t("result.code.copied") : t("result.code.copy")}
        </button>
      </div>
      <pre className="max-h-[520px] overflow-auto p-3 text-xs leading-relaxed [counter-reset:line]">
        <code className="font-mono text-foreground whitespace-pre-wrap break-words">
          {(code || t("result.code.empty")).split("\n").map((line, i) => (
            <span key={i} className="block pl-8 [counter-increment:line] before:absolute before:-ml-8 before:inline-block before:w-6 before:text-right before:text-muted-foreground/50 before:content-[counter(line)] relative">
              {line || " "}
            </span>
          ))}
        </code>
      </pre>
    </div>
  );
}
