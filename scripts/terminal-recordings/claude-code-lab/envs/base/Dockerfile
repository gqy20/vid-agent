FROM ubuntu:22.04
ENV LANG=C.UTF-8
ENV LC_ALL=C.UTF-8
# tmux 录制 + vim 配置演示 + curl/ca-certificates + python3(uv via pip)
RUN apt-get update && apt-get install -y --no-install-recommends \
      tmux vim curl ca-certificates python3 python3-pip \
    && rm -rf /var/lib/apt/lists/*
# node 22 + pnpm (npm 全局装，npmmirror；不依赖 corepack 的 per-user 缓存)
RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
    && apt-get install -y --no-install-recommends nodejs \
    && npm install -g pnpm --registry=https://registry.npmmirror.com
# uv (pip，清华镜像加速)
RUN pip3 install uv -i https://pypi.tuna.tsinghua.edu.cn/simple
# cc 用户
RUN useradd -m -u 1000 -s /bin/bash cc \
    && mkdir -p /workspace && chown -R cc:cc /workspace
USER cc
WORKDIR /workspace
CMD ["bash"]
