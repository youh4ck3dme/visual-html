# PNGtoHTMLapp

AI web app for turning UI screenshots into clean, semantic HTML with a live preview and refinement loop.

## Features

- Upload PNG, JPG, or WebP UI screenshots
- Automatically downscale and compress large screenshots before sending them to Mistral
- Generate semantic HTML, CSS, and optional JavaScript with Mistral Vision
- Refine previous output with follow-up instructions
- Preview generated output in a sandboxed frame
- Copy or download generated code
- Tune generation via output, styling, responsiveness, and accessibility options

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

```bash
npm install
cp .env.example .env.local
```

Set your API key in `.env.local`:

```env
MISTRAL_API_KEY=your_real_mistral_api_key
MISTRAL_MODEL=pixtral-large-latest
MISTRAL_MAX_TOKENS=3500
MISTRAL_TIMEOUT_MS=55000
```

`pixtral-large-latest` is the recommended model here for screenshot-to-HTML and other UI image analysis tasks.
Large uploads are automatically optimized in the browser to reduce production timeouts.

## Run locally

```bash
npm run dev
```

Open the local URL printed by Vite.

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
```

## Environment variables

| Variable | Required | Description |
| --- | --- | --- |
| `MISTRAL_API_KEY` | Yes | Server-side API key used for generation and refinement |
| `MISTRAL_MODEL` | No | Overrides the default Mistral model; default is `pixtral-large-latest` |
| `MISTRAL_MAX_TOKENS` | No | Caps completion size; default is `3500` to reduce slow vision responses |
| `MISTRAL_TIMEOUT_MS` | No | Abort timeout for the Mistral request; default is `55000`, capped below the Vercel 60s function limit |

`.env.local` is ignored by git through the `*.local` rule in `.gitignore`.

## Notes

- AI output should always be reviewed before production use.
- The app uses server functions for Mistral calls, so the API key stays server-side.
- The current UI is labeled for **Mistral Pixtral Large** to match the configured default model.

## Deployment

Production builds generate Nitro output configured for Cloudflare module deployment.
