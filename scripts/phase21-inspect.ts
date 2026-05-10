// Phase 21 — Inspect open review comments and unmapped account
import { config } from "dotenv"; import { resolve } from "path"
config({ path: resolve(__dirname, "../.env") })
import { PrismaClient } from "@prisma/client"; import { PrismaPg } from "@prisma/adapter-pg"
const p = new PrismaClient({ adapter: new PrismaPg(process.env.DATABASE_URL!) })
const eid = "eng-gulf-2025"

async function main() {
  console.log("\nPHASE 21 — BASELINE INSPECTION")
  console.log("=".repeat(60))

  // Open review comments
  const rcs = await p.auditReviewComment.findMany({ where: { engagementId: eid, status: "open" } })
  console.log(`\nOPEN REVIEW COMMENTS (${rcs.length}):`)
  for (const rc of rcs) {
    console.log(`  ID: ${rc.id}`)
    console.log(`  Reviewer: ${rc.reviewerName}`)
    console.log(`  Target: ${rc.targetType} :: ${rc.targetId}`)
    console.log(`  Comment: ${rc.comment.substring(0, 120)}`)
    console.log(`  Required action: ${rc.requiredAction}`)
    console.log(`  Created: ${rc.createdAt.toISOString().split("T")[0]}`)
    console.log("")
  }

  // Unmapped account
  const pm = await p.auditAccountMapping.findFirst({
    where: { engagementId: eid, status: "pending" },
    include: { canonicalAccount: true },
  })
  if (pm) {
    console.log("PENDING MAPPING:")
    console.log(`  ID: ${pm.id}`)
    console.log(`  Source account: ${pm.sourceAccountCode} — ${pm.sourceAccountName}`)
    console.log(`  Debit: ${pm.debitAmount}, Credit: ${pm.creditAmount}`)
    console.log(`  Canonical: ${pm.canonicalAccount?.code ?? "(none)"} — ${pm.canonicalAccount?.name ?? "(none)"}`)
    console.log(`  Classification: ${pm.statementClassification ?? "(none)"}`)
    console.log(`  Mapping type: ${pm.mappingType}`)
    console.log(`  Confidence: ${pm.confidence}`)
    
    // Check related info
    const tbLine = await p.auditTrialBalanceLine.findFirst({ where: { accountCode: pm.sourceAccountCode } })
    if (tbLine) {
      console.log(`  TB line balance: ${tbLine.balance}, type: ${tbLine.accountType}`)
    }
    
    // Check if there's an AI suggestion
    const aiOut = await p.auditAiOutput.findFirst({
      where: { engagementId: eid, suggestionType: "mapping", inputContext: { contains: pm.sourceAccountCode } },
    })
    if (aiOut) {
      console.log(`  AI suggestion: ${aiOut.outputContent.substring(0, 80)}`)
    }
  }

  // Approval readiness summary
  const openReviewCount = rcs.length
  const missEv = await p.auditEvidence.count({ where: { engagementId: eid, state: "missing" } })
  const unMap = pm ? 1 : 0
  const hiFind = await p.auditFinding.count({
    where: { engagementId: eid, severity: { in: ["high", "critical"] }, status: { notIn: ["resolved", "dismissed"] } },
  })
  const eng = await p.auditEngagement.findUnique({ where: { id: eid } })
  console.log(`\nAPPROVAL READINESS:`)
  console.log(`  Open reviews: ${openReviewCount}`)
  console.log(`  Missing evidence: ${missEv}`)
  console.log(`  Unmapped accounts: ${unMap}`)
  console.log(`  High findings unresolved: ${hiFind}`)
  console.log(`  Engagement status: ${eng?.status}`)
  const ready = openReviewCount === 0 && missEv === 0 && unMap === 0 && hiFind === 0
  console.log(`  READY: ${ready ? "YES" : "NO"}`)

  await p.$disconnect()
}
main().catch(console.error)
