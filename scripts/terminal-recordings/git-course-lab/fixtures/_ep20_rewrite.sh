#!/usr/bin/env bash
set -euo pipefail
cd "$TERMINAL_RECORDING_WORKDIR"
git init -q -b main repo
for index in 1 2 3; do
  printf 'line %s\n' "$index" >> repo/notes.md
  git -C repo add notes.md
  GIT_AUTHOR_DATE="2026-02-20T09:0${index}:00+08:00" GIT_COMMITTER_DATE="2026-02-20T09:0${index}:00+08:00" git -C repo commit -q -m "C${index} draft"
done
git -C repo tag old-tip
cat > "$TERMINAL_RECORDING_WORKDIR/sequence-editor.sh" <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
sed -i '2s/^pick/reword/;3s/^pick/squash/' "$1"
if tty -s; then
  printf '%s\n' '--- edited rebase todo ---' >/dev/tty
  cat "$1" >/dev/tty
fi
EOF
chmod +x "$TERMINAL_RECORDING_WORKDIR/sequence-editor.sh"

prepare_rebase() {
  GIT_SEQUENCE_EDITOR="$TERMINAL_RECORDING_WORKDIR/sequence-editor.sh" GIT_EDITOR=true git -C "$TERMINAL_RECORDING_WORKDIR/repo" rebase -i --root >/dev/null
}
