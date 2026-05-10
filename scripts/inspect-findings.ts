// Inspect high-severity findings for Phase 20 remediation
import { config } from "dotenv"; import { resolve } from "path"
config({ path: resolve(__dirname, "../.env") })
import { PrismaClient } from "@prisma/client"; import { PrismaPg } from "@prisma/adapter-pg"
const p = new PrismaClient({ adapter: new PrismaPg(process.env.DATABASE_URL!) })
const eid = "eng-gulf-2025"

async function main() {
  console.log("\nPHASE 20 — FINDINGS INSPECTION")
  console.log("=".repeat(60))

  const findings = await p.auditFinding.findMany({
    where: { engagementId: eid, severity: { in: ["high", "critical"] }, status: { notIn: ["resolved", "dismissed"] } }
  })

  for (const f of findings) {
    console.log(`\n--- FINDING: ${f.id} ---`)
    console.log(`Title:       ${f.title}`)
    console.log(`Severity:    ${f.severity}`)
    console.log(`Status:      ${f.status}`)
    console.log(`Root cause:  ${f.rootCause ?? "(none)"}`)
    console.log(`Impact:      ${f.impact ?? "(none)"}`)
    console.log(`Materiality: ${f.materiality}`)
    console.log(`AI suggested: ${f.aiSuggested}`)
    console.log(`Assigned to: ${f.assignedTo ?? "(none)"}`)

    // Linked evidence
    const evLinks = await p.auditEvidenceLink.findMany({ where: { targetType: "finding", targetId: f.id } })
    console.log(`\nLinked evidence (${evLinks.length}):`)
    for (const l of evLinks) {
      const ev = await p.auditEvidence.findUnique({ where: { id: l.evidenceId } })
      console.log(`  ${ev?.id} — ${ev?.filename} (state: ${ev?.state}, linkType: ${l.linkType})`)
    }

    // Linked evidence via relatedEvidenceIds
    const relatedEvIds = Array.isArray(f.relatedEvidenceIds) ? f.relatedEvidenceIds as string[] : []
    if (relatedEvIds.length > 0) {
      console.log(`Related evidence IDs on finding (${relatedEvIds.length}): ${relatedEvIds.join(", ")}`)
    }

    // Linked recommendations
    const recs = await p.auditRecommendation.findMany({ where: { engagementId: eid, findingId: f.id } })
    console.log(`\nRecommendations (${recs.length}):`)
    for (const r of recs) {
      console.log(`  ${r.id} — "${r.title}" status: ${r.status}, risk: ${r.riskLevel}, aiContributed: ${r.aiContributed}`)
    }

    // Review comments
    const rcs = await p.auditReviewComment.findMany({ where: { engagementId: eid, targetType: "finding", targetId: f.id } })
    console.log(`\nReview comments (${rcs.length}):`)
    for (const rc of rcs) {
      console.log(`  ${rc.id} — "${rc.comment.substring(0, 60)}" status: ${rc.status}, action: ${rc.requiredAction}`)
    }

    // Events
    const events = await p.auditEvent.findMany({ where: { engagementId: eid, targetType: "finding", targetId: f.id } })
    console.log(`\nAudit events (${events.length}):`)
    for (const e of events) {
      console.log(`  ${e.eventType} — ${e.description.substring(0, 60)} (${e.timestamp.toISOString().split("T")[0]})`)
    }
  }

  // Check available evidence that could be linked
  console.log("\n\n--- AVAILABLE EVIDENCE FOR LINKING ---")
  const allEv = await p.auditEvidence.findMany({ where: { engagementId: eid }, include: { links: true } })
  for (const ev of allEv) {
    const isLinkedToFinding = ev.links.some(l => l.targetType === "finding")
    console.log(`  ${ev.id} — ${ev.filename} (state: ${ev.state}, linked to finding: ${isLinkedToFinding})`)
  }

  console.log("\n" + "=".repeat(60))
  await p.$disconnect()
}

main().catch(console.error)
