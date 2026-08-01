#!/usr/bin/env bash
set -euo pipefail

new_repo() { git init -q -b main "$1"; }
commit_at() {
  local repo="$1" message="$2" day="$3"
  git -C "$repo" add -A
  GIT_AUTHOR_DATE="2026-04-${day}T09:00:00+08:00" GIT_COMMITTER_DATE="2026-04-${day}T09:00:00+08:00" git -C "$repo" commit -q -m "$message"
}

ep33_base() {
  cd "$TERMINAL_RECORDING_WORKDIR"
  printf '[demo]\n\tlabel = system\n' > system.cfg
  printf '[demo]\n\tlabel = global\n' > global.cfg
  new_repo repo
  git -C repo config demo.label local
  printf 'base\n' > repo/app.txt
  commit_at repo 'C0 base' 01
}
ep33_worktree() {
  ep33_base
  git -C repo config extensions.worktreeConfig true
  git -C repo worktree add -q -b linked ../linked main
  git -C linked config --worktree demo.label worktree
}

ep34_base() {
  cd "$TERMINAL_RECORDING_WORKDIR"
  new_repo repo
  printf 'tracked=true\n' > repo/tracked.env
  commit_at repo 'C0 tracked config' 02
  printf '/build/\n*.log\n!keep.log\ntracked.env\n' > repo/.gitignore
  git -C repo add .gitignore
  GIT_AUTHOR_DATE='2026-04-03T09:00:00+08:00' GIT_COMMITTER_DATE='2026-04-03T09:00:00+08:00' git -C repo commit -q -m 'C1 add shared ignores'
  mkdir -p repo/build
  printf 'artifact\n' > repo/build/app.bin
  printf 'local notes\n' > repo/notes.local
  printf 'swap\n' > repo/editor.swp
  printf 'ignored log\n' > repo/debug.log
  printf 'kept log\n' > repo/keep.log
  printf 'notes.local\n' >> repo/.git/info/exclude
  printf '*.swp\n' > global-excludes
  git -C repo config core.excludesFile ../global-excludes
}
ep34_tracked() { ep34_base; printf 'tracked=changed\n' > repo/tracked.env; }

ep35_base() {
  cd "$TERMINAL_RECORDING_WORKDIR"
  new_repo repo
  printf '#!/bin/sh\r\necho demo\r\n' > repo/script.sh
  printf '00 01 02 03 04 05 06 07\n' > repo/asset.demo
  commit_at repo 'C0 raw fixtures' 04
}
ep35_attributes() {
  ep35_base
  printf 'script.sh text eol=lf\nasset.demo -diff\n' > repo/.gitattributes
}
ep35_binary() { ep35_base; printf '90 91 92 93 94 95 96 97\n' > repo/asset.demo; }

ep36_diff() {
  cd "$TERMINAL_RECORDING_WORKDIR"
  new_repo repo
  printf 'data.demo diff=demo\n' > repo/.gitattributes
  printf 'name=alpha;value=1\n' > repo/data.demo
  commit_at repo 'C0 demo data' 05
  printf '#!/usr/bin/env bash\ntr ";" "\\n" < "$1"\n' > textconv.sh
  chmod +x textconv.sh
  git -C repo config diff.demo.textconv "$TERMINAL_RECORDING_WORKDIR/textconv.sh"
  printf 'name=alpha;value=2\n' > repo/data.demo
}
ep36_merge() {
  cd "$TERMINAL_RECORDING_WORKDIR"
  new_repo repo
  printf 'data.demo merge=demo\n' > repo/.gitattributes
  printf 'name=alpha\n' > repo/data.demo
  commit_at repo 'C0 merge base' 06
  git -C repo switch -q -c feature
  printf 'name=alpha;right=theirs\n' > repo/data.demo
  commit_at repo 'F1 feature value' 07
  git -C repo switch -q main
  printf 'name=alpha;left=ours\n' > repo/data.demo
  commit_at repo 'M1 main value' 08
  printf '#!/usr/bin/env bash\nprintf "base=%%s ours=%%s theirs=%%s\\n" "$1" "$2" "$3" > "%s/merge-driver.log"\nprintf "name=alpha;left=ours;right=theirs\\n" > "$2"\n' "$TERMINAL_RECORDING_WORKDIR" > merge-driver.sh
  chmod +x merge-driver.sh
  git -C repo config merge.demo.driver "$TERMINAL_RECORDING_WORKDIR/merge-driver.sh %O %A %B"
}
ep36_filter() {
  cd "$TERMINAL_RECORDING_WORKDIR"
  new_repo repo
  printf '#!/usr/bin/env sh\nsed "s/^EDIT://"\n' > clean.sh
  printf '#!/usr/bin/env sh\nsed "s/^/EDIT:/"\n' > smudge.sh
  chmod +x clean.sh smudge.sh
  printf 'data.demo filter=demo\n' > repo/.gitattributes
  git -C repo config filter.demo.clean "$TERMINAL_RECORDING_WORKDIR/clean.sh"
  git -C repo config filter.demo.smudge "$TERMINAL_RECORDING_WORKDIR/smudge.sh"
  printf 'EDIT:value=one\n' > repo/data.demo
  commit_at repo 'C0 filtered data' 09
  printf 'EDIT:value=two\n' > repo/data.demo
}

