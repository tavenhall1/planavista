#!/usr/bin/env bash
# Run the backend tests in a Python 3.14 container.
#
#   scripts/test-backend.sh                               run every test
#   scripts/test-backend.sh tests/test_config_flow.py -v  any pytest arguments
#
# Home Assistant 2026.9 needs Python 3.14, so the tests run in Docker rather
# than on the host. The virtualenv lives in the planavista-test-venv volume and
# is rebuilt only when requirements_test.txt changes, so repeat runs are fast.
# Reset it with: docker volume rm planavista-test-venv
set -euo pipefail
export MSYS_NO_PATHCONV=1

IMAGE="${PLANAVISTA_TEST_IMAGE:-python:3.14-slim}"
REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
# Docker Desktop on Windows needs D:/path, not Git Bash's /d/path.
if command -v cygpath >/dev/null 2>&1; then
  REPO="$(cygpath -m "$REPO")"
fi

docker run --rm \
  -v "$REPO:/work" \
  -v planavista-test-venv:/venv \
  -w /work \
  -e PYTHONDONTWRITEBYTECODE=1 \
  "$IMAGE" \
  bash -c '
    set -e
    [ -x /venv/bin/python ] || python -m venv /venv
    want="$(sha256sum requirements_test.txt | cut -d" " -f1)"
    if [ "$(cat /venv/.requirements 2>/dev/null)" != "$want" ]; then
      /venv/bin/pip install -q --disable-pip-version-check -r requirements_test.txt
      echo "$want" > /venv/.requirements
    fi
    exec /venv/bin/pytest -p no:cacheprovider "$@"
  ' pytest "$@"
