# qingyu_ge 品牌片头

5s 诗意科技风个人品牌片头(青紫渐变 + 粒子 + 羽毛 + 名称辉光)。

![thumbnail](thumbnail.png)

## 重现

```bash
cd remotion && pnpm install
pnpm exec remotion render BrandIntro \
  renders/2026-06-30-brand-intro/renders/final/brand-intro_1080p30_$(date +%Y%m%d-%H%M%S).mp4 \
  --concurrency=4
```

源码 `src/BrandIntro.tsx`;`defaultProps` 里 name/tagline/sub 可改。详见 meta.json。
