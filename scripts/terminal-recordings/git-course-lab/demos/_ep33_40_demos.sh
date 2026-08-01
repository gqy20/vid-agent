#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/_lib.sh"

ep33_env_repo() { export GIT_CONFIG_SYSTEM='../system.cfg' GIT_CONFIG_GLOBAL='../global.cfg'; }
ep33_env_root() { export GIT_CONFIG_SYSTEM='system.cfg' GIT_CONFIG_GLOBAL='global.cfg'; }
ep33_show_origin() { cd "$TERMINAL_RECORDING_WORKDIR/repo"; ep33_env_repo; begin_terminal; type_command 'git config get demo.label'; git config get demo.label; type_command 'git config --list --show-origin --show-scope | grep demo.label'; git config --list --show-origin --show-scope | grep demo.label; finish_terminal; }
ep33_command_scope() { cd "$TERMINAL_RECORDING_WORKDIR/repo"; ep33_env_repo; begin_terminal; type_command 'git -c demo.label=command config get demo.label'; git -c demo.label=command config get demo.label; type_command 'git config get demo.label'; git config get demo.label; finish_terminal; }
ep33_worktree_scope() { cd "$TERMINAL_RECORDING_WORKDIR"; ep33_env_root; begin_terminal; type_command 'git -C repo config get demo.label'; git -C repo config get demo.label; type_command 'git -C linked config get demo.label'; git -C linked config get demo.label; type_command 'git -C linked config get --show-scope demo.label'; git -C linked config get --show-scope demo.label; finish_terminal; }

ep34_check_ignore() { cd "$TERMINAL_RECORDING_WORKDIR/repo"; begin_terminal; type_command 'git status --short --untracked-files=all'; git status --short --untracked-files=all; type_command 'git check-ignore -v build/app.bin notes.local editor.swp debug.log keep.log'; git check-ignore -v build/app.bin notes.local editor.swp debug.log keep.log || true; finish_terminal; }
ep34_tracked_path() { cd "$TERMINAL_RECORDING_WORKDIR/repo"; begin_terminal; type_command 'git status --short'; git status --short; type_command 'git check-ignore -v tracked.env'; git check-ignore -v tracked.env || true; type_command 'git ls-files --error-unmatch tracked.env'; git ls-files --error-unmatch tracked.env; finish_terminal; }
ep34_stop_tracking() { cd "$TERMINAL_RECORDING_WORKDIR/repo"; begin_terminal; type_command 'git rm --cached tracked.env'; git rm --cached tracked.env; type_command 'test -f tracked.env && echo "Working Tree file remains"'; test -f tracked.env && echo 'Working Tree file remains'; type_command 'git status --short --ignored tracked.env'; git status --short --ignored tracked.env; finish_terminal; }

ep35_check_attr() { cd "$TERMINAL_RECORDING_WORKDIR/repo"; begin_terminal; type_command 'git check-attr text eol diff -- script.sh asset.demo'; git check-attr text eol diff -- script.sh asset.demo; type_command 'od -An -t x1 script.sh | head -2'; od -An -t x1 script.sh | head -2; finish_terminal; }
ep35_renormalize() { cd "$TERMINAL_RECORDING_WORKDIR/repo"; begin_terminal; type_command 'git add --renormalize .'; git add --renormalize .; type_command 'git diff --cached --stat'; git diff --cached --stat; type_command 'git show :script.sh | od -An -t x1 | head -2'; git show :script.sh | od -An -t x1 | head -2; finish_terminal; }
ep35_binary_diff() { cd "$TERMINAL_RECORDING_WORKDIR/repo"; begin_terminal; type_command 'git diff -- asset.demo'; git diff -- asset.demo; printf 'asset.demo -diff\n' > .gitattributes; type_command 'git diff -- asset.demo'; git diff -- asset.demo; finish_terminal; }

