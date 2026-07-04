import type { GenerateHtmlResult } from "@/types/generation";
import { buildSingleFileHtml } from "@/lib/utils/build-single-file-html";

/** Safe single-file HTML for export preview, download, and Builder import (scripts off). */
export function buildProjectExportHtml(result: GenerateHtmlResult, projectName: string): string {
  return buildSingleFileHtml(
    { html: result.html, css: result.css, javascript: result.javascript },
    { allowJs: false, title: projectName },
  );
}

export function projectExportFilename(projectName: string): string {
  const slug = projectName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `${slug || "export"}.html`;
}
