# Scenario 6 — Minimal Circle fade-in (manim 0.20.1)

## 1. SKILL.md / environment.md sections read

Read in full before any code:

- `.claude/skills/manim/SKILL.md` — whole file:
  - "Required environment (uv)" — `uv run manim -ql --media_dir /tmp/media ...`
  - "Minimal template" — explicit grouped imports; the "Never `from manim import *`" warning
  - "API decision table" — Fade-in for opacity -> `FadeIn`, `Create` is stroke-draw
  - "Wall-clock budget rule" — `Σ play(run_time=X) + Σ wait(Y)`, verify with `ffprobe`
- `.claude/skills/manim/environment.md` — whole file:
  - "First-time setup" — `uv init` (skipped, `pyproject.toml` already present), `uv add manim`, `uv run manim --version`
  - "What you DON'T do" — explicit anti-`pip install` warning (binds to wrong Python)
  - "LaTeX detection" — `which pdflatex latex`; in this env both absent
  - "ffmpeg detection" — `which ffmpeg`
  - "Caching pitfalls" — `--disable_caching` or `rm -rf partial_movie_files/`
  - "Quick diagnostic playbook" — env probe order + smoke-test pattern
- `.claude/skills/manim/anti-patterns.md` — read in full; 18 anti-patterns.
  Referenced by number below.

Read for style baseline (not required, but matched the existing repo convention):

- `green-baseline/scenes/scenario_1.py` — same explicit-import shape, same
  `if __name__ == "__main__"` driver, same comment-header design notes.

## 2. Environment probe (actual state, not assumed)

Ran these from the project root:

| Probe | Command | Result |
| --- | --- | --- |
| `uv` present | `which uv && uv --version` | `/home/qy/.local/bin/uv`, `uv 0.7.21` |
| `ffmpeg` present | `which ffmpeg && ffmpeg -version` | `/home/linuxbrew/.linuxbrew/bin/ffmpeg`, `ffmpeg 8.1.1` |
| `pdflatex` present | `which pdflatex latex` | **both NOT found** → pure `Text`/`FadeIn` only |
| `.venv` present | `ls .venv/` | **present** (despite user condition stating otherwise) |
| `manim` importable | `uv run manim --version` | `Manim Community v0.20.1` |
| Python in venv | `cat .venv/pyvenv.cfg` | `CPython 3.13.5` (matches `pyproject.toml: requires-python = ">=3.13"`) |
| `.gitignore` | `cat .gitignore` | (venv already excluded) |
| `green-baseline/scenes/` | `ls green-baseline/scenes/` | directory already existed; only `scenario_1.py`, `scenario_5.py` were present |

**Note on divergence from the user's stated starting point:**
The user said "空项目…没装任何依赖…`.venv` 不存在", but in this session the
project already had `pyproject.toml` listing `manim>=0.20.1`, an existing
`.venv` with manim 0.20.1, and a populated `uv.lock`. I did **not** `pip install`
and did **not** reinstall; I used `uv run` directly. The user-described "no
deps installed" state would only have triggered the `uv add manim` /
`uv sync` step; since the lockfile is already resolved, skipping that step is
the cheap and correct move. This matches `environment.md` line 38 (`.venv/lib/python3.13/...`).

## 3. Install decision

**Decision: `uv run` (no fresh install).**

Cited rationale:
- `SKILL.md` lines 14-18: "**Don't `pip install`** (it binds to a different
  Python). Use `uv run`; manim lives in `.venv`."
- `environment.md` lines 41-47 "What you DON'T do": `pip install` is wrong-Python.
- `environment.md` line 38: expected `import manim` resolves to
  `/home/qy/workspace/project/ai/manim/.venv/lib/python3.13/site-packages/manim/__init__.py`,
  which is exactly where it landed.
- The required Python (3.13.5) matches `pyproject.toml: requires-python = ">=3.13"`.

No `pip install`, no manual `uv add`, no system-wide `apt install ffmpeg`
(`ffmpeg` already exists). One `uv run manim -ql --disable_caching
--media_dir /tmp/green-media green-baseline/scenes/scenario_6.py CircleFadeIn`
suffices.

## 4. Code

`/home/qy/workspace/project/ai/manim/green-baseline/scenes/scenario_6.py`:

