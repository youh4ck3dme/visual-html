import type { GenerateHtmlResult } from "@/types/generation";

/** Heuristic: detect truncated or structurally incomplete synthesis output. */
export function isLikelyIncompleteHtml(result: Pick<GenerateHtmlResult, "html">): boolean {
  const html = result.html.trim();
  if (!html) return true;
  if (/<!--\s*truncated|incomplete output/i.test(html)) return true;

  const lowered = html.toLowerCase();
  if (lowered.includes("<html") && !lowered.includes("</html>")) return true;
  if (lowered.includes("<body") && !lowered.includes("</body>")) return true;

  const openTags = html.match(/<[a-z][a-z0-9-]*\b[^>]*>/gi)?.length ?? 0;
  const closeTags = html.match(/<\/[a-z][a-z0-9-]*>/gi)?.length ?? 0;
  return openTags > closeTags + 3;
}
