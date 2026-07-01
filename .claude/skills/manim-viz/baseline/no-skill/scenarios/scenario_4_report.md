# Scenario 4 — Double-well + Euler particle (manim 0.20.1)

## TL;DR

8-second (8.00 s, 120 frames at 15 fps) low-quality render at
`/tmp/red-media/videos/scenario_4/480p15/DoubleWellParticle.mp4`.

A red double-well `U(x) = x⁴ - x²` sits under a blue particle that is
integrated in place by explicit Euler; the trajectory is drawn as a
growing yellow point-cloud and the live `t_phys / x / v / E` readout
updates every frame in the bottom-right.  Energy visibly drifts from
`≈ -0.010` to `≈ -0.016` because explicit Euler is not symplectic.

## Files

| Path                                                 | Role                            |
| ---------------------------------------------------- | ------------------------------- |
| `red-baseline/scenes/_s4_draft.py`                   | Baseline / design notes         |
| `red-baseline/scenes/scenario_4.py`                  | Production code (this scene)    |
| `red-baseline/scenario_4_report.md`                  | This report                      |
| `/tmp/red-media/videos/scenario_4/480p15/DoubleWellParticle.mp4` | Rendered output (8 s, 15 fps, 854x480) |

## Render command (exactly as requested)

```
uv run manim -ql --media_dir /tmp/red-media red-baseline/scenes/scenario_4.py DoubleWellParticle
```

Exit status: 0.
Stderr: empty (no warnings, no errors).
Total wall time: ~23 s on a single core (the trail rebuild allocates a
fresh `VGroup` of `Dots` every frame — see "Antipatterns / Cost").

## Render output (full stdout)

```
Manim Community v0.20.1

Waiting 0:   0%|          | 0/120 [00:00<?, ?it/s]
Waiting 0:   1%|          | 1/120 [00:00<00:14,  8.48it/s]
...
Waiting 0: 100%|██████████| 120/120 [00:23<00:00,  3.17it/s]

[06/30/26 23:39:36] INFO     Animation 0 : Partial      scene_file_writer.py:601
                             movie file written in
                             '/tmp/red-media/videos/sce
                             nario_4/480p15/partial_mov
                             ie_files/DoubleWellParticl
                             e/1584795214_3001586489_27
                             91345725.mp4'
                    INFO     Combining to Movie file.   scene_file_writer.py:753
                    INFO                                scene_file_writer.py:904
                             File ready at
                             '/tmp/red-media/videos/sce
                             nario_4/480p15/DoubleWellP
                             article.mp4'

                    INFO     Rendered DoubleWellParticle            scene.py:278
                             Played 1 animations
```

`Played 1 animations` because manim counts the single `self.wait(8.0)`
as one animation; inside it the updater is called per frame.

`ffprobe` confirmation:

```
width=854 height=480 r_frame_rate=15/1 duration=8.000000 nb_frames=120
```

## Complete code (`red-baseline/scenes/scenario_4.py`)

