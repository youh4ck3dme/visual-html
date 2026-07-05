import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export type ScreenshotChatSender = "user" | "ai";

export function ScreenshotChatBubble({
  sender,
  children,
  className,
  testId,
}: {
  sender: ScreenshotChatSender;
  children: ReactNode;
  className?: string;
  testId?: string;
}) {
  return (
    <div
      className={cn(
        "max-w-[90%] text-sm motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-1 motion-safe:duration-200",
        sender === "user" ? "self-end" : "self-start",
        className,
      )}
      data-testid={testId}
    >
      <div
        className={cn(
          "rounded-xl px-3 py-2 leading-relaxed",
          sender === "user"
            ? "rounded-br-none border border-primary/30 bg-primary/10"
            : "rounded-bl-none border border-[var(--editor-border)] bg-[var(--editor-panel)]",
        )}
      >
        {children}
      </div>
    </div>
  );
}
