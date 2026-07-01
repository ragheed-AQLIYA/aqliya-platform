import "server-only";

import { prisma } from "@/lib/prisma";
import { EVIDENCE_LIFECYCLE_STATUSES } from "./lifecycle";

export interface EvidenceHealthSnapshot {
  generatedAt: string;
  totalCoreEvidence: number;
  orphanedEvidence: number;
  missingRelations: number;
  failedAdapterSyncs: number;
  lifecycleDistribution: Record<string, number>;
  backfillCoverage: {
    audit: { productTotal: number; coreTotal: number; percent: number };
    localContent: { productTotal: number; coreTotal: number; percent: number };
    overall: { productTotal: number; coreTotal: number; percent: number };
  };
  byProduct: Record<string, number>;
  alerts: Array<{
    code: string;
    severity: "critical" | "warning" | "info";
    message: string;
  }>;
}

export async function getEvidenceHealthSnapshot(): Promise<EvidenceHealthSnapshot> {
  const [
    totalCoreEvidence,
    auditProductTotal,
    lcProductTotal,
    auditCoreTotal,
    lcCoreTotal,
    lifecycleGroups,
    byProductGroups,
    coreRows,
    auditLinkCount,
    platformLinkCount,
    lcWithFkCount,
  ] = await Promise.all([
    prisma.coreEvidence.count(),
    prisma.auditEvidence.count(),
    prisma.localContentEvidence.count(),
    prisma.coreEvidence.count({ where: { productSlug: "audit" } }),
    prisma.coreEvidence.count({ where: { productSlug: "local_content" } }),
    prisma.coreEvidence.groupBy({
      by: ["lifecycleStatus"],
      _count: { id: true },
    }),
    prisma.coreEvidence.groupBy({
      by: ["productSlug"],
      _count: { id: true },
    }),
    prisma.coreEvidence.findMany({
      select: {
        id: true,
        productSlug: true,
        productEvidenceId: true,
        graphNodeId: true,
      },
    }),
    prisma.auditEvidenceLink.count(),
    prisma.evidenceLink.count(),
    prisma.localContentEvidence.count({
      where: {
        OR: [
          { supplierId: { not: null } },
          { spendRecordId: { not: null } },
          { findingId: { not: null } },
        ],
      },
    }),
  ]);

  const lifecycleDistribution = Object.fromEntries(
    EVIDENCE_LIFECYCLE_STATUSES.map((s) => [s, 0]),
  );
  for (const g of lifecycleGroups) {
    lifecycleDistribution[g.lifecycleStatus] = g._count.id;
  }

  const byProduct = Object.fromEntries(
    byProductGroups.map((g) => [g.productSlug, g._count.id]),
  );

  let orphanedEvidence = 0;
  const auditCoreIds = coreRows
    .filter((r) => r.productSlug === "audit")
    .map((r) => r.productEvidenceId);
  const lcCoreIds = coreRows
    .filter((r) => r.productSlug === "local_content")
    .map((r) => r.productEvidenceId);

  if (auditCoreIds.length > 0) {
    const existing = await prisma.auditEvidence.findMany({
      where: { id: { in: auditCoreIds } },
      select: { id: true },
    });
    const set = new Set(existing.map((e) => e.id));
    orphanedEvidence += auditCoreIds.filter((id) => !set.has(id)).length;
  }
  if (lcCoreIds.length > 0) {
    const existing = await prisma.localContentEvidence.findMany({
      where: { id: { in: lcCoreIds } },
      select: { id: true },
    });
    const set = new Set(existing.map((e) => e.id));
    orphanedEvidence += lcCoreIds.filter((id) => !set.has(id)).length;
  }

  const auditMissingCore = Math.max(0, auditProductTotal - auditCoreTotal);
  const lcMissingCore = Math.max(0, lcProductTotal - lcCoreTotal);
  const failedAdapterSyncs = auditMissingCore + lcMissingCore;

  const expectedPlatformLinks = auditLinkCount + lcWithFkCount;
  const missingRelations = Math.max(0, expectedPlatformLinks - platformLinkCount);

  const productTotal = auditProductTotal + lcProductTotal;
  const coreTotal = auditCoreTotal + lcCoreTotal;
  const overallPercent =
    productTotal === 0 ? 100 : Math.round((coreTotal / productTotal) * 100);

  const alerts: EvidenceHealthSnapshot["alerts"] = [];

  if (failedAdapterSyncs > 0) {
    alerts.push({
      code: "EVIDENCE_ADAPTER_SYNC_GAP",
      severity: failedAdapterSyncs > 10 ? "critical" : "warning",
      message: `${failedAdapterSyncs} product evidence record(s) missing CoreEvidence mirror`,
    });
  }
  if (orphanedEvidence > 0) {
    alerts.push({
      code: "EVIDENCE_ORPHANED",
      severity: "warning",
      message: `${orphanedEvidence} CoreEvidence row(s) have no matching product record`,
    });
  }
  if (missingRelations > 0) {
    alerts.push({
      code: "EVIDENCE_MISSING_RELATIONS",
      severity: "info",
      message: `${missingRelations} expected entity link(s) not mirrored in EvidenceLink`,
    });
  }
  if (overallPercent < 100) {
    alerts.push({
      code: "EVIDENCE_BACKFILL_INCOMPLETE",
      severity: overallPercent < 90 ? "critical" : "warning",
      message: `Backfill coverage ${overallPercent}% (${coreTotal}/${productTotal})`,
    });
  }

  return {
    generatedAt: new Date().toISOString(),
    totalCoreEvidence,
    orphanedEvidence,
    missingRelations,
    failedAdapterSyncs,
    lifecycleDistribution,
    backfillCoverage: {
      audit: {
        productTotal: auditProductTotal,
        coreTotal: auditCoreTotal,
        percent:
          auditProductTotal === 0
            ? 100
            : Math.round((auditCoreTotal / auditProductTotal) * 100),
      },
      localContent: {
        productTotal: lcProductTotal,
        coreTotal: lcCoreTotal,
        percent:
          lcProductTotal === 0
            ? 100
            : Math.round((lcCoreTotal / lcProductTotal) * 100),
      },
      overall: {
        productTotal,
        coreTotal,
        percent: overallPercent,
      },
    },
    byProduct,
    alerts,
  };
}
