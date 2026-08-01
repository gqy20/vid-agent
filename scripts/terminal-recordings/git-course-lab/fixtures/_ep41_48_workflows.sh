#!/usr/bin/env bash
set -euo pipefail

new_repo() { git init -q -b main "$1"; }
commit_at() {
  local repo="$1" message="$2" day="$3"
  git -C "$repo" add -A
  GIT_AUTHOR_DATE="2026-05-${day}T09:00:00+08:00" GIT_COMMITTER_DATE="2026-05-${day}T09:00:00+08:00" git -C "$repo" commit -q -m "$message"
}

submodule_pair() {
  cd "$TERMINAL_RECORDING_WORKDIR"
  new_repo child-src
  printf 'core v1\n' > child-src/core.txt
  commit_at child-src 'L1 core v1' 01
  git clone -q --bare child-src child.git
  new_repo parent
  printf 'parent\n' > parent/README.md
  commit_at parent 'P0 parent base' 02
}
ep41_add() { submodule_pair; }
ep41_link() {
  submodule_pair
  git -C parent -c protocol.file.allow=always submodule add -q ../child.git libs/core
  commit_at parent 'P1 add core submodule' 03
}

ep42_remote() {
  ep41_link
  git clone -q --bare parent parent.git
}

ep43_collab() {
  ep42_remote
  git -c protocol.file.allow=always clone -q parent.git developer
  git -C developer -c protocol.file.allow=always submodule update -q --init
  git -C developer/libs/core switch -q -c feature
  printf 'core v2\n' >> developer/libs/core/core.txt
  commit_at developer/libs/core 'L2 local child change' 04
  git -C developer add libs/core
  commit_at developer 'P2 select child L2' 05
}

ep44_worktrees() {
  cd "$TERMINAL_RECORDING_WORKDIR"
  new_repo repo
  printf 'base\n' > repo/app.txt
  commit_at repo 'C0 base' 06
  printf 'unfinished\n' >> repo/app.txt
}
ep44_added() {
  ep44_worktrees
  git -C repo worktree add -q -b hotfix ../hotfix main
}

ep45_history() {
  cd "$TERMINAL_RECORDING_WORKDIR"
  new_repo source
  printf 'one\n' > source/app.txt; commit_at source 'C1 base' 07
  printf 'two\n' >> source/app.txt; commit_at source 'C2 feature' 08
  git -C source tag v1.0
  git -C source switch -q -c topic
  printf 'topic\n' > source/topic.txt; commit_at source 'T1 topic' 09
  git -C source switch -q main
}
ep45_full() { ep45_history; }
ep45_clone() { ep45_history; git -C source bundle create ../full.bundle --all; }
ep45_incremental() {
  ep45_history
  git -C source bundle create ../full.bundle --all
  git clone -q full.bundle receiver
  printf 'three\n' >> source/app.txt; commit_at source 'C3 offline update' 10
}

ep46_source() {
  cd "$TERMINAL_RECORDING_WORKDIR"
  new_repo source
  mkdir -p source/app source/docs source/assets
  printf 'app v1\n' > source/app/main.txt
  printf 'guide v1\n' > source/docs/guide.md
  dd if=/dev/zero bs=1024 count=96 2>/dev/null | tr '\0' A > source/assets/large.bin
  commit_at source 'C1 project base' 11
  printf 'app v2\n' >> source/app/main.txt; commit_at source 'C2 app update' 12
  printf 'guide v2\n' >> source/docs/guide.md; commit_at source 'C3 docs update' 13
  printf 'app v3\n' >> source/app/main.txt; commit_at source 'C4 latest app' 14
  git clone -q --bare source remote.git
  git -C remote.git config uploadpack.allowFilter true
  git -C remote.git config uploadpack.allowAnySHA1InWant true
}
ep46_sparse() { ep46_source; git clone -q remote.git sparse; }
ep46_partial() { ep46_source; }
ep46_shallow() { ep46_source; }

ep47_files() {
  cd "$TERMINAL_RECORDING_WORKDIR"
  new_repo repo
  printf '/build/\n*.log\n' > repo/.gitignore
  printf 'tracked\n' > repo/tracked.txt
  commit_at repo 'C1 tracked baseline' 15
  mkdir -p repo/build repo/cache repo/nested
  printf 'artifact\n' > repo/build/app.bin
  printf 'debug\n' > repo/debug.log
  printf 'notes\n' > repo/notes.txt
  printf 'cache\n' > repo/cache/data.tmp
  git init -q -b main repo/nested
  printf 'nested\n' > repo/nested/inside.txt
  git -C repo/nested add .
  GIT_AUTHOR_DATE='2026-05-16T09:00:00+08:00' GIT_COMMITTER_DATE='2026-05-16T09:00:00+08:00' git -C repo/nested commit -q -m 'N1 nested'
}

ep48_reflog() {
  cd "$TERMINAL_RECORDING_WORKDIR"
  new_repo repo
  printf 'base\n' > repo/app.txt; commit_at repo 'C1 base' 17
  printf 'recover me\n' >> repo/app.txt; commit_at repo 'C2 recover me' 18
  git -C repo rev-parse HEAD > lost-oid
}
ep48_prune() {
  ep48_reflog
  git -C repo reset -q --hard HEAD^
  git -C repo reflog expire --expire=now --all
  printf 'prune me\n' >> repo/app.txt; commit_at repo 'C3 prune me' 19
  git -C repo rev-parse HEAD > prune-oid
}

case "${TERMINAL_RECORDING_ID:-}" in
  ep41-add-submodule) ep41_add;; ep41-gitlink-entry|ep41-independent-history) ep41_link;;
  ep42-empty-after-clone|ep42-init-update|ep42-recursive-clone) ep42_remote;;
  ep43-gitlink-change|ep43-missing-child|ep43-publish-order) ep43_collab;;
  ep44-add-hotfix) ep44_worktrees;; ep44-shared-state|ep44-branch-guard) ep44_added;;
  ep45-full-bundle) ep45_full;; ep45-clone-bundle) ep45_clone;; ep45-incremental-bundle) ep45_incremental;;
  ep46-sparse-checkout) ep46_sparse;; ep46-partial-clone) ep46_partial;; ep46-shallow-clone) ep46_shallow;;
  ep47-classify-files|ep47-dry-runs|ep47-scoped-clean) ep47_files;;
  ep48-reflog-protection|ep48-rescue-commit) ep48_reflog;; ep48-prune-object) ep48_prune;;
  '') ;;
  *) printf 'Unknown EP41–48 recording: %s\n' "$TERMINAL_RECORDING_ID" >&2; exit 1;;
esac
