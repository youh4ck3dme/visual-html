import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

const STEPS = [
  "Analyzing visual hierarchy…",
  "Extracting layout structure…",
  "Inferring typography and spacing…",
  "Generating semantic HTML…",
  "Cleaning CSS so it doesn't look like it crawled out of 2011…",
];

export function LoadingSteps() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((n) => (n + 1) % STEPS.length), 2200);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="glass-inset flex items-center gap-3 px-4 py-3 text-sm text-muted-foreground">
      <Loader2 className="h-4 w-4 shrink-0 animate-spin text-primary" aria-hidden />
      <span className="truncate">{STEPS[i]}</span>
    </div>
  );
}