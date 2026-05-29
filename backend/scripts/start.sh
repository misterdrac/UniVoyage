#!/usr/bin/env bash
# UniVoyage backend — start Docker stack with terminal splash
# Usage:
#   ./scripts/start.sh           # foreground logs
#   ./scripts/start.sh -d        # docker compose up --build -d
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
BACKEND="$(cd "$(dirname "$0")/.." && pwd)"
cd "$BACKEND"

if [[ "${1:-}" == "-d" || "${1:-}" == "--detach" ]]; then
  docker compose up --build -d
  echo ""
  echo "Backend started in background. Check: docker compose ps"
  echo "Health: http://127.0.0.1:8080/actuator/health"
  echo ""
else
  docker compose up --build "$@"
fi