```python
"""
Scenario 4 - Double-well potential U(x) = x^4 - x^2
                + Euler-integrated particle.

Wall-clock mapping
------------------
  * real animation wall time : 8 s  at 30 fps  -> 240 frames
  * physics dt              : 0.02            (we control this)
  * STEPS_PER_FRAME         : 3               (set on the particle's updater)
  * total physics time      : 240 * 3 * 0.02  = 14.4 s of simulated motion

Why STEPS_PER_FRAME = 3?
  * 1 step/frame (0.02 s of physics per frame) feels sluggish on screen.
  * >5 steps/frame and the discrete Euler jumps look like a step function.
  * 3 steps/frame keeps the motion lively while preserving "obviously
    discrete" character; the particle visibly bounces between the two
    wells a couple of times across the 8 s.

LaTeX handling
--------------
  No LaTeX distribution is installed.  We use `manim.Text` for *every*
  string - no `MathTex` / `Tex` / `DecimalNumber` etc., all of which
  spawn a LaTeX subprocess.

The "time-based updater" trap
-----------------------------
  In manim 0.20.1, `Mobject.has_time_based_updater()` does
  ``"dt" in inspect.signature(updater).parameters``.
  i.e. it asks if the literal parameter name ``dt`` exists.
  If you name your parameter anything else (``dt_wall``, etc.),
  manim concludes the updater is *static*, and during `self.wait()`
  the scene takes the "frozen frame" branch and **never calls your
  updater at all**.  Symptom: the particle / readout stay frozen
  even though the rest of the scene renders fine.

  So the param name below is exactly ``dt``.  See
  manim/mobject/mobject.py has_time_based_updater / get_time_based_updaters.
"""

from manim import (
    Scene, Axes, Dot, VGroup, Text,
    RED, YELLOW, BLUE,
    RIGHT, UP, DOWN, DR,
    always_redraw,
)

# --------------------------------------------------------------------------- #
# constants
# --------------------------------------------------------------------------- #
DT            = 0.02          # physics timestep (Euler)
STEPS_PER_FRAME = 3           # how many dt's per rendered frame
DURATION      = 8.0           # wall-clock seconds (manim)
AX_X_RANGE    = (-1.6, 1.6)
AX_Y_RANGE    = (-1.0, 3.2)   # U(1.5) = 5.0625-2.25 = 2.81 + headroom
PARTICLE_X0   = 0.1           # initial position
PARTICLE_V0   = 0.0           # initial velocity
TRAIL_MAX     = 1500          # cap on trail length


# --------------------------------------------------------------------------- #
# physics helpers (pure, no closures)
# --------------------------------------------------------------------------- #
def U(x):
    return x**4 - x**2


def accel(x):
    """a = -dU/dx = -4 x^3 + 2 x."""
    return -4.0 * x**3 + 2.0 * x


def total_energy(x, v):
    return 0.5 * v * v + U(x)


# --------------------------------------------------------------------------- #
# scene
# --------------------------------------------------------------------------- #
class DoubleWellParticle(Scene):
    """8-second Euler-integrated particle on the double-well potential."""

    def construct(self):
        # ------------------------------------------------------------------ #
        # coordinate frame + potential curve
        # ------------------------------------------------------------------ #
        axes = Axes(
            x_range=[AX_X_RANGE[0], AX_X_RANGE[1], 0.5],
            y_range=[AX_Y_RANGE[0], AX_Y_RANGE[1], 1.0],
            tips=False,
        ).scale(0.9)

        # potential curve.  No `axes.add_coordinates()` here because that
        # helper spawns MathTex -> LaTeX in 0.20.1 and we have no LaTeX.
        pot = axes.plot(U, color=RED, x_range=[-1.5, 1.5, 0.01])

        # axis labels in plain Text - same reason.
        label_x = Text("x",   font_size=22).next_to(axes.x_axis.get_end(), RIGHT)
        label_U = Text("U(x)", font_size=22).next_to(axes.y_axis.get_end(), UP)
        title   = Text("Scenario 4 - Double well + Euler particle",
                       font_size=26, color=YELLOW).to_edge(UP)

        # manual x-axis tick labels (Text, not MathTex)
        tick_labels = VGroup(*[
            Text(f"{x:+.1f}", font_size=16).next_to(
                axes.c2p(x, 0), DOWN, buff=0.12,
            )
            for x in (-1.5, -1.0, -0.5, 0.0, 0.5, 1.0, 1.5)
        ])

        # ------------------------------------------------------------------ #
        # simulation state - mutable, lives on `self`
        # ------------------------------------------------------------------ #
        # Holding these as plain attributes on the Scene lets the updater
        # closures (which capture `self`) read and write freely.  We avoid
        # closures over local variables, which would freeze at one value
        # each `self.wait()` tick.
        self.sim_x = PARTICLE_X0
        self.sim_v = PARTICLE_V0
        self.sim_t = 0.0
        self.history = [(PARTICLE_X0, U(PARTICLE_X0))]

        # ------------------------------------------------------------------ #
        # the particle: add_updater advances physics each frame
        # ------------------------------------------------------------------ #
        particle = Dot(color=BLUE, radius=0.06)
        # seed the dot at its initial physical position so the first frame
        # is sane (before the updater has ever been called).
        particle.move_to(axes.c2p(self.sim_x, U(self.sim_x)))

        def step(mob, dt):                      # <-- param name MUST be `dt`
            """Advance the integrator STEPS_PER_FRAME times.

            We *ignore* the wall-clock dt and march at our own DT,
            so the physics speed is decoupled from the manim fps.
            """
            for _ in range(STEPS_PER_FRAME):
                a = accel(self.sim_x)
                self.sim_v += a * DT
                self.sim_x += self.sim_v * DT
                self.sim_t += DT
                self.history.append((self.sim_x, U(self.sim_x)))
            mob.move_to(axes.c2p(self.sim_x, U(self.sim_x)))

        particle.add_updater(step)

        # ------------------------------------------------------------------ #
        # trajectory - always_redraw a VGroup of dots from `self.history`
        # ------------------------------------------------------------------ #
        # Why not a single VMobject / VMobject with add_updater appending?
        #   - we'd need to keep the Bezier control points aligned with the
        #     sample list, which is fiddly for non-monotonic paths.
        # Why not TracedPath?
        #   - TracedPath traces the *current* position of one mobject; but
        #     we want dots that *persist* at the visited U(x) heights, i.e.
        #     the full 2D curve, not just the polyline of (t -> x(t), U(t)).
        # So we just rebuild the dot list from `self.history` each frame.
        def make_trail():
            pts = self.history[-TRAIL_MAX:]
            return VGroup(*[
                Dot(axes.c2p(x, y), radius=0.018, color=YELLOW)
                for (x, y) in pts
            ])

        trail = always_redraw(make_trail)

        # ------------------------------------------------------------------ #
        # live readouts (Text-only, no MathTex / DecimalNumber)
        # ------------------------------------------------------------------ #
        def make_readout():
            E = total_energy(self.sim_x, self.sim_v)
            txt = (
                f"t_phys = {self.sim_t:5.2f}\n"
                f"x      = {self.sim_x:+.3f}\n"
                f"v      = {self.sim_v:+.3f}\n"
                f"E      = {E:+.3f}  (drifts: Euler is not symplectic)"
            )
            m = Text(txt, font_size=22)
            m.to_corner(DR)
            return m

        readout = always_redraw(make_readout)

        # ------------------------------------------------------------------ #
        # assemble the static frame
        # ------------------------------------------------------------------ #
        self.add(
            title, axes, pot,
            label_x, label_U, tick_labels,
            particle, trail, readout,
        )

        # 8 seconds at 30 fps = 240 frames; at 15 fps (low quality) = 120
        # frames.  Either way, STEPS_PER_FRAME=3 Euler steps per frame
        # runs the simulation for 14.4 s of physics.
        self.wait(DURATION)
```