ep36_diff_driver() { cd "$TERMINAL_RECORDING_WORKDIR/repo"; begin_terminal; type_command 'git check-attr diff -- data.demo'; git check-attr diff -- data.demo; type_command 'git diff --no-textconv -- data.demo'; git diff --no-textconv -- data.demo; type_command 'git diff --textconv -- data.demo'; git diff --textconv -- data.demo; finish_terminal; }
ep36_merge_driver() { cd "$TERMINAL_RECORDING_WORKDIR/repo"; begin_terminal; type_command 'git check-attr merge -- data.demo'; git check-attr merge -- data.demo; type_command 'git merge feature'; GIT_AUTHOR_DATE='2026-04-09T09:00:00+08:00' GIT_COMMITTER_DATE='2026-04-09T09:00:00+08:00' git merge --no-edit feature; type_command 'cat ../merge-driver.log'; cat ../merge-driver.log; type_command 'cat data.demo'; cat data.demo; finish_terminal; }
ep36_clean_smudge() { cd "$TERMINAL_RECORDING_WORKDIR/repo"; begin_terminal; type_command 'cat data.demo'; cat data.demo; type_command 'git add data.demo && git show :data.demo'; git add data.demo && git show :data.demo; type_command 'git checkout -- data.demo && cat data.demo'; git checkout -- data.demo && cat data.demo; finish_terminal; }

ep37_pre_commit() { cd "$TERMINAL_RECORDING_WORKDIR/repo"; begin_terminal; type_command 'git rev-parse --git-path hooks'; git rev-parse --git-path hooks; type_command 'git rev-parse HEAD'; git rev-parse HEAD; type_command 'git commit -m "C1 bad change"'; git commit -m 'C1 bad change' || true; type_command 'git rev-parse HEAD'; git rev-parse HEAD; finish_terminal; }
ep37_post_commit() { cd "$TERMINAL_RECORDING_WORKDIR/repo"; begin_terminal; type_command 'git commit -m "C1 fixed change"'; GIT_AUTHOR_DATE='2026-04-11T09:00:00+08:00' GIT_COMMITTER_DATE='2026-04-11T09:00:00+08:00' git commit -m 'C1 fixed change'; type_command 'cat ../post.log'; cat ../post.log; type_command 'git log -1 --format="%H %s"'; git log -1 --format='%H %s'; finish_terminal; }
ep37_deployment() { cd "$TERMINAL_RECORDING_WORKDIR/repo"; begin_terminal; type_command 'git commit --no-verify -m "C1 bypass local check"'; GIT_AUTHOR_DATE='2026-04-12T09:00:00+08:00' GIT_COMMITTER_DATE='2026-04-12T09:00:00+08:00' git commit --no-verify -m 'C1 bypass local check'; type_command 'git clone -q . ../cloned'; git clone -q . ../cloned; type_command 'test ! -x ../cloned/.git/hooks/pre-commit && echo "custom hook not cloned"'; test ! -x ../cloned/.git/hooks/pre-commit && echo 'custom hook not cloned'; finish_terminal; }

ep38_batch_reject() { cd "$TERMINAL_RECORDING_WORKDIR/client"; begin_terminal; type_command 'git push origin main topic'; git push origin main topic || true; type_command 'cat ../hook-input.log'; cat ../hook-input.log; type_command 'git --git-dir=../remote.git show-ref'; git --git-dir=../remote.git show-ref; finish_terminal; }
ep38_topic_accept() { cd "$TERMINAL_RECORDING_WORKDIR/client"; begin_terminal; type_command 'git push origin topic'; git push origin topic; type_command 'git --git-dir=../remote.git show-ref refs/heads/topic'; git --git-dir=../remote.git show-ref refs/heads/topic; type_command 'git --git-dir=../remote.git cat-file -t refs/heads/topic'; git --git-dir=../remote.git cat-file -t refs/heads/topic; finish_terminal; }
ep38_server_boundary() { cd "$TERMINAL_RECORDING_WORKDIR/client"; begin_terminal; type_command 'git push --no-verify origin main'; git push --no-verify origin main || true; type_command 'git --git-dir=../remote.git show-ref refs/heads/main'; git --git-dir=../remote.git show-ref refs/heads/main; finish_terminal; }

