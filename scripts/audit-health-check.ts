import { config } from "dotenv"
import { resolve } from "path"

config({ path: resolve(__dirname, "../.env") })

import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const OK = "✅"
const FAIL = "❌"

async function main() {
  console.log("\nAQLIYA AuditOS — Health Check")
  console.log("=".repeat(40))

  const checks: Array<{ name: string; ok: boolean; detail: string }> = []
  const now = new Date().toISOString()
  checks.push({ name: "Current time", ok: true, detail: now })

  let prisma: PrismaClient | null = null
  try {
    const adapter = new PrismaPg(process.env.DATABASE_URL!)
    prisma = new PrismaClient({ adapter })
    // Quick connectivity test
    await prisma.$queryRaw`SELECT 1`
    checks.push({ name: "Database connectivity", ok: true, detail: "Connected" })

    const engCount = await prisma.auditEngagement.count()
    checks.push({ name: "Engagements", ok: engCount > 0, detail: `${engCount} total` })

    const eventCount = await prisma.auditEvent.count()
    checks.push({ name: "Audit events", ok: true, detail: `${eventCount} total` })

    const aiCount = await prisma.auditAiOutput.count()
    checks.push({ name: "AI outputs", ok: true, detail: `${aiCount} total` })

    const userCount = await prisma.auditUser.count()
    checks.push({ name: "Audit users", ok: userCount > 0, detail: `${userCount} users` })

    const prodBlockers = await prisma.productionBlocker.count({ where: { status: "open" } })
    checks.push({ name: "Open blockers", ok: prodBlockers === 0, detail: `${prodBlockers} open` })
  } catch (e: unknown) {
    checks.push({ name: "Database connectivity", ok: false, detail: `Error: ${(e as Error).message}` })
  } finally {
    if (prisma) await prisma.$disconnect()
  }

  const passed = checks.filter(c => c.ok).length
  const failed = checks.filter(c => !c.ok).length

  for (const c of checks) {
    const icon = c.ok ? OK : FAIL
    console.log(`  ${icon} ${c.name}: ${c.detail}`)
  }

  console.log("=".repeat(40))
  console.log(`  ${passed} passed, ${failed} failed, ${checks.length} total`)
  console.log()

  process.exit(failed > 0 ? 1 : 0)
}

main().catch(e => {
  console.error(`\n${FAIL} Health check error:`, e.message)
  process.exit(1)
})
