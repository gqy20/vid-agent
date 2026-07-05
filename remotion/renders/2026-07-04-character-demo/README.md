# Character Demo

8 秒 Remotion 角色资产探针：展示 `demo-guide` 八方向素材如何由时间线驱动。

## Current

唯一发布版：

```text
renders/current/character-demo.mp4
```

## Layout

```text
2026-07-04-character-demo/
  README.md
  meta.json
  thumbnail.png
  renders/
    current/character-demo.mp4
    candidates/character-demo_probe.mp4
    archive/
    tmp/stills/frame-000.png
    tmp/stills/frame-090.png
    tmp/stills/frame-180.png
```

## Reproduce

```bash
cd remotion
REMOTION_VIDEO_FILTER=character-demo pnpm exec remotion render \
  src/index.ts CharacterDemo \
  renders/2026-07-04-character-demo/renders/candidates/character-demo_probe.mp4 \
  --concurrency=4 --timeout=120000 --muted
```

## Notes

This is a diagnostic asset demo, not the final 30 second story. It intentionally keeps the generated source backgrounds visible so consistency problems are easy to inspect.
