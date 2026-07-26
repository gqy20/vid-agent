#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/_ep11-tag-history.sh"
git tag -a v1.0 -m 'release 1.0'
printf '1.1.0-dev\n' > VERSION
git add VERSION
GIT_AUTHOR_DATE='2026-01-11T09:02:00+08:00' GIT_COMMITTER_DATE='2026-01-11T09:02:00+08:00' git commit -q -m 'C2 begin next release'
