import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import { getIphoneProfile, type IphoneViewportProfile } from "@/lib/iphone-viewport";

type EditorDeviceFrameProps = {
  children: ReactNode;
  label?: string;
  className?: string;
  /** Device width for preview chrome — defaults to iPhone 17 Air (420px). */
  profile?: IphoneViewportProfile;
};

export function EditorDeviceFrame({
  children,
  label,
  className,
  profile = "air",
}: EditorDeviceFrameProps) {
  const width = getIphoneProfile(profile).logicalWidth;

  return (
    <div className={cn("flex flex-col items-center p-3 sm:p-4", className)}>
      {label && <p className="mb-2 text-xs font-medium text-[var(--editor-muted)]">{label}</p>}
      <div
        className="mx-auto rounded-[2rem] border-[3px] border-[#3c4043] bg-black p-1.5 shadow-2xl"
        style={{ width: `min(100%, ${width}px)` }}
      >
        <div className="overflow-hidden rounded-[1.6rem] bg-white">{children}</div>
      </div>
    </div>
  );
}
