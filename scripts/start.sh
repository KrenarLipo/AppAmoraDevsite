#!/usr/bin/env bash
# Starts the local database and the website, and opens it in the browser.
#   ./scripts/start.sh        (or the "AppAmora (dev)" icon from setup.sh)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
# shellcheck source=lib/env.sh
source "$ROOT/scripts/lib/env.sh"

pnpm db:up

# Open the browser as soon as the site answers.
(
  for _ in $(seq 1 90); do
    if curl -s -o /dev/null http://localhost:3000/en; then
      xdg-open http://localhost:3000/en >/dev/null 2>&1 || true
      exit 0
    fi
    sleep 1
  done
) &

echo "Starting AppAmora on http://localhost:3000 (press Ctrl+C to stop)…"
exec pnpm dev
