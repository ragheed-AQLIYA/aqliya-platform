#!/usr/bin/env node

/**
 * AQLIYA On-Premise Validation Script
 * Checks deployment readiness for on-premise / air-gapped environments.
 * Usage: node scripts/platform/validate-on-premise.mjs
 */

import { existsSync, readFileSync, readdirSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, "../..")

const RESULTS = []

function pass(name, detail = "") {
  RESULTS.push({ name, status: "PASS", detail })
}

function warn(name, detail) {
  RESULTS.push({ name, status: "WARN", detail })
}

function fail(name, detail) {
  RESULTS.push({ name, status: "FAIL", detail })
}

// 1. Prerequisites check
console.log("\n\u{1F50D} Checking prerequisites...")

// Docker
const dockerOk = existsSync("/usr/bin/docker") || existsSync("/usr/local/bin/docker")
if (dockerOk) pass("Docker installed")
else warn("Docker installed", "Docker not found at default paths — may use Podman or alternative")

const dockerComposeOk = existsSync("/usr/local/bin/docker-compose") || existsSync("/usr/bin/docker-compose") || existsSync("/usr/libexec/docker/cli-plugins/docker-compose")
if (dockerComposeOk) pass("Docker Compose installed")
else warn("Docker Compose installed", "Not found at standard paths")

// Node.js
const nodeVersion = process.version
const nodeMajor = parseInt(nodeVersion.slice(1).split(".")[0] ?? "0", 10)
if (nodeMajor >= 22) pass("Node.js version", `${nodeVersion} (22+ required)`)
else if (nodeMajor >= 20) warn("Node.js version", `${nodeVersion} (22 recommended, 20 minimum)`)
else fail("Node.js version", `${nodeVersion} (20+ required)`)

// 2. File checks
console.log("\n\u{1F4C1} Checking required files...")

const requiredFiles = [
  "package.json",
  "Dockerfile",
  "docker-compose.yml",
  ".env.example",
  "next.config.mjs",
  "tsconfig.json",
  "prisma/schema.prisma",
]

for (const file of requiredFiles) {
  const fullPath = join(ROOT, file)
  if (existsSync(fullPath)) pass(`File: ${file}`)
  else fail(`File: ${file}`, "Not found")
}

// 3. .env configuration check
console.log("\n\u{2699}\u{FE0F} Checking .env configuration...")

const envPath = join(ROOT, ".env")
const envExamplePath = join(ROOT, ".env.example")

if (existsSync(envPath)) {
  const env = readFileSync(envPath, "utf-8")

  // Required vars
  const required = ["AUTH_SECRET", "DATABASE_URL", "DOWNLOAD_TOKEN_SECRET"]
  for (const varName of required) {
    if (env.includes(`${varName}=`) && !env.includes(`${varName}=change-me`)) {
      pass(`ENV: ${varName}`, "Configured")
    } else if (env.includes(`${varName}=`)) {
      warn(`ENV: ${varName}`, "Set to default/placeholder value — change in production")
    } else {
      fail(`ENV: ${varName}`, "Not configured")
    }
  }

  // Recommended vars
  const recommended = ["REDIS_URL", "SCANNER_PROVIDER", "RATE_LIMITER"]
  for (const varName of recommended) {
    if (env.includes(`${varName}=`)) pass(`ENV: ${varName}`, "Configured")
    else warn(`ENV: ${varName}`, "Not set (falls back to default — verify acceptable)")
  }
} else {
  warn(".env file", "Not found — copy from .env.example and configure")
  if (existsSync(envExamplePath)) pass(".env.example exists", "Template available")
  else fail(".env.example exists", "Not found")
}

// 4. Prisma check
console.log("\n\u{1F5C4}\u{FE0F} Checking database configuration...")

const prismaSchema = join(ROOT, "prisma/schema.prisma")
if (existsSync(prismaSchema)) {
  const schema = readFileSync(prismaSchema, "utf-8")
  const hasPgvector = schema.includes("pgvector") || schema.includes("vector(")
  if (hasPgvector) pass("pgvector extension", "Required for vector embeddings — use pgvector/pgvector:pg16 Docker image")

  const migrationDir = join(ROOT, "prisma/migrations")
  if (existsSync(migrationDir)) {
    const migrations = readdirSync(migrationDir).filter(d => /^\d{14}_/.test(d))
    pass("Prisma migrations", `${migrations.length} migrations found`)
  } else {
    fail("Prisma migrations", "No migrations directory")
  }
}

// 5. Docker Compose services
console.log("\n\u{1F433} Checking Docker Compose configuration...")

const composePath = join(ROOT, "docker-compose.yml")
if (existsSync(composePath)) {
  const compose = readFileSync(composePath, "utf-8")

  const checks = [
    { name: "PostgreSQL (pgvector)", pattern: "pgvector/pgvector:pg16" },
    { name: "Redis", pattern: "redis:7-alpine" },
    { name: "ClamAV", pattern: "clamav/clamav" },
    { name: "Health checks configured", pattern: "healthcheck" },
  ]

  for (const check of checks) {
    if (compose.includes(check.pattern)) pass(`Service: ${check.name}`)
    else warn(`Service: ${check.name}`, "Not found in docker-compose.yml")
  }
}

// 6. Air-gapped readiness
console.log("\n\u{1F6E1}\u{FE0F} Checking air-gapped readiness...")

const hasLocalProviders = existsSync(join(ROOT, "src/lib/ai/providers/local"))
if (hasLocalProviders) warn("Air-gap: Local AI provider", "Local provider found — verify it works without internet")
else warn("Air-gap: Local AI provider", "Not found — AI features require internet access to Anthropic/OpenAI")

// 7. Security check
console.log("\n\u{1F512} Quick security check...")

if (existsSync(envPath)) {
  const env = readFileSync(envPath, "utf-8")
  if (env.includes("AUTH_SECRET=change-me") || env.includes("DOWNLOAD_TOKEN_SECRET=change-me")) {
    warn("Security: Secret keys", "Using default/placeholder values — rotate before production")
  }
}

// Summary
console.log("\n" + "=".repeat(50))
console.log("\u{1F4CB} ON-PREMISE VALIDATION RESULTS")
console.log("=".repeat(50))

let passed = 0, warnings = 0, failed = 0
for (const r of RESULTS) {
  const icon = r.status === "PASS" ? "\u{2705}" : r.status === "WARN" ? "\u{26A0}\u{FE0F}" : "\u{274C}"
  console.log(`  ${icon} ${r.name}${r.detail ? `: ${r.detail}` : ""}`)
  if (r.status === "PASS") passed++
  else if (r.status === "WARN") warnings++
  else failed++
}

console.log("\n" + "=".repeat(50))
console.log(`\u{2705} ${passed} passed | \u{26A0}\u{FE0F} ${warnings} warnings | \u{274C} ${failed} failed`)
console.log("=".repeat(50))

if (failed > 0) {
  console.log("\n\u{274C} Deployment not ready — fix failures before proceeding.")
  process.exit(1)
} else if (warnings > 0) {
  console.log("\n\u{26A0}\u{FE0F} Deployment ready with warnings — review before production.")
} else {
  console.log("\n\u{2705} Deployment ready — all checks passed!")
}
