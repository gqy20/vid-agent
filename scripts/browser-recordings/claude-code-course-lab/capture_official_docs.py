from __future__ import annotations

import asyncio
import json
import re
import shutil
import tempfile
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path

from playwright.async_api import Locator, Page, async_playwright


SCRIPT_DIR = Path(__file__).resolve().parent
REPO_ROOT = SCRIPT_DIR.parents[2]
EPISODE_ID = "ep01-install-first-start"
OUTPUT_ROOT = REPO_ROOT / "remotion/public/claude-code-course/browser" / EPISODE_ID
TMP_ROOT = REPO_ROOT / "remotion/renders/claude-code-course/tmp/browser-captures"


@dataclass(frozen=True)
class EvidencePage:
    evidence_id: str
    title: str
    url: str
    target_patterns: tuple[str, ...]
    source_label: str


EVIDENCE_PAGES = (
    EvidencePage(
        evidence_id="anthropic-1m-model-config",
        title="Claude Code · 1M context window",
        url="https://code.claude.com/docs/en/model-config",
        target_patterns=(r"append \[1m\]", r"1M context window", r"Claude Code strips the suffix"),
        source_label="Claude Code Docs",
    ),
    EvidencePage(
        evidence_id="glm-5-2-claude-code",
        title="智谱 GLM 5.2 · Claude Code",
        url="https://docs.bigmodel.cn/cn/guide/develop/claude",
        target_patterns=(r"glm-5\.2\[1m\]", r"1M 上下文", r"ANTHROPIC_DEFAULT_SONNET_MODEL"),
        source_label="智谱 AI 开放文档",
    ),
    EvidencePage(
        evidence_id="minimax-m3-context",
        title="MiniMax M3 · 1M context",
        url="https://www.minimaxi.com/models/text/m3",
        target_patterns=(r"1M tokens", r"百万上下文", r"MiniMax M3"),
        source_label="MiniMax 官方模型页",
    ),
    EvidencePage(
        evidence_id="kimi-k3-claude-code",
        title="Kimi K3 · Claude Code",
        url="https://www.kimi.com/code/docs/en/third-party-tools/other-coding-agents",
        target_patterns=(r"k3\[1m\]", r"K3 \+ 1M context", r"only needed for Claude Code env vars"),
        source_label="Kimi Code Docs",
    ),
    EvidencePage(
        evidence_id="qwen3-7-max-claude-code",
        title="Qwen 3.7 Max · Claude Code",
        url="https://help.aliyun.com/zh/model-studio/claude-code",
        target_patterns=(r"qwen3\.7-max", r"配置上下文窗口大小", r"\[1m\]"),
        source_label="阿里云百炼官方文档",
    ),
)


async def dismiss_common_overlays(page: Page) -> None:
    labels = ("同意", "接受", "Accept", "Accept all", "Got it", "我知道了")
    for label in labels:
        button = page.get_by_role("button", name=re.compile(f"^{re.escape(label)}$", re.I)).first
        try:
            if await button.is_visible(timeout=250):
                await button.click(timeout=800)
        except Exception:
            continue


async def find_target(page: Page, patterns: tuple[str, ...]) -> tuple[Locator, str]:
    for pattern in patterns:
        locator = page.get_by_text(re.compile(pattern, re.I)).first
        try:
            await locator.wait_for(state="visible", timeout=4_000)
            return locator, pattern
        except Exception:
            continue
    raise RuntimeError(f"None of the evidence targets were visible: {patterns}")


async def capture(page: Page, evidence: EvidencePage) -> dict[str, object]:
    await page.goto(evidence.url, wait_until="domcontentloaded", timeout=90_000)
    try:
        await page.wait_for_load_state("networkidle", timeout=12_000)
    except Exception:
        pass
    await dismiss_common_overlays(page)

    target, matched_pattern = await find_target(page, evidence.target_patterns)
    await target.scroll_into_view_if_needed()
    await page.evaluate("window.scrollBy(0, -220)")
    await page.wait_for_timeout(900)
    box = await target.bounding_box()
    if box is None:
        raise RuntimeError(f"Cannot measure evidence target: {evidence.evidence_id}")

    screenshot_path = OUTPUT_ROOT / f"{evidence.evidence_id}.png"
    await page.screenshot(path=screenshot_path, full_page=False, animations="disabled")
    viewport = page.viewport_size
    if viewport is None:
        raise RuntimeError("Fixed viewport is required")

    return {
        "id": evidence.evidence_id,
        "title": evidence.title,
        "sourceLabel": evidence.source_label,
        "url": evidence.url,
        "matchedPattern": matched_pattern,
        "capturedAt": datetime.now(timezone.utc).isoformat(),
        "viewport": viewport,
        "containsSensitiveState": False,
        "screenshot": f"claude-code-course/browser/{EPISODE_ID}/{screenshot_path.name}",
        "focusRegion": {
            "x": round(max(0.0, box["x"]) / viewport["width"], 6),
            "y": round(max(0.0, box["y"]) / viewport["height"], 6),
            "width": round(min(box["width"], viewport["width"]) / viewport["width"], 6),
            "height": round(min(box["height"], viewport["height"]) / viewport["height"], 6),
        },
    }


async def main() -> None:
    OUTPUT_ROOT.mkdir(parents=True, exist_ok=True)
    TMP_ROOT.mkdir(parents=True, exist_ok=True)
    temp_dir = Path(tempfile.mkdtemp(prefix=f"{EPISODE_ID}-", dir=TMP_ROOT))
    results: list[dict[str, object]] = []
    try:
        async with async_playwright() as playwright:
            browser = await playwright.chromium.launch(channel="chrome", headless=True)
            context = await browser.new_context(
                viewport={"width": 1600, "height": 900},
                locale="zh-CN",
                timezone_id="Asia/Shanghai",
                color_scheme="light",
                reduced_motion="reduce",
                accept_downloads=False,
            )
            page = await context.new_page()
            for evidence in EVIDENCE_PAGES:
                results.append(await capture(page, evidence))
            await context.close()
            await browser.close()

        manifest = {
            "schemaVersion": 1,
            "episodeId": EPISODE_ID,
            "verifiedDate": "2026-07-20",
            "capturePolicy": "Public official documentation only; no account, console, credential, pricing, or usage-quota pages. Context eligibility may be retained as a capability boundary.",
            "items": results,
        }
        manifest_path = OUTPUT_ROOT / "manifest.json"
        manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print(manifest_path)
        for item in results:
            print(OUTPUT_ROOT / Path(str(item["screenshot"])).name)
    finally:
        shutil.rmtree(temp_dir, ignore_errors=True)


if __name__ == "__main__":
    asyncio.run(main())
