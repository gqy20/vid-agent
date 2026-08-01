#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/_lib.sh"

ep25_topic_start() { cd "$TERMINAL_RECORDING_WORKDIR/repo"; begin_terminal; type_command 'git switch -c topic/login main'; git switch -q -c topic/login main; printf 'form\n' >> app.txt; git add app.txt; type_command 'git commit -m "C1 add login form"'; GIT_AUTHOR_DATE='2026-03-02T09:00:00+08:00' GIT_COMMITTER_DATE='2026-03-02T09:00:00+08:00' git commit -m 'C1 add login form'; printf 'validation\n' >> app.txt; git add app.txt; type_command 'git commit -m "C2 validate login"'; GIT_AUTHOR_DATE='2026-03-03T09:00:00+08:00' GIT_COMMITTER_DATE='2026-03-03T09:00:00+08:00' git commit -m 'C2 validate login'; finish_terminal; }
ep25_integrate() { cd "$TERMINAL_RECORDING_WORKDIR/repo"; begin_terminal; type_command 'git log --graph --oneline --all'; git log --graph --oneline --all; type_command 'git merge --no-ff topic/login'; GIT_AUTHOR_DATE='2026-03-04T09:00:00+08:00' GIT_COMMITTER_DATE='2026-03-04T09:00:00+08:00' git merge --no-ff topic/login -m 'merge login topic'; finish_terminal; }
ep25_delete() { cd "$TERMINAL_RECORDING_WORKDIR/repo"; begin_terminal; type_command 'git branch -d topic/login'; git branch -d topic/login; type_command 'git log --graph --oneline --all'; git log --graph --oneline --all; finish_terminal; }

ep26_alice_push() { cd "$TERMINAL_RECORDING_WORKDIR/alice"; begin_terminal; printf 'alice\n' > alice.txt; git add alice.txt; type_command 'git commit -m "A1 alice change"'; GIT_AUTHOR_DATE='2026-03-06T09:00:00+08:00' GIT_COMMITTER_DATE='2026-03-06T09:00:00+08:00' git commit -m 'A1 alice change'; type_command 'git push origin main'; git push origin main; finish_terminal; }
ep26_bob_reject() { cd "$TERMINAL_RECORDING_WORKDIR/bob"; begin_terminal; type_command 'git push origin main'; git push origin main || true; type_command 'git rev-parse HEAD'; git rev-parse HEAD; finish_terminal; }
ep26_bob_integrate() { cd "$TERMINAL_RECORDING_WORKDIR/bob"; begin_terminal; type_command 'git fetch origin'; git fetch origin; type_command 'git merge origin/main'; GIT_AUTHOR_DATE='2026-03-08T09:00:00+08:00' GIT_COMMITTER_DATE='2026-03-08T09:00:00+08:00' git merge origin/main -m 'integrate Alice'; type_command 'git push origin main'; git push origin main; finish_terminal; }

ep27_publish_topic() { cd "$TERMINAL_RECORDING_WORKDIR/contributor"; begin_terminal; type_command 'git remote add public ../contributor.git'; git remote add public "$TERMINAL_RECORDING_WORKDIR/contributor.git"; type_command 'git push public topic/login'; git push public topic/login; finish_terminal; }
ep27_maintainer_fetch() { cd "$TERMINAL_RECORDING_WORKDIR/maintainer"; begin_terminal; type_command 'git remote add contributor ../contributor.git'; git remote add contributor "$TERMINAL_RECORDING_WORKDIR/contributor.git"; type_command 'git fetch contributor'; git fetch contributor; type_command 'git log --oneline main..contributor/topic/login'; git log --oneline main..contributor/topic/login; finish_terminal; }
ep27_review_integrate() { cd "$TERMINAL_RECORDING_WORKDIR/maintainer"; begin_terminal; type_command 'git merge --no-ff contributor/topic/login'; GIT_AUTHOR_DATE='2026-03-11T09:00:00+08:00' GIT_COMMITTER_DATE='2026-03-11T09:00:00+08:00' git merge --no-ff contributor/topic/login -m 'accept login topic'; type_command 'git push origin main'; git push origin main; finish_terminal; }

