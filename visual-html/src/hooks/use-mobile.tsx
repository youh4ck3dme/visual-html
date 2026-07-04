import * as React from "react";

const MOBILE_BREAKPOINT = 768;
const COMPACT_STUDIO_BREAKPOINT = 1024;

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    mql.addEventListener("change", onChange);
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return !!isMobile;
}

/** Builder + tablet — use compact studio below lg (1024px). */
export function useIsCompactStudio() {
  const [isCompact, setIsCompact] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${COMPACT_STUDIO_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsCompact(window.innerWidth < COMPACT_STUDIO_BREAKPOINT);
    };
    mql.addEventListener("change", onChange);
    setIsCompact(window.innerWidth < COMPACT_STUDIO_BREAKPOINT);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return !!isCompact;
}
