# Cycle 6 — remote staging smoke (operator)
# Requires: DATABASE_URL (remote staging), STAGING_BASE_URL (HTTPS app URL)
# Does NOT start Docker. Does NOT claim Cycle 6 CLOSED — fill LIVE_SMOKE_REPORT + G6-7.
$ErrorActionPreference = "Stop"
Set-Location (Join-Path $PSScriptRoot "..\..")

Write-Host "== Cycle 6 remote staging smoke ==" -ForegroundColor Cyan

node scripts/ic/cycle6-operator-preflight.mjs
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

if ($env:DATABASE_URL -match "localhost:5435") {
  Write-Warning "DATABASE_URL looks like local proxy — use remote staging for Cycle 6 CLOSED."
}

Write-Host "migrate deploy..."
npx prisma migrate deploy | Out-Host
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "pgvector verify..."
npm run db:verify-pgvector | Out-Host
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "IC live smoke..."
npm run ic:smoke:cycle5:live | Out-Host
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "Governed AuditOS AI smoke..."
npm run cycle6:smoke:audit-ai | Out-Host
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host ""
node scripts/ic/cycle6-smoke-report-stamp.mjs
Write-Host ""
Write-Host "Next: paste stamp into docs/validation/cycle-6/LIVE_SMOKE_REPORT.md" -ForegroundColor Yellow
Write-Host "Then: Director G6-7 in parallel-execution-cycle-2026-06-06-cycle-6-close.md" -ForegroundColor Yellow
