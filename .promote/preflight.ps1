# Backup verification + pre-flight census. READ ONLY on `aqliya`.
$ErrorActionPreference = "Continue"
$bin = "C:\Program Files\PostgreSQL\16\bin"
$env:PGPASSWORD = "postgres"
$repo = "C:\Users\PC\Documents\Aqliya"
Set-Location $repo

$BACKUP   = "C:\Users\PC\aqliya-backups\aqliya-pre-lcgpa-20260822-142620.sql"
$EXPECTED = "071F819433BF68F720B6EF8A1999C5E6CD8D55E2DD6CC134179F85C0A5577455"

Write-Host "=== 1. backup file ==="
if (-not (Test-Path $BACKUP)) { Write-Host "  MISSING: $BACKUP"; exit 1 }
$fi = Get-Item $BACKUP
Write-Host ("  path     : {0}" -f $fi.FullName)
Write-Host ("  size     : {0} MB" -f [math]::Round($fi.Length / 1MB, 2))
Write-Host ("  modified : {0}" -f $fi.LastWriteTime.ToString("s"))
$actual = (Get-FileHash $BACKUP -Algorithm SHA256).Hash
Write-Host ("  sha256   : {0}" -f $actual)
Write-Host ("  matches recorded hash: {0}" -f ($actual -eq $EXPECTED))

Write-Host ""
Write-Host "=== 2. pg_dump validity ==="
$head = Get-Content $BACKUP -TotalCount 3
$tail = Get-Content $BACKUP -Tail 3
Write-Host "  first line : $($head[0])"
Write-Host "  last line  : $($tail[-1])"
$complete = ($tail -join "`n") -match "PostgreSQL database dump complete"
Write-Host "  dump terminator present: $complete"
$copyCount  = (Select-String -Path $BACKUP -Pattern "^COPY " -AllMatches).Count
$tableCount = (Select-String -Path $BACKUP -Pattern "^CREATE TABLE " -AllMatches).Count
Write-Host "  CREATE TABLE statements: $tableCount"
Write-Host "  COPY data blocks       : $copyCount"

Write-Host ""
Write-Host "=== 3. current aqliya census ==="
node "$repo\.promote\census.js" aqliya prod-census-preflight.json

Write-Host ""
Write-Host "=== 4. current aqliya migration history ==="
node "$repo\.promote\gen-baseline.js" aqliya
