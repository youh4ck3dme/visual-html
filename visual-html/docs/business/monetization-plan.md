# Monetization plan

Tento dokument popisuje odporucany sposob monetizacie pre PNGtoHTMLapp / Visual HTML. Ceny su orientacne a mali by sa upravit po merani skutocnych AI nakladov, konverzie a retencie.

## Monetization thesis

Produkt vytvara hodnotu vtedy, ked pouzivatel usetri cas pri prepisovani vizualnej predlohy do HTML/CSS. Preto je najvhodnejsie spajat subscription s usage limitmi. Cisto neobmedzeny plan je rizikovy, pretoze kazde generovanie ma realny variabilny naklad cez OCR, vision modely, storage a hosting.

Odporucany model:

- free tier na akviziciu,
- plateny mesacny subscription na pravidelne pouzivanie,
- kreditovy system pre AI generovanie,
- vyssie team/agency plany s viac kreditmi a sedadlami,
- enterprise/API pre vysoky objem a compliance.

## Revenue streams

### 1. SaaS subscriptions

Hlavny zdroj prijmu. Pouzivatel plati mesacne alebo rocne za pristup, kreditovy limit, historiu projektov a exporty.

Vyhody:

- predikovatelne MRR,
- jednoduche vysvetlenie,
- dobre pre jednotlivcov aj timy,
- moznost rocnych zliav.

Rizika:

- treba kontrolovat AI naklady,
- treba jasne komunikovat limity,
- silni pouzivatelia mozu rychlo minut margin.

### 2. Usage credits

Kazde AI generovanie, OCR a refinement spotrebuje kredity. Credit model pomaha priamo spajat cenu s nakladmi.

Priklad kreditov:

- basic screenshot generation: 1 credit,
- OCR-heavy document generation: 2 credits,
- high-fidelity A4/document generation: 3 credits,
- refinement: 0.5-1 credit,
- batch conversion: podla poctu suborov.

Credits by mali byt jednoduche a nemali by pouzivat prilis technicky jazyk. Pouzivatel ma vidiet, kolko generovani este ma.

### 3. BYOK tier

Bring your own key je silny vstupny model pre developerov a privacy-sensitive pouzivatelov. Pouzivatel prinesie vlastny Mistral API key a aplikacia mu poskytne UI, preview, export, prompt workflow a QA vrstvu.

Monetizacia BYOK:

- free BYOK s limitom na ulozene projekty,
- paid BYOK Pro za historiu, QA dashboard, export presets a timove funkcie,
- enterprise BYOK/private deploy.

BYOK znizuje variabilne AI naklady, ale produkt stale musi monetizovat UI/workflow hodnotu.

### 4. Team workspaces

Team plan monetizuje spolupracu:

- viac sedadiel,
- shared projects,
- team prompt presets,
- brand presets,
- billing management,
- project history,
- comparison/QA dashboard.

Toto je dobry smer pre agentury a male SaaS timy.

### 5. Agency tier

Agentury mozu mat vysoky objem screenshotov a klientskych vystupov. Agency tier by mal obsahovat:

- vyssie mesacne kredity,
- batch conversion,
- priority queue,
- client-ready exporty,
- vlastne preset instrukcie,
- komercne pouzitie bez obmedzeni,
- rychlejsiu podporu.

### 6. API and OEM licensing

API plan je vhodny neskor, ked bude core generation stabilny.

Mozne pouzitia:

- interny tool vo firme,
- integracia do CMS alebo design toolu,
- hromadna konverzia dokumentov,
- white-label screenshot-to-code funkcionalita.

API pricing by mal byt usage-based plus minimalny mesacny commit.

### 7. Enterprise and private deployment

Enterprise plan moze obsahovat:

- SSO,
- audit logs,
- DPA,
- private deployment,
- custom retention policy,
- vlastne Mistral/OpenAI/Azure provider keys,
- on-prem alebo VPC instalacia,
- priority support,
- custom SLA.

Enterprise pricing by mal byt custom, nie verejne fixny.

### 8. Marketplace later

Neskorsia monetizacia:

- export templates,
- document presets,
- agency prompt packs,
- UI component conversion presets,
- verified A4 templates.

Marketplace netreba robit v prvej faze. Najprv musi byt stabilny core produkt.

## Recommended pricing

### Free

Cena: 0 EUR/month.

Pre koho:

- novy pouzivatel,
- developer testujuci hodnotu,
- BYOK experiment.

Obsah:

- limitovany pocet generovani mesacne alebo BYOK,
- zakladny upload a preview,
- manual copy/download,
- obmedzena historia alebo bez historie,
- community support.

Limit:

- 5-10 hosted AI generovani mesacne alebo iba BYOK,
- max velkost screenshotu,
- ziadne team funkcie.

