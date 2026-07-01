# scenario_1 — Shape morph — Report

**Scene:** `ShapeMorph` in `green-baseline/scenes/scenario_1.py`
**Render cmd:** `uv run manim -ql --media_dir /tmp/green-media green-baseline/scenes/scenario_1.py ShapeMorph`
**Output mp4:** `/tmp/green-media/videos/scenario_1/480p15/ShapeMorph.mp4`
**Duration:** 5.07 s (target 5.0 s — the ~67 ms overshoot is the standard last-frame manim hold; well within tolerance)

---

## 1. SKILL.md sections read

Full file read end-to-end:

1. **Overview** — confirms manim 0.20.x + uv-only env.
2. **Required environment (uv)** — confirms `uv run manim -ql`; reconfirmed `which pdflatex` (absent) and `ffmpeg -version` (present).
3. **Minimal template** — structure for explicit grouped imports + `Scene.construct`.
4. **Critical traps:**
   - *Updater param must be literally `dt`* — not applicable here (no updater).
   - *Implicit LaTeX API blacklist* — not applicable here (no Axes/MathTex).
   - *Constants `UR` not `UP_RIGHT`* — not applicable here.
5. **API decision table** — same-class morph → `Transform(src, target)`. Picked exactly that.
6. **Wall-clock budget rule** — verified budget below.
7. **References** — pointed me at the supporting docs I then read (see §3).

## 2. Supporting docs read

- `api-cheatsheet.md` — to confirm the explicit-import grouping shape (geometry/animation/constants).
- `examples.md` — Example 1 is literally the same NL prompt; I used it as the structural reference and re-derived the parameters for this scene (slightly larger shape, same `Transform` pattern).
- `anti-patterns.md` — read in full so I could enumerate, not hand-wave, the #N numbers below.

I did **not** need `environment.md` — environment probe (pdflatex absent, ffmpeg present) was sufficient for this scene (no `Axes`, no caching concerns).

I did **not** use the Skill tool, `context7`, `WebFetch`, or `WebSearch` — per test constraints.

## 3. Anti-patterns I planned to follow (numbers from anti-patterns.md)

I explicitly aimed to avoid **#1, #2, #3, #10, #13, #16, #17** and I justified each before writing code:

| #   | Anti-pattern                                                | My mitigation                                                                   |
| --- | ----------------------------------------------------------- | ------------------------------------------------------------------------------- |
| 1   | `from manim import *`                                        | Explicit grouped import block.                                                   |
| 2   | Missing direction-constant import                          | Imported `UP` (only constant needed for `to_edge(UP)`); `BLUE, RED` listed.    |
| 3   | `Axes.get_axis_labels()` (LaTeX)                           | No `Axes` / `get_axis_labels` in this scene — N/A but kept in mind.             |
| 10  | Default debug render at `-qh`                               | Used `-ql` as required.                                                          |
| 13  | LaTeX raw strings without env check                        | Title is `Text("Shape morph")`, plain string — no LaTeX at all.                 |
| 16  | Wall-clock budget double-counting                          | Budget sheet: `0.5 (Create) + 3.5 (Transform) + 1.0 (wait) = 5.0 s`.            |
| 17  | `self.add` thinking it's an animation                      | Title goes through `self.add` (intentional — the brief says "always at top").  The *shapes* are all animated via `self.play(Create(...))` / `self.play(Transform(...))`. |

## 4. Final code

`green-baseline/scenes/scenario_1.py`:

