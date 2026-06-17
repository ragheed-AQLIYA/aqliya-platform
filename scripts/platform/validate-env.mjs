#!/usr/bin/env node

/**
 * Environment validation script.
 * Run: node scripts/validate-env.mjs
 * Triggered on postinstall via package.json
 */

const requiredVars = {
  DATABASE_URL: { description: "PostgreSQL connection string" },
}

const authSecretKeys = ["AUTH_SECRET", "NEXTAUTH_SECRET"]

const recommendedProductionVars = {
  NEXTAUTH_URL: { description: "Canonical app URL for auth callbacks" },
  DOWNLOAD_TOKEN_SECRET: {
    description:
      "HMAC secret for signed evidence download URLs (optional for startup; session downloads work without it)",
  },
  LOCAL_STORAGE_DIR: {
    description: "Writable directory for uploaded evidence/files",
  },
}

const optionalVars = {
  STORAGE_PROVIDER: { description: "Storage backend (local only integrated for v0.1)" },
  LOG_LEVEL: { description: "Logging level (debug/info/warn/error)" },
  NEXT_PUBLIC_APP_URL: { description: "Public app URL for links/metadata" },
  NEXT_PUBLIC_PLAUSIBLE_DOMAIN: { description: "Plausible analytics domain" },
  SENTRY_DSN: { description: "Sentry DSN for server/edge errors" },
  NEXT_PUBLIC_SENTRY_DSN: { description: "Sentry DSN for client errors" },
  AI_CLOUD_API_KEY: { description: "Cloud AI provider API key (assistive features)" },
  AI_CLOUD_BASE_URL: { description: "Cloud AI provider base URL" },
  AI_CLOUD_MODEL: { description: "Default cloud AI model name" },
  SCANNER_PROVIDER: { description: "Virus scanner provider (not yet integrated)" },
  ANALYZE: { description: "Enable bundle analysis" },
}

let hasErrors = false

console.log("\n=== AQLIYA Environment Validation ===\n")

for (const [key, config] of Object.entries(requiredVars)) {
  if (!process.env[key]) {
    console.error(`❌ MISSING (required): ${key} — ${config.description}`)
    hasErrors = true
  } else {
    console.log(`✅ ${key}`)
  }
}

const authSecret = authSecretKeys.find((key) => process.env[key])
if (!authSecret) {
  console.error(
    "❌ MISSING (required): AUTH_SECRET — NextAuth JWT secret (NEXTAUTH_SECRET also accepted)",
  )
  hasErrors = true
} else {
  console.log(`✅ ${authSecret} (auth secret)`)
  const value = process.env[authSecret]
  if (value && value.length < 32) {
    console.warn("⚠️  Auth secret is shorter than 32 characters")
  }
}

if (process.env.NODE_ENV === "production") {
  console.log("\n--- Production recommendations ---")
  for (const [key, config] of Object.entries(recommendedProductionVars)) {
    if (!process.env[key]) {
      console.warn(`⚠️  RECOMMENDED: ${key} — ${config.description}`)
    } else {
      console.log(`✅ ${key}`)
    }
  }
}

console.log("\n--- Optional ---")
for (const [key, config] of Object.entries(optionalVars)) {
  if (!process.env[key]) {
    console.log(`⚠️  OPTIONAL: ${key} — ${config.description} (not set)`)
  } else {
    console.log(`✅ ${key}`)
  }
}

if (process.env.STORAGE_PROVIDER && process.env.STORAGE_PROVIDER !== "local") {
  console.warn(
    `\n⚠️  STORAGE_PROVIDER=${process.env.STORAGE_PROVIDER} is not fully integrated. Use local for AuditOS v0.1 controlled deployment.`,
  )
}

console.log("\n=== Result ===")
if (hasErrors) {
  console.error("❌ Required environment variables missing. See above.\n")
  process.exit(1)
}

console.log("✅ Required variables present.\n")
