#!/usr/bin/env bash
# GitHub + release gate — spusti manuálne z terminálu pred push/merge/deploy.
#
# Usage:
#   ./scripts/github-release-gate.sh              # git + GitHub (rýchle)
#   ./scripts/github-release-gate.sh --tests      # + npm test, lint, tsc, integrity:fast
#   ./scripts/github-release-gate.sh --smoke      # + production HTTP 200
#   ./scripts/github-release-gate.sh --full       # všetko
#
# Env:
#   SMOKE_BASE_URL=https://visual-html.vercel.app  (default)
#   GITHUB_REPO=youh4ck3dme/visual-html             (default, pre gh)
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
APP_DIR="$REPO_ROOT/visual-html"
SMOKE_BASE_URL="${SMOKE_BASE_URL:-https://visual-html.vercel.app}"
GITHUB_REPO="${GITHUB_REPO:-youh4ck3dme/visual-html}"

RUN_TESTS=0
RUN_SMOKE=0

for arg in "$@"; do
  case "$arg" in
    --tests) RUN_TESTS=1 ;;
    --smoke) RUN_SMOKE=1 ;;
    --full) RUN_TESTS=1; RUN_SMOKE=1 ;;
    -h | --help)
      sed -n '2,12p' "$0"
      exit 0
      ;;
    *)
      echo "Neznámy argument: $arg (použi --tests, --smoke, --full, --help)" >&2
      exit 2
      ;;
  esac
done

PASS=0
FAIL=0
WARN=0

bold() { printf '\033[1m%s\033[0m\n' "$*"; }
section() { printf '\n\033[1m=== %s ===\033[0m\n' "$*"; }
pass() { PASS=$((PASS + 1)); printf '\033[32mPASS\033[0m  %s\n' "$*"; }
fail() { FAIL=$((FAIL + 1)); printf '\033[31mFAIL\033[0m  %s\n' "$*" >&2; }
warn() { WARN=$((WARN + 1)); printf '\033[33mWARN\033[0m  %s\n' "$*" >&2; }

run_cmd() {
  local name="$1"
  shift
  if "$@"; then
    pass "$name"
    return 0
  fi
  fail "$name"
  return 1
}

section "Cesty"
echo "REPO_ROOT=$REPO_ROOT"
echo "APP_DIR=$APP_DIR"
echo "SMOKE_BASE_URL=$SMOKE_BASE_URL"
echo "GITHUB_REPO=$GITHUB_REPO"

cd "$REPO_ROOT"

section "Git fetch + sync"
run_cmd "git fetch origin" git fetch origin

BRANCH="$(git branch --show-current)"
echo "Aktuálna vetva: $BRANCH"

if git status --porcelain | grep -q .; then
  warn "Working tree nie je čistý:"
  git status -sb
else
  pass "Working tree čistý"
fi

if git rev-parse --verify origin/main >/dev/null 2>&1; then
  AHEAD="$(git rev-list --count origin/main..HEAD 2>/dev/null || echo 0)"
  BEHIND="$(git rev-list --count HEAD..origin/main 2>/dev/null || echo 0)"
  echo "origin/main..HEAD (ahead): $AHEAD commit(ov)"
  echo "HEAD..origin/main (behind): $BEHIND commit(ov)"

  if [[ "$BRANCH" == "main" && "$BEHIND" -eq 0 ]]; then
    pass "main je sync s origin/main"
  elif [[ "$BRANCH" == "main" && "$BEHIND" -gt 0 ]]; then
    fail "main je pozadu o $BEHIND commit(ov) — spusti: git pull --ff-only origin main"
  else
    if [[ "$BEHIND" -eq 0 ]]; then
      pass "vetva $BRANCH je rebased na origin/main"
    else
      warn "vetva $BRANCH je pozadu o $BEHIND commit(ov) voči origin/main"
    fi
    if [[ "$AHEAD" -gt 0 ]]; then
      echo "Lokálne commity pred pushom:"
      git log --oneline "origin/main..HEAD" | head -20
    fi
  fi
