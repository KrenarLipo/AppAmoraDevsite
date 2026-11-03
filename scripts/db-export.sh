#!/usr/bin/env bash
# Export the data from a database into a SQL file you can import into Neon or Supabase.
#
#   pnpm db:export                      # exports the local Docker database
#   pnpm db:export "postgresql://..."   # exports any other database
#
# The file holds data only. Create the tables on the target first with
# `pnpm db:deploy` (Prisma migrations), then import with:
#   psql "<online DATABASE_URL>" -f backups/<file>.sql
set -euo pipefail

DB_URL="${1:-postgresql://appamora:appamora@localhost:5434/appamora}"
OUT_DIR="$(cd "$(dirname "$0")/.." && pwd)/backups"
OUT_FILE="$OUT_DIR/appamora-data-$(date +%Y%m%d-%H%M%S).sql"
mkdir -p "$OUT_DIR"

# Prisma connection strings may carry ?schema=public, which pg_dump doesn't accept.
DB_URL="${DB_URL%%\?*}"

pg_dump "$DB_URL" \
  --data-only \
  --column-inserts \
  --no-owner \
  --no-privileges \
  --exclude-table=_prisma_migrations \
  | sed '/^\\\(un\)\?restrict /d' > "$OUT_FILE"

echo "Exported to $OUT_FILE"
