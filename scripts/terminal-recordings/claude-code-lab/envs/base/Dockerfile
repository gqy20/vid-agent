FROM ubuntu:22.04
ENV LANG=C.UTF-8
ENV LC_ALL=C.UTF-8
# tmux + file（file 给 yazi 检测 MIME，否则弹 "Cannot find file" 浮窗）
RUN apt-get update && apt-get install -y --no-install-recommends tmux file \
    && rm -rf /var/lib/apt/lists/*
RUN useradd -m -u 1000 -s /bin/bash cc \
    && mkdir -p /workspace && chown -R cc:cc /workspace
USER cc
WORKDIR /workspace
CMD ["bash"]
