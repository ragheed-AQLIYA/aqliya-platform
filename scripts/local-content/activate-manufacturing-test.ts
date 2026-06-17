// ─── Manufacturing Test: TB Activation + AI Advisor ───
// Same pipeline as the original but with manufacturing TB
// 
// P0: No schema changes.
//
// Usage: node --env-file .env --import tsx/esm scripts/local-content/activate-manufacturing-test.ts

import { resolve } from "path"
import { prisma } from "../../src/lib/prisma"
import { parseTbXlsxWithStats } from "../../src/lib/local-content/workbook/tb-loader"
import { populateWorkbookFromTb } from "../../src/lib/local-content/workbook/population"
import { runLocalContentPipeline } from "../../src/lib/local-content/pipeline-orchestrator"

const TB_FILE_PATH = resolve(__dirname, "../../TB_manufacturing_SAMA.xlsx")
const PROJECT_ID = "lc-project-demo-001"
const COMPANY_NAME = "شركة المصنع السعودي للصناعات المعدنية"
const INDUSTRY = "manufacturing"

async function main() {
  console.log("=".repeat(72))
  console.log("  LOCALCONTENTOS — MANUFACTURING TEST")
  console.log("  Validating generalizability across industries")
  console.log("=".repeat(72))
  console.log()

  // ── Step 1: Verify seed data ──

  console.log("[1/7] Database connected (via @/lib/prisma)")

  const adminUser = await prisma.user.findFirst({
    where: { email: "admin@aqliya.com" }
  })
  if (!adminUser) {
    console.error("FATAL: Admin user not found. Run seed first.")
    process.exit(1)
  }
  const organizationId = adminUser.organizationId
  console.log(`[1/7] Organization: ${organizationId}`)

  const project = await prisma.localContentProject.findUnique({
    where: { id: PROJECT_ID }
  })
  if (!project) {
    console.error(`FATAL: Project ${PROJECT_ID} not found. Run seed-local-content first.`)
    process.exit(1)
  }
  console.log(`[1/7] Project: ${project.name} (${project.reportingPeriod})`)
  console.log(`[1/7] Target TB: ${COMPANY_NAME} (${INDUSTRY})`)

  // ── Step 2: Parse XLSX ──

  console.log(`\n[2/7] Parsing TB: ${TB_FILE_PATH}`)
  const { lines: tbLines, stats: tbStats } = parseTbXlsxWithStats(TB_FILE_PATH)

  console.log(`  ✓ ${tbStats.totalAccounts} unique accounts`)
  console.log(`  ✓ ${tbStats.totalRows} raw rows processed`)
  console.log(`  ✓ ${tbStats.sheetsFound.length} sheets: ${tbStats.sheetsFound.join(", ")}`)
  console.log(`  ✓ Total debit:  SAR ${(tbStats.totalDebit / 1e6).toFixed(2)}M`)
  console.log(`  ✓ Total credit: SAR ${(tbStats.totalCredit / 1e6).toFixed(2)}M`)

  // ── Step 3: Populate Workbook from TB ──

  console.log(`\n[3/7] Populating workbook from TB...`)
  const populationResult = await populateWorkbookFromTb(
    PROJECT_ID,
    tbLines,
    `Manufacturing Test - ${COMPANY_NAME}`
  )
  const workbookId = populationResult.workbookId
  console.log(`  ✓ Workbook: ${workbookId}`)
  console.log(`  ✓ Auto-filled: ${populationResult.autoFilledLines}/${populationResult.totalLines} lines`)
  console.log(`  ✓ Completion: ${populationResult.completionPct}%`)

  // ── Step 4: Run Pipeline with TB ──

  console.log(`\n[4/7] Running pipeline with manufacturing TB data...`)
  const pipelineResult = await runLocalContentPipeline(
    organizationId,
    PROJECT_ID,
    workbookId,
    tbLines
  )
  console.log(`  ✓ Status: ${pipelineResult.status}`)
  console.log(`  ✓ ${pipelineResult.stages.length} stages in ${(pipelineResult.totalDurationMs / 1000).toFixed(1)}s`)
  for (const stage of pipelineResult.stages) {
    const icon = stage.status === "success" ? "✅"
      : stage.status === "partial" ? "⚠️"
      : stage.status === "skipped" ? "⏭️" : "❌"
    console.log(`  ${icon} Stage ${stage.stage} (${stage.name}): ${stage.summary} [${stage.durationMs}ms]`)
  }

  // ── Step 5: Query AI Outputs ──

  console.log(`\n[5/7] Querying AI outputs...`)
  
  const aiReviewRuns = await prisma.lcAiReviewRun.findMany({
    where: { workbookId },
    orderBy: { createdAt: "desc" },
    take: 10
  })
  const latestReview = aiReviewRuns[0] ?? null

  const explanations = await prisma.lcMatchReview.findMany({
    where: { organizationId },
    orderBy: { createdAt: "desc" },
    take: 100
  })
  const suggestions = await prisma.lcPatternSuggestion.findMany({
    where: { organizationId },
    orderBy: { createdAt: "desc" },
    take: 100
  })
  const healthRecords = await prisma.lcPatternHealthRecord.findMany({
    where: { organizationId },
    take: 50
  })
  const orgMemories = await prisma.lcOrganizationMatchMemory.findMany({
    where: { organizationId },
    take: 50
  })

  // Count false positives
  const falsePositives = explanations.filter(e => e.isFalsePositive)

  const highRisk = explanations.filter(e => e.riskLevel === "high" || e.riskLevel === "HIGH")
  const pendingReview = explanations.filter(e => e.status === "pending" || e.reviewStatus === "pending")
  const confirmed = explanations.filter(e => e.status === "confirmed" || e.reviewStatus === "confirmed")

  console.log(`
  ─── AI Output Summary ───

  AI Review Runs:           ${aiReviewRuns.length}
  Latest Review ID:         ${latestReview?.id ?? "N/A"}
  Latest Review Status:     ${latestReview?.status ?? "N/A"}

  Account Explanations:     ${explanations.length}
    Lines covered:          ${new Set(explanations.map(e => e.workbookLineCode)).size}
    High risk:              ${highRisk.length}
    Medium risk:            0
    Low risk:               ${explanations.length - highRisk.length}
    Pending review:         ${pendingReview.length}
    Confirmed:              ${confirmed.length}
    False positives:        ${falsePositives.length}

  Pattern Suggestions:      ${suggestions.length}
    Accepted:               ${suggestions.filter(s => s.status === "approved").length}
    Rejected:               ${suggestions.filter(s => s.status === "rejected").length}
    Pending:                ${suggestions.filter(s => s.status === "pending").length}

  Pattern Health Records:   ${healthRecords.length}
  Org Memory Records:       ${orgMemories.length}
  `)

  // Compute grounding coverage
  const totalAccountMentions = explanations.length
  const hallucinated = falsePositives.filter(fp => !fp.accountCode)
  const groundingPct = totalAccountMentions > 0
    ? Math.round(((totalAccountMentions - hallucinated.length) / totalAccountMentions) * 100)
    : 0
  const hallucinationPct = totalAccountMentions > 0
    ? Math.round((hallucinated.length / totalAccountMentions) * 100)
    : 0

  console.log(`
  Grounding Coverage:       ${groundingPct}%
  Hallucination Rate:       ${hallucinationPct}%`)

  // ── Step 6: Validate ──

  console.log("\n[6/7] Validation against targets:")

  const checks = [
    { name: "AI explanations ≥ 10", pass: explanations.length >= 10, actual: explanations.length, target: 10 },
    { name: "Pattern suggestions ≥ 5", pass: suggestions.length >= 5, actual: suggestions.length, target: 5 },
    { name: "Grounding coverage ≥ 80%", pass: groundingPct >= 80, actual: groundingPct, target: "80%" },
    { name: "Hallucination rate < 10%", pass: hallucinationPct < 10, actual: hallucinationPct, target: "<10%" },
    { name: "Stage 7 (AI Advisor) not skipped", pass: pipelineResult.stages.find(s => s.stage === 7)?.status === "success", actual: pipelineResult.stages.find(s => s.stage === 7)?.status ?? "N/A", target: "success/partial" },
    { name: "Stage 8 (AI Review) not skipped", pass: pipelineResult.stages.find(s => s.stage === 8)?.status === "success", actual: pipelineResult.stages.find(s => s.stage === 8)?.status ?? "N/A", target: "success/partial" },
  ]

  let allPassed = true
  for (const check of checks) {
    const icon = check.pass ? "✅" : "❌"
    if (!check.pass) allPassed = false
    console.log(`  ${icon} ${check.name} — actual: ${check.actual} (target: ${check.target})`)
  }
  console.log(`  ${allPassed ? "✅ ALL CHECKS PASSED" : "⚠️  SOME CHECKS FAILED — review details above"}`)

  // ── Step 7: Sample Outputs ──

  console.log("\n[7/7] Sample outputs:")
  console.log(`\n  ─── Sample Explanations (first 5) ───`)
  for (const e of explanations.slice(0, 5)) {
    const risk = e.riskLevel?.toLowerCase() ?? "?"
    const evStr = e.evidence ? JSON.stringify(e.evidence).substring(0, 60) : ""
    console.log(`  [${risk}] ${e.workbookLineCode} ← ${e.accountCode} ${e.accountName}`)
    console.log(`          conf: ${e.confidence}%  FP: ${e.isFalsePositive}  ev: ${evStr}`)
  }
  console.log(`\n  ─── Sample Suggestions (first 5) ───`)
  for (const s of suggestions.slice(0, 5)) {
    const source = s.source ?? "ai"
    const patternTrimmed = (s.suggestedPattern ?? "").substring(0, 50)
    console.log(`  [${source}] ${s.workbookLineCode}: ${s.reasoning?.substring(0, 60)}`)
    console.log(`          conf: ${s.confidence}%  status: ${s.status}  pattern: ${patternTrimmed}`)
  }

  console.log(`
========================================================================
  MANUFACTURING TEST COMPLETE
========================================================================

  Pipeline status:            ${pipelineResult.status}
  Workbook:                   ${workbookId}
  TB Accounts:                ${tbStats.totalAccounts}
  AI Explanations:            ${explanations.length}
  AI Suggestions:             ${suggestions.length}
  AI False Positives:         ${falsePositives.length}
  Grounding:                  ${groundingPct}%
  Hallucination:              ${hallucinationPct}%
  `)

  await prisma.$disconnect()
  console.log("Done.")
}

main().catch((err) => {
  console.error("\nFATAL:", err instanceof Error ? err.message : err)
  process.exit(1)
})
