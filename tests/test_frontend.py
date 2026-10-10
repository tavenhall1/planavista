"""Tests for how the card bundle is served."""
from __future__ import annotations

import hashlib
import json
from pathlib import Path

from pytest_homeassistant_custom_component.common import MockConfigEntry
from pytest_homeassistant_custom_component.typing import ClientSessionGenerator

from homeassistant.components.frontend import DATA_EXTRA_MODULE_URL
from homeassistant.core import HomeAssistant

INTEGRATION_DIR = Path(__file__).parent.parent / "custom_components" / "planavista"
BUNDLE = INTEGRATION_DIR / "frontend" / "dist" / "planavista-cards.js"


def _expected_url() -> str:
    version = json.loads((INTEGRATION_DIR / "manifest.json").read_text())["version"]
    digest = hashlib.sha256(BUNDLE.read_bytes()).hexdigest()[:8]
    return f"/planavista_panel/dist/planavista-cards.js?v={version}-{digest}"


async def test_bundle_url_carries_version_and_hash(
    hass: HomeAssistant, mock_config_entry: MockConfigEntry
) -> None:
    """The card script URL changes whenever the version or the bundle changes."""
    assert await hass.config_entries.async_setup(mock_config_entry.entry_id)
    await hass.async_block_till_done()

    expected = await hass.async_add_executor_job(_expected_url)
    urls = hass.data[DATA_EXTRA_MODULE_URL].urls
    assert expected in urls
    assert "/planavista_panel/dist/planavista-cards.js" not in urls


async def test_only_the_bundle_folder_is_served(
    hass: HomeAssistant,
    mock_config_entry: MockConfigEntry,
    hass_client_no_auth: ClientSessionGenerator,
) -> None:
    """Sources and build files next to dist/ are not published."""
    assert await hass.config_entries.async_setup(mock_config_entry.entry_id)
    await hass.async_block_till_done()
    client = await hass_client_no_auth()

    response = await client.get("/planavista_panel/dist/planavista-cards.js")
    assert response.status == 200

    for path in (
        "/planavista_panel/package.json",
        "/planavista_panel/rollup.config.mjs",
        "/planavista_panel/src/main.ts",
    ):
        response = await client.get(path)
        assert response.status == 404, path


async def test_the_heading_face_is_served_with_its_license(
    hass: HomeAssistant,
    mock_config_entry: MockConfigEntry,
    hass_client_no_auth: ClientSessionGenerator,
) -> None:
    """The rounded face ships next to the bundle, its license beside it (spec 11.2)."""
    assert await hass.config_entries.async_setup(mock_config_entry.entry_id)
    await hass.async_block_till_done()
    client = await hass_client_no_auth()

    font = await client.get("/planavista_panel/dist/fonts/nunito-latin-wght.woff2")
    assert font.status == 200
    assert (await font.read())[:4] == b"wOF2"
    license_text = await (await client.get("/planavista_panel/dist/fonts/OFL.txt")).text()
    assert "SIL OPEN FONT LICENSE Version 1.1" in license_text
