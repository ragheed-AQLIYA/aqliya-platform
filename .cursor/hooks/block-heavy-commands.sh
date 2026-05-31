#!/usr/bin/env bash
# Cursor beforeShellExecution — AQLIYA low-load gate (stdout = JSON only)
set -euo pipefail

emit() {
  printf '%s\n' "{\"permission\":\"$1\"}"
  exit 0
}

raw="$(cat)"
command=""
if [[ -n "$raw" ]]; then
  command="$(printf '%s' "$raw" | jq -r '.command // empty' 2>/dev/null || true)"
fi

if echo "$command" | grep -qiE 'git[[:space:]]+(status|add|commit|diff|log|ls-files|branch|check-ignore|show|rev-parse)'; then
  emit allow
fi

if echo "$command" | grep -qiE 'npx[[:space:]]+tsc[[:space:]]+--noEmit|npx[[:space:]]+prisma[[:space:]]+validate'; then
  emit allow
fi

if echo "$command" | grep -qiE 'npm[[:space:]]+run[[:space:]]+build|npm[[:space:]]+run[[:space:]]+lint|npm[[:space:]]+test|npx[[:space:]]+jest|npx[[:space:]]+prisma[[:space:]]+(generate|migrate)|npm[[:space:]]+(install|ci)'; then
  emit deny "Heavy command blocked by AQLIYA low-load hook." "Low-load policy blocked: $command"
fi

emit allow
