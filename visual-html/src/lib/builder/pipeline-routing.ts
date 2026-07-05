import type { BuilderOrchestrationMode } from "@/lib/builder/orchestration-mode";

export function scorePromptComplexity(prompt: string): number {
  const lower = prompt.toLowerCase();
  let score = 1;
  if (prompt.length > 320) score += 1;
  if (prompt.length > 640) score += 2;
  if (
    /dashboard|multi.?page|authentication|database|backend|api|admin panel|ecommerce|kanban|real.?time/i.test(
      lower,
    )
  ) {
    score += 3;
  }
  if (/landing page|single page|hero section|simple portfolio|one section/i.test(lower)) {
    score -= 1;
  }
  return Math.max(0, score);
}

/** Auto-route pro mode: simple landings → fast, complex apps → beast. */
export function resolvePipelineMode(
  prompt: string,
  requested: BuilderOrchestrationMode,
): BuilderOrchestrationMode {
  if (requested === "beast" || requested === "fast") return requested;
  const score = scorePromptComplexity(prompt);
  const isSimpleLanding =
    score <= 2 &&
    /single page|hero section|simple portfolio|one section|simple landing/i.test(prompt);
  if (isSimpleLanding) return "fast";
  if (score >= 4) return "beast";
  return "pro";
}