ep37_base() {
  cd "$TERMINAL_RECORDING_WORKDIR"
  new_repo repo
  printf 'GOOD\n' > repo/app.txt
  printf '#!/usr/bin/env bash\ngrep -q GOOD app.txt\n' > repo/test.sh
  chmod +x repo/test.sh
  commit_at repo 'C0 passing app' 10
}
ep37_pre() {
  ep37_base
  printf 'BAD\n' > repo/app.txt
  git -C repo add app.txt
  printf '#!/usr/bin/env bash\n./test.sh || { echo "pre-commit: TEST FAIL"; exit 1; }\n' > repo/.git/hooks/pre-commit
  chmod +x repo/.git/hooks/pre-commit
}
ep37_post() {
  ep37_base
  printf 'GOOD fixed\n' > repo/app.txt
  git -C repo add app.txt
  printf '#!/usr/bin/env bash\n./test.sh && echo "pre-commit: TEST PASS"\n' > repo/.git/hooks/pre-commit
  printf '#!/usr/bin/env bash\nprintf "post-commit %s\\n" "$(git rev-parse HEAD)" >> ../post.log\n' > repo/.git/hooks/post-commit
  chmod +x repo/.git/hooks/pre-commit repo/.git/hooks/post-commit
}
ep37_deployment() { ep37_pre; }

ep38_base() {
  cd "$TERMINAL_RECORDING_WORKDIR"
  new_repo seed
  printf 'base\n' > seed/app.txt
  commit_at seed 'C0 base' 11
  git init -q --bare remote.git
  git -C seed remote add origin "$TERMINAL_RECORDING_WORKDIR/remote.git"
  git -C seed push -q origin main
  git clone -q remote.git client
  git -C client remote set-url origin ../remote.git
  printf '#!/usr/bin/env bash\nset -euo pipefail\n: > "%s/hook-input.log"\nreject=0\nwhile read -r old new ref; do\n  printf "%%s %%s %%s\\n" "$old" "$new" "$ref" >> "%s/hook-input.log"\n  if [[ "$ref" == refs/heads/main ]]; then echo "POLICY: direct main update denied" >&2; reject=1; fi\ndone\nexit "$reject"\n' "$TERMINAL_RECORDING_WORKDIR" "$TERMINAL_RECORDING_WORKDIR" > remote.git/hooks/pre-receive
  chmod +x remote.git/hooks/pre-receive
  git -C client switch -q -c topic
  printf 'topic\n' > client/topic.txt
  commit_at client 'T1 topic work' 12
  git -C client switch -q main
  printf 'main\n' > client/main.txt
  commit_at client 'M1 direct main work' 13
}

