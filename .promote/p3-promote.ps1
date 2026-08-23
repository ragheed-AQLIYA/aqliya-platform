# PHASE 3/4 — the promotion sequence, on the data-carrying clone only.
# No prisma migrate dev, no reset, no db push, no DROP, no TRUNCATE.

$repo = "C:\Users\PC\Documents\Aqliya"
$out  = "$repo\.promote"
Set-Location $repo
$env:DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/aqliya_promote_rehearsal?schema=public"

Write-Host "== A. census BEFORE =="
node "$out\census.js" aqliya_promote_rehearsal census-before.json

Write-Host ""
Write-Host "== B. resolve the one failed migration =="
Write-Host "   20260605000001_ic01_pgvector_document_chunk"
Write-Host "   reason: failed 2026-08-03 because the vector extension was absent."
Write-Host "   DocumentChunk and its vector(1536) column are present; effects proven."
npx prisma migrate resolve --applied 20260605000001_ic01_pgvector_document_chunk 2>&1 |
  Select-String -Pattern "marked|Error" | ForEach-Object { "   $_" }

Write-Host ""
Write-Host "== C. baseline the 36 unrecorded migrations =="
$list = Get-Content "$out\baseline-list.txt" | Where-Object { $_ -and $_ -ne "20260605000001_ic01_pgvector_document_chunk" }
$ok = 0; $err = 0
foreach ($m in $list) {
  $r = npx prisma migrate resolve --applied $m 2>&1
  if ($r -match "marked as applied") { $ok++ } else { $err++; Write-Host "   FAILED: $m"; $r | Select-Object -First 3 }
}
Write-Host "   baselined: $ok   errors: $err"

Write-Host ""
Write-Host "== D. status before deploy =="
npx prisma migrate status 2>&1 | Select-String -Pattern "migrations found|not yet been applied|up to date|failed"

Write-Host ""
Write-Host "== E. migrate deploy =="
npx prisma migrate deploy 2>&1 | Select-String -Pattern "Applying migration|have been applied|No pending|Error"

Write-Host ""
Write-Host "== F. status after deploy =="
npx prisma migrate status 2>&1 | Select-String -Pattern "migrations found|not yet been applied|up to date|failed"

Write-Host ""
Write-Host "== G. schema equality =="
npx prisma migrate diff --from-config-datasource --to-schema prisma/schema.prisma --exit-code 2>&1 |
  Select-String -Pattern "difference|Added|Changed"
Write-Host "   diff exit: $LASTEXITCODE"

Write-Host ""
Write-Host "== H. census AFTER =="
node "$out\census.js" aqliya_promote_rehearsal census-after.json

Write-Host ""
Write-Host "== I. data-loss comparison =="
node "$out\census-compare.js" census-before.json census-after.json

Write-Host ""
Write-Host "== J. structural verification =="
node "$out\verify-structure.js" aqliya_promote_rehearsal
