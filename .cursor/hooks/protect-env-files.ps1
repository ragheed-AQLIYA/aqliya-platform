$inputJson = [Console]::In.ReadToEnd()

if ($inputJson -match "\.env" -or $inputJson -match "DATABASE_URL" -or $inputJson -match "SECRET" -or $inputJson -match "TOKEN") {
  Write-Output '{"permission":"deny","message":"Potential secret/env edit detected. Explicit user approval required."}'
  exit 2
}

Write-Output '{"permission":"allow"}'
exit 0
