// Sanitize inline JS boundary so a stray "</script>" inside strings can't break out.
function safeScript(js: string): string {
  return js.replace(/<\/script/gi, "<\\/script");
}

// Strip inline event handlers (onclick=, onload=, ...) and javascript: URLs.
function stripInlineHandlers(html: string): string {
  return html
    .replace(/\son[a-z]+\s*=\s*"[^"]*"/gi, "")
    .replace(/\son[a-z]+\s*=\s*'[^']*'/gi, "")
    .replace(/\son[a-z]+\s*=\s*[^\s>]+/gi, "")
    .replace(/(href|src)\s*=\s*"\s*javascript:[^"]*"/gi, '$1="#"')
    .replace(/(href|src)\s*=\s*'\s*javascript:[^']*'/gi, "$1='#'");
}

function stripScripts(html: string): string {
  return html.replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, "");
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
  const cleanedBody = opts.allowJs
    ? stripInlineHandlers(raw)
    : stripInlineHandlers(stripScripts(raw));

  if (isFullDoc) {
    // If AI returned a full document, still enforce our JS policy.
    return opts.allowJs ? cleanedBody : stripScripts(cleanedBody);
  }

  const title = opts.title ?? "Generated Preview";
  const script =
    opts.allowJs && parts.javascript.trim()
      ? `<script>${safeScript(parts.javascript)}</script>`
      : "";

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
${parts.css}
</style>
</head>
<body>
${cleanedBody}
${script}
</body>
</html>`;
}
