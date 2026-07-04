import { buildProjectExportHtml } from "@/lib/project-export";
import { formatBytes } from "@/lib/utils/download";
import type { GenerateHtmlResult } from "@/types/generation";

export type QaStatus = "pass" | "warn" | "fail";

export interface QaCheck {
  id: string;
  status: QaStatus;
  detail: string;
}

const SIZE_WARN_BYTES = 500_000;

function collectExternalUrls(html: string, css: string): string[] {
  const combined = `${html}\n${css}`;
  const pattern = /(?:src|href)\s*=\s*["'](https?:\/\/[^"']+)["']/gi;
  const urls: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(combined)) !== null) {
    urls.push(match[1]);
  }
  return urls;
}

/** Deterministic, offline QA checks for saved project output. */
export function runProjectQa(result: GenerateHtmlResult, projectName: string): QaCheck[] {
  const checks: QaCheck[] = [];
  const built = buildProjectExportHtml(result, projectName);

  const htmlTrimmed = result.html.trim();
  checks.push({
    id: "html-nonempty",
    status: htmlTrimmed ? "pass" : "fail",
    detail: htmlTrimmed ? "HTML body is present." : "HTML is empty.",
  });

  const usesClasses = /class\s*=\s*["'][^"']+["']/i.test(result.html);
  if (usesClasses) {
    checks.push({
      id: "css-for-classes",
      status: result.css.trim() ? "pass" : "warn",
      detail: result.css.trim()
        ? "CSS block is present alongside class attributes."
        : "HTML uses class attributes but CSS is empty.",
    });
  }

  const hasViewport = /name\s*=\s*["']viewport["']/i.test(built);
  checks.push({
    id: "viewport-meta",
    status: hasViewport ? "pass" : "fail",
    detail: hasViewport
      ? "Final built HTML includes a viewport meta tag."
      : "No viewport meta tag in built output.",
  });

  const titleMatch = built.match(/<title[^>]*>([^<]*)<\/title>/i);
  const titleText = titleMatch?.[1]?.trim() ?? "";
  checks.push({
    id: "document-title",
    status: titleText ? "pass" : "warn",
    detail: titleText
      ? `Title present: “${titleText}”.`
      : "No document title; export builder should inject a fallback.",
  });

  const imgTags = result.html.match(/<img\b[^>]*>/gi) ?? [];
  if (imgTags.length > 0) {
    const missingAlt = imgTags.filter((tag) => !/\balt\s*=/i.test(tag));
    checks.push({
      id: "image-alt",
      status:
        missingAlt.length === 0 ? "pass" : missingAlt.length < imgTags.length ? "warn" : "fail",
      detail:
        missingAlt.length === 0
          ? `All ${imgTags.length} image(s) include an alt attribute.`
          : `${missingAlt.length} of ${imgTags.length} image(s) missing alt.`,
    });
  }

  const externals = collectExternalUrls(result.html, result.css);
  checks.push({
    id: "external-resources",
    status: externals.length > 0 ? "warn" : "pass",
    detail:
      externals.length > 0
        ? `Found ${externals.length} external URL(s): ${externals.slice(0, 3).join(", ")}${externals.length > 3 ? "…" : ""}`
        : "No http(s) external src/href detected in HTML/CSS.",
  });

  const hasJsSource = result.javascript.trim().length > 0 || /<script\b/i.test(result.html);
  checks.push({
    id: "inline-scripts",
    status: hasJsSource ? "warn" : "pass",
    detail: hasJsSource
      ? "Source includes JavaScript; export preview disables scripts by default."
      : "No JavaScript detected in source output.",
  });

  const size = new TextEncoder().encode(built).length;
  checks.push({
    id: "output-size",
    status: size > SIZE_WARN_BYTES ? "warn" : "pass",
    detail: `Built HTML size is ${formatBytes(size)}.`,
  });

  if (result.warnings.length > 0) {
    checks.push({
      id: "generation-warnings",
      status: "warn",
      detail: result.warnings.join(" · "),
    });
  }

  if (result.assumptions.length > 0) {
    checks.push({
      id: "generation-assumptions",
      status: "warn",
      detail: result.assumptions.join(" · "),
    });
  }

  return checks;
}
