#!/usr/bin/env bash
# DOM bounding-box overlap audit for Remotion compositions.
# Usage:
#   scripts/audit-overlaps.sh <composition-id> <frames_csv> [out-dir]
# Example:
#   scripts/audit-overlaps.sh GitCourseEp04BranchIsPointer 360,390,450,510,600 renders/git-course/ep04-branch-is-pointer/audits/overlaps
set -euo pipefail

COMP="${1:?usage: scripts/audit-overlaps.sh <composition-id> <frames_csv> [out-dir]}"
FRAMES_CSV="${2:?usage: scripts/audit-overlaps.sh <composition-id> <frames_csv> [out-dir]}"
OUT_DIR="${3:-renders/audits/overlaps/$COMP}"
PORT="${PORT:-3999}"
MIN_AREA="${MIN_AREA:-24}"
MIN_RATIO="${MIN_RATIO:-0.02}"
MIN_GAP="${MIN_GAP:-44}"
GHOST_OPACITY_MIN="${GHOST_OPACITY_MIN:-0.02}"
GHOST_OPACITY_MAX="${GHOST_OPACITY_MAX:-0.18}"
WAIT_MS="${WAIT_MS:-450}"
STRICT="${STRICT:-0}"

mkdir -p "$OUT_DIR"

FRAMES_JSON="$(node -e "const frames='$FRAMES_CSV'.split(',').map((v)=>Number(v.trim())).filter(Number.isFinite); if (!frames.length) process.exit(1); process.stdout.write(JSON.stringify(frames));")"
RAW_OUT="$OUT_DIR/playwright-raw.txt"
JSON_OUT="$OUT_DIR/overlaps.json"
MD_OUT="$OUT_DIR/overlaps.md"

cleanup() {
  if [[ -n "${STUDIO_PID:-}" ]]; then
    kill "$STUDIO_PID" >/dev/null 2>&1 || true
  fi
  playwright-cli -s=remotion-overlap-audit close >/dev/null 2>&1 || true
}
trap cleanup EXIT

if ! command -v playwright-cli >/dev/null 2>&1; then
  echo "playwright-cli not found" >&2
  exit 1
fi

pnpm exec remotion studio src/index.ts --port="$PORT" --no-open >"$OUT_DIR/studio.log" 2>&1 &
STUDIO_PID=$!

for _ in $(seq 1 80); do
  if curl -fsS "http://localhost:$PORT" >/dev/null 2>&1; then
    break
  fi
  sleep 0.25
done

playwright-cli -s=remotion-overlap-audit close >/dev/null 2>&1 || true
playwright-cli -s=remotion-overlap-audit open "http://localhost:$PORT/$COMP" >/dev/null

