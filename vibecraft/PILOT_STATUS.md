# PILOT STATUS

## RubberDuck Pilot Render Chain PASS

Date: 2026-05-28  
Status: PASS

## Scope

- LE: `https://web24.rubberduck.sk`
- VibeCraft: `https://vibecraft.rubberduck.sk`
- Flow:
  - `LE /api/projects/generate`
  - mapping to `web24h_v1`
  - `VibeCraft /api/render`
  - `preview/export`

## Root cause

VibeCraft `/api/render` failed in production with `FUNCTION_INVOCATION_FAILED` because API/serverless ESM relative imports were extensionless in runtime-critical files.

## Fix implemented

- Added explicit `.js` relative imports in render API path:
  - `api/render.ts`
  - `api/render/[artifactId]/preview.ts`
  - `api/render/[artifactId]/export.ts`
  - `api/_lib/artifact-store.ts`
  - `api/_lib/render-html.ts`
- Added safe render diagnostics (server-side only):
  - `requestId`
  - payload top-level keys
  - safe error message + stack (server logs only)
- Added safer input failure response:
  - invalid payload now returns `400 render_payload_invalid`

## Environment contract

Verified aligned between LE and VibeCraft:

- `LE_PILOT_TOKEN`
- `VIBE_SERVICE_TOKEN`
- LE mistral keys:
  - `MISTRAL_API_KEY`
  - `MISTRAL_API_KEY_BACKUP`
- VibeCraft mistral keys:
  - `MISTRAL_API_KEY_1`
  - `MISTRAL_API_KEY_2`
  - `MISTRAL_MODEL`

## Retest evidence

- `web24.rubberduck.sk/api/health` -> 200 JSON
- `vibecraft.rubberduck.sk/api/health` -> 200 JSON
- LE generate -> `canExport=true`, `canImport=true`, mapped sections=7
- VibeCraft render -> 200, `artifactId`, `previewUrl`, `exportUrl`
- Preview -> 200 `text/html`
- Export -> 200 `Content-Disposition: attachment`

## Git milestone

- Commit:
  - `d7e51e2`
  - `fix(render): resolve production ESM imports and validate payload`
- Tag:
  - `rubberduck-pilot-render-pass`

## Notes

- No UI changes.
- No new product features.
- Fix focused only on render contract/runtime reliability.
