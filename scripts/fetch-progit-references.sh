#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
REF_DIR="$ROOT_DIR/docs/references"

mkdir -p "$REF_DIR"

fetch_repo() {
  local name="$1"
  local url="$2"
  local commit="$3"
  local dest="$REF_DIR/$name"

  if [[ -d "$dest/.git" ]]; then
    echo "Updating $name..."
    git -C "$dest" fetch --depth 1 origin
  elif [[ -e "$dest" ]]; then
    echo "Refusing to overwrite non-git path: $dest" >&2
    exit 1
  else
    echo "Cloning $name..."
    git clone --depth 1 "$url" "$dest"
  fi

  git -C "$dest" checkout --detach "$commit"
  echo "$name: $(git -C "$dest" rev-parse --short HEAD)"
}

fetch_repo "progit2" "https://github.com/progit/progit2.git" "a013e3230a1207cfa5ae94d28ba7d2021063c337"
fetch_repo "progit2-zh" "https://github.com/progit/progit2-zh.git" "e5c1da8a64a718f5e53faa4d863f0f5383604ed8"
