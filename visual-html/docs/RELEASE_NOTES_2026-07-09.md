# Release notes — 2026-07-09 (hotfix #8)

**Commit:** `8f6871c` on `main`  
**PR:** [#8 — fix: restore integrity gate and migrate Mistral model](https://github.com/youh4ck3dme/visual-html/pull/8)  
**Production:** https://visual-html.vercel.app (deploy SHA `8f6871c`)

## Summary

This hotfix restores full CI integrity (11/11) and migrates screenshot HTML synthesis from deprecated Pixtral model IDs to **mistral-medium-3.5**. Production smoke (`runOcr` + `generateHtml`) passes end-to-end.

## Changes

- **CI:** `integrity.mjs` prepends Homebrew to PATH when spawning Bun for the Upstash rate-limit probe.
- **AI:** Default synthesis model `pixtral-large-latest` → `mistral-medium-3.5`; Mistral API error bodies surfaced in synthesis failures for faster diagnosis.
- **Config:** `.env.example` and model pricing metadata updated; root `.vercel` gitignored.

## Verification

| Gate | Result |
|------|--------|
| `npm run test:integrity` | 11/11 PASS |
| `npm run test:integrity:fast` | 8/8 PASS |
| `node scripts/smoke-generation.mjs` | PASS |
| Production deploy SHA | `8f6871c` (= `main`) |

## Rollback

If synthesis regresses: redeploy previous production commit `e165be2` and set `MISTRAL_MODEL` on Vercel to a supported vision model. Do **not** revert to `pixtral-large-latest` / `pixtral-large-2411` (Mistral returns `invalid_model`).

## Monitoring (24h)

Watch Vercel function logs for `generateHtml` / `Mistral chat error` with 4xx/5xx. No new errors observed in the first post-merge window.
