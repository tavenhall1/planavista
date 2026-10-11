"""The chores engine inside Home Assistant (spec sections 6.1, 8.9, 10.1, and 15.3).

One ChoresRuntime per Home Assistant run holds the engine and its Store
files. It saves what each write changed (the log after a second, the rest at
once), fires the events, tells the card's subscriptions and the entities, runs
every day boundary on time and the ones missed while Home Assistant was off,
and keeps devices and entities in step with the household. Chores entities
exist only while the module is on; a calendar-only household gets no to-do
lists, sensors, events, or devices from chores at all.
"""
from __future__ import annotations

from collections import deque
from collections.abc import Callable
from dataclasses import dataclass
from datetime import UTC, datetime, timedelta
import logging
from typing import TYPE_CHECKING, Any

from homeassistant.config_entries import ConfigEntry, ConfigEntryState
from homeassistant.const import EVENT_CORE_CONFIG_UPDATE, EVENT_HOMEASSISTANT_FINAL_WRITE, Platform
from homeassistant.core import CALLBACK_TYPE, Event, HomeAssistant, callback
from homeassistant.exceptions import ServiceValidationError, UnsupportedStorageVersionError
from homeassistant.helpers import device_registry as dr, entity_registry as er, issue_registry as ir
from homeassistant.helpers.dispatcher import async_dispatcher_connect
from homeassistant.helpers.event import async_call_later, async_track_point_in_utc_time, async_track_time_interval
from homeassistant.util import dt as dt_util
from homeassistant.util.hass_dict import HassKey
from homeassistant.util.ulid import ulid_now

from ..const import CONF_DISPLAY, CONF_FIRST_DAY, DOMAIN, SIGNAL_CONFIG_APPLIED
from ..household.store import Household
from .engine import ChoreEvent, ChoresEngine, Item, Outcome
from .model import default_log, default_plan, default_rewards
from .notify import ChoresNotifier
from .store import NORMALIZERS, STORE_KEYS, ChoresStores

if TYPE_CHECKING:
    from homeassistant.helpers.entity import Entity
    from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback

_LOGGER = logging.getLogger(__name__)

CHORES_PLATFORMS: tuple[Platform, ...] = (Platform.TODO, Platform.BINARY_SENSOR, Platform.EVENT)
LOG_SAVE_DELAY = 1.0
REFRESH_INTERVAL = timedelta(minutes=5)

STATE_OFF = "off"
STATE_OK = "ok"
STATE_NEEDS_A_LOOK = "needs_a_look"
STATE_NEWER = "newer"

ISSUE_NEWER = "chores_newer_version"
ISSUE_MISSING = "chores_data_missing"
ISSUE_SAVE = "chores_save_failed"

HOUSEHOLD_DEVICE = "household"


def member_device_id(member_id: str) -> str:
    """The device identifier of a member's device (spec 10.1)."""
    return f"member_{member_id}"


def chores_unique_id(entry_id: str, owner: str, key: str) -> str:
    """Unique ids of chores entities: `<entry>_chores_<member or household>_<key>`."""
    return f"{entry_id}_chores_{owner}_{key}"


class ChoresUnavailable(ServiceValidationError):
    """Chores are off, need a look, or were saved by a newer PlanaVista."""


@dataclass
class _Platform:
    add_entities: AddConfigEntryEntitiesCallback
    member_entities: Callable[[str], list[Entity]]
    household_entities: Callable[[], list[Entity]] | None