else
  warn "origin/main neexistuje"
fi

# Lokálne vetvy, ktorých remote už nie je (gone)
GONE="$(git branch -vv | grep ': gone]' | sed 's/^[* ] //' | cut -d' ' -f1 || true)"
if [[ -n "$GONE" ]]; then
  warn "Lokálne vetvy so zmazaným remote (môžeš: git branch -D <name>):"
  echo "$GONE" | sed 's/^/  - /'
else
  pass "žiadne lokálne [gone] vetvy"
fi

section "GitHub (gh CLI)"
if command -v gh >/dev/null 2>&1; then
  if gh auth status >/dev/null 2>&1; then
    pass "gh prihlásený"

    OPEN_COUNT="$(gh pr list --repo "$GITHUB_REPO" --state open --json number --jq 'length')"
    if [[ "$OPEN_COUNT" -eq 0 ]]; then
      pass "žiadne otvorené PR"
    else
      warn "$OPEN_COUNT otvorený(ch) PR:"
      gh pr list --repo "$GITHUB_REPO" --state open
    fi

    echo "Posledné mergnuté PR:"
    gh pr list --repo "$GITHUB_REPO" --state merged --limit 5 \
      --json number,title,mergedAt --jq '.[] | "#\(.number) \(.title) (\(.mergedAt))"'

    echo "Remote vetvy (origin):"
    git branch -r | grep -v 'HEAD' | sed 's/^/  /'
  else
    warn "gh nie je prihlásený — spusti: gh auth login"
  fi
else
  warn "gh CLI nie je nainštalovaný — preskočené PR checks"
fi

section "Secrets v stage (rýchly audit)"
if git diff --cached --name-only 2>/dev/null | grep -qE '\.env\.local$|\.env$'; then
  fail "V stage je .env súbor — necommituj secrets"
elif git ls-files --error-unmatch .env.local >/dev/null 2>&1; then
  fail ".env.local je trackovaný v gite"
else
  pass "žiadny .env.local v stage/track"
fi

if [[ "$RUN_TESTS" -eq 1 ]]; then
  section "Testy (visual-html)"
  if [[ ! -d "$APP_DIR/node_modules" ]]; then
    warn "node_modules chýba — spúšťam npm install"
    (cd "$APP_DIR" && npm install)
  fi

  (cd "$APP_DIR" && run_cmd "npm test" npm test)
  (cd "$APP_DIR" && run_cmd "npm run lint" npm run lint)
  (cd "$APP_DIR" && run_cmd "npx tsc --noEmit" npx tsc --noEmit)
  (cd "$APP_DIR" && run_cmd "npm run test:integrity:fast" npm run test:integrity:fast)
fi

if [[ "$RUN_SMOKE" -eq 1 ]]; then
  section "Production HTTP smoke"
  if ! command -v curl >/dev/null 2>&1; then
    fail "curl nie je k dispozícii"
  else
    for path in "/" "/projects" "/builder" "/favicon.ico" "/site.webmanifest"; do
      code="$(curl -sI -o /dev/null -w '%{http_code}' "${SMOKE_BASE_URL}${path}" || echo "000")"
      if [[ "$code" == "200" ]]; then
        pass "${path} -> ${code}"
      else
        fail "${path} -> ${code} (očakávané 200)"
      fi
    done
  fi
fi

section "Súhrn"
printf '%s\n' "PASS: $PASS  FAIL: $FAIL  WARN: $WARN"

if [[ "$FAIL" -gt 0 ]]; then
  echo
  bold "Gate FAILED — oprav FAIL položky pred push/merge/deploy."
  exit 1
fi

bold "Gate OK."
if [[ "$RUN_TESTS" -eq 0 && "$RUN_SMOKE" -eq 0 ]]; then
  echo "Tip: ./scripts/github-release-gate.sh --full   # testy + HTTP smoke"
fi
exit 0