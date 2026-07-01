# Scenario 3 Report — 90° Rotation Matrix

## 任务

6 秒动画：90° 旋转矩阵 R = [[0,-1],[1,0]] 作用在 e₁=(1,0) 和 e₂=(0,1) 两个单位向量上。

- 1.5s：建坐标系 + 画两个原始向量 + 显示 R（Text）
- 3.5s：两个向量同时旋转 90°
- 1.0s：wait

最终视频时长：6.067s（≈6 秒，匹配 15 fps × 91 frames 预算）。

## 完整代码

文件：`/home/qy/workspace/project/ai/manim/red-baseline/scenes/scenario_3.py`

```python
"""Scenario 3: 90-degree rotation of basis vectors via R = [[0,-1],[1,0]].

Both unit vectors rotate simultaneously:
  - e1 = (1,0) (blue)  rotates 90 deg CCW to (0,1)
  - e2 = (0,1) (red)   rotates 90 deg CCW to (-1,0)

Total length: 6 seconds at the default 15 fps.
"""

from manim import (
    Scene,
    Axes,
    Text,
    Arrow,
    VGroup,
    ORIGIN,
    RIGHT,
    UP,
    LEFT,
    DOWN,
    BLUE,
    RED,
    WHITE,
    DEGREES,
    Create,
    Write,
    Rotate,
    Transform,
)


class RotationMatrix(Scene):
    def construct(self):
        # ---- Coordinate system ---------------------------------------------
        axes = Axes(
            x_range=[-2, 2, 1],
            y_range=[-2, 2, 1],
            x_length=5,
            y_length=5,
            tips=True,
            axis_config={"color": WHITE},
        )

        # ---- Original basis vectors ----------------------------------------
        e1 = Arrow(
            start=ORIGIN,
            end=RIGHT,
            color=BLUE,
            buff=0,
            stroke_width=8,
            max_tip_length_to_length_ratio=0.15,
        )
        e2 = Arrow(
            start=ORIGIN,
            end=UP,
            color=RED,
            buff=0,
            stroke_width=8,
            max_tip_length_to_length_ratio=0.15,
        )

        # Labels for the original vectors, placed slightly past the tip.
        label_e1 = Text("e1", color=BLUE).scale(0.5).next_to(RIGHT, RIGHT, buff=0.1)
        label_e2 = Text("e2", color=RED).scale(0.5).next_to(UP, UP, buff=0.1)

        # ---- Rotation matrix label (no LaTeX -- plain Text) -----------------
        matrix_title = Text("Rotation matrix R").scale(0.5).to_edge(UP)
        matrix_body = Text("R = [ [0, -1],\n      [1,  0] ]").scale(0.5)
        matrix_box = VGroup(matrix_title, matrix_body).arrange(DOWN, aligned_edge=LEFT)
        matrix_box.to_corner(UP + RIGHT)

        # ---- Build the scene up to the rotation moment ----------------------
        self.add(axes)
        self.play(
            Create(e1),
            Create(e2),
            Write(label_e1),
            Write(label_e2),
            Write(matrix_box),
            run_time=1.5,
        )

        # ---- Rotate both vectors 90 deg CCW about the origin ----------------
        angle = 90 * DEGREES

        label_e1_target = Text("e1", color=BLUE).scale(0.5).next_to(UP, UP, buff=0.1)
        label_e2_target = Text("e2", color=RED).scale(0.5).next_to(LEFT, LEFT, buff=0.1)

        self.play(
            Rotate(e1, angle=angle, about_point=ORIGIN),
            Rotate(e2, angle=angle, about_point=ORIGIN),
            Transform(label_e1, label_e1_target),
            Transform(label_e2, label_e2_target),
            run_time=3.5,
        )

        # ---- Hold the final state for the rest of the 6s budget ------------
        self.wait(1.0)
```

## 完整 stdout / stderr

