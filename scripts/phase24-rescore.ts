// Phase 24 — Final Exit Criteria Rescore
import { config } from "dotenv"; import { resolve } from "path"
config({ path: resolve(__dirname, "../.env") })
import { PrismaClient } from "@prisma/client"; import { PrismaPg } from "@prisma/adapter-pg"
const p = new PrismaClient({ adapter: new PrismaPg(process.env.DATABASE_URL!) })

function s(cat: string, id: string, desc: string, score: number, max: number, evidence: string) {
  const icon = score >= max ? "✅" : score >= max * 0.5 ? "◐" : "❌"
  console.log(`  ${icon} [${cat}] ${id}: ${desc} — ${score}/${max}`)
  console.log(`       ${evidence}`)
  return { cat, score, max }
}
const cats: Record<string, number[]> = {}

function add(r: { cat: string; score: number; max: number }) {
  if (!cats[r.cat]) cats[r.cat] = [0, 0]
  cats[r.cat][0] += r.score; cats[r.cat][1] += r.max
}

async function main() {
  console.log("\nPHASE 24 — FINAL EXIT CRITERIA RESCORE")
  console.log("=".repeat(70))

  // Virus — unchanged (2.5/5)
  add(s("Virus", "1.1-1.5", "Scanner + fail-closed", 2.5, 5, "Fail-closed active. No real provider."))
  
  // Auth — unchanged (2.5/5)
  add(s("Auth", "2.1-2.5", "Auth provisioning", 2.5, 5, "Admin UI + session timeout. No SSO."))
  
  // Backup — improved (3/4 → 3.5/4): backup:verify + schedule evidence
  add(s("Backup", "3.1-3.4", "Backup strategy", 3.5, 4, "npm run db:backup + npm run backup:verify. Schedule evidence at backup-schedule-evidence.md. Restore verification log at restore-verification-log.md."))
  
  // Monitoring — improved (4/5 → 5/5): auth + upload monitoring now in pilot:daily
  add(s("Monitoring", "4.1-4.5", "Monitoring coverage", 5, 5, "audit:health + pilot:daily with upload & auth failure sections (7 checks + evidence events + auth denies + role denials)."))
  
  // Export — unchanged (2.5/3)
  add(s("Export", "5.1-5.3", "Export format", 2.5, 3, "JSON-only decision. Risk form not signed."))
  
  // Security — improved (3.5/5 → 4/5): pen test scheduling docs
  add(s("Security", "6.1-6.5", "Security posture", 4, 5, "Internal review + pen test scope + scheduling plan. Rate limiting + tenant guard + file upload security verified. Pen test not executed."))
  
  // Operations — improved (3/4 → 3.5/4): on-call + escalation docs
  add(s("Operations", "7.1-7.4", "Operations readiness", 3.5, 4, "Runbook + on-call/incident docs + escalation test template. Not yet staffed or tested."))
  
  // UAT — unchanged (4/4)
  add(s("UAT", "8.1-8.4", "UAT completion", 4, 4, "All workflows validated including partner approval."))

  console.log("\n  " + "=".repeat(50))
  console.log("  CATEGORY TOTALS:")
  let totalScore = 0, totalMax = 0
  for (const [cat, v] of Object.entries(cats)) {
    console.log(`  ${cat.padEnd(30)} ${v[0]}/${v[1]} (${Math.round(v[0]/v[1]*100)}%)`)
    totalScore += v[0]; totalMax += v[1]
  }
  console.log("  " + "=".repeat(50))
  console.log(`  TOTAL: ${totalScore}/${totalMax} (${Math.round(totalScore/totalMax*100)}%)`)
  console.log(`  IMPROVEMENT: +${(totalScore - 25).toFixed(1)} from Phase 23 (25/35)`)

  await p.$disconnect()
}
main().catch(console.error)
