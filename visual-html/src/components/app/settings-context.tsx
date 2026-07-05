import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

type SettingsContextValue = {
  open: boolean;
  openSettings: () => void;
  closeSettings: () => void;
  setOpen: (open: boolean) => void;
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  const openSettings = useCallback(() => setOpen(true), []);
  const closeSettings = useCallback(() => setOpen(false), []);

  const value = useMemo(
    () => ({ open, openSettings, closeSettings, setOpen }),
    [open, openSettings, closeSettings],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

/* eslint-disable react-refresh/only-export-components -- provider + hook must live together */
export function useSettingsDialog(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error("useSettingsDialog must be used within SettingsProvider");
  }
  return ctx;
}
