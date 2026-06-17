import { readFileSync, existsSync, readdirSync, statSync } from "fs"
import { join, relative, resolve } from "path"

interface AuditIssue {
  file: string
  line: number
  type: IssueType
  snippet: string
  severity: "HIGH" | "MEDIUM" | "LOW"
}

type IssueType =
  | "MISSING_DIR_RTL"
  | "LEFT_POSITION"
  | "MR_MARGIN"
  | "ML_MARGIN"
  | "PL_PADDING"
  | "PR_PADDING"
  | "EN_US_DATE"
  | "ABSOLUTE_POSITION"
  | "TEXT_ALIGN"

interface FileResult {
  path: string
  issues: AuditIssue[]
}

function findAllTsxFiles(dir: string): string[] {
  if (!existsSync(dir)) {
    console.error(`[ERROR] Directory not found: ${dir}`)
    return []
  }
  const results: string[] = []
  function walk(current: string): void {
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const fullPath = join(current, entry.name)
      if (entry.isDirectory()) {
        walk(fullPath)
      } else if (entry.isFile() && entry.name.endsWith(".tsx")) {
        results.push(fullPath)
      }
    }
  }
  walk(dir)
  return results
}

function hasJsx(content: string): boolean {
  return /return\s*\(?\s*</.test(content) || /JSX/.test(content) || /<[A-Za-z]/.test(content)
}

function auditFile(filePath: string, rootDir: string): FileResult {
  const content = readFileSync(filePath, "utf-8")
  const lines = content.split("\n")
  const relativePath = relative(rootDir, filePath)
  const issues: AuditIssue[] = []

  const hasJsxContent = hasJsx(content)

  // Check (a): Missing dir="rtl" on root wrapper
  if (hasJsxContent && !/dir\s*=\s*["']rtl["']/.test(content)) {
    // Find the first line with a JSX element that looks like a root wrapper
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      if (/<\w+[^>]*>/.test(line) && !line.includes("dir=") && !line.includes("sr-only") && !line.includes("import")) {
        issues.push({
          file: relativePath,
          line: i + 1,
          type: "MISSING_DIR_RTL",
          snippet: line.trim().substring(0, 100),
          severity: "MEDIUM",
        })
        break
      }
    }
  }

  // Patterns to scan line by line
  const leftClassPattern = /\bleft-(\d+|auto|\[[^\]]+\])/.source
  const mlClassPattern = /\bml-(\d+|auto|\[[^\]]+\])/.source
  const mrClassPattern = /\bmr-(\d+|auto|\[[^\]]+\])/.source
  const plClassPattern = /\bpl-(\d+|\[[^\]]+\])/.source
  const prClassPattern = /\bpr-(\d+|\[[^\]]+\])/.source
  const textAlignPattern = /\b(text-left|text-right)\b/.source

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trim()

    // Skip imports, comments, and type-only lines
    if (/^\s*(import|export\s*(type|interface)|}\s*from|\/\/|\/\*|\*\/)/.test(line)) continue
    if (trimmed.startsWith("//") || trimmed.startsWith("/*") || trimmed.startsWith("*")) continue

    // (b) left-* classes
    const leftMatch = trimmed.match(new RegExp(leftClassPattern, "g"))
    if (leftMatch) {
      for (const m of leftMatch) {
        issues.push({
          file: relativePath,
          line: i + 1,
          type: "LEFT_POSITION",
          snippet: extractSnippet(trimmed, m),
          severity: "HIGH",
        })
      }
    }

    // (c) mr-* margins (icon spacing in LTR that flips)
    const mrMatch = trimmed.match(new RegExp(mrClassPattern, "g"))
    if (mrMatch) {
      for (const m of mrMatch) {
        issues.push({
          file: relativePath,
          line: i + 1,
          type: "MR_MARGIN",
          snippet: extractSnippet(trimmed, m),
          severity: "MEDIUM",
        })
      }
    }

    // (c) ml-* margins
    const mlMatch = trimmed.match(new RegExp(mlClassPattern, "g"))
    if (mlMatch) {
      for (const m of mlMatch) {
        issues.push({
          file: relativePath,
          line: i + 1,
          type: "ML_MARGIN",
          snippet: extractSnippet(trimmed, m),
          severity: "MEDIUM",
        })
      }
    }

    // (d) pl-* padding
    const plMatch = trimmed.match(new RegExp(plClassPattern, "g"))
    if (plMatch) {
      for (const m of plMatch) {
        issues.push({
          file: relativePath,
          line: i + 1,
          type: "PL_PADDING",
          snippet: extractSnippet(trimmed, m),
          severity: "MEDIUM",
        })
      }
    }

    // (d) pr-* padding
    const prMatch = trimmed.match(new RegExp(prClassPattern, "g"))
    if (prMatch) {
      for (const m of prMatch) {
        issues.push({
          file: relativePath,
          line: i + 1,
          type: "PR_PADDING",
          snippet: extractSnippet(trimmed, m),
          severity: "LOW",
        })
      }
    }

    // (e) en-US hardcoded
    const enUsMatch = trimmed.match(/toLocaleDateString\s*\(\s*['"]en-US['"]/)
    if (enUsMatch) {
      issues.push({
        file: relativePath,
        line: i + 1,
        type: "EN_US_DATE",
        snippet: extractSnippet(trimmed, enUsMatch[0]),
        severity: "HIGH",
      })
    }

    // (f) Hardcoded left/right in style attributes
    const styleLeftMatch = trimmed.match(/style\s*=\s*\{\s*\{\s*[^}]*\bleft\s*:/)
    const styleRightMatch = trimmed.match(/style\s*=\s*\{\s*\{\s*[^}]*\bright\s*:/)
    if (styleLeftMatch) {
      issues.push({
        file: relativePath,
        line: i + 1,
        type: "ABSOLUTE_POSITION",
        snippet: extractSnippet(trimmed, styleLeftMatch[0]),
        severity: "HIGH",
      })
    }
    if (styleRightMatch) {
      issues.push({
        file: relativePath,
        line: i + 1,
        type: "ABSOLUTE_POSITION",
        snippet: extractSnippet(trimmed, styleRightMatch[0]),
        severity: "MEDIUM",
      })
    }

    // (g) text-left or text-right alignment
    const textAlignMatch = trimmed.match(new RegExp(textAlignPattern, "g"))
    if (textAlignMatch) {
      for (const m of textAlignMatch) {
        issues.push({
          file: relativePath,
          line: i + 1,
          type: "TEXT_ALIGN",
          snippet: extractSnippet(trimmed, m),
          severity: "MEDIUM",
        })
      }
    }
  }

  return { path: relativePath, issues }
}

function extractSnippet(line: string, match: string, contextChars = 20): string {
  const idx = line.indexOf(match)
  if (idx === -1) return match
  const start = Math.max(0, idx - contextChars)
  const end = Math.min(line.length, idx + match.length + contextChars)
  let snippet = line.substring(start, end).trim()
  if (start > 0) snippet = "..." + snippet
  if (end < line.length) snippet = snippet + "..."
  return snippet
}

function main(): void {
  const rootDir = resolve(__dirname, "../..")
  const auditDir = join(rootDir, "src", "components", "audit")

  console.log("=".repeat(72))
  console.log("  AQLIYA — RTL Audit Report")
  console.log("  Scanning: src/components/audit/")
  console.log("=".repeat(72))
  console.log()

  const files = findAllTsxFiles(auditDir)
  if (files.length === 0) {
    console.log("[SKIP] No .tsx files found in src/components/audit/")
    return
  }

  const results: FileResult[] = []
  const issueTypeCount: Record<string, number> = {}

  for (const filePath of files) {
    const result = auditFile(filePath, rootDir)
    if (result.issues.length > 0) {
      results.push(result)
      for (const issue of result.issues) {
        issueTypeCount[issue.type] = (issueTypeCount[issue.type] || 0) + 1
      }
    }
  }

  const filesWithIssues = results.length
  const totalIssues = Object.values(issueTypeCount).reduce((a, b) => a + b, 0)

  // Print individual results
  for (const result of results) {
    console.log(`\n  ${result.path}`)
    console.log(`  ${"-".repeat(result.path.length)}`)
    for (const issue of result.issues) {
      const severityTag =
        issue.severity === "HIGH" ? " 🔴 HIGH" :
        issue.severity === "MEDIUM" ? " 🟡 MEDIUM" :
        " 🟢 LOW"
      console.log(`    Ln ${String(issue.line).padStart(4)}  [${issue.type.padEnd(18)}]${severityTag}`)
      console.log(`          ${issue.snippet}`)
    }
  }

  // Summary
  console.log()
  console.log("=".repeat(72))
  console.log("  SUMMARY")
  console.log("=".repeat(72))
  console.log(`  Total files scanned:     ${files.length}`)
  console.log(`  Files with issues:       ${filesWithIssues}`)
  console.log(`  Total issues found:      ${totalIssues}`)
  console.log()
  console.log("  Issues by type:")
  console.log("  " + "-".repeat(40))

  const typeLabels: Record<string, string> = {
    MISSING_DIR_RTL: "Missing dir=\"rtl\"",
    LEFT_POSITION: "Left-positioned classes",
    MR_MARGIN: "mr-* margin (icon spacing)",
    ML_MARGIN: "ml-* margin (icon spacing)",
    PL_PADDING: "pl-* padding",
    PR_PADDING: "pr-* padding",
    EN_US_DATE: "en-US hardcoded date",
    ABSOLUTE_POSITION: "Hardcoded position in style",
    TEXT_ALIGN: "text-left/text-right alignment",
  }

  const severityOrder: Record<string, number> = { HIGH: 0, MEDIUM: 1, LOW: 2 }

  const sortedTypes = Object.entries(issueTypeCount).sort((a, b) => {
    const sevDiff = severityOrder[getSeverityForType(a[0])] - severityOrder[getSeverityForType(b[0])]
    if (sevDiff !== 0) return sevDiff
    return b[1] - a[1]
  })

  for (const [type, count] of sortedTypes) {
    const label = typeLabels[type] || type
    console.log(`    ${type.padEnd(20)} ${String(count).padStart(4)}  ${label}`)
  }

  console.log()
  const verdict = totalIssues === 0
    ? "✅ PASS — No RTL issues found."
    : `⚠️  ${totalIssues} RTL issue(s) found across ${filesWithIssues} file(s). Review recommended.`
  console.log(`  Verdict: ${verdict}`)
  console.log("=".repeat(72))
}

function getSeverityForType(type: string): "HIGH" | "MEDIUM" | "LOW" {
  switch (type) {
    case "LEFT_POSITION":
    case "EN_US_DATE":
    case "ABSOLUTE_POSITION":
      return "HIGH"
    case "MISSING_DIR_RTL":
    case "MR_MARGIN":
    case "ML_MARGIN":
    case "PL_PADDING":
    case "TEXT_ALIGN":
      return "MEDIUM"
    case "PR_PADDING":
      return "LOW"
    default:
      return "MEDIUM"
  }
}

main()
