# PHASE 3 — restore a data-carrying clone from the backup taken before any change.
# Never touches `aqliya`.
$ErrorActionPreference = "Stop"
$bin = "C:\Program Files\PostgreSQL\16\bin"
$env:PGPASSWORD = "postgres"

$BACKUP = "C:\Users\PC\aqliya-backups\aqliya-pre-lcgpa-20260822-142620.sql"
$CLONE  = "aqliya_promote_rehearsal"
$url    = "postgresql://postgres:postgres@localhost:5432/$CLONE"

if (-not (Test-Path $BACKUP)) { throw "backup not found: $BACKUP" }
$mb = [math]::Round((Get-Item $BACKUP).Length / 1MB, 2)
$hash = (Get-FileHash -Path $BACKUP -Algorithm SHA256).Hash
Write-Host "backup     : $BACKUP"
Write-Host "size       : $mb MB"
Write-Host "sha256     : $hash"

node "C:\Users\PC\Documents\Aqliya\.promote\mkdb.js" $CLONE

Write-Host "restoring..."
& "$bin\psql.exe" --quiet --dbname=$url --file=$BACKUP 2>&1 |
  Select-String -Pattern "^psql:.*ERROR" | Select-Object -First 15
Write-Host "restore exit: $LASTEXITCODE"
