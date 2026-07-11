#!/usr/bin/env bash
set -euo pipefail

cd "$TERMINAL_RECORDING_WORKDIR"
git init -q -b main
printf 'export function App() {\n  return <Header />;\n}\n' > app.js
git add app.js
git commit -q -m init
printf 'export function App() {\n  return <Header title="Git" />;\n}\n' > app.js
git add app.js
printf 'export function App() {\n  trackClick();\n  return <Header title="Git" />;\n}\n' > app.js
