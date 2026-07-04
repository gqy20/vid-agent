# 抽帧自检 —— 渲染前的画面检查 SOP

## 为什么有这一步

全片渲染要几分钟,单帧抽帧只要几秒。等多分钟全片渲染**之后**才发现排版 bug
(重叠、溢出、时机错、配色错),那一整次渲染就白费了。务必先逐场景检查一帧。

## 何时抽帧

- 写完或重构任何场景后,首次全片渲染前。
- 精修一遍(字体/缓动/转场)后——再检查同样几帧。
- 改过时间线、转场、外部视频资产、字幕层、截图遮罩后,必须抽转场前后连续帧。
- 用户指出具体秒点“效果差”时,先抽该秒点附近帧,再判断是场景本身还是转场叠层。
- 仅在 Studio 里已确认过的琐碎常量改动可跳过。

## 操作流程

1. 每个场景挑一帧**代表帧**——该场景完全显示(非转场中)的时刻。若某场景在时间轴
   偏移 `from`、入场约 40 帧完成,用 `from + 60`。
2. 渲抽帧:
   ```bash
   pnpm exec remotion still <CompId> out/check/f<N>.png --frame=<N>
   # 官方廉价模式:加 --scale=0.25 出缩略图
   ```
   或批量:`scripts/check-frames.sh <CompId> 90 300 470 880 1200`。
3. 逐张打开 PNG 检查(官方渲染前自查问题):
   - 主信息能否被快速读到?
   - 有没有一个明确的视觉焦点?
   - 有无元素互相贴着、重叠、或溢出安全边距?
   - 这一帧若只看不到 1 秒,还说得通吗?
4. 对每个转场不只抽中点,至少抽 `cut-6 / cut / cut+6 / cut+12`。高密度 UI 到高密度 UI
   还要做 contact sheet,确认没有双曝光、文字重影、截图互相压住。
5. 外部资产(Manim/Lottie/Video)要抽**嵌入 Remotion 后**的 still。只看资产单独输出不够。
6. 修 → 再抽 → 重复。通过后才跑全片渲染。

用户给出具体秒点时,用 encoded mp4 先复现问题:

```bash
mkdir -p /tmp/check
for t in 19.5 20.0 20.5 21.0; do
  ffmpeg -hide_banner -loglevel error -y -ss "$t" -i out.mp4 -frames:v 1 "/tmp/check/t${t}.jpg"
done
```

如果要看连续变化,用 frame select + tile 做 contact sheet:

```bash
ffmpeg -hide_banner -loglevel error -y -i out.mp4 \
  -vf "select='eq(n,594)+eq(n,600)+eq(n,609)+eq(n,618)',scale=640:-1,tile=4x1" \
  -frames:v 1 /tmp/check/contact.jpg
```

## 全片渲染之后

从编码好的 mp4 抽开头/中间/结尾帧和关键转场帧,确认没有结尾被截、溢出残留、
转场双曝光或字幕/overlay 编码后变脏:

```bash
ffmpeg -ss 0  -i out.mp4 -frames:v 1 out/check/start.png -y
ffmpeg -ss 35 -i out.mp4 -frames:v 1 out/check/mid.png   -y
```

## 常见发现

| 发现 | 典型原因 |
|---|---|
| 元素压在背景乱码/文字上 | 某层在下一个揭示前没压暗/退场 |
| 文字溢出画面边缘 | 字号超出安全边距;缩短文案或拆分场景 |
| 某揭示出现太早/和别的一起出现 | 嵌套 `Reveal` 的 delay 小于其父级 |
| 转场帧出现硬跳 | 把 `TransitionSeries.Transition` 包进了组件(必须是直接字面子元素) |
| 转场帧出现双重标题/双重截图 | 高密度场景用了 crossfade;改硬切、短黑场或先退场 |
| 遮罩/高亮没有压到目标区域 | 父容器缺 `position: relative` 或稳定宽高 |
