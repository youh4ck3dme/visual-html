# VibeCraft

[![CI](https://github.com/youh4ck3dme/vibecraft/actions/workflows/ci.yml/badge.svg)](https://github.com/youh4ck3dme/vibecraft/actions/workflows/ci.yml)

VibeCraft is a local-first, browser-based app builder for generating and editing standalone single-file HTML applications. It ships with honest offline templates, an editable code view, sandboxed preview rendering, revision history, a static HTML risk scanner, and optional AI generation through Mistral or Gemini.

Production: https://vibecraft.rubberduck.sk

## Production Status

| Area | Status |
| --- | --- |
| Custom domain | `https://vibecraft.rubberduck.sk` |
| Hosting | Vercel |
| AI backend | Hardened Mistral server proxy at `/api/mistral` |
| Browser fallback | Optional user-owned Mistral/Gemini API keys in localStorage |
| CI | GitHub Actions runs `npm run check` on push and pull request |

## What It Does

- Loads curated starter templates in `Demo Offline Mode` without using AI or tokens.
- Generates, refines, fixes, or explains single-file HTML apps when AI is configured.
- Uses a Vercel serverless Mistral proxy in production when `VITE_MISTRAL_SERVER_PROXY=true`.
- Lets users edit generated HTML directly and save manual revisions.
- Runs generated HTML in a sandboxed iframe and flags risky patterns such as external scripts, inline handlers, hidden iframes, and likely API keys.

## Local Setup

```bash
npm ci
npm run dev
```

The Vite dev server will print the local URL. In local development without production env, the app can still run in offline template mode or use browser-stored keys from Settings.

## Environment

Copy the example file and fill only your local values:

```bash
cp .env.example .env.local
```

Never commit `.env`, `.env.local`, or pulled Vercel env files. They are ignored by Git.

Production Vercel env variables:

```text
MISTRAL_API_KEY_1
MISTRAL_API_KEY_2
MISTRAL_MODEL
VITE_MISTRAL_SERVER_PROXY
```

`MISTRAL_API_KEY_1` and `MISTRAL_API_KEY_2` are server-only secrets. Do not expose them with a `VITE_` prefix.

## Scripts

```bash
npm run dev          # Start local Vite dev server
npm run lint         # Run ESLint
npm run build        # TypeScript + production Vite build
npm run test:api     # Unit tests for the Mistral proxy
npm run test:smoke   # Playwright smoke tests
npm run test         # API tests + all Playwright tests
npm run check        # Lint + build + API tests + smoke tests
npm run smoke:prod   # Verify production homepage and proxy preflight
```

To intentionally verify a real Mistral production call:

```bash
VIBECRAFT_VERIFY_MISTRAL=1 npm run smoke:prod
```

That command spends a small amount of Mistral API usage. The default production smoke check does not call the model.

## Deployment

The project is configured for Vercel with `vercel.json`.

Safe production flow:

```bash
npm run check
npm run smoke:prod
vercel --prod
```

The production proxy allows requests from `https://vibecraft.rubberduck.sk` and from the exact Vercel deployment origin exposed by `VERCEL_URL`.

## Security Notes

- Server Mistral keys live only in Vercel env.
- Browser API keys, when manually entered in Settings, are stored in that browser's localStorage and sent directly to the selected provider.
- The Mistral proxy validates method, content type, origin, prompt fields, prompt size, and model name before calling Mistral.
- Origin checks reduce browser abuse but are not full authentication. For a public launch with meaningful traffic, add rate limiting, Vercel Firewall rules, and usage monitoring.

See [SECURITY.md](./SECURITY.md) for disclosure and operational notes.

## Git Hygiene

Ignored local artifacts include:

- `node_modules/`
- `dist/`
- `test-results/`
- Playwright reports
- `.vercel/`
- `.env*` except `.env.example`
- generated verification screenshots

Run this before publishing:

```bash
git status --short
git diff --check
npm run check
```
