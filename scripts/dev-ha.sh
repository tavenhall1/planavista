#!/usr/bin/env bash
# Local development Home Assistant for PlanaVista (Docker).
#
#   scripts/dev-ha.sh up               create and start the dev instance (first run)
#   scripts/dev-ha.sh deploy           copy the integration in and restart HA
#   scripts/dev-ha.sh deploy-frontend  copy only frontend/dist (no restart; hard-refresh the browser)
#   scripts/dev-ha.sh wait             block until the HA API answers
#   scripts/dev-ha.sh logs [N]         tail the HA log, filtered to planavista (default 50 lines)
#   scripts/dev-ha.sh status | stop | start | down
#
# HA config lives in a Docker volume (SQLite is unreliable on Windows bind
# mounts). The port binds to 127.0.0.1 only. First-run onboarding:
#   python scripts/ha.py onboard
set -euo pipefail
export MSYS_NO_PATHCONV=1

IMAGE="${PLANAVISTA_DEV_IMAGE:-ghcr.io/home-assistant/home-assistant:2026.9.4}"
NAME="planavista-dev-ha"
VOLUME="planavista-dev-ha-config"
PORT="${PLANAVISTA_DEV_PORT:-8124}"
TZ_NAME="${PLANAVISTA_DEV_TZ:-America/Chicago}"
REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SRC="custom_components/planavista"

wait_up() {
  for _ in $(seq 1 90); do
    code=$(curl -s -o /dev/null -w '%{http_code}' "http://127.0.0.1:$PORT/api/" || true)
    if [[ "$code" == "401" || "$code" == "200" ]]; then echo "HA is up on http://127.0.0.1:$PORT"; return 0; fi
    sleep 2
  done
  echo "HA did not come up in time" >&2; return 1
}

copy_integration() {
  docker exec "$NAME" rm -rf "/config/$SRC"
  docker exec "$NAME" mkdir -p /config/custom_components
  tar -C "$REPO" -cf - --exclude=node_modules --exclude=__pycache__ "$SRC" | docker cp - "$NAME:/config/"
}

case "${1:-}" in
  up)
    docker volume create "$VOLUME" >/dev/null
    docker run -d --name "$NAME" --restart unless-stopped \
      -p "127.0.0.1:$PORT:8123" -e "TZ=$TZ_NAME" -v "$VOLUME:/config" "$IMAGE" >/dev/null
    wait_up ;;
  deploy)
    copy_integration
    docker restart "$NAME" >/dev/null
    wait_up ;;
  deploy-frontend)
    docker exec "$NAME" mkdir -p "/config/$SRC/frontend/dist"
    docker cp "$REPO/$SRC/frontend/dist/." "$NAME:/config/$SRC/frontend/dist/"
    echo "frontend copied; hard-refresh the browser (Ctrl+Shift+R)" ;;
  wait)   wait_up ;;
  logs)   docker logs --tail 2000 "$NAME" 2>&1 | grep -i -E "planavista|error|exception" | tail -n "${2:-50}" ;;
  status) docker ps -a --filter "name=^${NAME}$" --format '{{.Names}}  {{.Status}}  {{.Ports}}' ;;
  stop)   docker stop "$NAME" >/dev/null && echo stopped ;;
  start)  docker start "$NAME" >/dev/null && wait_up ;;
  down)   docker rm -f "$NAME" >/dev/null && echo "container removed (volume $VOLUME kept; 'docker volume rm $VOLUME' to wipe)" ;;
  *) sed -n '2,12p' "$0"; exit 1 ;;
esac