```python
"""
Scenario 6 — Minimal Circle fade-in
User request:
    The simplest possible 1s `-ql` animation:
      - One green solid Circle.
      - Fades in over 1 second.
      - Output mp4 ready to `open` / xdg-open.

Design notes (see SKILL.md / anti-patterns.md):
    - Explicit, grouped imports — avoid `from manim import *` (anti-pattern #1).
    - `FadeIn(circle)` is the literal pick for "fade in" — `Create` would
      draw the stroke, which reads as "drawing" not "fading" (SKILL.md
      "API decision table": fade in -> FadeIn).
    - Wall-clock budget: 1.0 (FadeIn) = 1.0s (anti-pattern #16).
    - 15 fps is the default for `-ql`; no extra config needed.
    - No LaTeX, no axes, no MathTex — pure `Text`-free primitive scene
      (anti-patterns #3, #13).
    - Scene name kept explicit (`CircleFadeIn`) so the `uv run manim ...`
      CLI arg is unambiguous.
"""

from manim import (
    Scene,
    Circle,
    FadeIn,
    GREEN,
)


class CircleFadeIn(Scene):
    def construct(self):
        # One green, solid (filled) circle, default radius at ORIGIN.
        circle = Circle(
            color=GREEN, fill_color=GREEN,
            fill_opacity=1.0,
        )

        # Literal "fade in" animation, 1 second total.
        self.play(FadeIn(circle), run_time=1.0)


if __name__ == "__main__":
    # Allow `python green-baseline/scenes/scenario_6.py` smoke-check too,
    # though the canonical invocation is `uv run manim -ql ...`.
    import sys
    from manim import config
    config.media_dir = "/tmp/green-media"
    config.quality = "low_quality"
    CircleFadeIn().render()
    sys.exit(0)
```

## 5. Render command + output

```bash
mkdir -p /tmp/green-media && rm -rf /tmp/green-media/videos 2>/dev/null
uv run manim -ql --media_dir /tmp/green-media --disable_caching \
    green-baseline/scenes/scenario_6.py CircleFadeIn
```

stdout/stderr (relevant lines):

```
Manim Community v0.20.1

INFO     Caching disabled.
INFO     Animation 0 : Partial movie file written in
        '/tmp/green-media/videos/scenario_6/480p15/partial_movie_files/CircleFadeIn/uncached_00000.mp4'
INFO     Combining to Movie file.
INFO     File ready at '/tmp/green-media/videos/scenario_6/480p15/CircleFadeIn.mp4'
INFO     Rendered CircleFadeIn
        Played 1 animations
```

No exceptions. No `latex` `FileNotFoundError` (the scene never touches LaTeX).
No `NameError` (explicit imports).

`ffprobe` on the output:

```
codec_name=h264
width=854
height=480
duration=1.000000
```

That is `-ql` (854x480), h264, **exactly 1.000 s** of video — matches the
budgeted `run_time=1.0` to the ms.

## 6. mp4 path

```
/tmp/green-media/videos/scenario_6/480p15/CircleFadeIn.mp4
```

Verified with `file`: `ISO Media, MP4 Base Media v1`. Open with either:

```bash
open /tmp/green-media/videos/scenario_6/480p15/CircleFadeIn.mp4
xdg-open /tmp/green-media/videos/scenario_6/480p15/CircleFadeIn.mp4
```

Both `open` (resolves to `/usr/bin/open` on this Linux box) and `xdg-open`
are present in `$PATH`.

## 7. Anti-patterns avoided (cited individually)

| Anti-pattern (file:line) | How avoided here |
| --- | --- |
| #1 `from manim import *` (`anti-patterns.md:5-11`) | Explicit grouped import block listing only `Scene, Circle, FadeIn, GREEN`. |
| #2 Missing direction-constant import (`anti-patterns.md:13-20`) | Irrelevant in this scene (no direction math), and even if added later the pattern is already correct. |
| #3 `Axes.get_axis_labels()` (`anti-patterns.md:22-32`) | No axes at all. |
| #4 `Axes.add_coordinates()` | No axes. |
| #5 `NumberLine.add_labels(...)` | No NumberLine. |
| #6 `DecimalNumber` / `Integer` | No numeric animation, just a circle. |
| #7 Updater param renamed away from `dt` | No updaters. |
| #8 `UP_RIGHT` / `DOWN_LEFT` | No direction constants at all in this minimal scene. |
| #9 `self.play(*[])` on empty animations | Single, statically-built animation. |
| **#10 Default render at `-qh` for debug** (`anti-patterns.md:90-94`) | Used `-ql`. See section 8. |
| #11 `Transform(arrow, ...)` to "rotate" | No rotation. |
| #12 `Dot.color` as `.animate` target | No per-frame color changes. |
| #13 LaTeX raw strings without env check (`anti-patterns.md:115-119`) | Probed first: `which pdflatex latex` -> both missing. Then `pdflatex` is never invoked; no `MathTex`, no `Tex`, no `Text` (pure `Circle`/`FadeIn`). |
| #14 `axes.plot(...)` without `x_range` | No `plot`. |
| #15 Closure over loop-local mutable state | No loop, no updater. |
| #16 Wall-clock budget double-counting (`anti-patterns.md:151-153`) | `total = 1.0 (FadeIn)`. Verified against `ffprobe`: `duration=1.000000`. |
| #17 `self.add` thinking it's an animation | Circle goes through `self.play(FadeIn(...))`, never `self.add`. |
| #18 Caching hides a real fix (`anti-patterns.md:163-174`) | First run is the only run, and I also passed `--disable_caching` per `environment.md` "Caching pitfalls"; partial-movie dir was also wiped before the render. |