ep28_inspect_dirty() { cd "$TERMINAL_RECORDING_WORKDIR/repo"; begin_terminal; type_command 'git status --short'; semantic_status; type_command 'git diff --check'; git diff --check || true; type_command 'git diff -- app.js'; git diff -- app.js; finish_terminal; }
ep28_verify_index() { cd "$TERMINAL_RECORDING_WORKDIR/repo"; begin_terminal; type_command 'git diff --cached'; git diff --cached; type_command './test.sh'; ./test.sh && printf 'PASS\n'; type_command 'git status --short'; semantic_status; finish_terminal; }
ep28_review_range() { cd "$TERMINAL_RECORDING_WORKDIR/repo"; begin_terminal; type_command 'git log --reverse --stat --oneline upstream/main..HEAD'; git log --reverse --stat --oneline upstream/main..HEAD; type_command 'git status --short'; semantic_status; finish_terminal; }

ep29_format_patch() { cd "$TERMINAL_RECORDING_WORKDIR/sender"; begin_terminal; type_command 'git format-patch -o ../patches base..HEAD'; mkdir -p ../patches; git format-patch -o ../patches base..HEAD; type_command 'ls -1 ../patches'; ls -1 ../patches; finish_terminal; }
ep29_inspect_patch() { cd "$TERMINAL_RECORDING_WORKDIR"; begin_terminal; type_command 'sed -n "1,12p" patches/0001-*.patch'; sed -n '1,12p' patches/0001-*.patch; finish_terminal; }
ep29_apply_series() { cd "$TERMINAL_RECORDING_WORKDIR/receiver"; begin_terminal; type_command 'git am ../patches/000*.patch'; git am ../patches/000*.patch; type_command 'git log --reverse --format="%H %s" base..HEAD'; git log --reverse --format='%H %s' base..HEAD; finish_terminal; }

ep30_fetch_topics() { cd "$TERMINAL_RECORDING_WORKDIR/maintainer"; begin_terminal; type_command 'git fetch alice topic-a'; git fetch alice topic-a:refs/remotes/alice/topic-a; type_command 'git fetch bob topic-b'; git fetch bob topic-b:refs/remotes/bob/topic-b; type_command 'git branch -r'; git branch -r; finish_terminal; }
ep30_isolated_review() { cd "$TERMINAL_RECORDING_WORKDIR/maintainer"; begin_terminal; type_command 'git switch -c review/alice alice/topic-a'; git switch -q -c review/alice alice/topic-a; type_command 'test -f alice.txt && echo PASS'; test -f alice.txt && echo PASS; type_command 'git switch -c review/bob bob/topic-b'; git switch -q -c review/bob bob/topic-b; type_command 'test -f bob.txt || echo FAIL'; test -f bob.txt || echo FAIL; finish_terminal; }
ep30_integration_test() { cd "$TERMINAL_RECORDING_WORKDIR/maintainer"; begin_terminal; type_command 'git switch -c integration/test main'; git switch -q -c integration/test main; type_command 'git merge --no-edit alice/topic-a'; git merge --no-edit alice/topic-a; type_command 'git merge --no-edit bob/topic-b'; git merge --no-edit bob/topic-b; type_command './test.sh && echo PASS'; ./test.sh && echo PASS; finish_terminal; }

