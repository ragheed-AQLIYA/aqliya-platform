<#
.SYNOPSIS
    AQLIYA Pilot Launch — One-click Windows launcher
.DESCRIPTION
    Checks prerequisites, starts Docker containers (PostgreSQL + Redis),
    pushes schema, seeds pilot data, builds the app, and starts the server.
.PARAMETER Help
    Show usage instructions
.PARAMETER SkipBuild
    Skip the Next.js build step (useful if already built)
.PARAMETER SkipSeed
    Skip database seeding (useful for restart without data loss)
.PARAMETER NoBrowser
    Don't open browser after launch
.EXAMPLE
    .\scripts\pilot\launch-pilot.ps1
.EXAMPLE
    .\scripts\pilot\launch-pilot.ps1 -SkipBuild
.EXAMPLE
    .\scripts\pilot\launch-pilot.ps1 -SkipSeed -NoBrowser
#>

param(
    [switch]$Help,
    [switch]$SkipBuild,
    [switch]$SkipSeed,
    [switch]$NoBrowser
)

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

# ─── Colors ────────────────────────────────────────────────────────────────
function Write-Color($Color, $Text) {
    Write-Host $Text -ForegroundColor $Color
}
function Write-Step($Step, $Text) {
    Write-Host "[$Step/10] " -NoNewline -ForegroundColor Cyan
    Write-Host $Text -ForegroundColor White
}
function Write-Ok($Text) {
    Write-Host "  OK  " -NoNewline -ForegroundColor Green
    Write-Host $Text
}
function Write-Warn($Text) {
    Write-Host "  WARN " -NoNewline -ForegroundColor Yellow
    Write-Host $Text
}
function Write-Err($Text) {
    Write-Host "  FAIL " -NoNewline -ForegroundColor Red
    Write-Host $Text
}
function Write-Banner {
    Write-Host ""
    Write-Host "  ╔══════════════════════════════════════════════════╗" -ForegroundColor Blue
    Write-Host "  ║     AQLIYA PILOT LAUNCHER — Windows Edition      ║" -ForegroundColor Blue
    Write-Host "  ╚══════════════════════════════════════════════════╝" -ForegroundColor Blue
    Write-Host ""
}

# ─── Help ──────────────────────────────────────────────────────────────────
if ($Help) {
    Write-Banner
    Write-Host "USAGE:" -ForegroundColor Yellow
    Write-Host "  .\scripts\pilot\launch-pilot.ps1 [options]"
    Write-Host ""
    Write-Host "OPTIONS:" -ForegroundColor Yellow
    Write-Host "  -Help          Show this help message"
    Write-Host "  -SkipBuild     Skip the Next.js build step (use if already built)"
    Write-Host "  -SkipSeed      Skip pilot database seeding (preserve existing data)"
    Write-Host "  -NoBrowser     Don't open browser after launch"
    Write-Host ""
    Write-Host "REQUIRES:" -ForegroundColor Yellow
    Write-Host "  - Node.js 20+ (recommended: 22+)"
    Write-Host "  - Docker Desktop (or Docker Engine)"
    Write-Host "  - Free ports: 3000, 5432, 6379"
    Write-Host "  - .env file configured (copy from .env.example)"
    Write-Host ""
    Write-Host "WHAT IT DOES:" -ForegroundColor Yellow
    Write-Host "  1.  Checks prerequisites"
    Write-Host "  2.  Starts Docker containers (PostgreSQL + Redis)"
    Write-Host "  3.  Waits for PostgreSQL to be healthy"
    Write-Host "  4.  Pushes Prisma schema to database"
    Write-Host "  5.  Seeds pilot demo data (180+ Saudi institutional records)"
    Write-Host "  6.  Generates Prisma client"
    Write-Host "  7.  Builds the Next.js application"
    Write-Host "  8.  Starts the production server"
    Write-Host "  9.  Prints demo account credentials"
    Write-Host "  10. Opens browser to http://localhost:3000"
    Write-Host ""
    Write-Host "FIRST-TIME SETUP:" -ForegroundColor Yellow
    Write-Host "  1. Copy .env.example to .env and configure AUTH_SECRET"
    Write-Host "  2. Ensure Docker Desktop is running"
    Write-Host "  3. Run: .\scripts\pilot\launch-pilot.ps1"
    Write-Host ""
    exit 0
}

