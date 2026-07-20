# Claude Code Lab 录屏容器环境设计

## 目标

加固现有 `scripts/terminal-recordings/claude-code-lab/` 单镜像录屏环境，使它能在本地被确定地构建、验证和复用，并继续支持：

- `install` 模式：在干净 Ubuntu 环境中现场安装 Claude Code；
- `run` 模式：挂载宿主已有 Claude Code 安装，用于后续课程录制；
- 每集 fixture、导演脚本和真实文件/测试/diff 状态仍由现有 lab 流程提供。

本次不实现 Claude Code Course orchestrator、Candidate、Current、Release 或 Publish，也不迁移旧 EP01 内容。

## 方案

保留一个通用 Ubuntu 22.04 基础镜像，不引入 Compose、Dev Container 或多层 episode 镜像。基础镜像只提供录屏与示例项目需要的稳定工具链，不包含课程内容、Claude 账号、认证令牌或宿主文件。

镜像身份由 Dockerfile 和纳入构建上下文的配置共同决定。构建入口计算内容指纹并生成镜像标签，录制脚本引用该标签，从而避免 `cc-base:latest` 指向过期环境。调用者仍可显式要求重新构建。

## 组件边界

### 基础镜像

`scripts/terminal-recordings/claude-code-lab/envs/base/Dockerfile` 负责：

- Ubuntu 22.04、UTF-8 locale、非 root `cc` 用户和 `/workspace` 工作目录；
- 录屏与真实工程演示所需的 Git、tmux、Vim、curl、CA、Python、Node.js、pnpm、uv 及小型诊断工具；
- 通过构建参数固定会漂移的 pnpm、uv 等工具版本；
- 清理包管理器缓存，避免把密钥、代理或 episode fixture 烘焙进镜像。

`.dockerignore` 排除本地二进制缓存、编辑器文件和其他不参与镜像身份的内容。

### 镜像构建入口

`scripts/terminal-recordings/claude-code-lab/build-image.sh` 负责：

- 对有效构建输入计算 SHA-256 指纹；
- 生成并输出 `cc-base:<short-fingerprint>` 标签；
- 镜像不存在时构建，存在时复用；
- 支持显式重建和只打印镜像身份，供测试与录制编排使用；
- 构建失败时保持旧镜像可用，不伪造成功状态。

### 镜像自检

`scripts/terminal-recordings/claude-code-lab/verify-image.sh` 在临时容器内检查：

- 容器以 `cc` 用户启动，HOME 与工作目录正确；
- Git、Node.js、pnpm、Python、uv、tmux、Vim、curl 与证书工具可用；
- 关键版本满足 Dockerfile 声明；
- 临时容器退出后不保留状态。

### 录制编排

`record-tmux.sh` 不再硬编码 `cc-base:latest`，而是通过构建入口取得当前镜像标签。`REBUILD=1` 的兼容语义保留。代理配置改为可选环境输入；认证令牌继续只通过运行时环境传入，不写入命令日志、timeline、镜像层或仓库。

`install` 与 `run` 两种模式的现有行为保持不变。Claude Code 本身仍不固定在基础镜像中：前者用于拍摄真实安装，后者挂载宿主安装目录。

## 数据与安全边界

构建输入只包含可提交的基础环境文件。episode fixture 在容器启动时由只读 lab 挂载初始化。宿主 Claude 安装在 `run` 模式只读挂载，`.env`、token 和代理值不进入 Docker build context。

录制前继续检查必需环境变量；日志只能输出长度或是否存在，不能输出实际值。敏感 cast、GIF 和未打码视频沿用临时目录与退出清理策略。

## 错误处理

- Docker 不可用、构建输入缺失或版本参数非法时，在启动录制前失败；
- 镜像构建失败时返回非零，不更新可复用镜像身份；
- 自检缺少任一工具或版本不符时返回非零；
- 未设置代理时不注入代理变量；设置代理时只向运行容器传递，不写入镜像；
- `record-tmux.sh` 的 episode、模式、宿主命令与认证检查继续先于录制执行。

## 验证策略

先为构建入口和录制编排的纯逻辑写失败测试，再实现最小行为。测试覆盖：

- 相同构建输入产生相同标签；
- 构建输入变化会改变标签；
- 已存在镜像默认复用，显式重建会调用构建；
- `record-tmux.sh` 使用指纹标签并正确传递重建选择；
- 未配置代理时命令中不出现硬编码代理。

实现后执行：

1. shell/Python 自动化测试；
2. Dockerfile 静态构建检查；
3. 真实镜像构建；
4. `verify-image.sh` 容器 smoke test；
5. `record-tmux.sh` 的非录制前置检查，避免为了环境验证消耗真实 token 或生成公开素材。

## 完成标准

- 本机生成一个由当前构建输入指纹标识的 `cc-base` 镜像；
- 镜像自检全部通过；
- 后续录制会自动复用正确镜像，环境输入变化时自动使用新标签；
- 文档说明首次构建、重建、自检、代理和双模式用法；
- 不改变课程内容身份，也不绕过尚未实现的生产门禁。
