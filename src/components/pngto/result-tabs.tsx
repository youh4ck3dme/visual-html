import { useMemo, useState } from "react";
import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CodeBlock } from "./code-block";
import { PreviewFrame } from "./preview-frame";
import { buildSingleFileHtml } from "@/lib/utils/build-single-file-html";
import { downloadTextFile } from "@/lib/utils/download";
import type { GenerateHtmlResult } from "@/types/generation";

export function ResultTabs({ result }: { result: GenerateHtmlResult }) {
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
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="html">HTML</TabsTrigger>
            <TabsTrigger value="css">CSS</TabsTrigger>
            <TabsTrigger value="js">JS</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            {hasJs && (
              <label className="flex cursor-pointer items-center gap-1.5 text-xs text-muted-foreground">
                <input
                  type="checkbox"
                  checked={allowJs}
                  onChange={(e) => setAllowJs(e.target.checked)}
                  className="h-3.5 w-3.5 accent-[color:var(--primary)]"
                />
                Run JS in preview
              </label>
            )}
            <Button size="sm" variant="outline" onClick={downloadHtml}>
              <Download className="h-4 w-4" aria-hidden /> .html
            </Button>
          </div>
        </div>

        <TabsContent value="preview" className="mt-3">
          <PreviewFrame srcDoc={previewDoc} allowJs={allowJs && hasJs} />
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
  return (
    <div className="glass-inset space-y-4 p-4 text-sm">
      {result.explanation && (
        <Section title="Explanation">
          <p className="text-muted-foreground">{result.explanation}</p>
        </Section>
      )}
      {result.accessibilityNotes && (
        <Section title="Accessibility">
          <p className="text-muted-foreground">{result.accessibilityNotes}</p>
        </Section>
      )}
      {result.responsiveNotes && (
        <Section title="Responsive">
          <p className="text-muted-foreground">{result.responsiveNotes}</p>
        </Section>
      )}
      {result.assumptions.length > 0 && (
        <Section title="Assumptions">
          <ul className="list-inside list-disc space-y-1 text-muted-foreground">
            {result.assumptions.map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ul>
        </Section>
      )}
      {result.warnings.length > 0 && (
        <Section title="Warnings">
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
