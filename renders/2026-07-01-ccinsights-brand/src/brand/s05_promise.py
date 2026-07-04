"""Brand 05 — Promise (2.9s)

Five-stage pipeline: 读取 → 解析 → 汇总 → 推荐 → 改进
Each node lights GREY→BRAND in sequence along the flow; the outgoing link
lights with its node, so the brand color "flows" left-to-right. A value
sub-line resolves below. Reuses s06/s07 language (cards + brand accent) but
as a horizontal flow — distinct from s06's static 3×2 grid.

Dim→lit contrast is the whole point: unlit nodes sit at opacity 0.45 with
hairline grey stroke; lighting up restores full opacity, widens the stroke,
floods a translucent brand fill, and flips the verb to brand color — so the
brand color visibly "flows" left-to-right along the pipeline.

Beat × run_time (skill wall-clock gate; run_times shrank to offset lag_ratio
stretch on the staggered groups):
    0.35+lag nodes  +  0.25+lag links  +  5×0.22 light-up  +  0.4 sub  +  0.6 hold ≈ 2.9s
"""

import os
import sys

_HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.dirname(_HERE))

from manim import (
    Scene, Text, Line, RoundedRectangle, VGroup,
    BLACK, WHITE, GREY,
    UP, ORIGIN,
    FadeIn, Create,
)

from _lib import BRAND, FONT_GOTHIC, BODY_SIZE, SMALL_SIZE, TINY_SIZE


STAGES = ["读取", "解析", "汇总", "推荐", "改进"]
SUBLINE = "从原始日志到改进建议，全自动"


class Promise(Scene):
    def construct(self):
        node_w, node_h = 2.0, 1.1
        step = node_w + 0.3                       # center-to-center
        x0 = -(len(STAGES) - 1) * step / 2        # leftmost center, frame-centered
        node_y = 0.4

        # ---- nodes (start dim) ------------------------------------------
        nodes, verbs = [], []
        for i, name in enumerate(STAGES):
            x = x0 + i * step
            box = RoundedRectangle(
                width=node_w, height=node_h, corner_radius=0.18,
                color=GREY, stroke_width=2, fill_opacity=0,
            ).move_to([x, node_y, 0])
            num = Text(str(i + 1), font=FONT_GOTHIC, font_size=TINY_SIZE,
                       color=GREY).move_to([x, node_y + 0.28, 0])
            verb = Text(name, font=FONT_GOTHIC, font_size=SMALL_SIZE,
                        color=WHITE, weight="BOLD").move_to([x, node_y - 0.18, 0])
            nodes.append(VGroup(box, num, verb).set_opacity(0.45))
            verbs.append(verb)

        # ---- connectors (node i → i+1) ----------------------------------
        links = []
        for i in range(len(STAGES) - 1):
            x_from = (x0 + i * step) + node_w / 2
            x_to = (x0 + (i + 1) * step) - node_w / 2
            links.append(Line([x_from, node_y, 0], [x_to, node_y, 0],
                              color=GREY, stroke_width=2))

        # ---- sequence ---------------------------------------------------
        self.play(FadeIn(VGroup(*nodes), shift=UP * 0.2, lag_ratio=0.08),
                  run_time=0.35)
        self.play(Create(VGroup(*links), lag_ratio=0.1), run_time=0.25)

        for i, grp in enumerate(nodes):
            anims = [
                grp.animate.set_opacity(1.0),
                grp[0].animate.set_stroke(BRAND, width=3)
                              .set_fill(BRAND, opacity=0.18),
                verbs[i].animate.set_color(BRAND),
            ]
            if i < len(links):
                anims.append(links[i].animate.set_stroke(BRAND, width=3))
            self.play(*anims, run_time=0.22)

        sub = Text(SUBLINE, font=FONT_GOTHIC, font_size=BODY_SIZE,
                   color=WHITE).move_to([0, -1.7, 0])
        self.play(FadeIn(sub, shift=UP * 0.2), run_time=0.4)
        self.wait(0.6)
        # total = 0.5 + 0.3 + 5*0.22 + 0.4 + 0.6 = 2.9s
