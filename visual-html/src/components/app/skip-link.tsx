import { useT } from "@/hooks/use-t";

/** Skip navigation link — visible on keyboard focus. */
export function SkipLink() {
  const { t } = useT();

  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      data-testid="skip-to-content"
    >
      {t("a11y.skipToContent")}
    </a>
  );
}
