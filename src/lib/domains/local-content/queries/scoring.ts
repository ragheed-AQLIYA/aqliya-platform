import "server-only";

import { prisma } from "@/lib/kernel";
import { Projection } from "@/lib/kernel/cqrs/projection";
import type { ProjectionConfig } from "@/lib/kernel/cqrs/projection";

export interface LcosScoringReadModel {
  projectCount: number;
  activeProjectCount: number;
  averageScore: number;
  scoreDistribution: { range: string; count: number }[];
  supplierCount: number;
  totalSpend: number;
  lastComputedAt: string;
}

const LCOS_SCORING_CONFIG: ProjectionConfig = {
  domain: "lc",
  actions: [
    "project.created",
    "project.status_changed",
    "classification.completed",
    "report.generated",
    "finding.created",
  ],
  rebuildIntervalMs: 60_000,
};

export class LcosScoringProjection extends Projection<LcosScoringReadModel> {
  readonly id = "lcos-scoring";
  readonly name = "LocalContentOS Scoring";

  protected config = LCOS_SCORING_CONFIG;

  async compute(organizationId: string): Promise<LcosScoringReadModel> {
    const projects = await prisma.localContentProject.findMany({
      where: { organizationId },
      select: { id: true, status: true, localContentScore: true },
    });

    const projectIds = projects.map((p) => p.id);

    const supplierCount = projectIds.length > 0
      ? await prisma.localContentSupplier.count({
          where: { projectId: { in: projectIds } },
        })
      : 0;

    const spendAgg = projectIds.length > 0
      ? await prisma.localContentSpendRecord.aggregate({
          where: { projectId: { in: projectIds } },
          _sum: { amount: true },
        })
      : { _sum: { amount: 0 } };

    const activeProjectCount = projects.filter(
      (p) =>
        p.status === "DataCollection" ||
        p.status === "ClassificationInProgress" ||
        p.status === "EvidenceReview" ||
        p.status === "FindingsDrafted" ||
        p.status === "InReview",
    ).length;

    const scores = projects.map((p) => p.localContentScore ?? 0);
    const averageScore =
      scores.length > 0
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : 0;

    const ranges = [
      { range: "0-20", min: 0, max: 20 },
      { range: "21-40", min: 21, max: 40 },
      { range: "41-60", min: 41, max: 60 },
      { range: "61-80", min: 61, max: 80 },
      { range: "81-100", min: 81, max: 100 },
    ];

    const scoreDistribution = ranges.map(({ range, min, max }) => ({
      range,
      count: scores.filter((s) => s >= min && s <= max).length,
    }));

    return {
      projectCount: projects.length,
      activeProjectCount,
      averageScore,
      scoreDistribution,
      supplierCount,
      totalSpend: Number(spendAgg._sum.amount ?? 0),
      lastComputedAt: new Date().toISOString(),
    };
  }
}

export async function queryLcosScoring(
  organizationId: string,
): Promise<LcosScoringReadModel> {
  const projection = new LcosScoringProjection();
  return projection.compute(organizationId);
}
