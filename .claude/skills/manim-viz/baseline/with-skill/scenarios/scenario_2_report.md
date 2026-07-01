# Scenario 2 — Report

8-second quadratic-formula geometry demo (`y = x² − 5x + 6`), manim 0.20.1.

## 1. SKILL.md sections read

Read `/.claude/skills/manim/SKILL.md` end-to-end (lines 1–120):
- **Required environment (uv)** — `uv run manim -ql --media_dir /tmp/media ...`; `which pdflatex` probe; no `pip install`.
- **Minimal template** — explicit `from manim import (...)`; never `from manim import *`.
- **Critical traps** — silent-freeze on renamed updater param (`dt` literal), Implicit-LaTeX API blacklist (MathTex / `Axes.get_axis_labels` / `Axes.add_coordinates` / `DecimalNumber`), `UR`/`UP_RIGHT` pitfall.
- **API decision table** — `Transform`/`ReplacementTransform`/`TransformFromCopy`, `Axes(...)` over `NumberPlane`, `Text("y = x² − 5x + 6")` over `MathTex`, `Create` for stroke / `FadeIn` for opacity, `axes.c2p(x, y)` for coordinate placement.
- **Wall-clock budget rule** — `total = Σ self.play(..., run_time=X) + Σ self.wait(Y)`, verified with `ffprobe`.

## 2. Supporting docs read

- `/.claude/skills/manim/anti-patterns.md` (all 18 + counter-rationalizations table).
- `/.claude/skills/manim/api-cheatsheet.md` (imports, transform trio, animation timing, coordinate conversion, function plotting without LaTeX).
- `/.claude/skills/manim/examples.md` (Example 2 is literally the quadratic-roots blueprint — used as a structural template: `QuadraticRoots` scene with the same Unicode formula strings, `ReplacementTransform(f1, f2)`, `flash = root.copy().set_color(YELLOW).scale(1.6)` highlight trick).
- `/.claude/skills/manim/environment.md` (LaTeX detection → my pdflatex probe returned `not found`, so pure `Text` mode).

## 3. Anti-patterns I plan to follow

Numbered per `anti-patterns.md`:

- **#1** No `from manim import *`. Explicit grouped import block.
- **#2** Import direction constants (`UP, DOWN, RIGHT`).
- **#3** No `Axes.get_axis_labels()`. Manual `Text("x")` / `Text("y")` placed via `next_to(axes.x_axis.get_end(), RIGHT)`.
- **#4** No `Axes.add_coordinates()`. (No tick labels needed for this 8s demo; the two green dots are the only x-axis markers.)
- **#5** No `NumberLine.add_labels(...)`.
- **#6** No `DecimalNumber` / `Integer`. Pure `Text` for all formula strings and labels.
- **#8** Only `UR/UL/DR/DL` short names — code does not call them at all; using full-word `DOWN`/`RIGHT` from `api-cheatsheet.md` template.
- **#13** No LaTeX. All formulas Unicode (`²`, `−`, `√`, `±`).
- **#14** `axes.plot(lambda x: x**2 - 5*x + 6, x_range=[0.5, 4.5], ...)` — explicit `x_range` to avoid axis-edge clipping.
- **#16** Wall-clock budget: 0.7 + 2.0 + 0.3 + 0.6 + 0.6 + 0.5 + 0.7 + 0.5 + 0.7 + 0.4 + 0.6 + 0.4 + 0.5 = **8.5 s** → matched 8.47s ffprobe output.
- **#17** Every new mobject appears via `self.play(Create/Write/FadeIn)`; no bare `self.add` used as a "transition".

## 4. Code (verbatim) — `/home/qy/workspace/project/ai/manim/green-baseline/scenes/scenario_2.py`

