#!/usr/bin/env bash
set -euo pipefail
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/_lib.sh"

start_ssh_service() {
  local ssh_port
  ssh_port="$(cat "$TERMINAL_RECORDING_WORKDIR/ssh/port")"
  /usr/sbin/sshd -D -f "$TERMINAL_RECORDING_WORKDIR/ssh/sshd_config" -E "$TERMINAL_RECORDING_WORKDIR/ssh/sshd.log" &
  SSHD_PID=$!
  for _ in {1..30}; do
    if ssh-keyscan -p "$ssh_port" 127.0.0.1 > "$TERMINAL_RECORDING_WORKDIR/ssh/known_hosts" 2>/dev/null; then return; fi
    sleep 0.1
  done
  printf 'SSH fixture failed to start\n' >&2
  exit 1
}

stop_ssh_service() {
  kill "${SSHD_PID:-}" 2>/dev/null || true
  wait "${SSHD_PID:-}" 2>/dev/null || true
}

start_http_service() {
  local port="$1" mode="${2:-authenticated-read}"
  python3 "$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/http_git_server.py" \
    "$TERMINAL_RECORDING_WORKDIR" "$port" "$mode" > "$TERMINAL_RECORDING_WORKDIR/http.log" 2>&1 &
  HTTP_PID=$!
  for _ in {1..30}; do
    if curl -fsS "http://127.0.0.1:$port/health" >/dev/null 2>&1; then return; fi
    sleep 0.1
  done
  printf 'HTTP fixture failed to start\n' >&2
  exit 1
}

stop_http_service() {
  kill "${HTTP_PID:-}" 2>/dev/null || true
  wait "${HTTP_PID:-}" 2>/dev/null || true
}

ssh_git() {
  GIT_SSH_COMMAND="ssh -F $TERMINAL_RECORDING_WORKDIR/ssh/config" git "$@"
}

ep57_local_file() { cd "$TERMINAL_RECORDING_WORKDIR"; begin_terminal; type_command 'git clone project.git local-path'; GIT_TRACE=1 git clone -q project.git local-path 2>&1 | grep -E 'built-in: git clone' | sed "s#$PWD#<lab>#g"; type_command 'git clone file://<lab>/project.git file-url'; GIT_TRACE=1 git clone -q "file://$PWD/project.git" file-url 2>&1 | grep -E 'git upload-pack|built-in: git clone' | sed "s#$PWD#<lab>#g" | tail -2; type_command 'git -C local-path rev-parse HEAD && git -C file-url rev-parse HEAD'; git -C local-path rev-parse HEAD; git -C file-url rev-parse HEAD; finish_terminal; }
ep57_remote_boundaries() {
  cd "$TERMINAL_RECORDING_WORKDIR"
  touch project.git/git-daemon-export-ok
  start_ssh_service
  start_http_service 19560 anonymous-read
  git daemon --reuseaddr --base-path="$PWD" --listen=127.0.0.1 --port=19561 "$PWD" >/dev/null 2>&1 & DAEMON_PID=$!
  trap 'kill "${DAEMON_PID:-}" 2>/dev/null || true; stop_http_service; stop_ssh_service' EXIT
  sleep 0.25
  begin_terminal
  type_command 'git ls-remote course-reader:project.git refs/heads/main'
  ssh_git ls-remote course-reader:project.git refs/heads/main
  type_command 'git ls-remote http://127.0.0.1:19560/project.git refs/heads/main'
  git ls-remote http://127.0.0.1:19560/project.git refs/heads/main
  type_command 'git ls-remote git://127.0.0.1:19561/project.git refs/heads/main'
  git ls-remote git://127.0.0.1:19561/project.git refs/heads/main
  finish_terminal
}
ep57_oid_check() {
  cd "$TERMINAL_RECORDING_WORKDIR"
  touch project.git/git-daemon-export-ok
  start_ssh_service
  start_http_service 19560 anonymous-read
  git daemon --reuseaddr --base-path="$PWD" --listen=127.0.0.1 --port=19561 "$PWD" >/dev/null 2>&1 & DAEMON_PID=$!
  trap 'kill "${DAEMON_PID:-}" 2>/dev/null || true; stop_http_service; stop_ssh_service' EXIT
  sleep 0.25
  local local_oid ssh_oid http_oid git_oid
  local_oid="$(git -C project.git rev-parse refs/heads/main)"
  ssh_oid="$(ssh_git ls-remote course-reader:project.git refs/heads/main | cut -f1)"
  http_oid="$(git ls-remote http://127.0.0.1:19560/project.git refs/heads/main | cut -f1)"
  git_oid="$(git ls-remote git://127.0.0.1:19561/project.git refs/heads/main | cut -f1)"
  begin_terminal
  type_command 'printf "%s\\n" local ssh http git  # compare full OID'
  printf 'local  %s\nssh    %s\nhttp   %s\ngit    %s\n' "$local_oid" "$ssh_oid" "$http_oid" "$git_oid"
  type_command 'test "$(printf ... | sort -u | wc -l)" = 1 && echo SAME_OBJECT_ID'
  test "$(printf '%s\n' "$local_oid" "$ssh_oid" "$http_oid" "$git_oid" | sort -u | wc -l)" = 1 && echo SAME_OBJECT_ID
  finish_terminal
}

