#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/_ep11-tag-history.sh"
git tag -a v1.0 -m 'release 1.0'
