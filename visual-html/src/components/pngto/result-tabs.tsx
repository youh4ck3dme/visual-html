import { useMemo, useState } from "react";
import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CodeBlock } from "./code-block";
import { PreviewFrame } from "./preview-frame";
import { useT } from "@/hooks/use-t";
import { buildSingleFileHtml } from "@/lib/utils/build-single-file-html";
import { downloadTextFile } from "@/lib/utils/download";
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

  const downloadHtml = () => downloadTextFile("generated.html", previewDoc);

  return (
    <div className="space-y-3">
      <Tabs defaultValue="preview" className="w-full">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <TabsList>
            <TabsTrigger value="preview">{t("result.tab.preview")}</TabsTrigger>
            <TabsTrigger value="html">{t("result.tab.html")}</TabsTrigger>
            <TabsTrigger value="css">{t("result.tab.css")}</TabsTrigger>
            <TabsTrigger value="js">{t("result.tab.js")}</TabsTrigger>
            <TabsTrigger value="notes">{t("result.tab.notes")}</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            {hasJs && (
              <label
                htmlFor="preview-allow-js"
                className="flex cursor-pointer items-center gap-1.5 text-xs text-muted-foreground"
              >
                <input
                  id="preview-allow-js"
                  name="allowPreviewJavaScript"
                  type="checkbox"
                  checked={allowJs}
                  onChange={(e) => setAllowJs(e.target.checked)}
                  className="h-3.5 w-3.5 accent-primary"
                />
                {t("result.runJsInPreview")}
              </label>
            )}
            <Button size="sm" variant="outline" onClick={downloadHtml} data-testid="download-html">
              <Download className="h-4 w-4" aria-hidden /> {t("result.downloadHtml")}
            </Button>
          </div>
        </div>

        <TabsContent value="preview" className="mt-3">
          <PreviewFrame srcDoc={previewDoc} allowJs={allowJs && hasJs} className="h-130" />
        </TabsContent>
        <TabsContent value="html" className="mt-3">
          <CodeBlock code={result.html} language="html" />
        </TabsContent>
        <TabsContent value="css" className="mt-3">
          <CodeBlock code={result.css} language="css" />
        </TabsContent>
        <TabsContent value="js" className="mt-3">
          <CodeBlock code={result.javascript} language="javascript" />
        </TabsContent>
        <TabsContent value="notes" className="mt-3">
          <NotesPanel result={result} />
        </TabsContent>
      </Tabs>
    </div>
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
