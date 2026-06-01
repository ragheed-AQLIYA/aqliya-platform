# LocalContentOS L5 - pilot dev server (session env only; does not edit .env)
# Run from repo root:
#   powershell -ExecutionPolicy Bypass -File scripts/run-localcontent-pilot.ps1
#   npm run dev:localcontent-pilot
#
# Overrides DATABASE_URL dbname -> aqliya_lc_pilot (host/user/pass from .env or .env.local).
# Sets LOCALCONTENT_CONTENT_BACKEND=prisma for Content Studio Prisma persistence.
# See docs/releases/localcontentos-completion/localcontentos-pilot-runtime-guide.md

param(
    [int]$Port = 3001,
    [switch]$Turbopack
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

Set-Location (Join-Path $PSScriptRoot "..")
$repoRoot = (Get-Location).Path

function Get-DatabaseUrlFromEnvFile {
    param([string]$FilePath)

    if (-not (Test-Path $FilePath)) {
        return $null
    }

    $line = Get-Content $FilePath -Encoding UTF8 |
        Where-Object { $_ -match '^\s*DATABASE_URL=' -and $_ -notmatch '^\s*#' } |
        Select-Object -First 1

    if (-not $line) {
        return $null
    }

    return ($line -replace '^\s*DATABASE_URL=\s*["'']?|["'']?\s*$', '')
}

function ConvertTo-PilotDatabaseUrl {
    param([string]$Url)

    if ($Url -match '^(?<prefix>postgresql://[^/]+/)(?<db>[^?]+)(?<suffix>\?.*)?$') {
        return "$($Matches.prefix)aqliya_lc_pilot$($Matches.suffix)"
    }

    throw "Could not parse DATABASE_URL. Expected postgresql://user:pass@host:port/dbname"
}

$envFile = $null
$dbUrl = $null

foreach ($candidate in @(".env.local", ".env")) {
    $candidatePath = Join-Path $repoRoot $candidate
    $dbUrl = Get-DatabaseUrlFromEnvFile -FilePath $candidatePath
    if ($dbUrl) {
        $envFile = $candidate
        break
    }
}

if (-not $dbUrl) {
    Write-Host "ERROR: DATABASE_URL not found in .env.local or .env" -ForegroundColor Red
    Write-Host "Copy .env.example to .env (or use .env.pilot.example as reference)." -ForegroundColor Yellow
    exit 1
}

$pilotDbUrl = ConvertTo-PilotDatabaseUrl -Url $dbUrl
$appUrl = "http://localhost:$Port"

$env:DATABASE_URL = $pilotDbUrl
$env:LOCALCONTENT_CONTENT_BACKEND = "prisma"
$env:NEXTAUTH_URL = $appUrl
$env:NEXT_PUBLIC_APP_URL = $appUrl

Write-Host ""
Write-Host "LocalContentOS pilot dev - repo: $repoRoot" -ForegroundColor Cyan
Write-Host "Env source: $envFile (DATABASE_URL dbname -> aqliya_lc_pilot; credentials unchanged)" -ForegroundColor DarkGray
Write-Host "LOCALCONTENT_CONTENT_BACKEND=prisma" -ForegroundColor DarkGray
Write-Host "URL: $appUrl" -ForegroundColor DarkGray
Write-Host ""

$nextArgs = @("dev", "-p", "$Port")
if (-not $Turbopack) {
    $nextArgs += "--webpack"
}

& npx next @nextArgs
exit $LASTEXITCODE
