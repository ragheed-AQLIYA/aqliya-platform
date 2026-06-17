# Cycle 5/6 — Staging IC-01 activate (enable / migrate / verify / smoke)
# Requires: Docker Desktop running, .env with DATABASE_URL

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot ..

Write-Host "Starting staging DB (pgvector image)..."
docker compose -f docker-compose.staging.yml up -d db

Write-Host "Applying migrations..."
npx prisma migrate deploy

Write-Host "Verifying pgvector..."
npm run db:verify-pgvector

Write-Host "Offline smoke..."
npm run ic:smoke:cycle5

Write-Host "Optional live integration (set IC01_PGVECTOR_INTEGRATION=true in env):"
Write-Host "  npm run test:ic01:pgvector"

Write-Host "Done. Update docs/operations/ai-intelligence-activation.md smoke log for live staging."
