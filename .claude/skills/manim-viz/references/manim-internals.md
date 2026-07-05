# Manim 内部体系 —— 源码层调试与陷阱参考

> 调试动画行为反常时，知道 trap 对应 manim 源码哪一行；解释 skill 里那些
> 「为什么必须这么写」的硬规矩的根因。是 [`anti-patterns.md`](anti-patterns.md)
> （怎么写才不撞错）的**源码层补充**——解释 why。

基于 manim Community 0.20.x（实测 `.venv/lib/python3.13/site-packages/manim`）。

## 包结构（分层）

```
manim/
├── scene/           Scene 基类 + SceneFileWriter（写文件）+ 各专用 Scene
├── renderer/        cairo_renderer.py（默认）/ opengl_renderer.py
├── mobject/         Mobject 基类（updater/transform 在这）/ text/（Tex/MathTex/Text）/ opengl/
├── animation/       Animation 基类 + 各具体动画（Transform/Create/FadeIn...）
├── camera/          Camera（投影 + 帧坐标）
├── cli/             命令行入口（质量档/渲染入口解析）
├── _config/         配置解析（default.cfg）
├── utils/           tex_file_writing.py（LaTeX subprocess）/ tex_templates.py / file_ops.py
└── constants.py     QUALITIES 质量档定义、坐标常量、方向向量（DOWN/UR/RIGHT...）
```

## 三大运行时陷阱的源码根因

### 1. silent freeze —— `inspect.signature` 字面查 `"dt"`

skill 第一条铁律：updater 形参**必须字面叫 `dt`**。源码根因在两处：

**`mobject/mobject.py:966-982`**（判定是否 time-based）：

```python
def has_time_based_updater(self) -> bool:
    ...
    "dt" in inspect.signature(updater).parameters for updater in self.updaters
```

**字符串字面匹配**——参数名叫 `dt_wall`、`delta_t` 都返回 False。

**`scene/scene.py:425-433`**（wait 循环里决定要不要推进时间）：

```python
should_update = (
    self.always_update_mobjects
    or self.updaters
    or wait_animation.stop_condition is not None
    or any(
        mob.has_time_based_updater()           # ← 关键判定
        for mob in self.get_mobject_family_members()
    )
)
wait_animation.is_static_wait = not should_update   # ← True 就冻结
```

完整链：改名 `dt` → `has_time_based_updater()` 返回 False → `is_static_wait = True`
→ wait 不推进时间 → **画面冻结**，但空帧照常渲染 → 日志照常 `Played N animations` → silent。

`add_updater`（`mobject/mobject.py:1076-1082`）注册时也用同一判定决定初始调用传不传 dt。

**修法只有一条**：形参字面叫 `dt`。不是约定，是 `inspect.signature` 的硬匹配。

### 2. LaTeX 隐式 spawn —— `subprocess.run(pdflatex)`

skill：`MathTex`/`Tex`/`Axes.get_axis_labels`/`add_coordinates`/`DecimalNumber`/`Integer`
内部 spawn pdflatex。源码路径在 `utils/tex_file_writing.py`：

```python
# :181
def compile_tex(tex_file, tex_compiler, output_format) -> Path:
    ...
    command = make_tex_compilation_command(tex_compiler, output_format, tex_file, tex_dir)
    cp = subprocess.run(command, stdout=subprocess.DEVNULL)   # ← :207 spawn latex/pdflatex
    if cp.returncode != 0:
        ...raise ValueError(f"{tex_compiler} error...")

# :220-247  再用 dvisvgm 把 .dvi/.xdv/.pdf 转 .svg
subprocess.run(["dvisvgm", ...], stdout=subprocess.DEVNULL)
```

完整链：`MathTex("...")` → `compile_tex` → `subprocess.run(["latex", ...])` →
**latex 二进制不在 PATH → `FileNotFoundError: 'latex'`**。

注意 stack trace 末端是 `FileNotFoundError: 'latex'`，看着像「环境缺 LaTeX」，
实际是**你调的某个 API 隐式触发了 TeX 编译**——所以 skill 要求写公式前先
`check_latex.sh`，决定用 `MathTex` 还是回退 `Text`+Unicode。CJK 中文**始终 `Text`**
（Pango，`text/text_mobject.py`），与 LaTeX 可用性无关。

tex_compiler 支持 `latex`/`pdflatex`/`luatex`/`lualatex`/`xelatex`（`:140-157`），
错误处理 `print_all_tex_errors` 会打 `.log`。

### 3. 默认 `-qh` —— `DEFAULT_QUALITY = "high_quality"`

「默认上 -qh、单次 5min」不是习惯，是源码默认值（`constants.py:245`）。
调试时不显式 `-ql`，就吃满 1080p60 渲染成本。**写代码迭代必须显式 `-ql`**。

## 质量档的源码定义（`constants.py:204-249`）

