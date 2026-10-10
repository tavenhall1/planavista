"""PINs: scrypt hashes, pauses after wrong tries, and in-memory sessions.

hash_pin and verify_pin block for about 40 ms, so callers run them in the
executor. The pause and session rules take the time as an argument. Nothing
here logs, and no error message repeats a PIN.
"""
from __future__ import annotations

import base64
import binascii
from collections.abc import Callable, Mapping
from dataclasses import dataclass, field
from datetime import datetime, timedelta
import hashlib
import hmac
import re
import secrets
from typing import Any

PIN_PATTERN = re.compile(r"[0-9]{4,6}")
SCRYPT_N = 2**14
SCRYPT_R = 8
SCRYPT_P = 1
SCRYPT_LENGTH = 32
SALT_BYTES = 16

MAX_TRIES = 5
FIRST_PAUSE_SECONDS = 30
MAX_PAUSE_SECONDS = 15 * 60

SESSION_IDLE_SECONDS = 120


def valid_pin(pin: object) -> bool:
    """4 to 6 ASCII digits."""
    return isinstance(pin, str) and PIN_PATTERN.fullmatch(pin) is not None


def _derive(pin: str, salt: bytes) -> bytes:
    return hashlib.scrypt(
        pin.encode("ascii"),
        salt=salt,
        n=SCRYPT_N,
        r=SCRYPT_R,
        p=SCRYPT_P,
        dklen=SCRYPT_LENGTH,
    )


def hash_pin(pin: str) -> dict[str, Any]:
    """A new PIN record with no failures. Blocks: run it in the executor."""
    if not valid_pin(pin):
        raise ValueError("PINs are 4 to 6 digits")
    salt = secrets.token_bytes(SALT_BYTES)
    return {
        "hash": base64.b64encode(_derive(pin, salt)).decode("ascii"),
        "salt": base64.b64encode(salt).decode("ascii"),
        "length": len(pin),
        "failures": 0,
        "lockouts": 0,
        "locked_until": None,
    }


def verify_pin(pin: str, record: Mapping[str, Any]) -> bool:
    """Whether `pin` matches the record, compared in constant time. Blocks."""
    if not valid_pin(pin):
        return False
    try:
        salt = base64.b64decode(record["salt"], validate=True)
        expected = base64.b64decode(record["hash"], validate=True)
    except (KeyError, TypeError, ValueError, binascii.Error):
        return False
    return hmac.compare_digest(_derive(pin, salt), expected)


def pause_remaining(record: Mapping[str, Any], now: datetime) -> float:
    """Seconds until the member may try again; 0 when they may now."""
    until = record.get("locked_until")
    if not until:
        return 0.0
    try:
        end = datetime.fromisoformat(until)
    except (TypeError, ValueError):
        return 0.0
    return max(0.0, (end - now).total_seconds())


def tries_left(record: Mapping[str, Any]) -> int:
    """Wrong tries left before the next pause."""
    return MAX_TRIES - int(record.get("failures", 0))


def after_failure(record: Mapping[str, Any], now: datetime) -> dict[str, Any]:
    """The record after a wrong PIN: every fifth wrong try in a row starts a pause.

    Pauses double from 30 seconds up to 15 minutes until a correct PIN, or a
    parent, resets the count (spec section 9.6).
    """
    updated = dict(record)
    failures = int(updated.get("failures", 0)) + 1
    if failures < MAX_TRIES:
        updated["failures"] = failures
        return updated
    lockouts = int(updated.get("lockouts", 0)) + 1
    seconds = min(FIRST_PAUSE_SECONDS * 2 ** min(lockouts - 1, 10), MAX_PAUSE_SECONDS)
    updated.update(
        failures=0,
        lockouts=lockouts,
        locked_until=(now + timedelta(seconds=seconds)).isoformat(),
    )
    return updated


def after_success(record: Mapping[str, Any]) -> dict[str, Any]:
    """The record after a correct PIN, or after a parent clears a pause."""
    return {**record, "failures": 0, "lockouts": 0, "locked_until": None}


@dataclass
class Session:
    """A PIN session on one screen: parent mode, or a member's own session."""

    token: str
    member_id: str
    parent: bool
    last_active: float
    connection: object = field(repr=False)

    def expires_in(self, now: float) -> float:
        """Seconds of quiet left before the session ends."""
        return max(0.0, self.last_active + SESSION_IDLE_SECONDS - now)


class SessionManager:
    """Sessions live in memory only, so a restart or a closed connection forgets them."""

    def __init__(self) -> None:
        """Start with no sessions."""
        self._sessions: dict[str, Session] = {}

    def __len__(self) -> int:
        """How many sessions are open (some may have idled out without being asked yet)."""
        return len(self._sessions)

    def start(self, member_id: str, parent: bool, connection: object, now: float) -> Session:
        """A new session for `member_id` on `connection`."""
        self._drop(lambda s: now - s.last_active >= SESSION_IDLE_SECONDS)
        session = Session(secrets.token_urlsafe(32), member_id, parent, now, connection)
        self._sessions[session.token] = session
        return session

    def get(
        self, token: str | None, connection: object, now: float, *, touch: bool = False
    ) -> Session | None:
        """The live session for `token` on this connection; `touch` counts as activity."""
        session = self._sessions.get(token) if token else None
        if session is None or session.connection is not connection:
            return None
        if now - session.last_active >= SESSION_IDLE_SECONDS:
            del self._sessions[session.token]
            return None
        if touch:
            session.last_active = now
        return session

    def end(self, token: str) -> None:
        """End one session (Lock, or a hidden page)."""
        self._sessions.pop(token, None)

    def end_connection(self, connection: object) -> None:
        """End every session of a connection that closed."""
        self._drop(lambda s: s.connection is connection)

    def end_member(self, member_id: str, keep: str | None = None) -> None:
        """End a member's sessions (their PIN changed, or they were removed)."""
        self._drop(lambda s: s.member_id == member_id and s.token != keep)

    def end_parent_mode(self, member_id: str) -> None:
        """End parent mode for someone who is no longer a parent."""
        self._drop(lambda s: s.member_id == member_id and s.parent)

    def _drop(self, matches: Callable[[Session], bool]) -> None:
        for token in [token for token, s in self._sessions.items() if matches(s)]:
            del self._sessions[token]
