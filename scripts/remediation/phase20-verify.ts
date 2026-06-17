// Phase 20 — Post-remediation verification
import { config } from "dotenv"; import { resolve } from "path"
config({ path: resolve(__dirname, "../../.env") })
import { PrismaClient } from "@prisma/client"; import { PrismaPg } from "@prisma/adapter-pg"
const p = new PrismaClient({ adapter: new PrismaPg(process.env.DATABASE_URL!) })
const eid = "eng-gulf-2025"

async function main() {
  console.log("\nPHASE 20 — POST-REMEDIATION VERIFICATION")
  console.log("=".repeat(60))

  // Findings
  const findings = await p.auditFinding.findMany({ where: { engagementId: eid } })
  console.log("\nFINDINGS:")
  for (const f of findings) {
    console.log(`  ${f.id}: "${f.title}" — severity: ${f.severity}, status: ${f.status}`)
  }

  // High severity unresolved
  const hi = findings.filter(f => (f.severity === "high" || f.severity === "critical") && f.status !== "resolved" && f.status !== "dismissed")
  console.log(`\nHigh/critical unresolved: ${hi.length}`)

  // Evidence links for findings
  const links = await p.auditEvidenceLink.findMany({ where: { targetType: "finding" } })
  console.log(`\nEvidence→Finding links: ${links.length}`)
  for (const l of links) {
    const ev = await p.auditEvidence.findUnique({ where: { id: l.evidenceId } })
    console.log(`  ${l.evidenceId} (${ev?.filename}) → ${l.targetId} [${l.linkType}]`)
  }

  // Recommendations
  const recs = await p.auditRecommendation.findMany({ where: { engagementId: eid } })
  console.log("\nRECOMMENDATIONS:")
  for (const r of recs) {
    console.log(`  ${r.id}: "${r.title}" — status: ${r.status}, finding: ${r.findingId}`)
  }

  // Approval readiness
  const openR = await p.auditReviewComment.count({ where: { engagementId: eid, status: "open" } })
  const missEv = await p.auditEvidence.count({ where: { engagementId: eid, state: "missing" } })
  const unMap = await p.auditAccountMapping.count({ where: { engagementId: eid, status: "pending" } })
  console.log(`\nAPPROVAL READINESS:`)
  console.log(`  Open reviews: ${openR}`)
  console.log(`  Missing evidence: ${missEv}`)
  console.log(`  Unmapped accounts: ${unMap}`)
  console.log(`  High findings unresolved: ${hi.length}`)
  const eng = await p.auditEngagement.findUnique({ where: { id: eid } })
  console.log(`  Engagement status: ${eng?.status}`)

  // Audit events
  const events = await p.auditEvent.count({ where: { engagementId: eid } })
  const eventTypes = await p.auditEvent.findMany({ where: { engagementId: eid }, orderBy: { timestamp: "desc" }, take: 10 })
  console.log(`\nRECENT EVENTS (${events} total):`)
  for (const e of eventTypes) {
    console.log(`  ${e.eventType} — ${e.description.substring(0, 70)} [${e.timestamp.toISOString().split("T")[0]}]`)
  }

  // Review comments
  const rcs = await p.auditReviewComment.findMany({ where: { engagementId: eid } })
  console.log(`\nREVIEW COMMENTS (${rcs.length}):`)
  for (const rc of rcs) {
    console.log(`  ${rc.id}: target=${rc.targetType}:${rc.targetId}, status=${rc.status}, action=${rc.requiredAction}`)
  }

  console.log("\n" + "=".repeat(60))
  await p.$disconnect()
}

main().catch(console.error)
