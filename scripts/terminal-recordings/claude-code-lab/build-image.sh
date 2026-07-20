#!/usr/bin/env bash
# 构建或复用由有效构建输入指纹标识的 Claude Code Lab 基础镜像。
set -euo pipefail

LAB="$(cd "$(dirname "$0")" && pwd)"
CONTEXT="$LAB/envs/base"
IMAGE_REPO=${CC_BASE_IMAGE_REPO:-cc-base}
CC_UID=${CC_UID:-1000}
CC_GID=${CC_GID:-1000}
BUILD_NETWORK=${CC_BUILD_NETWORK:-default}
REBUILD=${REBUILD:-0}
PRINT_ONLY=0

usage() {
  echo "usage: build-image.sh [--print] [--rebuild]" >&2
}

while (($#)); do
  case "$1" in
    --print) PRINT_ONLY=1 ;;
    --rebuild) REBUILD=1 ;;
    -h|--help) usage; exit 0 ;;
    *) usage; exit 2 ;;
  esac
  shift
done

for command_name in docker sha256sum; do
  command -v "$command_name" >/dev/null || {
    echo "Missing command: $command_name" >&2
    exit 1
  }
done

[[ -f "$CONTEXT/Dockerfile" ]] || {
  echo "Missing Dockerfile: $CONTEXT/Dockerfile" >&2
  exit 1
}

fingerprint=$(
  {
    printf 'CC_UID=%s\nCC_GID=%s\n' "$CC_UID" "$CC_GID"
    cd "$CONTEXT"
    find . -type f ! -name yazi.bin -print0 \
      | sort -z \
      | xargs -0 sha256sum
  } | sha256sum | cut -c1-12
)
image="$IMAGE_REPO:$fingerprint"

if ((PRINT_ONLY)); then
  printf '%s\n' "$image"
  exit 0
fi

if docker image inspect "$image" >/dev/null 2>&1 && [[ "$REBUILD" != 1 ]]; then
  echo "==> reusing $image" >&2
else
  echo "==> building $image" >&2
  proxy_args=()
  for proxy_name in HTTP_PROXY HTTPS_PROXY ALL_PROXY NO_PROXY http_proxy https_proxy all_proxy no_proxy; do
    if [[ -n "${!proxy_name-}" ]]; then
      proxy_args+=( --build-arg "$proxy_name" )
    fi
  done
  docker build --progress=plain \
    --network "$BUILD_NETWORK" \
    --label "org.vid-agent.build-fingerprint=$fingerprint" \
    --build-arg "CC_UID=$CC_UID" \
    --build-arg "CC_GID=$CC_GID" \
    "${proxy_args[@]}" \
    --tag "$image" \
    "$CONTEXT" >&2
fi

printf '%s\n' "$image"
