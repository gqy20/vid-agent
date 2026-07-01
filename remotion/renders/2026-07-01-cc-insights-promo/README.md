# cc-insights CLI 宣传片

72 秒终端风宣传片,介绍 [cc-insights](https://github.com/gqy20/cc-insights)
(Claude Code 使用诊断 CLI)。

![thumbnail](thumbnail.png)

## 分镜(8 场景,2086 帧 @ 30fps)

| 时间 | 场景 | 内容 |
|------|------|------|
| 0–8s | 痛点钩子 | 乱码 JSONL 滚动 → "为什么变慢/变贵/老失败?" |
| 8–13s | 品牌亮相 | 折线 logo 描边 + `cc-insights` 辉光浮现 |
| 13–26s | `rec` | 根因 + 证据 + 下钻命令 |
| 26–35s | `tok` | 按项目动态条形图 |
| 35–44s | `cmd` | 命令族失败率 + 高风险命令告警 |
| 44–54s | `web` | Dashboard 卡片 + 趋势折线 |
| 54–65s | 卖点 | 四张特性卡 |
| 65–72s | CTA | logo + 命令 + GitHub 地址 |

## 重现

```bash
cd remotion
pnpm install
# 抽帧自检
scripts/check-frames.sh CCInsightsPromo 90 470 880 1200 1500 1800   # 见 skill
# 终渲
pnpm exec remotion render CCInsightsPromo \
  renders/2026-07-01-cc-insights-promo/renders/final/cc-insights-promo_1080p30_$(date +%Y%m%d-%H%M%S).mp4 \
  --concurrency=4
```

源码:`src/CCInsights.tsx`(配色/字体/缓动常量在文件顶部)。详见 meta.json。
