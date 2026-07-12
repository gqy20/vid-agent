# 增量视频生产管线

这份规范描述可复用的生产机制。它不拥有任何具体课程、品牌、episode schema、目录或发布平台。
项目必须通过自己的 adapter/orchestrator 提供这些事实。

## 项目适配器契约

通用管线只依赖六类能力：

1. `resolve`：读取项目唯一内容源，解析 timeline、scene、音频和发布配置。
2. `fingerprint`：按依赖边界生成稳定 hash，并能解释某次 dirty 的原因。
3. `build`：只写 cache 与 candidate，不直接覆盖已确认产物。
4. `audit`：产生机器检查、视觉证据、manifest 和统一 verdict。
5. `approve`：把人工结论绑定到 candidate SHA 与审查策略版本。
6. `promote/publish`：只接受 SHA、指纹和 verdict 全部匹配的 candidate。

项目可以用任意 CLI 或脚本实现这些能力。skill 不规定命令名和路径；若仓库已经提供入口，
所有底层工具都应由该入口编排。

## 指纹与内容寻址缓存

- 指纹只包含真正影响输出的输入：内容片段、源码依赖、资产、字体、渲染参数和工具版本。
- 拆开“内容”与“摆放”。例如 TTS 文本/voice/model 决定语音 hash，进入时间只决定合成 hash；
  改时间轴不应重新请求完全相同的语音。
- 每个成功任务立即原子写入 CAS，并记录输入 hash、输出 hash、时长和工具版本。
- 聚合任务只依赖子产物 hash。单个任务失败时，用 `allSettled` 语义保留成功结果，重跑只补失败项。
- bundle 也应持久缓存；key 至少覆盖入口、源码、构建配置、lockfile 和 public 资产。

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

推荐状态流：

```text
source -> fingerprints -> incremental tasks -> CAS -> assemble candidate
       -> encoded audit -> verdict -> approve -> promote -> publish
```

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
