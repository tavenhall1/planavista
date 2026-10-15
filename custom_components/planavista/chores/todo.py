"""todo.<member>_chores: each item is one occurrence, its key the uid (spec 10.3, 10.6).

Checking and unchecking go through the engine; adding makes a Once chore;
removing works for Once chores only; a due date moves the occurrence's due
date. Assist's to-do intents call the list directly rather than through a
service, so a change with no service context is recorded as voice.
"""
from __future__ import annotations

from datetime import UTC, date, datetime
import time
from typing import Any

from homeassistant.components.todo import TodoItem, TodoItemStatus, TodoListEntity, TodoListEntityFeature
from homeassistant.const import Platform
from homeassistant.core import Context, HomeAssistant, callback
from homeassistant.exceptions import ServiceValidationError
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback

from ..const import DOMAIN
from ..coordinator import PlanaVistaConfigEntry
from ..household.permissions import ADMIN, AUTOMATION, Account
from .access import async_account, member_by, not_allowed, parent_by, service_error, source_of
from .engine import CREDITED, Item
from .entity import ChoresEntity
from .model import ChoreError
from .runtime import DATA_CHORES, ChoresRuntime

# A service sets the entity's context just before calling it; anything older isn't that call's.
CONTEXT_WINDOW_SECONDS = 1.0
ESTIMATE_MINUTES = 15


