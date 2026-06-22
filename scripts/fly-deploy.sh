#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
APP="${FLY_APP:-kadince-task-list-assignment}"
REGION="${FLY_REGION:-gru}"
MASTER_KEY_FILE="$ROOT/api/config/master.key"
ENV_FILE="$ROOT/.env"

require_flyctl() {
  if command -v flyctl >/dev/null 2>&1; then
    FLYCTL=(flyctl)
    return
  fi
  if command -v fly >/dev/null 2>&1; then
    FLYCTL=(fly)
    return
  fi
  if [ -x "$HOME/.fly/bin/flyctl" ]; then
    FLYCTL=("$HOME/.fly/bin/flyctl")
    return
  fi
  echo "flyctl not found. Install: https://fly.io/docs/flyctl/install/"
  exit 1
}

read_env_var() {
  local key="$1"
  if [ ! -f "$ENV_FILE" ]; then
    return 1
  fi
  grep -E "^${key}=" "$ENV_FILE" | tail -n1 | cut -d= -f2- | sed 's/^"\(.*\)"$/\1/' | sed "s/^'\(.*\)'$/\1/"
}

cmd_secrets() {
  require_flyctl

  if [ ! -f "$MASTER_KEY_FILE" ]; then
    echo "Missing $MASTER_KEY_FILE"
    exit 1
  fi

  local master_key groq_key cors_origins
  master_key="$(tr -d '\r\n' < "$MASTER_KEY_FILE")"
  groq_key="$(read_env_var GROQ_API_KEY || true)"
  cors_origins="$(read_env_var CORS_ORIGINS || true)"

  echo "Setting secrets on app: $APP"
  "${FLYCTL[@]}" secrets set \
    RAILS_MASTER_KEY="$master_key" \
    SEED_ON_BOOT="true" \
    -a "$APP"

  if [ -n "$groq_key" ] && [ "$groq_key" != "your_groq_api_key_here" ]; then
    "${FLYCTL[@]}" secrets set GROQ_API_KEY="$groq_key" -a "$APP"
  else
    echo "WARN: GROQ_API_KEY not set in .env — AI features will be limited."
  fi

  if [ -n "$cors_origins" ]; then
    "${FLYCTL[@]}" secrets set CORS_ORIGINS="$cors_origins" -a "$APP"
  else
    echo "WARN: CORS_ORIGINS not set in .env — set your Vercel URL before going live."
  fi

  echo "Secrets configured."
  "${FLYCTL[@]}" secrets list -a "$APP"
}

cmd_volume() {
  require_flyctl
  if "${FLYCTL[@]}" volumes list -a "$APP" 2>/dev/null | grep -q "data"; then
    echo "Volume 'data' already exists on $APP"
    return
  fi
  echo "Creating 1GB volume 'data' in $REGION..."
  "${FLYCTL[@]}" volumes create data --region "$REGION" --size 1 -a "$APP" -y
}

cmd_deploy() {
  require_flyctl
  cd "$ROOT"
  cmd_secrets
  cmd_volume
  echo "Deploying $APP..."
  "${FLYCTL[@]}" deploy -a "$APP"
}

cmd_logs() {
  require_flyctl
  "${FLYCTL[@]}" logs -a "$APP" --no-tail | tail -100
}

usage() {
  cat <<EOF
Usage: ./scripts/fly-deploy.sh [command]

Commands:
  secrets   Set Fly secrets from api/config/master.key and .env
  volume    Create the SQLite volume if missing
  deploy    secrets + volume + fly deploy (recommended)
  logs      Show recent app logs

Environment:
  FLY_APP=$APP
  FLY_REGION=$REGION
EOF
}

require_flyctl

case "${1:-deploy}" in
  secrets) cmd_secrets ;;
  volume) cmd_volume ;;
  deploy) cmd_deploy ;;
  logs) cmd_logs ;;
  *) usage ;;
esac
