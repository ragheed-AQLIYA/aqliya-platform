#!/usr/bin/env bash
# Linux/macOS/Cloud Agent equivalent of block-heavy-commands.ps1
inputJson="$(cat)"

heavy_patterns=(
  "npm run build"
  "npm run lint"
  "npm test"
  "npx jest"
  "npx prisma migrate"
  "npx prisma generate"
  "prisma migrate"
  "prisma generate"
  "npm install"
  "pnpm install"
  "yarn install"
)

for pattern in "${heavy_patterns[@]}"; do
  if echo "$inputJson" | grep -Fq "$pattern"; then
    printf '{"permission":"deny","message":"Blocked by AQLIYA low-load policy. Ask user approval before running heavy command: %s"}\n' "$pattern"
    exit 2
  fi
done

echo '{"permission":"allow"}'
exit 0