ep39_base() {
  cd "$TERMINAL_RECORDING_WORKDIR"
  new_repo repo
  ssh-keygen -q -t ed25519 -N '' -C 'course@example.local' -f signing-key
  printf 'course@example.local %s\n' "$(cat signing-key.pub)" > allowed-signers
  git -C repo config gpg.format ssh
  git -C repo config user.signingKey "$TERMINAL_RECORDING_WORKDIR/signing-key"
  git -C repo config gpg.ssh.allowedSignersFile ../allowed-signers
  printf 'signed content\n' > repo/app.txt
}
ep39_signed() {
  ep39_base
  git -C repo add app.txt
  GIT_AUTHOR_DATE='2026-04-14T09:00:00+08:00' GIT_COMMITTER_DATE='2026-04-14T09:00:00+08:00' git -C repo commit -q -S -m 'C1 signed commit'
}

ep40_author() {
  cd "$TERMINAL_RECORDING_WORKDIR"
  new_repo repo
  git -C repo config user.name 'Demo Author'
  git -C repo config user.email 'demo@example.local'
  printf 'identity demo\n' > repo/app.txt
}
ep40_http() {
  cd "$TERMINAL_RECORDING_WORKDIR"
  new_repo seed
  printf 'base\n' > seed/app.txt
  commit_at seed 'C0 HTTP base' 15
  mkdir http-root
  git init -q --bare http-root/repo.git
  git -C http-root/repo.git config http.receivepack true
  git -C seed push -q "$TERMINAL_RECORDING_WORKDIR/http-root/repo.git" main
  git clone -q http-root/repo.git client
  printf 'writer update\n' > client/update.txt
  commit_at client 'C1 writer update' 16
  printf '#!/usr/bin/env sh\nif [ "$1" = get ]; then printf "username=reader\\npassword=readpass\\n"; fi\n' > reader-helper.sh
  printf '#!/usr/bin/env sh\nif [ "$1" = get ]; then printf "username=writer\\npassword=writepass\\n"; fi\n' > writer-helper.sh
  chmod +x reader-helper.sh writer-helper.sh
  git -C client remote set-url origin 'http://127.0.0.1:18080/repo.git'
  local base_dir
  base_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
  python3 "$base_dir/http_git_server.py" "$TERMINAL_RECORDING_WORKDIR/http-root" 18080 > server.log 2>&1 &
  printf '%s\n' "$!" > server.pid
  for _ in {1..30}; do curl -s -o /dev/null http://127.0.0.1:18080/health && break; sleep 0.1; done
}
ep40_helper() {
  cd "$TERMINAL_RECORDING_WORKDIR"
  new_repo repo
  git -C repo config credential.helper "store --file=$TERMINAL_RECORDING_WORKDIR/credentials"
  printf 'protocol=https\nhost=git.example.local\npath=team/repo\nusername=writer\npassword=test-secret\n\n' > approve.txt
  printf 'protocol=https\nhost=git.example.local\npath=team/repo\n\n' > query.txt
  printf 'protocol=https\nhost=git.example.local\npath=team/repo\nusername=writer\n\n' > reject.txt
}

case "${TERMINAL_RECORDING_ID:-}" in
  ep33-show-origin|ep33-command-scope) ep33_base;; ep33-worktree-scope) ep33_worktree;;
  ep34-check-ignore) ep34_base;; ep34-tracked-path|ep34-stop-tracking) ep34_tracked;;
  ep35-check-attr|ep35-renormalize) ep35_attributes;; ep35-binary-diff) ep35_binary;;
  ep36-diff-driver) ep36_diff;; ep36-merge-driver) ep36_merge;; ep36-clean-smudge) ep36_filter;;
  ep37-pre-commit) ep37_pre;; ep37-post-commit) ep37_post;; ep37-deployment) ep37_deployment;;
  ep38-batch-reject|ep38-topic-accept|ep38-server-boundary) ep38_base;;
  ep39-signed-commit) ep39_base;; ep39-signed-tag|ep39-trust-loss) ep39_signed;;
  ep40-author-metadata) ep40_author;; ep40-auth-boundary) ep40_http;; ep40-credential-helper) ep40_helper;;
  '') ;;
  *) printf 'Unknown EP33–40 recording: %s\n' "$TERMINAL_RECORDING_ID" >&2; exit 1;;
esac
