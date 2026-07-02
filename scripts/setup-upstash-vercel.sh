#!/usr/bin/env bash
# Upstash Redis + Vercel env pre rate limiting (UPSTASH_REDIS_REST_URL/TOKEN)
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_DIR"

RESOURCE_NAME="${UPSTASH_RESOURCE_NAME:-pngtohtml-ratelimit}"
REGION="${UPSTASH_REGION:-fra1}"

bold() { printf '\033[1m%s\033[0m\n' "$*"; }
info() { printf '==> %s\n' "$*"; }
warn() { printf '\033[33mWARN:\033[0m %s\n' "$*" >&2; }

bold "Upstash Redis → Vercel env (visual-html)"

# 1) Provision cez Vercel marketplace (nastaví env automaticky)
info "Inštalujem Upstash for Redis cez Vercel integration…"
OUT=$(vercel integration add upstash/upstash-kv \
  --name "$RESOURCE_NAME" \
  -e production -e preview \
  -p free \
  -m "primaryRegion=$REGION" \
  --format=json --non-interactive 2>&1) || true

if echo "$OUT" | grep -q 'integration_terms_acceptance_required'; then
  warn "Najprv prijmi Upstash podmienky v prehliadači:"
  echo "$OUT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('verification_uri',''))" 2>/dev/null \
    || echo "https://vercel.com/h4ck3d/~/integrations/accept-terms/upstash?source=cli"
  echo
  warn "Potom spusti tento skript znova."
  exit 1
fi

if echo "$OUT" | grep -q '"status": "success"'; then
  info "Upstash databáza vytvorená a pripojená."
else
  info "Integration output:"
  echo "$OUT"
fi

# 2) Over / dopln env premenné (niekedy sú len KV_* — skopírujeme na UPSTASH_*)
vercel env pull .env.vercel.check --environment=production --yes 2>/dev/null || true

set_env_if_missing() {
  local name="$1" value="$2"
  [[ -n "$value" ]] || return 0
  if vercel env ls 2>/dev/null | grep -q "^[[:space:]]*${name}[[:space:]]"; then
    info "Vercel env už existuje: $name"
  else
    info "Pridávam Vercel env: $name"
    printf '%s' "$value" | vercel env add "$name" production preview --sensitive --yes
  fi
}

if [[ -f .env.vercel.check ]]; then
  # shellcheck disable=SC1091
  source .env.vercel.check 2>/dev/null || true
  URL="${UPSTASH_REDIS_REST_URL:-${KV_REST_API_URL:-${KV_URL:-}}}"
  TOKEN="${UPSTASH_REDIS_REST_TOKEN:-${KV_REST_API_TOKEN:-${KV_REST_API_READ_ONLY_TOKEN:-}}}"
  set_env_if_missing UPSTASH_REDIS_REST_URL "$URL"
  set_env_if_missing UPSTASH_REDIS_REST_TOKEN "$TOKEN"
  rm -f .env.vercel.check
fi

# 3) Voliteľne: manuálne hodnoty z .env.local
if [[ -f .env.local ]]; then
  # shellcheck disable=SC1091
  source .env.local 2>/dev/null || true
  if [[ -n "${UPSTASH_REDIS_REST_URL:-}" && -n "${UPSTASH_REDIS_REST_TOKEN:-}" ]]; then
    set_env_if_missing UPSTASH_REDIS_REST_URL "$UPSTASH_REDIS_REST_URL"
    set_env_if_missing UPSTASH_REDIS_REST_TOKEN "$UPSTASH_REDIS_REST_TOKEN"
  fi
fi

bold "Aktuálne Vercel env (Upstash):"
vercel env ls 2>/dev/null | grep -E 'UPSTASH|KV_' || warn "UPSTASH_* env ešte nevidím — dokonči integration alebo pridaj ručne."

bold "Hotovo. Spusti redeploy: vercel --prod"