#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
exec "$ROOT/scripts/terminal-recordings/record-vhs.sh" git-course-lab ep00-git-object
