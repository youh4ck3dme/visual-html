# PNGtoHTMLapp

Unified TanStack Start app v **`visual-html/`** — screenshot → HTML (`/`), uložené projekty (`/projects`) a VibeCraft builder (`/builder`).

**Produkcia:** [visual-html.vercel.app](https://visual-html.vercel.app)  
**GitHub:** [github.com/youh4ck3dme/visual-html](https://github.com/youh4ck3dme/visual-html)

## Cesty projektu

| Čo | Cesta |
| -- | ----- |
| Monorepo root | `/home/asterix/Dokumenty/Projekty/PNGtoHTMLapp` |
| Aplikácia (kód, testy, build) | `/home/asterix/Dokumenty/Projekty/PNGtoHTMLapp/visual-html` |

## Rýchly štart

```bash
cd /home/asterix/Dokumenty/Projekty/PNGtoHTMLapp/visual-html
npm install
cp .env.local.template .env.local   # doplň Mistral + Blob + Upstash kľúče
npm run dev
```

Z monorepo root:

```bash
cd /home/asterix/Dokumenty/Projekty/PNGtoHTMLapp
npm install --prefix visual-html
npm run dev
```

## Testovanie

Všetky testy spúšťaj z `visual-html/`:

```bash
cd /home/asterix/Dokumenty/Projekty/PNGtoHTMLapp/visual-html && npm test
cd /home/asterix/Dokumenty/Projekty/PNGtoHTMLapp/visual-html && npm run test:integrity:fast
cd /home/asterix/Dokumenty/Projekty/PNGtoHTMLapp/visual-html && npm run test:integrity
```

| Príkaz | Popis |
| ------ | ----- |
| `npm test` | Vitest — unit + integračné testy (~558) |
| `npm run test:integrity:fast` | CI štýl: tsc, vitest, eslint, build, artifacts, prod HTTP |
| `npm run test:integrity` | Plný suite + E2E smoke generácia proti API |
| `npm run typecheck` | TypeScript bez emitu |
| `npm run lint` | ESLint |

Skratky z root repa (`npm test`, `npm run test:integrity:fast`, …) delegujú do `visual-html/`.

## Build a deploy

```bash
cd /home/asterix/Dokumenty/Projekty/PNGtoHTMLapp
npm run build    # NITRO_PRESET=vercel
```

`npx tsc --noEmit` spúšťaj len z `visual-html/`, alebo použij `npm run typecheck` z root.

## Dokumentácia

| Dokument | Obsah |
| -------- | ----- |
| [visual-html/README.md](visual-html/README.md) | Funkcie, generovanie, env premenné, deploy |
| [visual-html/docs/DEVELOPER.md](visual-html/docs/DEVELOPER.md) | **Kompletná technická docs** — API, architektúra, testy |
| [visual-html/docs/README.md](visual-html/docs/README.md) | Index všetkej dokumentácie |
| [visual-html/docs/business/README.md](visual-html/docs/business/README.md) | Biznis a monetizácia |