ep58_init_bare() { cd "$TERMINAL_RECORDING_WORKDIR"; begin_terminal; type_command 'git rev-parse --is-bare-repository'; git -C project.git rev-parse --is-bare-repository; type_command 'find project.git -maxdepth 1 -mindepth 1 -printf "%f\\n" | sort'; find project.git -maxdepth 1 -mindepth 1 -printf '%f\n' | sort; type_command 'test ! -f project.git/app.txt && echo NO_WORKING_TREE'; test ! -f project.git/app.txt && echo NO_WORKING_TREE; finish_terminal; }
ep58_first_push() { cd "$TERMINAL_RECORDING_WORKDIR/client-a"; begin_terminal; type_command 'GIT_TRACE=1 git push -u origin main'; GIT_TRACE=1 git push -u origin main 2>&1 | grep -E 'git-receive-pack|new branch|branch.*set up' | sed "s#$TERMINAL_RECORDING_WORKDIR#<lab>#g"; type_command 'git -C ../project.git show-ref refs/heads/main'; git -C ../project.git show-ref refs/heads/main; type_command 'test ! -f ../project.git/app.txt && echo SERVER_HAS_NO_CHECKOUT'; test ! -f ../project.git/app.txt && echo SERVER_HAS_NO_CHECKOUT; finish_terminal; }
ep58_reject_stale() { cd "$TERMINAL_RECORDING_WORKDIR"; git -C client-a push -q -u origin main; printf 'client a\n' >> client-a/app.txt; commit_at_local(){ git -C "$1" add -A; GIT_AUTHOR_DATE='2026-07-04T09:00:00+08:00' GIT_COMMITTER_DATE='2026-07-04T09:00:00+08:00' git -C "$1" commit -q -m "$2"; }; commit_at_local client-a 'C2 accepted'; git -C client-a push -q; printf 'client b\n' >> client-b/app.txt; commit_at_local client-b 'C2 stale'; begin_terminal; type_command 'git -C client-b push origin main'; git -C client-b push origin main 2>&1 | grep -E 'rejected|fetch first|failed to push' || true; type_command 'git -C project.git rev-parse main'; git -C project.git rev-parse main; type_command 'git -C client-a rev-parse main'; git -C client-a rev-parse main; finish_terminal; }

