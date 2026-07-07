# Font Assets

This directory is a local cache for fonts referenced by the Git course typography tokens.
Font binaries are intentionally ignored by git; regenerate them with:

```bash
scripts/fetch-git-course-fonts.sh
```

- `candidates/`: local-only candidate font cache for visual comparison. It is ignored by git because full font archives are large.
- `NotoSansCJK-Regular.ttc`: primary CJK sans fallback for `FONT.sans`.
- `NotoSansCJK-Bold.ttc`: heavy CJK sans weights for titles.
- `NotoSans-Regular.ttf`: fallback used when `Noto Sans SC` is not installed as a separate family.
- `Inter-Regular.otf`: Latin fallback for `FONT.sans`.
- `Inter-Bold.otf`: Latin bold fallback for `FONT.sans`.
- `Inter-Black.otf`: Latin black fallback for `FONT.sans`.
- `JetBrainsMono-Regular.ttf`: primary mono font for code, terminal text, `hash`, and `graph`.
- `JetBrainsMono-Bold.ttf`: mono bold weights for labels and graph annotations.

`FONT.brand` currently uses selected MiSans Heavy subsets for the generic intro title.
The active font-family tokens are defined in `remotion/src/videos/git-course/palette.ts`.
The render-loaded font faces are registered in `remotion/src/fonts.css` and served from
`remotion/public/fonts/`.
