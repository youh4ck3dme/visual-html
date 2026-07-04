import { Code2, FileText, Wand2, type LucideIcon } from "lucide-react";

import { AppLogo } from "@/components/pngto/app-logo";
import { useT } from "@/hooks/use-t";
import type { MessageKey } from "@/lib/i18n/messages";

type CapabilityItem = {
  id: string;
  titleKey: MessageKey;
  descriptionKey: MessageKey;
} & ({ icon: LucideIcon; brandIcon?: false } | { brandIcon: true; icon?: never });

const CAPABILITIES: CapabilityItem[] = [
  {
    id: "screenshot",
    icon: Code2,
    titleKey: "capability.screenshot.title",
    descriptionKey: "capability.screenshot.description",
  },
  {
    id: "document",
    icon: FileText,
    titleKey: "capability.document.title",
    descriptionKey: "capability.document.description",
  },
  {
    id: "refine",
    icon: Wand2,
    titleKey: "capability.refine.title",
    descriptionKey: "capability.refine.description",
  },
  {
    id: "export",
    brandIcon: true,
    titleKey: "capability.export.title",
    descriptionKey: "capability.export.description",
  },
];

const TRUST_LABEL_KEYS = [
  "trust.productTeams",
  "trust.agencies",
  "trust.indieBuilders",
  "trust.designEngineers",
] as const satisfies readonly MessageKey[];

export function CapabilityCards() {
  const { t } = useT();

  return (
    <section
      className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      aria-label={t("capability.aria")}
    >
      {CAPABILITIES.map((item) => (
        <article
          key={item.id}
          className="shell-card p-4 transition-[border-color,box-shadow] duration-300 hover:border-info/40 hover:shadow-md"
        >
          <div className="mb-3 grid h-8 w-8 place-items-center rounded-md bg-info/15 text-info">
            {item.brandIcon ? (
              <AppLogo size="xs" className="rounded-md" />
            ) : (
              <item.icon className="h-4 w-4" aria-hidden />
            )}
          </div>
          <h3 className="text-sm font-medium text-foreground">{t(item.titleKey)}</h3>
          <p className="mt-1.5 text-xs leading-relaxed text-shell-muted">
            {t(item.descriptionKey)}
          </p>
        </article>
      ))}
    </section>
  );
}

export function TrustStrip() {
  const { t } = useT();

  return (
    <section className="mt-12 border-t border-shell-border pt-8" aria-label={t("trust.aria")}>
      <p className="text-center text-xs text-shell-muted">{t("trust.heading")}</p>
      <div className="mt-4 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
        {TRUST_LABEL_KEYS.map((labelKey) => (
          <span
            key={labelKey}
            className="text-sm font-medium tracking-wide text-shell-subtle uppercase"
          >
            {t(labelKey)}
          </span>
        ))}
      </div>
    </section>
  );
}
