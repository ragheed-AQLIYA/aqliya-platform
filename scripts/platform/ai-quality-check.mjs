#!/usr/bin/env node

/**
 * AQLIYA AI Quality Check Script
 * Audits AI quality configuration and provides recommendations.
 * Usage: node scripts/platform/ai-quality-check.mjs
 */

import { readFileSync, existsSync, readdirSync, statSync } from "fs"
import { join } from "path"

const ROOT_DIR = new URL("../..", import.meta.url).pathname
const AI_DIR = join(ROOT_DIR, "src/lib/core/ai")
const RESULTS = []

function check(name, fn) {
  try {
    fn()
    RESULTS.push({ name, status: "PASS" })
  } catch (e) {
    RESULTS.push({ name, status: "FAIL", detail: e.message })
  }
}

function checkWarning(name, fn) {
  try {
    fn()
    RESULTS.push({ name, status: "PASS" })
  } catch (e) {
    RESULTS.push({ name, status: "WARN", detail: e.message })
  }
}

// 1. Verify .env.example has AI provider config
check(".env.example", "AI provider config exists", () => {
  const env = readFileSync(join(ROOT_DIR, ".env.example"), "utf-8")
  if (!env.includes("OPENAI_API_KEY") && !env.includes("ANTHROPIC_API_KEY")) {
    throw new Error("No AI provider env vars found in .env.example")
  }
})

// 2. Check AI provider directory exists with TypeScript files
check("src/lib/core/ai/", "AI provider directory exists", () => {
  if (!existsSync(AI_DIR)) throw new Error("src/lib/core/ai directory not found")
  const files = readdirSync(AI_DIR, { recursive: true })
    .filter(f => typeof f === "string" && f.endsWith(".ts"))
  if (files.length === 0) throw new Error("No TypeScript files in src/lib/core/ai")
})

// 3. Check for provider router (multi-provider support)
check("AI Router", "Multi-provider routing", () => {
  const routerPath = join(AI_DIR, "provider-router.ts")
  if (!existsSync(routerPath)) {
    throw new Error("provider-router.ts not found — single provider only")
  }
})

// 4. Check for eval/gate system (quality gate)
check("AI Eval Gate", "Evaluation gate exists", () => {
  const evalPath = join(AI_DIR, "eval-gate.ts")
  if (!existsSync(evalPath)) {
    throw new Error("eval-gate.ts not found — no AI output quality gate")
  }
})

// 5. Check for human review patterns
check("AI Review", "Human review mechanisms", () => {
  const reviewDir = join(AI_DIR, "review")
  if (!existsSync(reviewDir)) {
    throw new Error("review/ directory not found")
  }
  const reviewFiles = readdirSync(reviewDir).filter(f => f.endsWith(".ts"))
  if (reviewFiles.length === 0) {
    throw new Error("No TypeScript files in review/ directory")
  }
})

// Summary
console.log("\n=== AI Quality Check Results ===")
let passed = 0, warned = 0, failed = 0
for (const r of RESULTS) {
  const icon = r.status === "PASS" ? "✅" : r.status === "WARN" ? "⚠️" : "❌"
  console.log(`  ${icon} ${r.check}: ${r.status}${r.detail ? ` — ${r.detail}` : ""}`)
  if (r.status === "PASS") passed++
  else if (r.status === "WARN") warned++
  else failed++
}
console.log(`\n${passed} passed, ${warned} warnings, ${failed} failed`)

// Recommendations
console.log("\n=== Recommendations ===")
console.log("1. Add multi-provider routing if using a single provider")
console.log("2. Implement eval gate for AI output quality scoring")
console.log("3. Add human-in-the-loop review for all AI-generated outputs")
console.log("4. Track AI output confidence scores across product surfaces")
console.log("5. Implement A/B testing for prompt improvements")
