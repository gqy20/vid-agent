#!/usr/bin/env python
"""frame_audit.py — 审计 bbox_audit.py 产出的 _bbox_audit.jsonl，输出布局问题。

**不依赖 manim**（纯坐标分析），可被任何 CI / 脚本 / 编辑器任务调用。
采集端（真实 bounding box）在 scripts/bbox_audit.py。

用法:
    # 默认读 cwd/_bbox_audit.jsonl
    uv run python scripts/frame_audit.py
    # 指定文件
    uv run python scripts/frame_audit.py path/to/_bbox_audit.jsonl
    # 把 advisory 问题也当阻塞（CI 紧线时用）
    uv run python scripts/frame_audit.py --strict

退出码:
    0  无 blocking 问题
    1  有 blocking 问题（画面溢出 = 对象超出画布，必被切边）
    2  输入找不到或无法解析

问题分级:
    frame-overflow  blocking   对象 AABB 超出画布（14.22×8.0），渲染时被切
    near-edge       advisory   趴在安全区边界（margin 内），--strict 才阻塞
    overlap         advisory   两个非背景对象包围盒相交（可能有意叠加）
    crowding        advisory   两个对象间隙 < --min-gap（默认 0.15）

注意: overlap / crowding 在数学动画里常是故意的（标注贴着图形、公式换行），
所以默认 advisory；只有 frame-overflow 是无条件 blocking。人眼抽帧
（references/frame-check.md）仍不可省——本脚本只覆盖其中可量化的几何项。
"""

from __future__ import annotations

import argparse
import html
import json
import sys
from pathlib import Path

# 1080p manim 默认坐标系：frame_width≈14.22, frame_height≈8.0。
CANVAS_X = (-7.11, 7.11)
CANVAS_Y = (-4.0, 4.0)
# 带 safety margin 的软边界（与 manim-workflow 同款 0.5 margin）。
SAFE_X = (-6.4, 6.4)
SAFE_Y = (-3.6, 3.6)
DEFAULT_GAP = 0.15
# 这些 kind 本就该覆盖别的对象（背景框/高亮框），重叠检查跳过。
# 注意：普通 ImageMobject 是独立内容对象，应参与检测，不在这里。
OVERLAY_KINDS = {
    "BackgroundRectangle",
    "SurroundingRectangle",
    "FullScreenRectangle",
}


def _aabb_of(m):
    return [m["dl"][0], m["dl"][1], m["ur"][0], m["ur"][1]]  # dlx, dly, urx, ury


def _overlap(a, b):
    return not (a[2] < b[0] or b[2] < a[0] or a[3] < b[1] or b[3] < a[1])


def _edge_class(dlx, dly, urx, ury):
    """对象 AABB 相对画布 / 安全区的位置分级。供审计与 SVG 共用。"""
    if dlx < CANVAS_X[0] or urx > CANVAS_X[1] or dly < CANVAS_Y[0] or ury > CANVAS_Y[1]:
        return "overflow"
    if dlx < SAFE_X[0] or urx > SAFE_X[1] or dly < SAFE_Y[0] or ury > SAFE_Y[1]:
        return "near"
    return "ok"


def _render_svg(snap, path):
    """为一个快照渲染 SVG 布局示意图：画布框 + 安全区虚线 + 对象 AABB。

    零依赖（纯字符串）。溢出对象红框高亮 + 标签，近边橙，正常浅蓝。
    manim y 向上、SVG y 向下，故 rect 的 y 用 ``-ury`` 翻转。
    """
    label = snap.get("label", "?")
    parts = [
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="-8 -5 16 10" '
        f'style="background:#0a0a12" font-family="sans-serif">',
        # 画布边框
        f'<rect x="{CANVAS_X[0]}" y="{-CANVAS_Y[1]}" '
        f'width="{CANVAS_X[1]-CANVAS_X[0]}" height="{CANVAS_Y[1]-CANVAS_Y[0]}" '
        f'fill="none" stroke="#555" stroke-width="0.05"/>',
        # 安全区虚线
        f'<rect x="{SAFE_X[0]}" y="{-SAFE_Y[1]}" '
        f'width="{SAFE_X[1]-SAFE_X[0]}" height="{SAFE_Y[1]-SAFE_Y[0]}" '
        f'fill="none" stroke="#888" stroke-width="0.03" stroke-dasharray="0.3,0.2"/>',
        f'<text x="{CANVAS_X[0]}" y="{CANVAS_Y[1]-0.15}" font-size="0.26" fill="#888">'
        f'snapshot: {html.escape(label)} · canvas 14.22×8 · dashed=safe · red=overflow</text>',
    ]
    for m in snap.get("mobjects", []):
        dlx, dly = m["dl"]
        urx, ury = m["ur"]
        cls = _edge_class(dlx, dly, urx, ury)
        if cls == "overflow":
            stroke, fill, opa, sw = "#E65A4C", "#E65A4C", 0.25, 0.08
        elif cls == "near":
            stroke, fill, opa, sw = "#F4D345", "#F4D345", 0.15, 0.06
        else:
            stroke, fill, opa, sw = "#58C4DD", "none", 0, 0.03
        parts.append(
            f'<rect x="{dlx}" y="{-ury}" width="{urx-dlx}" height="{ury-dly}" '
            f'fill="{fill}" fill-opacity="{opa}" stroke="{stroke}" stroke-width="{sw}"/>'
        )
        if cls != "ok":
            parts.append(
                f'<text x="{urx}" y="{-ury}" font-size="0.2" fill="{stroke}">'
                f'{html.escape(m["kind"])} ▸ {cls}</text>'
            )
    parts.append("</svg>")
    Path(path).write_text("\n".join(parts), encoding="utf-8")


