#!/usr/bin/env bash
set -euo pipefail

new_repo() { git init -q -b main "$1"; }
commit_at() {
  local repo="$1" message="$2" stamp="$3"
  git -C "$repo" add -A
  GIT_AUTHOR_DATE="2026-03-${stamp}T09:00:00+08:00" GIT_COMMITTER_DATE="2026-03-${stamp}T09:00:00+08:00" git -C "$repo" commit -q -m "$message"
}

ep25_base() { cd "$TERMINAL_RECORDING_WORKDIR"; new_repo repo; printf 'shell\n' > repo/app.txt; commit_at repo 'C0 app shell' 01; }
ep25_topic_ready() { ep25_base; git -C repo switch -q -c topic/login; printf 'form\n' >> repo/app.txt; commit_at repo 'C1 add login form' 02; printf 'validation\n' >> repo/app.txt; commit_at repo 'C2 validate login' 03; git -C repo switch -q main; }
ep25_integrated() { ep25_topic_ready; GIT_AUTHOR_DATE='2026-03-04T09:00:00+08:00' GIT_COMMITTER_DATE='2026-03-04T09:00:00+08:00' git -C repo merge -q --no-ff topic/login -m 'merge login topic'; }

ep26_base() { cd "$TERMINAL_RECORDING_WORKDIR"; new_repo seed; printf 'base\n' > seed/app.txt; commit_at seed 'C0 base' 05; git init -q --bare shared.git; git -C seed remote add origin "$TERMINAL_RECORDING_WORKDIR/shared.git"; git -C seed push -q -u origin main; git clone -q shared.git alice; git clone -q shared.git bob; }
ep26_alice_pushed() { ep26_base; printf 'alice\n' > alice/alice.txt; commit_at alice 'A1 alice change' 06; git -C alice push -q origin main; }
ep26_diverged() { ep26_alice_pushed; printf 'bob\n' > bob/bob.txt; commit_at bob 'B1 bob change' 07; }

ep27_base() { cd "$TERMINAL_RECORDING_WORKDIR"; new_repo seed; printf 'base\n' > seed/app.txt; commit_at seed 'C0 canonical base' 08; git init -q --bare canonical.git; git init -q --bare contributor.git; git -C seed remote add origin "$TERMINAL_RECORDING_WORKDIR/canonical.git"; git -C seed push -q origin main; git clone -q canonical.git contributor; git clone -q canonical.git maintainer; }
ep27_topic_ready() { ep27_base; git -C contributor switch -q -c topic/login; printf 'login\n' >> contributor/app.txt; commit_at contributor 'C1 add login' 09; printf 'test\n' > contributor/test.txt; commit_at contributor 'C2 test login' 10; }
ep27_topic_published() { ep27_topic_ready; git -C contributor remote add public "$TERMINAL_RECORDING_WORKDIR/contributor.git"; git -C contributor push -q public topic/login; }

ep28_dirty() { cd "$TERMINAL_RECORDING_WORKDIR"; new_repo repo; printf 'base\n' > repo/app.js; printf '#!/usr/bin/env bash\ngrep -q login app.js\n' > repo/test.sh; chmod +x repo/test.sh; commit_at repo 'C0 base' 11; git -C repo branch upstream/main; printf 'login  \n' >> repo/app.js; printf 'debug output\n' > repo/debug.log; }
ep28_staged() { ep28_dirty; printf 'login\n' > repo/app.js; rm repo/debug.log; git -C repo add app.js; }
ep28_range() { ep28_staged; commit_at repo 'C1 add login behavior' 12; printf 'login test\n' > repo/login.test; commit_at repo 'C2 test login behavior' 13; }

ep29_sender() { cd "$TERMINAL_RECORDING_WORKDIR"; new_repo sender; printf 'base\n' > sender/app.txt; commit_at sender 'C0 base' 14; git -C sender tag base; printf 'structure\n' >> sender/app.txt; commit_at sender 'C1 add structure' 15; printf 'behavior\n' >> sender/app.txt; commit_at sender 'C2 add behavior' 16; printf 'test\n' > sender/test.txt; commit_at sender 'C3 add test' 17; }
ep29_patches() { ep29_sender; mkdir patches; git -C sender format-patch -q -o "$TERMINAL_RECORDING_WORKDIR/patches" base..HEAD; }
ep29_receiver() { ep29_patches; new_repo receiver; printf 'base\n' > receiver/app.txt; commit_at receiver 'C0 base' 14; git -C receiver tag base; }

