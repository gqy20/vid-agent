FROM ubuntu:22.04@sha256:0e0a0fc6d18feda9db1590da249ac93e8d5abfea8f4c3c0c849ce512b5ef8982

ARG TARGETARCH
ARG NODE_VERSION=22.18.0
ARG PNPM_VERSION=10.33.3
ARG UV_VERSION=0.11.29
ARG CC_UID=1000
ARG CC_GID=1000

ENV LANG=C.UTF-8
ENV LC_ALL=C.UTF-8

# 录屏工具、真实 Git 状态和课程示例项目所需的最小通用工具链。
RUN apt-get update && apt-get install -y --no-install-recommends \
      ca-certificates curl git jq less openssh-client procps ripgrep tmux vim \
      python3 python3-pip xz-utils \
    && rm -rf /var/lib/apt/lists/*

# 固定 Node 与 pnpm，校验官方 Node 发布包后再安装。
RUN set -eux; \
    case "${TARGETARCH:-amd64}" in \
      amd64) node_arch=x64 ;; \
      arm64) node_arch=arm64 ;; \
      *) echo "unsupported TARGETARCH: ${TARGETARCH:-unset}" >&2; exit 1 ;; \
    esac; \
    node_archive="node-v${NODE_VERSION}-linux-${node_arch}.tar.xz"; \
    curl -fsSLO "https://nodejs.org/dist/v${NODE_VERSION}/${node_archive}"; \
    curl -fsSLO "https://nodejs.org/dist/v${NODE_VERSION}/SHASUMS256.txt"; \
    grep " ${node_archive}$" SHASUMS256.txt | sha256sum -c -; \
    tar -xJf "${node_archive}" -C /usr/local --strip-components=1; \
    rm -f "${node_archive}" SHASUMS256.txt; \
    npm install --global "pnpm@${PNPM_VERSION}"; \
    npm cache clean --force

# uv 只用于初始化与运行示例项目，不携带宿主虚拟环境。
RUN pip3 install --no-cache-dir "uv==${UV_VERSION}"

RUN groupadd --gid "$CC_GID" cc \
    && useradd --create-home --uid "$CC_UID" --gid "$CC_GID" --shell /bin/bash cc \
    && mkdir -p /workspace && chown -R cc:cc /workspace

LABEL org.vid-agent.component="claude-code-lab" \
      org.vid-agent.node-version="$NODE_VERSION" \
      org.vid-agent.pnpm-version="$PNPM_VERSION" \
      org.vid-agent.uv-version="$UV_VERSION"

USER cc
WORKDIR /workspace
CMD ["bash"]
