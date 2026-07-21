from __future__ import annotations

from collections.abc import Sequence
from dataclasses import dataclass
from typing import Literal, Protocol

from playwright.async_api import Locator, Page


@dataclass(frozen=True)
class ScenarioConfig:
    recording_id: str
    viewport_width: int = 1600
    viewport_height: int = 900
    locale: str = "zh-CN"
    timezone_id: str = "Asia/Shanghai"
    color_scheme: str = "light"


FocusTone = Literal["action", "approved", "merged", "warning", "failed"]


@dataclass(frozen=True)
class BrowserFocusRegion:
    id: str
    x: float
    y: float
    width: float
    height: float
    label: str | None = None
    tone: FocusTone = "action"

    def to_metadata(self) -> dict[str, object]:
        result: dict[str, object] = {
            "id": self.id,
            "x": self.x,
            "y": self.y,
            "width": self.width,
            "height": self.height,
            "tone": self.tone,
        }
        if self.label is not None:
            result["label"] = self.label
        return result


class Scenario(Protocol):
    config: ScenarioConfig

    async def run(self, page: Page) -> None: ...


def normalize_focus_region(
    *,
    region_id: str,
    boxes: Sequence[dict[str, float]],
    viewport_width: int,
    viewport_height: int,
    label: str | None = None,
    tone: FocusTone = "action",
    padding_px: float = 0,
) -> BrowserFocusRegion:
    if not boxes:
        raise ValueError(f"Focus region '{region_id}' has no target boxes")
    if viewport_width <= 0 or viewport_height <= 0:
        raise ValueError("Viewport dimensions must be positive")

    left = max(0.0, min(box["x"] for box in boxes) - padding_px)
    top = max(0.0, min(box["y"] for box in boxes) - padding_px)
    right = min(
        float(viewport_width),
        max(box["x"] + box["width"] for box in boxes) + padding_px,
    )
    bottom = min(
        float(viewport_height),
        max(box["y"] + box["height"] for box in boxes) + padding_px,
    )
    if right <= left or bottom <= top:
        raise ValueError(f"Focus region '{region_id}' resolved to an empty box")

    return BrowserFocusRegion(
        id=region_id,
        x=round(left / viewport_width, 6),
        y=round(top / viewport_height, 6),
        width=round((right - left) / viewport_width, 6),
        height=round((bottom - top) / viewport_height, 6),
        label=label,
        tone=tone,
    )


async def capture_focus_region(
    page: Page,
    locators: Sequence[Locator],
    *,
    region_id: str,
    label: str | None = None,
    tone: FocusTone = "action",
    padding_px: float = 0,
) -> BrowserFocusRegion:
    boxes: list[dict[str, float]] = []
    for locator in locators:
        await locator.wait_for(state="visible")
        await locator.scroll_into_view_if_needed()
        box = await locator.bounding_box()
        if box is None:
            raise RuntimeError(f"Cannot resolve browser focus target for '{region_id}'")
        boxes.append(box)

    viewport = page.viewport_size
    if viewport is None:
        viewport = await page.evaluate(
            "({width: window.innerWidth, height: window.innerHeight})"
        )
    return normalize_focus_region(
        region_id=region_id,
        boxes=boxes,
        viewport_width=viewport["width"],
        viewport_height=viewport["height"],
        label=label,
        tone=tone,
        padding_px=padding_px,
    )


async def install_recording_cursor(page: Page) -> None:
    cursor_script = """
        (() => {
          const install = () => {
            if (document.querySelector('[data-github-course-cursor]')) return;
            const cursor = document.createElement('div');
            cursor.dataset.githubCourseCursor = 'true';
            const cursorSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            cursorSvg.setAttribute('viewBox', '0 0 20 26');
            cursorSvg.setAttribute('aria-hidden', 'true');
            const cursorPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            cursorPath.setAttribute('d', 'M2 1.5V21L7.4 15.9L12 24L15.6 21.9L11.2 14H18.7Z');
            cursorPath.setAttribute('fill', '#ffffff');
            cursorPath.setAttribute('stroke', '#1f2328');
            cursorPath.setAttribute('stroke-width', '1.5');
            cursorPath.setAttribute('stroke-linejoin', 'round');
            cursorSvg.appendChild(cursorPath);
            Object.assign(cursor.style, {
              position: 'fixed',
              left: '0px',
              top: '0px',
              width: '20px',
              height: '26px',
              transform: 'translate(-2px, -2px)',
              transformOrigin: '2px 2px',
              filter: 'drop-shadow(0 1px 2px rgba(31,35,40,0.28))',
              pointerEvents: 'none',
              zIndex: '2147483647',
              transition: 'transform 90ms ease'
            });
            Object.assign(cursorSvg.style, {
              width: '100%',
              height: '100%',
              display: 'block'
            });
            cursor.appendChild(cursorSvg);
            document.documentElement.appendChild(cursor);
            window.addEventListener('mousemove', (event) => {
              cursor.style.left = `${event.clientX}px`;
              cursor.style.top = `${event.clientY}px`;
            }, {passive: true});
            window.addEventListener('mousedown', () => {
              cursor.style.transform = 'translate(-2px, -2px) scale(0.9)';
              cursorPath.setAttribute('fill', '#0969da');
              cursorPath.setAttribute('stroke', '#ffffff');
            });
            window.addEventListener('mouseup', () => {
              cursor.style.transform = 'translate(-2px, -2px) scale(1)';
              cursorPath.setAttribute('fill', '#ffffff');
              cursorPath.setAttribute('stroke', '#1f2328');
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
    await click_locator_with_cursor(page, page.locator(selector), settle_ms=settle_ms)


async def move_cursor_to_locator(page: Page, locator: Locator, *, settle_ms: int = 700) -> None:
    await locator.wait_for(state="visible")
    await locator.scroll_into_view_if_needed()
    box = await locator.bounding_box()
    if box is None:
        raise RuntimeError("Cannot resolve browser target box")
    await page.mouse.move(
        box["x"] + box["width"] / 2,
        box["y"] + box["height"] / 2,
        steps=18,
    )
    await page.wait_for_timeout(settle_ms)


async def click_locator_with_cursor(page: Page, locator: Locator, *, settle_ms: int = 700) -> None:
    await move_cursor_to_locator(page, locator, settle_ms=250)
    box = await locator.bounding_box()
    if box is None:
        raise RuntimeError("Cannot resolve browser click target box")
    await page.mouse.click(
        box["x"] + box["width"] / 2,
        box["y"] + box["height"] / 2,
        delay=160,
    )
    await page.wait_for_timeout(settle_ms)
