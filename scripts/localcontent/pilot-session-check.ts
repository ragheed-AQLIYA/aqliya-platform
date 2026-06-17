import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { config } from 'dotenv'
config()

async function main() {
  const p = new PrismaClient({ adapter: new PrismaPg(process.env.DATABASE_URL!) })
  
  const engs = await p.auditEngagement.findMany({ include: { client: true } })
  for (const e of engs) {
    console.log(`Engagement: ${e.id} | ${e.client?.name ?? '?'} | ${e.status} | ${e.fiscalPeriod}`)
  }
  console.log(`Organizations: ${await p.auditOrganization.count()}`)
  console.log(`Users: ${await p.auditUser.count()}`)
  console.log(`Events: ${await p.auditEvent.count()}`)
  console.log(`ValidationRuns: ${await p.auditValidationRun.count()}`)
  console.log(`Mappings: ${await p.auditAccountMapping.count()}`)
  console.log(`Evidence: ${await p.auditEvidence.count()}`)
  console.log(`Findings: ${await p.auditFinding.count()}`)
  console.log(`Statements: ${await p.auditFinancialStatement.count()}`)
  console.log(`Notes: ${await p.auditDisclosureNote.count()}`)
  console.log(`PublicationPkgs: ${await p.auditPublicationPackage.count()}`)
  
  await p.$disconnect()
}

main()
