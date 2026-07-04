import { useRouter } from "@tanstack/react-router";

import { useT } from "@/hooks/use-t";

/** Mirrors __root ErrorComponent button contract for tests. */
export function ErrorPageFixture({ reset }: { error: Error; reset: () => void }) {
  const { t } = useT();
  const router = useRouter();

  return (
    <div>
      <h1>{t("errorPage.heading")}</h1>
      <p>{t("errorPage.description")}</p>
      <button
        type="button"
        data-testid="error-page-retry"
        onClick={() => {
          router.invalidate();
          reset();
        }}
      >
        {t("errorPage.tryAgain")}
      </button>
      <a href="/" data-testid="error-page-go-home">
        {t("errorPage.goHome")}
      </a>
    </div>
  );
}
