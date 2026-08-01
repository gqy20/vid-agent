#!/usr/bin/env bash
set -euo pipefail
cd "$TERMINAL_RECORDING_WORKDIR"
git init -q -b main repo
cat > repo/test.sh <<'EOF'
#!/usr/bin/env bash
version="$(cat version.txt)"
if (( version < 4 )); then echo "PASS version=$version"; exit 0; fi
echo "FAIL version=$version"; exit 1
EOF
chmod +x repo/test.sh
for index in {1..7}; do
  printf '%s\n' "$index" > repo/version.txt
  git -C repo add version.txt test.sh
  GIT_AUTHOR_DATE="2026-02-23T09:0${index}:00+08:00" GIT_COMMITTER_DATE="2026-02-23T09:0${index}:00+08:00" git -C repo commit -q -m "C${index} version ${index}"
  [[ "$index" == 1 ]] && git -C repo tag known-good
done

prepare_bisect() { git -C "$TERMINAL_RECORDING_WORKDIR/repo" bisect start >/dev/null; git -C "$TERMINAL_RECORDING_WORKDIR/repo" bisect bad >/dev/null; git -C "$TERMINAL_RECORDING_WORKDIR/repo" bisect good known-good >/dev/null; }
prepare_run() { prepare_bisect; git -C "$TERMINAL_RECORDING_WORKDIR/repo" bisect run ./test.sh >/dev/null 2>&1 || true; }
