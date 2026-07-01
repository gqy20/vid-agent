# 抽帧检查 — 渲染后 Debug SOP

> 每个 Scene 都以一次抽帧检查收尾。**没有通过 checklist 的 Scene 不能算"完成"。**
> 这是最初 skill 漏掉的一半。`anti-patterns.md` 教怎么写，下面这份教怎么看。

## 为什么存在

skill 是 TDD 文档。它抓 typo（`NameError`）、错 API（`MathTex`→`FileNotFoundError`）、silent-freeze（updater 形参非 `dt`）。但这些是*运行时*检查。还有第二类 bug 不崩——只是看着不对：

- `Text().shift()` 让文字偏心，字面"居中"是错觉
- 彩色块只盖下半，吞了副标题
- 6 张卡的网格横向溢出，因为 `card_w` 太大
- polyline x 范围不对称，画出来偏右

这些 bug**不崩**也**不触发反模式检测**。只有看像素才暴露。抽帧检查就是抓它们的程序。

## 何时抽

| 阶段 | 触发 | 怎么做 |
| --- | --- | --- |
| **每个 Scene 上 concat 前** | `-ql` 渲染成功后 | 跑 `scripts/extract_frames.sh`，逐图看 |
| **每次 fix 迭代后** | 改完 Scene | 重抽 + 重过 13 条 checklist |
| **最终 sanity** | `-qh` 渲染完 | 每 Scene 抽一帧，约 5 分钟 |

如果迭代时 Scene 被分到多次 debug 跑，只有 `.py` 真正改动的那个 Scene 需要重抽帧。

## 抽哪些帧

对时长 `D` 秒的 Scene，**5 帧**抽样：

| t (秒) | 用途 |
| --- | --- |
| `D * 0.10` | intro 黑屏刚结束 |
| `D * 0.30` | 第一个大视觉登场 |
| `D * 0.50` | **中点**——最大捕获窗口 |
| `D * 0.75` | 后三分之一，淡出前 |
| `D * 0.90` | 最终稳定态 |

4 秒 Scene：抽 `0.4, 1.2, 2.0, 3.0, 3.6`。

**中点非可选**。0.10 与 0.90 能抓到单帧中点漏掉的 intro/tail bug。

## 用 `scripts/extract_frames.sh`

```bash
# 用法
scripts/extract_frames.sh <mp4_path> <output_dir> [t1 t2 t3 ...]

# 例：4 秒 Scene
scripts/extract_frames.sh renders/debug/s04_reveal_480p15_20260701-fix.mp4 frames/s04 0.4 1.2 2.0 3.0 3.6

# 或传比例：0.10 0.30 0.50 0.75 0.90
scripts/extract_frames.sh renders/debug/s04_reveal_480p15_20260701-fix.mp4 frames/s04 0.10 0.30 0.50 0.75 0.90
```

脚本自动命名输出为 `{Scene}_{ms}ms.png`（如 `s04_reveal_2000ms.png`）便于扫读。

## 先跑自动审计（frame_audit.py）

抽帧眼检之前，先用 `frame_audit.py` 自动扫一遍**可量化的几何问题**——
它读渲染期采集的真实 mobject 包围盒，检出画面溢出（blocking）、对象重叠 / 拥挤（advisory），
零人眼、可进 CI、可阻断。

**采集端**（scene.py 启用，渲染期自动记录包围盒）：

```python
from bbox_audit import AuditedScene
class MyScene(AuditedScene):   # 继承即可，每个 play/add/wait 后自动快照
    ...
```

`render_scene.sh` 已自动 `export PYTHONPATH`，直接 import；手动 `uv run manim` 时请
`PYTHONPATH=<skill>/scripts`。默认写到 `cwd/_bbox_audit.jsonl`，用环境变量 `BBOX_AUDIT_OUT` 覆盖。

**在线溢出自检（可选）**：设 `BBOX_AUDIT_ASSERT=warn`（渲染期溢出 → stderr 提示，不中断）或 `=1`（溢出 → RuntimeError 中断，fail-fast）。用官方 `is_off_screen()`，与下面的离线 `frame_audit` 互补——一个 fail-fast、一个事后批量审。

**审计端**（渲染后）：

```bash
uv run python scripts/frame_audit.py renders/.../_bbox_audit.jsonl
uv run python scripts/frame_audit.py --strict   # advisory 也当阻塞（CI 紧线时）
```

退出码：`0` 通过 / `1` 有 blocking（溢出 = 必被切边）/ `2` 解析失败。

**分工——两者互补，不可互相替代：**

