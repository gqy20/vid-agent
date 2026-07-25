# Task Board engineering fixture

Deterministic multi-state fixture for Claude Code Course EP06–EP10. Every
episode copies `base/` into a fresh repository, then applies only the state
overlays it needs. This keeps terminal recordings independent while preserving
one inspectable project history.

- `base/`: task creation without due dates; used by planning and controlled execution.
- `states/due-date-bug/`: due-date feature with an observable timezone rendering gap.
- `states/due-date-fixed/`: fixes the rendering gap; used before project configuration.
- `states/update-bug/`: adds Issue #142, where editing a title clears `dueDate`.

The overlays are copied in the order above. They are course fixtures, not
generated build outputs.
