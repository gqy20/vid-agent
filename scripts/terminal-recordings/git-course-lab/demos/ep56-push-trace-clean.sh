#!/usr/bin/env bash
set -euo pipefail
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/_lib.sh"

cd "$TERMINAL_RECORDING_WORKDIR/client"
git fetch -q origin
git reset -q --hard origin/main
printf 'client update\n' >> app.txt
git add app.txt
GIT_AUTHOR_DATE='2026-06-16T09:00:00+08:00' GIT_COMMITTER_DATE='2026-06-16T09:00:00+08:00' git commit -q -m 'C3 client update'

begin_terminal
type_command 'GIT_TRACE_PACKET=1 git push origin main 2>push.trace'
GIT_TRACE_PACKET=1 git push -q origin main 2>push.trace
type_command 'grep key-packets push.trace'
sed -E 's/^.*packet: +//' push.trace | awk '
  /receive-pack>.*refs\/heads\/main/ && !advertised {print "receive-pack> advertise refs/heads/main"; advertised=1}
  /push> [0-9a-f]+ [0-9a-f]+ refs\/heads\/main/ {
    split($0, fields, " ");
    print "push> " substr(fields[2], 1, 8) ".." substr(fields[3], 1, 8) " refs/heads/main"
  }
  /receive-pack> unpack ok/ {print}
  /receive-pack> ok refs\/heads\/main/ {print}
'
type_command 'git -C ../remote.git rev-parse main'
git -C ../remote.git rev-parse main
finish_terminal