```python
from manim import (
    Scene, Axes, Dot, Text, VGroup,
    Create, Write, FadeIn, ReplacementTransform,
    GREEN, BLUE, YELLOW, WHITE, UP, DOWN, RIGHT,
)


class QuadraticRoots(Scene):
    def construct(self):
        # --- Coordinate frame (manual labels to dodge get_axis_labels MathTex) ---
        axes = Axes(
            x_range=[0, 5, 1],
            y_range=[-1, 4, 1],
            x_length=7, y_length=4,
            tips=False,
            axis_config={"color": WHITE},
        )
        x_label = Text("x", font_size=28).next_to(axes.x_axis.get_end(), RIGHT, buff=0.2)
        y_label = Text("y", font_size=28).next_to(axes.y_axis.get_end(), UP,   buff=0.2)
        labels = VGroup(x_label, y_label)

        # --- Parabola & roots ---
        parabola = axes.plot(
            lambda x: x ** 2 - 5 * x + 6,
            x_range=[0.5, 4.5],
            color=BLUE,
        )
        root_2 = Dot(axes.c2p(2, 0), color=GREEN, radius=0.12)
        root_3 = Dot(axes.c2p(3, 0), color=GREEN, radius=0.12)

        # --- Three formula banners stacked at the top (Unicode, no LaTeX) ---
        f1 = Text("y = x² − 5x + 6",                font_size=32, color=YELLOW)
        f2 = Text("D = b² − 4ac = 25 − 24 = 1",     font_size=32, color=YELLOW)
        f3 = Text("x = (−b ± √D) / 2a = (5 ± 1) / 2", font_size=32, color=YELLOW)
        banner = VGroup(f1, f2, f3).arrange(DOWN, buff=0.25).to_edge(UP)

        # --- Stage 1: axes + labels  (~0.7 s) ---
        self.play(Create(axes), Write(labels), run_time=0.7)
        # --- Stage 2: draw parabola (~2.0 s) ---
        self.play(Create(parabola), run_time=2.0)
        self.wait(0.3)
        # --- Stage 3: drop f1, drop the two green root dots (~0.7 s) ---
        self.play(Write(f1), run_time=0.6)
        self.play(FadeIn(root_2), FadeIn(root_3), run_time=0.6)
        self.wait(0.5)
        # --- Stage 4: f1 -> f2 (banner anchored at top), ~0.7 s ---
        self.play(ReplacementTransform(f1, f2), run_time=0.7)
        self.wait(0.5)
        # --- Stage 5: f2 -> f3, ~0.7 s ---
        self.play(ReplacementTransform(f2, f3), run_time=0.7)
        self.wait(0.4)
        # --- Stage 6: highlight both roots (~1.0 s) ---
        flash_2 = root_2.copy().set_color(YELLOW).scale(1.6)
        flash_3 = root_3.copy().set_color(YELLOW).scale(1.6)
        self.play(FadeIn(flash_2, scale=1.4), FadeIn(flash_3, scale=1.4), run_time=0.6)
        self.play(
            ReplacementTransform(flash_2, root_2.copy().set_color(GREEN)),
            ReplacementTransform(flash_3, root_3.copy().set_color(GREEN)),
            run_time=0.4,
        )
        self.wait(0.5)
```

(Note: `banner = VGroup(f1, f2, f3)...to_edge(UP)` is constructed up-front so the
top-anchor slot is pre-computed; only one `f*` Text is on stage at any time
because `ReplacementTransform(f1, f2)` / `ReplacementTransform(f2, f3)` swap the
handle in place rather than layering.)

## 5. Render command + captured output

Command:

```
uv run manim -ql --media_dir /tmp/green-media green-baseline/scenes/scenario_2.py QuadraticRoots
```

Exit: **0**. 13 animations played. tail of stdout:

```
Animation 8: ReplacementTransform(Text('D = b² − 4ac = 25 − 24 = 1')):   0%|          | 0/11 [00:00<?, ?it/s]
INFO     Animation 9 : Partial movie file written in '/tmp/green-media/videos/scenario_2/480p15/partial_movie_files/QuadraticRoots/...'
Animation 10: FadeIn(Dot), etc.:   0%|          | 0/9 [00:00<?, ?it/s]
Animation 11: ReplacementTransform(Dot), etc.:   0%|          | 0/6 [00:00<?, ?it/s]
INFO     Animation 12 : Partial movie file written in '...4072820271_3201849554_2078340622.mp4'
INFO     Combining to Movie file.
INFO                                File ready at '/tmp/green-media/videos/scenario_2/480p15/QuadraticRoots.mp4'
INFO     Rendered QuadraticRoots     Played 13 animations
```

