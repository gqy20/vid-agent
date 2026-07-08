# Manim 风格方向

目标不是照抄 3B1B 的配色，而是学习它的解释方式：对象逐步出现、关系被构造、抽象模型可以被看见。

## 画面规则

- 背景用深色低噪声画布。
- 一次只构造一个关系。
- 文字少于图形，标签只命名对象。
- 箭头和连线必须表示真实依赖，不做装饰。
- 对象移动要有因果：内容进入 blob，blob 进入 tree，tree 进入 commit。

## Git 对象表达

推荐对象：

- `file`: 文件内容。
- `blob`: 内容对象。
- `tree`: 目录形状。
- `commit`: 指向 tree，并携带 parent/message/author 的记录。
- `hash`: 内容身份。

推荐动作：

- `Transform`: 内容变成对象。
- `ReplacementTransform`: 抽象层替换具体层。
- `MoveAlongPath`: 引导视线到下一层。
- `LaggedStart`: 逐个构造对象关系。
- `Indicate`: 只强调一次，不循环闪烁。

## 不做

- 不把长句塞进 Manim。
- 不让所有元素同时出现。
- 不做长期晃动、呼吸、发光。
- 不用 Remotion 卡片风格复刻 Manim。