ep59_key_evidence() { cd "$TERMINAL_RECORDING_WORKDIR"; begin_terminal; type_command 'ssh-keygen -lf keys/reader.pub'; ssh-keygen -lf keys/reader.pub; type_command 'ssh-keygen -lf keys/writer.pub'; ssh-keygen -lf keys/writer.pub; type_command 'test -s keys/reader && echo PRIVATE_KEY_EXISTS_BUT_IS_NOT_PRINTED'; test -s keys/reader && echo PRIVATE_KEY_EXISTS_BUT_IS_NOT_PRINTED; finish_terminal; }
ep59_restricted_command() {
  cd "$TERMINAL_RECORDING_WORKDIR"
  start_ssh_service
  trap stop_ssh_service EXIT
  begin_terminal
  type_command 'ssh -F ssh/config course-reader bash'
  ssh -F ssh/config course-reader bash 2>&1 || true
  type_command 'git ls-remote course-reader:project.git refs/heads/main'
  ssh_git ls-remote course-reader:project.git refs/heads/main
  finish_terminal
}
ep59_authorization() {
  cd "$TERMINAL_RECORDING_WORKDIR"
  git clone -q project.git client
  printf 'authorized write\n' >> client/README.md
  git -C client add README.md
  GIT_AUTHOR_DATE='2026-07-05T09:00:00+08:00' GIT_COMMITTER_DATE='2026-07-05T09:00:00+08:00' git -C client commit -q -m 'C3 authorized write'
  start_ssh_service
  trap stop_ssh_service EXIT
  begin_terminal
  type_command 'git ls-remote course-reader:project.git refs/heads/main'
  ssh_git ls-remote course-reader:project.git refs/heads/main
  type_command 'git -C client push course-reader:project.git main'
  GIT_SSH_COMMAND="ssh -F $PWD/ssh/config" git -C client push course-reader:project.git main 2>&1 | grep -E 'repository authorization|fatal:' || true
  type_command 'git -C client push -q course-writer:project.git main'
  GIT_SSH_COMMAND="ssh -F $PWD/ssh/config" git -C client push -q course-writer:project.git main
  printf 'writer receive-pack accepted\n'
  finish_terminal
}

ep60_read_service() {
  cd "$TERMINAL_RECORDING_WORKDIR"
  start_http_service 19600 anonymous-read
  trap stop_http_service EXIT
  begin_terminal
  type_command 'git ls-remote http://127.0.0.1:19600/project.git refs/heads/main'
  git ls-remote http://127.0.0.1:19600/project.git refs/heads/main
  type_command 'git clone -q http://127.0.0.1:19600/project.git client'
  git clone -q http://127.0.0.1:19600/project.git client
  tail -n 4 http.log
  finish_terminal
}
ep60_auth_boundary() {
  cd "$TERMINAL_RECORDING_WORKDIR"
  git clone -q project.git client
  printf 'policy check\n' >> client/README.md
  git -C client add README.md
  GIT_AUTHOR_DATE='2026-07-06T09:00:00+08:00' GIT_COMMITTER_DATE='2026-07-06T09:00:00+08:00' git -C client commit -q -m 'C3 policy check'
  git -C client remote add http-origin http://127.0.0.1:19600/project.git
  start_http_service 19600 anonymous-read
  trap stop_http_service EXIT
  begin_terminal
  type_command 'GIT_TERMINAL_PROMPT=0 git -C client push http-origin main'
  GIT_TERMINAL_PROMPT=0 git -c credential.helper= -C client push http-origin main 2>&1 | tail -2 || true
  git -C client config credential.helper "$PWD/reader-helper.sh"
  type_command 'git -C client push http-origin main  # reader'
  git -C client push http-origin main 2>&1 | tail -2 || true
  type_command 'tail -n 2 http.log  # sanitized access evidence'
  tail -n 2 http.log
  finish_terminal
}
ep60_write_service() {
  cd "$TERMINAL_RECORDING_WORKDIR"
  git clone -q project.git client
  printf 'http write\n' >> client/README.md
  git -C client add README.md
  GIT_AUTHOR_DATE='2026-07-06T09:00:00+08:00' GIT_COMMITTER_DATE='2026-07-06T09:00:00+08:00' git -C client commit -q -m 'C3 authorized write'
  git -C client remote add http-origin http://127.0.0.1:19600/project.git
  git -C client config credential.helper "$PWD/writer-helper.sh"
  start_http_service 19600 anonymous-read
  trap stop_http_service EXIT
  begin_terminal
  type_command 'git -C client push -q http-origin main  # writer'
  git -C client push -q http-origin main
  printf 'writer receive-pack accepted\n'
  type_command 'git -C project.git rev-parse main'
  git -C project.git rev-parse main
  type_command 'tail -n 2 http.log  # receive-pack evidence'
  tail -n 2 http.log
  finish_terminal
}

