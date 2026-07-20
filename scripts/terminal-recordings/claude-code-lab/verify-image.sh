#!/usr/bin/env bash
# 在一次性容器中验证 Claude Code Lab 基础镜像。
set -euo pipefail

LAB="$(cd "$(dirname "$0")" && pwd)"
image=${1:-}
if [[ -z "$image" ]]; then
  image=$("$LAB/build-image.sh" --print)
fi

docker image inspect "$image" >/dev/null 2>&1 || {
  echo "Missing image: $image" >&2
  exit 1
}

echo "==> verifying $image"
docker run --rm "$image" bash -lc '
  set -euo pipefail
  [[ "$(id -un)" == cc ]]
  [[ "$HOME" == /home/cc ]]
  [[ "$PWD" == /workspace ]]
  for command_name in git jq node npm pnpm python3 rg tmux uv vim; do
    command -v "$command_name" >/dev/null
  done
  node --version
  pnpm --version
  python3 --version
  uv --version
  git --version
  tmux -V
  test_dir=$(mktemp -d)
  git init -q "$test_dir/repo"
  git -C "$test_dir/repo" config user.name "Claude Code Lab"
  git -C "$test_dir/repo" config user.email "lab@example.invalid"
  printf "smoke\n" > "$test_dir/repo/example.txt"
  git -C "$test_dir/repo" add example.txt
  git -C "$test_dir/repo" commit -qm "smoke"
  [[ "$(git -C "$test_dir/repo" status --short)" == "" ]]
'
echo "==> image smoke test passed"
