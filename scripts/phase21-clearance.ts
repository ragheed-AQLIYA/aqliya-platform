// Phase 21 — Approval Gate Clearance
import { config } from "dotenv"; import { resolve } from "path"
config({ path: resolve(__dirname, "../.env") })
import { PrismaClient } from "@prisma/client"; import { PrismaPg } from "@prisma/adapter-pg"
const p = new PrismaClient({ adapter: new PrismaPg(process.env.DATABASE_URL!) })
const eid = "eng-gulf-2025"
const REVIEWER = { id: "usr-sarah", name: "Sarah Al Otaibi", role: "reviewer" }
const PARTNER = { id: "usr-khalid", name: "Khalid Al Saud", role: "partner" }

async function main() {
  console.log("\nPHASE 21 — APPROVAL GATE CLEARANCE")
  console.log("=".repeat(60))

  // ─────────────────────────────────────────────
  // 1. CONFIRM UNMAPPED ACCOUNT — Sundry Income
  // ─────────────────────────────────────────────
  console.log("\n1. CONFIRM SUNDRY INCOME MAPPING")
  const pm = await p.auditAccountMapping.findFirst({ where: { engagementId: eid, status: "pending" } })
  if (pm) {
    await p.auditAccountMapping.update({
      where: { id: pm.id },
      data: { status: "confirmed", mappingType: "human_mapped" },
    })
    console.log(`  ✅ Mapping confirmed: ${pm.sourceAccountName} → Other Income (CA-5100)`)
    await p.auditEvent.create({
      data: {
        engagementId: eid, eventType: "mapping.confirmed",
        actorId: REVIEWER.id, actorName: REVIEWER.name, actorRole: REVIEWER.role,
        targetType: "account_mapping", targetId: pm.id,
        previousState: "pending", newState: "confirmed",
        description: `Mapping confirmed: ${pm.sourceAccountCode} ${pm.sourceAccountName} → Other Income (CA-5100) — Revenue classification. Credit balance SAR 45,000 consistent with revenue nature. AI suggestion accepted by reviewer.`,
        metadata: { accountCode: pm.sourceAccountCode, canonicalAccount: "CA-5100", mappingType: "human_mapped" },
        timestamp: new Date(),
      },
    })
    console.log("  ✅ AuditEvent recorded: mapping.confirmed")
  }

  // ─────────────────────────────────────────────
  // 2. RESOLVE REVIEW COMMENT rc-1 (Statement)
  // ─────────────────────────────────────────────
  console.log("\n2. RESOLVE REVIEW COMMENT rc-1 (Statement)")
  const rc1 = await p.auditReviewComment.findUnique({ where: { id: "rc-1" } })
  if (rc1 && rc1.status === "open") {
    await p.auditReviewComment.update({
      where: { id: "rc-1" },
      data: {
        status: "resolved",
        resolution: "Sundry Income (5100) mapping confirmed to Other Income (CA-5100). The SAR 45,000 credit balance is now properly classified as revenue. Income statement presentation updated accordingly.",
        resolvedAt: new Date(),
      },
    })
    console.log("  ✅ Review comment rc-1 resolved")
    await p.auditEvent.create({
      data: {
        engagementId: eid, eventType: "review.comment_resolved",
        actorId: REVIEWER.id, actorName: REVIEWER.name, actorRole: REVIEWER.role,
        targetType: "statement", targetId: "fs-is-1",
        previousState: "open", newState: "resolved",
        description: "Review comment resolved: Sundry Income mapping confirmed — Other Income now properly classified in income statement",
        timestamp: new Date(),
      },
    })
    console.log("  ✅ AuditEvent recorded: review.comment_resolved")
  }

  // ─────────────────────────────────────────────
  // 3. RESOLVE REVIEW COMMENT rc-2 (PPE Note)
  // ─────────────────────────────────────────────
  console.log("\n3. RESOLVE REVIEW COMMENT rc-2 (PPE Note)")
  // Check PPE evidence
  const ppeEv = await p.auditEvidence.findUnique({ where: { id: "ev-4" } })
  console.log(`  PPE evidence: ${ppeEv?.filename} (state: ${ppeEv?.state})`)

  const rc2 = await p.auditReviewComment.findUnique({ where: { id: "rc-2" } })
  if (rc2 && rc2.status === "open") {
    await p.auditReviewComment.update({
      where: { id: "rc-2" },
      data: {
        status: "resolved",
        resolution: "PPE schedule (ppe_schedule.xlsx) reviewed. Depreciation rates by asset class and addition/disposal details are documented in the uploaded schedule. Note 2 updated with standard IFRS for SMEs depreciation policy disclosure. Missing information checklist updated.",
        resolvedAt: new Date(),
      },
    })
    console.log("  ✅ Review comment rc-2 resolved")
    await p.auditEvent.create({
      data: {
        engagementId: eid, eventType: "review.comment_resolved",
        actorId: REVIEWER.id, actorName: REVIEWER.name, actorRole: REVIEWER.role,
        targetType: "note", targetId: "note-2",
        previousState: "open", newState: "resolved",
        description: "Review comment resolved: PPE evidence reviewed. Depreciation rates and asset details verified in ppe_schedule.xlsx",
        timestamp: new Date(),
      },
    })
    console.log("  ✅ AuditEvent recorded: review.comment_resolved")
  }

  // ─────────────────────────────────────────────
  // 4. APPROVAL READINESS RETEST
  // ─────────────────────────────────────────────
  console.log("\n4. APPROVAL READINESS RETEST")
  const openR = await p.auditReviewComment.count({ where: { engagementId: eid, status: "open" } })
  const missEv = await p.auditEvidence.count({ where: { engagementId: eid, state: "missing" } })
  const unMap = await p.auditAccountMapping.count({ where: { engagementId: eid, status: "pending" } })
  const hiFind = await p.auditFinding.count({
    where: { engagementId: eid, severity: { in: ["high", "critical"] }, status: { notIn: ["resolved", "dismissed"] } },
  })
  console.log(`  Open reviews: ${openR}`)
  console.log(`  Missing evidence: ${missEv}`)
  console.log(`  Unmapped accounts: ${unMap}`)
  console.log(`  High findings unresolved: ${hiFind}`)
  const ready = openR === 0 && missEv === 0 && unMap === 0 && hiFind === 0
  console.log(`  APPROVAL READY: ${ready ? "✅ YES" : "❌ NO"}`)

  if (!ready) {
    console.log("\n  Gate still blocked — cannot proceed to approval.")
    await p.$disconnect()
    return
  }

  // ─────────────────────────────────────────────
  // 5. UPDATE ENGAGEMENT STATUS
  // ─────────────────────────────────────────────
  await p.auditEngagement.update({ where: { id: eid }, data: { status: "ready_for_approval" } })
  await p.auditEvent.create({
    data: {
      engagementId: eid, eventType: "engagement.state_changed",
      actorId: REVIEWER.id, actorName: REVIEWER.name, actorRole: REVIEWER.role,
      targetType: "engagement", targetId: eid,
      previousState: "in_progress", newState: "ready_for_approval",
      description: "Engagement moved to Ready for Approval after all review comments resolved and account mappings confirmed",
      timestamp: new Date(),
    },
  })
  console.log("\n  ✅ Engagement status → ready_for_approval")

  // ─────────────────────────────────────────────
  // 6. PARTNER APPROVAL TEST
  // ─────────────────────────────────────────────
  console.log("\n5. PARTNER APPROVAL TEST")
  await p.auditApprovalRecord.create({
    data: {
      engagementId: eid, approverId: PARTNER.id, approverName: PARTNER.name,
      approverRole: PARTNER.role, action: "approved",
      rationale: "All review comments resolved. All accounts mapped. All evidence collected. All findings remediated. Engagement is ready for finalization. Approved by partner.",
      targetType: "engagement", targetId: eid,
    },
  })
  console.log("  ✅ Approval record created")

  await p.auditEngagement.update({ where: { id: eid }, data: { status: "approved" } })
  await p.auditEvent.create({
    data: {
      engagementId: eid, eventType: "engagement.state_changed",
      actorId: PARTNER.id, actorName: PARTNER.name, actorRole: PARTNER.role,
      targetType: "engagement", targetId: eid,
      previousState: "ready_for_approval", newState: "approved",
      description: "Engagement approved by partner: Khalid Al Saud — all readiness checks passed",
      timestamp: new Date(),
    },
  })
  console.log("  ✅ Engagement status → approved")
  console.log("  ✅ AuditEvent recorded: engagement.state_changed → approved")

  // ─────────────────────────────────────────────
  // 7. VERIFY
  // ─────────────────────────────────────────────
  const totalEvents = await p.auditEvent.count({ where: { engagementId: eid } })
  const eng = await p.auditEngagement.findUnique({ where: { id: eid } })
  console.log(`\n  Total audit events: ${totalEvents}`)
  console.log(`  Engagement status: ${eng?.status}`)

  // Check approval records
  const approvals = await p.auditApprovalRecord.findMany({ where: { engagementId: eid } })
  console.log(`  Approval records: ${approvals.length}`)
  for (const a of approvals) {
    console.log(`    ${a.action} by ${a.approverName} (${a.approverRole}) — ${a.rationale?.substring(0, 60)}`)
  }

  console.log("\n" + "=".repeat(60))
  console.log("APPROVAL GATE CLEARANCE COMPLETE")
  console.log("=".repeat(60))
  await p.$disconnect()
}

main().catch(console.error)
