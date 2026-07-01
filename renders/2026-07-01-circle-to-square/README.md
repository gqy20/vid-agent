# 2026-07-01-circle-to-square

**Title:** Blue circle morphs into red square
**Created:** 2026-07-01
**Scene class:** `ShapeMorph`
**Tags:** geometry, primitives, demo

## What is this

5-second animation: a blue solid circle smoothly morphs into a red solid
square, with the center held fixed. A persistent `Text("Shape morph")`
sits at the top throughout. Used as the first sanity project under the
`renders/` layout convention.

## Layout

```
2026-07-01-circle-to-square/
├── meta.json                 # task, env, renders, reproduce
├── README.md                 # this file
├── thumbnail.png             # mid-frame preview (1920x1080)
├── src/
│   └── shape_morph.py        # the Scene
└── renders/
    ├── debug/
    │   └── shape_morph_480p15_20260701-000134.mp4   # 5.07s, 42 KB
    └── final/
        └── shape_morph_1080p60_20260701-000134.mp4 # 5.00s, 190 KB
```

## Reproduce

From the project root:

```bash
# Debug (854x480, fast iteration)
uv run manim -ql --media_dir renders/debug/_build \
    src/shape_morph.py ShapeMorph

# Final (1920x1080, export-quality)
uv run manim -qh --media_dir renders/final/_build \
    src/shape_morph.py ShapeMorph
```

After each render, the produced mp4 lands in `renders/debug/_build/videos/shape_morph/...`.
Move it to the timestamped filename and clean up `_build/`:

```bash
mv renders/debug/_build/videos/shape_morph/480p15/ShapeMorph.mp4 \
   renders/debug/shape_morph_480p15_$(date +%Y%m%d-%H%M%S).mp4
rm -rf renders/debug/_build
```

(See `meta.json:renders[*]` for the recorded version of this same workflow.)

## Why these flags

- `-ql` debug → loop fast; ~3 s per render at this size.
- `-qh` final → 1080p60, ~30 s. Reserve for when the scene is locked.
- `--media_dir renders/<role>/_build` keeps the project tree clean (manim
  would otherwise drop `media/videos/...` into the project root).

## Tested failure modes avoided

This scene is small enough that the only failures come from import
completeness. The skill's `api-cheatsheet.md` "Required base imports"
template was used at the top of `src/shape_morph.py`.
