# PHASE 1 verification — records SHA-256 and the first bytes of the two
# migrations, before and after BOM removal. Read-only.
param([string]$Label = "BEFORE")

$repo = "C:\Users\PC\Documents\Aqliya\prisma\migrations"
$targets = @(
  "20260724232330_drop_deprecated_audit_models",
  "20260803150000_add_user_preferences"
)

Write-Host "=== $Label ==="
foreach ($m in $targets) {
  $p = Join-Path $repo (Join-Path $m "migration.sql")
  $b = [System.IO.File]::ReadAllBytes($p)
  $hash = (Get-FileHash -Path $p -Algorithm SHA256).Hash
  $hasBom = ($b[0] -eq 0xEF -and $b[1] -eq 0xBB -and $b[2] -eq 0xBF)
  $first = ($b[0..2] | ForEach-Object { $_.ToString("X2") }) -join " "
  Write-Host ("  {0}" -f $m)
  Write-Host ("    bytes      : {0}" -f $b.Length)
  Write-Host ("    first3     : {0}" -f $first)
  Write-Host ("    has BOM    : {0}" -f $hasBom)
  Write-Host ("    sha256     : {0}" -f $hash)
}