playwright-cli -s=remotion-overlap-audit run-code "async page => {
  const compositionId = '$COMP';
  const frames = $FRAMES_JSON;
  const minArea = $MIN_AREA;
  const minRatio = $MIN_RATIO;
  const minGap = $MIN_GAP;
  const ghostOpacityMin = $GHOST_OPACITY_MIN;
  const ghostOpacityMax = $GHOST_OPACITY_MAX;
  const waitMs = $WAIT_MS;
  const ignoreId = (id) => /(^$|progress|tick|line|pulse|chain$|graph$|motion-graph|connector)/.test(id);
  const intersect = (a, b) => {
    const x1 = Math.max(a.x, b.x);
    const y1 = Math.max(a.y, b.y);
    const x2 = Math.min(a.x + a.width, b.x + b.width);
    const y2 = Math.min(a.y + a.height, b.y + b.height);
    const width = Math.max(0, x2 - x1);
    const height = Math.max(0, y2 - y1);
    const area = width * height;
    return {x: x1, y: y1, width, height, area};
  };
  const results = [];

  await page.setViewportSize({width: 1920, height: 1080});
  await page.goto('http://localhost:$PORT/' + compositionId);
  await page.waitForFunction(() => typeof window.remotion_setFrame === 'function', null, {timeout: 30000});

  for (const frame of frames) {
    await page.evaluate(({frame: f, compositionId: c}) => window.remotion_setFrame(f, c, 0), {frame, compositionId});
    await page.waitForTimeout(waitMs);
    await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));

    const frameResult = await page.evaluate(({frame, minArea, minRatio, minGap, ghostOpacityMin, ghostOpacityMax}) => {
      const opacityOf = (el) => {
        let opacity = 1;
        let node = el;
        while (node && node.nodeType === Node.ELEMENT_NODE) {
          const style = getComputedStyle(node);
          opacity *= Number(style.opacity || 1);
          node = node.parentElement;
        }
        return opacity;
      };
      const ignoreId = (id) => /(^$|progress|tick|line|pulse|chain$|graph$|motion-graph|connector)/.test(id);
      const intersect = (a, b) => {
        const x1 = Math.max(a.x, b.x);
        const y1 = Math.max(a.y, b.y);
        const x2 = Math.min(a.x + a.width, b.x + b.width);
        const y2 = Math.min(a.y + a.height, b.y + b.height);
        const width = Math.max(0, x2 - x1);
        const height = Math.max(0, y2 - y1);
        const area = width * height;
        return {x: x1, y: y1, width, height, area};
      };
      const elements = [...document.querySelectorAll('[data-audit-id]')].map((el, index) => {
        const rect = el.getBoundingClientRect();
        const id = el.getAttribute('data-audit-id') || '';
        const opacity = opacityOf(el);
        const area = rect.width * rect.height;
        const explicitlyIgnored = el.hasAttribute('data-audit-ignore');
        return {
          index,
          id,
          tag: el.tagName.toLowerCase(),
          x: Number(rect.x.toFixed(2)),
          y: Number(rect.y.toFixed(2)),
          width: Number(rect.width.toFixed(2)),
          height: Number(rect.height.toFixed(2)),
          area: Number(area.toFixed(2)),
          opacity: Number(opacity.toFixed(3)),
          text: (el.textContent || '').replace(/\\s+/g, ' ').trim().slice(0, 80),
          explicitlyIgnored,
          allowOverflow: el.hasAttribute('data-audit-allow-overflow'),
          singleLineOverflow: el.hasAttribute('data-audit-single-line') && el.scrollWidth > el.clientWidth + 1,
          auditGroup: el.getAttribute('data-audit-group') || '',
          ignored: explicitlyIgnored || ignoreId(id) || rect.width < 1 || rect.height < 1 || area < minArea || opacity < 0.02,
          el,
        };
      });
      const active = elements.filter((item) => !item.ignored);
      const overlaps = [];
      const visualIssues = [];
      const distance = (a, b) => {
        const ax2 = a.x + a.width;
        const ay2 = a.y + a.height;
        const bx2 = b.x + b.width;
        const by2 = b.y + b.height;
        const dx = Math.max(b.x - ax2, a.x - bx2, 0);
        const dy = Math.max(b.y - ay2, a.y - by2, 0);
        const xOverlap = Math.min(ax2, bx2) - Math.max(a.x, b.x);
        const yOverlap = Math.min(ay2, by2) - Math.max(a.y, b.y);
        return {dx, dy, xOverlap, yOverlap};
      };
      for (const item of elements) {
        if (!item.explicitlyIgnored && item.ignored && item.opacity >= ghostOpacityMin && item.opacity <= ghostOpacityMax && item.area >= minArea && !ignoreId(item.id)) {
          visualIssues.push({
            type: 'ghost',
            id: item.id,
            opacity: item.opacity,
            text: item.text,
          });
        }
      }
      const rectContains = (outer, inner, tolerance = 1) =>
        inner.x >= outer.x - tolerance &&
        inner.y >= outer.y - tolerance &&
        inner.x + inner.width <= outer.x + outer.width + tolerance &&
        inner.y + inner.height <= outer.y + outer.height + tolerance;
      const viewport = {x: 0, y: 0, width: innerWidth, height: innerHeight};
      const compositionBoundsOf = (el) => {
        let node = el.parentElement;
        while (node) {
          const rect = node.getBoundingClientRect();
          const style = getComputedStyle(node);
          const isCompositionSurface = rect.width > 200 && rect.height > 200;
          if (style.overflow === 'hidden' && style.transform !== 'none' && isCompositionSurface) {
            return {x: rect.x, y: rect.y, width: rect.width, height: rect.height};
          }
          node = node.parentElement;
        }
        return viewport;
      };
      for (const item of active) {
        if (item.singleLineOverflow) {
          visualIssues.push({
            type: 'single-line-overflow',
            id: item.id,
            text: item.text,
            width: item.width,
          });
        }
        if (item.allowOverflow) continue;
        const compositionBounds = compositionBoundsOf(item.el);
        if (!rectContains(compositionBounds, item)) {
          visualIssues.push({
            type: 'bounds',
            id: item.id,
            scope: 'composition',
            x: item.x,
            y: item.y,
            width: item.width,
            height: item.height,
          });
        }
        const safeArea = item.el.parentElement?.closest('[data-audit-safe-area]');
        if (safeArea) {
          const safeRect = safeArea.getBoundingClientRect();
          const safeBounds = {x: safeRect.x, y: safeRect.y, width: safeRect.width, height: safeRect.height};
          if (!rectContains(safeBounds, item)) {
            visualIssues.push({
              type: 'bounds',
              id: item.id,
              scope: safeArea.getAttribute('data-audit-safe-area') || 'safe-area',
              x: item.x,
              y: item.y,
              width: item.width,
              height: item.height,
            });
          }
        }
      }
      for (let i = 0; i < active.length; i++) {
        for (let j = i + 1; j < active.length; j++) {
          const a = active[i];
          const b = active[j];
          if (a.el.contains(b.el) || b.el.contains(a.el)) continue;
          const intersection = intersect(a, b);
          const ratio = intersection.area / Math.max(1, Math.min(a.area, b.area));
          if (intersection.area >= minArea && ratio >= minRatio) {
            overlaps.push({
              a: a.id,
              b: b.id,
              area: Number(intersection.area.toFixed(2)),
              ratio: Number(ratio.toFixed(4)),
              intersection,
            });
          }
          const gap = distance(a, b);
          if (
            intersection.area === 0 &&
            !(a.auditGroup && a.auditGroup === b.auditGroup) &&
            ((gap.xOverlap > minGap && gap.dy > 0 && gap.dy < minGap) ||
              (gap.yOverlap > minGap && gap.dx > 0 && gap.dx < minGap))
          ) {
            visualIssues.push({
              type: 'near',
              a: a.id,
              b: b.id,
              dx: Number(gap.dx.toFixed(2)),
              dy: Number(gap.dy.toFixed(2)),
              xOverlap: Number(gap.xOverlap.toFixed(2)),
              yOverlap: Number(gap.yOverlap.toFixed(2)),
            });
          }
        }
      }
      return {
        frame,
        url: location.href,
        activeElementCount: active.length,
        ignoredElementCount: elements.length - active.length,
        elements: elements.map(({el, ...rest}) => rest),
        overlaps,
        visualIssues,
      };
    }, {frame, minArea, minRatio, minGap, ghostOpacityMin, ghostOpacityMax});
    results.push(frameResult);
  }

  return {
    compositionId,
    frames,
    thresholds: {minArea, minRatio},
    generatedAt: new Date().toISOString(),
    frameCount: results.length,
    overlapCount: results.reduce((sum, frame) => sum + frame.overlaps.length, 0),
    visualIssueCount: results.reduce((sum, frame) => sum + frame.visualIssues.length, 0),
    framesWithOverlaps: results.filter((frame) => frame.overlaps.length > 0).map((frame) => frame.frame),
    framesWithVisualIssues: results.filter((frame) => frame.visualIssues.length > 0).map((frame) => frame.frame),
    results,
  };
}" >"$RAW_OUT"

