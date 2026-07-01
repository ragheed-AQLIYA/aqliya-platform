#!/usr/bin/env node
/**
 * AQLIYA — Core Evidence Backfill (Phase 5B.1)
 *
 * Idempotent backfill of AuditOS + LocalContentOS evidence into CoreEvidence platform.
 *
 * Usage:
 *   node scripts/platform/backfill-core-evidence.mjs           # dry run (default)
 *   node scripts/platform/backfill-core-evidence.mjs --apply   # execute writes
 *
 * Requires DATABASE_URL (source .env first).
 */

import { config } from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { writeFileSync, mkdirSync, existsSync } from "fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, "../../.env") });

import { prisma } from "../db-utils/prisma.mjs";

const isApply = process.argv.includes("--apply");
const REPORT_DIR = resolve(__dirname, "../../backups/evidence-reports");

const AUDIT_STATE_MAP = {
  missing: "created",
  requested: "created",
  uploaded: "created",
  linked: "created",
  reviewed: "reviewed",
  accepted: "approved",
  rejected: "rejected",
};

const LC_STATUS_MAP = {
  missing: "created",
  uploaded: "created",
  linked: "created",
  reviewed: "reviewed",
  verified: "approved",
  rejected: "rejected",
};

function mapAuditLifecycle(state) {
  return AUDIT_STATE_MAP[state] ?? "created";
}

function mapLcLifecycle(status) {
  return LC_STATUS_MAP[status] ?? "created";
}

function mapLcSensitivity(evidenceType, status) {
  if (status === "rejected" || status === "missing") return "restricted";
  if (evidenceType === "contract" || evidenceType === "attestation") return "confidential";
  return "standard";
}

const report = {
  mode: isApply ? "apply" : "dry_run",
  startedAt: new Date().toISOString(),
  audit: { scanned: 0, created: 0, updated: 0, linked: 0, errors: [] },
  localContent: { scanned: 0, created: 0, updated: 0, linked: 0, errors: [] },
  auditLinks: { scanned: 0, linked: 0, skipped: 0, errors: [] },
  totals: { scanned: 0, created: 0, updated: 0, linked: 0, errors: 0 },
  finishedAt: null,
};

function log(msg) {
  console.log(`[backfill-core-evidence] ${msg}`);
}

async function resolveAuditPlatformOrgId(auditOrganizationId) {
  const org = await prisma.auditOrganization.findUnique({
    where: { id: auditOrganizationId },
    select: { platformOrganizationId: true },
  });
  return org?.platformOrganizationId ?? null;
}

async function upsertCoreEvidence(input) {
  const existing = await prisma.coreEvidence.findUnique({
    where: {
      productSlug_productEvidenceId: {
        productSlug: input.productSlug,
        productEvidenceId: input.productEvidenceId,
      },
    },
  });

  if (existing) {
    if (isApply) {
      await prisma.coreEvidence.update({
        where: { id: existing.id },
        data: {
          filename: input.filename,
          fileType: input.fileType,
          storageKey: input.storageKey ?? existing.storageKey,
          fileHash: input.fileHash ?? existing.fileHash,
          evidenceType: input.evidenceType ?? existing.evidenceType,
          lifecycleStatus: input.lifecycleStatus,
          sensitivity: input.sensitivity ?? existing.sensitivity,
          organizationId: input.organizationId,
          platformOrganizationId: input.platformOrganizationId ?? existing.platformOrganizationId,
          resourceType: input.resourceType,
          resourceId: input.resourceId,
          uploadedById: input.uploadedById ?? existing.uploadedById,
          metadata: input.metadata ?? undefined,
        },
      });
    }
    return { id: existing.id, created: false };
  }

  if (!isApply) {
    return { id: `dry-${input.productSlug}-${input.productEvidenceId}`, created: true };
  }

  const row = await prisma.coreEvidence.create({
    data: {
      organizationId: input.organizationId,
      platformOrganizationId: input.platformOrganizationId ?? null,
      productSlug: input.productSlug,
      productEvidenceId: input.productEvidenceId,
      resourceType: input.resourceType,
      resourceId: input.resourceId,
      filename: input.filename,
      fileType: input.fileType,
      storageKey: input.storageKey ?? null,
      fileHash: input.fileHash ?? null,
      evidenceType: input.evidenceType ?? null,
      lifecycleStatus: input.lifecycleStatus,
      sensitivity: input.sensitivity ?? "standard",
      uploadedById: input.uploadedById ?? null,
      metadata: input.metadata ?? undefined,
    },
  });

  await prisma.evidenceLifecycle.create({
    data: {
      coreEvidenceId: row.id,
      fromStatus: null,
      toStatus: input.lifecycleStatus,
      actorId: input.uploadedById ?? null,
      provenance: {
        source: "backfill-core-evidence",
        productSlug: input.productSlug,
        productEvidenceId: input.productEvidenceId,
      },
    },
  });

  return { id: row.id, created: true };
}

