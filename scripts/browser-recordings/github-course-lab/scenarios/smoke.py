from __future__ import annotations

from playwright.async_api import Page

from .base import ScenarioConfig, click_with_cursor, install_recording_cursor


class SmokeScenario:
    config = ScenarioConfig(recording_id="smoke")

    async def run(self, page: Page) -> None:
        await page.set_content(
            """
            <!doctype html>
            <html lang="zh-CN">
              <head>
                <meta charset="utf-8" />
                <style>
                  * { box-sizing: border-box; }
                  body {
                    margin: 0;
                    min-height: 100vh;
                    display: grid;
                    place-items: center;
                    background: #f6f8fa;
                    color: #1f2328;
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
                  }
                  main {
                    width: 720px;
                    padding: 48px;
                    border: 1px solid #d0d7de;
                    border-radius: 14px;
                    background: white;
                    box-shadow: 0 18px 50px rgba(31, 35, 40, 0.08);
                  }
                  p { color: #59636e; font-size: 21px; line-height: 1.6; }
                  button {
                    margin-top: 20px;
                    padding: 12px 20px;
                    border: 1px solid #1f883d;
                    border-radius: 8px;
                    background: #1f883d;
                    color: white;
                    font-size: 18px;
                    font-weight: 700;
                  }
                  output { display: block; margin-top: 22px; color: #1a7f37; font-weight: 700; }
                </style>
              </head>
              <body>
                <main>
                  <h1>github-course-lab</h1>
                  <p>这个页面只验证浏览器、鼠标、视频和转码链路，不模拟 GitHub UI。</p>
                  <button id="verify" type="button">验证录制</button>
                  <output id="result" aria-live="polite"></output>
                </main>
                <script>
                  document.querySelector('#verify').addEventListener('click', () => {
                    document.querySelector('#result').textContent = 'browser recording ready';
                  });
                </script>
              </body>
            </html>
            """
        )
        await install_recording_cursor(page)
        await page.wait_for_timeout(900)
        await click_with_cursor(page, "#verify", settle_ms=1200)
