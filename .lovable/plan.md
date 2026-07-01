
# PNGtoHTMLapp — Focused v1

Upload a UI screenshot → Mistral vision model → clean semantic HTML/CSS/JS, previewed safely and copy/downloadable. TanStack Start (this project), no PWA/history/settings/tests yet.

## Scope (v1)

Included:
- Single main route `/` with upload → options → generate → tabs (Preview / HTML / CSS / JS / Notes) → copy + download `.html` → refinement box.
- Server function calling Mistral vision (`pixtral-large-latest`) with strict JSON output, Zod validation, one JSON-repair retry.
- Sandboxed iframe preview (`srcDoc`, `sandbox=""` by default; opt-in `allow-scripts` toggle with warning).
- Output modes: Static (HTML+CSS), Single-file HTML, Tailwind (utility-first, no CDN).
- Refinement: send prior code + instruction back to the model.
- Design tokens per spec (dark, glass, `#8b5cf6` / `#22d3ee` accents).

Deferred (not in v1): `/history`, `/settings`, PWA manifest/SW, Vitest tests, Quality Score, provider abstraction beyond Mistral (interface exists but only Mistral impl), OpenAI-compatible + Mock providers.

## Secrets

Add `MISTRAL_API_KEY` (via `add_secret`) and optional `MISTRAL_MODEL` (default `pixtral-large-latest`). Read only inside server-fn handler.

## Architecture

Backend boundary — TanStack `createServerFn` (POST), not a server route, because caller is same-origin app UI, not an external webhook:

- `src/lib/generate.functions.ts` — `generateHtml({ imageBase64, mimeType, options })` and `refineHtml({ prior, instruction })`.
- `src/lib/ai/mistral.server.ts` — Mistral chat/completions call with vision content block, timeout via `AbortController` (60s), server-only.
- `src/lib/ai/prompts.ts` — system + refinement prompts from spec.
- `src/lib/ai/repair-json.ts` — strip code fences, extract first `{...}`, single retry via model if parse fails.
- `src/lib/validation/generation.ts` — Zod schemas for input (mime allowlist png/jpeg/webp, ≤10 MB) and output (`html`, `css`, `javascript`, `explanation`, `accessibilityNotes`, `responsiveNotes`, `assumptions[]`, `warnings[]`).
- `src/types/generation.ts` — shared types.

Frontend:
- `src/routes/index.tsx` — layout shell, wires components, manages state via `useState` + `useMutation` (TanStack Query already present).
- `src/components/pngto/upload-dropzone.tsx` — drag/drop + click, client-side MIME + size + dimension probe, base64 encode.
- `src/components/pngto/image-preview.tsx` — thumbnail, name/size/dims, remove.
- `src/components/pngto/generation-options.tsx` — output mode + styling + responsiveness + accessibility + extra instructions.
- `src/components/pngto/result-tabs.tsx` — Preview / HTML / CSS / JS / Notes tabs (shadcn Tabs).
- `src/components/pngto/preview-frame.tsx` — sandboxed iframe, `srcDoc` = built single-file HTML; toggle for JS with warning.
- `src/components/pngto/code-block.tsx` — read-only pre + copy button (no Monaco in v1, keeps bundle small).
- `src/components/pngto/refinement-box.tsx` — textarea + submit that calls `refineHtml`.
- `src/components/pngto/loading-steps.tsx` — cycling status messages.
- `src/lib/utils/build-single-file-html.ts` — assemble `<!doctype html>…` from parts, escape `</script>`, strip inline handlers.
- `src/lib/utils/download.ts` — Blob + anchor download helper.

Styling: extend `src/styles.css` with the spec's design tokens mapped through `@theme inline` (no hardcoded hex in components).

## Security

- API key server-only; never returned to client.
- Zod validation client + server (defense in depth).
- File: MIME sniffed against allowlist (png/jpeg/webp), size ≤10 MB, reject empty, dimension probe.
- Preview iframe: `sandbox=""` (no scripts, no same-origin) by default; JS mode = `sandbox="allow-scripts"` only, no `allow-same-origin` (so it cannot touch parent). Explicit UI warning.
- Never `dangerouslySetInnerHTML` for generated HTML — always iframe `srcDoc`.
- AI response sanitized: strip `<script>` unless JS mode; escape `</script>` in single-file build.
- Timeout + AbortController on Mistral call; normalized error codes (`INVALID_FILE`, `FILE_TOO_LARGE`, `UNSUPPORTED_FORMAT`, `AI_TIMEOUT`, `AI_INVALID_RESPONSE`, `RATE_LIMITED`, `SERVER_ERROR`).
- No logging of full base64 or API keys.

## Mistral request shape

`POST https://api.mistral.ai/v1/chat/completions` with `model: pixtral-large-latest`, `response_format: { type: "json_object" }`, `messages: [ {role:"system", content: SYSTEM_PROMPT}, {role:"user", content:[{type:"text", text: userInstructions}, {type:"image_url", image_url: "data:<mime>;base64,<...>"}]} ]`, `temperature: 0.2`, `max_tokens: 6000`.

## Delivery order

1. Tokens in `src/styles.css` + secret prompt (`MISTRAL_API_KEY`).
2. Types + Zod schemas + prompts + Mistral client + server fns.
3. UI components (upload → options → tabs → preview → refinement).
4. Wire `/` page, replace placeholder.
5. Manual smoke test via preview.

## Honest note shown in UI

Small footer line: “AI-generated code is an approximation. Review layout, accessibility, and security before shipping.”
