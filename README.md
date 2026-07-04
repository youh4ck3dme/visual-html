# PNGtoHTMLapp

Unified TanStack Start app in **`visual-html/`** — screenshot → HTML (`/`), saved projects (`/projects`), and VibeCraft builder (`/builder`).

```bash
npm install --prefix visual-html   # first time
npm run dev                        # dev server
npm run build                      # production build (Vercel preset via visual-html/vercel.json)
npm run typecheck                  # tsc --noEmit (use this, not bare npx tsc from repo root)
npm run test:integrity:fast        # CI-style checks without E2E smoke
```

App code and `tsconfig.json` live in **`visual-html/`**. Run `npx tsc --noEmit` only from that folder, or use `npm run typecheck` from the repo root.

Full docs: [visual-html/README.md](visual-html/README.md)