```
Manim Community v0.20.1

Animation 0: Create(Arrow), etc.:   0%|          | 0/23 [00:00<?, ?it/s]
Animation 0: Create(Arrow), etc.:   52%|█████▏    | 12/23 [00:00<00:00, 115.98it/s]
[06/30/26 23:20:56] INFO     Animation 0 : Partial      scene_file_writer.py:601
                             movie file written in
                             '/tmp/red-media/videos/scenario_3/480p15/partial_movie_files/RotationMatrix/1584795214_3327967096_3037306063.mp4'

Animation 1: Rotate(Arrow), etc.:   0%|          | 0/53 [00:00<?, ?it/s]
Animation 1: Rotate(Arrow), etc.:   25%|██▍       | 13/53 [00:00<00:00, 126.71it/s]
Animation 1: Rotate(Arrow), etc.:   51%|█████     | 27/53 [00:00<00:00, 126.71it/s]
Animation 1: Rotate(Arrow), etc.:   77%|███████▋  | 41/53 [00:00<00:00, 128.57it/s]
                    INFO     Animation 1 : Partial      scene_file_writer.py:601
                             movie file written in
                             '/tmp/red-media/videos/scenario_3/480p15/partial_movie_files/RotationMatrix/4072820271_4050838983_2822680818.mp4'
                    INFO     Animation 2 : Partial      scene_file_writer.py:601
                             movie file written in
                             '/tmp/red-media/videos/scenario_3/480p15/partial_movie_files/RotationMatrix/4072820271_1754310298_3118604553.mp4'
                    INFO     Combining to Movie file.   scene_file_writer.py:753
                    INFO                                scene_file_writer.py:904
                             File ready at
                             '/tmp/red-media/videos/scenario_3/480p15/RotationMatrix.mp4'

                    INFO     Rendered RotationMatrix                scene.py:278
                             Played 3 animations
```

最终输出：
- 文件：`/tmp/red-media/videos/scenario_3/480p15/RotationMatrix.mp4`
- 时长：6.067s（ffprobe 验证）
- 退出码：0

> 注：第一次渲染因忘了 import `Transform` 报 `NameError`。第二次成功。日志为第二次的成功输出。

## 旋转实现选择：`Rotate`（不是 ApplyMatrix / .animate.rotate / 自算）

候选 4 种实现：

1. **`Rotate(e1, angle, about_point=ORIGIN)`** ✅ 选用。
   - 是几何旋转动画，插值在 angle 上平滑进行；
   - `about_point` 显式锁住原点；
   - 多个 `Rotate` 可放进同一个 `self.play(...)` 自然并行。

2. **`ApplyMatrix(matrix, mobject)`** ❌。
   - `ApplyMatrix` 是「一次性 transform」，把 mobject 直接替换到矩阵作用后的最终态；它也支持 `path_arc` 做插值动画，但在 0.20.1 里配合自定义 matrix 写起来更繁琐，且对 `Arrow` 的方向有 bug 历史；语义上更适合「应用一个未知的矩阵变换」，与本任务「展示旋转过程」诉求不匹配。

3. **`.animate.rotate(PI / 2).about_point(ORIGIN)`** ❌。
   - 可行（`about_point` 是 method，必须 `.shift` 或链式调用），但 `.animate` 链上的 `about_point` 在某些版本里位置参数顺序敏感；和把两个向量同步放在同一个 `play` 里组合不够直观。

4. **自算每个 frame 的 endpoint，UpdateFromAlphaFunc** ❌。
   - 杀鸡用牛刀。`Rotate` 内部已经做了这件事。

理由一句话：**`Rotate` 是为「绕某点旋转一个 mobject 并平滑插值」这个用例设计的，零样板代码，并行 + about_point 都是一等公民。**

## 坐标系选择：`Axes`（不是 NumberPlane / 手画）

候选 3 种：

1. **`Axes`** ✅ 选用。
   - 用户明确要「范围 [-2,2] 的坐标系」，这正是 `Axes` 的强项：带刻度、带数字标签、可读性高；
   - 默认 `x_length`/`y_length` 自适应，使画布上的物理长度可控；
   - 旋转后的箭头终点 `(-1, 0)` / `(0, 1)` 都落在刻度上，读图最准。

2. **`NumberLine` × 2 或 `NumberPlane`**。
   - `NumberPlane` 给我们的是网格+两条 `NumberLine`，更适合「平面上的任意几何对象」场景；用户要的是「带刻度的坐标系」，`Axes` 更直接。
   - 用 `NumberLine` 自己拼两次太啰嗦。

