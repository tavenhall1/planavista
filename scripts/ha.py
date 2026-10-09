#!/usr/bin/env python3
"""Small Home Assistant API client for PlanaVista development.

Targets the local dev instance (see scripts/dev-ha.sh) unless --prod is given,
in which case it uses HA_URL / HA_TOKEN from the environment (on Windows it also
reads the user environment, so variables set after the shell started work).
Tokens are never printed.

  python scripts/ha.py onboard                       one-time setup of a fresh dev HA
  python scripts/ha.py api GET /api/states/sensor.planavista_config
  python scripts/ha.py api POST /api/services/planavista/save_config '{"display": {}}'
  python scripts/ha.py ws '{"type": "system_log/list"}'
  python scripts/ha.py flow local_calendar '{"calendar_name": "Test Alex"}'
  python scripts/ha.py --prod api GET /api/config

Requires: pip install websocket-client
"""
from __future__ import annotations

import json
import os
import re
import secrets
import sys
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

DEV_URL = f"http://127.0.0.1:{os.environ.get('PLANAVISTA_DEV_PORT', '8124')}"
CRED_FILE = Path.home() / ".planavista-dev" / "credentials.json"


def _user_env(name: str) -> str | None:
    value = os.environ.get(name)
    if value or os.name != "nt":
        return value
    import winreg  # Windows: variables set after this shell started
    try:
        with winreg.OpenKey(winreg.HKEY_CURRENT_USER, "Environment") as key:
            return winreg.QueryValueEx(key, name)[0]
    except OSError:
        return None


def target(prod: bool) -> tuple[str, str]:
    if prod:
        url, token = _user_env("HA_URL"), _user_env("HA_TOKEN")
        if not (url and token):
            sys.exit("HA_URL / HA_TOKEN are not set")
        return url.rstrip("/"), token
    if not CRED_FILE.exists():
        sys.exit(f"no dev credentials at {CRED_FILE}; run: python scripts/ha.py onboard")
    creds = json.loads(CRED_FILE.read_text())
    return creds["url"], creds["token"]


def api_path(path: str) -> str:
    """Normalize an API path; undo Git Bash (MSYS) rewriting '/api/x' into 'C:/Program Files/Git/api/x'."""
    match = re.match(r"^[A-Za-z]:/(?:.*/)?Git(/.+)$", path)
    if match:
        path = match.group(1)
    return "/" + path.lstrip("/")


def http(method: str, url: str, token: str | None = None, body=None, form: bool = False):
    headers = {}
    data = None
    if token:
        headers["Authorization"] = f"Bearer {token}"
    if body is not None:
        if form:
            data = urllib.parse.urlencode(body).encode()
            headers["Content-Type"] = "application/x-www-form-urlencoded"
        else:
            data = json.dumps(body).encode()
            headers["Content-Type"] = "application/json"
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            raw = resp.read().decode()
            return resp.status, (json.loads(raw) if raw.strip()[:1] in "[{" else raw)
    except urllib.error.HTTPError as err:
        return err.code, err.read().decode()


def ws_call(url: str, token: str, *messages: dict) -> list:
    import websocket  # websocket-client

    conn = websocket.create_connection(url.replace("http", "ws", 1) + "/api/websocket", timeout=30)
    try:
        json.loads(conn.recv())  # auth_required
        conn.send(json.dumps({"type": "auth", "access_token": token}))
        if json.loads(conn.recv()).get("type") != "auth_ok":
            sys.exit("websocket auth failed")
        results = []
        for i, msg in enumerate(messages, start=1):
            conn.send(json.dumps({"id": i, **msg}))
            while True:
                reply = json.loads(conn.recv())
                if reply.get("id") == i and reply.get("type") == "result":
                    results.append(reply)
                    break
        return results
    finally:
        conn.close()


def onboard() -> None:
    url = DEV_URL
    status, steps = http("GET", f"{url}/api/onboarding")
    if status != 200:
        sys.exit(f"onboarding status HTTP {status}: {steps}")
    if all(step.get("done") for step in steps):
        sys.exit("dev HA is already onboarded")
    client_id = f"{url}/"
    password = secrets.token_urlsafe(12)
    status, user = http("POST", f"{url}/api/onboarding/users", body={
        "client_id": client_id, "name": "Dev", "username": "dev",
        "password": password, "language": "en"})
    if status != 200:
        sys.exit(f"create user HTTP {status}: {user}")
    status, tok = http("POST", f"{url}/auth/token", form=True, body={
        "grant_type": "authorization_code", "code": user["auth_code"], "client_id": client_id})
    if status != 200:
        sys.exit(f"token exchange HTTP {status}: {tok}")
    access = tok["access_token"]
    for step, body in (("core_config", {}), ("analytics", {}),
                       ("integration", {"client_id": client_id, "redirect_uri": f"{url}/?auth_callback=1"})):
        status, out = http("POST", f"{url}/api/onboarding/{step}", access, body)
        print(f"onboarding {step}: HTTP {status}")
    llat, core = ws_call(url, access,
                         {"type": "auth/long_lived_access_token", "client_name": "PlanaVista dev", "lifespan": 3650},
                         {"type": "config/core/update", "time_zone": os.environ.get("PLANAVISTA_DEV_TZ", "America/Chicago"),
                          "country": "US", "unit_system": "us_customary"})
    if not llat.get("success"):
        sys.exit(f"long-lived token failed: {llat}")
    print(f"core config update: {'ok' if core.get('success') else core}")
    CRED_FILE.parent.mkdir(parents=True, exist_ok=True)
    CRED_FILE.write_text(json.dumps({"url": url, "username": "dev", "password": password,
                                     "token": llat["result"]}, indent=2))
    print(f"onboarded; UI login 'dev' (password in {CRED_FILE})")


def main(argv: list[str]) -> None:
    prod = "--prod" in argv
    args = [a for a in argv if a != "--prod"]
    if not args:
        sys.exit(__doc__)
    cmd, rest = args[0], args[1:]
    if cmd == "onboard":
        return onboard()
    url, token = target(prod)
    if cmd == "api":
        method, path = rest[0].upper(), api_path(rest[1])
        body = json.loads(rest[2]) if len(rest) > 2 else None
        status, out = http(method, f"{url}{path}", token, body)
        print(f"HTTP {status}")
        print(json.dumps(out, indent=2) if not isinstance(out, str) else out)
    elif cmd == "ws":
        (reply,) = ws_call(url, token, json.loads(rest[0]))
        print(json.dumps(reply, indent=2))
    elif cmd == "flow":
        handler, data = rest[0], json.loads(rest[1]) if len(rest) > 1 else {}
        status, form = http("POST", f"{url}/api/config/config_entries/flow", token, {"handler": handler})
        if status != 200 or form.get("type") != "form":
            print(f"HTTP {status}: {form}")
            return
        status, out = http("POST", f"{url}/api/config/config_entries/flow/{form['flow_id']}", token, data)
        print(f"HTTP {status}: type={out.get('type')} title={out.get('title')} errors={out.get('errors')}")
    else:
        sys.exit(__doc__)


if __name__ == "__main__":
    main(sys.argv[1:])
