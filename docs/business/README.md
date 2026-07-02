# Business plan: PNGtoHTMLapp / Visual HTML

PNGtoHTMLapp je AI webova aplikacia, ktora meni screenshoty UI, dokumentov a tabulkovych vystupov na cisty, upravitelny HTML/CSS kod s preview, refinement loopom a exportom.

Hlavna hodnota produktu je skratit pracu medzi vizualnou predlohou a pouzitelnym frontend vystupom. Pouzivatel nahra screenshot, aplikacia spravi OCR a vizualnu analyzu, vygeneruje HTML/CSS, zobrazi preview a umozni dalsie zlepsovanie pomocou pokynov.

## Executive summary

Produkt ma najlepsi potencial ako prakticky AI assistant pre developerov, dizajnerov, agentury a male produktove timy, ktore casto potrebuju rychlo prerobit vizualnu referenciu do weboveho kodu.

Najsilnejsia diferenciacia oproti generickym AI builderom je verne prekreslenie hustych layoutov, dokumentov, tabuliek, vypisov, dashboardov a A4/print vystupov. Produkt sa nema poziciovat ako dalsi landing-page generator, ale ako nastroj na presnu rekonstrukciu screenshotu do standardneho HTML/CSS.

## Core promise

From screenshot to editable HTML in minutes.

Produkt ma splnit tieto sluby:

- premenit PNG/JPG/WebP screenshot na HTML/CSS,
- zachovat vizualnu strukturu, spacing, typografiu, tabulky a hierarchiu,
- vratit kod, ktory sa da otvorit, kopirovat, stiahnut a upravit,
- podporit refinement loop pre dalsie zlepsenia,
- upozornit na neiste OCR hodnoty namiesto ticheho vymyslania,
- pri dokumentoch preferovat print/A4 fidelity.

## Target customers

- Solo frontend developeri, ktori prerabaju screenshoty alebo mockupy do HTML.
- Webove agentury, ktore rychlo rekonstruuju klientsky dizajn, legacy layouty alebo landing pages.
- SaaS a startup timy, ktore potrebuju rychle prototypy z vizualnych referencii.
- UI/UX dizajneri, ktori chcu lepsi developer handoff.
- Back-office a document automation pouzivatelia, ktori potrebuju HTML verzie formularov, faktur, vypisov, reportov a tabuliek.

## Recommended business model

Najzdravsi model je hybrid:

- free/BYOK tier na validaciu a lacny vstup,
- subscription plany pre pravidelnych pouzivatelov,
- usage credits na drahe AI generovanie,
- team a agency baliky pre vyssi objem,
- enterprise/API licencie pre firmy s compliance a integracnymi poziadavkami.

Detailny pricing a unit economics su v [monetization-plan.md](monetization-plan.md).

## Competitive angle

Trh uz obsahuje AI design-to-code nastroje, genericke AI coding asistenty a OCR workflow. Visual HTML sa musi odlisit tym, ze je prakticky, verny a orientovany na exportovatelny standardny HTML/CSS vystup.

Silne odlisovace:

- A4/print fidelity pre dokumenty a tabulky,
- standalone HTML export,
- transparentne warnings pri neistych hodnotach,
- BYOK moznost pre pokrocilych a privacy-sensitive pouzivatelov,
- QA dashboard a porovnavanie vystupov,
- refinement loop namiesto jednorazoveho vysledku.

Detailna analyza je v [competitor-analysis.md](competitor-analysis.md).

## 90-day execution priorities

1. Stabilizovat kvalitu generovania pre najdolezitejsie typy screenshotov: UI obrazovky, dashboardy, dokumenty, tabulky a A4 vypisy.
2. Pridat accounts, project history, credit tracking a Stripe billing.
3. Vytvorit demo galeriu pred/po s anonymizovanymi prikladmi.
4. Spustit founder-led validaciu s developermi a agenturami.
5. Merat funnel: upload, successful preview, export, refinement, signup, upgrade.
6. Pripravit API/agency waitlist pre vyssi objem.

## Success metrics

- Upload-to-preview success rate nad 80 %.
- Preview-to-export rate nad 35 %.
- Export-to-signup rate nad 15 %.
- Free-to-paid conversion 3-8 % pri samostatnych pouzivateloch.
- Gross margin 70-85 % po zapocitani AI inference a infrastruktury.
- Retention signal: pouzivatel spravi aspon 3 generovania v prvom tyzdni.

## Documents in this folder

- [monetization-plan.md](monetization-plan.md) - pricing, revenue streams, costs, margins, limits.
- [competitor-analysis.md](competitor-analysis.md) - konkurencia, porovnanie a diferenciacia.
- [market-positioning.md](market-positioning.md) - ICP, messaging, positioning a segmenty.
- [go-to-market.md](go-to-market.md) - launch plan, kanaly, funnel a metriky.
- [motivation.md](motivation.md) - motivacia, mission a preco teraz.
- [roadmap.md](roadmap.md) - biznis a produktova roadmapa.