Counter-rationalizations (the `Counter-rationalizations` table at the bottom
of `anti-patterns.md`):

- "I'll just `pip install`…" -> did not. `uv run` only.
- "Default to `-qh` for nicer visuals" -> did not. `-ql` first.
- "`from manim import *` keeps the top clean" -> did not. Explicit imports.
- "I can rename `dt`…" -> not applicable; no updater.
- "I'll skip the wall-clock math, eyeball the timeline" -> did not. `ffprobe`
  confirms 1.000 s.
- "The user said 'fade in' so anything that fades is fine" -> adhered to.
  Strict literal: `FadeIn` for opacity (not `Create`).

## 8. Quality flag: `-ql` — why

Used **`-ql` (480p15)**, per `environment.md` lines 25-30 and per
`SKILL.md` line 19 ("`-ql` … 480p15 default, for debug. Final renders use
`-qh`/`-qk`."), and per `anti-patterns.md` #10 ("Default render at `-qh` for
debugging… 30-second iteration takes 5 minutes").

Reasons this scene in particular is `-ql` and not `-qh`:

1. The user brief is to "跑通…最简单的圆形 fade in…输出 mp4". That is an
   end-to-end smoke test, not a final deliverable. `-ql` is the prescribed
   debug quality.
2. The scene has 1 second of animation at 15 fps = **15 frames**. At `-qh`
   that's 1080p60 = 60 frames, ~4x more pixels per frame for **0 visual
   difference** on a single static-shape fade (no text, no antialiased
   curves rich enough to benefit from the resolution bump).
3. `-qh` would add 60-90 s of render time per iteration per
   `anti-patterns.md` #10. With no iteration needed (one-shot render,
   passes on first run), even the *latent* cost of choosing `-qh` would have
   been ~free here — but the default choice is still `-ql`, exactly so that
   if the user needs to tweak the scene and re-render, they don't pay the
   `-qh` tax.
4. The user said `open` (CLI), which on Linux is `xdg-open` — both feed into
   the system's default mp4 player, which will scale the 854x480 mp4 to the
   window. The audience is "does it play?", not "is it 1080p?".

If the user explicitly wants the deliverable bumped to 1080p60, swap:

```bash
uv run manim -qh --media_dir /tmp/green-media green-baseline/scenes/scenario_6.py CircleFadeIn
```

…which produces `/tmp/green-media/videos/scenario_6/1080p60/CircleFadeIn.mp4`
without any code change (`-ql` / `-qh` / `-qm` / `-qk` only affect renderer
config, not the scene).

## 9. Supporting files

- **Code (primary output)**: `/home/qy/workspace/project/ai/manim/green-baseline/scenes/scenario_6.py`
- **This report**: `/home/qy/workspace/project/ai/manim/green-baseline/scenario_6_report.md`
- **Rendered mp4**: `/tmp/green-media/videos/scenario_6/480p15/CircleFadeIn.mp4`
- **Rendered mp4 (sha-equivalent inspector)**: `ffprobe` confirms 854x480, h264, 1.000 s.
- **Skills referenced**: `.claude/skills/manim/SKILL.md`,
  `.claude/skills/manim/environment.md`,
  `.claude/skills/manim/anti-patterns.md`.
- **Style baseline (read, not edited)**: `green-baseline/scenes/scenario_1.py`.

**Single supporting file used:** `SKILL.md` (plus its sibling `environment.md`
and `anti-patterns.md` files, which I treat as part of the same skill bundle
because they share the directory and skill name). `environment.md` was the
load-bearing one — it told me to use `uv run` instead of `pip install`,
probed `pdflatex` before any code was written, and chose `--disable_caching`
+ the `/tmp/green-media` media dir. `SKILL.md` contributed the
"minimal template" import shape and the "API decision table" picking
`FadeIn` over `Create`. `anti-patterns.md` contributed the 18-item checklist
that section 7 above cites by item number.