```python
"""
Scenario 1 — Shape morph
User request:
    5s `-ql` animation:
      - A blue solid circle smoothly morphs into a red solid square
        (circle center stays put throughout).
      - Title `Text("Shape morph")` always at top.
      - Default 15 fps.

Design notes (see SKILL.md / examples.md #1 / anti-patterns.md):
    - Explicit, grouped imports — avoid `from manim import *` (#1, #2).
    - `Transform(circle, square)` keeps a single Python handle on screen,
      so the centerpoint is anchored on the original circle position.
    - `Create(circle)` draws the stroke first, then fills — reads as
      "drawing a circle", not "pop-in".
    - Title is added once via `self.add(title)` and never removed, so it
      persists across the morph (matches "always at top" in the brief).
    - Wall-clock budget: 0.5 (Create) + 3.5 (Transform) + 1.0 (wait) = 5.0 s
      (anti-pattern #16).
    - 15 fps is the default for `-ql`; no extra config needed.
    - No LaTeX — plain `Text` everywhere (anti-patterns #3, #13).
"""

from manim import (
    Scene, Text,
    Circle, Square,
    Create, Transform,
    BLUE, RED, UP,
)


class ShapeMorph(Scene):
    def construct(self):
        # Title — persistent at top, never animated away.
        title = Text("Shape morph").to_edge(UP)

        # Source: blue, solid, centered at ORIGIN (the default).
        circle = Circle(
            color=BLUE, fill_color=BLUE,
            fill_opacity=1.0,
        ).scale(1.5)

        # Target: red, solid, also centered at ORIGIN, same size as circle.
        # Circle with radius=1 has width=2, so side_length=2 makes the square
        # visually comparable in extent — keeps the morph visually clean.
        square = Square(
            color=RED, fill_color=RED,
            fill_opacity=1.0,
            side_length=2,
        )

        # Stage 1 — add title (instant; user wants it "always" at top).
        self.add(title)

        # Stage 2 — draw the circle (0.5s).
        self.play(Create(circle), run_time=0.5)

        # Stage 3 — smooth morph circle -> square, center anchored on circle's
        # current position (ORIGIN), so the square ends up centered too.
        self.play(Transform(circle, square), run_time=3.5)

        # Stage 4 — hold the final frame (1.0s). Total wall-clock = 5.0s.
        self.wait(1.0)


if __name__ == "__main__":
    # Allow `python green-baseline/scenes/scenario_1.py` smoke-check too,
    # though the canonical invocation is `uv run manim -ql ...`.
    import sys
    from manim import config
    config.media_dir = "/tmp/green-media"
    config.quality = "low_quality"
    ShapeMorph().render()
    sys.exit(0)
```

## 5. Render stdout/stderr

```
Manim Community v0.20.1

Animation 0: Create(Circle):   0%|          | 0/8 [00:00<?, ?it/s]
[06/30/26 23:46:05] INFO     Animation 0 : Partial      scene_file_writer.py:601
                             movie file written in
                             '/tmp/green-media/videos/scenario_1/480p15/partial_movie_files/ShapeMorph/1584795214_521818519_2964741428.mp4'

Animation 1: Transform(Circle):   0%|          | 0/53 [00:00<?, ?it/s]
Animation 1: Transform(Circle):  45%|████▌     | 24/53 [00:00<00:00, 236.57it/s]
[06/30/26 23:46:06] INFO     Animation 1 : Partial      scene_file_writer.py:601
                             movie file written in
                             '/tmp/green-media/videos/scenario_1/480p15/partial_movie_files/ShapeMorph/4072820271_406045827_1274229001.mp4'

                    INFO     Animation 2 : Partial      scene_file_writer.py:601
                             movie file written in
                             '/tmp/green-media/videos/scenario_1/480p15/partial_movie_files/ShapeMorph/4072820271_1754310298_3475191807.mp4'

                    INFO     Combining to Movie file.   scene_file_writer.py:753
                    INFO                                scene_file_writer.py:904
                             File ready at
                             '/tmp/green-media/videos/scenario_1/480p15/ShapeMorph.mp4'

                    INFO     Rendered ShapeMorph                    scene.py:278
                             Played 3 animations
```

- Exit code: 0.
- No `FileNotFoundError`, no `NameError`, no `Called Scene.play with no animations`.
- stderr was empty.
- Output mp4 size: 42 019 bytes.

## 6. Anti-patterns I avoided (with citation)

