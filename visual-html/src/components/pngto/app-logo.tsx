import { appIconHref, APP_ICON } from "@/lib/app-brand";
import { cn } from "@/lib/utils";

export const APP_ICON_SRC = APP_ICON.android512;

type AppLogoSize = "xs" | "sm" | "md" | "lg";

const SIZE_CLASS: Record<AppLogoSize, string> = {
  xs: "h-4 w-4",
  sm: "h-8 w-8",
  md: "h-9 w-9",
  lg: "h-12 w-12",
};

const SIZE_PX: Record<AppLogoSize, number> = {
  xs: 16,
  sm: 32,
  md: 36,
  lg: 48,
};

export function AppLogo({
  size = "sm",
  className,
  shadow = false,
  title,
}: {
  size?: AppLogoSize;
  className?: string;
  shadow?: boolean;
  title?: string;
}) {
  const px = SIZE_PX[size];

  return (
    <img
      src={appIconHref(APP_ICON_SRC)}
      alt=""
      aria-hidden
      title={title}
      width={px}
      height={px}
      decoding="async"
      className={cn(
        "shrink-0 rounded-lg object-cover",
        SIZE_CLASS[size],
        shadow && "shadow-sm",
        className,
      )}
    />
  );
}