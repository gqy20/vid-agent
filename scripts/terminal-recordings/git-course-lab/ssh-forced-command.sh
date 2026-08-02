#!/usr/bin/env bash
set -euo pipefail

ROLE="${1:?role is required}"
REPOSITORY="${2:?repository path is required}"
GIT_EXEC_PATH="${3:?Git executable path is required}"
COMMAND="${SSH_ORIGINAL_COMMAND:-}"

case "$COMMAND" in
  "git-upload-pack 'project.git'"|"git-upload-pack '/project.git'")
    exec "$GIT_EXEC_PATH/git-upload-pack" "$REPOSITORY"
    ;;
  "git-receive-pack 'project.git'"|"git-receive-pack '/project.git'")
    if [[ "$ROLE" != "writer" ]]; then
      printf 'repository authorization: reader cannot receive-pack\n' >&2
      exit 1
    fi
    exec "$GIT_EXEC_PATH/git-receive-pack" "$REPOSITORY"
    ;;
  '')
    printf 'interactive shell disabled; Git service commands only\n' >&2
    exit 1
    ;;
  *)
    printf 'restricted command rejected: %s\n' "$COMMAND" >&2
    exit 1
    ;;
esac
