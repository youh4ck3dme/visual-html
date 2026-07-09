# Baseline metrics (333% upgrade)

## BEFORE (start of upgrade, `831bad5`)

| Metric | Value |
|--------|-------|
| Integrity fast | 5/6 (vitest intermittent) |
| Tests | ~652 passing |
| i18n keys | 765 EN / 765 SK |
| Main landmark | partial (split layout fixed earlier) |

## AFTER (post-upgrade, branch `cursor/lovable-editor-split`)

| Metric | Value |
|--------|-------|
| Integrity fast | 8/8 checks (tsc, vitest, eslint, build, artifacts, prod HTTP, editor i18n grep, BYOK audit) |
| iPhone lane | 3/3 with `--iphone-17-air` (`--skip-rate-limit` auto) |
| Tests | 685+ passing (editor mode buttons, bilingual sidebar/pipeline, JSX gate, console cap) |
| i18n keys | 769 EN / 769 SK (parity test enforced) |

| Os | Status |
|----|--------|
| OS1 | Lazy routes, `requestIdleCallback` projects hydrate, preview/card skeletons, console cap (100) |
| OS2 | Skip link, `PreviewSkeleton` aria-live, prompt bar labels, section landmarks, motion listener |
| OS3 | Builder preview skeleton, prompt bar states, pipeline feedback, screenshot chat timeline |
| OS4 | Auto-profile polish fix, screenshot health gate, JSX validator gate (component mode), SEO chip tests |
| OS5 | Editor mode button tests, localized generation errors, workspace hydrate skeleton |
| OS6 | `messages.test.ts` parity, SK device labels, bilingual editor tests |
| OS7 | Safe-area audit, console bridge cap test, PWA manifest ↔ app-brand |
| OS8 | Permissions-Policy, postMessage origin, BYOK audit, `--skip-rate-limit` for iPhone lane |
| OS9 | `projects.$projectId` route, thin `pages/` re-exports, DEVELOPER.md |
| OS10 | Per-route OG/twitter, canonical, JSON-LD, sitemap/robots, SEO refinement chip |

**Manual (not in CI):** Lighthouse mobile simulated throttling on production HTTPS (`https://visual-html.vercel.app`).

## AFTER production Lighthouse (2026-07-09, deploy `2c6b078`)

Lighthouse CLI 13.4.0 · mobile form factor · simulated throttling · categories: performance, accessibility, best-practices, SEO.

| Route | Perf | A11y | Best practices | SEO | FCP | LCP | TBT | CLS |
|-------|------|------|----------------|-----|-----|-----|-----|-----|
| `/` | 80 | 96 | 96 | 100 | 2.9 s | 3.9 s | 0 ms | 0 |
| `/builder` | 86 | 95 | 100 | 100 | 2.3 s | 3.8 s | 0 ms | 0 |
| `/projects` | 89 | 100 | 100 | 100 | 2.3 s | 3.3 s | 0 ms | 0 |

**Notes:** Home LCP is the softest score (hero + font load). Builder/projects benefit from route-level code splitting. Re-run locally: `npx lighthouse <url> --form-factor=mobile --throttling-method=simulate`.

**Integrity (post hotfix #8):** `test:integrity` 11/11 · `test:integrity:fast` 8/8 · 700+ unit tests.

**Perceived wait (Prompt 4):** OCR cache skip, upload preview in screenshot panel, partial builder preview after building step (`onPartialPreview`), trace heartbeat 200 ms, ETA from rolling trace durations (`trace-eta.ts`).

**Preview lightbox (PR #7):** `PreviewLightbox` + expand control on `PreviewFrame`; iPhone 17 Air tests for 44px tap target and fullscreen dialog.
