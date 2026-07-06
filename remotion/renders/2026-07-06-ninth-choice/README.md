# Ninth Choice

3 分钟 Remotion 角色叙事短片。故事基于 gqy20/gk 的大学人生模拟器：林澈用武汉大学计算机的人设预演四年生活，从“只选最稳答案”转向“看见每次行动如何塑造自己”。

## Current

- Composition: `NinthChoice`
- Source: `remotion/src/videos/ninth-choice/`
- Output: `renders/current/ninth-choice.mp4`
- Thumbnail: `thumbnail.png`

## Implementation Notes

- 主画面不使用完整 AI 场景图；角色、UI、道具、背景分层，由 Remotion 控制运动。
- gk 模拟器界面由 React/Remotion 重建，中文文字不交给图片模型生成。
- 林澈、母亲、阴影同学已改为简约矢量动画 rig，不再依赖主渲染里的 mmx cutout 图片。
- 林澈包含 `walk` / `think` / `reach` / `forward` / `greet` / `write` 等姿态，用 pose-cycle、脚步轨迹、动作脉冲增强“主动打招呼 / 报名 / 写志愿”的动作语义。
- 旧的 mmx subject-reference 角色图仍保留为参考资产；当前主画面优先追求统一、干净、可控的动画风格。
- 模拟器暂停段嵌入 Manim `ActionPattern` cutaway，把“稳妥答案路径”转成“行动模式路径”的抽象变化做成动态解释。
- 当前人物仍是轻量 rig，不是完整 16 向 sprite sheet，也没有完整面部表演或口型同步。

## Manim Asset

```bash
.claude/skills/manim-viz/scripts/render_scene.sh scripts/manim/ninth_choice_action_pattern.py ActionPattern qh /home/qy113/workspace/project/2607/vid-agent/renders/2026-07-06-ninth-choice-manim/renders/final
cp renders/2026-07-06-ninth-choice-manim/renders/final/ninth_choice_action_pattern_qh_20260706-171730.mp4 remotion/public/ninth-choice/manim/action-pattern.mp4
```

## Reproduce

```bash
cd remotion
REMOTION_VIDEO_FILTER=ninth-choice pnpm exec remotion render src/index.ts NinthChoice ../remotion/renders/2026-07-06-ninth-choice/renders/current/ninth-choice.mp4 --overwrite --timeout=120000 --concurrency=8
```

## Checks

```bash
cd remotion
pnpm typecheck
```

Final frame audit contact sheet:

```text
renders/tmp/final-check/contact-sheet.jpg
```