# ─── Prerequisites Check Functions ─────────────────────────────────────────
function Test-Command($Name, $CheckCmd) {
    try {
        $null = Invoke-Expression $CheckCmd 2>&1
        return $true
    } catch {
        return $false
    }
}

function Test-PortFree($Port) {
    $conn = netstat -ano 2>$null | Select-String ":$Port " | Select-String "LISTENING"
    return (-not $conn)
}

function Get-NodeMajorVersion {
    $ver = node --version 2>$null
    if ($ver -match 'v(\d+)') {
        return [int]$Matches[1]
    }
    return 0
}

# ─── MAIN ──────────────────────────────────────────────────────────────────
Write-Banner

# ─── Step 1: Prerequisites ─────────────────────────────────────────────────
Write-Step 1 "Checking prerequisites..."

$failed = $false
$envFile = Join-Path $PSScriptRoot "..\..\.env"
if (-not (Test-Path $envFile)) {
    Write-Err ".env file not found at $envFile"
    Write-Warn "Copy .env.example to .env and configure AUTH_SECRET first"
    $failed = $true
}
if (-not (Test-Command "node" "node --version")) { Write-Err "Node.js not found" ; $failed = $true }
else {
    $nodeVer = Get-NodeMajorVersion
    if ($nodeVer -lt 20) { Write-Err "Node.js $nodeVer detected — need 20+ (22+ recommended)" ; $failed = $true }
    else { Write-Ok "Node.js v$nodeVer" }
}
if (-not (Test-Command "docker" "docker --version")) { Write-Err "Docker not found — install Docker Desktop" ; $failed = $true }
else { Write-Ok "Docker available" }
if (-not (Test-Command "npm" "npm --version")) { Write-Err "npm not found" ; $failed = $true }
else { Write-Ok "npm available" }

foreach ($port in @(3000, 5432, 6379)) {
    if (Test-PortFree $port) { Write-Ok "Port $port is free" }
    else { Write-Err "Port $port is in use — free it before launching" ; $failed = $true }
}

if ($failed) {
    Write-Host ""
    Write-Err "Prerequisites check failed. Fix the issues above and re-run."
    exit 1
}
Write-Ok "All prerequisites met"

# ─── Step 2: Start Docker containers ───────────────────────────────────────
Write-Step 2 "Starting Docker containers (PostgreSQL + Redis)..."
try {
    docker compose up -d db redis 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "docker compose failed (exit code $LASTEXITCODE)"
    }
    Write-Ok "Containers starting..."
} catch {
    Write-Err "Failed to start Docker containers: $_"
    Write-Warn "Ensure Docker Desktop is running and docker-compose.yml is valid"
    exit 1
}

# ─── Step 3: Wait for PostgreSQL ───────────────────────────────────────────
Write-Step 3 "Waiting for PostgreSQL to be healthy..."
$maxAttempts = 30
$healthy = $false
for ($i = 1; $i -le $maxAttempts; $i++) {
    $status = docker compose ps db --format json 2>$null | ConvertFrom-Json -ErrorAction SilentlyContinue
    if ($status -and $status.Health -eq "healthy") {
        $healthy = $true
        break
    }
    Write-Host "  Waiting... ($i/$maxAttempts)" -NoNewline
    Start-Sleep -Seconds 2
    Write-Host "`r" -NoNewline
}
if (-not $healthy) {
    Write-Err "PostgreSQL did not become healthy within $($maxAttempts * 2)s"
    Write-Warn "Check: docker compose ps db"
    exit 1
}
Write-Ok "PostgreSQL is healthy"

# ─── Step 4: Push Prisma schema ────────────────────────────────────────────
Write-Step 4 "Pushing Prisma schema..."
try {
    npx prisma db push --accept-data-loss 2>&1
    if ($LASTEXITCODE -ne 0) { throw "prisma db push failed" }
    Write-Ok "Schema pushed"
} catch {
    Write-Err "Prisma db push failed: $_"
    exit 1
}

