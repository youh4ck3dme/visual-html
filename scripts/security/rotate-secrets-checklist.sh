#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
ENV_LOCAL="$ROOT_DIR/.env.local"

echo "== Secret Rotation Checklist =="
echo ""
echo "1) Rotate exposed secrets immediately"
echo "   - BLOB_READ_WRITE_TOKEN"
echo "   - MISTRAL_API_KEY (if ever shared)"
echo "   - VERCEL_OIDC_TOKEN (if ever shared)"
echo ""
echo "2) Re-set values in Vercel (Production + Preview)"
echo "   vercel env rm BLOB_READ_WRITE_TOKEN production --yes"
echo "   vercel env rm BLOB_READ_WRITE_TOKEN preview --yes"
echo "   vercel env add BLOB_READ_WRITE_TOKEN production"
echo "   vercel env add BLOB_READ_WRITE_TOKEN preview"
echo ""
echo "3) Verify current env scope"
echo "   vercel env ls"
echo ""
echo "4) Pull fresh env locally after rotation"
echo "   vercel env pull .env.local"
echo ""
echo "5) Keep local env minimal"
echo "   cp .env.local.template .env.local"
echo "   # then fill only required values"
echo ""

if [[ -f "$ENV_LOCAL" ]]; then
  echo "== Local .env.local quick audit =="
  found_issue=0

  if grep -q '^VERCEL_OIDC_TOKEN=' "$ENV_LOCAL"; then
    echo "[WARN] VERCEL_OIDC_TOKEN is present in .env.local"
    found_issue=1
  fi

  if grep -q '^BLOB_READ_WRITE_TOKEN="\?vercel_blob_rw_' "$ENV_LOCAL"; then
    echo "[WARN] BLOB_READ_WRITE_TOKEN is set locally"
    found_issue=1
  fi

  if [[ "$found_issue" -eq 0 ]]; then
    echo "[OK] No obvious high-risk runtime tokens found in .env.local"
  else
    echo ""
    echo "Recommended cleanup:"
    echo "  cp .env.local.template .env.local"
    echo "  # then re-add only necessary values"
  fi
else
  echo "[INFO] .env.local not found (this is fine for CI/deploy-only setups)."
fi
