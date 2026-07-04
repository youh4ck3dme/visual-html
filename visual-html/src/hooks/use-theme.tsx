import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  STORAGE_KEY,
  applyThemeToDocument,
  parseStoredTheme,
  resolveTheme,
  type ResolvedTheme,
  type Theme,
} from "@/lib/theme";

/** Must match SSR + first client paint to avoid hydration mismatch. */
const INITIAL_THEME: Theme = "dark";
const INITIAL_PREFERS_DARK = true;

function getSystemPrefersDark(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return true;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function getStoredTheme(): Theme {
  return parseStoredTheme(localStorage.getItem(STORAGE_KEY));
}

type ThemeContextValue = {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  hydrated: boolean;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(INITIAL_THEME);
  const [prefersDark, setPrefersDark] = useState(INITIAL_PREFERS_DARK);
  const [hydrated, setHydrated] = useState(false);

  const resolvedTheme = useMemo(() => resolveTheme(theme, prefersDark), [theme, prefersDark]);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    localStorage.setItem(STORAGE_KEY, next);
    applyThemeToDocument(document, resolveTheme(next, getSystemPrefersDark()), {
      animate: true,
    });
  }, []);

  const toggleTheme = useCallback(() => {
    const next: Theme = resolvedTheme === "dark" ? "light" : "dark";
    setTheme(next);
  }, [resolvedTheme, setTheme]);

  useEffect(() => {
    setThemeState(getStoredTheme());
    setPrefersDark(getSystemPrefersDark());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    applyThemeToDocument(document, resolvedTheme, { animate: false });
  }, [hydrated, resolvedTheme]);

  useEffect(() => {
    if (!hydrated) return;

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (event: MediaQueryListEvent) => {
      setPrefersDark(event.matches);
      if (theme === "system") {
        applyThemeToDocument(document, event.matches ? "dark" : "light", { animate: true });
      }
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [hydrated, theme]);

  const value = useMemo(
    () => ({ theme, resolvedTheme, hydrated, setTheme, toggleTheme }),
    [theme, resolvedTheme, hydrated, setTheme, toggleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
