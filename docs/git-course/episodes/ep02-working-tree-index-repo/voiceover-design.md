# EP02 voiceover design

本文件是 EP02 的口播设计源。修改配音文稿前，先改这里，再同步到
`remotion/renders/git-course/ep02-working-tree-index-repo/renders/current/audio/segments/*.txt`。

EP01 解释 Git 最终保存的是 commit 快照；EP02 解释一个文件在形成快照之前，为什么要经过 Working Tree、Index、Repository 三层。

## TTS policy

- model: `speech-2.8-hd`
- voice: `Chinese (Mandarin)_Gentleman`
- language: `zh`
- speed: `1.25`
- 同一集必须整集重生，不能混用不同 voice 或 speed。
- 停顿优先使用 `<#0.2#>`、`<#0.25#>`、`<#0.3#>`；只有主视觉切换时才使用更长停顿。
- 本集只在开头使用一处 `(breath)`，用于让第二集开场不显得突兀；定义句不加语气词。
- MiniMax 生成的 `.srt` 会保留 `(breath)` 这类语气标签；如果后续要烧字幕，必须先过滤语气标签，不能直接使用原始 `.srt`。

## Scene sentence map

| Time | Visual beat | Narration intent | Delivery |
|---:|---|---|---|
| 0.0-12.0 | 标题、文件卡、问题句 | 建立 `git add` 不是“添加文件”的问题 | 开头自然吸气；问题句要在文件卡悬停时完成 |
| 12.0-18.0 | 三个区域生成 | 建立 Working Tree / Index / Repository | 英文名逐个读清楚，不解释过深 |
| 18.0-26.0 | 中文解释出现 | 说明三层不是三个副本 | “不是三个副本”承接 EP01 的错误文件夹模型 |
| 26.0-38.0 | `app.js` 出现在 Working Tree | 把后续命令统一到三层关系上 | 结尾留出画面观察时间 |
| 38.0-46.0 | 代码新增一行 | 说明修改先发生在 Working Tree | `modified` 是状态，不是提交 |
| 46.0-68.0 | Index / Repository 不变 | 强调 Git 发现变化但没有选择它 | 不重复三层定义，转向下一步 `add` |
| 68.0-84.0 | `git add app.js` 后文件进入 Index | 说明 add 暂存当前内容 | “当前这一刻”重音 |
| 84.0-104.0 | `staged v1` 与 callout | 纠正 add 自动同步的误解 | `add = 选择这份内容` |
| 104.0-122.0 | Working Tree v2 / Index v1 对比 | 解释同一文件两份变化 | `不是 bug` 作为观察提示 |
| 122.0-134.0 | `MM app.js` | 把画面证据和命令输出对上 | 说明要提交 v2 需要重新 add |
| 134.0-152.0 | commit 从 Index 生成 C1 | 说明 commit 读取 Index | 不能说 commit 保存编辑器最新内容 |
| 152.0-164.0 | Repository 得到 C1，Working Tree v2 留在外面 | 点出 C1 保存 v1 | 这里是本集最重要的反直觉点 |
| 164.0-180.0 | 三层流程收束 | 接回 EP01 快照模型并预告 EP03 | 先说连接关系，再说三层职责 |

## Current sentence audit

2026-07-08 generated at `speed=1.25`:

| Segment | Voice duration | Voice ends | Sentence-level result | Follow-up |
|---|---:|---:|---|---|
| `01_hook` | 10.71s | 11.01s | 开场问题不展开新知识，只纠正 `git add` 的错误直觉。 | 原始 SRT 会保留 `(breath)`，烧字幕前要过滤。 |
| `02_three-areas` | 21.66s | 34.06s | 补上“三层不是三个副本”，避免和 EP01 复制文件夹模型割裂。 | 留约 3.95s 给 `app.js` 所在层级观察。 |
| `03_modify` | 25.44s | 63.84s | 补上 modified、Index 空、Repository 不变，以及“工作区变脏但没有历史”。 | 留约 4.17s，后半段不再空跑。 |
| `04_add` | 31.81s | 100.21s | 补上文件移动、`staged v1`、Working Tree/Index 同时存在、Repository 未变。 | 留约 3.79s，压缩原先过长无声。 |
| `05_edit-after-add` | 23.85s | 128.25s | 补上 v1/v2 对比、`MM app.js` 两列含义和重新 add 的原因。 | 这是最容易误解的段落，不能再压成一句。 |
| `06_commit` | 25.36s | 159.76s | 补上 C1 保存 v1，Working Tree v2 不会自动进去。 | 补“commit 后仍可能有未提交修改”的原因。 |
| `07_takeaway` | 14.64s | 178.84s | 明确和 EP01 的关系：快照形成前要经过三层。 | 结尾留 1.17s 给下一集问题停住。 |

Final narration density: about 153.5s of narration in the 180s main episode, roughly 85%. This is high enough for a teaching video while still leaving short visual holds after each scene.
