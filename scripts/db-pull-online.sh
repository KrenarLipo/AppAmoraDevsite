#!/usr/bin/env bash
# Replaces the local database's data with a copy of the online database (Neon).
#
#   pnpm db:pull-online
#
# Asks for the online connection string (Neon → Connect → "Direct connection").
# Login sessions, rate-limit counters and verification codes are not copied.
# Uses Docker's PostgreSQL 18 tools, so nothing else needs to be installed.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
# shellcheck source=lib/env.sh
source "$ROOT/scripts/lib/env.sh"

if [[ "${1:-}" != "--yes" ]]; then
  echo "This REPLACES all data in your LOCAL database with a copy of the online one."
  read -r -p "Continue? [y/N] " answer
  [[ "$answer" =~ ^[Yy] ]] || exit 0
fi

read -r -s -p "Paste the online database URL (it stays hidden): " ONLINE_URL
echo
[[ "$ONLINE_URL" == postgres* ]] || { echo "That doesn't look like a postgresql:// URL."; exit 1; }
# pg_dump doesn't accept Prisma's extra options; Neon needs SSL.
ONLINE_URL="${ONLINE_URL%%\?*}?sslmode=require"

pg() { docker run --rm -i --network host postgres:18-alpine "$@"; }

echo "Copying data… (the first time, Docker downloads PostgreSQL tools)"
DUMP="$(mktemp)"
trap 'rm -f "$DUMP"' EXIT
pg pg_dump "$ONLINE_URL" --data-only --column-inserts --no-owner --no-privileges \
  --exclude-table=_prisma_migrations --exclude-table='"Session"' \
  --exclude-table='"RateLimit"' --exclude-table='"Verification"' \
  | sed '/^\\\(un\)\?restrict /d' >"$DUMP"

# Empty the local tables (keeping the schema and migration history), then import.
TABLES="$(pg psql "$LOCAL_DB_URL" -tAc "select string_agg(format('%I', tablename), ', ') from pg_tables where schemaname = 'public' and tablename <> '_prisma_migrations'")"
{
  echo "BEGIN;"
  echo "TRUNCATE $TABLES CASCADE;"
  cat "$DUMP"
  echo "COMMIT;"
} | pg psql "$LOCAL_DB_URL" -q -v ON_ERROR_STOP=1 >/dev/null

echo "✓ Local database now matches the online one. Log in with your usual admin email and password."
