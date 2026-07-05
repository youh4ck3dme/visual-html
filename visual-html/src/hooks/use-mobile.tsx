import * as React from "react";

const MOBILE_BREAKPOINT = 768;
const COMPACT_STUDIO_BREAKPOINT = 1024;

function readIsMobile(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`).matches;
}

function readIsCompactStudio(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia(`(max-width: ${COMPACT_STUDIO_BREAKPOINT - 1}px)`).matches;
}

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(readIsMobile);

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(mql.matches);
    };
    mql.addEventListener("change", onChange);
    setIsMobile(mql.matches);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return isMobile;
}

/** Builder + tablet — use compact studio below lg (1024px). */
export function useIsCompactStudio() {
  const [isCompact, setIsCompact] = React.useState(readIsCompactStudio);

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${COMPACT_STUDIO_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsCompact(mql.matches);
    };
    mql.addEventListener("change", onChange);
    setIsCompact(mql.matches);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return isCompact;
}
