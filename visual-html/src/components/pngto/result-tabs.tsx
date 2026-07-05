import { useMemo, useState } from "react";

import { OutputPanel } from "@/components/app/output-panel";
import { useT } from "@/hooks/use-t";
import { buildSingleFileHtml } from "@/lib/utils/build-single-file-html";
import type { GenerateHtmlResult } from "@/types/generation";

export function ResultTabs({ result }: { result: GenerateHtmlResult }) {
  const { t } = useT();
  const [allowJs, setAllowJs] = useState(false);
  const hasJs = result.javascript.trim().length > 0;

  const previewDoc = useMemo(
    () =>
      buildSingleFileHtml(
        { html: result.html, css: result.css, javascript: result.javascript },
        { allowJs: allowJs && hasJs },
      ),
    [result.html, result.css, result.javascript, allowJs, hasJs],
  );

  return (
    <OutputPanel
      variant="generation"
      previewDoc={previewDoc}
      html={result.html}
      css={result.css}
      javascript={result.javascript}
      showAllowJs
      hasJs={hasJs}
      allowJs={allowJs}
      onAllowJsChange={setAllowJs}
      allowJsInputId="preview-allow-js"
      showDownload
      downloadFileName="generated.html"
      notesContent={<NotesPanel result={result} />}
    />
  );
}

function NotesPanel({ result }: { result: GenerateHtmlResult }) {
  const { t } = useT();

  return (
    <div className="glass-inset space-y-4 p-4 text-sm">
      {result.explanation && (
        <Section title={t("result.notes.explanation")}>
          <p className="text-muted-foreground">{result.explanation}</p>
        </Section>
      )}
      {result.accessibilityNotes && (
        <Section title={t("result.notes.accessibility")}>
          <p className="text-muted-foreground">{result.accessibilityNotes}</p>
        </Section>
      )}
      {result.responsiveNotes && (
        <Section title={t("result.notes.responsive")}>
          <p className="text-muted-foreground">{result.responsiveNotes}</p>
        </Section>
      )}
      {result.assumptions.length > 0 && (
        <Section title={t("result.notes.assumptions")}>
          <ul className="list-inside list-disc space-y-1 text-muted-foreground">
            {result.assumptions.map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ul>
        </Section>
      )}
      {result.warnings.length > 0 && (
        <Section title={t("result.notes.warnings")}>
          <ul className="list-inside list-disc space-y-1 text-destructive/90">
            {result.warnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </Section>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider text-foreground/80">
        {title}
      </h3>
      {children}
    </div>
  );
}
