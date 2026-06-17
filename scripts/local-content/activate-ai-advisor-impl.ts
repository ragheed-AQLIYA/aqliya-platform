// ─── LocalContentOS — TB Activation + AI Advisor Real Client Rehearsal ───
// Reads real client TB XLSX, populates workbook, runs AI advisor, measures quality.
// 
// Usage: node --env-file .env --import tsx/esm scripts/local-content/activate-ai-advisor-impl.ts
//
// P0: No schema changes, no new models, no new routes.
// P0: Source file is authority. No synthetic data.

import { resolve } from "path"
import { prisma } from "../../src/lib/prisma"
import { parseTbXlsxWithStats } from "../../src/lib/local-content/workbook/tb-loader"
import { populateWorkbookFromTb } from "../../src/lib/local-content/workbook/population"
import { runLocalContentPipeline } from "../../src/lib/local-content/pipeline-orchestrator"

const TB_FILE_PATH = resolve(__dirname, "../../TB 31-12-2025 Final.xlsx")
const PROJECT_ID = "lc-project-demo-001"

async function main() {
  console.log("=".repeat(72))
  console.log("  LOCALCONTENTOS — TB ACTIVATION + AI ADVISOR")
  console.log("  REAL CLIENT REHEARSAL")
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
    `Real TB - ${project.name} (${project.reportingPeriod})`
  )
  const workbookId = populationResult.workbookId
  console.log(`  ✓ Workbook: ${workbookId}`)
  console.log(`  ✓ Auto-filled: ${populationResult.autoFilledLines}/${populationResult.totalLines} lines`)
  console.log(`  ✓ Completion: ${populationResult.completionPct}%`)

  // ── Step 4: Run Pipeline with TB ──

  console.log(`\n[4/7] Running pipeline with real TB data...`)
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

  const matchReviews = await prisma.lcMatchReview.findMany({
    where: { organizationId },
    orderBy: { createdAt: "desc" }
  })

  const patternSuggestions = await prisma.lcPatternSuggestion.findMany({
    where: { organizationId },
    orderBy: { createdAt: "desc" }
  })

  // MatchReview stats
  const highRisk = matchReviews.filter(r => r.riskLevel === "high").length
  const mediumRisk = matchReviews.filter(r => r.riskLevel === "medium").length
  const lowRisk = matchReviews.filter(r => r.riskLevel === "low").length
  const pending = matchReviews.filter(r => r.status === "pending").length
  const confirmed = matchReviews.filter(r => r.status === "confirmed").length
  const dismissed = matchReviews.filter(r => r.status === "dismissed").length
  const falsePositives = matchReviews.filter(r => r.isFalsePositive === true).length
  const uniqueLinesCovered = new Set(matchReviews.map(r => r.workbookLineCode)).size

  // Grounding: how many have valid evidence
  const withEvidence = matchReviews.filter(r =>
    r.evidence && r.evidence !== "{}" && r.evidence !== "null" && r.evidence !== null
  ).length
  const groundingCoverage = matchReviews.length > 0
    ? Math.round((withEvidence / matchReviews.length) * 100) : 0

  // Hallucination: confident false positives
  const confidentFalsePositives = matchReviews.filter(r =>
    r.confidence >= 70 && r.isFalsePositive === true
  ).length
  const hallucinationRate = matchReviews.length > 0
    ? Math.round((confidentFalsePositives / matchReviews.length) * 100) : 0

  // Suggestion stats
  const acceptedSuggestions = patternSuggestions.filter(r => r.status === "accepted").length
  const rejectedSuggestions = patternSuggestions.filter(r => r.status === "rejected").length
  const pendingSuggestions = patternSuggestions.filter(r => r.status === "pending").length

  // Learning & health
  const healthRecords = await prisma.lcPatternHealthRecord.findMany({
    where: { organizationId }
  })
  const orgMemory = await prisma.lcOrganizationMatchMemory.findMany({
    where: { organizationId }
  })

  console.log()
  console.log("  ─── AI Output Summary ───")
  console.log()
  console.log(`  AI Review Runs:           ${aiReviewRuns.length}`)
  console.log(`  Latest Review ID:         ${latestReview?.id ?? "none"}`)
  console.log(`  Latest Review Status:     ${latestReview?.status ?? "N/A"}`)
  console.log()
  console.log(`  Account Explanations:     ${matchReviews.length}`)
  console.log(`    Lines covered:          ${uniqueLinesCovered}`)
  console.log(`    High risk:              ${highRisk}`)
  console.log(`    Medium risk:            ${mediumRisk}`)
  console.log(`    Low risk:               ${lowRisk}`)
  console.log(`    Pending review:         ${pending}`)
  console.log(`    Confirmed:              ${confirmed}`)
  console.log(`    Dismissed:              ${dismissed}`)
  console.log(`    False positives:        ${falsePositives}`)
  console.log()
  console.log(`  Pattern Suggestions:      ${patternSuggestions.length}`)
  console.log(`    Accepted:               ${acceptedSuggestions}`)
  console.log(`    Rejected:               ${rejectedSuggestions}`)
  console.log(`    Pending:                ${pendingSuggestions}`)
  console.log()
  console.log(`  Pattern Health Records:   ${healthRecords.length}`)
  console.log(`  Org Memory Records:       ${orgMemory.length}`)
  console.log()
  console.log(`  Grounding Coverage:       ${groundingCoverage}%`)
  console.log(`  Hallucination Rate:       ${hallucinationRate}%`)
  console.log()

  // ── Step 6: Validation ──

  console.log(`[6/7] Validation against targets:`)
  console.log()

  const stage7 = pipelineResult.stages.find(s => s.stage === 7)
  const stage8 = pipelineResult.stages.find(s => s.stage === 8)

  const checks = [
    { name: "AI explanations ≥ 10", pass: matchReviews.length >= 10, actual: matchReviews.length, target: 10 },
    { name: "Pattern suggestions ≥ 5", pass: patternSuggestions.length >= 5, actual: patternSuggestions.length, target: 5 },
    { name: "False positive reviews ≥ 5", pass: falsePositives >= 5, actual: falsePositives, target: 5 },
    { name: "Grounding coverage ≥ 80%", pass: groundingCoverage >= 80, actual: `${groundingCoverage}%`, target: "80%" },
    { name: "Hallucination rate < 10%", pass: hallucinationRate < 10, actual: `${hallucinationRate}%`, target: "<10%" },
    { name: "Stage 7 (AI Advisor) not skipped", pass: stage7?.status !== "skipped", actual: stage7?.status ?? "?", target: "success/partial" },
    { name: "Stage 8 (AI Review) not skipped", pass: stage8?.status !== "skipped", actual: stage8?.status ?? "?", target: "success/partial" }
  ]

  let allPassed = true
  for (const check of checks) {
    const icon = check.pass ? "✅" : "❌"
    if (!check.pass) allPassed = false
    console.log(`  ${icon} ${check.name} — actual: ${check.actual} (target: ${check.target})`)
  }
  console.log()
  if (allPassed) {
    console.log("  ✅ ALL VALIDATION CHECKS PASSED")
  } else {
    console.log("  ⚠️  SOME CHECKS FAILED — review details above")
  }

  // ── Sample data ──

  if (matchReviews.length > 0) {
    console.log(`\n  ─── Sample Explanations (first ${Math.min(10, matchReviews.length)}) ───`)
    for (const r of matchReviews.slice(0, 10)) {
      const evidenceObj = typeof r.evidence === "string" ? JSON.parse(r.evidence) : r.evidence
      const ev = evidenceObj
        ? JSON.stringify(evidenceObj).substring(0, 80).replace(/\n/g, " ")
        : "{}"
      console.log(`  [${r.riskLevel}] ${r.workbookLineCode} ← ${r.accountCode} ${r.accountName}`)
      console.log(`          conf: ${r.confidence}%  FP: ${r.isFalsePositive}  ev: ${ev}`)
    }
  }

  if (patternSuggestions.length > 0) {
    console.log(`\n  ─── Sample Suggestions (first ${Math.min(5, patternSuggestions.length)}) ───`)
    for (const s of patternSuggestions.slice(0, 5)) {
      const reason = s.reasoning ? s.reasoning.substring(0, 120) : "(none)"
      console.log(`  [${s.source}] ${s.workbookLineCode}: ${reason}`)
      console.log(`          conf: ${s.confidence}%  status: ${s.status}`)
    }
  }

  // ── Report ──

  console.log()
  console.log("=".repeat(72))
  console.log("  ACTIVATION COMPLETE")
  console.log("=".repeat(72))
  console.log()
  console.log(`  Pipeline status:            ${pipelineResult.status}`)
  console.log(`  Workbook:                   ${workbookId}`)
  console.log(`  TB Accounts:                ${tbStats.totalAccounts}`)
  console.log(`  AI Explanations:            ${matchReviews.length}`)
  console.log(`  AI Suggestions:             ${patternSuggestions.length}`)
  console.log(`  AI False Positives:         ${falsePositives}`)
  console.log(`  Grounding:                  ${groundingCoverage}%`)
  console.log(`  Hallucination:              ${hallucinationRate}%`)
  console.log()
  console.log("  Database records created:")
  console.log(`    LcMatchReview:             ${matchReviews.length}`)
  console.log(`    LcPatternSuggestion:       ${patternSuggestions.length}`)
  console.log(`    LcPatternHealthRecord:     ${healthRecords.length}`)
  console.log(`    LcOrganizationMatchMemory: ${orgMemory.length}`)
  console.log(`    LcAiReviewRun:             ${aiReviewRuns.length}`)
  console.log()

  await prisma.$disconnect()
  console.log("  ✓ Database disconnected")
  console.log()

  return { allPassed, matchReviews, patternSuggestions, pipelineResult, tbStats }
}

main()
  .then(summary => {
    console.log("Done.")
    process.exit(summary?.allPassed ? 0 : 1)
  })
  .catch(err => {
    console.error("\nFATAL:", err instanceof Error ? err.message : err)
    if (err instanceof Error && err.stack) {
      console.error(err.stack.split("\n").slice(0, 4).join("\n"))
    }
    process.exit(1)
  })
