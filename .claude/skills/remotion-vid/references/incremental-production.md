# 增量视频生产管线

这份规范描述可复用的生产机制。它不拥有任何具体课程、品牌、episode schema、目录或发布平台。
项目必须通过自己的 adapter/orchestrator 提供这些事实。

## 项目适配器契约

通用管线只依赖七类能力：

1. `resolve`：读取项目唯一内容源，解析 timeline、scene、音频和发布配置。
2. `fingerprint`：按依赖边界生成稳定 hash，并能解释某次 dirty 的原因。
3. `build`：只写 cache 与 candidate，不直接覆盖已确认产物。
4. `audit`：产生机器检查、视觉证据、manifest 和统一 verdict。
5. `approve`：把人工结论绑定到 candidate SHA 与审查策略版本。
6. `promote/publish`：只接受 SHA、指纹和 verdict 全部匹配的 candidate。
7. `clean/gc`：清理可重建视图和工作区，并按引用回收过期 CAS；默认 dry-run。

项目可以用任意 CLI 或脚本实现这些能力。skill 不规定命令名和路径；若仓库已经提供入口，
所有底层工具都应由该入口编排。

## 指纹与内容寻址缓存

- 指纹只包含真正影响输出的输入：内容片段、源码依赖、资产、字体、渲染参数和工具版本。
- 拆开“内容”与“摆放”。例如 TTS 文本/voice/model 决定语音 hash，进入时间只决定合成 hash；
  改时间轴不应重新请求完全相同的语音。
- 每个成功任务立即原子写入 CAS，并记录输入 hash、输出 hash、时长和工具版本。
- 聚合任务只依赖子产物 hash。单个任务失败时，用 `allSettled` 语义保留成功结果，重跑只补失败项。
- bundle 也应持久缓存；key 至少覆盖入口、源码、构建配置、lockfile 和 public 资产。

## 产物所有权与回收

项目适配器应明确五类不同所有权，不能用多个目录保存同一份长期缓存：

- CAS/cache 是唯一可复用二进制存储；成功任务原子进入 CAS 后，工作区中的重复大文件应释放。
- preview/debug 是稳定命名的可重建视图。优先 hardlink 或 reflink，文件系统不支持时才复制；manifest 应记录来源 hash 和物化方式。
- task/work 是运行中与失败诊断的工作区。成功任务可在权威 audit 生成后清理，失败证据应按项目宽限期保留。
- candidate/audit 是待审批产物和与其 SHA 绑定的门禁证据，在批准失效或产物被替换前不得清理。
- current/published 只保存已批准产物，build 和 preview 不得把它当 staging 目录。

GC 必须从 state、artifact/preview manifest、verdict 和当前输入指纹构建 live reference set，再对未引用对象应用宽限期。禁止只按修改时间删除整个 cache。GC 默认 dry-run，执行删除需要显式确认；bundle 至少保护当前源码指纹、活动任务和最近若干可回退版本。原始连续审查帧在 sheet 数量校验后可以删除，但最终 report、manifest、verdict 和计划关键帧按门禁策略保留。

## 最大稳定并行

“最大并行”指机器在当前分辨率、codec 和资产负载下的最大稳定吞吐，不等于无限创建进程。

- orchestrator 统一分配 CPU、内存和 Chrome tab，避免每层各自把并发开满后相乘过载。
- dirty scene、TTS、独立审查扫描默认并行；有依赖的 assemble、audit、promote 保持顺序。
- 多个渲染任务共享一次 bundle，但每个 `renderMedia` 使用独立 browser pool。不要让并行任务共享
  同一个 browser 实例。
- 首次在机器上用短任务逐档探测；记录稳定档位、失败类型、峰值资源和版本。后续默认从最高稳定档
  启动，遇到 OOM、browser target closed 或超时自动降档重试，并更新 profile。
- 记录阶段耗时、cache hit/miss、有效 fps、重试次数和资源档位，优化以数据为准。

## Candidate、审查和门禁

不要把生产管线理解成每次源码编辑都从头走到 promote 的直线。推荐状态流包含一个明确的修复内循环：

```text
                         ┌─ issue list <- point review <- local preview ─┐
source -> fingerprints -> incremental tasks -> CAS ---------------------┘
                                      |
                                      └-> assemble candidate -> encoded audit
                                          -> verdict -> approve -> promote -> publish
```

### 迭代修复

- 用户连续指出秒点、排版、字体、动画、字幕或品味问题时，默认停留在迭代修复。
- 把反馈合并到问题清单，优先按 dirty scene、代表帧、`t-0.5/t/t+0.5/t+1.0` 或短区间验证。
- 可更新 cache、debug 和 candidate；不得因为单个问题修完就自动 approve、promote 或 publish。
- 修复一个问题时搜索同源实现，例如零长度线端帽、固定 opacity、重复容器和共享字号，避免只改点名帧。
- 只有问题清单清空，或用户明确要求整体候选验收时，才离开内循环。

### 候选验收与正式晋升

- 候选验收才组装完整视频并运行连续采样、边界 burst、计划关键帧、音视频结构检查和人工审查。
- `approve` 表示审查者接受某个 candidate SHA，不是普通的“保存修改”。
- `promote` 会改变 current，只能在候选验收通过且得到明确的定稿/晋升授权后执行。
- 用户验收后再次提出修改，立即回到迭代修复；旧批准必须失效，不得沿用。

- build 只能写临时缓存和 candidate；失败或待审查产物不能污染 current。
- 审查必须针对编码后的 candidate，而不只看 Remotion still。
- 审查策略由项目配置，通常包含连续采样、scene/拼接边界 burst、计划关键帧、音视频结构检查、
  contact sheets 和人工问题清单。独立扫描可并行，抽帧后一次 montage，原始帧默认可删除。
- verdict 使用统一枚举，例如 `pass | needs_review | fail`，并携带 candidate SHA、输入指纹、
  审查策略版本、证据计数和机器检查结果。
- `promote` 只接受 `pass` 且 SHA/指纹一致的 candidate；`publish` 还需验证发布封装对应同一来源。
  任何输入变化都会使旧批准失效。

## 退化与 fallback

没有项目 adapter 时，可用本 skill 的 `render-ranges.sh`、`check-frames.sh`、`render-final.sh`
完成单次任务。但一旦项目需要增量缓存、多人协作或发布门禁，应建立项目 orchestrator，避免继续
在通用 skill 中堆项目条件分支。