| flag | quality 名 | 分辨率 | fps | 用途 |
|---|---|---|---|---|
| `-ql` | low_quality | 854×480 | 15 | **写代码迭代**（<30s/次）|
| `-qm` | medium_quality | 1280×720 | 30 | 看不清时升一档 |
| `-qh` | high_quality（**默认**）| 1920×1080 | 60 | 最终定稿 |
| `-qp` | production_quality | 2560×1440 | 60 | 2K |
| `-qk` | fourk_quality | 3840×2160 | 60 | 4K |

`DEFAULT_QUALITY = "high_quality"`——这是 skill 反复强调「调试别上 -qh」的根因。

**设计基准 ≠ 渲染分辨率**：坐标系恒为 `frame_width≈14.22 × frame_height≈8.0`
（1080p 基准，`constants.py`），与质量档无关。所以 `frame_audit.py` 用 1080p 坐标
审计 480p 渲染产物是对的——几何与分辨率解耦。

## 渲染流水线：Scene → Cairo → partial_movie_files

```
Scene.construct()              ← 你写的代码，play()/wait() 驱动
   │
   ├─ 每个.play()/.wait() 渲成一段独立 mp4  ──→ SceneFileWriter.partial_movie_files[]
   │                                            （scene_file_writer.py:249 add_partial_movie_file）
   │
   ├─ CairoRenderer 逐帧 draw_to_frame      （renderer/cairo_renderer.py）
   │      └─ 通过 ffmpeg pipe 写原始帧
   │
   └─ Scene 收尾: ffmpeg concat 所有 partial_movie_files → 最终 mp4
```

**关键机制：manim 是「逐 animation 分片」**，不是逐帧分片。每个 `play()`/`wait()`
单独渲成一段短 mp4（带 hash 命名），最后 `ffmpeg concat` 拼成完整视频
（`scene_file_writer.py:133,205`）。

这就是 `cleanup.sh` 要清 `partial_movie_files/` 的原因——迭代多了，每个 Scene 的
每段 animation 都会留一份短 mp4，极易累积成千上万个小文件、盘胀几个 GB。

跳过的 animation 会 `append(None)` 保持索引和 `num_plays` 对齐（`:264-268`）。

## 项目 debug 做法 ↔ 源码 对照

| 项目做法 | 源码层 | 源码证据 |
|---|---|---|
| updater 形参必须叫 `dt` | `mobject/mobject.py:966` | `"dt" in inspect.signature(updater).parameters` 字面匹配 |
| `-ql` 迭代省 4× 时间 | `constants.py:245` | `DEFAULT_QUALITY="high_quality"`，不显式指定就吃 1080p60 |
| 写公式前 `check_latex.sh` | `utils/tex_file_writing.py:207` | `subprocess.run([tex_compiler])` 缺失抛 `FileNotFoundError` |
| CJK 始终用 `Text` | `mobject/text/text_mobject.py` | `Text` 走 Pango；`MathTex`/`Tex` 走 LaTeX，无中文字体支持 |
| `cleanup.sh` 清 `partial_movie_files/` | `scene/scene_file_writer.py:205` | 每个 animation 写一段短 mp4，迭代多次盘胀 |
| `frame_audit.py` 用 1080p 坐标审计 | `constants.py` 坐标系 | `frame_width≈14.22×8` 与质量档解耦，低分辨率产物也能审 |
| Wall-clock 预算门禁 | `scene/scene.py:1147/1209` | `play`/`wait` 时长由 `run_time` + wait 累加，无静态声明 |
| ffprobe duration 校验 | （外部） | `extract_frames.sh` 用 ffprobe 读时长算抽帧点位 |

## 源码定位速查

定位 manim 源码：

```bash
M=.venv/lib/python3.13/site-packages/manim
```

| 找什么 | 看哪个文件 |
|---|---|
| updater 冻结 / `dt` 判定 | `mobject/mobject.py:935,966,1077` |
| wait 是否推进时间 | `scene/scene.py:425-433`（`has_time_based_updater` 调用点） |
| `play`/`wait` 主循环 | `scene/scene.py:1147,1209,1351` |
| LaTeX 编译 + dvisvgm | `utils/tex_file_writing.py:181,207,220` |
| 质量档 flag → 分辨率 | `constants.py:204-245`（`QUALITIES` dict） |
| partial_movie 分片写盘 | `scene/scene_file_writer.py:133,205,249` |
| Cairo 渲染 | `renderer/cairo_renderer.py` |
| 方向常量 DOWN/UR/RIGHT | `constants.py`（`from manim import *` 导出源头） |

## 何时查这份文档

- 动画「不崩但不动」—— 先想 `has_time_based_updater` 判定，检查 updater 形参名
- 写公式前/`FileNotFoundError: 'latex'` —— 查 LaTeX subprocess 路径，确认是隐式触发
- 渲染慢得离谱 —— 查是不是漏了 `-ql`，吃了 `DEFAULT_QUALITY`
- 盘胀 —— 查 `partial_movie_files/`，理解为什么能积累这么多
- 想知 `anti-patterns.md` / SKILL 某条铁律的所以然 —— 来这里查源码行
