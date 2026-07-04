import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type EditorDeviceFrameProps = {
  children: ReactNode;
  label?: string;
  className?: string;
};

export function EditorDeviceFrame({ children, label, className }: EditorDeviceFrameProps) {
  return (
    <div className={cn("flex flex-col items-center p-3 sm:p-4", className)}>
      {label && (
        <p className="mb-2 text-xs font-medium text-[var(--editor-muted)]">{label}</p>
      )}
      <div className="mx-auto w-[min(100%,375px)] rounded-[2rem] border-[3px] border-[#3c4043] bg-black p-1.5 shadow-2xl">
        <div className="overflow-hidden rounded-[1.6rem] bg-white">{children}</div>
      </div>
    </div>
  );
}
