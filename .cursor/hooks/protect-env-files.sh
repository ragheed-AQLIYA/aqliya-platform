#!/usr/bin/env bash
# Linux/macOS/Cloud Agent equivalent of protect-env-files.ps1
inputJson="$(cat)"

if echo "$inputJson" | grep -Eq '\.env|DATABASE_URL|SECRET|TOKEN'; then
  echo '{"permission":"deny","message":"Potential secret/env edit detected. Explicit user approval required."}'
  exit 2
fi

echo '{"permission":"allow"}'
exit 0
