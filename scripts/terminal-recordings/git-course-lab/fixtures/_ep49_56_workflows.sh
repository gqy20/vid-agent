#!/usr/bin/env bash
set -euo pipefail

new_repo() { git init -q -b main "$1"; }
commit_at() {
  local repo="$1" message="$2" day="$3"
  git -C "$repo" add -A
  GIT_AUTHOR_DATE="2026-06-${day}T09:00:00+08:00" GIT_COMMITTER_DATE="2026-06-${day}T09:00:00+08:00" git -C "$repo" commit -q -m "$message"
}

internals_base() {
  cd "$TERMINAL_RECORDING_WORKDIR"
  new_repo repo
  printf '# Git internals lab\n' > repo/README.md
  commit_at repo 'C0 lab base' 01
  printf 'export const value = 1;\n' > repo/app.js
}

internals_committed() {
  internals_base
  commit_at repo 'C1 add app' 02
}

blob_input() {
  cd "$TERMINAL_RECORDING_WORKDIR"
  new_repo repo
  printf 'export const value = 1;\n' > repo/app.js
}

tree_input() {
  blob_input
  git -C repo hash-object -w app.js > blob-oid
}

write_tree_from_blob() {
  tree_input
  local blob
  blob="$(cat blob-oid)"
  GIT_INDEX_FILE="$PWD/repo/.git/lab-index" git -C repo read-tree --empty
  GIT_INDEX_FILE="$PWD/repo/.git/lab-index" git -C repo update-index --add --cacheinfo "100644,$blob,app.js"
  GIT_INDEX_FILE="$PWD/repo/.git/lab-index" git -C repo write-tree > tree-oid
}

commit_objects() {
  write_tree_from_blob
  local tree first second
  tree="$(cat tree-oid)"
  first="$(printf 'C1 snapshot\n' | GIT_AUTHOR_DATE='2026-06-03T09:00:00+08:00' GIT_COMMITTER_DATE='2026-06-03T09:00:00+08:00' git -C repo commit-tree "$tree")"
  second="$(printf 'C2 same tree, new parent\n' | GIT_AUTHOR_DATE='2026-06-04T09:00:00+08:00' GIT_COMMITTER_DATE='2026-06-04T09:00:00+08:00' git -C repo commit-tree "$tree" -p "$first")"
  printf '%s\n' "$first" > first-commit
  printf '%s\n' "$second" > second-commit
}

tagged_objects() {
  commit_objects
  local second
  second="$(cat second-commit)"
  GIT_COMMITTER_DATE='2026-06-05T09:00:00+08:00' git -C repo tag -a v-model -m 'model snapshot' "$second"
}

remote_pair() {
  cd "$TERMINAL_RECORDING_WORKDIR"
  new_repo seed
  printf 'base\n' > seed/app.txt
  commit_at seed 'C1 base' 06
  git clone -q --bare seed remote.git
  git clone -q "file://$PWD/remote.git" local
  git -C seed switch -q -c topic
  printf 'topic\n' > seed/topic.txt
  commit_at seed 'T1 topic' 07
  git -C seed push -q origin topic 2>/dev/null || git -C seed push -q "$PWD/remote.git" topic
}

pack_history() {
  cd "$TERMINAL_RECORDING_WORKDIR"
  new_repo repo
  mkdir -p repo/data
  for version in 1 2 3 4 5 6; do
    {
      for line in $(seq 1 1400); do
        printf 'record %04d stable payload for delta compression\n' "$line"
      done
      printf 'version marker %s\n' "$version"
    } > repo/data/catalog.txt
    commit_at repo "C$version catalog version $version" "$(printf '%02d' $((7 + version)))"
  done
}

transfer_pair() {
  cd "$TERMINAL_RECORDING_WORKDIR"
  new_repo seed
  printf 'base\n' > seed/app.txt
  commit_at seed 'C1 base' 14
  git clone -q --bare seed remote.git
  git clone -q "file://$PWD/remote.git" client
  printf 'remote update\n' >> seed/app.txt
  commit_at seed 'C2 remote update' 15
  git -C seed push -q "$PWD/remote.git" main
  git -C remote.git rev-parse main > remote-tip
}

case "${TERMINAL_RECORDING_ID:-}" in
  ep49-porcelain-commit) internals_base;;
  ep49-inspect-objects|ep49-inspect-state) internals_committed;;
  ep50-calculate-oid|ep50-write-object|ep50-compare-bytes) blob_input;;
  ep51-temporary-index|ep51-write-tree|ep51-rename-path) tree_input;;
  ep52-first-commit|ep52-parent-commit) write_tree_from_blob;;
  ep52-annotated-tag) commit_objects;;
  ep53-create-branch|ep53-head-guard|ep53-pack-refs) tagged_objects;;
  ep54-default-fetch|ep54-explicit-fetch|ep54-push-rename) remote_pair;;
  ep55-loose-count|ep55-repack|ep55-verify-delta) pack_history;;
  ep56-fetch-trace|ep56-fetch-result|ep56-push-trace) transfer_pair;;
  '') ;;
  *) printf 'Unknown EP49–56 recording: %s\n' "$TERMINAL_RECORDING_ID" >&2; exit 1;;
esac
