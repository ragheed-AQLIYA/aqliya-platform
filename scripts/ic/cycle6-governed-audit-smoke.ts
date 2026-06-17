#!/usr/bin/env tsx
/**
 * Cycle 6 CP-5 — Governed AuditOS AI smoke (DB + audit-ai-bridge).
 * Requires DATABASE_URL and seeded AuditOS engagement.
 * Usage: tsx -r ./scripts/mock-server-only.cjs scripts/cycle6-governed-audit-smoke.ts
 */
import { config } from "dotenv"
import { resolve } from "path"
import { writeFileSync } from "fs"

config({ path: resolve(__dirname, "../../.env") })

import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

async function main() {
  const url = process.env.DATABASE_URL
  if (!url) {
    console.error("DATABASE_URL required")
    process.exit(1)
  }

  process.env.FF_AI_RAG = process.env.FF_AI_RAG ?? "true"
  process.env.FF_AI_REAL_PROVIDERS = process.env.FF_AI_REAL_PROVIDERS ?? "false"

  const adapter = new PrismaPg(url)
  const prisma = new PrismaClient({ adapter })

  const engagement = await prisma.auditEngagement.findFirst({
    where: { id: "eng-gulf-2025" },
    select: {
      id: true,
      organizationId: true,
      fiscalPeriod: true,
      client: { select: { name: true } },
    },
  })
  if (!engagement) {
    console.error("No audit engagement — run: npm run seed:audit")
    process.exit(1)
  }

  const auditOrg = await prisma.auditOrganization.findUnique({
    where: { id: engagement.organizationId },
    select: { platformOrganizationId: true },
  })
  if (!auditOrg?.platformOrganizationId) {
    console.error("Engagement org missing platformOrganizationId")
    process.exit(1)
  }

  const user = await prisma.user.findFirst({
    where: { email: "admin@aqliya.com" },
    select: { id: true },
  })

  const orgId = auditOrg.platformOrganizationId
  await prisma.documentChunk.upsert({
    where: { id: "cycle6-smoke-chunk-001" },
    create: {
      id: "cycle6-smoke-chunk-001",
      organizationId: orgId,
      documentId: "cycle6-smoke-doc",
      chunkIndex: 0,
      content: "Cycle 6 governed RAG smoke — AuditOS engagement context",
      tokenCount: 12,
      metadata: { smoke: "cycle6", productKey: "auditos" },
      createdBy: user?.id,
    },
    update: { content: "Cycle 6 governed RAG smoke — AuditOS engagement context" },
  })

  await import("../../src/lib/ai/handlers/register-handlers")
  const { runGovernedAuditAI } = await import("../../src/lib/audit/audit-ai-bridge")

  const started = new Date().toISOString()
  const result = await runGovernedAuditAI({
    engagementId: engagement.id,
    taskType: "audit_findings",
    userId: user?.id,
    userRole: "ADMIN",
    taskInput: { smoke: "cycle6-governed-audit" },
  })

  const log = await prisma.platformAuditLog.findFirst({
    where: {
      action: "auditos_ai_generation",
      platformOrganizationId: auditOrg.platformOrganizationId,
    },
    orderBy: { createdAt: "desc" },
    select: { id: true, createdAt: true, metadata: true },
  })

  const chunkCount = await prisma.documentChunk.count({
    where: { organizationId: auditOrg.platformOrganizationId },
  })

  const report = {
    cycle: 6,
    smoke_execution_timestamp: started,
    commit_sha: process.env.CYCLE6_COMMIT_SHA ?? "local",
    staging_base_url: process.env.STAGING_BASE_URL ?? "local-cli",
    database_url_host: new URL(url).host,
    provider_used: result.providerId,
    tenant_id: auditOrg.platformOrganizationId,
    audit_organization_id: engagement.organizationId,
    engagement_id: engagement.id,
    platform_audit_log_id: log?.id ?? null,
    audit_ai_bridge_record_ref: "audit-ai-bridge.ts/runGovernedAuditAI",
    embedding_count: chunkCount,
    output_count: result.outputs.length,
    review_required: result.reviewRequired,
    flags_snapshot: {
      FF_AI_RAG: process.env.FF_AI_RAG === "true",
      FF_AI_REAL_PROVIDERS: process.env.FF_AI_REAL_PROVIDERS === "true",
    },
    pass: Boolean(log?.id && result.reviewRequired === true),
  }

  const outPath = resolve(
    __dirname,
    "../../docs/validation/cycle-6/evidence/cycle6-governed-audit-smoke.json",
  )
  writeFileSync(outPath, JSON.stringify(report, null, 2))
  console.log(JSON.stringify(report, null, 2))
  await prisma.$disconnect()
  process.exit(report.pass ? 0 : 1)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
