#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────────────────────
# AQLIYA Pilot Launch — One-click Unix launcher (Linux / macOS)
# ──────────────────────────────────────────────────────────────────────────────
#
# Usage:   ./scripts/pilot/launch-pilot.sh [options]
#
# Options:
#   --help        Show usage instructions
#   --skip-build  Skip the Next.js build step (useful if already built)
#   --skip-seed   Skip pilot database seeding (preserve existing data)
#   --no-browser  Don't open browser after launch
#
# Requires:
#   - Node.js 20+ (22+ recommended)
#   - Docker (Docker Desktop or Engine)
#   - Free ports: 3000, 5432, 6379
#   - .env file configured (copy from .env.example)
#
# What it does:
#   1.  Checks prerequisites
#   2.  Starts Docker containers (PostgreSQL + Redis)
#   3.  Waits for PostgreSQL to be healthy
#   4.  Pushes Prisma schema to database
#   5.  Seeds pilot demo data (180+ Saudi institutional records)
#   6.  Generates Prisma client
#   7.  Builds the Next.js application
#   8.  Starts the production server
#   9.  Prints demo account credentials
#   10. Opens browser to http://localhost:3000
# ──────────────────────────────────────────────────────────────────────────────

set -euo pipefail

# ─── Color helpers ───────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

ok()   { echo -e "  ${GREEN}OK${NC}   $*"; }
warn() { echo -e "  ${YELLOW}WARN${NC}  $*"; }
err()  { echo -e "  ${RED}FAIL${NC}  $*"; }
step() { echo -e "${CYAN}[$1/10]${NC} ${WHITE}$2${NC}"; }

banner() {
  echo ""
  echo -e "${BLUE}  ╔══════════════════════════════════════════════════╗"
  echo -e "  ║     ${WHITE}AQLIYA PILOT LAUNCHER — Unix Edition${BLUE}        ║"
  echo -e "  ╚══════════════════════════════════════════════════╝${NC}"
  echo ""
}

# ─── Parse args ──────────────────────────────────────────────────────────────
SKIP_BUILD=false
SKIP_SEED=false
NO_BROWSER=false

for arg in "$@"; do
  case $arg in
    --help)
      banner
      echo -e "${YELLOW}USAGE:${NC}"
      echo "  ./scripts/pilot/launch-pilot.sh [options]"
      echo ""
      echo -e "${YELLOW}OPTIONS:${NC}"
      echo "  --help          Show this help message"
      echo "  --skip-build    Skip the Next.js build step"
      echo "  --skip-seed     Skip pilot database seeding"
      echo "  --no-browser    Don't open browser after launch"
      echo ""
      echo -e "${YELLOW}REQUIRES:${NC}"
      echo "  - Node.js 20+ (recommended: 22+)"
      echo "  - Docker (Docker Desktop or Engine)"
      echo "  - Free ports: 3000, 5432, 6379"
      echo "  - .env file configured (copy from .env.example)"
      echo ""
      echo -e "${YELLOW}FIRST-TIME SETUP:${NC}"
      echo "  1. cp .env.example .env (and configure AUTH_SECRET)"
      echo "  2. Ensure Docker is running"
      echo "  3. ./scripts/pilot/launch-pilot.sh"
      echo ""
      exit 0
      ;;
    --skip-build) SKIP_BUILD=true ;;
    --skip-seed)  SKIP_SEED=true ;;
    --no-browser) NO_BROWSER=true ;;
    *)
      echo "Unknown option: $arg. Use --help for usage."
      exit 1
      ;;
  esac
done

# ─── Resolve script directory ────────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$ROOT_DIR"

# ─── MAIN ────────────────────────────────────────────────────────────────────
banner

# ═══ Step 1: Prerequisites ═══════════════════════════════════════════════════
step 1 "Checking prerequisites..."
FAILED=false

if [ ! -f ".env" ]; then
  err ".env file not found at $ROOT_DIR/.env"
  warn "Copy .env.example to .env and configure AUTH_SECRET first"
  FAILED=true
fi

if ! command -v node &>/dev/null; then
  err "Node.js not found"
  FAILED=true
else
  NODE_VER=$(node --version 2>/dev/null | grep -oP 'v\K\d+' || echo "0")
  if [ "$NODE_VER" -lt 20 ]; then
    err "Node.js v$NODE_VER detected — need 20+ (22+ recommended)"
    FAILED=true
  else
    ok "Node.js v$(node --version | sed 's/v//')"
  fi
fi

if ! command -v docker &>/dev/null; then
  err "Docker not found — install Docker Engine or Docker Desktop"
  FAILED=true
else
  ok "Docker $(docker --version | head -1 | cut -d' ' -f3 | sed 's/,//')"
fi

if ! command -v npm &>/dev/null; then
  err "npm not found"
  FAILED=true
else
  ok "npm v$(npm --version)"
fi

# Port check — try multiple methods
check_port() {
  local port=$1
  if command -v lsof &>/dev/null; then
    lsof -i ":$port" -sTCP:LISTEN &>/dev/null && return 1 || return 0
  elif command -v ss &>/dev/null; then
    ss -tlnp 2>/dev/null | grep -q ":$port " && return 1 || return 0
  elif command -v netstat &>/dev/null; then
    netstat -tlnp 2>/dev/null | grep -q ":$port " && return 1 || return 0
  else
    # Can't check — assume free
    return 0
  fi
}

for port in 3000 5432 6379; do
  if check_port "$port"; then
    ok "Port $port is free"
  else
    err "Port $port is in use — free it before launching"
    FAILED=true
  fi
done

if [ "$FAILED" = true ]; then
  echo ""
  err "Prerequisites check failed. Fix the issues above and re-run."
  exit 1