start_daemon() { local log="$TERMINAL_RECORDING_WORKDIR/daemon.log"; git daemon --reuseaddr --base-path="$TERMINAL_RECORDING_WORKDIR" --listen=127.0.0.1 --port=19418 --verbose "$TERMINAL_RECORDING_WORKDIR" >"$log" 2>&1 & DAEMON_PID=$!; sleep .35; }
stop_daemon() { kill "$DAEMON_PID" 2>/dev/null || true; wait "$DAEMON_PID" 2>/dev/null || true; }
ep61_export_gate() { cd "$TERMINAL_RECORDING_WORKDIR"; start_daemon; begin_terminal; type_command 'git ls-remote git://127.0.0.1:19418/project.git'; git ls-remote git://127.0.0.1:19418/project.git 2>&1 | tail -2 || true; type_command 'touch project.git/git-daemon-export-ok'; touch project.git/git-daemon-export-ok; type_command 'git ls-remote git://127.0.0.1:19418/project.git refs/heads/main'; git ls-remote git://127.0.0.1:19418/project.git refs/heads/main; finish_terminal; stop_daemon; }
ep61_anonymous_read() { cd "$TERMINAL_RECORDING_WORKDIR"; touch project.git/git-daemon-export-ok; start_daemon; begin_terminal; type_command 'git clone git://127.0.0.1:19418/project.git client'; git clone -q git://127.0.0.1:19418/project.git client; type_command 'git -C client rev-parse main'; git -C client rev-parse main; type_command 'git -C project.git rev-parse main'; git -C project.git rev-parse main; finish_terminal; stop_daemon; }
ep61_write_rejected() { cd "$TERMINAL_RECORDING_WORKDIR"; touch project.git/git-daemon-export-ok; git clone -q project.git client; printf 'anonymous write\n' >> client/README.md; git -C client add README.md; GIT_AUTHOR_DATE='2026-07-07T09:00:00+08:00' GIT_COMMITTER_DATE='2026-07-07T09:00:00+08:00' git -C client commit -q -m 'anonymous write'; start_daemon; begin_terminal; type_command 'git -C client push git://127.0.0.1:19418/project.git main'; git -C client push git://127.0.0.1:19418/project.git main 2>&1 | tail -3 || true; type_command 'git -C project.git rev-parse main'; git -C project.git rev-parse main; finish_terminal; stop_daemon; }

ep62_refs_evidence() { cd "$TERMINAL_RECORDING_WORKDIR"; begin_terminal; type_command 'git -C project.git show-ref --heads --tags'; git -C project.git show-ref --heads --tags; type_command 'git -C project.git cat-file -p main | head -4'; git -C project.git cat-file -p main | head -4; type_command 'git -C project.git ls-tree main'; git -C project.git ls-tree main; finish_terminal; }
ep62_page_evidence() { cd "$TERMINAL_RECORDING_WORKDIR"; begin_terminal; type_command 'git show --format="commit %H%nparent %P%ntree %T" --no-patch main'; git -C project.git show --format='commit %H%nparent %P%ntree %T' --no-patch main; type_command 'git diff-tree --stat main^ main'; git -C project.git diff-tree --stat main^ main | tail -3; printf 'GitWeb reads these same objects into summary / commit / tree / diff pages\n'; finish_terminal; }
ep62_transport_boundary() { cd "$TERMINAL_RECORDING_WORKDIR"; begin_terminal; type_command 'git ls-remote project.git refs/heads/main'; git ls-remote project.git refs/heads/main; type_command 'git upload-pack project.git >/dev/null'; git upload-pack project.git </dev/null >/dev/null 2>&1 || true; printf 'upload-pack serves Git transport; GitWeb serves read-only HTML\n'; type_command 'git config --get http.receivepack || echo WRITE_NOT_CONFIGURED'; git -C project.git config --get http.receivepack || echo WRITE_NOT_CONFIGURED; finish_terminal; }

ep63_small_team() { cd "$TERMINAL_RECORDING_WORKDIR"; begin_terminal; type_command 'git ls-remote project.git refs/heads/main'; git ls-remote project.git refs/heads/main; type_command 'find service-config project.git -maxdepth 2 -type f | sort | head'; find service-config project.git -maxdepth 2 -type f | sort | sed 's#project.git/objects/.*#project.git/objects/<object data>#' | awk '!seen[$0]++' | head -8; type_command 'git -C project.git fsck --full'; git -C project.git fsck --full; finish_terminal; }
ep63_regulated_team() { cd "$TERMINAL_RECORDING_WORKDIR"; begin_terminal; type_command 'sed -n "1,8p" service-config/*.conf'; sed -n '1,8p' service-config/*.conf; type_command 'stat -c "%A %n" project.git service-config'; stat -c '%A %n' project.git service-config; type_command 'git -C project.git show-ref --heads --tags'; git -C project.git show-ref --heads --tags; finish_terminal; }
ep63_ownership_check() { cd "$TERMINAL_RECORDING_WORKDIR"; begin_terminal; type_command 'git ls-remote project.git refs/heads/main'; git ls-remote project.git refs/heads/main; type_command 'printf "%s\\n" endpoint storage identity backup monitoring'; printf '%-12s %s\n' endpoint 'team or supplier' storage 'team or supplier' identity 'team or supplier' backup 'team or supplier' monitoring 'team or supplier'; type_command 'git -C project.git fsck --full && echo REPOSITORY_HEALTHY'; git -C project.git fsck --full; echo REPOSITORY_HEALTHY; finish_terminal; }

ep64_health_check() { cd "$TERMINAL_RECORDING_WORKDIR"; begin_terminal; type_command 'git -C project.git fsck --full'; git -C project.git fsck --full; type_command 'git -C project.git count-objects -v'; git -C project.git count-objects -v | head -5; type_command 'git -C project.git show-ref --heads --tags'; git -C project.git show-ref --heads --tags; finish_terminal; }
ep64_backup_set() { cd "$TERMINAL_RECORDING_WORKDIR"; mkdir -p backup; begin_terminal; type_command 'cp -a project.git backup/project.git'; cp -a project.git backup/project.git; type_command 'cp -a service-config backup/service-config'; cp -a service-config backup/service-config; type_command 'git -C project.git bundle create ../backup/project.bundle --all'; git -C project.git bundle create ../backup/project.bundle --all; type_command 'find backup -maxdepth 2 -type f | sort | head'; find backup -maxdepth 2 -type f | sort | head; finish_terminal; }
ep64_restore_drill() { cd "$TERMINAL_RECORDING_WORKDIR"; mkdir -p backup restore; cp -a project.git backup/project.git; cp -a service-config backup/service-config; cp -a backup/project.git restore/project.git; begin_terminal; type_command 'git -C restore/project.git fsck --full'; git -C restore/project.git fsck --full; type_command 'git -C restore/project.git show-ref --heads --tags'; git -C restore/project.git show-ref --heads --tags; type_command 'git clone -q restore/project.git fresh && git -C fresh rev-parse main'; git clone -q restore/project.git fresh; git -C fresh rev-parse main; finish_terminal; }

case "${TERMINAL_RECORDING_ID:-}" in
  ep57-local-file) ep57_local_file;; ep57-remote-boundaries) ep57_remote_boundaries;; ep57-oid-check) ep57_oid_check;;
  ep58-init-bare) ep58_init_bare;; ep58-first-push) ep58_first_push;; ep58-reject-stale) ep58_reject_stale;;
  ep59-key-evidence) ep59_key_evidence;; ep59-restricted-command) ep59_restricted_command;; ep59-authorization) ep59_authorization;;
  ep60-read-service) ep60_read_service;; ep60-auth-boundary) ep60_auth_boundary;; ep60-write-service) ep60_write_service;;
  ep61-export-gate) ep61_export_gate;; ep61-anonymous-read) ep61_anonymous_read;; ep61-write-rejected) ep61_write_rejected;;
  ep62-refs-evidence) ep62_refs_evidence;; ep62-page-evidence) ep62_page_evidence;; ep62-transport-boundary) ep62_transport_boundary;;
  ep63-small-team) ep63_small_team;; ep63-regulated-team) ep63_regulated_team;; ep63-ownership-check) ep63_ownership_check;;
  ep64-health-check) ep64_health_check;; ep64-backup-set) ep64_backup_set;; ep64-restore-drill) ep64_restore_drill;;
  *) printf 'Unknown EP57–64 recording: %s\n' "${TERMINAL_RECORDING_ID:-}" >&2; exit 1;;
esac
