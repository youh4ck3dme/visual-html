# Release & QA checklist

Použi pred merge do `main` a pred produkčným deployom. Všetky príkazy z:

```text
/home/asterix/Dokumenty/Projekty/PNGtoHTMLapp/visual-html
```

Súvisiaca docs: [DEVELOPER.md](./DEVELOPER.md) (Builder background generation, API, testy).

---

## 1. Git clean / sync gate

```bash
cd /home/asterix/Dokumenty/Projekty/PNGtoHTMLapp
git fetch origin
git status
git log origin/main..HEAD --oneline   # čo pôjde na remote
```

| Check | Pass criteria |
| ----- | ------------- |
| Working tree | Žiadne nechcené súbory; `git status` čistý alebo zámerný diff |
| Branch | Feature branch rebased/merged na aktuálny `origin/main` |
| Lovable | **Žiadny** `git push --force` na `main` (viď `AGENTS.md`) |
| Secrets | Žiadne `.env.local`, API kľúče ani tokeny v commite |

---

## 2. Automatické kontroly (lokálne)

Spusti v poradí z `visual-html/`:

```bash
cd /home/asterix/Dokumenty/Projekty/PNGtoHTMLapp/visual-html

npm test
npm run lint
npx tsc --noEmit
npm run test:integrity:fast
NITRO_PRESET=vercel npm run build
```

| # | Príkaz | Očakávaný výsledok |
| - | ------ | ------------------ |
| 1 | `npm test` | Všetky Vitest testy PASS (vrátane `builder-background.buttons`) |
| 2 | `npm run lint` | ESLint 0 errors, 0 warnings |
| 3 | `npx tsc --noEmit` | Žiadne type errors |
| 4 | `npm run test:integrity:fast` | **6/6** checks PASS |
| 5 | `NITRO_PRESET=vercel npm run build` | Build exit 0; `.vercel/output/static` existuje |

Voliteľne pred veľkým release:

```bash
cd /home/asterix/Dokumenty/Projekty/PNGtoHTMLapp/visual-html && npm run test:integrity
```

(`9/9` — vrátane E2E smoke proti API; vyžaduje `.env.local` a sieť.)

---

## 3. Preview deploy smoke

Po Vercel preview deploy (alebo lokálny preview):

```bash
cd /home/asterix/Dokumenty/Projekty/PNGtoHTMLapp/visual-html
npm run preview
# alebo nastav SMOKE_BASE_URL na preview URL
```

| Route | HTTP | Čo skontrolovať |
| ----- | ---- | --------------- |
| `/` | 200 | Upload UI, sidebar, theme/locale |
| `/projects` | 200 | Zoznam projektov |
| `/builder` | 200 | VibeCraft studio načíta workspace |
| `/site.webmanifest` | 200 | Validný manifest, ikony |

```bash
# Rýchly HTTP check (nahraď BASE preview URL)
BASE="https://<preview>.vercel.app"
curl -sI -o /dev/null -w "%{http_code} /\n" "$BASE/"
curl -sI -o /dev/null -w "%{http_code} /projects\n" "$BASE/projects"
curl -sI -o /dev/null -w "%{http_code} /builder\n" "$BASE/builder"
curl -sI -o /dev/null -w "%{http_code} /site.webmanifest\n" "$BASE/site.webmanifest"
```

---

## 4. Production smoke (po merge / deploy)

Default produkcia: `https://visual-html.vercel.app`

```bash
cd /home/asterix/Dokumenty/Projekty/PNGtoHTMLapp/visual-html
SMOKE_BASE_URL=https://visual-html.vercel.app node scripts/smoke-generation.mjs --check-env
# voliteľne plný smoke (API náklady):
# SMOKE_BASE_URL=https://visual-html.vercel.app node scripts/smoke-generation.mjs
```

| Check | Pass |
| ----- | ---- |
| `/` → 200 | ☐ |
| `/projects` → 200 | ☐ |
| `/builder` → 200 | ☐ |
| `/favicon.ico` → 200 | ☐ |
| `/site.webmanifest` → 200 | ☐ |
| Screenshot smoke (voliteľné) | ☐ OCR + generate vráti HTML |

---

## 5. Manual QA — Builder background generation

Over správanie `BuilderWorkspaceProvider` a `vibecraft_workspace_v1`.

### Desktop

| # | Scenár | Očakávané |
| - | ------ | --------- |
| 1 | Spusti generovanie na `/builder`, prejdi na `/` | Sidebar badge na VibeCraft pulzuje |
| 2 | Počkaj na dokončenie mimo `/builder` | Toast „VibeCraft generation finished“ + **Open Builder** |
| 3 | Klik **Open Builder** | `/builder` s novým HTML v preview/code |
| 4 | `localStorage` `vibecraft_workspace_v1` | Obsahuje `generatedCode` po dokončení |
| 5 | Reload stránku na `/projects` | Po návrate na `/builder` workspace prežil |
| 6 | Spusti generovanie, vráť sa na `/builder`, **Cancel** | Generovanie sa zastaví, cancelled notice |
| 7 | Simuluj zlyhanie (mock/offline) mimo `/builder` | Error toast s hintom otvoriť Builder |

### Mobile QA checklist

Testuj v DevTools mobile alebo reálnom iPhone (portrait + landscape).

| # | Scenár | Portrait | Landscape |
| - | ------ | -------- | --------- |
| M1 | `/builder` mobile studio layout | ☐ | ☐ |
| M2 | Spusti generovanie, prejdi na `/` (bottom nav) | ☐ badge ☐ | ☐ badge ☐ |
| M3 | Dokončenie na pozadí → toast | ☐ | ☐ |
| M4 | **Open Builder** z toastu | ☐ | ☐ |
| M5 | Cancel na `/builder` počas behu | ☐ | ☐ |
| M6 | Reload — workspace persistence | ☐ | ☐ |
| M7 | PWA safe area / viewport (`viewport-fit=cover`) | ☐ | ☐ |

**Poznámka:** Cancel tlačidlo je len na `/builder` UI, nie v sidebare/bottom nav. Pri behu na pozadí musíš otvoriť Builder pre cancel.

### PNG→HTML (`/`) — nie globálne

| # | Scenár | Očakávané |
| - | ------ | --------- |
| P1 | Spusti screenshot generovanie na `/`, prejdi na `/projects` | Generovanie **nie** pokračuje ako globálny builder job (page-bound workflow) |
| P2 | Dokončený screenshot | Uložený do Projects, nie do `vibecraft_workspace_v1` |

---

## 6. Sign-off

| Role | Meno | Dátum | Poznámka |
| ---- | ---- | ----- | -------- |
| Dev | | | Automatické testy PASS |
| QA | | | Manual + mobile checklist |
| Release | | | Preview + production smoke |

---

## Rýchly one-liner (pred pushom)

```bash
cd /home/asterix/Dokumenty/Projekty/PNGtoHTMLapp/visual-html && \
  npm test && npm run lint && npx tsc --noEmit && npm run test:integrity:fast
```