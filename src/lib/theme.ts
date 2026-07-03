export type Theme = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

export const STORAGE_KEY = "pngto-theme";
export const THEME_TRANSITION_MS = 320;

const VALID_THEMES: Theme[] = ["light", "dark", "system"];

export function parseStoredTheme(stored: string | null, fallback: Theme = "dark"): Theme {
  if (stored && VALID_THEMES.includes(stored as Theme)) return stored as Theme;
  return fallback;
}

export function resolveTheme(theme: Theme, prefersDark: boolean): ResolvedTheme {
  if (theme === "system") return prefersDark ? "dark" : "light";
  return theme;
}

export function themeColorMeta(resolved: ResolvedTheme): string {
  return resolved === "dark" ? "#09090b" : "#f4f4f6";
}

export function nextThemeInCycle(current: Theme): Theme {
  if (current === "light") return "dark";
  if (current === "dark") return "system";
  return "light";
}

export function compactSwitcherIcon(theme: Theme): "sun" | "moon" | "monitor" {
  if (theme === "light") return "sun";
  if (theme === "dark") return "moon";
  return "monitor";
}

export function compactSwitcherLabel(theme: Theme, resolved: ResolvedTheme): string {
  if (theme === "system") return `System (${resolved})`;
  return theme === "light" ? "Light" : "Dark";
}

type ViewTransitionDocument = Document & {
  startViewTransition?: (callback: () => void) => { finished: Promise<void> };
};

export function applyThemeToDocument(
  doc: Document,
  resolved: ResolvedTheme,
  options?: { animate?: boolean },
) {
  const root = doc.documentElement;
  const animate = options?.animate ?? false;
  const reducedMotion = doc.defaultView?.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const apply = () => {
    root.classList.toggle("dark", resolved === "dark");
    root.style.colorScheme = resolved;

    const meta = doc.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", themeColorMeta(resolved));
  };

  if (!animate || reducedMotion) {
    apply();
    return;
  }

  const startVT = (doc as ViewTransitionDocument).startViewTransition;
  if (startVT) {
    startVT.call(doc, apply);
    return;
  }

  root.classList.add("theme-animate");
  apply();
  doc.defaultView?.setTimeout(() => root.classList.remove("theme-animate"), THEME_TRANSITION_MS);
}

export const themeInitScript = `(function(){try{var t=localStorage.getItem("${STORAGE_KEY}")||"dark";var d=t==="dark"||(t==="system"&&matchMedia("(prefers-color-scheme:dark)").matches);var r=document.documentElement;r.classList.toggle("dark",d);r.style.colorScheme=d?"dark":"light";var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute("content",d?"#09090b":"#f4f4f6")}catch(e){document.documentElement.classList.add("dark")}})();`;