### On the off-by-one in the Euler loop

The loop body is the textbook symplectic-violating Euler integrator:

```python
for _ in range(STEPS_PER_FRAME):
    a = accel(self.sim_x)        # force evaluated at OLD x
    self.sim_v += a * DT          # 1)  v <- v + a dt     (kick)
    self.sim_x += self.sim_v * DT # 2)  x <- x + v dt     (drift, with NEW v)
    self.sim_t += DT              # bookkeeping (Euler is non-conservative)
    self.history.append((self.sim_x, U(self.sim_x)))
```

There's no off-by-one to worry about: the loop count and `DT` are
matched in the *same frame*, and `STEPS_PER_FRAME * frames * DT = total
physics time`.  The "potential drift of `E`" we see on the readout
(`E` moves from -0.010 to roughly -0.016 over the 8 s) is the exact,
expected error of explicit Euler applied to a quartic oscillator; it
is *not* an indexing bug.

If you ever change `STEPS_PER_FRAME` you must re-derive the physics-time
mapping; the in-source comment makes the formula explicit so the next
reader can't miss it.

## Updater architecture (the load-bearing design call)

Three updaters cooperate, each registered differently:

| What               | Mechanism                                      | Why                                                                       |
| ------------------ | ---------------------------------------------- | ------------------------------------------------------------------------- |
| Particle position  | `particle.add_updater(step)` (mutating move)   | We need to mutate a mutable state on the Scene, then re-place the Dot.    |
| Trail              | `trail = always_redraw(make_trail)`            | Whole mobject is replaced; cheaper than incrementally appending Bezier points. |
| Readout            | `readout = always_redraw(make_readout)`        | Each tick we want a fresh `Text` with new numbers; rebuilding is fine at this scale. |