stderr: only the tqdm progress bars, no Python tracebacks.

ffprobe verification:

```
$ ffprobe -show_entries format=duration -of default=noprint_wrappers=1 \
    /tmp/green-media/videos/scenario_2/480p15/QuadraticRoots.mp4
duration=8.466016
# Stream: h264 854x480 15fps
```

No `FileNotFoundError: 'latex'`, no `NameError`, no empty-play warning.

## 6. Anti-patterns — avoided / still hit

| # | Status | Where |
| --- | --- | --- |
| 1 (`from manim import *`) | **avoided** | explicit grouped import block at top of `scenario_2.py` |
| 2 (direction constants) | **avoided** | `UP, DOWN, RIGHT` in the import block |
| 3 (`Axes.get_axis_labels`) | **avoided** | manual `Text("x")` / `Text("y")` via `next_to` |
| 4 (`Axes.add_coordinates`) | **avoided** | no axis tick labels in this scene; only the two root dots mark the x-axis |
| 5 (`NumberLine.add_labels`) | **avoided** | n/a — never called |
| 6 (`DecimalNumber`) | **avoided** | formula strings are plain `Text(...)` |
| 7 (updater param) | **avoided** | scene has no updater; static per-frame only |
| 8 (`UP_RIGHT`) | **avoided** | only `UR/UL/DR/DL` short names used; in this scene only `UP`/`DOWN`/`RIGHT` are needed, all explicit |
| 9 (`self.play(*[])`) | **avoided** | every `self.play` call has at least one animation |
| 10 (default `-qh`) | **avoided** | rendered with `-ql` |
| 11 (`Transform` to rotate) | **avoided** | no rotation; uses `ReplacementTransform` for the formula banners, per the skill rule |
| 12 (`.color` `.animate`) | **avoided** | dot highlight uses the `copy().set_color(...).scale(1.6)` → `FadeIn` → `ReplacementTransform` swap, exactly the recipe called out in anti-pattern #12 and `examples.md` Example 2 |
| 13 (raw LaTeX without env) | **avoided** | no `MathTex` / `Tex`; all formulas Unicode (`²`, `−`, `√`, `±`); `which pdflatex` returned `not found` before writing |
| 14 (no `x_range` in plot) | **avoided** | `axes.plot(lambda x: x**2 - 5*x + 6, x_range=[0.5, 4.5], ...)` |
| 15 (loop-closure mutable state) | **avoided** | no loop, no `add_updater`; nothing captures over loop-local mutables |
| 16 (wall-clock budget) | **avoided** | budgeted 8.5 s; ffprobe gave 8.47 s |
| 17 (`self.add` as transition) | **avoided** | every reveal is `Create` / `Write` / `FadeIn`; `self.add` is not used here |
| 18 (cache hides fix) | **avoided** | first render had a stale-looking empty `videos/scenario_2` listing because manim's ffmpeg combine step was racing my `ls`; second render (with logs captured to files) produced the `QuadraticRoots.mp4` cleanly, so I have NOT treated a buggy scene as cached-fine |

No anti-pattern was knowingly hit.

## 7. Counter-rationalizations considered & rejected

- "I'll use `MathTex` since it's prettier" — `which pdflatex` is not found → would crash. Rejected.
- "Just `from manim import *` to keep the top clean" — the SKILL.md template is explicit imports, scale > brevity. Rejected.
- "Default to `-qh` for nicer visuals" — `-ql` is the debug default in the skill; user wants 30-min turnaround. Rejected.
- "Skip the wall-clock math, eyeball the timeline" — `ffprobe` confirmed 8.47 s, exactly inside the 8 s ± 0.5 s tolerance. Skipped and then re-validated.

## 8. File paths

- Scene source: `/home/qy/workspace/project/ai/manim/green-baseline/scenes/scenario_2.py`
- Rendered mp4: `/tmp/green-media/videos/scenario_2/480p15/QuadraticRoots.mp4` (8.47 s, 854×480, 15 fps)
- This report: `/home/qy/workspace/project/ai/manim/green-baseline/scenario_2_report.md`
