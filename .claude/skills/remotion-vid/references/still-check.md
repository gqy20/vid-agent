# 抽帧自检 —— 渲染前的画面检查 SOP

## 为什么有这一步

全片渲染要几分钟,抽帧只要几十秒。等多分钟全片渲染**之后**才发现排版 bug
(重叠、溢出、时机错、配色错),那一整次渲染就白费了。

采样率、边界窗口和 contact sheet 尺寸属于项目审查策略；没有项目策略时，建议从**每秒 2 帧**
开始。代表帧只能用于开发中快速定位,不能替代连续抽帧;动画、
字幕、指针、终端缩放和转场都必须用 encoded mp4 的 2fps 抽帧检查。

## 何时抽帧

- 写完或重构任何场景后,首次全片渲染前。
- 精修一遍(字体/缓动/转场)后——再检查同样几帧。
- 改过时间线、转场、外部视频资产、字幕层、截图遮罩后,必须抽转场前后连续帧。
- 用户指出具体秒点“效果差”时,先抽该秒点附近帧,再判断是场景本身还是转场叠层。
- 用户指出截图/图表/Manim 上的框位或标注不准时,必须从**最终 mp4**抽该秒点附近帧复核;
  Remotion still 只用于快速迭代,不能替代最终编码画面检查。
- 仅在 Studio 里已确认过的琐碎常量改动可跳过。

## 操作流程

1. 开发中可先挑每个场景一帧**代表帧**——该场景完全显示(非转场中)的时刻。若某场景在时间轴
   偏移 `from`、入场约 40 帧完成,用 `from + 60`。
2. 渲抽帧:
   ```bash
   pnpm exec remotion still <CompId> out/check/f<N>.png --frame=<N>
   # 官方廉价模式:加 --scale=0.25 出缩略图
   ```
   或批量:`scripts/check-frames.sh <CompId> 90 300 470 880 1200`。
3. 每个片段渲染成 mp4 后,必须按**每秒 2 帧**从 encoded mp4 抽连续帧:

   ```bash
   ffmpeg -hide_banner -loglevel error -y -i out.mp4 -vf fps=2 /tmp/check/f_%04d.jpg
   ffmpeg -hide_banner -loglevel error -y -i out.mp4 \
     -vf "fps=2,scale=960:-1,tile=5x1" /tmp/check/contact_2fps_%03d.jpg
   ```

   或用脚本:

   ```bash
   .claude/skills/remotion-vid/scripts/check-frames.sh --video out.mp4 /tmp/check
   ```

4. 逐张打开 PNG/JPG 和 contact sheet 检查。contact sheet 每页最多 5 帧,不要为了少文件把
   单帧缩得太小:
   - 主信息能否被快速读到?
   - 有没有一个明确的视觉焦点?
   - 有无元素互相贴着、重叠、或溢出安全边距?
   - 这一帧若只看不到 1 秒,还说得通吗?
   - 高亮框是否圈住了正确语义单元,而不是只圈住相邻数字、表头或空白?
5. 对每个转场不只抽中点,至少抽 `cut-6 / cut / cut+6 / cut+12`。高密度 UI 到高密度 UI
   还要做 contact sheet,确认没有双曝光、文字重影、截图互相压住。
6. 外部资产(Manim/Lottie/Video)要抽**嵌入 Remotion 后**的 still。只看资产单独输出不够。
7. 修 → 再抽 → 重复。通过后才跑全片渲染。

自动化管线应把 overview、连续采样和媒体指标等独立扫描并行执行，再统一生成 manifest 与
verdict。verdict 必须绑定被审 candidate 的 SHA 和策略版本；只有 `pass` 才能晋升。contact
sheet 可一次 montage 批量生成，原始帧若不是审查证据默认清理。

用户给出具体秒点时,用 encoded mp4 先复现问题:

```bash
mkdir -p /tmp/check
for t in 19.5 20.0 20.5 21.0; do
  ffmpeg -hide_banner -loglevel error -y -ss "$t" -i out.mp4 -frames:v 1 "/tmp/check/t${t}.jpg"
done
```

若问题是“23s/24s 的框不准”这类框位问题,至少抽 `t-0.5/t/t+0.5/t+1.0`;
如果是高亮随转场变化,再加 contact sheet。修正原则:

- 圈过滤条件:只圈条件行,不要连表头一起圈。
- 圈行级归因:框住对象名和相关指标整行,不要只圈右侧某个数字。
- 圈列级指标:必须包含列名或用其他画面上下文让列含义明确。
- 不在截图上放解释性文字 badge;需要说明时放到截图外的标题/正文区域。
- 修改后先用 Remotion still 快速看,再从新 final mp4 抽同一组秒点确认。

如果要看连续变化,默认用 2fps contact sheet。只在定位某个精确问题时,才用
frame select + tile 做更小范围的 contact sheet:

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
| 框位“看起来有框但不准” | 框住了视觉相邻区域,但没有覆盖语义单元;按行/列/条件重新定位 |
