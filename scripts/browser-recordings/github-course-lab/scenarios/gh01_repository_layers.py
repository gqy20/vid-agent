from __future__ import annotations

import re

from playwright.async_api import Page

from .base import (
    ScenarioConfig,
    click_locator_with_cursor,
    install_recording_cursor,
    move_cursor_to_locator,
)


class Gh01RepositoryLayersScenario:
    """Read-only evidence of the collaboration layer around a Git repository."""

    config = ScenarioConfig(recording_id="gh01-repository-layers")

    async def prepare(self, page: Page) -> None:
        await install_recording_cursor(page)
        await page.goto("https://github.com/github/docs", wait_until="domcontentloaded", timeout=90_000)
        await page.get_by_role("main").wait_for(state="visible")
        await page.evaluate("window.scrollTo(0, 0)")

        repository_navigation = page.get_by_role("navigation", name="Repository")
        code = repository_navigation.get_by_role("link", name=re.compile(r"^Code$"))
        pulls = repository_navigation.get_by_role("link", name=re.compile(r"^Pull requests"))
        actions = repository_navigation.get_by_role("link", name=re.compile(r"^Actions$"))

        await code.wait_for(state="visible")
        await pulls.wait_for(state="visible")
        await actions.wait_for(state="visible")
        await page.wait_for_timeout(1100)

    async def run(self, page: Page) -> None:
        repository_navigation = page.get_by_role("navigation", name="Repository")
        code = repository_navigation.get_by_role("link", name=re.compile(r"^Code$"))
        pulls = repository_navigation.get_by_role("link", name=re.compile(r"^Pull requests"))
        actions = repository_navigation.get_by_role("link", name=re.compile(r"^Actions$"))

        await move_cursor_to_locator(page, code, settle_ms=650)
        await move_cursor_to_locator(page, pulls, settle_ms=750)
        await move_cursor_to_locator(page, actions, settle_ms=750)
        await click_locator_with_cursor(page, pulls, settle_ms=1200)
        await page.wait_for_url(re.compile(r"github\.com/github/docs/pulls"))

        repository_navigation = page.get_by_role("navigation", name="Repository")
        code = repository_navigation.get_by_role("link", name=re.compile(r"^Code$"))
        await click_locator_with_cursor(page, code, settle_ms=1200)
        await page.wait_for_url(re.compile(r"github\.com/github/docs/?$"))
        await page.evaluate("window.scrollTo(0, 0)")
        await page.wait_for_timeout(900)
