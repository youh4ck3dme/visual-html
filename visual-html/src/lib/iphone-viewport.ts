/**
 * iPhone viewport profiles for PWA shell, device preview chrome, and mobile QA.
 */
export const IPHONE_17_AIR = {
  model: "iPhone 17 Air",
  os: "iOS 26",
  devicePixelRatio: 3,
  logicalWidth: 420,
  logicalHeight: 912,
  physicalWidth: 1260,
  physicalHeight: 2736,
  safeAreaTop: 59,
  safeAreaBottom: 34,
  homeScreenIconPoints: 180,
  homeScreenIconPhysical: 540,
  minMaskableIcon: 192,
  recommendedMaskableIcon: 512,
  statusBarStyle: "black-translucent",
  displayMode: "standalone",
} as const;

/** iPhone 16 / compact class — fallback profile for older devices. */
export const IPHONE_LEGACY_COMPACT = {
  model: "iPhone compact",
  os: "iOS 26",
  devicePixelRatio: 3,
  logicalWidth: 393,
  logicalHeight: 852,
  physicalWidth: 1179,
  physicalHeight: 2556,
  safeAreaTop: 59,
  safeAreaBottom: 34,
  homeScreenIconPoints: 180,
  homeScreenIconPhysical: 540,
  minMaskableIcon: 192,
  recommendedMaskableIcon: 512,
  statusBarStyle: "black-translucent",
  displayMode: "standalone",
} as const;

export type IphoneViewportProfile = "air" | "legacy";

export type IphoneDeviceProfile = typeof IPHONE_17_AIR | typeof IPHONE_LEGACY_COMPACT;

export function getIphoneProfile(profile: IphoneViewportProfile): IphoneDeviceProfile {
  return profile === "legacy" ? IPHONE_LEGACY_COMPACT : IPHONE_17_AIR;
}

/** Picks Air vs compact label/chrome from current CSS viewport width. */
export function resolveIphoneViewportProfile(width: number): IphoneViewportProfile {
  const midpoint = (IPHONE_17_AIR.logicalWidth + IPHONE_LEGACY_COMPACT.logicalWidth) / 2;
  return width <= midpoint ? "legacy" : "air";
}

export type IphoneDeviceLabelKey =
  "builder.mobile.deviceIphone17Air" | "builder.mobile.deviceIphoneCompact";

export function iphoneDeviceLabelKey(profile: IphoneViewportProfile): IphoneDeviceLabelKey {
  return profile === "legacy"
    ? "builder.mobile.deviceIphoneCompact"
    : "builder.mobile.deviceIphone17Air";
}

export const IPHONE_17_AIR_REQUIRED_META = [
  "application-name",
  "mobile-web-app-capable",
  "apple-mobile-web-app-capable",
  "apple-mobile-web-app-status-bar-style",
] as const;

export const IPHONE_17_AIR_REQUIRED_VIEWPORT_TOKENS = [
  "width=device-width",
  "initial-scale=1",
  "viewport-fit=cover",
] as const;

export const IPHONE_17_AIR_HEAD_RELS = [
  "apple-touch-icon",
  "apple-touch-icon-precomposed",
  "manifest",
] as const;
