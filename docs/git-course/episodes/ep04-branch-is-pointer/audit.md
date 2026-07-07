# EP04 Branch 只是一个指针 - 审查记录

## 审查原则

每次渲染后至少检查：

- 关键帧是否有物理重叠。
- 是否存在半透明 ghost 残影。
- 元素是否虽然没有相交但距离过近。
- 字幕是否遮挡 Git 图、终端、branch 标签或 HEAD。
- 每个节拍是否只有一个主视觉。
- 动画是否只发生一次，不能来回晃动或循环。
- 命令和状态变化之间是否有因果感。

## 自动审查命令

```bash
pnpm --dir remotion run audit:overlaps GitCourseEp04BranchIsPointer 600,615,630,645,660,690 renders/git-course/ep04-branch-is-pointer/renders/tmp/scenes/mental-model/overlap-audit-9s
pnpm --dir remotion run audit:overlaps GitCourseEp04BranchIsPointer 870,885,899 renders/git-course/ep04-branch-is-pointer/renders/tmp/scenes/mental-model/overlap-audit-17s
pnpm --dir remotion run render:git:ep04:mental-model
```

## 已完成核对

### mental-model / 9s 附近

问题：

- `RefWrite` 在 9s 附近低透明度提前出现，虽然没有 bbox 硬重叠，但视觉上像一条白色残影。

处理：

- `RefWrite` 的 opacity 从 progress 0.26 后才开始进入。
- Git 图在 ref 写入阶段轻微上移。
- `main` 标签与 C2 拉开距离。
- 审计脚本新增 `ghost` 和 `near` 检测。

结果：

- frames `600,615,630,645,660,690`：`0 overlaps`，`0 visual issues`。

### mental-model / 17s 附近

问题：

- `feature` 与 `main` 指向 C2 时只有竖线，没有箭头，语义不够明确。

处理：

- 新增 `ArrowLine` 基础组件。
- `BranchTag` 改为使用 `ArrowLine`。
- `feature/main -> C2` 都显示箭头。
- 箭头头部缩小，避免抢 C2 的视觉权重。

结果：

- frames `870,885,899`：`0 overlaps`，`0 visual issues`。

## 当前待优化

| Scene | 问题 | 建议 |
|---|---|---|
| branch-result | feature 出现仍偏状态切换，不够像从 ref 行落到 C2 | 增加 `BranchTag` 的 from/to motion，并让 ref 行和标签建立空间因果 |
| commit | C3 出现还可以更有生成感 | 增加 commit node birth 动画：右侧生成、连线绘制、feature 指针滑动 |
| terminal | 终端片段需要继续降低同屏叙事层 | 输入命令时只保留终端，命令执行后再切 Git 图 |
| compare | 左右对比容易像课件 | 左图先出现，右图再出现，中间用一句短字幕承接 |
| takeaway | 结论画面信息量可再收敛 | 保留大标题和动态图，减少底部列表文字 |

## 输出位置

第二片段最新渲染：

```text
remotion/renders/git-course/ep04-branch-is-pointer/renders/tmp/scenes/mental-model/segments/001_000360-000899.mp4
```

第二片段抽帧总览：

```text
remotion/renders/git-course/ep04-branch-is-pointer/renders/tmp/scenes/mental-model/segment-audits/001_000360-000899/contact-16.jpg
```