ep39_signed_commit() { cd "$TERMINAL_RECORDING_WORKDIR/repo"; begin_terminal; git add app.txt; type_command 'git commit -S -m "C1 signed commit"'; GIT_AUTHOR_DATE='2026-04-14T09:00:00+08:00' GIT_COMMITTER_DATE='2026-04-14T09:00:00+08:00' git commit -S -m 'C1 signed commit'; type_command 'git cat-file commit HEAD | sed -n "1,8p"'; git cat-file commit HEAD | sed -n '1,8p'; type_command 'git verify-commit HEAD'; git verify-commit HEAD; finish_terminal; }
ep39_signed_tag() { cd "$TERMINAL_RECORDING_WORKDIR/repo"; begin_terminal; type_command 'git tag -s v1.0.0 -m "release v1"'; GIT_COMMITTER_DATE='2026-04-15T09:00:00+08:00' git tag -s v1.0.0 -m 'release v1'; type_command 'git cat-file -t v1.0.0'; git cat-file -t v1.0.0; type_command 'git verify-tag v1.0.0'; git verify-tag v1.0.0; finish_terminal; }
ep39_trust_loss() { cd "$TERMINAL_RECORDING_WORKDIR/repo"; begin_terminal; type_command 'git verify-commit HEAD'; git verify-commit HEAD; type_command 'mv ../allowed-signers ../allowed-signers.off'; mv ../allowed-signers ../allowed-signers.off; type_command 'git verify-commit HEAD'; git verify-commit HEAD || true; finish_terminal; }

ep40_author_metadata() { cd "$TERMINAL_RECORDING_WORKDIR/repo"; begin_terminal; type_command 'git var GIT_AUTHOR_IDENT'; git var GIT_AUTHOR_IDENT; git add app.txt; type_command 'git commit -m "C1 identity metadata"'; GIT_AUTHOR_DATE='2026-04-15T09:00:00+08:00' GIT_COMMITTER_DATE='2026-04-15T09:00:00+08:00' git commit -m 'C1 identity metadata'; type_command 'git show -1 --format=fuller --no-patch'; git show -1 --format=fuller --no-patch; finish_terminal; }
ep40_auth_boundary() {
  cd "$TERMINAL_RECORDING_WORKDIR/client"
  trap 'kill "$(cat "$TERMINAL_RECORDING_WORKDIR/server.pid")" 2>/dev/null || true' EXIT
  begin_terminal
  type_command 'GIT_TERMINAL_PROMPT=0 git -c credential.helper= ls-remote origin'
  GIT_TERMINAL_PROMPT=0 git -c credential.helper= ls-remote origin || true
  git config credential.helper "$TERMINAL_RECORDING_WORKDIR/reader-helper.sh"
  type_command 'git push origin main  # reader credential'
  git push origin main || true
  git config --replace-all credential.helper "$TERMINAL_RECORDING_WORKDIR/writer-helper.sh"
  type_command 'git push origin main  # writer credential'
  git push origin main
  finish_terminal
  kill "$(cat "$TERMINAL_RECORDING_WORKDIR/server.pid")" 2>/dev/null || true
  trap - EXIT
}
ep40_credential_helper() { cd "$TERMINAL_RECORDING_WORKDIR/repo"; begin_terminal; type_command 'git credential approve < ../approve.txt'; git credential approve < ../approve.txt; type_command 'git credential fill < ../query.txt'; git credential fill < ../query.txt; type_command 'git credential reject < ../reject.txt'; git credential reject < ../reject.txt; test ! -s ../credentials && printf 'credential removed\n'; finish_terminal; }

case "${TERMINAL_RECORDING_ID:-}" in
  ep33-show-origin) ep33_show_origin;; ep33-command-scope) ep33_command_scope;; ep33-worktree-scope) ep33_worktree_scope;;
  ep34-check-ignore) ep34_check_ignore;; ep34-tracked-path) ep34_tracked_path;; ep34-stop-tracking) ep34_stop_tracking;;
  ep35-check-attr) ep35_check_attr;; ep35-renormalize) ep35_renormalize;; ep35-binary-diff) ep35_binary_diff;;
  ep36-diff-driver) ep36_diff_driver;; ep36-merge-driver) ep36_merge_driver;; ep36-clean-smudge) ep36_clean_smudge;;
  ep37-pre-commit) ep37_pre_commit;; ep37-post-commit) ep37_post_commit;; ep37-deployment) ep37_deployment;;
  ep38-batch-reject) ep38_batch_reject;; ep38-topic-accept) ep38_topic_accept;; ep38-server-boundary) ep38_server_boundary;;
  ep39-signed-commit) ep39_signed_commit;; ep39-signed-tag) ep39_signed_tag;; ep39-trust-loss) ep39_trust_loss;;
  ep40-author-metadata) ep40_author_metadata;; ep40-auth-boundary) ep40_auth_boundary;; ep40-credential-helper) ep40_credential_helper;;
  *) printf 'Unknown EP33–40 recording: %s\n' "${TERMINAL_RECORDING_ID:-}" >&2; exit 1;;
esac
