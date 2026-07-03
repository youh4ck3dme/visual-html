# Security Policy

## Supported Scope

This repository contains the VibeCraft frontend and Vercel serverless API proxy used by the production app at:

https://vibecraft.rubberduck.sk

## Secret Handling

Do not commit provider API keys or local environment files.

Production secrets belong in Vercel environment variables:

```text
MISTRAL_API_KEY_1
MISTRAL_API_KEY_2
```

These must remain server-only. Do not create `VITE_` copies of provider secrets because Vite exposes `VITE_` variables to browser JavaScript.

Users can optionally store their own browser-side Mistral or Gemini key in localStorage through the Settings modal. That is deliberately labeled as browser-local storage and is separate from the production server proxy.

## Mistral Proxy Risk Model

`/api/mistral` is a public endpoint that spends the project owner's Mistral quota when requests pass validation.

Current protections:

- `POST` and `OPTIONS` only
- JSON-only requests
- production/custom-domain origin allowlist
- exact Vercel deployment origin support through `VERCEL_URL`
- prompt field validation
- prompt size limit
- explicit model whitelist
- no provider error body passthrough
- no-store response headers

Remaining risks:

- Origin and Referer checks are not authentication; non-browser clients can spoof headers.
- There is no per-IP or per-session rate limit yet.
- There is no daily budget cap in the app code.

Recommended before broad public traffic:

- Enable Vercel Firewall/rate limiting for `/api/mistral`.
- Monitor provider spend and error rates.
- Add a lightweight server-side request counter or external rate limiter.
- Consider a signed session token or challenge flow before expensive generation.

## Reporting Issues

If this becomes a public repository, report security issues privately through GitHub Security Advisories. Do not open public issues containing secrets, API keys, provider responses, or abuse payloads.
