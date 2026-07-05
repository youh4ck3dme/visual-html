/** Runtime motion preference helpers (safe for SSR and tests). */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Subscribe to OS reduced-motion changes (returns unsubscribe). */
export function subscribeReducedMotion(onChange: (reduced: boolean) => void): () => void {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return () => undefined;
  }
  const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
  const handler = () => onChange(mql.matches);
  mql.addEventListener("change", handler);
  return () => mql.removeEventListener("change", handler);
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
