# EP03 voiceover design

本文件是 EP03 的口播设计源。修改配音文稿前，先改这里，再同步到
`remotion/renders/git-course/ep03-commit-snapshot/renders/current/audio/voiceover_segments/*.txt`。

EP02 解释 commit 读取 Index；EP03 接住这个结论，解释 commit 本身是什么：它不是保存按钮，而是一个指向快照、指向 parent、带有 hash 身份的历史对象。

## TTS policy

- model: `speech-2.8-hd`
- voice: `Chinese (Mandarin)_Gentleman`
- language: `zh`
- speed: `1.25`
- 同一集必须整集重生，不能混用不同 voice 或 speed。
- 停顿优先使用 `<#0.25#>`、`<#0.30#>`、`<#0.35#>`；只在对象模型切换时使用较长停顿。
- 本集不使用语气标签，定义句保持干净。
- 生成后必须检查 `.srt`，确认 `<#...#>` 停顿标记没有进入字幕。

## Scene sentence map

| Time | Visual beat | Narration intent | Delivery |
|---:|---|---|---|
| 0.0-12.0 | 保存按钮被划掉，commit 节点出现 | 否定“commit = 保存按钮” | 开场直接，不铺垫编辑器概念 |
| 12.0-38.0 | 终端输入 commit，三层面板接管，Index 指向 C2 | 承接 EP02：commit 读取 Index | “不是 Working Tree 当前所有内容”要读清楚 |
| 38.0-74.0 | blob、tree、commit 对象关系 | 建立 commit -> tree -> blob | 先文件内容，再目录结构，再历史记录 |
| 74.0-104.0 | commit 字段卡逐行出现 | 解释 tree、parent、author、time、message | 不展开 author/time，避免抢 parent 和 message |
| 104.0-132.0 | C2 parent 指向 C1，C1 指向 C0 | 说明历史如何串起来 | 强调 parent 指向过去 |
| 132.0-158.0 | 字段进入 hash，message 改一个字生成新身份 | 说明 hash 是身份，不是随机编号 | 不讲 SHA-1 细节和碰撞 |
| 158.0-180.0 | commit graph 收束，main 指向 C2 | 总结并铺垫 EP04 | 只出现 main，不出现 HEAD |

## Current sentence audit

2026-07-08 generated at `speed=1.25`:

| Segment | Voice duration | Voice ends | Sentence-level result | Follow-up |
|---|---:|---:|---|---|
| `01_hook` | 9.27s | 9.62s | 正确建立 commit 不是保存按钮，结尾留给问题句。 | 保持短，不加“保存文件”的额外展开。 |
| `02_from_index` | 8.98s | 21.33s | 明确 commit 读取 Index，不读取 Working Tree 全部当前内容。 | 画面有足够观察时间。 |
| `03_object_model` | 13.12s | 51.47s | blob/tree/commit 三层定义完整，未把对象模型讲成文件夹。 | 留白较长但服务 Manim 关系观察。 |
| `04_commit_fields` | 10.60s | 84.95s | 字段含义清楚，parent/message 是重点。 | 后段字段卡保持视觉阅读时间。 |
| `05_parent_chain` | 9.67s | 114.02s | C2 -> C1 -> C0 的 parent 链清楚。 | 不增加 branch 解释。 |
| `06_hash_identity` | 9.81s | 142.16s | 说明 hash 由内容和元数据决定，字段变化导致身份变化。 | 不讲 SHA-1 或完整 hash。 |
| `07_takeaway` | 9.52s | 167.87s | 总结“指向快照，也指向过去”，自然铺垫 branch 指向 commit。 | 已确认画面只保留 main，不出现 HEAD。 |

Final narration density is about 72.97s of narration in the 180s main episode. This is deliberately lower than EP02 because本集包含三段 Manim 原理动画，需要给对象关系和箭头方向留出观察时间。

## Current segment text

```text
01_hook
第三集，我们拆开一个 commit。<#0.30#>它不是保存按钮。<#0.35#>保存只是把文件写到磁盘。<#0.25#>commit 是把一次项目状态，写进 Git 历史。

02_from_index
上一集我们看到，commit 读取的是暂存区。<#0.30#>Git 不会把工作区里所有当前内容都提交进去。<#0.30#>它会把 Index 里的内容，形成一个快照。

03_object_model
Git 内部会把文件内容保存成 blob。<#0.25#>把目录结构保存成 tree。<#0.30#>再创建一个 commit 对象，指向这棵 tree。<#0.30#>tree 代表项目结构，blob 代表文件内容，commit 代表这次历史记录。

04_commit_fields
一个 commit 不只是快照。<#0.25#>它还记录 parent、作者、时间和 message。<#0.30#>parent 说明它是从哪个 commit 走来的。<#0.25#>message 说明这次为什么提交。

05_parent_chain
当你连续提交，新的 commit 会指向上一个 commit。<#0.30#>C2 的 parent 是 C1。<#0.25#>C1 的 parent 是 C0。<#0.35#>Git 历史就是这样连起来的。

06_hash_identity
commit 会有自己的 hash。<#0.25#>它不是随机编号，而是由内容和元数据计算出来的身份。<#0.35#>快照、parent 或 message 变了，commit 的身份也会变。

07_takeaway
所以，commit 是一个带身份的历史节点。<#0.30#>它指向快照，也指向过去。<#0.35#>下一集，我们就可以解释，branch 为什么只需要指向某个 commit。
```
