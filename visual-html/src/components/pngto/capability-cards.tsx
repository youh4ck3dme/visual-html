import { Code2, FileText, Sparkles, Wand2 } from "lucide-react";

const CAPABILITIES = [
  {
    icon: Code2,
    title: "Screenshot to HTML",
    description: "Drop a UI screenshot and get clean, editable HTML and CSS.",
  },
  {
    icon: FileText,
    title: "Document to HTML",
    description: "Recreate invoices, statements, forms, and A4 layouts.",
  },
  {
    icon: Wand2,
    title: "Refine with AI",
    description: "Improve fidelity, spacing, semantics, and print styles by instruction.",
  },
  {
    icon: Sparkles,
    title: "Export Anywhere",
    description: "Download standalone HTML, copy code, or continue in your stack.",
  },
] as const;

const TRUST_LABELS = ["Product teams", "Agencies", "Indie builders", "Design engineers"];

export function CapabilityCards() {
  return (
    <section className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Capabilities">
      {CAPABILITIES.map(({ icon: Icon, title, description }) => (
        <article
          key={title}
          className="shell-card p-4 transition-[border-color,box-shadow] duration-300 hover:border-info/40 hover:shadow-md"
        >
          <div className="mb-3 grid h-8 w-8 place-items-center rounded-md bg-info/15 text-info">
            <Icon className="h-4 w-4" aria-hidden />
          </div>
          <h3 className="text-sm font-medium text-foreground">{title}</h3>
          <p className="mt-1.5 text-xs leading-relaxed text-shell-muted">{description}</p>
        </article>
      ))}
    </section>
  );
}

export function TrustStrip() {
  return (
    <section className="mt-12 border-t border-shell-border pt-8" aria-label="Trusted by">
      <p className="text-center text-xs text-shell-muted">Trusted by engineers and designers at</p>
      <div className="mt-4 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
        {TRUST_LABELS.map((label) => (
          <span
            key={label}
            className="text-sm font-medium tracking-wide text-shell-subtle uppercase"
          >
            {label}
          </span>
        ))}
      </div>
    </section>
  );
}