### Starter

Cena: 12-19 EUR/month.

Pre koho:

- hobby developeri,
- studenti,
- solo tvorcovia,
- obcasne pouzitie.

Obsah:

- 50-100 kreditov mesacne,
- standardne generovanie,
- single-file HTML export,
- zakladna historia projektov,
- refinement loop,
- email support best effort.

### Pro

Cena: 29-49 EUR/month.

Pre koho:

- profesionalni developeri,
- freelanceri,
- dizajneri s pravidelnym handoffom.

Obsah:

- 250-500 kreditov mesacne,
- high-fidelity presets,
- A4/document mode,
- advanced export presets,
- project history,
- QA comparison dashboard,
- priority generation fair-use.

### Team

Cena: 79-149 EUR/month.

Pre koho:

- male SaaS timy,
- produktove timy,
- male agentury.

Obsah:

- 3-5 seats,
- 1000+ kreditov mesacne,
- shared projects,
- team prompt presets,
- billing management,
- shared QA dashboard,
- export history,
- team support.

### Agency

Cena: 199-499 EUR/month.

Pre koho:

- agentury,
- outsourcing timy,
- firmy s vysokym objemom screenshotov.

Obsah:

- 5-15 seats,
- 3000-10000 kreditov mesacne,
- batch conversion,
- brand/client presets,
- priority queue,
- client-ready exports,
- priority support,
- moznost dokupit kredity.

### Enterprise / API

Cena: custom.

Pre koho:

- firmy s compliance poziadavkami,
- velke timy,
- integracie,
- high-volume automation.

Obsah:

- custom credit limits,
- SSO,
- audit logs,
- private deployment,
- custom data retention,
- API access,
- legal/compliance support,
- SLA.

## Annual pricing

Odporucana rocna zlava: 15-20 %.

Rocne plany su dolezite, lebo zlepsuju cash flow a znizuju churn. Pre agency a enterprise treba preferovat rocny kontrakt.

## Cost model

Hlavne naklady:

- Mistral OCR,
- Mistral vision/chat generation,
- retry/failover a JSON repair calls,
- Vercel hosting/functions,
- Vercel Blob alebo alternativny object storage,
- Upstash Redis rate limiting,
- monitoring/logging,
- support cas,
- platobne poplatky Stripe.

Naklady sa lisia podla typu screenshotu. Dokumenty a velke A4 tabulky mozu byt drahsie ako jednoduche UI karty.

## Unit economics

Ciel:

- gross margin: 70-85 %,
- AI cost per paid user: max 15-25 % z plan revenue,
- support cost nizky vdaka dobrym warnings a self-serve docs,
- refund rate pod 5 %.

Zakladne pravidla:

- kazdy plan musi mat kreditovy limit,
- high-fidelity document mode ma stat viac kreditov,
- retry a repair calls musia byt limitovane,
- free tier musi byt chraneny rate limitom,
- overage ma byt plateny alebo blokovany.

## Overage pricing

Moznosti:

- kupit extra kreditovy balik,
- automaticky overage pri Team/Agency,
- manual approval pri Enterprise,
- hard stop pri Free/Starter.

Priklad:

- 100 extra credits: 9 EUR,
- 500 extra credits: 29 EUR,
- 2000 extra credits: 99 EUR.

Tieto ceny treba upravit po realnom cost benchmarku.

## Anti-abuse policy

Potrebne ochrany:

- per-IP rate limit,
- account-level rate limit,
- file size limit,
- OCR timeout,
- max tokens,
- daily free credit cap,
- provider quota failover,
- abuse detection pre batch uploady,
- blokovanie opakovanych chybnych requestov.

## What to build before billing

Minimalny billing-ready set:

1. Auth.
2. User/project history.
3. Credit ledger.
4. Stripe checkout and customer portal.
5. Usage limits in server functions.
6. Clear upgrade modal.
7. Billing emails and cancellation flow.
8. Admin view pre usage a provider cost.

## Monetization risks

- AI provider cost moze byt vyssi nez subscription revenue.
- Generic AI tools mozu znizit willingness to pay.
- Kvalita vystupu musi byt konzistentna, inak churn rychlo rastie.
- Dokumenty mozu obsahovat citlive data, preto treba jasnu privacy politiku.
- Free tier moze byt zneuzity bez tvrdych limitov.

## Recommended first monetization launch

1. Spustit Free + Pro.
2. Pro dat na 29 EUR/month s jasnym kreditovym limitom.
3. Pridat BYOK ako free/low-cost developer option.
4. Merat skutocne naklady na 100 generovani pre UI, dashboardy a A4 dokumenty.
5. Po 30 dnoch upravit kreditove limity.
6. Potom pridat Team a Agency.
