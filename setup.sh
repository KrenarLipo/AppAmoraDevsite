#!/usr/bin/env bash
# AppAmora: one-step setup for a new Linux computer (Ubuntu/Debian).
#
#   ./setup.sh
#
# Safe to run again at any time: it only adds what's missing and never
# overwrites your settings files or your local data.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

bold() { printf '\n\033[1m%s\033[0m\n' "$*"; }
ok() { printf '  \033[32m✓\033[0m %s\n' "$*"; }
warn() { printf '  \033[33m!\033[0m %s\n' "$*"; }
fail() { printf '\n  \033[31m✗ %s\033[0m\n\n' "$*"; exit 1; }
ask() { # ask "Question?" → returns 0 for yes
  local answer
  read -r -p "  $1 [Y/n] " answer
  [[ -z "$answer" || "$answer" =~ ^[Yy] ]]
}

# shellcheck source=scripts/lib/env.sh
source "$ROOT/scripts/lib/env.sh"

echo "AppAmora setup"
echo "──────────────"

# ─── 1. Tools ───────────────────────────────────────────────────────────────
bold "1/6  Checking the tools"

apt_missing=()
command -v git >/dev/null || apt_missing+=(git)
command -v curl >/dev/null || apt_missing+=(curl)
command -v openssl >/dev/null || apt_missing+=(openssl)
command -v docker >/dev/null || apt_missing+=(docker.io docker-compose-v2)
command -v gh >/dev/null || apt_missing+=(gh)

if ((${#apt_missing[@]} > 0)); then
  command -v apt-get >/dev/null || fail "Please install: ${apt_missing[*]} (this script can only install them on Ubuntu/Debian)."
  echo "  Missing: ${apt_missing[*]}"
  if ask "Install them now? (asks for your computer password)"; then
    sudo apt-get update -qq
    sudo apt-get install -y "${apt_missing[@]}"
  else
    fail "These tools are needed. Run ./setup.sh again when they're installed."
  fi
fi
ok "git, curl, openssl, docker, gh"

# Node.js 22 or newer, installed for this user with nvm (no admin rights needed).
node_major() { node -v 2>/dev/null | sed -E 's/^v([0-9]+).*/\1/'; }
if [[ -z "$(node_major)" || "$(node_major)" -lt 22 ]]; then
  echo "  Node.js 22 or newer is needed."
  if ask "Install Node.js 24 with nvm?"; then
    if [[ ! -s "${NVM_DIR:-$HOME/.nvm}/nvm.sh" ]]; then
      curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
    fi
    load_node
    nvm install 24
    nvm alias default 24
  else
    fail "Node.js 22+ is needed. Run ./setup.sh again when it's installed."
  fi
fi
ok "Node.js $(node -v)"

# pnpm, in the exact version from package.json, through corepack.
if ! command -v pnpm >/dev/null; then
  mkdir -p "$HOME/.local/bin"
  corepack enable --install-directory "$HOME/.local/bin" pnpm
fi
ok "pnpm $(pnpm -v)"

# Docker must work without sudo.
if ! docker info >/dev/null 2>&1; then
  if ! id -nG "$USER" | grep -qw docker; then
    echo "  Your user can't use Docker yet."
    if ask "Add $USER to the docker group?"; then
      sudo usermod -aG docker "$USER"
    fi
    fail "Log out and back in (or restart), then run ./setup.sh again so the Docker permission applies."
  fi
  sudo systemctl start docker 2>/dev/null || true
  docker info >/dev/null 2>&1 || fail "Docker isn't running. Start it (sudo systemctl start docker) and run ./setup.sh again."
fi
ok "Docker is running"

# ─── 2. Packages ────────────────────────────────────────────────────────────
bold "2/6  Installing the project's packages"
pnpm install --frozen-lockfile
ok "Packages installed"

# ─── 3. Settings files ──────────────────────────────────────────────────────
bold "3/6  Settings files"
if [[ ! -f packages/db/.env ]]; then
  cp packages/db/.env.example packages/db/.env
  ok "Created packages/db/.env (local database)"
else
  ok "packages/db/.env already exists (kept)"
fi
if [[ ! -f apps/web/.env.local ]]; then
  cp apps/web/.env.example apps/web/.env.local
  secret="$(openssl rand -base64 32)"
  sed -i "s|^BETTER_AUTH_SECRET=.*|BETTER_AUTH_SECRET=\"$secret\"|" apps/web/.env.local
  ok "Created apps/web/.env.local with a new secret key"
  warn "Google login, reCAPTCHA and PayPal stay off locally until you add their keys to apps/web/.env.local"
else
  ok "apps/web/.env.local already exists (kept)"
fi

# ─── 4. Database ────────────────────────────────────────────────────────────
bold "4/6  Local database"
pnpm db:up
pnpm --filter @appamora/db exec prisma migrate deploy
ok "Database ready on localhost:5434"

# ─── 5. Data ────────────────────────────────────────────────────────────────
bold "5/6  Data"
has_admin="$(docker run --rm --network host postgres:18-alpine psql "$LOCAL_DB_URL" -tAc \
  "select count(*) from \"User\" where role = 'ADMIN'" 2>/dev/null || echo 0)"
if [[ "$has_admin" != "0" ]]; then
  ok "The local database already has data (kept). To refresh it later: pnpm db:pull-online"
else
  echo "  The local database is empty."
  if ask "Copy the data from the online database (Neon), including your admin login?"; then
    bash scripts/db-pull-online.sh --yes
  elif ask "Create an admin login instead?"; then
    read -r -p "  Admin email: " email
    pnpm admin:create "$email"
  fi
fi

# ─── 6. Git sync and launcher ───────────────────────────────────────────────
bold "6/6  Finishing"
git config core.hooksPath .githooks
ok "After every git pull, new packages and database changes are applied automatically"

if [[ -d "$HOME/.local/share/applications" || -d "$HOME/.local/share" ]] && ask "Add an AppAmora icon to your apps menu (starts everything with one click)?"; then
  mkdir -p "$HOME/.local/share/applications"
  cat >"$HOME/.local/share/applications/appamora-dev.desktop" <<EOF
[Desktop Entry]
Type=Application
Name=AppAmora (dev)
Comment=Start the AppAmora website on this computer
Exec=bash -lc '"$ROOT/scripts/start.sh"; exec bash'
Icon=$ROOT/apps/web/src/app/icon.svg
Terminal=true
Categories=Development;
EOF
  ok "Added \"AppAmora (dev)\" to your apps menu"
fi

if ! gh auth status >/dev/null 2>&1; then
  warn "To push changes from this computer, log in to GitHub once: gh auth login"
fi

bold "All set!"
echo "  Start the website:  ./scripts/start.sh   (or the AppAmora icon)"
echo "  Then open:          http://localhost:3000"
echo "  Admin:              http://localhost:3000/en/login"
echo
