from __future__ import annotations

from dataclasses import dataclass
from typing import Protocol

from playwright.async_api import Page


@dataclass(frozen=True)
class ScenarioConfig:
    recording_id: str
    viewport_width: int = 1600
    viewport_height: int = 900
    locale: str = "zh-CN"
    timezone_id: str = "Asia/Shanghai"
    color_scheme: str = "light"


class Scenario(Protocol):
    config: ScenarioConfig

    async def run(self, page: Page) -> None: ...


async def install_recording_cursor(page: Page) -> None:
    cursor_script = """
        (() => {
          const install = () => {
            if (document.querySelector('[data-github-course-cursor]')) return;
            const cursor = document.createElement('div');
            cursor.dataset.githubCourseCursor = 'true';
            Object.assign(cursor.style, {
              position: 'fixed',
              left: '0px',
              top: '0px',
              width: '20px',
              height: '20px',
              border: '2px solid #1f6feb',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.82)',
              boxShadow: '0 2px 10px rgba(31,35,40,0.2)',
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none',
              zIndex: '2147483647',
              transition: 'width 120ms ease, height 120ms ease, background 120ms ease'
            });
            document.documentElement.appendChild(cursor);
            window.addEventListener('mousemove', (event) => {
              cursor.style.left = `${event.clientX}px`;
              cursor.style.top = `${event.clientY}px`;
            }, {passive: true});
            window.addEventListener('mousedown', () => {
              cursor.style.width = '14px';
              cursor.style.height = '14px';
              cursor.style.background = 'rgba(31,111,235,0.2)';
            });
            window.addEventListener('mouseup', () => {
              cursor.style.width = '20px';
              cursor.style.height = '20px';
              cursor.style.background = 'rgba(255,255,255,0.82)';
            });
          };
          if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', install, {once: true});
          } else {
            install();
          }
        })();
        """
    await page.add_init_script(cursor_script)
    await page.evaluate(cursor_script)


async def click_with_cursor(page: Page, selector: str, *, settle_ms: int = 700) -> None:
    locator = page.locator(selector)
    await locator.wait_for(state="visible")
    box = await locator.bounding_box()
    if box is None:
        raise RuntimeError(f"Cannot resolve click target box: {selector}")
    await page.mouse.move(
        box["x"] + box["width"] / 2,
        box["y"] + box["height"] / 2,
        steps=18,
    )
    await page.wait_for_timeout(250)
    await page.mouse.click(
        box["x"] + box["width"] / 2,
        box["y"] + box["height"] / 2,
    )
    await page.wait_for_timeout(settle_ms)