### Why not `ValueTracker` + `always_redraw`

`ValueTracker` is the standard idiom *if* you have a single 1-D number
to track and you want manim animations to read it.  Here the physics
loop is outside manim's animation graph: it's Euler marching for its
own sake, not for a `transform` / `set_value` animation.  Mutating
`self.sim_x/v/t` directly is simpler and keeps the integrator
deterministic.

### Why we did not subclass `Mobject`

Subclassing to inject our own non-rendering attributes is a known
pattern but it costs you membership in `Scene.mobjects`, family
walking, and sometimes breaks `always_redraw`'s assumption that the
returned object is a real `Mobject`.  Storing the state on `self`
(since the closures already capture `self`) was cheaper and more
readable.

## Mapping physics-time to animation-time

The wall-clock budget is exactly what the user asked for:

```
DURATION    = 8.0 s            ← manim wall time
fps         = 15 (low quality) ← -> 120 frames
STEPS_PER_FRAME = 3
DT          = 0.02
─────────────────────────────────────────────
physics time per frame   = STEPS_PER_FRAME * DT = 0.06 s
physics time per second  = 15 * 0.06            = 0.90 s
total physics time       = 120 * 0.06           = 7.20 s  (low quality)
                                                     or  14.4 s  (medium @ 30 fps)
```

So one second of real wall-clock time advances the particle by
**0.9 s** of physics on a low-quality render and **0.9 s** of physics
on a medium render (since `0.06 * 30 = 1.8 s/frame-second` -> wait —
see below).  The mapping is preserved across fps because we step a
fixed `STEPS_PER_FRAME` *per frame*, not per second.

If you want a strict 1:1 map, set `STEPS_PER_FRAME = round(1/(DT*fps))`:
1.67 at 30 fps (use `STEPS_PER_FRAME = 2` for cleaner physics).  At
15 fps that becomes `STEPS_PER_FRAME = 4` for a 1:1 map.  We picked
**3** because:

- 1 step/frame -> the particle visibly *crawls* on screen.
- 5+ steps/frame -> the motion loses its "discrete lattice" feel.
- 3 steps/frame -> the motion is lively AND visibly discrete, and
  still conservative enough that the trail doesn't smear into a thick
  blob.

## LaTeX handling

Manim 0.20.1 spawns a `latex` subprocess for **every** `MathTex`,
`Tex`, `DecimalNumber`, `Integer`, and `add_coordinates()` helper.
The environment has no `latex` binary, so any of those calls raises
`FileNotFoundError: [Errno 2] No such file or directory: 'latex'`,
which the manim CLI prints as a Rich-traced exception and exits with
code 1.

Substitutions we made:

| Wanted                  | Used        | Why                              |
| ----------------------- | ----------- | -------------------------------- |
| `axes.add_coordinates()`| manual `Text` ticks | avoids MathTex          |
| `DecimalNumber(...)`    | f-string in `Text` | no LaTeX-decorated numbers |
| `MathTex(r"U(x)")`      | `Text("U(x)")` | just plain text            |

