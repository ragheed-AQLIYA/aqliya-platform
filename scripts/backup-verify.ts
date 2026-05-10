// AQLIYA AuditOS — Backup Verification Helper
// Run: npx tsx scripts/backup-verify.ts
// Checks database connectivity and basic data integrity for backup verification.
// Does not perform actual backup or restore.

import { config } from "dotenv"; import { resolve } from "path"
config({ path: resolve(__dirname, "../.env") })
import { PrismaClient } from "@prisma/client"; import { PrismaPg } from "@prisma/adapter-pg"

const OK = "✅"; const FAIL = "❌"

async function main() {
  console.log("\nAQLIYA AuditOS — Backup Verification")
  console.log("=".repeat(50))
  const p = new PrismaClient({ adapter: new PrismaPg(process.env.DATABASE_URL!) })
  
  try {
    // 1. Database connectivity
    await p.$queryRaw`SELECT 1`
    console.log(`  ${OK} Database connectivity: OK`)

    // 2. Engagement count
    const engCount = await p.auditEngagement.count()
    console.log(`  ${OK} Engagements: ${engCount}`)

    // 3. Core data integrity — verify critical tables have data
    const tables: Record<string, string> = {
      "Audit events": "auditEvent",
      "Evidence": "auditEvidence",
      "Findings": "auditFinding",
      "Recommendations": "auditRecommendation",
      "Users": "auditUser",
      "AI outputs": "auditAiOutput",
    }
    let allOk = true
    for (const [label, table] of Object.entries(tables)) {
      const count = await (p as any)[table].count()
      if (count > 0) console.log(`  ${OK} ${label}: ${count} records`)
      else { console.log(`  ${FAIL} ${label}: 0 records — possible data loss`); allOk = false }
    }

    // 4. Verdict
    console.log("")
    console.log("=".repeat(50))
    if (allOk) {
      console.log(`  ${OK} Backup verification: PASS — all core tables have data`)
      console.log("  Note: This is a data integrity check, not a backup test.")
      console.log("  Run: npm run db:backup for actual backup.")
      process.exit(0)
    } else {
      console.log(`  ${FAIL} Backup verification: FAIL — data integrity issue detected`)
      process.exit(1)
    }
  } catch (e: unknown) {
    console.log(`  ${FAIL} Database connectivity: ${(e as Error).message}`)
    process.exit(1)
  } finally {
    await p.$disconnect()
  }
}

main().catch(console.error)
