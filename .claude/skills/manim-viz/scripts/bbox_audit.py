#!/usr/bin/env python
"""bbox_audit.py — Manim 渲染期真实 bounding-box 快照（布局安全门禁的采集端）。

把布局审计从"人眼抽帧走 13 条 checklist"升级为"机器读真实坐标"。

设计取舍：用 manim 渲染后的 mobject 真实包围盒，**不做 AST 静态估计**。
原因：AST 估不到 next_to / arrange / to_edge / updater 的相对定位结果，
只能用默认半尺寸硬猜，误报漏报都多（manim-workflow/scripts/layout_safety.py
即此路子，作者自己注释承认 "Both at origin — likely a stack we cannot
statically separate"）。真实 bounding box 是 ground truth。

产出 _bbox_audit.jsonl（每行一个快照，JSON Lines）：
    {"label": "play", "mobjects": [
        {"kind": "Text", "dl": [x, y], "ur": [x, y]}, ...
    ]}

再用 scripts/frame_audit.py 离线审计（不依赖 manim）。

=== 两种启用方式 ===

A. 基类（推荐，最省事）：
    from bbox_audit import AuditedScene
    class MyScene(AuditedScene):
        def construct(self):
            ...   # 照常写；每个 play()/add()/wait() 后自动快照

B. 手动定点（想精确控制采样点，省掉无关快照）：
    from bbox_audit import snapshot
    class MyScene(Scene):
        def construct(self):
            self.play(FadeIn(title)); snapshot(self, "title_in")
            ...

=== import 路径 ===
render_scene.sh 已 export PYTHONPATH 指向本目录，`from bbox_audit import ...`
直接可用。若手动 `uv run manim`，请 PYTHONPATH=<本 skill>/scripts。

=== 输出路径 ===
默认写到 cwd/_bbox_audit.jsonl；用环境变量 BBOX_AUDIT_OUT=/abs/path 覆盖。
每次 manim 进程的第一次快照会 truncate 文件（同进程多 Scene 渲染会累加，
罕见，单 Scene 单进程是干净覆盖）。

=== 在线溢出检查（可选，env 驱动）===

默认只采集（渲染不受影响）。设环境变量 ``BBOX_AUDIT_ASSERT`` 启用渲染期自检：

    BBOX_AUDIT_ASSERT=warn    # 溢出 → stderr 提示，渲染继续（调试友好）
    BBOX_AUDIT_ASSERT=1       # 溢出 → RuntimeError 中断（fail-fast，CI 紧线）

用官方 ``Mobject.is_off_screen()``（走 manim frame 半径），与离线 ``frame_audit.py``
互补：离线版批量 + SVG + exit code（事后审 / CI）；在线版渲染期即时反馈（调试 fail-fast）。
"""

from __future__ import annotations

import json
import os
import sys
from pathlib import Path

try:
    from manim import DL, UR, Scene
except ImportError as exc:  # pragma: no cover
    raise ImportError(
        "bbox_audit 必须在 manim 环境里 import（uv run ...）。"
        " 离线审计请用 frame_audit.py，它不依赖 manim。"
    ) from exc

_OUT_ENV = "BBOX_AUDIT_OUT"
_DEFAULT_NAME = "_bbox_audit.jsonl"


def _out_path() -> Path:
    p = os.environ.get(_OUT_ENV)
    return Path(p) if p else Path.cwd() / _DEFAULT_NAME


# 这些类的 submobjects 是渲染细节（字形 / path 片段），应作为整体参与审计，
# 不能下钻到逐字形——否则一个 Text 会报 N 次 overflow，且字形两两互相
# 报 crowding / overlap 噪声。按类名判断，不依赖具体 import（解耦版本差异）。
_ATOMIC_KINDS = {
    "Text", "MarkupText", "Tex", "MathTex", "Paragraph", "Title",
    "BulletedList", "DecimalNumber", "Integer", "Variable", "Label",
}


