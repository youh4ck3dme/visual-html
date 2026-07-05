import { describe, expect, it } from "vitest";

import {
  getIphoneProfile,
  IPHONE_17_AIR,
  IPHONE_LEGACY_COMPACT,
  iphoneDeviceLabelKey,
  resolveIphoneViewportProfile,
} from "@/lib/iphone-viewport";

describe("iphone-viewport profiles", () => {
  it("Air profile is 420×912 @3x", () => {
    expect(IPHONE_17_AIR.logicalWidth).toBe(420);
    expect(IPHONE_17_AIR.logicalHeight).toBe(912);
    expect(IPHONE_17_AIR.physicalWidth).toBe(1260);
  });

  it("legacy compact profile is 393×852 @3x", () => {
    expect(IPHONE_LEGACY_COMPACT.logicalWidth).toBe(393);
    expect(IPHONE_LEGACY_COMPACT.logicalHeight).toBe(852);
    expect(IPHONE_LEGACY_COMPACT.physicalWidth).toBe(1179);
  });

  it("getIphoneProfile returns correct profile by key", () => {
    expect(getIphoneProfile("air").logicalWidth).toBe(420);
    expect(getIphoneProfile("legacy").logicalWidth).toBe(393);
  });

  it("resolveIphoneViewportProfile picks air at 420 and legacy at 393", () => {
    expect(resolveIphoneViewportProfile(420)).toBe("air");
    expect(resolveIphoneViewportProfile(393)).toBe("legacy");
  });

  it("iphoneDeviceLabelKey maps profile to i18n key", () => {
    expect(iphoneDeviceLabelKey("air")).toBe("builder.mobile.deviceIphone17Air");
    expect(iphoneDeviceLabelKey("legacy")).toBe("builder.mobile.deviceIphoneCompact");
  });
});
