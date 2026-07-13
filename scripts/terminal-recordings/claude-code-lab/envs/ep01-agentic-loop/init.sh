#!/usr/bin/env bash
# ep01 初始项目状态：一个极小的 foo.ts，待 Claude 加 search。
set -euo pipefail
mkdir -p /workspace/project
cd /workspace/project
cat > foo.ts <<'EOF'
export const utils = {
  greet(name: string) {
    return `hello ${name}`;
  },
};
EOF