def _logical_leaves(mob):
    """产出参与审计的逻辑对象：原子文本整体 / VGroup 成员 / 独立几何叶子。"""
    if mob.__class__.__name__ in _ATOMIC_KINDS:
        yield mob  # 整体参与，不下钻字形
        return
    subs = getattr(mob, "submobjects", None)
    if subs:  # 容器（VGroup 等）：下钻到成员
        for s in subs:
            yield from _logical_leaves(s)
        return
    # 叶子几何（Circle / Rectangle / Line / Dot ...）：有自身 points 才算
    pts = getattr(mob, "points", None)
    if pts is not None and len(pts) > 0:
        yield mob


def _collect(scene):
    """收集当前帧所有可见逻辑对象的左下 / 右上角坐标。

    用官方 ``get_corner(DL/UR)``（即 ``get_critical_point``，见 manim
    mobject.py:2203）。它内部走 ``get_points_defining_boundary`` →
    ``get_all_points`` 递归合并自身 + 所有子 points 取极值，语义等价于
    手写聚合，且尊重 mobject 对 boundary 的 override（如 Arc 用控制点）。
    """
    out = []
    for top in scene.mobjects:
        for mob in _logical_leaves(top):
            try:
                dl = mob.get_corner(DL)[:2]
                ur = mob.get_corner(UR)[:2]
            except Exception:
                continue
            out.append(
                {
                    "kind": mob.__class__.__name__,
                    "dl": [round(float(dl[0]), 3), round(float(dl[1]), 3)],
                    "ur": [round(float(ur[0]), 3), round(float(ur[1]), 3)],
                }
            )
    return out


def snapshot(scene, label="snap"):
    """在当前帧快照所有可见 mobject 的包围盒，追加写入 jsonl。"""
    rec = {"label": label, "mobjects": _collect(scene)}
    with _out_path().open("a", encoding="utf-8") as f:
        f.write(json.dumps(rec, ensure_ascii=False) + "\n")


class AuditedScene(Scene):
    """继承即在每个 play / add / wait 后自动快照布局。

    审计是 advisory——任何采集异常都被吞掉，绝不阻断渲染。
    """

    _bbox_started = False

    def _snap(self, label):
        try:
            if not AuditedScene._bbox_started:
                _out_path().write_text("", encoding="utf-8")
                AuditedScene._bbox_started = True
            snapshot(self, label)
        except Exception:
            pass  # 采集异常绝不阻断渲染
        # 在线溢出检查在 try 外——assert 模式需真正中断渲染
        self._online_overflow_check(label)

    def _online_overflow_check(self, label):
        """渲染期溢出自检：用官方 ``is_off_screen()``，按 env 决定 warn / raise / 关闭。

        - ``BBOX_AUDIT_ASSERT`` 未设：关闭（默认，纯采集，现状行为）
        - ``BBOX_AUDIT_ASSERT=warn``：溢出时 print 到 stderr（渲染继续，调试友好）
        - ``BBOX_AUDIT_ASSERT=1``（或 true/assert）：溢出时 raise（fail-fast）

        与离线 ``frame_audit.py`` 互补：那是渲染后批量 + SVG + exit code（CI 友好），
        这是渲染期即时反馈。用官方 ``is_off_screen``（走 config frame 半径），不重复阈值。
        """
        mode = os.environ.get("BBOX_AUDIT_ASSERT", "").lower()
        if mode not in {"warn", "1", "true", "assert"}:
            return
        offenders = []
        for top in self.mobjects:
            for mob in _logical_leaves(top):
                try:
                    if mob.is_off_screen():
                        offenders.append(mob.__class__.__name__)
                except Exception:
                    pass
        if not offenders:
            return
        msg = (
            f"[bbox_audit] snapshot '{label}': {len(offenders)} 个对象 "
            f"is_off_screen → {offenders}"
        )
        if mode in {"1", "true", "assert"}:
            raise RuntimeError(msg)
        print(msg, file=sys.stderr)

    def play(self, *args, **kwargs):
        super().play(*args, **kwargs)
        self._snap("play")
        return self

    def add(self, *mobjects):
        super().add(*mobjects)
        self._snap("add")
        return self

    def wait(self, *args, **kwargs):
        super().wait(*args, **kwargs)
        self._snap("wait")
        return self
