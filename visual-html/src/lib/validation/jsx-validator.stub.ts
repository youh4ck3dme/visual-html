export type JsxValidationResult = { ok: true } | { ok: false; error: string };

/** P6 stub — full acorn-jsx validation deferred. */
export function validateJsxSnippet(code: string): JsxValidationResult {
  if (!code.includes("<") || !code.includes(">")) {
    return { ok: false, error: "No JSX-like markup detected" };
  }
  if (code.includes("</script>")) {
    return { ok: false, error: "Suspicious script close tag" };
  }
  return { ok: true };
}