class ChoresRuntime:
    """The chores module for one Home Assistant run."""

    def __init__(
        self,
        hass: HomeAssistant,
        household: Household,
        stores: ChoresStores,
        documents: dict[str, dict[str, Any]],
        problem: str | None,
    ) -> None:
        """Wrap loaded documents. `problem` is needs_a_look, newer, or None."""
        self.hass = hass
        self.household = household
        self.stores = stores
        self.problem = problem
        self.engine = ChoresEngine(
            documents["plan"], documents["log"], documents["rewards"], household.members,
            tz=dt_util.get_default_time_zone(), new_id=ulid_now,
        )
        self.entry: ConfigEntry | None = None
        self.platforms_loaded = False
        self.save_failed = False
        self.errors: deque[dict[str, str]] = deque(maxlen=10)
        self._platforms: dict[str, _Platform] = {}
        self._devices: dict[str, str] = {}
        self._listeners: list[Callable[[], None]] = []
        self._entity_listeners: list[Callable[[], None]] = []
        self._event_listeners: list[Callable[[ChoreEvent], None]] = []
        self._board: dict[str, Any] | None = None
        self._items: dict[str, list[Item]] | None = None
        self._unsubs: list[CALLBACK_TYPE] = []
        self._boundary: CALLBACK_TYPE | None = None
        self._log_save: CALLBACK_TYPE | None = None
        self._started = False
        self.notifier = ChoresNotifier(hass, self)

    # State ------------------------------------------------------------------------

    @property
    def module(self) -> dict[str, Any]:
        """The household's record of the chores module."""
        return dict(self.household.data["modules"].get("chores") or {})

    @property
    def enabled(self) -> bool:
        """Whether the household turned chores on."""
        return bool(self.module.get("enabled")) and self.household.available

    @property
    def state(self) -> str:
        """off, ok, needs_a_look (set up, but a file came back empty), or newer."""
        if self.problem == STATE_NEWER:
            return STATE_NEWER
        if not self.enabled:
            return STATE_OFF
        return self.problem or STATE_OK

    @property
    def available(self) -> bool:
        """Whether chores can be read and changed."""
        return self.state == STATE_OK

    @staticmethod
    def now() -> datetime:
        """The server's clock decides (spec 15.1)."""
        return dt_util.utcnow()

    def require(self) -> ChoresEngine:
        """The engine, or ChoresUnavailable saying why chores can't change now."""
        if self.state == STATE_OFF:
            raise ChoresUnavailable(translation_domain=DOMAIN, translation_key="chores_off")
        if not self.available:
            raise ChoresUnavailable(translation_domain=DOMAIN, translation_key="chores_unavailable")
        return self.engine

    # Views ------------------------------------------------------------------------

    def items(self) -> dict[str, list[Item]]:
        """Everyone's items today, worked out once per change."""
        if self._items is None:
            self._items = self.engine.items(self.now())
        return self._items

    def board(self) -> dict[str, Any]:
        """Today's board, computed once per change."""
        if self._board is None:
            self._board = self.engine.board(self.now(), items=self.items())
        return self._board

    def member_view(self, member_id: str) -> dict[str, Any] | None:
        """One member's part of today's board."""
        return self.board()["members"].get(member_id)

    def todo_items(self, member_id: str) -> list[Item]:
        """A member's to-do list right now."""
        return self.engine.todo_items(member_id, self.now(), items=self.items())

    def feed(self) -> dict[str, Any]:
        """What planavista/chores/subscribe sends."""
        return {
            "state": self.state,
            "save_failed": self.save_failed,
            "board": self.board() if self.available else None,
            "notify_problems": self.notifier.problems(),
        }

    @callback
    def async_listen(self, listener: Callable[[], None]) -> CALLBACK_TYPE:
        """Call `listener` after every change (the card's subscriptions)."""
        return self._add(self._listeners, listener)

    @callback
    def async_listen_entities(self, listener: Callable[[], None]) -> CALLBACK_TYPE:
        """Call `listener` after every change and every few minutes (entities)."""
        return self._add(self._entity_listeners, listener)

    @callback
    def async_listen_events(self, listener: Callable[[ChoreEvent], None]) -> CALLBACK_TYPE:
        """Call `listener` with every chores event (event entities)."""
        return self._add(self._event_listeners, listener)

    @staticmethod
    def _add(listeners: list[Any], listener: Any) -> CALLBACK_TYPE:
        listeners.append(listener)

        @callback
        def remove() -> None:
            if listener in listeners:
                listeners.remove(listener)

        return remove

    @callback
    def async_notify(self, *, changed: bool = True) -> None:
        """Tell entities (and, after a change, the card) to read again."""
        self._board = None
        self._items = None
        for listener in list(self._entity_listeners):
            listener()
        if changed:
            for listener in list(self._listeners):
                listener()

    # Writing ----------------------------------------------------------------------

    async def async_run(self, action: Callable[[ChoresEngine, datetime], Outcome]) -> Outcome:
        """Run one engine write and apply what it did."""
        engine = self.require()
        outcome = action(engine, self.now())
        await self.async_apply(outcome)
        return outcome

    async def async_apply(self, outcome: Outcome) -> None:
        """Save what changed, fire the events, and tell everyone."""
        for name in ("plan", "rewards"):
            if name in outcome.changed:
                await self.stores.async_save(name, getattr(self.engine, name))
        if "log" in outcome.changed:
            self._schedule_log_save()
        self._check_writes()
        for event in outcome.events:
            _LOGGER.debug("Chores event %s for %s: %s", event.type, event.member, event.data.get("occurrence"))
            for listener in list(self._event_listeners):
                listener(event)
        self.async_notify(changed=bool(outcome.changed or outcome.events))
        self._schedule_boundary()

    def _schedule_log_save(self) -> None:
        if self._log_save is None:
            self._log_save = async_call_later(self.hass, LOG_SAVE_DELAY, self._async_save_log)

    async def _async_save_log(self, _now: datetime | None = None) -> None:
        self._log_save = None
        await self.stores.async_save("log", self.engine.log)
        self._check_writes()

    async def async_flush(self) -> None:
        """Write a waiting log save, and any failed write, now (Home Assistant is stopping, or the entry unloads)."""
        if self._log_save is not None:
            self._log_save()
            await self._async_save_log()
        await self._async_retry_writes()

    async def _async_retry_writes(self) -> None:
        """Write again each file whose last write failed: its change is still in memory."""
        if self.problem is not None:
            return  # nothing is written over a damaged file or a newer release's
        failed = [name for name, store in self.stores.files.items() if store.write_failed]
        for name in failed:
            await self.stores.async_save(name, getattr(self.engine, name))
        if failed:
            self._check_writes()

    @callback
    def _check_writes(self) -> None:
        failed = self.stores.write_failed
        if failed and not self.save_failed:
            _LOGGER.warning("PlanaVista couldn't save chores; check the disk Home Assistant writes to")
            self.errors.append({"at": dt_util.now().isoformat(), "error": "save_failed"})
            ir.async_create_issue(
                self.hass, DOMAIN, ISSUE_SAVE, is_fixable=False,
                severity=ir.IssueSeverity.ERROR, translation_key=ISSUE_SAVE,
            )
        elif not failed and self.save_failed:
            ir.async_delete_issue(self.hass, DOMAIN, ISSUE_SAVE)
        if failed != self.save_failed:
            self.save_failed = failed
            self.async_notify()

    # Starting and stopping -------------------------------------------------------

    async def async_start(self) -> None:
        """Once Home Assistant has started: catch up on missed day boundaries, then keep time."""
        if self._started:
            return
        self._started = True
        self._unsubs.append(self.household.async_listen(self._on_household))
        self._unsubs.append(self.hass.bus.async_listen(EVENT_CORE_CONFIG_UPDATE, self._on_core_config))
        self._unsubs.append(self.hass.bus.async_listen_once(EVENT_HOMEASSISTANT_FINAL_WRITE, self._on_final_write))
        self._unsubs.append(async_track_time_interval(self.hass, self._on_refresh, REFRESH_INTERVAL))
        self._unsubs.append(async_dispatcher_connect(self.hass, SIGNAL_CONFIG_APPLIED, self._on_config_applied))
        await self.async_sync_members()
        if self.available:
            if self._sync_first_day():
                self._schedule_log_save()
            await self.async_apply(self.engine.catch_up(self.now()))
        self._schedule_boundary()
        self.notifier.async_start()

    @callback
    def async_stop(self) -> None:
        """The entry unloaded: stop every timer and listener."""
        self._started = False
        self.notifier.async_stop()
        for unsub in self._unsubs:
            unsub()
        self._unsubs.clear()
        self._platforms.clear()
        self._devices.clear()
        if self._boundary is not None:
            self._boundary()
            self._boundary = None

    def _schedule_boundary(self) -> None:
        if self._boundary is not None:
            self._boundary()
            self._boundary = None
        if not self._started or not self.available:
            return
        when = self.engine.next_boundary(self.now()).astimezone(UTC)
        self._boundary = async_track_point_in_utc_time(self.hass, self._on_boundary, when)

    async def _on_boundary(self, _now: datetime) -> None:
        self._boundary = None
        if self.available:
            await self.async_apply(self.engine.catch_up(self.now()))
        self._schedule_boundary()

    async def _on_refresh(self, _now: datetime) -> None:
        await self._async_retry_writes()
        self.async_notify(changed=False)

    async def _on_final_write(self, _event: Event) -> None:
        await self.async_flush()

    @callback
    def _on_core_config(self, _event: Event) -> None:
        self.engine.set_time_zone(dt_util.get_default_time_zone())
        self._schedule_boundary()
        self.async_notify()

    @callback
    def _on_config_applied(self, _entry: ConfigEntry) -> None:
        """Settings were saved: the calendar's first day sets where chore weeks start."""
        if self.available and self._sync_first_day():
            self._schedule_log_save()
            self.async_notify()

    def _sync_first_day(self) -> bool:
        if self.entry is None:
            return False
        first_day = (self.entry.data.get(CONF_DISPLAY) or {}).get(CONF_FIRST_DAY) or "monday"
        return self.engine.set_first_day(first_day if first_day in ("monday", "sunday") else "monday", self.now())

    # The household ----------------------------------------------------------------

    @callback
    def _on_household(self) -> None:
        self.hass.async_create_task(self.async_sync_members(), eager_start=True)

    async def async_sync_members(self) -> None:
        """People changed: rename devices, add entities for newcomers, unassign people who left."""
        members = {m["id"]: m for m in self.household.members}
        known = set(self.engine.member_ids())
        self.engine.set_members(self.household.members)
        for member_id in known - set(members):
            if self.available:
                await self.async_apply(self.engine.unassign_member(member_id))
        if self.entry is None or not self.enabled:
            self.async_notify()
            return
        dev_reg = dr.async_get(self.hass)
        for member_id, member in members.items():
            device = dev_reg.async_get_device_by_identifier((DOMAIN, member_device_id(member_id)), self.entry.entry_id)
            if device is not None and device.name != member["name"]:
                dev_reg.async_update_device(device.id, name=member["name"])
            if member_id not in self._devices:
                self._devices[member_id] = member["name"]
                if device is None:
                    for platform in self._platforms.values():
                        platform.add_entities(platform.member_entities(member_id))
        for member_id in set(self._devices) - set(members):
            del self._devices[member_id]
            device = dev_reg.async_get_device_by_identifier((DOMAIN, member_device_id(member_id)), self.entry.entry_id)
            if device is not None:
                dev_reg.async_remove_device(device.id)
        self.async_notify()

    @callback
    def async_add_platform(
        self,
        platform: str,
        add_entities: AddConfigEntryEntitiesCallback,
        member_entities: Callable[[str], list[Entity]],
        household_entities: Callable[[], list[Entity]] | None = None,
    ) -> None:
        """A platform is ready: add entities for everyone now, and for newcomers later."""
        self._platforms[platform] = _Platform(add_entities, member_entities, household_entities)
        if not self.enabled:
            return
        entities: list[Entity] = []
        for member in self.household.members:
            self._devices.setdefault(member["id"], member["name"])
            entities.extend(member_entities(member["id"]))
        if household_entities is not None:
            entities.extend(household_entities())
        add_entities(entities)

    # Turning chores on and off -----------------------------------------------------

    async def async_set_enabled(self, enabled: bool) -> None:
        """Turn chores on (setting the files up the first time) or off (data stays)."""
        if enabled and self.problem == STATE_NEWER:
            raise ChoresUnavailable(translation_domain=DOMAIN, translation_key="chores_unavailable")
        module = self.module
        if enabled == bool(module.get("enabled")):
            return
        first_time = not module.get("set_up_at")
        module["enabled"] = enabled
        if enabled and first_time:
            module["set_up_at"] = dt_util.now().isoformat()
        self.household.data["modules"]["chores"] = module
        if enabled:
            if self.available:
                self.engine.start(self.now())
                self._sync_first_day()
                for name in STORE_KEYS:
                    await self.stores.async_save(name, getattr(self.engine, name))
                self._check_writes()
            # Entities first: the household save below makes everyone sync, and
            # by then each member's entities already exist (no duplicates).
            await self._async_load_platforms()
            await self.household.async_save()
            await self.async_sync_members()
        else:
            await self.household.async_save()
            await self._async_unload_platforms()
            self._remove_entities()
            self._devices.clear()
        self._schedule_boundary()
        self.async_notify()

    async def async_start_over(self) -> None:
        """Chores need a look and a parent chose Start over: empty files, nothing replayed."""
        if self.state != STATE_NEEDS_A_LOOK:
            raise ChoresUnavailable(translation_domain=DOMAIN, translation_key="chores_unavailable")
        self.engine.plan, self.engine.log, self.engine.rewards = default_plan(), default_log(), default_rewards()
        self.problem = None
        ir.async_delete_issue(self.hass, DOMAIN, ISSUE_MISSING)
        self.engine.start(self.now())
        self._sync_first_day()
        for name in STORE_KEYS:
            await self.stores.async_save(name, getattr(self.engine, name))
        self._check_writes()
        self._schedule_boundary()
        self.async_notify()

    async def _async_load_platforms(self) -> None:
        entry = self.entry
        if entry is None or entry.state is not ConfigEntryState.LOADED:
            return
        if not self.platforms_loaded:
            self.platforms_loaded = True
            await self.hass.config_entries.async_forward_entry_setups(entry, CHORES_PLATFORMS)
        sensors = self._platforms.get(Platform.SENSOR)
        if sensors is not None:
            self.async_add_platform(Platform.SENSOR, sensors.add_entities, sensors.member_entities, sensors.household_entities)

    async def _async_unload_platforms(self) -> None:
        if self.entry is not None and self.platforms_loaded:
            await self.hass.config_entries.async_unload_platforms(self.entry, CHORES_PLATFORMS)
            self.platforms_loaded = False
        for platform in CHORES_PLATFORMS:
            self._platforms.pop(platform, None)

    def _remove_entities(self) -> None:
        """Chores turned off: their entities and the members' devices go (the Household device stays)."""
        if self.entry is None:
            return
        prefix = f"{self.entry.entry_id}_chores_"
        ent_reg = er.async_get(self.hass)
        for entity in er.async_entries_for_config_entry(ent_reg, self.entry.entry_id):
            if entity.unique_id.startswith(prefix):
                ent_reg.async_remove(entity.entity_id)
        dev_reg = dr.async_get(self.hass)
        for device in dr.async_entries_for_config_entry(dev_reg, self.entry.entry_id):
            if any(domain == DOMAIN and ident.startswith("member_") for domain, ident in device.identifiers):
                dev_reg.async_remove_device(device.id)