ep30_remotes() { cd "$TERMINAL_RECORDING_WORKDIR"; new_repo seed; printf 'base\n' > seed/app.txt; printf '#!/usr/bin/env bash\ntest -f alice.txt && test -f bob.txt\n' > seed/test.sh; chmod +x seed/test.sh; commit_at seed 'C0 base' 18; git init -q --bare canonical.git; git init -q --bare alice.git; git init -q --bare bob.git; git -C seed remote add origin "$TERMINAL_RECORDING_WORKDIR/canonical.git"; git -C seed push -q origin main; git clone -q canonical.git alice; git -C alice switch -q -c topic-a; printf 'alice\n' > alice/alice.txt; commit_at alice 'A1 topic A' 19; git -C alice push -q "$TERMINAL_RECORDING_WORKDIR/alice.git" topic-a; git clone -q canonical.git bob; git -C bob switch -q -c topic-b; printf 'broken\n' > bob/wrong.txt; commit_at bob 'B1 topic B broken' 20; git -C bob push -q "$TERMINAL_RECORDING_WORKDIR/bob.git" topic-b; git clone -q canonical.git maintainer; git -C maintainer remote add alice "$TERMINAL_RECORDING_WORKDIR/alice.git"; git -C maintainer remote add bob "$TERMINAL_RECORDING_WORKDIR/bob.git"; }
ep30_fetched() { ep30_remotes; git -C maintainer fetch -q alice topic-a:refs/remotes/alice/topic-a; git -C maintainer fetch -q bob topic-b:refs/remotes/bob/topic-b; }
ep30_fixed() { ep30_fetched; git -C bob rm -q wrong.txt; printf 'bob\n' > bob/bob.txt; commit_at bob 'B2 fix topic B' 21; git -C bob push -q "$TERMINAL_RECORDING_WORKDIR/bob.git" topic-b; git -C maintainer fetch -q bob topic-b:refs/remotes/bob/topic-b; }

ep31_base() { cd "$TERMINAL_RECORDING_WORKDIR"; new_repo repo; printf 'v1\n' > repo/app.txt; printf '#!/usr/bin/env bash\ngrep -q fixed app.txt\n' > repo/test.sh; chmod +x repo/test.sh; commit_at repo 'C0 release v1' 22; git -C repo tag v1.0.0; git -C repo branch maint/v1; printf 'next feature\n' > repo/next.txt; commit_at repo 'M1 next version feature' 23; }
ep31_hotfix_ready() { ep31_base; git -C repo switch -q -c hotfix/login maint/v1; printf 'v1 fixed\n' > repo/app.txt; commit_at repo 'H1 fix login' 24; }
ep31_maintenance_release() { ep31_hotfix_ready; git -C repo switch -q maint/v1; git -C repo merge -q --ff-only hotfix/login; git -C repo tag v1.0.1; }

ep32_base() { cd "$TERMINAL_RECORDING_WORKDIR"; new_repo repo; printf 'base\n' > repo/app.txt; commit_at repo 'C0 base' 25; git -C repo branch topic; printf 'main\n' > repo/main.txt; commit_at repo 'M1 main work' 26; git -C repo switch -q topic; printf 'feature one\n' >> repo/app.txt; commit_at repo 'F1 feature one' 27; printf 'feature two\n' >> repo/app.txt; commit_at repo 'F2 feature two' 28; git -C repo switch -q main; git -C repo branch demo/merge; git -C repo branch demo/rebase topic; git -C repo branch demo/pick; }

case "${TERMINAL_RECORDING_ID:-}" in
  ep25-topic-start) ep25_base;; ep25-integrate) ep25_topic_ready;; ep25-delete) ep25_integrated;;
  ep26-alice-push) ep26_base;; ep26-bob-reject|ep26-bob-integrate) ep26_diverged;;
  ep27-publish-topic) ep27_topic_ready;; ep27-maintainer-fetch) ep27_topic_published;; ep27-review-integrate) ep27_topic_published; git -C maintainer remote add contributor "$TERMINAL_RECORDING_WORKDIR/contributor.git"; git -C maintainer fetch -q contributor;;
  ep28-inspect-dirty) ep28_dirty;; ep28-verify-index) ep28_staged;; ep28-review-range) ep28_range;;
  ep29-format-patch) ep29_sender;; ep29-inspect-patch) ep29_patches;; ep29-apply-series) ep29_receiver;;
  ep30-fetch-topics) ep30_remotes;; ep30-isolated-review) ep30_fetched;; ep30-integration-test) ep30_fixed;;
  ep31-hotfix) ep31_base;; ep31-maint-release) ep31_hotfix_ready;; ep31-merge-up) ep31_maintenance_release;;
  ep32-merge-path|ep32-rebase-path|ep32-pick-path) ep32_base;;
  '') ;;
  *) printf 'Unknown EP25–32 recording: %s\n' "$TERMINAL_RECORDING_ID" >&2; exit 1;;
esac
