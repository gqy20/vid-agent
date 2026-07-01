# Remotion 开源协议调研

> 调研日期：2026-07-01
> 当前本地版本：`remotion/package.json` 锁定 `^4.0.0`

## 核心结论

**Remotion 不是 OSI 认可的标准开源协议**（MIT / Apache / GPL），使用**自定义的「Remotion License」**，属 source-available 但**不完全开源**——按组织规模分两档。

## 两档许可（4.x 与 5.x 共用）

| 档位 | 适用对象 | 商业用途 |
|---|---|---|
| **Free License** | 个人；≤3 人的营利公司；非营利组织；评估用途 | ✅ 允许商业生成视频/图片 |
| **Company License**（付费） | ≥4 人的营利公司 | 需购买 |

**免费档禁止行为（原文）：**
> "It is not allowed to copy or modify Remotion code for the purpose of selling, renting, licensing, relicensing, or sublicensing your own derivate of Remotion."

即：用 Remotion 源码做二次开发后把它/衍生品再卖/再许可出去 → 禁止；但用 Remotion 制作视频产品 → 允许。

## 5.0 协议变更（PR #3750，仍为 Draft）

1. **承包商（contractors）也计入团队规模** —— 之前公司只要只用外包工就不触发 Company License，5.0 起不再有这层规避空间。
2. **Company License 绑定正式书面 Terms and Conditions** —— 之前是模板生成的法律文本，现在是 Remotion 自行起草、实际可执行的条款。

## 三档 Company License 套餐（remotion.pro）

| 套餐 | 价格 | 计费维度 | 适用场景 |
|---|---|---|---|
| **Automators** | $0.01/render，月最低 $100 | 渲染次数 | SaaS 视频编辑器、prompt-to-video、嵌入 Player |
| **Creators** | $25/seat/月，3 席起 = $75/月 | 席位 | 内部低频视频生产、动效系统 |
| **Enterprise** | 起价 $500/月 | 议价 | 含 Automators + Creators 全部 + 企业级服务 |

### Automators 包含/不包含

✅ 商业使用、按量付费、优先支持、Mux credits（$250 新客户）
❌ Editor Starter、私人 Slack、月度咨询、定制条款、优先功能请求

### Creators 包含/不包含

✅ 商业使用、无限渲染、3 个席位
❌ 优先支持、Mux credits、Editor Starter、自动化商业产品能力

### Enterprise 包含

✅ Automators + Creators 全部
✅ 私人 Slack/Discord、月度咨询、定制条款、合规表单、优先功能、**Editor Starter**（价值 $600）

## 决策树

```
你是 ≥4 人营利公司？
├── 是 → 自动化商业产品吗？
│   ├── 是 → Automators（按渲染量）
│   └── 否 → Creators（按席位，3 人 $75/月）
│   └── 大型/合规 → Enterprise（议价）
└── 否 → 免费 License
```

## 选型 vs vid-agent 项目

- 本地 `remotion/` 是独立项目，按 [CLAUDE.md](../../CLAUDE.md) 不属于本 skill 范围
- 个人/学习用：免费档足够
- 团队 ≥4 人 → 必须购买 Company License
- 是否引入到 vid-agent 主线：取决于是否要做"产品级包装层"

## 参考

- [Remotion LICENSE.md](https://github.com/remotion-dev/remotion/blob/main/LICENSE.md)
- [PR #3750 — 5.0 License 草案](https://github.com/remotion-dev/remotion/pull/3750)
- [remotion.pro/license](https://www.remotion.pro/license)
- [remotion.pro/editor-starter](https://www.remotion.pro/editor-starter)