- `frame_audit` 抓**几何**：溢出、重叠、拥挤（对应 13 条里的 #6 #7）。机器读坐标，精确。
- 下面的人眼 checklist 抓**语义**：#1 居中错觉、#9 动词切换时机、#11 品牌色语义、#13 末帧稳定。
  这些是 frame_audit 看不到的"意思对不对"。

**自动审计先行，人眼收尾。**

## 结构图 debug（index_labels / print_family）

13 条查的是**几何 / 语义**。还有一种 bug：操作 `tex[0][8:12]` 这类切片时索引对不上画面——改错字了。manim 自带两个工具（`manim.utils.debug`）直接看结构：

```python
from manim import index_labels, print_family

self.add(index_labels(my_tex))   # 画面上给每个 submobject 贴数字标签
print_family(my_vgroup)            # 终端打印 mobject 树（含 id）
```

**注意：**

- **依赖 LaTeX**：`index_labels` 用 `Integer` → `MathTex`。仅 `check_latex.sh` exit 0 时可用；LaTeX 不可用时只能用 `print_family`（纯文本，零 LaTeX 依赖）。
- **与 frame_audit 互斥**：`index_labels` 加的数字标签会被 `bbox_audit` 采进画面，引入假的 overflow / overlap（实测一次叠加让 overflow 从 1 涨到 2）。**debug 结构时用它，审布局时去掉它**，别同时跑。

## 13 条 checklist

每张 PNG 都要从顶到底扫一遍：

### 几何——"数学对吗？"

- [ ] **1. 居中文字真的居中了吗？** `Text().shift()` 不会居中（左 baseline 锚定）。要居中用 `Text().move_to([0, y, 0])`。
- [ ] **2. polyline x 范围对称到 0 吗？** `x_min = -2.4`, `x_max = +1.6` 的视觉中心是 `x = -0.4`，不是 0。要重平衡。
- [ ] **3. 峰点 / 标记是否在 polyline 顶点？** 不飘、不偏移。
- [ ] **4. 卡片几何装得下内容？** 经验：32pt 下 5 位数字要 `card_w ≥ 4.5` unit。先缩字号，后扩宽。
- [ ] **5. 色块盖住了它该盖的字？** 副标题、数值、标签——所有被色块背的对象都在块 y 范围内。

### 布局——"画布装得下吗？"

- [ ] **6. 元素被画布边切了吗？** 默认画布 `8 × 14.22` unit（`-7.1` 到 `7.1` 横，1080p60 下 `-4` 到 `4` 纵）。超界 = 屏外。
- [ ] **7. 两个不重叠的物体飘到一块了？** `next_to` 链跨迭代时常发生。
- [ ] **8. 留白是刻意的还是意外？** 6 卡网格中如果只显 3 个，循环在动画中——0.50 时应该都到位。

### 视觉语义——"意思对吗？"

- [ ] **9. 动词切换时正好在淡出窗口？** s05 类循环动词段，中点可能赶上空白。中点帧要看是字满色态。
- [ ] **10. 数字 / 标签在最终大小下可读？** 1080p 导出时 `font_size=20` 可能糊。
- [ ] **11. 品牌色是强调还是铺满？** 橙/黄应高亮，不应填。

### 音频 / 时长——"秒数对吗？"

- [ ] **12. 时长预算匹配？** `Σ run_time + Σ wait` 应等于设计目标。`ffprobe -show_entries format=duration` 验证。
- [ ] **13. 序列在稳定帧上结束？** 末 5 帧应视觉相似；若末帧有未完成的 fade，延长末尾 `wait`。

## 常见修法

看到 bug 时，多数情况是这几类：

| 症状 | 修法 |
| --- | --- |
| 文字左/右偏离中心 | `Text(...).shift(UP * y)` → `Text(...).move_to([0, y, 0])` |
| 色块太小 / 漏副标题 | 块全屏：`Rectangle(width=16, height=10).move_to(ORIGIN)` |
| 卡片横溢出 | 缩 `card_w` 或字号；32pt × 5 位数字要 `card_w ≥ 4.5` unit |
| polyline 居中错 | 重算 x 让 `x_min + x_max = 0`；保持峰在 `(0, peak_y)` |
| 元素贴边被切 | 缩放或 `move_to` 往中心靠 |
| 动词闪时取样空白 | 重选 `t` 取样；bug 持续 >0.3s 就改动词循环节奏 |

## 不确定时

在你怀疑 bug 的**精确时刻**加第 5 张帧采样。如果 bug 真存在，定点时刻会抓；如果 5 帧采样抓不到，本 Scene 没 bug。

交叉参考：`geometry-math.md` 看坐标系基础；`api-cheatsheet.md` 看 API 表面——这些内容支撑 frame-check 的判断。
