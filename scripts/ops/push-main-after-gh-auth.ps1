# Push local main to origin after GitHub CLI login.
# Run from repo root: .\scripts\push-main-after-gh-auth.ps1

$ErrorActionPreference = "Stop"
Set-Location (Split-Path $PSScriptRoot -Parent)

if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
  Write-Error "GitHub CLI (gh) is not installed."
}

$auth = gh auth status 2>&1
if ($LASTEXITCODE -ne 0) {
  Write-Host "Not logged in. Starting device flow..."
  gh auth login -h github.com -p https -w
}

git checkout main
$ahead = (git rev-list --count origin/main..HEAD)
Write-Host "main is $ahead commit(s) ahead of origin/main."

git push origin main
Write-Host "Done."
