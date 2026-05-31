$inputJson = [Console]::In.ReadToEnd()

$heavyPatterns = @(
  "npm run build",
  "npm run lint",
  "npm test",
  "npx jest",
  "npx prisma migrate",
  "npx prisma generate",
  "prisma migrate",
  "prisma generate",
  "npm install",
  "pnpm install",
  "yarn install"
)

foreach ($pattern in $heavyPatterns) {
  if ($inputJson -match [regex]::Escape($pattern)) {
    Write-Output ('{"permission":"deny","message":"Blocked by AQLIYA low-load policy. Ask user approval before running heavy command: ' + $pattern + '"}')
    exit 2
  }
}

Write-Output '{"permission":"allow"}'
exit 0
