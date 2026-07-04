Tu je 5 promptov v poradí podľa priority. Každý je samostatný, konkrétny a zameraný na to, aby appka reálne robila to, čo má — teda verne prekresľovala screenshot do HTML. Stačí ich postupne vložiť agentovi.

---

### PROMPT 1 — Oprava jadra: poslať obrázok priamo do vision modelu (NAJVYŠŠIA PRIORITA)

```
V súbore src/lib/ai/mistral.server.ts je chyba jadra: funkcia mistralGenerate
pošle obrázok len do OCR endpointu a do syntézneho modelu (callMistralChat)
posiela IBA OCR markdown text, NIE obrázok. Preto je vizuálna vernosť (layout,
farby, spacing) halucinovaná.

Oprav mistralGenerate tak, aby syntézny model dostal aj samotný obrázok ako
image_url content block (data:<mime>;base64,<...>) SPOLU s OCR markdownom ako
doplnkovým textom. Uprav callMistralChat, aby vedel prijať messages s
multimodálnym content poľom (text + image_url), keďže typ ChatContent to už
podporuje. OCR nech slúži len na presné prepísanie textu, ale layout a štýl
nech model odvodzuje z obrázka.

Zachovaj: timeout cez AbortController, response_format json_object, temperature
0.2, Zod validáciu výstupu, JSON-repair retry. Nič iné nemeň.
```

---

### PROMPT 2 — Reálny rate limiting namiesto in-memory countera

```
V src/lib/generate.functions.ts je "rate limiting" cez `let activeGenerateCount`,
čo je in-memory premenná. V serverless (Vercel) je bezcenná — každá lambda
inštancia má vlastnú kópiu a resetuje sa pri cold starte.

Nahraď to perzistentným per-IP rate limitingom cez Upstash Redis (@upstash/ratelimit
+ @upstash/redis). Limituj napr. 5 generovaní / 60 sekúnd na IP a denný strop na IP.
IP získaj z request headers (x-forwarded-for). Pri prekročení vráť existujúci
ServerResult s code "RATE_LIMITED". Pridaj potrebné env premenné (UPSTASH_REDIS_REST_URL,
UPSTASH_REDIS_REST_TOKEN) do README a .env.example. Aplikuj rovnaký limit aj na refineHtml.
```

---

### PROMPT 3 — Bezpečnostné HTTP hlavičky

```
Aplikácia nemá žiadne security headers. Do vercel.json pridaj "headers" blok, ktorý
na všetky routes nastaví: Content-Security-Policy (default-src 'self', povoľ potrebné
zdroje pre appku, frame-src pre sandbox preview), Strict-Transport-Security
(max-age=63072000; includeSubDomains; preload), X-Frame-Options: DENY,
X-Content-Type-Options: nosniff, Referrer-Policy: strict-origin-when-cross-origin,
Permissions-Policy (zakázať camera, microphone, geolocation).

Over, že CSP nerozbije TanStack Start SSR ani sandbox iframe preview v
src/components/pngto/preview-frame.tsx. Ak treba, uprav CSP tak, aby preview
srcDoc naďalej fungoval.
```

---

### PROMPT 4 — Robustnejšia sanitizácia generovaného HTML

```
V src/lib/utils/build-single-file-html.ts sa generované HTML sanitizuje regexom
(stripInlineHandlers, stripScripts), čo je obchádzateľné (SVG, mutation XSS,
iframe srcdoc). Iframe sandbox v preview-frame.tsx je dobrý druhý val, ale regex
sanitizácia je krehká.

Nahraď regexovú sanitizáciu poriadnym sanitizérom (DOMPurify pre zobrazovaný/
stiahnuteľný kód, keď allowJs = false, s prísnym allowlistom tagov a atribútov).
Keď je allowJs = true, ponechaj iframe sandbox="allow-scripts" bez allow-same-origin
ako jediný spôsob spustenia JS. Zachovaj escapovanie </script> pri single-file builde.
Napíš pár unit testov (vitest) na sanitizáciu: script injection, onerror handler,
javascript: URL, SVG onload.
```

---

### PROMPT 5 — Reálny progres/streaming namiesto fake loading krokov

```
V src/components/pngto/loading-steps.tsx sú fake cyklujúce hlášky, ktoré nezodpovedajú
reálnemu stavu. Používateľ pritom čaká na sekvenciu OCR → syntéza → prípadný JSON-repair
(každé s ~55s timeoutom) bez spätnej väzby.

Zaveď reálne stavy pipeline. V mistralGenerate emituj fázy (napr. "uploading",
"ocr", "synthesizing", "repairing", "done") a preprav ich do UI — buď cez streamovaný
server response, alebo aspoň cez rozdelenie na kroky, ktoré klient vie reflektovať.
LoadingSteps nech zobrazuje skutočnú aktuálnu fázu, nie časovač. Zachovaj existujúci
error handling a ServerResult tvar pre finálny výsledok.
```

---

**Prečo toto poradie:** Prompt 1 opravuje samotný dôvod existencie appky (bez neho appka len háda). Prompty 2–3 zabránia tomu, aby ťa prvé public spustenie finančne nezruinovalo a nevystavilo útokom. Prompt 4 zatvrdí bezpečnosť výstupu. Prompt 5 dorieši dôveryhodnosť UX. Prompty 1, 2, 3 sú must-have pred akýmkoľvek verejným nasadením; 4 a 5 hneď za nimi.
