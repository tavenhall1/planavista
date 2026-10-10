"""Tests for household/security.py: PIN hashes, pauses, and sessions."""
from __future__ import annotations

from datetime import UTC, datetime, timedelta

import pytest

from custom_components.planavista.household.security import (
    FIRST_PAUSE_SECONDS,
    MAX_PAUSE_SECONDS,
    MAX_TRIES,
    SESSION_IDLE_SECONDS,
    SessionManager,
    after_failure,
    after_success,
    hash_pin,
    pause_remaining,
    tries_left,
    valid_pin,
    verify_pin,
)

NOW = datetime(2026, 10, 13, 21, 10, tzinfo=UTC)


def test_valid_pins_are_four_to_six_ascii_digits() -> None:
    assert all(valid_pin(pin) for pin in ("0000", "48261", "482613"))
    assert not any(
        valid_pin(pin)
        for pin in ("123", "1234567", "12a4", " 1234", "1234\n", "１２３４", 1234, None, ["1234"])
    )


def test_a_pin_record_holds_a_salted_hash_and_never_the_pin() -> None:
    record = hash_pin("482613")
    assert set(record) == {"hash", "salt", "length", "failures", "lockouts", "locked_until"}
    assert (record["length"], record["failures"], record["lockouts"], record["locked_until"]) == (6, 0, 0, None)
    assert "482613" not in repr(record)
    assert hash_pin("482613")["salt"] != record["salt"]


def test_verify_accepts_only_the_right_pin() -> None:
    record = hash_pin("4826")
    assert verify_pin("4826", record)
    assert not verify_pin("4827", record)
    assert not verify_pin("48260", record)
    assert not verify_pin("", record)
    assert not verify_pin("4826", {"hash": "not base64!", "salt": "x"})


def test_hash_pin_refuses_a_bad_pin_without_repeating_it() -> None:
    with pytest.raises(ValueError) as err:
        hash_pin("12a4")
    assert "12a4" not in str(err.value)


def test_every_fifth_wrong_try_starts_a_longer_pause() -> None:
    record = hash_pin("4826")
    now = NOW
    pauses = []
    for _ in range(7):
        for attempt in range(MAX_TRIES):
            assert pause_remaining(record, now) == 0
            record = after_failure(record, now)
            if attempt < MAX_TRIES - 1:
                assert tries_left(record) == MAX_TRIES - attempt - 1
        pauses.append(pause_remaining(record, now))
        now += timedelta(seconds=pauses[-1] + 1)
    assert pauses == [30, 60, 120, 240, 480, 900, 900]
    assert (FIRST_PAUSE_SECONDS, MAX_PAUSE_SECONDS) == (30, 900)


def test_a_correct_pin_resets_the_count() -> None:
    record = after_failure(after_failure(hash_pin("4826"), NOW), NOW)
    record = after_success(record)
    assert (record["failures"], record["lockouts"], record["locked_until"]) == (0, 0, None)
    assert tries_left(record) == MAX_TRIES


def test_pause_remaining_counts_down() -> None:
    record = hash_pin("4826")
    for _ in range(MAX_TRIES):
        record = after_failure(record, NOW)
    assert pause_remaining(record, NOW + timedelta(seconds=10)) == 20
    assert pause_remaining(record, NOW + timedelta(seconds=31)) == 0
    assert pause_remaining({"locked_until": "garbage"}, NOW) == 0


def test_sessions_are_bound_to_their_connection_and_idle_out() -> None:
    sessions = SessionManager()
    screen, other = object(), object()
    session = sessions.start("blair", parent=True, connection=screen, now=100.0)
    assert len(session.token) >= 43
    assert sessions.get(session.token, screen, 100.0 + SESSION_IDLE_SECONDS - 1) is session
    assert sessions.get(session.token, other, 101.0) is None
    assert sessions.get(session.token, screen, 100.0 + SESSION_IDLE_SECONDS) is None
    assert sessions.get(session.token, screen, 101.0) is None
    assert sessions.get(None, screen, 101.0) is None


def test_touch_keeps_a_session_alive() -> None:
    sessions = SessionManager()
    screen = object()
    session = sessions.start("blair", parent=True, connection=screen, now=0.0)
    for now in (100.0, 200.0, 300.0):
        assert sessions.get(session.token, screen, now, touch=True) is session
    assert session.expires_in(300.0) == SESSION_IDLE_SECONDS
    assert sessions.get(session.token, screen, 300.0 + SESSION_IDLE_SECONDS + 1) is None


def test_ending_sessions() -> None:
    sessions = SessionManager()
    screen, kitchen = object(), object()
    blair = sessions.start("blair", parent=True, connection=screen, now=0.0)
    casey = sessions.start("casey", parent=False, connection=screen, now=0.0)
    alex = sessions.start("alex", parent=True, connection=kitchen, now=0.0)
    sessions.end(blair.token)
    sessions.end(blair.token)
    assert sessions.get(blair.token, screen, 1.0) is None
    sessions.end_connection(screen)
    assert sessions.get(casey.token, screen, 1.0) is None
    assert sessions.get(alex.token, kitchen, 1.0) is alex
    assert len(sessions) == 1
    sessions.end_member("alex")
    assert sessions.get(alex.token, kitchen, 1.0) is None
    assert len(sessions) == 0


def test_end_member_keeps_the_session_that_made_the_change() -> None:
    sessions = SessionManager()
    screen, kitchen = object(), object()
    here = sessions.start("blair", parent=True, connection=screen, now=0.0)
    there = sessions.start("blair", parent=True, connection=kitchen, now=0.0)
    sessions.end_member("blair", keep=here.token)
    assert sessions.get(here.token, screen, 1.0) is here
    assert sessions.get(there.token, kitchen, 1.0) is None


def test_end_parent_mode_only_ends_parent_sessions() -> None:
    sessions = SessionManager()
    screen = object()
    parent = sessions.start("blair", parent=True, connection=screen, now=0.0)
    own = sessions.start("blair", parent=False, connection=screen, now=0.0)
    sessions.end_parent_mode("blair")
    assert sessions.get(parent.token, screen, 1.0) is None
    assert sessions.get(own.token, screen, 1.0) is own
