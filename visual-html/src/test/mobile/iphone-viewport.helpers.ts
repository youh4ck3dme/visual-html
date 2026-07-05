import type { ReactElement } from "react";

import { renderWithProviders } from "@/test/test-utils";
import { mockSafeAreaInsets, setIphoneViewport } from "@/test/helpers/viewport";
import { getIphoneProfile, type IphoneViewportProfile } from "@/lib/iphone-viewport";

export { getIphoneProfile, IPHONE_17_AIR, IPHONE_LEGACY_COMPACT } from "@/lib/iphone-viewport";
export type { IphoneViewportProfile } from "@/lib/iphone-viewport";

/** Sets iPhone viewport + safe-area tokens before rendering mobile UI tests. */
export function setupIphoneTest(profile: IphoneViewportProfile = "air") {
  setIphoneViewport(profile);
  const device = getIphoneProfile(profile);
  mockSafeAreaInsets({ top: device.safeAreaTop, bottom: device.safeAreaBottom });
}

export function renderAtIphone(ui: ReactElement, profile: IphoneViewportProfile = "air") {
  setupIphoneTest(profile);
  return renderWithProviders(ui);
}

/** Simple health score for iPhone integrity summary (0–100). */
export function computeAppIphoneHealthScore(checks: boolean[]): number {
  if (checks.length === 0) return 0;
  const passed = checks.filter(Boolean).length;
  return Math.round((passed / checks.length) * 100);
}
