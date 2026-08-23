# PHASE 4 — deployment / migration history from local evidence. READ ONLY.
$repo = "C:\Users\PC\Documents\Aqliya"
Set-Location $repo

Write-Host "=== A. when the repaired migration entered the repository ==="
git log --diff-filter=A --date=iso --pretty=format:"%H`t%ad`t%an`t%s" -- `
  "prisma/migrations/20260711153755_add_enums_ondelete/migration.sql"
Write-Host ""

Write-Host ""
Write-Host "=== B. every commit touching that migration since ==="
git log --date=iso --pretty=format:"%h`t%ad`t%s" -- `
  "prisma/migrations/20260711153755_add_enums_ondelete/migration.sql"
Write-Host ""

Write-Host ""
Write-Host "=== C. commits 2026-07-08 .. 2026-07-16 ==="
git log --date=short --pretty=format:"%ad`t%h`t%s" --since=2026-07-08 --until=2026-07-17
Write-Host ""

Write-Host ""
Write-Host "=== D. last commit before / first after the production validation ==="
Write-Host "-- last commit on or before 2026-07-09 --"
git log -1 --date=iso --pretty=format:"%h`t%ad`t%s" --until=2026-07-09T23:59:59
Write-Host ""
Write-Host "-- HEAD --"
git log -1 --date=iso --pretty=format:"%h`t%ad`t%s"
Write-Host ""