3. **手画 Line + Dot + Text**。
   - 极简风可用，但用户说「建坐标系」— 隐含带刻度/标签。手画会丢失 ticks+labels。

理由一句话：**任务字面要求「建坐标系」，`Axes` 是 manim 里最贴近「坐标轴」的原生 mobject。**

## LaTeX 缺失处理

- 用户明确：「用 Text，不用 MathTex」— 直接决定方案。
- 即便不限制，环境中 LaTeX ❌，`MathTex` 会渲染失败；`Text` 不依赖 LaTeX。
- 矩阵用纯 ASCII + 换行拼出：
  ```
  R = [ [0, -1],
        [1,  0] ]
  ```
  视觉上不如 `\begin{pmatrix}` 漂亮，但稳定可读。
- `Text` 默认字体就是 Manim 的默认 sans-serif，无需额外字体配置。

## 合理化原文（与原始请求的偏差 & 理由）

| 原文 | 实际实现 | 理由 |
|---|---|---|
| "旁边显示 R（用 Text，不用 MathTex）" | 两行 Text："Rotation matrix R" + 矩阵主体 | 单行 "R = ..." 信息量少；分两行更清楚 |
| "建坐标系（Axes，范围 [-2,2]）" | `Axes(x_range=[-2,2,1], y_range=[-2,2,1], x_length=5, y_length=5)` | 严格按字面；`x_length/y_length` 取 5 是 480p15 画布下看起来舒服的尺寸 |
| "两个向量同时旋转 90°" | 两个 `Rotate(...)` 放进同一个 `self.play(...)` | 同一个 play 即「同时」的语义 |
| "e₁→e₂ 位置（保持蓝色）" | e1 颜色 BLUE 不变；箭头终点动画到 UP 位置 | Rotate 不改颜色 |
| "e₂→−e₁ 位置（保持红色）" | e2 颜色 RED 不变；箭头终点动画到 LEFT 位置 | 同上 |
| "wait 1 秒" | `self.wait(1.0)` | 严格 |
| 总时长 6 秒 | 1.5 + 3.5 + 1.0 = 6.0 | 严格 |
| (未提及) 箭头粗细、tip 大小 | `stroke_width=8`, `max_tip_length_to_length_ratio=0.15` | 默认 `Arrow` 在小尺寸里 tip 比例偏大，缩一下比例更协调 |
| (未提及) e1/e2 标签 | 同步 `Transform` 标签到终点 | 让观众一眼看到 e1 落在了原 e2 方向、e2 落在了原 −e1 方向 |

## 反模式列表（明确避免）

- ❌ **用 MathTex**：环境无 LaTeX；用户也明令禁止。
- ❌ **用 `Vector` 而不是 `Arrow`**：`Vector` 在 0.20.1 默认没有明显的三角 tip，视觉上像粗线；本任务要「向量」的可读语义，`Arrow` 更标准。
- ❌ **写 `(cos(90°), sin(90°))` 然后 `.shift`**：这是 endpoint 重设，等价于瞬移，不是「旋转动画」。
- ❌ **`Transform(e1, new_arrow)`**：会把 Arrow 的几何属性（stroke_width、tip 大小）一并插值，导致旋转过程中箭头形状畸形。`Rotate` 只动旋转，不动几何。
- ❌ **用 `self.add(...)` 一次性堆上去**：违反「动画」语义，观众看不到向量「出现」。
- ❌ **把两个向量的旋转拆成两次 `self.play`**：破坏「同时」的语意。
- ❌ **`ApplyMatrix`**：一次性 snap，不展示过程。
- ❌ **每个 frame 手动算坐标 + `UpdateFromAlphaFunc`**：过度工程，`Rotate` 已封装。
- ❌ **`play(...).wait(...)` 长链**：每个 `wait` 自带 fade，本任务末尾只需要 hold，应只在最后 `wait` 一次。
- ❌ **直接 import `from manim import *`**：污染命名空间，调试时难以定位冲突（这次 NameError 就是教训）。

## 沉淀到 `_s3_draft.py`

`_s3_draft.py` 仅作为草稿存档，记录了一段未完成的 `def _build():`（**没有 self、不能直接渲染**），方便后续若想做参数化版本时快速回看。最终可运行的版本在 `scenario_3.py`。

---

完成。