ep31_hotfix() { cd "$TERMINAL_RECORDING_WORKDIR/repo"; begin_terminal; type_command 'git switch -c hotfix/login maint/v1'; git switch -q -c hotfix/login maint/v1; printf 'v1 fixed\n' > app.txt; git add app.txt; type_command 'git commit -m "H1 fix login"'; GIT_AUTHOR_DATE='2026-03-24T09:00:00+08:00' GIT_COMMITTER_DATE='2026-03-24T09:00:00+08:00' git commit -m 'H1 fix login'; type_command './test.sh && echo PASS'; ./test.sh && echo PASS; finish_terminal; }
ep31_maint_release() { cd "$TERMINAL_RECORDING_WORKDIR/repo"; begin_terminal; type_command 'git switch maint/v1'; git switch -q maint/v1; type_command 'git merge --ff-only hotfix/login'; git merge --ff-only hotfix/login; type_command 'git tag v1.0.1'; git tag v1.0.1; type_command 'git show-ref --tags'; git show-ref --tags; finish_terminal; }
ep31_merge_up() { cd "$TERMINAL_RECORDING_WORKDIR/repo"; begin_terminal; type_command 'git switch main'; git switch -q main; type_command 'git merge --no-ff maint/v1'; GIT_AUTHOR_DATE='2026-03-25T09:00:00+08:00' GIT_COMMITTER_DATE='2026-03-25T09:00:00+08:00' git merge --no-ff maint/v1 -m 'merge maintenance fixes'; type_command './test.sh && echo PASS'; ./test.sh && echo PASS; finish_terminal; }

ep32_merge_path() { cd "$TERMINAL_RECORDING_WORKDIR/repo"; begin_terminal; type_command 'git switch demo/merge'; git switch -q demo/merge; type_command 'git merge --no-ff topic'; GIT_AUTHOR_DATE='2026-03-29T09:00:00+08:00' GIT_COMMITTER_DATE='2026-03-29T09:00:00+08:00' git merge --no-ff topic -m 'merge topic'; type_command 'git log -1 --format="%H%nparents %P"'; git log -1 --format='%H%nparents %P'; finish_terminal; }
ep32_rebase_path() { cd "$TERMINAL_RECORDING_WORKDIR/repo"; begin_terminal; type_command 'git switch demo/rebase'; git switch -q demo/rebase; type_command 'git rebase main'; git rebase main; type_command 'git log -2 --format="%H %s"'; git log -2 --format='%H %s'; finish_terminal; }
ep32_pick_path() { cd "$TERMINAL_RECORDING_WORKDIR/repo"; begin_terminal; type_command 'git switch demo/pick'; git switch -q demo/pick; type_command 'git cherry-pick topic~1 topic'; git cherry-pick topic~1 topic; type_command 'git log -2 --format="%H %s"'; git log -2 --format='%H %s'; finish_terminal; }

case "${TERMINAL_RECORDING_ID:-}" in
  ep25-topic-start) ep25_topic_start;; ep25-integrate) ep25_integrate;; ep25-delete) ep25_delete;;
  ep26-alice-push) ep26_alice_push;; ep26-bob-reject) ep26_bob_reject;; ep26-bob-integrate) ep26_bob_integrate;;
  ep27-publish-topic) ep27_publish_topic;; ep27-maintainer-fetch) ep27_maintainer_fetch;; ep27-review-integrate) ep27_review_integrate;;
  ep28-inspect-dirty) ep28_inspect_dirty;; ep28-verify-index) ep28_verify_index;; ep28-review-range) ep28_review_range;;
  ep29-format-patch) ep29_format_patch;; ep29-inspect-patch) ep29_inspect_patch;; ep29-apply-series) ep29_apply_series;;
  ep30-fetch-topics) ep30_fetch_topics;; ep30-isolated-review) ep30_isolated_review;; ep30-integration-test) ep30_integration_test;;
  ep31-hotfix) ep31_hotfix;; ep31-maint-release) ep31_maint_release;; ep31-merge-up) ep31_merge_up;;
  ep32-merge-path) ep32_merge_path;; ep32-rebase-path) ep32_rebase_path;; ep32-pick-path) ep32_pick_path;;
  *) printf 'Unknown EP25–32 recording: %s\n' "${TERMINAL_RECORDING_ID:-}" >&2; exit 1;;
esac
