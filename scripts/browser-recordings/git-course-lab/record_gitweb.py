#!/usr/bin/env python3
from __future__ import annotations

import asyncio
import hashlib
import json
import os
import shutil
import subprocess
import tarfile
import tempfile
import time
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

from playwright.async_api import Page, async_playwright


SCRIPT_DIR = Path(__file__).resolve().parent
REPO_ROOT = SCRIPT_DIR.parents[2]
OUTPUT_ROOT = REPO_ROOT / "remotion/public/git-course-lab/browser"
TMP_ROOT = REPO_ROOT / "remotion/renders/git-course/tmp/browser-recordings"
RECORDING_ID = "ep62-page-evidence"
PORT = 19662
CGI_VERSION = "4.72"
CGI_ARCHIVE_SHA256 = "babc1ca72db188083a1c3812debe88c4473b943b1f7c662281cd57c580a8bdd9"
CGI_ARCHIVE_URL = f"https://cpan.metacpan.org/authors/id/L/LE/LEEJO/CGI-{CGI_VERSION}.tar.gz"


def run(command: list[str], *, cwd: Path, env: dict[str, str]) -> None:
    subprocess.run(command, cwd=cwd, env=env, check=True, stdout=subprocess.DEVNULL)


def duration(path: Path) -> float:
    result = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", str(path)],
        check=True,
        capture_output=True,
        text=True,
    )
    return float(result.stdout.strip())


def ensure_cgi_module() -> Path:
    dependency_root = TMP_ROOT / "browser-deps" / f"CGI-{CGI_VERSION}"
    module_root = dependency_root / "lib"
    if (module_root / "CGI.pm").is_file():
        return module_root
    dependency_root.parent.mkdir(parents=True, exist_ok=True)
    archive = dependency_root.parent / f"CGI-{CGI_VERSION}.tar.gz"
    urllib.request.urlretrieve(CGI_ARCHIVE_URL, archive)
    digest = hashlib.sha256(archive.read_bytes()).hexdigest()
    if digest != CGI_ARCHIVE_SHA256:
        archive.unlink(missing_ok=True)
        raise RuntimeError(f"CGI.pm archive checksum mismatch: {digest}")
    partial = dependency_root.with_name(f"{dependency_root.name}.partial")
    shutil.rmtree(partial, ignore_errors=True)
    partial.mkdir()
    with tarfile.open(archive, "r:gz") as source:
        source.extractall(partial, filter="data")
    extracted = partial / f"CGI-{CGI_VERSION}"
    extracted.replace(dependency_root)
    partial.rmdir()
    return module_root


async def install_cursor(page: Page) -> None:
    await page.add_init_script(
        """
        (() => {
          const install = () => {
            const cursor = document.createElement('div');
            cursor.innerHTML = '<svg viewBox="0 0 20 26"><path d="M2 1.5V21L7.4 15.9L12 24L15.6 21.9L11.2 14H18.7Z" fill="#fff" stroke="#1f2328" stroke-width="1.5" stroke-linejoin="round"/></svg>';
            Object.assign(cursor.style, {position:'fixed',left:0,top:0,width:'20px',height:'26px',zIndex:2147483647,pointerEvents:'none',filter:'drop-shadow(0 1px 2px rgba(31,35,40,.28))'});
            document.documentElement.appendChild(cursor);
            addEventListener('mousemove', (event) => { cursor.style.left = `${event.clientX}px`; cursor.style.top = `${event.clientY}px`; }, {passive:true});
          };
          document.readyState === 'loading' ? addEventListener('DOMContentLoaded', install, {once:true}) : install();
        })();
        """
    )


async def fit_gitweb(page: Page) -> None:
    await page.evaluate("document.documentElement.style.zoom = '1.65'")


async def click_link(page: Page, selector: str, *, wait_ms: int = 500) -> float:
    link = page.locator(selector).first
    await link.wait_for(state="visible", timeout=7_000)
    await link.scroll_into_view_if_needed()
    box = await link.bounding_box()
    if box is None:
        raise RuntimeError(f"Cannot locate GitWeb link: {selector}")
    await page.mouse.move(box["x"] + box["width"] / 2, box["y"] + box["height"] / 2, steps=18)
    await page.wait_for_timeout(180)
    async with page.expect_navigation(wait_until="domcontentloaded"):
        await page.mouse.click(box["x"] + box["width"] / 2, box["y"] + box["height"] / 2, delay=120)
    await fit_gitweb(page)
    navigated_at = time.monotonic()
    await page.wait_for_timeout(wait_ms)
    return navigated_at


