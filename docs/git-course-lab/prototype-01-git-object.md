# Prototype 01：一次 commit 生成了什么

## 目标

用 25 秒验证新范式：

```text
真实终端命令 -> Manim 对象构造 -> Remotion 合成总结
```

## 时间线

| 时间 | 技术 | 画面 |
|---:|---|---|
| 0-2s | Remotion | 标题一句：`A commit is an object graph` |
| 2-7s | vhs terminal | 真实执行 `git init`、写文件、`git add`、`git commit` |
| 7-19s | Manim | `README.md` 内容变成 blob、tree、commit |
| 19-25s | Remotion | 终端小窗退到左下，commit object 居中，字幕收束 |

## 输出资产

```text
scripts/terminal-recordings/git-course-lab/ep00-git-object.tape
scripts/manim/git-course-lab/scenes/git_object_transform_scene.py
remotion/src/videos/git-course-lab/PrototypeGitObject.tsx
```

## 审查点

- 终端命令是真执行，不是手写输出。
- Manim 对象按照内容依赖逐步构造。
- 终端与 Manim 不同时抢主视觉。
- 底部字幕只写结论，不重复命令或对象标签。

