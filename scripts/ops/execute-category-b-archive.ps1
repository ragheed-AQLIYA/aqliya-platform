# Category B archive moves — project-organization pass (2026-06-01)
# Run from repo root: powershell -ExecutionPolicy Bypass -File scripts/execute-category-b-archive.ps1

Set-Location (Join-Path $PSScriptRoot "..\..")

$dirs = @(
  "docs/archive/agent-reports-2026-05",
  "docs/archive/execution-stale",
  "docs/archive/sunbul-product-legacy",
  "docs/archive/root-planning-scratch"
)
foreach ($d in $dirs) { New-Item -ItemType Directory -Force -Path $d | Out-Null }

function Move-TrackedOrPlain {
  param([string]$Src, [string]$Dest)
  if (-not (Test-Path -LiteralPath $Src)) { Write-Host "SKIP (missing): $Src"; return $false }
  $parent = Split-Path -Parent $Dest
  if ($parent) { New-Item -ItemType Directory -Force -Path $parent | Out-Null }
  $rel = ($Src -replace '\\','/')
  git ls-files --error-unmatch $rel 2>$null | Out-Null
  if ($LASTEXITCODE -eq 0) {
    git mv -- $Src $Dest
    Write-Host "git mv: $Src -> $Dest"
  } else {
    Move-Item -LiteralPath $Src -Destination $Dest -Force
    Write-Host "move: $Src -> $Dest"
  }
  return $true
}

# B1+B2
foreach ($pair in @(
  @("agent-reports", "docs/archive/agent-reports-2026-05/agent-reports"),
  @("wave-5", "docs/archive/agent-reports-2026-05/wave-5")
)) {
  if (Test-Path -LiteralPath $pair[0]) {
    if (Test-Path -LiteralPath $pair[1]) { Write-Host "SKIP (dest exists): $($pair[1])"; continue }
    Move-TrackedOrPlain $pair[0] $pair[1] | Out-Null
  }
}

# B3 — entire sunbul tree becomes sunbul-product-legacy root content
if (Test-Path "docs/product/sunbul") {
  if (-not (Test-Path "docs/archive/sunbul-product-legacy/README.md")) {
    Move-TrackedOrPlain "docs/product/sunbul" "docs/archive/sunbul-product-legacy" | Out-Null
  } else {
    Write-Host "SKIP B3: docs/archive/sunbul-product-legacy already populated"
  }
}

# B4 (skip if already archived)
if (Test-Path "docs/execution/architecture-guards.md") {
  Move-TrackedOrPlain "docs/execution/architecture-guards.md" "docs/archive/execution-stale/architecture-guards.md" | Out-Null
}

# B6
$rootScratch = @(
  "AQLIYA_STRATEGIC_REALITY_AUDIT.md",
  "PROJECT_CLEANUP_REVIEW_REPORT.md",
  "PROJECT_CLEANUP_REVIEW_REPORT_v2.md",
  "opencode-last-instruction.md",
  "AQLIYA_Website_Content_Review_AR.md"
)
foreach ($f in $rootScratch) {
  Move-TrackedOrPlain $f "docs/archive/root-planning-scratch/$f" | Out-Null
}

Write-Host "`nDone. Run: git status --short"