async function upsertEvidenceLink(params) {
  const existing = await prisma.evidenceLink.findFirst({
    where: {
      coreEvidenceId: params.coreEvidenceId,
      targetType: params.targetType,
      targetId: params.targetId,
      linkType: params.linkType ?? "supports",
    },
  });
  if (existing) return { id: existing.id, created: false };

  if (!isApply) return { id: "dry-link", created: true };

  const link = await prisma.evidenceLink.create({ data: params });
  return { id: link.id, created: true };
}

async function backfillAuditEvidence() {
  log("Scanning AuditOS evidence…");
  const rows = await prisma.auditEvidence.findMany({
    include: {
      engagement: { select: { organizationId: true } },
      links: true,
    },
    orderBy: { createdAt: "asc" },
  });

  report.audit.scanned = rows.length;

  for (const row of rows) {
    try {
      const platformOrganizationId = await resolveAuditPlatformOrgId(
        row.engagement.organizationId,
      );

      const { id: coreId, created } = await upsertCoreEvidence({
        organizationId: row.engagement.organizationId,
        platformOrganizationId,
        productSlug: "audit",
        productEvidenceId: row.id,
        resourceType: "AuditEngagement",
        resourceId: row.engagementId,
        filename: row.filename,
        fileType: row.fileType,
        storageKey: row.storageKey,
        fileHash: row.fileHash,
        lifecycleStatus: mapAuditLifecycle(row.state),
        uploadedById: row.uploadedBy,
        metadata: { fileSize: row.fileSize, backfillSource: "audit" },
      });

      if (created) report.audit.created++;
      else report.audit.updated++;

      for (const link of row.links) {
        report.auditLinks.scanned++;
        const result = await upsertEvidenceLink({
          coreEvidenceId: coreId,
          targetType: link.targetType,
          targetId: link.targetId,
          linkType: link.linkType ?? "supports",
          productSlug: "audit",
          context: link.context,
          createdById: link.createdBy,
        });
        if (result.created) {
          report.auditLinks.linked++;
          report.audit.linked++;
        } else {
          report.auditLinks.skipped++;
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      report.audit.errors.push({ evidenceId: row.id, error: msg });
    }
  }
}

async function backfillLocalContentEvidence() {
  log("Scanning LocalContentOS evidence…");
  const rows = await prisma.localContentEvidence.findMany({
    include: {
      project: { select: { organizationId: true, platformOrganizationId: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  report.localContent.scanned = rows.length;

  for (const row of rows) {
    try {
      const { id: coreId, created } = await upsertCoreEvidence({
        organizationId: row.project.organizationId,
        platformOrganizationId: row.project.platformOrganizationId,
        productSlug: "local_content",
        productEvidenceId: row.id,
        resourceType: "LocalContentProject",
        resourceId: row.projectId,
        filename: row.filename,
        fileType: row.fileType,
        storageKey: row.storageKey,
        fileHash: row.fileHash,
        evidenceType: row.evidenceType,
        lifecycleStatus: mapLcLifecycle(row.status),
        sensitivity: mapLcSensitivity(row.evidenceType, row.status),
        uploadedById: row.reviewedById,
        metadata: {
          sizeBytes: row.sizeBytes,
          mimeType: row.mimeType,
          backfillSource: "local_content",
        },
      });

      if (created) report.localContent.created++;
      else report.localContent.updated++;

      const fkLinks = [
        row.supplierId ? { targetType: "supplier", targetId: row.supplierId } : null,
        row.spendRecordId
          ? { targetType: "spend_record", targetId: row.spendRecordId }
          : null,
        row.findingId ? { targetType: "finding", targetId: row.findingId, linkType: "evidence_for" } : null,
      ].filter(Boolean);

      for (const fk of fkLinks) {
        const result = await upsertEvidenceLink({
          coreEvidenceId: coreId,
          targetType: fk.targetType,
          targetId: fk.targetId,
          linkType: fk.linkType ?? "supports",
          productSlug: "local_content",
        });
        if (result.created) report.localContent.linked++;
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      report.localContent.errors.push({ evidenceId: row.id, error: msg });
    }
  }
}

function finalizeReport() {
  report.totals.scanned = report.audit.scanned + report.localContent.scanned;
  report.totals.created = report.audit.created + report.localContent.created;
  report.totals.updated = report.audit.updated + report.localContent.updated;
  report.totals.linked =
    report.audit.linked + report.localContent.linked + report.auditLinks.linked;
  report.totals.errors =
    report.audit.errors.length +
    report.localContent.errors.length +
    report.auditLinks.errors.length;
  report.finishedAt = new Date().toISOString();
}

function printReport() {
  console.log("\n╔════════════════════════════════════════════════════╗");
  console.log(`║  Core Evidence Backfill Report — ${report.mode.padEnd(12)}     ║`);
  console.log("╚════════════════════════════════════════════════════╝\n");
  console.log("Backfill Report");
  console.log(`- Total scanned:  ${report.totals.scanned}`);
  console.log(`- Total created:  ${report.totals.created}`);
  console.log(`- Total updated:  ${report.totals.updated}`);
  console.log(`- Total linked:   ${report.totals.linked}`);
  console.log(`- Errors:         ${report.totals.errors}`);
  console.log("\nAuditOS:");
  console.log(`  scanned=${report.audit.scanned} created=${report.audit.created} updated=${report.audit.updated} linked=${report.audit.linked} errors=${report.audit.errors.length}`);
  console.log("LocalContentOS:");
  console.log(`  scanned=${report.localContent.scanned} created=${report.localContent.created} updated=${report.localContent.updated} linked=${report.localContent.linked} errors=${report.localContent.errors.length}`);
  console.log("AuditEvidenceLinks:");
  console.log(`  scanned=${report.auditLinks.scanned} linked=${report.auditLinks.linked} skipped=${report.auditLinks.skipped}`);

  if (report.totals.errors > 0) {
    console.log("\nErrors:");
    for (const e of [...report.audit.errors, ...report.localContent.errors]) {
      console.log(`  - ${e.evidenceId}: ${e.error}`);
    }
  }
}

async function ensureCoreEvidenceTable() {
  try {
    await prisma.coreEvidence.count();
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("does not exist") || msg.includes("CoreEvidence")) {
      console.error(
        "[backfill-core-evidence] CoreEvidence table missing. Run: npx prisma migrate deploy (or npx prisma db push)",
      );
      process.exit(1);
    }
    throw err;
  }
}

async function main() {
  log(`Mode: ${isApply ? "APPLY" : "DRY RUN"}`);
  await ensureCoreEvidenceTable();

  await backfillAuditEvidence();
  await backfillLocalContentEvidence();

  finalizeReport();
  printReport();

  if (!existsSync(REPORT_DIR)) mkdirSync(REPORT_DIR, { recursive: true });
  const reportPath = resolve(
    REPORT_DIR,
    `backfill-${report.mode}-${Date.now()}.json`,
  );
  writeFileSync(reportPath, JSON.stringify(report, null, 2));
  log(`Report written: ${reportPath}`);

  await prisma.$disconnect();

  if (report.totals.errors > 0) process.exit(1);
}

main().catch((err) => {
  console.error("[backfill-core-evidence] Fatal:", err);
  process.exit(1);
});
