#!/usr/bin/env node

/**
 * Environment validation script.
 * Run: node scripts/validate-env.mjs
 * Or automatically via: npm start / npm run build
 */

const requiredVars = {
  NEXTAUTH_SECRET: { description: "NextAuth secret key", required: true },
  NEXTAUTH_URL: { description: "NextAuth base URL", required: true },
  DATABASE_URL: { description: "PostgreSQL connection string", required: true },
}

const optionalVars = {
  NEXT_PUBLIC_PLAUSIBLE_DOMAIN: { description: "Plausible analytics domain" },
  SENTRY_DSN: { description: "Sentry DSN for server/edge errors" },
  NEXT_PUBLIC_SENTRY_DSN: { description: "Sentry DSN for client errors" },
  LOG_LEVEL: { description: "Logging level (debug/info/warn/error)" },
  ANALYZE: { description: "Enable bundle analysis" },
}

let hasErrors = false
let hasWarnings = false

console.log("\n=== Environment Validation ===\n")

// Check required
for (const [key, config] of Object.entries(requiredVars)) {
  if (!process.env[key]) {
    console.error(`❌ MISSING: ${key} — ${config.description}`)
    hasErrors = true
  } else {
    console.log(`✅ ${key}`)
  }
}

// Check optional
for (const [key, config] of Object.entries(optionalVars)) {
  if (!process.env[key]) {
    console.log(`⚠️  OPTIONAL: ${key} — ${config.description} (not set)`)
    hasWarnings = true
  } else {
    console.log(`✅ ${key}`)
  }
}

console.log("\n=== Result ===")
if (hasErrors) {
  console.error("❌ Required environment variables missing. See above.\n")
  process.exit(1)
} else if (hasWarnings) {
  console.log("⚠️  All required variables set. Some optional variables missing.\n")
} else {
  console.log("✅ All environment variables validated.\n")
}