DATA_CHORES: HassKey[ChoresRuntime] = HassKey(f"{DOMAIN}_chores")


async def async_get_chores(hass: HomeAssistant, household: Household) -> ChoresRuntime:
    """The chores runtime, loaded once per Home Assistant run (spec 15.3 for damaged files)."""
    if (runtime := hass.data.get(DATA_CHORES)) is not None:
        return runtime
    stores = ChoresStores(hass)
    problem: str | None = None
    try:
        raw = await stores.async_load()
    except UnsupportedStorageVersionError:
        _LOGGER.error("The chores files were saved by a newer version of PlanaVista; update PlanaVista to use chores")
        ir.async_create_issue(
            hass, DOMAIN, ISSUE_NEWER, is_fixable=False,
            severity=ir.IssueSeverity.ERROR, translation_key=ISSUE_NEWER,
        )
        raw = dict.fromkeys(STORE_KEYS)
        problem = STATE_NEWER
    set_up = bool((household.data["modules"].get("chores") or {}).get("set_up_at"))
    if problem is None and set_up and any(value is None for value in raw.values()):
        _LOGGER.warning("Chores were set up but a chores file is missing or damaged; chores wait for a parent")
        ir.async_create_issue(
            hass, DOMAIN, ISSUE_MISSING, is_fixable=False,
            severity=ir.IssueSeverity.WARNING, translation_key=ISSUE_MISSING,
        )
        problem = STATE_NEEDS_A_LOOK
    defaults = {"plan": default_plan, "log": default_log, "rewards": default_rewards}
    documents = {
        name: NORMALIZERS[name](raw[name]) if raw[name] is not None else defaults[name]()
        for name in STORE_KEYS
    }
    runtime = ChoresRuntime(hass, household, stores, documents, problem)
    hass.data[DATA_CHORES] = runtime
    return runtime
