# PNGtoHTMLapp

AI web app for turning UI screenshots into clean, semantic HTML with a live preview and refinement loop. Includes an integrated **VibeCraft** prompt-to-HTML builder and a local **Projects** library.

**Produkcia:** [visual-html.vercel.app](https://visual-html.vercel.app)

## Dokumentácia

| Dokument | Obsah |
| -------- | ----- |
| [docs/DEVELOPER.md](docs/DEVELOPER.md) | **Kompletná technická dokumentácia** — API, Builder background, testy |
| [docs/RELEASE_CHECKLIST.md](docs/RELEASE_CHECKLIST.md) | **QA & release checklist** pred deployom |
| [docs/README.md](docs/README.md) | Index dokumentácie |
| [docs/business/README.md](docs/business/README.md) | Biznis a monetizácia |
| [src/routes/README.md](src/routes/README.md) | TanStack routing konvencie |
| [AGENTS.md](AGENTS.md) | Pravidlá pre AI agentov (Lovable) |

**Cesta projektu:** `/home/asterix/Dokumenty/Projekty/PNGtoHTMLapp/visual-html`

## Unified app

One TanStack Start application (`visual-html/`) with a shared sidebar, theme switcher, and design tokens:

| Route       | Purpose                                                                                                                   |
| ----------- | ------------------------------------------------------------------------------------------------------------------------- |
| `/`         | **New** — upload a UI screenshot and generate HTML (Mistral OCR + synthesis)                                              |
| `/projects` | **Projects** — browse and reopen saved screenshot generations (localStorage)                                              |
| `/builder`  | **VibeCraft** — prompt-to-HTML app builder with offline templates, AI generation, sandboxed preview, and revision history |

From the monorepo root:

```bash
cd PNGtoHTMLapp
npm run dev      # starts visual-html on http://localhost:8080 (or next free port)
npm run build
npm run test
npm run lint
```

## Top competition

Najblizsia priama konkurencia je **Screenshot to Code**: <https://screenshottocode.com> a <https://github.com/abi/screenshot-to-code>.

Je to najpodobnejsi produkt, pretoze riesi rovnaky core use case: pouzivatel nahra screenshot, mockup, Figma dizajn alebo screen recording a AI z toho generuje frontend kod. Podporuje HTML + CSS, HTML + Tailwind, React + Tailwind, Vue + Tailwind, Bootstrap a dalsie stacky. Je silny hlavne tym, ze ma hosted app, open-source/self-host moznost, viac AI providerov a velmi silny GitHub signal.

Pre Visual HTML je preto najdolezitejsie nebyt iba dalsia kopia vseobecneho screenshot-to-code nastroja. Najsilnejsia diferenciacia je zameranie na verne HTML rekonstrukcie hustych UI obrazoviek, dokumentov, tabuliek, bankovych vypisov, faktur, formularov a A4 print layoutov s preview, refinement loopom, standalone exportom, OCR warnings a QA dashboardom.

Najdolezitejsi benchmark:

- **Top 1 direct competitor:** Screenshot to Code / screenshottocode.com.
- **Top commercial design-to-code benchmark:** Locofy.ai.
- **Top enterprise design-to-code benchmark:** Builder.io Visual Copilot.

Strategicka pozicia Visual HTML:

> Screenshot to Code je vseobecny screenshot-to-code nastroj. Visual HTML sa ma odlisit ako specializovany screenshot/document-to-HTML workflow pre verne UI, dokumenty, tabulky a A4/print vystupy s QA kontrolou.

## Features

### Screenshot → HTML (`/`)

- Upload PNG, JPG, or WebP UI screenshots
- Automatically downscale and compress large screenshots before sending them to Mistral
- Upload screenshots to Vercel Blob for OCR preprocessing
- Generate semantic HTML, CSS, and optional JavaScript from Mistral OCR + Pixtral synthesis
- Refine previous output with follow-up instructions
- Preview generated output in a sandboxed frame
- Copy or download generated code
- Tune generation via output, styling, responsiveness, and accessibility options
- Auto-save successful generations to **Projects**

### Projects (`/projects`)

- Local project library (name, thumbnail, generation options, HTML output)
- Open, rename, duplicate, and delete saved projects

### VibeCraft builder (`/builder`)

- Starter templates (games, dashboards, portfolios, landing pages)
- AI build / refine / fix / explain modes (server Mistral or browser BYOK keys)
- Sandboxed live preview, code view, risk scanner, version history
- Demo mode without API keys (offline templates only)
- **Background generation** — `BuilderWorkspaceProvider` v `__root.tsx` drží stav globálne; generovanie pokračuje aj po odchode z `/builder`; sidebar badge + completion toast s **Open Builder**; workspace v `localStorage` kľúč `vibecraft_workspace_v1` (detail: [docs/DEVELOPER.md](docs/DEVELOPER.md#builder-background-generation-global-workspace))

> PNG→HTML generovanie na `/` zostáva viazané na index stránku (`useGenerationWorkflow`) — nie je globálne ako VibeCraft.

## Ako nastavit generovanie

Moznosti v paneli generovania neriesia to iste. Kazda ovlada inu cast vysledku:

- **Output** urcuje format vysledku.
- **Styling** urcuje, ako bude zapisane CSS.
- **Responsiveness** urcuje, pre aku obrazovku ma AI prioritne skladat layout.
- **Accessibility** urcuje, ako prisne ma AI riesit semantiku, aria labely, alt texty a kontrast.
- **Extra instructions** su konkretne pokyny pre dany screenshot.

Najlepsi default pre hlavny ciel aplikacie, teda verne prekreslenie screenshotu do HTML, je:

- Output: `Static HTML + CSS`
- Styling: `Vanilla CSS`
- Responsiveness: `Adaptive`
- Accessibility: `Strict (WCAG AA)`

Tento preset je nastaveny ako predvoleny stav aplikacie.

Pre obrazky plati: idealne pouzi screenshot do `700 KB`, akceptovatelne maximum je priblizne `1.2 MB`, dlhsia strana najviac `1600 px`. Velke full-page screenshoty radsej orez alebo rozdel na viac casti.

### Output

#### Static HTML + CSS

Vygeneruje oddelene HTML, CSS a pripadne JavaScript.

Pouzi ho pre najcistejsi a najlahsie upravitelny vysledok. Toto je najlepsia univerzalna volba pre vacsinu screenshotov.

Odporucana kombinacia:

- Output: `Static HTML + CSS`
- Styling: `Vanilla CSS`
- Responsiveness: `Adaptive`
- Accessibility: `Strict (WCAG AA)`

#### Single-file HTML

Vygeneruje cely vysledok ako jeden HTML dokument so stylmi vnutri `<style>`.

Pouzi ho, ked chces jeden subor, ktory sa da rovno otvorit v prehliadaci alebo niekomu poslat.

Odporucana kombinacia:

- Output: `Single-file HTML`
- Styling: `Vanilla CSS`
- Responsiveness: `Adaptive`
- Accessibility: `Strict (WCAG AA)`

Nepouzivaj ho ako prvu volbu, ak chces vysledok dalej rozdelit do komponentov v projekte.

#### Tailwind

Vygeneruje HTML s Tailwind utility triedami.

Pouzi ho iba vtedy, ked cielovy projekt uz pouziva Tailwind CSS. Aplikacia nepridava Tailwind CDN, takze Tailwind musi byt pripraveny v projekte, kam kod vlozis.

Odporucana kombinacia:

- Output: `Tailwind`
- Styling: `Tailwind classes`
- Responsiveness: `Mobile-first`
- Accessibility: `Strict (WCAG AA)`

#### Component-style

Vygeneruje strukturu vhodnejsiu na prerobenie do komponentu.

Pouzi ho, ked chces vystup neskor preniest do React, Vue, Svelte alebo podobneho komponentoveho workflow.

Odporucana kombinacia:

- Output: `Component-style`
- Styling: `CSS Modules` alebo `Vanilla CSS`
- Responsiveness: `Adaptive`
- Accessibility: `Strict (WCAG AA)`

Nepouzivaj ho ako prvu volbu, ak chces len co najvernejsi staticky HTML remake screenshotu.

### Styling

#### Vanilla CSS

Klasicke CSS s triedami. Je to najlepsia univerzalna volba, ak nevies, co vybrat.

Dobre pre:

- verne prekreslenie screenshotu
- cisty HTML/CSS vystup
- jednoduche dalsie upravy
- single-file HTML

#### CSS Modules

CSS styl vhodny pre komponentove projekty.

Pouzi ho, ked chces vystup preniest do React alebo podobneho frameworku a nechces globalne CSS triedy.

Dobre pre:

- `Component-style`
- vacsie UI casti
- projekty s build systemom, ktory podporuje CSS Modules

Nie je idealny pre jednoduchy jednosuborovy HTML export.

#### Tailwind classes

Pouzije Tailwind utility triedy priamo v HTML.

Pouzi iba vtedy, ked cielovy projekt pouziva Tailwind.

Najlepsia kombinacia:

- Output: `Tailwind`
- Styling: `Tailwind classes`

Ak Tailwind v projekte nemas, vysledok nebude vyzerat spravne bez dalsieho nastavenia.

#### Inline styles

Vlozi styly priamo do `style=""` atributov.

Pouzi iba v specialnych pripadoch, napriklad pre velmi jednoduchy embed alebo rychly prototyp.

Nevyhody:

- horsia citatelnost
- tazsie upravy
- horsie opakovanie stylov
- nevhodne pre vacsie stranky

### Responsiveness

#### Mobile-first

AI sklada layout primarne od mobilu nahor.

Pouzi pre:

- mobilne screenshoty
- responzivne landing pages
- UI, ktore ma dobre fungovat na telefone

Odporucana kombinacia:

- Output: `Static HTML + CSS`
- Styling: `Vanilla CSS`
- Responsiveness: `Mobile-first`
- Accessibility: `Strict (WCAG AA)`

#### Desktop-first

AI sklada layout primarne podla desktop screenshotu.

Pouzi pre:

- dashboardy
- admin panely
- SaaS rozhrania
- screenshoty z velkej obrazovky
- pripady, kde chces co najvernejsie zachovat desktop layout

Odporucana kombinacia:

- Output: `Static HTML + CSS`
- Styling: `Vanilla CSS`
- Responsiveness: `Desktop-first`
- Accessibility: `Strict (WCAG AA)`

#### Adaptive

AI ma spravit rozumne spravanie pre viac velkosti obrazovky.

Pouzi, ked screenshot vyzera ako web alebo appka a chces pouzitelny vysledok na mobile aj desktope.

Toto je najlepsia univerzalna volba, ak si nie si isty.

Odporucana kombinacia:

- Output: `Static HTML + CSS`
- Styling: `Vanilla CSS`
- Responsiveness: `Adaptive`
- Accessibility: `Strict (WCAG AA)`

### Accessibility

#### Standard

Zakladna semantika, alt texty a rozumne HTML.

Pouzi pri rychlom prototype alebo ked riesis hlavne vizualnu podobnost.

#### Strict (WCAG AA)

Prisnejsi vystup s dorazom na:

- semanticke HTML
- aria labely
- alt texty
- citatelny kontrast
- spravne tlacidla a formulare
- lepsiu navigaciu pre asistivne technologie

Toto je odporucana volba pre finalny alebo seriozny vystup.

### Extra instructions

Sem napis konkretne pokyny pre dany screenshot. Cim presnejsie povies, co ma AI zachovat, tym menej bude vymyslat.

Dobre priklady:

```txt
Recreate the screenshot as closely as possible. Keep the desktop layout. Use exact visible text. Do not invent extra sections.
```

```txt
This is a dashboard screenshot. Preserve the sidebar, top navigation, cards, table layout, spacing, and muted enterprise style.
```

```txt
Focus on visual accuracy. If an icon is unclear, use a simple placeholder with the same size.
```

```txt
Generate clean semantic HTML and CSS only. Avoid JavaScript unless it is required for visible UI behavior.
```

Zle alebo prilis nejasne pokyny:

```txt
Make it nice.
```

```txt
Do everything perfectly.
```

```txt
Make it modern and cool.
```

### Odporucane kombinacie

#### Najlepsia univerzalna kombinacia

Pouzi na vacsinu screenshotov.

- Output: `Static HTML + CSS`
- Styling: `Vanilla CSS`
- Responsiveness: `Adaptive`
- Accessibility: `Strict (WCAG AA)`

Extra instructions:

```txt
Recreate the screenshot as closely as possible. Preserve layout, spacing, colors, typography, visible text, buttons, cards, forms, and navigation. Do not invent unrelated content.
```

#### Najvernejsie prekreslenie desktop screenshotu

Pouzi pri screenshotoch z notebooku alebo velkeho monitora.

- Output: `Static HTML + CSS`
- Styling: `Vanilla CSS`
- Responsiveness: `Desktop-first`
- Accessibility: `Strict (WCAG AA)`

Extra instructions:

```txt
Recreate the desktop screenshot as closely as possible. Preserve spacing, hierarchy, colors, card sizes, typography, and visible text.
```

#### Najlepsie pre mobilny screenshot

Pouzi pri screenshotoch z telefonu.

- Output: `Static HTML + CSS`
- Styling: `Vanilla CSS`
- Responsiveness: `Mobile-first`
- Accessibility: `Strict (WCAG AA)`

#### Jeden subor na rychle otvorenie v prehliadaci

Pouzi, ked chces vysledok ako samostatny HTML subor.

- Output: `Single-file HTML`
- Styling: `Vanilla CSS`
- Responsiveness: `Adaptive`
- Accessibility: `Strict (WCAG AA)`

#### Tailwind projekt

Pouzi iba ked cielovy projekt pouziva Tailwind.

- Output: `Tailwind`
- Styling: `Tailwind classes`
- Responsiveness: `Mobile-first`
- Accessibility: `Strict (WCAG AA)`

#### React alebo komponentovy workflow

Pouzi, ked chces vysledok dalej prerabat na komponent.

- Output: `Component-style`
- Styling: `CSS Modules`
- Responsiveness: `Adaptive`
- Accessibility: `Strict (WCAG AA)`

#### Rychly prototyp bez prisnych poziadaviek

Pouzi, ked chces len rychlo dostat nieco pouzitelne.

- Output: `Static HTML + CSS`
- Styling: `Vanilla CSS`
- Responsiveness: `Adaptive`
- Accessibility: `Standard`

### Kombinacie, ktorym sa radsej vyhnut

#### Single-file HTML + CSS Modules

Tato kombinacia nedava velky zmysel. Single-file chce vsetko v jednom subore, CSS Modules su skor pre komponentove build systemy.

Lepsie:

- `Single-file HTML` + `Vanilla CSS`

#### Tailwind output + Vanilla CSS

Nie je to uplne zakazane, ale je to miesanie dvoch stylov. Ak chces Tailwind, nastav aj Styling na Tailwind classes.

Lepsie:

- `Tailwind` + `Tailwind classes`

#### Component-style + Inline styles

Technicky funguje, ale vysledok sa tazko udrziava.

Lepsie:

- `Component-style` + `CSS Modules`
- `Component-style` + `Vanilla CSS`

#### Inline styles pre velke stranky

Inline styles pouzivaj len vynimocne. Pri vacsich screenshotoch bude vystup menej prehladny a horsie opravitelny.

### Prakticky postup

1. Nahraj screenshot do `700 KB`, maximalne okolo `1.2 MB`.
2. Ak je screenshot velky, orez nepotrebne okraje alebo ho zmensi.
3. Pre bezny screenshot nechaj predvolene nastavenie: `Static HTML + CSS`, `Vanilla CSS`, `Adaptive`, `Strict (WCAG AA)`.
4. Do Extra instructions napis, co je najdolezitejsie zachovat.
5. Vygeneruj HTML.
6. Ak vystup nie je dost presny, pouzi refinement prompt.
7. Ak je vystup nedokonceny, pouzi pokracovanie generovania.

## Stack

- TanStack Start
- React 19
- TypeScript
- Vite
- Tailwind CSS
- Mistral API

## Requirements

- Node.js 20+
- Mistral API key

## Local setup

From the monorepo root or from `visual-html/`:

```bash
cd visual-html
npm install
cp .env.local.template .env.local
```

Set server-side keys in `.env.local`:

```env
# Screenshot → HTML pipeline
MISTRAL_API_KEY=your_real_mistral_api_key
MISTRAL_OCR_MODEL=mistral-ocr-latest
MISTRAL_MODEL=pixtral-large-latest
BLOB_READ_WRITE_TOKEN=your_vercel_blob_rw_token

# VibeCraft builder (/builder) — server-side AI when no browser BYOK keys
MISTRAL_BUILDER_MODEL=mistral-large-latest

# Production rate limiting
UPSTASH_REDIS_REST_URL=your_upstash_redis_rest_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_rest_token

# Optional tuning
MISTRAL_MAX_TOKENS=3000
MISTRAL_TIMEOUT_MS=55000
```

`mistral-ocr-latest` handles OCR extraction and `pixtral-large-latest` handles HTML synthesis/refinement.
`MISTRAL_BUILDER_MODEL` controls the `/builder` server function; it falls back to `MISTRAL_MODEL`.
Large uploads are automatically optimized in the browser to reduce production timeouts.

### Builder BYOK (browser only)

For `/builder`, you can add personal Mistral keys in the in-app **Settings** dialog (gear icon). They are stored in `localStorage`, not in `.env.local`:

| localStorage key            | Purpose                                         |
| --------------------------- | ----------------------------------------------- |
| `builder_mistral_api_key_1` | Primary BYOK key                                |
| `builder_mistral_api_key_2` | Failover BYOK key                               |
| `builder_mistral_model`     | Model override (default `mistral-large-latest`) |

Without BYOK keys, the builder uses server `MISTRAL_API_KEY` when configured; otherwise it runs in **Demo Mode** (offline templates only).

## Run locally

From the monorepo root:

```bash
npm run dev
```

Or from `visual-html/`:

```bash
npm run dev
```

Open the local URL printed by Vite (`/`, `/projects`, `/builder`).

## Build

```bash
npm run build
```

## Available scripts

```bash
npm run dev
npm run build
npm run build:dev
npm run preview
npm run lint
npm run format
npm run typecheck
npm test
npm run test:watch
npm run test:integrity:fast
npm run test:integrity
```

## Testovanie

Všetky príkazy spúšťaj z tohto adresára:

```text
/home/asterix/Dokumenty/Projekty/PNGtoHTMLapp/visual-html
```

### Hlavné príkazy

```bash
cd /home/asterix/Dokumenty/Projekty/PNGtoHTMLapp/visual-html && npm test
cd /home/asterix/Dokumenty/Projekty/PNGtoHTMLapp/visual-html && npm run test:integrity:fast
cd /home/asterix/Dokumenty/Projekty/PNGtoHTMLapp/visual-html && npm run test:integrity
```

| Príkaz | Kontroly |
| ------ | -------- |
| `npm test` | Vitest — ~558 testov (buttons, PWA, builder, integrácia) |
| `npm run test:integrity:fast` | tsc + vitest + eslint + Vercel build + PWA artifacts + prod HTTP |
| `npm run test:integrity` | fast + env check + Upstash rate-limit + E2E smoke AI |

### Skupiny testov

```bash
cd /home/asterix/Dokumenty/Projekty/PNGtoHTMLapp/visual-html
npx vitest run src/test/buttons/          # UI tlačidlá
npx vitest run src/test/pwa/              # PWA + iPhone 17 Air
npx vitest run src/lib/builder/           # Builder engine
```

Odporúčané pred pushom:

```bash
cd /home/asterix/Dokumenty/Projekty/PNGtoHTMLapp/visual-html && npm test && npm run test:integrity:fast
```

Detailný popis API, integrity suite a štruktúry testov: [docs/DEVELOPER.md](docs/DEVELOPER.md).

## Server API (prehľad)

TanStack Start **server functions** (nie klasické REST). Implementácia v `src/lib/generate.functions.ts` a `src/lib/builder.functions.ts`.

### Screenshot pipeline

| Funkcia | Účel |
| ------- | ---- |
| `runOcr` | Upload + Mistral OCR → markdown |
| `generateHtml` | Syntéza HTML/CSS z obrázka + OCR |
| `refineHtml` | Refinement podľa inštrukcie |
| `continueHtml` | Dokončenie prerušeného výstupu |
| `fetchImageFromUrl` | Stiahnutie obrázka z URL |

### VibeCraft builder

| Funkcia | Účel |
| ------- | ---- |
| `builderAiStatus` | Stav server-side Mistral kľúčov |
| `builderChat` | AI chat pre builder orchestráciu |

Vstupy/výstupy, rate limiting a chybové kódy: [docs/DEVELOPER.md#server-api-tanstack-start-server-functions](docs/DEVELOPER.md#server-api-tanstack-start-server-functions).

## Environment variables

| Variable                        | Required            | Description                                                                                           |
| ------------------------------- | ------------------- | ----------------------------------------------------------------------------------------------------- |
| `MISTRAL_API_KEY`               | Yes                 | Primary server-side API key used for OCR, generation, refinement, and continuation                    |
| `MISTRAL_API_KEY_FALLBACK`      | No                  | Secondary Mistral key used automatically when the primary key is rate-limited or out of quota         |
| `MISTRAL_API_KEYS`              | No                  | Comma-separated ordered fallback pool, for example `key1,key2,key3`                                   |
| `MISTRAL_OCR_API_KEY`           | No                  | Dedicated OCR key; falls back to the global key pool if unset                                         |
| `MISTRAL_OCR_API_KEY_FALLBACK`  | No                  | Dedicated OCR fallback key tried before the global pool                                               |
| `MISTRAL_OCR_API_KEYS`          | No                  | Comma-separated OCR-only key pool                                                                     |
| `MISTRAL_CHAT_API_KEY`          | No                  | Dedicated synthesis/refine/continue key; falls back to the global key pool if unset                   |
| `MISTRAL_CHAT_API_KEY_FALLBACK` | No                  | Dedicated synthesis/refine/continue fallback key tried before the global pool                         |
| `MISTRAL_CHAT_API_KEYS`         | No                  | Comma-separated synthesis/refine/continue-only key pool                                               |
| `MISTRAL_OCR_MODEL`             | No                  | OCR model for uploaded screenshots; default is `mistral-ocr-latest`                                   |
| `MISTRAL_MODEL`                 | No                  | Chat/synthesis model for HTML generation and refine; default is `pixtral-large-latest`                |
| `MISTRAL_BUILDER_MODEL`         | No                  | Model for `/builder` server AI; default falls back to `MISTRAL_MODEL`, then `mistral-large-latest`    |
| `BLOB_READ_WRITE_TOKEN`         | Yes for OCR uploads | Vercel Blob token used to stage uploaded images so the OCR API can fetch them by URL                  |
| `MISTRAL_MAX_TOKENS`            | No                  | Caps completion size; default is `3000` to reduce truncated JSON responses                            |
| `MISTRAL_TIMEOUT_MS`            | No                  | Abort timeout for the Mistral request; default is `55000`, capped below the Vercel 60s function limit |
| `UPSTASH_REDIS_REST_URL`        | Yes in production   | Upstash Redis REST URL used for persistent per-IP rate limiting                                       |
| `UPSTASH_REDIS_REST_TOKEN`      | Yes in production   | Upstash Redis REST token. If either Upstash var is missing, rate limiting is disabled (fail-open)     |
| `RATE_LIMIT_BURST`              | No                  | Max requests per IP per 60s window; default is `5`                                                    |
| `RATE_LIMIT_DAILY`              | No                  | Max requests per IP per 24h; default is `100`                                                         |

`.env.local` is ignored by git through the `*.local` rule in `.gitignore`.

## Mistral Quota Failover

The app can continue with another Mistral key only when another key is configured in the same Vercel environment. A single exhausted `MISTRAL_API_KEY` cannot magically continue.

Recommended production setup:

```env
MISTRAL_API_KEY=primary_key
MISTRAL_API_KEY_FALLBACK=secondary_key
```

For more capacity, use an ordered pool:

```env
MISTRAL_API_KEYS=key1,key2,key3
```

For separate OCR and synthesis quotas, split the pipeline. This is the strongest setup because each phase has its own primary and fallback before the shared global pool:

```env
MISTRAL_OCR_API_KEY=ocr_primary_key
MISTRAL_OCR_API_KEY_FALLBACK=ocr_fallback_key
MISTRAL_CHAT_API_KEY=chat_primary_key
MISTRAL_CHAT_API_KEY_FALLBACK=chat_fallback_key
```

Failover order:

```txt
OCR:  MISTRAL_OCR_API_KEY  -> MISTRAL_OCR_API_KEY_FALLBACK  -> MISTRAL_OCR_API_KEYS  -> MISTRAL_API_KEY -> MISTRAL_API_KEY_FALLBACK -> MISTRAL_API_KEYS
Chat: MISTRAL_CHAT_API_KEY -> MISTRAL_CHAT_API_KEY_FALLBACK -> MISTRAL_CHAT_API_KEYS -> MISTRAL_API_KEY -> MISTRAL_API_KEY_FALLBACK -> MISTRAL_API_KEYS
```

Failover happens on provider quota/rate-limit responses such as `429`, `402`, `503`, or quota hints in `400/401/403` responses. If all configured keys are exhausted, the UI shows `Mistral quota exhausted` and asks for fallback keys or new quota.

## Secret Rotation Checklist

Use the built-in checklist script after any possible secret exposure:

```bash
bash scripts/security/rotate-secrets-checklist.sh
```

The script prints a rotation playbook and performs a quick `.env.local` audit for risky runtime tokens.

## Notes

- AI output should always be reviewed before production use.
- The app uses server functions for Mistral calls, so the API key stays server-side.
- The current UI is labeled for **Mistral OCR + Pixtral Large** to match the default OCR/synthesis pipeline.

## Deployment

Production builds use the Vercel Nitro preset (`NITRO_PRESET=vercel` in `vercel.json`). Deploy from `visual-html/`:

```bash
NITRO_PRESET=vercel npm run build
```

Verify routes after deploy: `/`, `/projects`, `/builder`.
