# Competitor analysis

Visual HTML sutazi v prieniku troch trhov:

- AI design-to-code,
- AI coding assistants,
- OCR/document reconstruction.

Najvacsia sanca nie je bojovat priamo so vsetkymi generickymi AI buildermi. Silnejsie je vlastnit uzsi use case: verna rekonstrukcia screenshotu, UI a dokumentu do cisteho HTML/CSS s preview, refinementom, exportom a QA kontrolou.

## Competitive categories

## 1. AI design-to-code tools

Priklady:

- Locofy,
- Anima,
- Builder.io Visual Copilot,
- TeleportHQ,
- Uizard.

### Strengths

- Silne napojenie na design workflow.
- Vedia pracovat s Figma/design assetmi.
- Casto maju component/export workflow.
- Maju silnejsie brand recognition.

### Weaknesses

- Casto su optimalizovane na design files, nie realne screenshoty.
- Pri hustych dokumentoch a tabulkach mozu byt menej presne.
- Vystup moze byt framework-specific alebo tazsi na manualnu upravu.
- Nie vzdy riesia OCR neistoty a print/A4 fidelity.

### Opportunity for Visual HTML

Visual HTML moze byt rychlejsi pre pouzivatela, ktory nema Figma file, iba screenshot, PDF render alebo obrazok. Silny positioning je: upload image, get clean HTML.

## 2. General AI coding assistants

Priklady:

- ChatGPT,
- Claude,
- GitHub Copilot,
- Cursor,
- v0.

### Strengths

- Velmi flexibilne.
- Dobre pri generovani komponentov a vysvetlovani kodu.
- Maju silne modely a velke publikum.
- Pouzivatelia ich uz poznaju.

### Weaknesses

- Nie su specializovane na screenshot-to-HTML workflow.
- Pouzivatel musi sam riesit upload, prompt, preview, opravy a export.
- Vystup nie je vzdy deterministicky ani porovnatelny.
- Chyba zabudovany QA dashboard a dokumentovy/A4 preset.

### Opportunity for Visual HTML

Visual HTML musi byt workflow produkt, nie iba prompt. Hodnota je v tom, ze kombinuje OCR, generation options, preview, refinement, export, diagnostics a business-specific presets.

## 3. OCR/document automation tools

Priklady:

- Google Vision OCR workflows,
- Azure Document Intelligence,
- AWS Textract,
- Mistral OCR custom workflow,
- manual OCR plus custom HTML coding.

### Strengths

- Silne OCR a structured extraction.
- Casto enterprise-ready.
- Dobre pre data extraction.

### Weaknesses

- Zvycajne negeneruju verny HTML layout.
- Vyziaduju integracnu pracu.
- Su zamerane na data, nie vizualnu rekonstrukciu.
- Pre bezneho developera su pomalsie na pouzitie.

### Opportunity for Visual HTML

Visual HTML sa moze poziciovat ako visual reconstruction layer nad OCR: nie iba extrahovat text, ale vytvorit pouzitelny HTML dokument.

## 4. Screenshot-to-code open-source projects

Priklady:

- screenshot-to-code repozitare,
- lokálne scripts,
- experimental demos,
- one-off model wrappers.

### Strengths

- Nizka cena.
- Developer-friendly.
- Casto rychlo inovuju.

### Weaknesses

- Menej stabilne.
- Chyba hosted UX, billing, QA, support.
- Chyba production polish.
- Chyba privacy/compliance story.

### Opportunity for Visual HTML

Visual HTML moze ponuknut production-ready workflow, nie iba demo. Pre agentury a timy je hodnota v spolahlivosti, historii, exportoch a podpore.

## Competitor comparison

| Category              | Main advantage       | Main weakness                          | Visual HTML differentiation                |
| --------------------- | -------------------- | -------------------------------------- | ------------------------------------------ |
| AI design-to-code     | Design workflow      | Horsie pre raw screenshots a dokumenty | Screenshot-first, A4/document fidelity     |
| General AI assistants | Flexibilita          | Pouzivatel sklada workflow sam         | Upload-preview-refine-export loop          |
| OCR platforms         | Presna extrakcia dat | Negeneruju layout                      | OCR + visual HTML reconstruction           |
| Open-source demos     | Lacne a hackable     | Malo product polish                    | Hosted product, QA, billing, team features |

## Direct product positioning

Visual HTML by malo hovorit:

- Nie sme iba AI chat.
- Nie sme iba design-to-code pre Figma.
- Nie sme iba OCR.
- Sme screenshot/document-to-HTML workflow s preview a exportom.

## Differentiation pillars

### 1. Fidelity for dense layouts

Produkt musi byt lepsi v tabulkach, dashboardoch, formularoch, vypisoch a dokumentoch. Toto je bolest, ktoru genericke nastroje casto riesia slabo.

### 2. A4 and print reconstruction

Schopnost generovat A4 portrait/landscape, print styles, tabulkove hranice a pravu zarovnanost cisel je silny niche.

### 3. Transparent uncertainty handling

Pri OCR neistote produkt nema vymyslat. Ma oznacit neiste hodnoty a pridat warnings.

### 4. Clean standalone export

Pouzivatel musi dostat kod, ktory moze otvorit, poslat, vlozit do projektu alebo dalej upravit.

### 5. QA dashboard

Porovnanie vystupov, testov a promptov je silna feature pre profesionalov a agentury.

### 6. BYOK and privacy-first story

BYOK znizuje nedoveru a variabilne naklady. Privacy messaging je dolezity pri dokumentoch.

## Market gaps

- Rychly screenshot-to-HTML nastroj pre ludi bez Figma file.
- Dobre dokumentove a tabulkove HTML vystupy.
- Transparentny workflow s preview a refinementom.
- Jednoduchsi entry point nez enterprise OCR platformy.
- Lepsie testovanie a porovnavanie vystupov nez genericky AI chat.

## Threats

- Velke modely pridaju lepsie screenshot-to-code funkcie priamo.
- Figma/design tooly zlepsia export.
- Open-source projekty znizia cenu.
- Provider cost moze zmensit marzu.
- Pouzivatelia mozu vnimat vystup ako jednorazovu utilitu, nie subscription.

## Defensive strategy

1. Budovat workflow a data okolo generovania, nie iba prompt.
2. Zbierat anonymizovane benchmarky kvality.
3. Ponuknut QA dashboard a porovnanie verzii.
4. Zamerat sa na dokumenty/tabulky, kde je bolest vyssia.
5. Budovat API a team features pre stickiness.
6. Udrzat BYOK a multi-provider flexibilitu.
