"""Tests that the metadata files describe what the integration really does."""
from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import voluptuous as vol
import yaml

from homeassistant.core import HomeAssistant
from homeassistant.setup import async_setup_component

from custom_components.planavista.const import DOMAIN
from custom_components.planavista.services import (
    CREATE_EVENT_SCHEMA,
    DELETE_EVENT_SCHEMA,
    SAVE_CONFIG_SCHEMA,
)

REPO = Path(__file__).parent.parent
INTEGRATION_DIR = REPO / "custom_components" / "planavista"


def _read_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def _schema_fields(schema: Any) -> set[str]:
    """Return the field names of a service schema (unwrapping vol.All)."""
    if isinstance(schema, vol.All):
        schema = schema.validators[0]
    return {str(key) for key in schema.schema}


async def test_services_yaml_documents_exactly_the_registered_services(
    hass: HomeAssistant,
) -> None:
    """Every registered service is documented with its real fields, and nothing else."""
    assert await async_setup_component(hass, DOMAIN, {})
    documented = await hass.async_add_executor_job(
        lambda: yaml.safe_load((INTEGRATION_DIR / "services.yaml").read_text("utf-8"))
    )

    assert set(documented) == set(hass.services.async_services_for_domain(DOMAIN))
    for service, schema in (
        ("save_config", SAVE_CONFIG_SCHEMA),
        ("delete_event", DELETE_EVENT_SCHEMA),
        ("create_event_with_attendees", CREATE_EVENT_SCHEMA),
    ):
        assert set(documented[service]["fields"]) == _schema_fields(schema), service


def test_english_translations_match_strings() -> None:
    """translations/en.json is what Home Assistant shows; it must equal strings.json."""
    assert _read_json(INTEGRATION_DIR / "translations" / "en.json") == _read_json(
        INTEGRATION_DIR / "strings.json"
    )


def test_manifest() -> None:
    """One entry only, no unused dependencies, and calendar sources load first."""
    manifest = _read_json(INTEGRATION_DIR / "manifest.json")

    assert manifest["single_config_entry"] is True
    assert manifest["dependencies"] == ["frontend", "http"]
    assert manifest["after_dependencies"] == ["calendar", "google"]
    # hassfest: domain and name first, then alphabetical.
    rest = [key for key in manifest if key not in ("domain", "name")]
    assert list(manifest) == ["domain", "name", *sorted(rest)]


def test_hacs_json() -> None:
    """Only keys HACS accepts, the oldest Home Assistant that has local brand
    icons, and releases only (HACS doesn't offer the default branch)."""
    assert _read_json(REPO / "hacs.json") == {
        "name": "PlanaVista",
        "render_readme": True,
        "homeassistant": "2026.3.0",
        "hide_default_branch": True,
    }
