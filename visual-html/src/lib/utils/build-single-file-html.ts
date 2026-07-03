import DOMPurify from "dompurify";

// Sanitize inline JS boundary so a stray "</script>" inside strings can't break out.
function safeScript(js: string): string {
  return js.replace(/<\/script/gi, "<\\/script");
}

function escapeHtml(input: string): string {
  return input.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Strict, audited sanitization via DOMPurify. Removes <script>, inline event
// handlers (on*), javascript: URLs, SVG script vectors (e.g. <svg onload>), and
// iframe srcdoc smuggling. This is the primary defense; the sandboxed preview
// iframe (sandbox="allow-scripts" without allow-same-origin) is a second,
// independent layer.
const PURIFY_CONFIG: Parameters<typeof DOMPurify.sanitize>[1] = {
  USE_PROFILES: { html: true, svg: true },
  ALLOW_DATA_ATTR: false,
  ALLOW_ARIA_ATTR: true,
  // Belt-and-suspenders on top of the curated allowlist.
  FORBID_TAGS: ["script", "iframe", "object", "embed", "base", "meta", "link", "form"],
  FORBID_ATTR: ["srcdoc", "ping", "formaction", "target"],
};

let cachedPurifier: typeof DOMPurify | null | undefined;

function getPurifier(): typeof DOMPurify | null {
  if (cachedPurifier !== undefined) return cachedPurifier;
  // DOMPurify needs a DOM. buildSingleFileHtml runs client-side only (preview
  // memo + download handler), so window is present in practice; guard anyway.
  cachedPurifier = typeof window === "undefined" ? null : DOMPurify;
  return cachedPurifier;
}

function sanitizeHtml(html: string, wholeDocument = false): string {
  const purifier = getPurifier();
  if (!purifier) {
    // Unreachable in normal runtime (no DOM). Fail safe: render as inert text.
    return escapeHtml(html);
  }
  return purifier.sanitize(html, {
    ...PURIFY_CONFIG,
    WHOLE_DOCUMENT: wholeDocument,
  }) as string;
}

function injectHeadContent(documentHtml: string, content: string): string {
  if (/<\/head>/i.test(documentHtml)) {
    return documentHtml.replace(/<\/head>/i, `${content}\n</head>`);
  }
  if (/<body\b/i.test(documentHtml)) {
    return documentHtml.replace(/<body\b/i, `<head>${content}</head>\n<body`);
  }
  return `<head>${content}</head>\n${documentHtml}`;
}

function ensureDocumentMetadata(documentHtml: string, title: string): string {
  let html = documentHtml;
  const headBits: string[] = [];

  if (!/<!doctype/i.test(html)) html = `<!doctype html>\n${html}`;
  if (!/<meta[^>]+charset/i.test(html)) headBits.push(`<meta charset="utf-8" />`);
  if (!/name=["']viewport/i.test(html)) {
    headBits.push(`<meta name="viewport" content="width=device-width, initial-scale=1" />`);
  }
  if (!/<title[\s>]/i.test(html)) headBits.push(`<title>${escapeHtml(title)}</title>`);

  return headBits.length ? injectHeadContent(html, headBits.join("\n")) : html;
}

function injectCssIntoFullDocument(documentHtml: string, css: string): string {
  const trimmedCss = css.trim();
  if (!trimmedCss) return documentHtml;

  const style = `<style>
*,*::before,*::after{box-sizing:border-box}
img{max-width:100%;height:auto;display:block}
${trimmedCss}
</style>`;

  return injectHeadContent(documentHtml, style);
}

export interface BuildOptions {
  allowJs: boolean;
  title?: string;
}

export function buildSingleFileHtml(
  parts: { html: string; css: string; javascript: string },
  opts: BuildOptions,
): string {
  const raw = parts.html.trim();
  const isFullDoc = /^<!doctype/i.test(raw) || /<html[\s>]/i.test(raw);
  const title = opts.title ?? "Generated Preview";

  // JS-enabled preview: user has explicitly opted in. Scripts are NOT stripped;
  // the ONLY execution boundary is the iframe sandbox="allow-scripts" (without
  // allow-same-origin) in preview-frame.tsx. We still escape </script> so inline
  // script strings cannot break out of the injected <script> block.
  if (opts.allowJs) {
    if (isFullDoc) return injectCssIntoFullDocument(ensureDocumentMetadata(raw, title), parts.css);
    const script = parts.javascript.trim()
      ? `<script>${safeScript(parts.javascript)}</script>`
      : "";
    return wrapDocument(title, parts.css, raw, script);
  }

  // JS-disabled: sanitize the AI-produced HTML with DOMPurify before it is shown
  // or downloaded. This path is trustworthy without relying on the sandbox.
  if (isFullDoc) {
    const sanitized = sanitizeHtml(
      injectCssIntoFullDocument(ensureDocumentMetadata(raw, title), parts.css),
      true,
    );
    return ensureDocumentMetadata(sanitized, title);
  }
  return wrapDocument(title, parts.css, sanitizeHtml(raw), "");
}

function wrapDocument(title: string, css: string, body: string, script: string): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${title}</title>
<style>
*,*::before,*::after{box-sizing:border-box}
html,body{margin:0;padding:0}
body{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#0f172a;background:#fff}
img{max-width:100%;height:auto;display:block}
${css}
</style>
</head>
<body>
${body}
${script}
</body>
</html>`;
}
