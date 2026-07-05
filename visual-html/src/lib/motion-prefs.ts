/** Runtime motion preference helpers (safe for SSR and tests). */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function scrollIntoViewRespectingMotion(
  element: Element | null | undefined,
  options: ScrollIntoViewOptions = {},
): void {
  if (!element) return;
  element.scrollIntoView({
    ...options,
    behavior: prefersReducedMotion() ? "instant" : (options.behavior ?? "smooth"),
  });
}