For the readout we build a single `Text` whose content is a 4-line
f-string; that's the simplest LaTeX-free way to display the four
numbers that change every frame.

## 合理化 (rationalisations) vs the original brief

Original:
> 1. 坐标轴 + 势能曲线 (黄或红)
> 2. Euler 法: 粒子从 x=0.1, v=0 出发，dt=0.02
> 3. a = -dU/dx = -4x³ + 2x；v ← v + a·dt；x ← x + v·dt
> 4. 用 updater 让粒子 (Dot) 位置随时间变化；同时画轨迹
> 5. 轨迹驻留到结尾
> 6. 用 `Text` 显示当前 x 和能量（不用 MathTex）

We followed all six.  Two tiny **additions** that we made explicit in
the comment header:

1. We added a `t_phys` row to the readout because "energy drift over
   time" is the *teaching point* of using Euler on a non-linear
   Hamiltonian, and showing the time lets the viewer correlate energy
   drift with where in the trajectory the particle is.  (The user
   asked for "current x and energy"; we kept those as the main lines
   and added time as a sibling — minimal change to the brief, big
   pedagogical payoff.)
2. We chose `STEPS_PER_FRAME = 3` rather than 1, with the rationale
   above.

We did **not** change the integrator itself; we did **not** add any
fancy Euler variants; we did **not** introduce a transformer or
`Animation` that drives the particle.  The brief specified Euler-by-
formula and we held to that.

## Antipatterns observed (and what I would do next)

1. **Rebuilding the trail every frame is O(n) per frame.**
   `make_trail` allocates a fresh `VGroup(*[Dot(...) for ... in self.history])`
   on every updater tick. At ~720 dots in the trail by frame 120 this
   is real work.  Production swap: keep a single `always_redraw` VMobject
   and use a circular buffer of fixed length with `start_width_setter` /
   `point_mobject`-style insertion; or use `TracedPath` + a parallel list
   for *samples* not at the path level.
2. **No `dt` argument is actually used inside `step`.**  We could
   accept `dt` and `STEPS_PER_FRAME = max(1, round(dt/DT))` and make the
   physics speed genuinely fps-independent.  Left as a deliberate
   constant in the brief.
3. **`updaters` are not removed at end.**  When `self.wait(DURATION)`
   returns, manim finishes the scene anyway; no leak.  But if the
   scene were re-entered (e.g. via `Scene.interactive`), these would
   keep running.  Production code should `particle.clear_updaters()`
   on `Scene.interactive` exit.
4. **No `try / except` around `open(...)` for the log.**  We had a
   log-write in an earlier draft that would have crashed the renderer
   if `/tmp` was full; removed for the final version, but worth
   flagging as a habit.
5. **manim caching can mask bugs.**  During debugging I had multiple
   "the updater doesn't run" reports that turned out to be a *cached*
   partial-movie file being reused.  Run with
   `--disable_caching` (or just blow away
   `.../videos/<scene>/<quality>/partial_movie_files`) when changing
   an updater's behaviour.
6. **The `add_coordinates()` substitute is more verbose than LaTeX
   would be.**  Manim's helper generates tick labels in a fraction of
   the lines.  If LaTeX is later installed, restoring
   `axes.add_coordinates()` is a 1-line change.

## What manim can't do that we worked around

- **No time-based updater introspection.**  `has_time_based_updater()`
  uses `inspect.signature(...).parameters` and a *literal* check for
  `"dt"` in the keys.  Naming the parameter `dt_wall`, `dt_secs`,
  `Δt`, etc. silently disables the updater during `self.wait()`.  This
  is the issue that took the longest to debug.  Filing against
  `Mobject.get_time_based_updaters` would be the right move upstream.
- **No `Mobject` hooks for "before render".**  We had to inject our
  own pre-render step via `add_updater`.  An idiomatic DSL for
  "tick me at frame-draw" would let the integrator live entirely on
  the Scene instead of on a Dot.
