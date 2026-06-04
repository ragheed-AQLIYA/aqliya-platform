# Cycle 6 — full local staging proxy (one command)
# Does NOT contact https://staging.aqliya.ai (DNS may be unavailable).
$ErrorActionPreference = "Stop"
Set-Location (Join-Path $PSScriptRoot "..")

Write-Host "== Cycle 6 local staging full run ==" -ForegroundColor Cyan

docker compose -f docker-compose.staging.yml -f docker-compose.staging-local.yml up -d db redis
Start-Sleep -Seconds 10

$env:DATABASE_URL = "postgresql://postgres:postgres@localhost:5435/aqliya_staging"
$env:FF_AI_RAG = "true"
$env:FF_AI_REAL_PROVIDERS = "false"
$env:CYCLE6_COMMIT_SHA = (git rev-parse --short HEAD 2>$null)
if (-not $env:CYCLE6_COMMIT_SHA) { $env:CYCLE6_COMMIT_SHA = "local" }
$env:STAGING_BASE_URL = "http://localhost:5435-local-staging-proxy"

Write-Host "migrate deploy..."
npx prisma migrate deploy | Out-Host
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "db seed..."
npx prisma db seed | Out-Host
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "pgvector verify..."
npm run db:pgvector-health | Out-Host
npm run db:verify-pgvector | Out-Host
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "IC smoke..."
npm run ic:smoke:cycle5 | Out-Host
npm run ic:smoke:cycle5:live | Out-Host

Write-Host "Governed AuditOS AI smoke..."
npm run cycle6:smoke:audit-ai | Out-Host
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host ""
node scripts/cycle6-smoke-report-stamp.mjs
Write-Host ""
Write-Host "DONE — paste stamp into LIVE_SMOKE_REPORT if needed; remote staging still operator-owned." -ForegroundColor Green
