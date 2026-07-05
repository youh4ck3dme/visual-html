/** Inject into preview HTML to forward console.* to parent via postMessage. */
export const PREVIEW_CONSOLE_BRIDGE_SCRIPT = `
(function(){
  if (window.__pngtoConsoleBridge) return;
  window.__pngtoConsoleBridge = true;
  var levels = ['log','warn','error','info'];
  levels.forEach(function(level){
    var orig = console[level];
    console[level] = function(){
      try {
        parent.postMessage({
          type: 'pngto-preview-console',
          level: level,
          args: Array.prototype.slice.call(arguments).map(function(a){
            try { return typeof a === 'object' ? JSON.stringify(a) : String(a); }
            catch(e) { return String(a); }
          }),
          ts: Date.now()
        }, '*');
      } catch(e) {}
      return orig.apply(console, arguments);
    };
  });
})();
`;

export type PreviewConsoleEntry = {
  id: string;
  level: "log" | "warn" | "error" | "info";
  args: string[];
  ts: number;
};

export function parsePreviewConsoleMessage(data: unknown): PreviewConsoleEntry | null {
  if (!data || typeof data !== "object") return null;
  const msg = data as Record<string, unknown>;
  if (msg.type !== "pngto-preview-console") return null;
  const level = msg.level;
  if (level !== "log" && level !== "warn" && level !== "error" && level !== "info") return null;
  const args = Array.isArray(msg.args) ? msg.args.map(String) : [];
  const ts = typeof msg.ts === "number" ? msg.ts : Date.now();
  return { id: `${ts}-${Math.random().toString(36).slice(2, 8)}`, level, args, ts };
}

export function injectConsoleBridge(html: string): string {
  if (html.includes("__pngtoConsoleBridge")) return html;
  const script = `<script>${PREVIEW_CONSOLE_BRIDGE_SCRIPT}</script>`;
  if (html.includes("</head>")) return html.replace("</head>", `${script}</head>`);
  if (html.includes("<body")) return html.replace(/<body([^>]*)>/i, `<body$1>${script}`);
  return script + html;
}

export function isPreviewConsoleMessage(
  data: unknown,
): data is { type: "entry"; entry: PreviewConsoleEntry } {
  if (!data || typeof data !== "object") return false;
  const msg = data as Record<string, unknown>;
  return msg.type === "entry" && typeof msg.entry === "object" && msg.entry !== null;
}

/** Normalize legacy bridge postMessage payloads into PreviewConsoleEntry. */
export function normalizePreviewConsoleMessage(data: unknown): PreviewConsoleEntry | null {
  const legacy = parsePreviewConsoleMessage(data);
  if (legacy) return legacy;
  if (isPreviewConsoleMessage(data)) return data.entry;
  return null;
}

export const PREVIEW_CONSOLE_MAX_ENTRIES = 100;

/** Cap console stream length to avoid main-thread churn in long preview sessions. */
export function capPreviewConsoleEntries(entries: PreviewConsoleEntry[]): PreviewConsoleEntry[] {
  return entries.length > PREVIEW_CONSOLE_MAX_ENTRIES
    ? entries.slice(-PREVIEW_CONSOLE_MAX_ENTRIES)
    : entries;
}
