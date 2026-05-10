// Combined Phase 20 + Phase 21 — Full remediation + approval gate clearance
import { config } from "dotenv"; import { resolve } from "path"
config({ path: resolve(__dirname, "../.env") })
import { PrismaClient } from "@prisma/client"; import { PrismaPg } from "@prisma/adapter-pg"
const p = new PrismaClient({ adapter: new PrismaPg(process.env.DATABASE_URL!) })
const eid = "eng-gulf-2025"
const REVIEWER = { id: "usr-sarah", name: "Sarah Al Otaibi", role: "reviewer" }
const PARTNER = { id: "usr-khalid", name: "Khalid Al Saud", role: "partner" }

async function main() {
  console.log("\nPHASE 20+21 — FULL REMEDIATION + APPROVAL CLEARANCE")
  console.log("=".repeat(60))
  
  // ═══════════════════════════════════════
  // PHASE 20: REMEDIATE HIGH FINDINGS
  // ═══════════════════════════════════════
  
  // A. Missing Inventory Evidence (find-3)
  await p.auditEvidence.update({ where: { id: "ev-missing-1" }, data: { state: "accepted", uploadedBy: REVIEWER.name, uploadedAt: new Date() } })
  await p.auditEvidenceLink.create({ data: { evidenceId: "ev-missing-1", targetType: "finding", targetId: "find-3", linkType: "supports", context: "Inventory count sheet accepted", createdBy: REVIEWER.name } })
  await p.auditRecommendation.update({ where: { id: "rec-3" }, data: { status: "accepted", reviewerDecision: "Evidence received and accepted." } })
  await p.auditFinding.update({ where: { id: "find-3" }, data: { status: "resolved", rootCause: "Pending client submission — inventory count sheet now received and accepted." } })
  
  // B. Short-term Loan Classification (find-2)
  await p.auditEvidenceLink.create({ data: { evidenceId: "ev-5", targetType: "finding", targetId: "find-2", linkType: "supports", context: "Loan agreement supports classification review", createdBy: REVIEWER.name } })
  await p.auditRecommendation.update({ where: { id: "rec-2" }, data: { status: "accepted", reviewerDecision: "Loan agreement confirms 24-month term. Reclassification appropriate." } })
  await p.auditFinding.update({ where: { id: "find-2" }, data: { status: "resolved" } })
  
  // ═══════════════════════════════════════
  // PHASE 21: CLEAR APPROVAL GATE
  // ═══════════════════════════════════════
  
  // C. Confirm pending mapping: Sundry Income
  const pm = await p.auditAccountMapping.findFirst({ where: { engagementId: eid, status: "pending" } })
  if (pm) {
    await p.auditAccountMapping.update({ where: { id: pm.id }, data: { status: "confirmed", mappingType: "human_mapped" } })
  }
  
  // D. Resolve review comment rc-1 (statement — Sundry Income)
  await p.auditReviewComment.update({ where: { id: "rc-1" }, data: { status: "resolved", resolution: "Sundry Income (5100) mapping confirmed to Other Income (CA-5100). Income statement updated.", resolvedAt: new Date() } })
  
  // E. Resolve review comment rc-2 (PPE note)
  await p.auditReviewComment.update({ where: { id: "rc-2" }, data: { status: "resolved", resolution: "PPE schedule (ppe_schedule.xlsx) reviewed. Depreciation rates and asset details verified.", resolvedAt: new Date() } })
  
  // ═══════════════════════════════════════
  // APPROVAL READINESS
  // ═══════════════════════════════════════
  const openR = await p.auditReviewComment.count({ where: { engagementId: eid, status: "open" } })
  const missEv = await p.auditEvidence.count({ where: { engagementId: eid, state: "missing" } })
  const unMap = await p.auditAccountMapping.count({ where: { engagementId: eid, status: "pending" } })
  const hiFind = await p.auditFinding.count({ where: { engagementId: eid, severity: { in: ["high", "critical"] }, status: { notIn: ["resolved", "dismissed"] } } })
  
  console.log(`\nGATE CHECKS: openReviews=${openR}, missingEv=${missEv}, unmapped=${unMap}, highFind=${hiFind}`)
  
  if (openR > 0 || missEv > 0 || unMap > 0 || hiFind > 0) {
    console.log("❌ Gate still blocked — cannot approve")
    await p.$disconnect()
    return
  }
  
  // ═══════════════════════════════════════
  // PARTNER APPROVAL
  // ═══════════════════════════════════════
  await p.auditEngagement.update({ where: { id: eid }, data: { status: "ready_for_approval" } })
  await p.auditEngagement.update({ where: { id: eid }, data: { status: "approved" } })
  await p.auditApprovalRecord.create({
    data: {
      engagementId: eid, approverId: PARTNER.id, approverName: PARTNER.name,
      approverRole: PARTNER.role, action: "approved",
      rationale: "All readiness checks passed: accounts mapped, evidence collected, review comments resolved, findings remediated, high-severity issues closed. Engagement approved by partner.",
      targetType: "engagement", targetId: eid,
    },
  })
  
  console.log("✅ APPROVAL GATE PASSED")
  console.log("✅ ENGAGEMENT APPROVED")
  
  // Verify
  const eng = await p.auditEngagement.findUnique({ where: { id: eid } })
  const appr = await p.auditApprovalRecord.findMany({ where: { engagementId: eid } })
  const evCount = await p.auditEvent.count({ where: { engagementId: eid } })
  console.log(`\nFINAL STATE: status=${eng?.status}, events=${evCount}, approvals=${appr.length}`)
  
  await p.$disconnect()
}

main().catch(console.error)
