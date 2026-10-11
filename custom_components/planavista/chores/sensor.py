"""Chores sensors (spec 10.2): chores left, this week, chore time, stars, and streak per member,
plus the household's chores left and requests waiting for a parent."""
from __future__ import annotations

from collections.abc import Callable
from dataclasses import dataclass
from typing import Any

from homeassistant.components.sensor import (
    SensorDeviceClass,
    SensorEntity,
    SensorEntityDescription,
    SensorStateClass,
)
from homeassistant.const import PERCENTAGE, Platform, UnitOfTime
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback
from homeassistant.helpers.typing import StateType

from ..coordinator import PlanaVistaConfigEntry
from .entity import ChoresEntity
from .runtime import DATA_CHORES, ChoresRuntime

MAX_ITEMS = 20
OPEN = ("open", "sent_back")


def left_today(view: dict[str, Any]) -> list[dict[str, Any]]:
    """Items still due today: in today's ring and not done or waiting for OK."""
    return [i for i in view["items"] if i["counted"] and i["status"] in OPEN]


@dataclass(frozen=True, kw_only=True)
class ChoresSensorDescription(SensorEntityDescription):
    """A member's chores sensor: its value and attributes from their part of the board."""

    value: Callable[[dict[str, Any]], StateType]
    attributes: Callable[[dict[str, Any]], dict[str, Any]] | None = None


MEMBER_SENSORS: tuple[ChoresSensorDescription, ...] = (
    ChoresSensorDescription(
        key="chores_left",
        icon="mdi:clipboard-list-outline",
        value=lambda view: len(left_today(view)),
        attributes=lambda view: {"items": [i["name"] for i in left_today(view)][:MAX_ITEMS]},
    ),
    ChoresSensorDescription(
        key="chores_this_week",
        icon="mdi:chart-donut",
        native_unit_of_measurement=PERCENTAGE,
        value=lambda view: view["week"]["percent"],
    ),
    ChoresSensorDescription(
        key="chore_time",
        icon="mdi:timer-outline",
        device_class=SensorDeviceClass.DURATION,
        native_unit_of_measurement=UnitOfTime.MINUTES,
        state_class=SensorStateClass.TOTAL,
        suggested_display_precision=0,
        value=lambda view: view["chore_minutes"],
    ),
    ChoresSensorDescription(key="stars", icon="mdi:star", value=lambda view: view["stars"]),
    ChoresSensorDescription(key="streak", icon="mdi:fire", value=lambda view: view["streak"]),
)


class MemberChoresSensor(ChoresEntity, SensorEntity):
    """One of a member's chores sensors."""

    entity_description: ChoresSensorDescription

    def __init__(self, runtime: ChoresRuntime, entry_id: str, member_id: str, description: ChoresSensorDescription) -> None:
        """A sensor of `member_id`'s chores."""
        super().__init__(runtime, entry_id, member_id, description.key)
        self.entity_description = description

    @property
    def native_value(self) -> StateType:
        """The value from today's board."""
        view = self.view
        return self.entity_description.value(view) if view else None

    @property
    def extra_state_attributes(self) -> dict[str, Any] | None:
        """Attributes from today's board (chores left lists up to 20 names)."""
        view = self.view
        if view is None or self.entity_description.attributes is None:
            return None
        return self.entity_description.attributes(view)


class HouseholdChoresLeftSensor(ChoresEntity, SensorEntity):
    """Items still due today, everyone (sensor.household_chores_left)."""

    _attr_icon = "mdi:clipboard-list-outline"

    def __init__(self, runtime: ChoresRuntime, entry_id: str) -> None:
        """The household's sensor."""
        super().__init__(runtime, entry_id, None, "chores_left")

    @property
    def native_value(self) -> StateType:
        """The sum over everyone."""
        if not self.available:
            return None
        return sum(len(left_today(view)) for view in self.runtime.board()["members"].values())


class ApprovalsWaitingSensor(ChoresEntity, SensorEntity):
    """Open requests: check-offs waiting for OK, more time, skips, and rewards."""

    _attr_icon = "mdi:account-clock-outline"

    def __init__(self, runtime: ChoresRuntime, entry_id: str) -> None:
        """The household's sensor."""
        super().__init__(runtime, entry_id, None, "approvals_waiting")

    @property
    def native_value(self) -> StateType:
        """How many requests wait for a parent."""
        return len(self.runtime.board()["requests"]) if self.available else None

    @property
    def extra_state_attributes(self) -> dict[str, Any] | None:
        """How many of each kind."""
        if not self.available:
            return None
        kinds = {"completion": 0, "more_time": 0, "skip": 0, "redemption": 0}
        for request in self.runtime.board()["requests"]:
            kinds[request["kind"]] = kinds.get(request["kind"], 0) + 1
        return kinds


async def async_setup_chores_sensors(
    hass: HomeAssistant, entry: PlanaVistaConfigEntry, async_add_entities: AddConfigEntryEntitiesCallback
) -> None:
    """Hand the runtime what it needs to add chores sensors now or when chores turn on."""
    runtime = hass.data[DATA_CHORES]
    runtime.async_add_platform(
        Platform.SENSOR,
        async_add_entities,
        lambda member_id: [MemberChoresSensor(runtime, entry.entry_id, member_id, d) for d in MEMBER_SENSORS],
        lambda: [HouseholdChoresLeftSensor(runtime, entry.entry_id), ApprovalsWaitingSensor(runtime, entry.entry_id)],
    )