class ChoresTodoList(ChoresEntity, TodoListEntity):
    """A member's chores as a Home Assistant to-do list."""

    _attr_supported_features = (
        TodoListEntityFeature.CREATE_TODO_ITEM
        | TodoListEntityFeature.UPDATE_TODO_ITEM
        | TodoListEntityFeature.DELETE_TODO_ITEM
        | TodoListEntityFeature.SET_DUE_DATE_ON_ITEM
        | TodoListEntityFeature.SET_DUE_DATETIME_ON_ITEM
    )

    def __init__(self, runtime: ChoresRuntime, entry_id: str, member_id: str) -> None:
        """The member's list."""
        super().__init__(runtime, entry_id, member_id, "chores")
        self._call_context: Context | None = None
        self._call_context_at = 0.0

    @callback
    def async_set_context(self, context: Context) -> None:
        """Remember the context of the service call that is about to run."""
        super().async_set_context(context)
        self._call_context = context
        self._call_context_at = time.monotonic()

    def _handle_update(self) -> None:
        self._attr_todo_items = self._items() if self.available else None
        self.async_write_ha_state()

    async def async_added_to_hass(self) -> None:
        """Fill the list, then follow every change."""
        self._attr_todo_items = self._items() if self.available else None
        await super().async_added_to_hass()

    def _items(self) -> list[TodoItem]:
        engine = self.runtime.engine
        today = engine.today(self.runtime.now())
        return [self._todo(item, today) for item in self.runtime.todo_items(self.member_id or "")]

    def _todo(self, item: Item, today: date) -> TodoItem:
        engine = self.runtime.engine
        clock = engine.clock
        due: date | datetime | None = None
        if item.occ.due is not None:
            day = clock.due_day(item.occ.due)
            if item.occ.due.astimezone(UTC) == clock.day_end(day).astimezone(UTC):
                due = day
            else:
                due = item.occ.due.astimezone(clock.tz)
        activity = engine.activity(item.occ.chore)
        return TodoItem(
            summary=activity["name"] if activity else item.occ.chore,
            uid=item.occ.key,
            status=TodoItemStatus.COMPLETED if item.status in CREDITED else TodoItemStatus.NEEDS_ACTION,
            due=due,
            description=engine.description(item, today),
        )

    async def _caller(self) -> tuple[Account | None, str]:
        """(account, source); no account means Assist (voice), which acts like a household device."""
        context, self._call_context = self._call_context, None
        if context is None or time.monotonic() - self._call_context_at > CONTEXT_WINDOW_SECONDS:
            return None, "voice"
        account = await async_account(self.hass, self.runtime.household, context)
        return account, source_of(account)

    def _member_by(self, account: Account | None) -> str:
        if account is None:
            return AUTOMATION
        return member_by(self.runtime.household, account, self.member_id or "")

    @staticmethod
    def _parent_by(account: Account | None) -> str:
        if account is None:
            raise not_allowed()
        return parent_by(account)

    async def _run(self, action: Any) -> Any:
        try:
            return await self.runtime.async_run(action)
        except ChoreError as err:
            raise service_error(err) from err

    async def async_update_todo_item(self, item: TodoItem) -> None:
        """Check, uncheck, or move the due date of one occurrence."""
        account, source = await self._caller()
        current = next((i for i in self._attr_todo_items or [] if i.uid == item.uid), None)
        if current is None or item.uid is None:
            raise ServiceValidationError(translation_domain=DOMAIN, translation_key="unknown_occurrence")
        if item.summary is not None and item.summary != current.summary:
            raise ServiceValidationError(translation_domain=DOMAIN, translation_key="rename_not_supported")
        key = item.uid
        # Assist's intents pass only the uid, the name, and the status, so a
        # missing due date from voice isn't a request to clear it.
        if source != "voice" and item.due != current.due:
            by = self._parent_by(account)
            new_due = item.due.date() if isinstance(item.due, datetime) else item.due
            await self._run(lambda engine, now: engine.override(now, key=key, by=by, due=new_due))
        if item.status == current.status:
            return
        by = self._member_by(account)
        user = account.user_id if account else None
        if item.status == TodoItemStatus.COMPLETED:
            await self._run(lambda engine, now: engine.complete(now, key=key, by=by, source=source, user=user))
        else:
            await self._run(lambda engine, now: engine.undo(now, key=key, by=by, source=source, user=user))

    async def async_create_todo_item(self, item: TodoItem) -> None:
        """Adding an item makes a Once chore for this member (spec 10.3).

        It takes the item's due date and a 15-minute estimate. Added by someone
        who isn't a parent, it needs approval, so its stars wait for a parent.
        """
        account, source = await self._caller()
        by = self._member_by(account)
        member = self.runtime.household.member(by) if by not in (ADMIN, AUTOMATION) else None
        trusted = (by == ADMIN or (by == AUTOMATION and source == AUTOMATION) or bool(member and member.get("parent")))
        once: dict[str, Any] = {"sessions": 1, "estimate_minutes": ESTIMATE_MINUTES}
        if isinstance(item.due, datetime):
            local = item.due.astimezone(self.runtime.engine.clock.tz)
            once.update(by=local.date().isoformat(), by_time=local.strftime("%H:%M"))
        elif isinstance(item.due, date):
            once["by"] = item.due.isoformat()
        changes = {
            "name": item.summary or "",
            "schedule": "once",
            "assignees": [self.member_id],
            "needs_ok": not trusted,
            "once": once,
        }
        if not trusted:
            changes["needs_ok_always"] = True
        await self._run(lambda engine, now: engine.save_activity(now, changes, by=by, source=source))

    async def async_delete_todo_items(self, uids: list[str]) -> None:
        """Removing an item removes a Once chore from this member (a parent's change)."""
        account, source = await self._caller()
        by = self._parent_by(account)
        engine = self.runtime.require()
        chores: list[str] = []
        for uid in uids:
            activity = engine.activity(uid.split("|", 1)[0])
            if activity is None:
                raise ServiceValidationError(translation_domain=DOMAIN, translation_key="unknown_occurrence")
            if activity["schedule"] != "once":
                raise ServiceValidationError(translation_domain=DOMAIN, translation_key="delete_not_once")
            if activity["id"] not in chores:
                chores.append(activity["id"])
        for chore_id in chores:
            activity = engine.activity(chore_id)
            others = [m for m in activity["assignees"] if m != self.member_id]
            if others:
                await self._run(
                    lambda e, now, c=chore_id, o=others: e.save_activity(
                        now, {"assignees": o}, activity_id=c, by=by, source=source
                    )
                )
            else:
                await self._run(lambda e, now, c=chore_id: e.delete_activity(c, now))


async def async_setup_entry(
    hass: HomeAssistant, entry: PlanaVistaConfigEntry, async_add_entities: AddConfigEntryEntitiesCallback
) -> None:
    """Add a to-do list for each member, now and when people join."""
    runtime = hass.data[DATA_CHORES]
    runtime.async_add_platform(
        Platform.TODO,
        async_add_entities,
        lambda member_id: [ChoresTodoList(runtime, entry.entry_id, member_id)],
    )