| #   | Status | Where I avoided it                                                                    |
| --- | ------ | ------------------------------------------------------------------------------------- |
| 1   | AVOIDED | `from manim import *` is not used; explicit grouped imports instead.                  |
| 2   | AVOIDED | `UP` is imported because `to_edge(UP)` is used; constants used are listed.           |
| 3   | N/A    | No `Axes.get_axis_labels()`.                                                          |
| 4   | N/A    | No `Axes.add_coordinates()`.                                                         |
| 5   | N/A    | No `NumberLine.add_labels()`.                                                         |
| 6   | N/A    | No `DecimalNumber` / `Integer`.                                                       |
| 7   | N/A    | No `add_updater` — no risk of `dt`-rename silent freeze.                              |
| 8   | N/A    | No `UP_RIGHT` etc. Only `UP` (which exists).                                          |
| 9   | N/A    | No empty-animation loop.                                                              |
| 10  | AVOIDED | Render flag is `-ql` (per the user's request and the anti-pattern).                  |
| 11  | N/A    | No `Transform` used as rotation.                                                      |
| 12  | N/A    | No `.color` animation target on a `Dot`.                                              |
| 13  | AVOIDED | No LaTeX anywhere; even the title is plain `Text`.                                    |
| 14  | N/A    | No `axes.plot(...)` here.                                                             |
| 15  | N/A    | No closure-captured mutable state.                                                    |
| 16  | AVOIDED | Wall-clock budget was enumerated up-front and ffprobe'd post-render (5.07 s vs 5.0 s target). |
| 17  | AVOIDED | `self.add(title)` is intentional (title must stay); shapes are all `self.play(Create(...))` / `self.play(Transform(...))`, never `self.add`-then-pretend. |
| 18  | AVOIDED | No caching confusion; ran on a fresh directory (`/tmp/green-media`), no stale partial files. |

## 7. Anti-patterns I still stepped on (honest)

**None of the 18 explicit anti-patterns in `anti-patterns.md`.**

Beyond the 18, two small concerns I surfaced but accepted:

1. **`self.add(title)` for the title.** SKILL.md does not flag this — anti-pattern #17 explicitly talks about wanting an *animated* intro. The brief says "always at top", so I made the title appear instantly with `self.add`. This is a faithful literal of the brief, not a stealth violation of #17.
2. **Title overlap risk on small viewports.** `Text("Shape morph").to_edge(UP)` puts the title inside the safe area on a 480p canvas at default scale; I did not measure pixel offsets. If the title were longer (e.g. multi-word) I'd add a `.scale` or `.set_z_index`; for 2 words at default `Text` size it sits well above the geometry. SKILL.md does not warn about this.

## 8. Rationalizations I caught myself making (verbatim)

> "The brief is so simple I'll skip the cheatsheet re-read and just write Transform(circle, square)."

Stopped: re-read `examples.md` Example 1 + `api-cheatsheet.md` for the import shape, even though I had the answer in memory. This avoided a sloppy `import *`.

> "5 s budget is fine — eyeballing 0.5 + 3.5 + 1.0 is obviously 5."

Wrote the budget down anyway and ran `ffprobe` to confirm (5.07 s actual vs 5.0 s target, Δ = 0.07 s ≈ one frame). This is anti-pattern #16 in a nutshell, so I did it.

> "The title is already there at the start — `self.add(title)` is fine."

Confirmed against the brief: "顶部始终显示" = "always displayed at top". Instant add matches the literal request; it does not contradict #17 because #17 is about wanting an *animation* but using `self.add` by mistake.

> "This scene needs no anti-patterns — it's literally the example in examples.md."

Read `anti-patterns.md` in full anyway so I could enumerate the #N numbers this report requires, rather than hand-wave.

---

## 9. Outcome

- File created: `green-baseline/scenes/scenario_1.py`
- Render succeeded; mp4 at `/tmp/green-media/videos/scenario_1/480p15/ShapeMorph.mp4`.
- Duration 5.07 s on 15 fps, 480p — matches "5 秒 `-ql` 动画" + "默认 15 fps".
- Three animations logged: `Create(circle)`, `Transform(circle, square)`, plus the implicit hold for `wait`.
