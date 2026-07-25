// ─── AuditOS L6.8 Audit Knowledge Engine ───
// محرك المعرفة التدقيقية — تحويل تاريخ المهام إلى ذكاء مؤسسي

import "server-only";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export class AuditKnowledgeEngine {
  // ==================== Patterns ====================

  async derivePatternsFromEngagement(engagementId: string) {
    const findings = await prisma.auditFinding.findMany({
      where: { engagementId },
    });

    if (findings.length === 0) return { patternsCreated: 0 };

    const engagement = await prisma.auditEngagement.findUnique({
      where: { id: engagementId },
      select: { organizationId: true },
    });
    if (!engagement) return { patternsCreated: 0 };

    const orgId = engagement.organizationId;

    const patternKeys = findings.map(
      (f) => `finding:${f.findingType}:${f.severity}`,
    );

    const existingPatterns = await prisma.knowledgePattern.findMany({
      where: {
        organizationId: orgId,
        patternType: "finding",
        patternKey: { in: patternKeys },
      },
    });

    const existingMap = new Map(existingPatterns.map((p) => [p.patternKey, p]));

    const toUpdate: { id: string; existing: typeof existingPatterns[0]; finding: typeof findings[0] }[] = [];
    const toCreate: typeof findings = [];

    for (const finding of findings) {
      const patternKey = `finding:${finding.findingType}:${finding.severity}`;
      const existing = existingMap.get(patternKey);
      if (existing) {
        toUpdate.push({ id: existing.id, existing, finding });
      } else {
        toCreate.push(finding);
      }
    }

    await Promise.all(
      toUpdate.map((item) =>
        prisma.knowledgePattern.update({
          where: { id: item.id },
          data: {
            occurrenceCount: item.existing.occurrenceCount + 1,
            lastObservedAt: new Date(),
            confidenceScore: Math.min((item.existing.occurrenceCount + 1) / 10, 0.95),
          },
        }),
      ),
    );

    await prisma.knowledgePattern.createMany({
      data: toCreate.map((finding) => ({
        organizationId: orgId,
        patternType: "finding",
        patternKey: `finding:${finding.findingType}:${finding.severity}`,
        patternLabel: `${finding.findingType}: ${finding.severity}`,
        occurrenceCount: 1,
        confidenceScore: 0.1,
        metadata: {
          commonSeverities: [finding.severity],
          commonTypes: [finding.findingType],
        },
      })),
    });

    return { patternsCreated: toCreate.length, totalProcessed: findings.length };
  }

  async listPatterns(organizationId: string, patternType?: string) {
    return prisma.knowledgePattern.findMany({
      where: {
        organizationId,
        ...(patternType ? { patternType } : {}),
        isActive: true,
      },
      orderBy: { occurrenceCount: "desc" },
    });
  }

  async getTopPatterns(organizationId: string, limit = 10) {
    return prisma.knowledgePattern.findMany({
      where: { organizationId, isActive: true },
      orderBy: { occurrenceCount: "desc" },
      take: limit,
    });
  }

  // ==================== Recommendations ====================

  async generateRecommendations(engagementId: string) {
    const engagement = await prisma.auditEngagement.findUnique({
      where: { id: engagementId },
      select: { organizationId: true },
    });
    if (!engagement) return [];

    // Get top patterns for the organization
    const patterns = await prisma.knowledgePattern.findMany({
      where: { organizationId: engagement.organizationId, isActive: true },
      orderBy: { occurrenceCount: "desc" },
      take: 5,
    });

    const recommendations = [];

    if (patterns.length > 0) {
      const created = await prisma.knowledgeRecommendation.createMany({
        data: patterns.map((pattern) => ({
          engagementId,
          patternId: pattern.id,
          recommendationType: "risk_suggestion",
          content: `بناءً على ${pattern.occurrenceCount} مهمة سابقة: ${pattern.patternLabel}`,
          context: `تم اكتشاف هذا النمط في ${pattern.occurrenceCount} مهمة مشابهة`,
          relevanceScore: pattern.confidenceScore,
          confidenceScore: pattern.confidenceScore,
        })),
      });

      const saved = await prisma.knowledgeRecommendation.findMany({
        where: { engagementId },
        include: { knowledgePattern: true },
        orderBy: { createdAt: "desc" },
        take: created.count,
      });
      recommendations.push(...saved);
    }

    return recommendations;
  }

  async listRecommendations(engagementId: string, status?: string) {
    return prisma.knowledgeRecommendation.findMany({
      where: {
        engagementId,
        ...(status ? { status } : {}),
      },
      include: { knowledgePattern: true },
      orderBy: [{ relevanceScore: "desc" }, { createdAt: "desc" }],
    });
  }

  async updateRecommendationStatus(
    id: string,
    status: string,
    actorId?: string,
  ) {
    const data: Record<string, unknown> = { status };
    if (status === "accepted" && actorId) {
      data.acceptedById = actorId;
      data.acceptedAt = new Date();
    }
    return prisma.knowledgeRecommendation.update({
      where: { id },
      data,
    });
  }

  // ==================== Engagement Profile ====================

  async createOrUpdateProfile(
    engagementId: string,
    data: {
      organizationId: string;
      industryProfile?: Record<string, unknown>;
      entityCharacteristics?: Record<string, unknown>;
      riskProfileSummary?: string;
      riskAreas?: string[];
      findingsSummary?: Record<string, unknown>;
      keyAdjustments?: Record<string, unknown>;
      priorYearEngagementId?: string;
      knowledgeTags?: string[];
      isCompleted?: boolean;
    },
  ) {
    return prisma.engagementProfile.upsert({
      where: { organizationId_engagementId: { organizationId: data.organizationId, engagementId } },
      create: {
        engagementId,
        organizationId: data.organizationId,
        industryProfile: data.industryProfile as unknown as Prisma.InputJsonValue,
        entityCharacteristics: data.entityCharacteristics as unknown as Prisma.InputJsonValue,
        riskProfileSummary: data.riskProfileSummary,
        riskAreas: (data.riskAreas ?? []) as unknown as Prisma.InputJsonValue,
        findingsSummary: data.findingsSummary as unknown as Prisma.InputJsonValue,
        keyAdjustments: data.keyAdjustments as unknown as Prisma.InputJsonValue,
        priorYearEngagementId: data.priorYearEngagementId,
        knowledgeTags: (data.knowledgeTags ?? []) as unknown as Prisma.InputJsonValue,
        isCompleted: data.isCompleted ?? false,
      },
      update: {
        industryProfile: data.industryProfile as unknown as Prisma.InputJsonValue,
        entityCharacteristics: data.entityCharacteristics as unknown as Prisma.InputJsonValue,
        riskProfileSummary: data.riskProfileSummary,
        riskAreas: (data.riskAreas ?? []) as unknown as Prisma.InputJsonValue,
        findingsSummary: data.findingsSummary as unknown as Prisma.InputJsonValue,
        keyAdjustments: data.keyAdjustments as unknown as Prisma.InputJsonValue,
        priorYearEngagementId: data.priorYearEngagementId,
        knowledgeTags: (data.knowledgeTags ?? []) as unknown as Prisma.InputJsonValue,
        isCompleted: data.isCompleted ?? false,
      },
    });
  }

  async getProfile(engagementId: string) {
    return prisma.engagementProfile.findFirst({
      where: { engagementId },
    });
  }

  // ==================== Industry Benchmarks ====================

  async createBenchmark(data: {
    organizationId: string;
    industry: string;
    benchmarkType: string;
    metricName: string;
    metricValue: number;
    unit?: string;
    sampleSize?: number;
    source?: string;
    confidenceInterval?: number;
    confidenceLevel?: number;
  }) {
    return prisma.industryBenchmark.upsert({
      where: {
        organizationId_industry_benchmarkType_metricName: {
          organizationId: data.organizationId,
          industry: data.industry,
          benchmarkType: data.benchmarkType,
          metricName: data.metricName,
        },
      },
      create: data,
      update: {
        metricValue: data.metricValue,
        sampleSize: data.sampleSize,
        confidenceInterval: data.confidenceInterval,
        confidenceLevel: data.confidenceLevel,
      },
    });
  }

  async listBenchmarks(organizationId: string, industry?: string) {
    return prisma.industryBenchmark.findMany({
      where: {
        organizationId,
        ...(industry ? { industry } : {}),
      },
      orderBy: [{ industry: "asc" }, { metricName: "asc" }],
    });
  }

  // ==================== Dashboard ====================

  async getDashboard(organizationId: string) {
    const [patternCount, totalRecommendations, profileCount, topPatterns, benchmarks] =
      await Promise.all([
        prisma.knowledgePattern.count({ where: { organizationId, isActive: true } }),
        prisma.knowledgeRecommendation.count({ where: { engagementId: { equals: organizationId } } }),
        prisma.engagementProfile.count({ where: { organizationId } }),
        prisma.knowledgePattern.findMany({
          where: { organizationId, isActive: true },
          orderBy: { occurrenceCount: "desc" },
          take: 5,
        }),
        prisma.industryBenchmark.findMany({
          where: { organizationId },
          orderBy: { industry: "asc" },
          take: 10,
        }),
      ]);

    return {
      patternCount,
      totalRecommendations,
      profileCount,
      topPatterns,
      benchmarks,
    };
  }
}

export const auditKnowledgeEngine = new AuditKnowledgeEngine();


