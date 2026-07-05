import { useEffect, useRef, useState } from "react";

import { prefersReducedMotion, subscribeReducedMotion } from "@/lib/motion-prefs";

/** Smoothly animates toward `target` over `durationMs` (pipeline progress display). */
export function useAnimatedNumber(target: number, durationMs = 400): number {
  const [display, setDisplay] = useState(target);
  const [reducedMotion, setReducedMotion] = useState(prefersReducedMotion);
  const frameRef = useRef<number | null>(null);
  const startRef = useRef({ value: target, time: 0 });

  useEffect(() => subscribeReducedMotion(setReducedMotion), []);

  useEffect(() => {
    if (reducedMotion) {
      setDisplay(target);
      return;
    }

    const from = display;
    if (from === target) return;

    startRef.current = { value: from, time: performance.now() };

    const tick = (now: number) => {
      const elapsed = now - startRef.current.time;
      const t = Math.min(1, elapsed / durationMs);
      const eased = 1 - (1 - t) ** 3;
      const next = Math.round(startRef.current.value + (target - startRef.current.value) * eased);
      setDisplay(next);
      if (t < 1) {
        frameRef.current = requestAnimationFrame(tick);
      }
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- animate from last display
  }, [target, durationMs, reducedMotion]);

  return display;
}
