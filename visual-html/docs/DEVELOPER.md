# Developer guide — PNGtoHTMLapp / VibeCraft

Technická dokumentácia od API cez architektúru až po testy a nasadenie.

## Cesty projektu

| Čo | Absolútna cesta |
| -- | --------------- |
| Monorepo root | `/home/asterix/Dokumenty/Projekty/PNGtoHTMLapp` |
| Aplikácia (package.json, testy, build) | `/home/asterix/Dokumenty/Projekty/PNGtoHTMLapp/visual-html` |
| Zdrojový kód | `visual-html/src/` |
| Verejné assety (PWA, favicon) | `visual-html/public/` |
| Testy | `visual-html/src/test/` + `**/*.test.ts(x)` v `src/` |
| Skripty (integrity, smoke) | `visual-html/scripts/` |
| Produkčný deploy | [visual-html.vercel.app](https://visual-html.vercel.app) |
| GitHub | [github.com/youh4ck3dme/visual-html](https://github.com/youh4ck3dme/visual-html) |

---

## Architektúra

Jedna **TanStack Start** aplikácia so zdieľaným shellom (sidebar, theme, locale, PWA).

```text
visual-html/
├── public/                 # Statické assety (favicon, manifest, ikony)
├── scripts/                # integrity.mjs, smoke-generation.mjs, …
├── electron/               # Desktop wrapper (voliteľný)
├── src/
│   ├── routes/             # File-based routing (/, /projects, /builder)
│   ├── components/
│   │   ├── pngto/          # Screenshot → HTML UI
│   │   ├── builder/        # VibeCraft builder UI
│   │   └── ui/             # shadcn/Radix komponenty
│   ├── hooks/              # use-projects, use-locale, use-theme, …
│   ├── lib/
│   │   ├── ai/             # Mistral klient, kľúče, prompty
│   │   ├── builder/        # Orchestrácia, health-check, šablóny
│   │   ├── generate.functions.ts   # Server fns: OCR, generate, refine
│   │   ├── builder.functions.ts      # Server fns: builder chat
│   │   ├── app-brand.ts    # PWA meta, theme-color, ikony
│   │   └── validation/     # Zod schémy pre API vstupy
│   ├── test/               # Integračné a button testy
│   └── styles.css
└── package.json
```

### Tok dát — Screenshot → HTML (`/`)

1. Klient zoptimalizuje obrázok v prehliadači (downscale, kompresia).
2. **`runOcr`** — upload do Vercel Blob + Mistral OCR → markdown.
3. **`generateHtml`** — Pixtral syntéza HTML/CSS/JS z obrázka + OCR + options.
4. Voliteľne **`refineHtml`** / **`continueHtml`** na úpravu výstupu.
5. Úspešná generácia sa uloží do **Projects** (localStorage).

### Tok dát — VibeCraft Builder (`/builder`)

1. Klient volá **`builderChat`** (server Mistral) alebo používa **BYOK** kľúče z localStorage.
2. `lib/builder/generate.ts` orchestruje kroky (planning, building, review, …).
3. Offline **demo mode** používa šablóny bez API kľúčov.
4. Výstup prechádza **HTML health check** podľa quality profilu (napr. Apple Glass ≥ 88).

---

## Routy

| URL | Súbor | Účel |
| --- | ----- | ---- |
| `/` | `src/routes/index.tsx` | Upload screenshotu, generovanie, refinement |
| `/projects` | `src/routes/projects.tsx` | Zoznam uložených projektov |
| `/projects/:projectId` | `src/routes/projects.$projectId.tsx` | Detail projektu |
| `/builder` | `src/routes/builder.tsx` | VibeCraft prompt-to-HTML studio |
| Shell | `src/routes/__root.tsx` | Layout, PWA head, 404, error boundary |

Query parametre (príklady):

- `/builder?startTemplateId=photo-portfolio` — auto-štart šablóny
- `/builder?qualityFix=apple-glass` — one-click polish prompt

---

## Server API (TanStack Start server functions)

Server funkcie nie sú REST endpointy v klasickom zmysle — klient ich volá cez TanStack Start RPC. V produkcii sú zabalené v `.vercel/output/functions/__server.func/_ssr/`.

### Screenshot pipeline — `src/lib/generate.functions.ts`

| Funkcia | Metóda | Popis |
| ------- | ------ | ----- |
| `runOcr` | POST | Fáza 1: Blob upload + Mistral OCR |
| `generateHtml` | POST | Fáza 2: syntéza HTML z obrázka + OCR markdown |
| `refineHtml` | POST | Refinement podľa textovej inštrukcie |
| `continueHtml` | POST | Pokračovanie nedokončeného výstupu |
| `fetchImageFromUrl` | POST | Stiahnutie PNG/JPG/WebP z HTTP(S) URL |

#### `runOcr` — vstup

```ts
{
  imageBase64: string;  // max ~10 MB po dekódovaní
  mimeType: "image/png" | "image/jpeg" | "image/webp";
}
```

#### `runOcr` — výstup

```ts
{ ok: true; ocrMarkdown: string }
| { ok: false; error: ApiError }
```

#### `generateHtml` — vstup

```ts
{
  imageBase64: string;
  mimeType: "image/png" | "image/jpeg" | "image/webp";
  ocrMarkdown: string;
  options: {
    outputMode: "static" | "single-file" | "tailwind" | "component";
    stylingMode: "vanilla-css" | "css-modules" | "tailwind" | "inline-css";
    responsiveness: "mobile-first" | "desktop-first" | "adaptive";
    accessibilityLevel: "standard" | "strict";
    additionalInstructions?: string;  // max 2000 znakov
  };
}
```

#### `generateHtml` / `refineHtml` / `continueHtml` — výstup

```ts
{ ok: true; data: { html: string; css: string; javascript: string; warnings?: string[] } }
| { ok: false; error: ApiError }
```

#### `refineHtml` — vstup

```ts
{
  prior: { html: string; css: string; javascript: string };
  instruction: string;  // 2–2000 znakov
  options: Options;     // rovnaké ako generateHtml
}
```

#### `fetchImageFromUrl` — vstup / výstup

```ts
// vstup
{ url: string }  // HTTP(S), max 2000 znakov

// výstup
{ ok: true; base64: string; mimeType: AllowedMime; fileName: string }
| { ok: false; error: ApiError }
```

### VibeCraft builder — `src/lib/builder.functions.ts`

| Funkcia | Metóda | Popis |
| ------- | ------ | ----- |
| `builderAiStatus` | POST | Či sú na serveri nastavené Mistral kľúče |
| `builderChat` | POST | Chat completion pre builder orchestráciu |

#### `builderChat` — vstup

```ts
{
  systemPrompt: string;   // max 120 000
  userPrompt: string;     // max 120 000
  model?: string;         // max 80, default z env
  keySlot?: "primary" | "secondary" | "auto";
  jsonMode?: boolean;
}
```

#### `builderChat` — výstup

```ts
{ ok: true; content: string }
| { ok: false; message: string }
```

### Chybové kódy (`ApiError`)

Bežné kódy z `src/types/generation.ts` / `generation-diagnostics.ts`:

| Kód | Význam |
| --- | ------ |
| `RATE_LIMITED` | Upstash rate limit (per IP) |
| `MISSING_BLOB_TOKEN` | Chýba `BLOB_READ_WRITE_TOKEN` |
| `BLOB_UPLOAD_FAILED` | Upload do Vercel Blob zlyhal |
| `INVALID_FILE` | Neplatný obrázok / URL |
| `JSON_REPAIR_FAILED` | AI vrátila neparsovateľný JSON |
| `SERVER_ERROR` | Neočakávaná chyba servera |

### Rate limiting

Per-IP limity cez Upstash Redis (`src/lib/rate-limit.server.ts`):

- Samostatné buckety: `ocr`, `generate`, `refine`, `continue`, `builder`
- Default: `RATE_LIMIT_BURST=5` / 60 s, `RATE_LIMIT_DAILY=100` / 24 h
- Ak Upstash chýba → fail-open (limit vypnutý)

---

## PWA a branding

Centralizované v `src/lib/app-brand.ts`:

- `APP_THEME_COLOR` — `#0f0f0f` (mobile shell)
- `APP_VIEWPORT` — `viewport-fit=cover` pre iOS
- `APP_ICON` — cesty k favicon, Android Chrome, Apple Touch, circuit SVG
- `APP_HEAD_LINKS` / `APP_PWA_META` — injektované do `__root.tsx` a SSR error page

SSR fallback pri boot chybe: `src/lib/error-page.ts` → `renderErrorPage()`.

---

## Lokálne spustenie

```bash
cd /home/asterix/Dokumenty/Projekty/PNGtoHTMLapp/visual-html
npm install
cp .env.local.template .env.local
# doplň kľúče — pozri visual-html/README.md sekciu Environment variables
npm run dev
```

Alternatíva z monorepo root:

```bash
cd /home/asterix/Dokumenty/Projekty/PNGtoHTMLapp
npm install --prefix visual-html
npm run dev
```

Dev URL: typicky `http://localhost:8080` (alebo ďalší voľný port).

### Electron (desktop)

```bash
cd /home/asterix/Dokumenty/Projekty/PNGtoHTMLapp/visual-html
npm run electron:dev      # dev + Electron okno
npm run electron:build    # production desktop build
```

---

## Testovanie

Všetky test príkazy spúšťaj z **`/home/asterix/Dokumenty/Projekty/PNGtoHTMLapp/visual-html`**.

### Hlavné príkazy

| Príkaz | Čo robí | Kedy |
| ------ | ------- | ---- |
| `npm test` | Vitest — unit + integračné testy | Po každej zmene |
| `npm run test:watch` | Vitest watch mode | Pri vývoji |
| `npm run test:integrity:fast` | tsc + vitest + eslint + build + artifacts + prod HTTP | Pred pushom (CI štýl) |
| `npm run test:integrity` | fast + env check + rate-limit + E2E smoke AI | Pred release |
| `npm run typecheck` | `tsc --noEmit` | Rýchla kontrola typov |
| `npm run lint` | ESLint `src` + `scripts` | Štýl a prettier |

### Presné príkazy (copy-paste)

```bash
# Unit testy (558+ testov)
cd /home/asterix/Dokumenty/Projekty/PNGtoHTMLapp/visual-html && npm test

# Rýchly integrity (6 kontrol, bez smoke)
cd /home/asterix/Dokumenty/Projekty/PNGtoHTMLapp/visual-html && npm run test:integrity:fast

# Plný integrity (9 kontrol, vrátane E2E generácie proti API)
cd /home/asterix/Dokumenty/Projekty/PNGtoHTMLapp/visual-html && npm run test:integrity

# Typecheck + lint
cd /home/asterix/Dokumenty/Projekty/PNGtoHTMLapp/visual-html && npm run typecheck
cd /home/asterix/Dokumenty/Projekty/PNGtoHTMLapp/visual-html && npm run lint

# Production build (Vercel preset)
cd /home/asterix/Dokumenty/Projekty/PNGtoHTMLapp/visual-html && NITRO_PRESET=vercel npm run build
```

Z monorepo root:

```bash
cd /home/asterix/Dokumenty/Projekty/PNGtoHTMLapp && npm test
cd /home/asterix/Dokumenty/Projekty/PNGtoHTMLapp && npm run test:integrity:fast
```

### Skupiny testov

```bash
cd /home/asterix/Dokumenty/Projekty/PNGtoHTMLapp/visual-html

# Všetky button/UI testy
npx vitest run src/test/buttons/

# PWA + iPhone 17 Air
npx vitest run src/test/pwa/

# Builder engine
npx vitest run src/lib/builder/

# Konkrétny súbor
npx vitest run src/test/buttons/locale-switcher.buttons.test.tsx
```

### Štruktúra testov

| Oblasť | Cesta | Príklady |
| ------ | ----- | -------- |
| Button / UI | `src/test/buttons/*.buttons.test.tsx` | builder-workspace (48), builder-mobile (19), locale-switcher (4) |
| PWA | `src/test/pwa/` | manifest, public assets, iPhone 17 Air (71) |
| Builder lib | `src/lib/builder/*.test.ts` | generate, orchestration, html-health-check |
| App brand | `src/lib/app-brand.test.ts` | PWA meta, ikony, viewport |
| Integrácia | `src/test/index-generation.server-fns.test.tsx` | Server fns mock |
| Locale / error | `src/lib/locale.test.ts`, `error-page.test.ts` | Helpers + SSR fallback |

Test utilities: `src/test/test-utils.tsx` (`renderWithProviders`), `src/test/setup.ts`, `src/test/helpers/viewport.ts`.

### Integrity suite (`scripts/integrity.mjs`)

| Flag | Efekt |
| ---- | ----- |
| `--skip-smoke` | Preskočí env check, rate-limit a E2E smoke (`test:integrity:fast`) |
| `--skip-production` | Preskočí HTTP check na produkciu |

Kontroly v plnom režime:

1. TypeScript (`tsc --noEmit`)
2. Vitest (`vitest run`)
3. ESLint (`--max-warnings 0`)
4. Production build (`NITRO_PRESET=vercel`)
5. Build artifacts (favicon, manifest, `generate.functions`, `builder.functions`)
6. Smoke env check (`scripts/smoke-generation.mjs --check-env`)
7. Rate limit test (`scripts/test-rate-limit.mjs`)
8. Production HTTP (`/`, `/favicon.ico`, `/site.webmanifest` → 200)
9. E2E smoke generácia (`scripts/smoke-generation.mjs`)

Smoke test volá reálne server funkcie na `SMOKE_BASE_URL` (default `https://visual-html.vercel.app`). Vyžaduje `.env.local` s Mistral a Blob tokenmi.

```bash
cd /home/asterix/Dokumenty/Projekty/PNGtoHTMLapp/visual-html
node scripts/smoke-generation.mjs --check-env
SMOKE_BASE_URL=http://127.0.0.1:3000 node scripts/smoke-generation.mjs
```

---

## Build a nasadenie

### Vercel

```bash
cd /home/asterix/Dokumenty/Projekty/PNGtoHTMLapp/visual-html
NITRO_PRESET=vercel npm run build
```

`vercel.json` v `visual-html/` nastavuje Nitro preset. Po push na `main` Vercel automaticky deployuje.

Overenie po deploy:

- `https://visual-html.vercel.app/`
- `https://visual-html.vercel.app/builder`
- `https://visual-html.vercel.app/site.webmanifest`

### Git workflow

```bash
cd /home/asterix/Dokumenty/Projekty/PNGtoHTMLapp
git status
git add -A
git commit -m "feat: …"
git push origin main
```

**Poznámka:** Projekt je prepojený s Lovable — nepoužívaj force push na `main` (viď `AGENTS.md`).

---

## Kľúčové súbory pre úpravy

| Úloha | Súbory |
| ----- | ------ |
| Nová routa | `src/routes/*.tsx` |
| Screenshot generovanie UI | `src/components/pngto/`, `src/hooks/use-generation-workflow.ts` |
| Builder UI | `src/components/builder/` |
| AI prompty (screenshot) | `src/lib/ai/prompts.ts` |
| Builder šablóny | `src/lib/builder/prompt-library.ts` |
| Quality profily | `src/lib/builder/quality-profiles.ts` |
| i18n (EN/SK) | `src/lib/i18n/messages.ts` |
| Projekty (localStorage) | `src/lib/projects-store.ts`, `src/hooks/use-projects.tsx` |
| PWA / favicon | `public/`, `src/lib/app-brand.ts` |
| Nový test tlačidiel | `src/test/buttons/<area>.buttons.test.tsx` |

---

## Ďalšie zdroje

- [README.md](../README.md) — používateľská dokumentácia, generovanie, env tabuľka
- [business/README.md](./business/README.md) — monetizácia a roadmap
- [prompts-image.md](./prompts-image.md) — odporúčané prompty pre screenshoty