# ─── Step 5: Seed pilot data ───────────────────────────────────────────────
if ($SkipSeed) {
    Write-Step 5 "Skipping pilot seed (--SkipSeed)"
    Write-Warn "Database may be empty or contain stale data"
} else {
    Write-Step 5 "Seeding pilot data (180+ Saudi institutional records)..."
    $env:PILOT_SEED = "true"
    try {
        npx tsx prisma/seed-pilot.ts 2>&1
        if ($LASTEXITCODE -ne 0) { throw "seed-pilot failed" }
        Write-Ok "Pilot seed complete"
    } catch {
        Write-Err "Pilot seed failed: $_"
        Write-Warn "Check DATABASE_URL in .env and PostgreSQL connectivity"
        exit 1
    }
}

# ─── Step 6: Generate Prisma client ────────────────────────────────────────
Write-Step 6 "Generating Prisma client..."
try {
    npx prisma generate 2>&1
    if ($LASTEXITCODE -ne 0) { throw "prisma generate failed" }
    Write-Ok "Prisma client generated"
} catch {
    Write-Err "Prisma generate failed: $_"
    exit 1
}

# ─── Step 7: Build the app ─────────────────────────────────────────────────
$env:NODE_OPTIONS = "--max-old-space-size=6144"
if ($SkipBuild) {
    Write-Step 7 "Skipping build (--SkipBuild)"
    Write-Warn "Make sure .next/ directory exists from a previous build"
} else {
    Write-Step 7 "Building the Next.js application (this may take a few minutes)..."
    try {
        npm run build 2>&1
        if ($LASTEXITCODE -ne 0) { throw "build failed" }
        Write-Ok "Build complete"
    } catch {
        Write-Err "Build failed: $_"
        Write-Warn "Check for TypeScript or ESLint errors"
        exit 1
    }
}

# ─── Step 8: Start the server ──────────────────────────────────────────────
Write-Step 8 "Starting production server on http://localhost:3000 ..."
$env:NODE_ENV = "production"
$startCmd = "npm run start"
Write-Host ""
Write-Host "  ╔══════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "  ║                                                   ║" -ForegroundColor Green
Write-Host "  ║   Server starting...                              ║" -ForegroundColor Green
Write-Host "  ║   Open: http://localhost:3000                     ║" -ForegroundColor Green
Write-Host "  ║   Press Ctrl+C to stop                            ║" -ForegroundColor Green
Write-Host "  ║                                                   ║" -ForegroundColor Green
Write-Host "  ╚══════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

# ─── Step 9: Print demo credentials ────────────────────────────────────────
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
Write-Host "  PILOT DEMO ACCOUNTS" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
Write-Host ""
Write-Host "  Base accounts (from prisma/seed.ts):"
Write-Host "    admin@aqliya.com    / admin123     (ADMIN — all access)"
Write-Host "    operator@aqliya.com / operator123  (OPERATOR)"
Write-Host "    viewer@aqliya.com   / viewer123    (VIEWER — read only)"
Write-Host ""
Write-Host "  Pilot accounts (from prisma/seed-pilot.ts):"
Write-Host "    admin.pilot@aqliya.com    / pilot123  (ADMIN — full access)"
Write-Host "    partner.pilot@aqliya.com  / pilot123  (ADMIN — partner)"
Write-Host "    manager.pilot@aqliya.com  / pilot123  (OPERATOR — LC + Sales)"
Write-Host "    auditor.pilot@aqliya.com  / pilot123  (OPERATOR — audit)"
Write-Host "    reviewer.pilot@aqliya.com / pilot123  (OPERATOR — review)"
Write-Host "    operator.pilot@aqliya.com / pilot123  (OPERATOR — ops)"
Write-Host "    analyst.pilot@aqliya.com  / pilot123  (OPERATOR — analysis)"
Write-Host "    viewer.pilot@aqliya.com   / pilot123  (VIEWER — read only)"
Write-Host ""
Write-Host "  Full demo-accounts card: scripts/pilot/demo-accounts.md"
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
Write-Host ""

# ─── Step 10: Open browser ─────────────────────────────────────────────────
if (-not $NoBrowser) {
    Write-Step 10 "Opening browser to http://localhost:3000 ..."
    Start-Process "http://localhost:3000"
} else {
    Write-Step 10 "Browser launch skipped (--NoBrowser)"
}

# Launch the server (blocking)
$env:PILOT_SEED = ""
Start-Sleep -Seconds 1
Invoke-Expression $startCmd
