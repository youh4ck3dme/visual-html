/**
 * iPhone 17 Air (iOS 26) — PWA install & home-screen profile used by compliance tests.
 * Values reflect edge-to-edge OLED, Dynamic Island, and 3× asset scaling.
 */
export const IPHONE_17_AIR = {
  model: "iPhone 17 Air",
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
