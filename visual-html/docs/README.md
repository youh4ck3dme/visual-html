# Dokumentácia PNGtoHTMLapp / VibeCraft

Kompletný index dokumentácie projektu.

## Vývoj a technická referencia

| Dokument | Obsah |
| -------- | ----- |
| [DEVELOPER.md](./DEVELOPER.md) | **Hlavná technická dokumentácia** — architektúra, API, env, testy, deploy |
| [../README.md](../README.md) | Prehľad aplikácie, funkcie, generovanie, env premenné |
| [../src/routes/README.md](../src/routes/README.md) | TanStack Start file-based routing |
| [../AGENTS.md](../AGENTS.md) | Pravidlá pre AI agentov (Lovable sync) |

## Biznis a stratégia

| Dokument | Obsah |
| -------- | ----- |
| [business/README.md](./business/README.md) | Index biznis dokumentácie |
| [business/market-positioning.md](./business/market-positioning.md) | Pozicionovanie na trhu |
| [business/competitor-analysis.md](./business/competitor-analysis.md) | Analýza konkurencie |

## Prompty a workflow

| Dokument | Obsah |
| -------- | ----- |
| [prompts-image.md](./prompts-image.md) | Prompty pre screenshot → HTML |
| [5-prompts-codeupdate.md](./5-prompts-codeupdate.md) | Prompty pre úpravy kódu |

## Rýchle príkazy (presná cesta)

Všetky príkazy spúšťaj z:

```text
/home/asterix/Dokumenty/Projekty/PNGtoHTMLapp/visual-html
```

```bash
cd /home/asterix/Dokumenty/Projekty/PNGtoHTMLapp/visual-html && npm test
cd /home/asterix/Dokumenty/Projekty/PNGtoHTMLapp/visual-html && npm run test:integrity:fast
cd /home/asterix/Dokumenty/Projekty/PNGtoHTMLapp/visual-html && npm run test:integrity
```

Z monorepo root (`/home/asterix/Dokumenty/Projekty/PNGtoHTMLapp`) funguje aj skratka:

```bash
cd /home/asterix/Dokumenty/Projekty/PNGtoHTMLapp && npm test
```