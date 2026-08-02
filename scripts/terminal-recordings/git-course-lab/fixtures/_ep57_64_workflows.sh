#!/usr/bin/env bash
set -euo pipefail

new_repo() { git init -q -b main "$1"; }
commit_at() {
  local repo="$1" message="$2" day="$3"
  git -C "$repo" add -A
  GIT_AUTHOR_DATE="2026-07-${day}T09:00:00+08:00" GIT_COMMITTER_DATE="2026-07-${day}T09:00:00+08:00" git -C "$repo" commit -q -m "$message"
}

service_repo() {
  cd "$TERMINAL_RECORDING_WORKDIR"
  new_repo seed
  printf '# service lab\n' > seed/README.md
  printf 'export const port = 8080;\n' > seed/app.js
  commit_at seed 'C1 service base' 01
  printf 'export const ready = true;\n' >> seed/app.js
  commit_at seed 'C2 service ready' 02
  git -C seed tag v1.0
  git clone -q --bare seed project.git
  rm -rf seed
}

ssh_lab() {
  mkdir -p "$TERMINAL_RECORDING_WORKDIR/keys" "$TERMINAL_RECORDING_WORKDIR/ssh"
  ssh-keygen -q -t ed25519 -N '' -C 'host@git-course.local' -f "$TERMINAL_RECORDING_WORKDIR/keys/host"
  ssh-keygen -q -t ed25519 -N '' -C 'reader@git-course.local' -f "$TERMINAL_RECORDING_WORKDIR/keys/reader"
  ssh-keygen -q -t ed25519 -N '' -C 'writer@git-course.local' -f "$TERMINAL_RECORDING_WORKDIR/keys/writer"
  local wrapper user_name git_exec_path ssh_port
  wrapper="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/ssh-forced-command.sh"
  user_name="$(id -un)"
  git_exec_path="$(git --exec-path)"
  ssh_port=19559
  [[ "${TERMINAL_RECORDING_ID:-}" == ep57-* ]] && ssh_port=19557
  printf '%s\n' "$ssh_port" > "$TERMINAL_RECORDING_WORKDIR/ssh/port"
  chmod +x "$wrapper"
  printf 'command="%s reader %s %s",restrict %s\n' "$wrapper" "$TERMINAL_RECORDING_WORKDIR/project.git" "$git_exec_path" "$(cat "$TERMINAL_RECORDING_WORKDIR/keys/reader.pub")" > "$TERMINAL_RECORDING_WORKDIR/ssh/authorized_keys"
  printf 'command="%s writer %s %s",restrict %s\n' "$wrapper" "$TERMINAL_RECORDING_WORKDIR/project.git" "$git_exec_path" "$(cat "$TERMINAL_RECORDING_WORKDIR/keys/writer.pub")" >> "$TERMINAL_RECORDING_WORKDIR/ssh/authorized_keys"
  printf '%s\n' \
    "Port $ssh_port" \
    'ListenAddress 127.0.0.1' \
    "HostKey $TERMINAL_RECORDING_WORKDIR/keys/host" \
    "PidFile $TERMINAL_RECORDING_WORKDIR/ssh/sshd.pid" \
    "AuthorizedKeysFile $TERMINAL_RECORDING_WORKDIR/ssh/authorized_keys" \
    'StrictModes no' \
    'PasswordAuthentication no' \
    'KbdInteractiveAuthentication no' \
    'PubkeyAuthentication yes' \
    'UsePAM no' \
    "AllowUsers $user_name" \
    'LogLevel ERROR' > "$TERMINAL_RECORDING_WORKDIR/ssh/sshd_config"
  printf '%s\n' \
    'Host course-reader' \
    '  HostName 127.0.0.1' \
    "  Port $ssh_port" \
    "  User $user_name" \
    "  IdentityFile $TERMINAL_RECORDING_WORKDIR/keys/reader" \
    '  IdentitiesOnly yes' \
    "  UserKnownHostsFile $TERMINAL_RECORDING_WORKDIR/ssh/known_hosts" \
    '  StrictHostKeyChecking yes' \
    'Host course-writer' \
    '  HostName 127.0.0.1' \
    "  Port $ssh_port" \
    "  User $user_name" \
    "  IdentityFile $TERMINAL_RECORDING_WORKDIR/keys/writer" \
    '  IdentitiesOnly yes' \
    "  UserKnownHostsFile $TERMINAL_RECORDING_WORKDIR/ssh/known_hosts" \
    '  StrictHostKeyChecking yes' > "$TERMINAL_RECORDING_WORKDIR/ssh/config"
}

http_lab() {
  printf '#!/usr/bin/env sh\nif [ "$1" = get ]; then printf "username=reader\\npassword=readpass\\n"; fi\n' > "$TERMINAL_RECORDING_WORKDIR/reader-helper.sh"
  printf '#!/usr/bin/env sh\nif [ "$1" = get ]; then printf "username=writer\\npassword=writepass\\n"; fi\n' > "$TERMINAL_RECORDING_WORKDIR/writer-helper.sh"
  chmod +x "$TERMINAL_RECORDING_WORKDIR/reader-helper.sh" "$TERMINAL_RECORDING_WORKDIR/writer-helper.sh"
  git -C "$TERMINAL_RECORDING_WORKDIR/project.git" config http.receivepack true
}

bare_empty() {
  cd "$TERMINAL_RECORDING_WORKDIR"
  git init -q --bare project.git
}

bare_clients() {
  bare_empty
  new_repo client-a
  printf 'base\n' > client-a/app.txt
  commit_at client-a 'C1 base' 03
  git -C client-a remote add origin "$TERMINAL_RECORDING_WORKDIR/project.git"
  git clone -q client-a client-b
  git -C client-b remote set-url origin "$TERMINAL_RECORDING_WORKDIR/project.git"
}

key_lab() {
  service_repo
  ssh_lab
}

transport_lab() { service_repo; ssh_lab; http_lab; }

daemon_repo() { service_repo; }

ops_repo() {
  service_repo
  mkdir -p "$TERMINAL_RECORDING_WORKDIR/service-config"
  printf 'listen=127.0.0.1\nauth=course-fixture\n' > "$TERMINAL_RECORDING_WORKDIR/service-config/endpoint.conf"
  printf 'reader=read\nwriter=write\n' > "$TERMINAL_RECORDING_WORKDIR/service-config/access.conf"
}

case "${TERMINAL_RECORDING_ID:-}" in
  ep57-*) transport_lab;;
  ep58-init-bare) bare_empty;;
  ep58-first-push|ep58-reject-stale) bare_clients;;
  ep59-*) key_lab;;
  ep60-*) service_repo; http_lab;;
  ep61-*) daemon_repo;;
  ep62-*) service_repo;;
  ep63-*) ops_repo;;
  ep64-*) ops_repo;;
  '') ;;
  *) printf 'Unknown EP57–64 recording: %s\n' "$TERMINAL_RECORDING_ID" >&2; exit 1;;
esac
