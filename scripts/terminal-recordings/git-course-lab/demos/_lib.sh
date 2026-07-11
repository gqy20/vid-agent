#!/usr/bin/env bash
set -euo pipefail

prompt() {
  printf '\033[1;38;2;139;212;156m> \033[0m'
}

begin_terminal() {
  printf '\033[?25l'
}

type_command() {
  local command="$1"
  prompt
  sleep 0.5
  for ((index = 0; index < ${#command}; index++)); do
    printf '%s' "${command:index:1}"
    sleep 0.035
  done
  printf '\n'
}

semantic_status() {
  local status_output
  status_output="$(git -c color.status=never status --short)"
  while IFS= read -r line; do
    [[ -n "$line" ]] || continue
    printf '\033[38;2;214;168;74m%s\033[38;2;105;167;155m%s\033[0m %s\n' \
      "${line:0:1}" "${line:1:1}" "${line:3}"
  done <<<"$status_output"
}

finish_terminal() {
  prompt
  sleep 2.2
}