fi
ok "All prerequisites met"

# ═══ Step 2: Start Docker containers ═════════════════════════════════════════
step 2 "Starting Docker containers (PostgreSQL + Redis)..."
if ! docker compose up -d db redis 2>&1; then
  err "Failed to start Docker containers"
  warn "Ensure Docker is running and docker-compose.yml is valid"
  exit 1
fi
ok "Containers starting..."

# ═══ Step 3: Wait for PostgreSQL ═════════════════════════════════════════════
step 3 "Waiting for PostgreSQL to be healthy..."
MAX_ATTEMPTS=30
HEALTHY=false
for i in $(seq 1 $MAX_ATTEMPTS); do
  STATUS=$(docker compose ps db --format json 2>/dev/null | grep -o '"Health":"healthy"' || true)
  if [ -n "$STATUS" ]; then
    HEALTHY=true
    break
  fi
  printf "  Waiting... (%d/%d)\r" "$i" "$MAX_ATTEMPTS"
  sleep 2
done
echo ""
if [ "$HEALTHY" = false ]; then
  err "PostgreSQL did not become healthy within $((MAX_ATTEMPTS * 2))s"
  warn "Check: docker compose ps db"
  exit 1
fi
ok "PostgreSQL is healthy"

# ═══ Step 4: Push Prisma schema ══════════════════════════════════════════════
step 4 "Pushing Prisma schema..."
if ! npx prisma db push --accept-data-loss 2>&1; then
  err "Prisma db push failed"
  exit 1
fi
ok "Schema pushed"

# ═══ Step 5: Seed pilot data ═════════════════════════════════════════════════
if [ "$SKIP_SEED" = true ]; then
  step 5 "Skipping pilot seed (--skip-seed)"
  warn "Database may be empty or contain stale data"
else
  step 5 "Seeding pilot data (180+ Saudi institutional records)..."
  export PILOT_SEED=true
  if ! npx tsx prisma/seed-pilot.ts 2>&1; then
    err "Pilot seed failed"
    warn "Check DATABASE_URL in .env and PostgreSQL connectivity"
    exit 1
  fi
  ok "Pilot seed complete"
fi

# ═══ Step 6: Generate Prisma client ══════════════════════════════════════════
step 6 "Generating Prisma client..."
if ! npx prisma generate 2>&1; then
  err "Prisma generate failed"
  exit 1
fi
ok "Prisma client generated"

# ═══ Step 7: Build the app ═══════════════════════════════════════════════════
export NODE_OPTIONS="--max-old-space-size=6144"
if [ "$SKIP_BUILD" = true ]; then
  step 7 "Skipping build (--skip-build)"
  warn "Make sure .next/ directory exists from a previous build"
else
  step 7 "Building the Next.js application (this may take a few minutes)..."
  if ! npm run build 2>&1; then
    err "Build failed"
    warn "Check for TypeScript or ESLint errors"
    exit 1
  fi
  ok "Build complete"
fi

# ═══ Step 8-10: Start server, show credentials, open browser ═════════════════
step 8 "Starting production server on http://localhost:3000 ..."
export NODE_ENV=production

echo ""
echo -e "${GREEN}  ╔══════════════════════════════════════════════════╗"
echo -e "  ║                                                   ║"
echo -e "  ║   Server starting...                              ║"
echo -e "  ║   Open: http://localhost:3000                     ║"
echo -e "  ║   Press Ctrl+C to stop                            ║"
echo -e "  ║                                                   ║"
echo -e "  ╚══════════════════════════════════════════════════╝${NC}"
echo ""

# ─── Step 9: Demo credentials ───────────────────────────────────────────────
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "  PILOT DEMO ACCOUNTS"
echo -e "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "  Base accounts (from prisma/seed.ts):"
echo "    admin@aqliya.com    / admin123     (ADMIN — all access)"
echo "    operator@aqliya.com / operator123  (OPERATOR)"
echo "    viewer@aqliya.com   / viewer123    (VIEWER — read only)"
echo ""
echo "  Pilot accounts (from prisma/seed-pilot.ts):"
echo "    admin.pilot@aqliya.com    / pilot123  (ADMIN — full access)"
echo "    partner.pilot@aqliya.com  / pilot123  (ADMIN — partner)"
echo "    manager.pilot@aqliya.com  / pilot123  (OPERATOR — LC + Sales)"
echo "    auditor.pilot@aqliya.com  / pilot123  (OPERATOR — audit)"
echo "    reviewer.pilot@aqliya.com / pilot123  (OPERATOR — review)"
echo "    operator.pilot@aqliya.com / pilot123  (OPERATOR — ops)"
echo "    analyst.pilot@aqliya.com  / pilot123  (OPERATOR — analysis)"
echo "    viewer.pilot@aqliya.com   / pilot123  (VIEWER — read only)"
echo ""
echo "  Full demo-accounts card: scripts/pilot/demo-accounts.md"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# ─── Step 10: Open browser ───────────────────────────────────────────────────
if [ "$NO_BROWSER" = false ]; then
  step 10 "Opening browser to http://localhost:3000 ..."
  if command -v xdg-open &>/dev/null; then
    xdg-open http://localhost:3000 &>/dev/null &
  elif command -v open &>/dev/null; then
    open http://localhost:3000 &>/dev/null &
  elif command -v sensible-browser &>/dev/null; then
    sensible-browser http://localhost:3000 &>/dev/null &
  else
    warn "Could not auto-open browser — navigate to http://localhost:3000 manually"
  fi
else
  step 10 "Browser launch skipped (--no-browser)"
fi

# Start the server (blocking)
sleep 1
exec npm run start
