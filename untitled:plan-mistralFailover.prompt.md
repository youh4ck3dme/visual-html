Kód — hotovo

Commit `ec7b88f` je na `main`, repo je čisté. Key pool podporuje:

OCR:

```txt
MISTRAL_OCR_API_KEY -> MISTRAL_OCR_API_KEY_FALLBACK -> MISTRAL_OCR_API_KEYS -> globálny pool
```

Chat/syntéza:

```txt
MISTRAL_CHAT_API_KEY -> MISTRAL_CHAT_API_KEY_FALLBACK -> MISTRAL_CHAT_API_KEYS -> globálny pool
```

Globálny pool:

```txt
MISTRAL_API_KEY -> MISTRAL_API_KEY_FALLBACK -> MISTRAL_API_KEYS
```

Vercel — fallback ešte nie je aktívny

Aktuálne vo Verceli vidím len:

- `MISTRAL_API_KEY` (`Development`, `Preview`, `Production`)
- `MISTRAL_MODEL`, `MISTRAL_OCR_MODEL`

Chýba:

- `MISTRAL_API_KEY_FALLBACK`
- role-specific premenné

Kód je pripravený, ale failover na produkcii nebude fungovať, kým tam tie env vars nedáš.

Čo urobiť teraz bez secretov v chate

Možnosť A — len failover, najjednoduchšie:

Vercel -> `visual-html` -> `Settings` -> `Environment Variables` -> `Add`:

| Name                       | Environments                           |
| -------------------------- | -------------------------------------- |
| `MISTRAL_API_KEY_FALLBACK` | `Production`, `Preview`, `Development` |

Hodnotu vlož priamo vo Vercel UI, nie do chatu. Potom Redeploy.

Možnosť B — paralelný split + fallback:

```env
MISTRAL_OCR_API_KEY=primary_key
MISTRAL_CHAT_API_KEY=secondary_key
MISTRAL_CHAT_API_KEY_FALLBACK=synthesis_fallback_key
```

Možnosť C — CLI, hodnotu zadáš interaktívne v termináli:

```bash
npx vercel env add MISTRAL_API_KEY_FALLBACK production
npx vercel env add MISTRAL_API_KEY_FALLBACK preview
npx vercel deploy --prod
```

Bezpečnosť

Kľúč, ktorý si poslal v chate, považuj za kompromitovaný. Po nastavení vo Verceli ho v Mistral konzole rotuj a použi nový.

Overenie po deployi

```bash
npx vercel env ls | grep MISTRAL
node scripts/smoke-generation.mjs
```

Keď `MISTRAL_API_KEY_FALLBACK` uvidíš vo Vercel env liste, failover je reálne zapnutý.
