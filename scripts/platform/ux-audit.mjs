#!/usr/bin/env node

/**
 * AQLIYA UX Audit Script
 * Scans the repository for UX quality indicators.
 * Usage: node scripts/platform/ux-audit.mjs
 */

import { readFileSync, existsSync, readdirSync, statSync } from "fs"
import { join, relative } from "path"

const SRC_DIR = new URL("../../src", import.meta.url).pathname
const RESULTS = []

function findAll(dir, pattern) {
  const files = []
  try {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry)
      if (statSync(full).isDirectory()) {
        if (!entry.startsWith("__") && entry !== "node_modules") {
          files.push(...findAll(full, pattern))
        }
      } else if (pattern.test(entry)) {
        files.push(full)
      }
    }
  } catch { /* skip */ }
  return files
}

function check(dir, name, fn) {
  try {
    fn()
    RESULTS.push({ check: name, status: "PASS" })
  } catch (e) {
    RESULTS.push({ check: name, status: "FAIL", detail: e.message })
  }
}

const tsxFiles = findAll(SRC_DIR, /\.tsx$/)
const pageFiles = tsxFiles.filter(f => f.endsWith("/page.tsx"))
const layoutFiles = tsxFiles.filter(f => f.endsWith("/layout.tsx"))

// 1. RTL in layouts
check("src/", "RTL in layouts", () => {
  const withoutRTL = layoutFiles.filter(f => {
    const content = readFileSync(f, "utf-8")
    return !content.includes('dir="rtl"') && !content.includes("direction")
  })
  if (withoutRTL.length > 0) {
    throw new Error(`${withoutRTL.length} layouts without RTL: ${withoutRTL.slice(0, 3).map(f => relative(SRC_DIR, f)).join(", ")}`)
  }
})

// 2. Page files
check("src/", "Page files exist", () => {
  if (pageFiles.length < 10) throw new Error(`Only ${pageFiles.length} pages found`)
})

// 3. Suspense boundaries in pages
check("src/", "Suspense boundaries", () => {
  const withoutSuspense = pageFiles.filter(f => {
    const content = readFileSync(f, "utf-8")
    return !content.includes("Suspense")
  })
  console.log(`  Info: ${withoutSuspense.length} pages without Suspense`)
})

// 4. Arabic content check
check("src/", "Arabic content present", () => {
  const arabicPattern = /[\u0600-\u06FF]/
  const withArabic = pageFiles.filter(f => {
    const content = readFileSync(f, "utf-8")
    return arabicPattern.test(content)
  })
  if (withArabic.length === 0) throw new Error("No Arabic content found in pages")
  console.log(`  Info: ${withArabic.length} pages contain Arabic text`)
})

// 5. aria-label usage
check("src/", "aria-label usage", () => {
  const withAria = tsxFiles.filter(f => {
    const content = readFileSync(f, "utf-8")
    return content.includes("aria-label")
  })
  console.log(`  Info: ${withAria.length} files use aria-label`)
})

// Summary
console.log("\n=== UX Audit Results ===")
let passed = 0, failed = 0
for (const r of RESULTS) {
  const icon = r.status === "PASS" ? "✅" : "❌"
  console.log(`  ${icon} ${r.check}: ${r.status}${r.detail ? ` — ${r.detail}` : ""}`)
  if (r.status === "PASS") passed++; else failed++
}
console.log(`\n${passed} passed, ${failed} failed`)
process.exit(failed > 0 ? 1 : 0)
