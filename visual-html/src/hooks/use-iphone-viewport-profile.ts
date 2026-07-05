"use client";

import { useEffect, useState } from "react";

import {
  iphoneDeviceLabelKey,
  resolveIphoneViewportProfile,
  type IphoneDeviceLabelKey,
  type IphoneViewportProfile,
} from "@/lib/iphone-viewport";

export function useIphoneViewportProfile(): IphoneViewportProfile {
  const [profile, setProfile] = useState<IphoneViewportProfile>(() =>
    typeof window !== "undefined" ? resolveIphoneViewportProfile(window.innerWidth) : "air",
  );

  useEffect(() => {
    const sync = () => setProfile(resolveIphoneViewportProfile(window.innerWidth));
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, []);

  return profile;
}

export function useIphoneDeviceLabelKey(): IphoneDeviceLabelKey {
  return iphoneDeviceLabelKey(useIphoneViewportProfile());
}
