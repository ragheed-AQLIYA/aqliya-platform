import { prisma, calculateFullScoring, type ScoringResult } from "./common";

export async function calculateProjectScore(
  projectId: string,
): Promise<ScoringResult> {
  const [
    project,
    suppliers,
    spendRecords,
    classifications,
    evidence,
    findings,
  ] = await Promise.all([
    prisma.localContentProject.findUnique({
      where: { id: projectId },
      select: { id: true },
    }),
    prisma.localContentSupplier.findMany({
      where: { projectId },
      select: {
        id: true,
        name: true,
        localityClassification: true,
        localContentPercentage: true,
        ownershipType: true,
        workforceLocalPct: true,
      },
      take: 100,
    }),
    prisma.localContentSpendRecord.findMany({
      where: { projectId },
      select: {
        amount: true,
        category: true,
        supplier: {
          select: {
            localityClassification: true,
            localContentPercentage: true,
            ownershipType: true,
          },
        },
      },
      take: 100,
    }),
    prisma.localContentClassification.findMany({
      where: { projectId },
      select: {
        localPercentage: true,
        reviewStatus: true,
        classificationBasis: true,
      },
      take: 100,
    }),
    prisma.localContentEvidence.findMany({
      where: { projectId },
      select: { status: true },
      take: 100,
    }),
    prisma.localContentFinding.findMany({
      where: { projectId },
      select: { severity: true, status: true },
      take: 100,
    }),
  ]);

  if (!project) throw new Error("Project not found");

  return calculateFullScoring({
    suppliers: suppliers.map((s) => ({
      supplierKey: s.id,
      localityClassification: s.localityClassification,
      localContentPercentage: s.localContentPercentage,
      ownershipType: s.ownershipType,
      workforceLocalPct: s.workforceLocalPct,
    })),
    spendRecords: spendRecords.map((sr) => ({
      amount: sr.amount,
      category: sr.category,
      supplier: {
        localityClassification: sr.supplier.localityClassification,
        localContentPercentage: sr.supplier.localContentPercentage,
        ownershipType: sr.supplier.ownershipType,
      },
    })),
    classifications: classifications.map((c) => ({
      localPercentage: c.localPercentage,
      reviewStatus: c.reviewStatus,
      classificationBasis: c.classificationBasis,
    })),
    evidence: evidence.map((e) => ({ status: e.status })),
    findings: findings.map((f) => ({ severity: f.severity, status: f.status })),
  });
}