def audit_snapshot(snap, min_gap, strict):
    issues = []
    mobs = snap.get("mobjects", [])
    label = snap.get("label", "?")

    # 1) frame-overflow (blocking) / near-edge (advisory) —— 分级逻辑见 _edge_class
    for m in mobs:
        dlx, dly = m["dl"]
        urx, ury = m["ur"]
        cls = _edge_class(dlx, dly, urx, ury)
        if cls == "overflow":
            issues.append(
                {
                    "kind": "frame-overflow",
                    "blocking": True,
                    "snapshot": label,
                    "object_kind": m["kind"],
                    "aabb": [dlx, dly, urx, ury],
                    "fix": "对象超出画布会被切边：.shift() 往中心收，或 scale_to_fit_width()",
                }
            )
        elif cls == "near":
            issues.append(
                {
                    "kind": "near-edge",
                    "blocking": strict,
                    "snapshot": label,
                    "object_kind": m["kind"],
                    "aabb": [dlx, dly, urx, ury],
                    "fix": "趴在安全区边界（--strict 才阻塞）：往内收 ~0.7 unit",
                }
            )

    # 2) overlap / crowding (advisory) —— 跳过背景覆盖类
    visible = [m for m in mobs if m["kind"] not in OVERLAY_KINDS]
    for i in range(len(visible)):
        for j in range(i + 1, len(visible)):
            a, b = visible[i], visible[j]
            aa, bb = _aabb_of(a), _aabb_of(b)
            if _overlap(aa, bb):
                issues.append(
                    {
                        "kind": "overlap",
                        "blocking": strict,
                        "snapshot": label,
                        "a": a["kind"],
                        "b": b["kind"],
                        "aabb_a": aa,
                        "aabb_b": bb,
                        "fix": "两对象包围盒相交：增大 next_to buff，或确认是有意叠加",
                    }
                )
            else:
                dx = max(0.0, max(aa[0], bb[0]) - min(aa[2], bb[2]))
                dy = max(0.0, max(aa[1], bb[1]) - min(aa[3], bb[3]))
                if 0 < dx < min_gap or 0 < dy < min_gap:
                    issues.append(
                        {
                            "kind": "crowding",
                            "blocking": False,
                            "snapshot": label,
                            "a": a["kind"],
                            "b": b["kind"],
                            "gap": [round(dx, 3), round(dy, 3)],
                            "fix": f"间距 < {min_gap}：buff 提到 ≥ {min_gap}",
                        }
                    )
    return issues


def main():
    ap = argparse.ArgumentParser(description="审计 _bbox_audit.jsonl 的布局安全。")
    ap.add_argument("path", nargs="?", default="_bbox_audit.jsonl")
    ap.add_argument("--min-gap", type=float, default=DEFAULT_GAP)
    ap.add_argument("--strict", action="store_true", help="advisory 问题也计入 exit 1")
    ap.add_argument("--viz", metavar="DIR", help="为每个快照渲染 SVG 布局示意图到 DIR（零依赖）")
    args = ap.parse_args()

    p = Path(args.path)
    if not p.exists():
        print(
            json.dumps(
                {
                    "error": f"找不到 {p}",
                    "hint": "先在 scene.py 里 from bbox_audit import AuditedScene 并继承，再渲染",
                },
                ensure_ascii=False,
            )
        )
        return 2

    snaps = []
    for ln, line in enumerate(p.read_text(encoding="utf-8").splitlines(), 1):
        line = line.strip()
        if not line:
            continue
        try:
            snaps.append(json.loads(line))
        except json.JSONDecodeError as e:
            print(json.dumps({"error": f"第 {ln} 行 JSON 解析失败: {e}"}, ensure_ascii=False))
            return 2

    if not snaps:
        print(
            json.dumps(
                {"error": "空文件（没快照）", "hint": "确认 AuditedScene 被继承或 snapshot() 被调用"},
                ensure_ascii=False,
            )
        )
        return 2

    all_issues = []
    for s in snaps:
        all_issues.extend(audit_snapshot(s, args.min_gap, args.strict))

    blocking = [i for i in all_issues if i["blocking"]]
    report = {
        "source": str(p),
        "snapshots": len(snaps),
        "canvas": {"x": list(CANVAS_X), "y": list(CANVAS_Y)},
        "safe_frame": {"x": list(SAFE_X), "y": list(SAFE_Y)},
        "summary": {
            k: sum(1 for i in all_issues if i["kind"] == k)
            for k in ("frame-overflow", "near-edge", "overlap", "crowding")
        }
        | {"blocking": len(blocking)},
        "issues": all_issues,
    }
    if args.viz:
        vdir = Path(args.viz)
        vdir.mkdir(parents=True, exist_ok=True)
        for i, s in enumerate(snaps):
            name = s.get("label", "snap").replace("/", "_").replace(" ", "_")
            _render_svg(s, vdir / f"snap_{i:02d}_{name}.svg")
        print(f"SVG 布局示意图已生成: {vdir}（{len(snaps)} 个快照）", file=sys.stderr)
    print(json.dumps(report, indent=2, ensure_ascii=False))
    return 1 if blocking else 0


if __name__ == "__main__":
    raise SystemExit(main())
