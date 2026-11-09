# Shared by setup.sh, scripts/start.sh, scripts/db-pull-online.sh and the git hooks.
# Makes node and pnpm available even in a fresh, non-login shell.

export COREPACK_ENABLE_DOWNLOAD_PROMPT=0
export PATH="$HOME/.local/bin:$PATH"
LOCAL_DB_URL="${LOCAL_DB_URL:-postgresql://appamora:appamora@localhost:5434/appamora}"

load_node() {
  export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
  if [[ -s "$NVM_DIR/nvm.sh" ]]; then
    # shellcheck source=/dev/null
    source "$NVM_DIR/nvm.sh"
  fi
}
command -v node >/dev/null || load_node