awk 'found && /^### Ran Playwright code/{exit} found{print} /^### Result/{found=1}' "$RAW_OUT" >"$JSON_OUT"

node - "$JSON_OUT" "$MD_OUT" <<'NODE'
const fs = require('fs');
const [jsonPath, mdPath] = process.argv.slice(2);
const report = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
const lines = [];
lines.push(`# Remotion 重叠审计`);
lines.push('');
lines.push(`- Composition: \`${report.compositionId}\``);
lines.push(`- Frames: ${report.frames.map((f) => `\`${f}\``).join(', ')}`);
lines.push(`- Thresholds: minArea=${report.thresholds.minArea}, minRatio=${report.thresholds.minRatio}`);
lines.push(`- Total overlaps: **${report.overlapCount}**`);
lines.push(`- Visual issues: **${report.visualIssueCount ?? 0}**`);
lines.push('');
for (const frame of report.results) {
  lines.push(`## Frame ${frame.frame}`);
  lines.push(`Active elements: ${frame.activeElementCount}, ignored: ${frame.ignoredElementCount}`);
  if (frame.overlaps.length === 0 && (!frame.visualIssues || frame.visualIssues.length === 0)) {
    lines.push('');
    lines.push('No blocking overlaps or visual spacing issues detected.');
    lines.push('');
    continue;
  }
  if (frame.visualIssues && frame.visualIssues.length > 0) {
    lines.push('');
    lines.push('| Type | A | B/Text | Detail |');
    lines.push('|---|---|---|---|');
    for (const issue of frame.visualIssues) {
      if (issue.type === 'ghost') {
        lines.push(`| ghost | \`${issue.id}\` | ${issue.text || ''} | opacity=${issue.opacity} |`);
      } else if (issue.type === 'bounds') {
        lines.push(`| bounds | \`${issue.id}\` | \`${issue.scope}\` | x=${issue.x}, y=${issue.y}, width=${issue.width}, height=${issue.height} |`);
      } else if (issue.type === 'single-line-overflow') {
        lines.push(`| single-line-overflow | \`${issue.id}\` | ${issue.text || ''} | width=${issue.width} |`);
      } else {
        lines.push(`| near | \`${issue.a}\` | \`${issue.b}\` | dx=${issue.dx}, dy=${issue.dy}, xOverlap=${issue.xOverlap}, yOverlap=${issue.yOverlap} |`);
      }
    }
  }
  if (frame.overlaps.length === 0) {
    lines.push('');
    continue;
  }
  lines.push('');
  lines.push('| A | B | Area | Ratio |');
  lines.push('|---|---|---:|---:|');
  for (const overlap of frame.overlaps) {
    lines.push(`| \`${overlap.a}\` | \`${overlap.b}\` | ${overlap.area} | ${overlap.ratio} |`);
  }
  lines.push('');
}
fs.writeFileSync(mdPath, lines.join('\n'));
NODE

echo "overlap json: $JSON_OUT"
echo "overlap report: $MD_OUT"

if [[ "$STRICT" == "1" ]]; then
  node - "$JSON_OUT" <<'NODE'
const fs = require('fs');
const report = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
if (report.overlapCount > 0 || report.visualIssueCount > 0) {
  console.error(`strict overlap audit failed: overlaps=${report.overlapCount}, visualIssues=${report.visualIssueCount}`);
  process.exit(1);
}
NODE
fi