async def capture(work: Path, env: dict[str, str]) -> tuple[Path, list[dict[str, object]], float]:
    raw_dir = work / "raw"
    raw_dir.mkdir()
    navigation: list[dict[str, object]] = []
    async with async_playwright() as playwright:
        browser = await playwright.chromium.launch(channel=os.environ.get("GIT_COURSE_BROWSER_CHANNEL", "chrome"), headless=True)
        context = await browser.new_context(
            viewport={"width": 1600, "height": 900},
            record_video_dir=str(raw_dir),
            record_video_size={"width": 1600, "height": 900},
            locale="zh-CN",
            timezone_id="Asia/Shanghai",
            reduced_motion="reduce",
        )
        page = await context.new_page()
        started = time.monotonic()
        await install_cursor(page)
        video = page.video
        if video is None:
            raise RuntimeError("Playwright did not create a browser recording")
        await page.goto(f"http://127.0.0.1:{PORT}/", wait_until="domcontentloaded")
        await fit_gitweb(page)
        await page.wait_for_timeout(350)
        trim_start = max(0.0, time.monotonic() - started - 0.35)
        navigation.append({"at": round(time.monotonic() - started - trim_start, 3), "view": "projects"})
        navigated_at = await click_link(page, 'a[href*="p=project.git"][href*="a=summary"]')
        navigation.append({"at": round(navigated_at - started - trim_start, 3), "view": "summary"})
        navigated_at = await click_link(page, 'a[href*="a=commit;"][href*="h="]')
        navigation.append({"at": round(navigated_at - started - trim_start, 3), "view": "commit"})
        commit_url = page.url
        navigated_at = await click_link(page, 'a[href*="a=tree;"][href*="hb="]')
        navigation.append({"at": round(navigated_at - started - trim_start, 3), "view": "tree"})
        navigated_at = await click_link(page, 'a[href*="a=blob;"][href*="f=README.md"]')
        navigation.append({"at": round(navigated_at - started - trim_start, 3), "view": "blob"})
        await page.wait_for_timeout(1200)
        await page.goto(commit_url, wait_until="domcontentloaded")
        await fit_gitweb(page)
        await page.wait_for_timeout(1200)
        navigated_at = await click_link(page, 'a[href*="a=commitdiff;"][href*="h="]')
        navigation.append({"at": round(navigated_at - started - trim_start, 3), "view": "diff"})
        await page.wait_for_timeout(1500)
        await page.close()
        await context.close()
        await browser.close()
        return Path(await video.path()), navigation, trim_start


async def main() -> None:
    OUTPUT_ROOT.mkdir(parents=True, exist_ok=True)
    TMP_ROOT.mkdir(parents=True, exist_ok=True)
    cgi_module_root = ensure_cgi_module()
    work = Path(tempfile.mkdtemp(prefix=f"{RECORDING_ID}-", dir=TMP_ROOT))
    home = work / "home"
    fixture = work / "fixture"
    home.mkdir()
    fixture.mkdir()
    (home / ".gitconfig").write_text("[user]\n\tname = Git Course\n\temail = course@example.local\n[init]\n\tdefaultBranch = main\n", encoding="utf-8")
    env = {
        **os.environ,
        "HOME": str(home),
        "PERL5LIB": str(cgi_module_root),
        "TERMINAL_RECORDING_ID": RECORDING_ID,
        "TERMINAL_RECORDING_WORKDIR": str(fixture),
    }
    fixture_script = REPO_ROOT / "scripts/terminal-recordings/git-course-lab/fixtures/_ep57_64_workflows.sh"
    run(["bash", str(fixture_script)], cwd=REPO_ROOT, env=env)
    run(["git", "--git-dir", str(fixture / "project.git"), "instaweb", "--start", "--local", "--httpd=python", f"--port={PORT}"], cwd=fixture, env=env)
    try:
        for _ in range(50):
            result = subprocess.run(["curl", "-fsS", f"http://127.0.0.1:{PORT}/"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            if result.returncode == 0:
                break
            await asyncio.sleep(0.1)
        else:
            raise RuntimeError("GitWeb fixture did not become ready")

        raw, navigation, trim_start = await capture(work, env)
        output = OUTPUT_ROOT / f"{RECORDING_ID}.mp4"
        poster = OUTPUT_ROOT / f"{RECORDING_ID}-poster.png"
        subprocess.run(
            ["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-ss", f"{trim_start:.3f}", "-i", str(raw), "-vf", "fps=30,tpad=stop_mode=clone:stop_duration=2,trim=duration=13.5,format=yuv420p", "-an", "-c:v", "libx264", "-crf", "18", "-movflags", "+faststart", str(output)],
            check=True,
        )
        subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-sseof", "-0.1", "-i", str(output), "-frames:v", "1", str(poster)], check=True)
        metadata = {
            "recordingId": RECORDING_ID,
            "capturedAt": datetime.now(timezone.utc).isoformat(),
            "source": "official gitweb.cgi from the active Git installation",
            "cgiModule": f"CGI-{CGI_VERSION}",
            "cgiModuleSha256": CGI_ARCHIVE_SHA256,
            "repository": "isolated Git Course fixture",
            "captureResolution": {"width": 1600, "height": 900},
            "teachingViewport": {"width": 1600, "height": 900},
            "durationSeconds": duration(output),
            "containsSensitiveState": False,
            "navigation": navigation,
            "src": f"git-course-lab/browser/{output.name}",
            "poster": f"git-course-lab/browser/{poster.name}",
        }
        (OUTPUT_ROOT / f"{RECORDING_ID}.json").write_text(json.dumps(metadata, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print(output)
        print(poster)
    finally:
        subprocess.run(["git", "--git-dir", str(fixture / "project.git"), "instaweb", "--stop"], cwd=fixture, env=env, check=False, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        shutil.rmtree(work, ignore_errors=True)


if __name__ == "__main__":
    asyncio.run(main())
