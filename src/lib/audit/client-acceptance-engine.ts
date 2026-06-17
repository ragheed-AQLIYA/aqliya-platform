// ─── AuditOS L6.1 Client Acceptance & Continuance Engine ───
// محرك قبول العملاء والاستمرار
// ISA 220, ISA 210, ISA 315 compliant

import "server-only";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type { AuditActor } from "./actor-context";
import { assertClientAccess, assertEngagementAccess } from "./tenant-guard";

// ─── Types ───

export type ProspectStatus = "lead" | "qualified" | "kyc_in_progress" | "declined" | "accepted";
export type ProspectSource = "referral" | "inbound" | "tender" | "existing_client_referral";
export type RiskLevel = "low" | "medium" | "high" | "decline";
export type AssessmentStatus = "draft" | "completed" | "reviewed" | "approved";
export type AssessmentType = "acceptance" | "continuance" | "trigger";
export type DecisionType = "acceptance" | "continuance" | "withdrawal";
export type Decision = "accept" | "accept_with_conditions" | "decline" | "withdraw";

// ─── Default Risk Methodology ───

interface RiskFactor {
  name: string;
  weight: number;
  score: number; // 1-10
  rationale: string;
}

const DEFAULT_METHODOLOGY = {
  name: "AQLIYA Standard Risk Assessment v1.0",
  factors: [
    { name: "entity_risk", weight: 0.25, label: "مخاطر الكيان" },
    { name: "industry_risk", weight: 0.20, label: "مخاطر القطاع" },
    { name: "financial_risk", weight: 0.20, label: "مخاطر مالية" },
    { name: "governance_risk", weight: 0.15, label: "مخاطر الحوكمة" },
    { name: "regulatory_risk", weight: 0.20, label: "مخاطر تنظيمية" },
  ],
  thresholds: {
    low: 3.0,
    medium: 5.0,
    high: 7.5,
    decline: 10.0,
  },
};

// ─── Service ───

export class ClientAcceptanceEngine {
  // ==================== Prospect Management ====================

  async createProspect(
    actor: AuditActor,
    data: {
      organizationId: string;
      source: ProspectSource;
      companyName: string;
      registrationNumber?: string;
      jurisdiction?: string;
      industry?: string;
      contactName?: string;
      contactEmail?: string;
      contactPhone?: string;
      estimatedFee?: number;
      referredBy?: string;
      referralNotes?: string;
    },
  ) {
    const prospect = await prisma.clientProspect.create({
      data: {
        organizationId: data.organizationId,
        source: data.source,
        companyName: data.companyName,
        registrationNumber: data.registrationNumber,
        jurisdiction: data.jurisdiction,
        industry: data.industry,
        contactName: data.contactName,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone,
        estimatedFee: data.estimatedFee,
        estimatedFeeCurrency: "SAR",
        referredBy: data.referredBy,
        referralNotes: data.referralNotes,
        createdById: actor.actorId,
      },
    });

    return prospect;
  }

  async updateProspect(
    id: string,
    data: Partial<{
      status: ProspectStatus;
      companyName: string;
      registrationNumber: string;
      jurisdiction: string;
      industry: string;
      contactName: string;
      contactEmail: string;
      contactPhone: string;
      estimatedFee: number;
    }>,
  ) {
    return prisma.clientProspect.update({
      where: { id },
      data,
    });
  }

  async getProspect(id: string) {
    return prisma.clientProspect.findUnique({
      where: { id },
      include: {
        kycPackage: true,
        riskAssessment: true,
        decisions: true,
      },
    });
  }

  async listProspects(organizationId: string, status?: ProspectStatus) {
    return prisma.clientProspect.findMany({
      where: {
        organizationId,
        ...(status ? { status } : {}),
      },
      include: {
        kycPackage: true,
        riskAssessment: true,
        decisions: { take: 1 },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  // ==================== KYC ====================

  async createOrUpdateKyc(
    actor: AuditActor,
    prospectId: string,
    data: {
      ownershipStructure?: Record<string, unknown>;
      financialHealth?: Record<string, unknown>;
      regulatoryStatus?: string;
      regulatoryBody?: string;
      litigationHistory?: Record<string, unknown>;
      pepCheck?: string;
      sanctionCheck?: string;
      adverseMediaCheck?: string;
      notes?: string;
    },
  ) {
    const existing = await prisma.kycPackage.findUnique({
      where: { prospectId },
    });

    const kyc = existing
      ? await prisma.kycPackage.update({
          where: { id: existing.id },
          data: {
            ...data,
            status: "completed",
            completedById: actor.actorId,
            completedAt: new Date(),
            ownershipStructure: data.ownershipStructure as Prisma.InputJsonValue,
            financialHealth: data.financialHealth as Prisma.InputJsonValue,
            litigationHistory: data.litigationHistory as Prisma.InputJsonValue,
          },
        })
      : await prisma.kycPackage.create({
          data: {
            prospectId,
            ...data,
            status: "completed",
            completedById: actor.actorId,
            completedAt: new Date(),
            ownershipStructure: data.ownershipStructure as Prisma.InputJsonValue,
            financialHealth: data.financialHealth as Prisma.InputJsonValue,
            litigationHistory: data.litigationHistory as Prisma.InputJsonValue,
          },
        });

    // Update prospect status to continue pipeline
    await prisma.clientProspect.update({
      where: { id: prospectId },
      data: { status: "qualified" },
    });

    return kyc;
  }

  // ==================== Risk Assessment ====================

  async assessRisk(
    actor: AuditActor,
    input: {
      prospectId: string;
      assessmentType: AssessmentType;
      clientId?: string;
      riskFactors: RiskFactor[];
      mitigatingFactors?: string[];
      methodology?: string;
    },
  ) {
    // Calculate scores
    let weightedScore = 0;
    let totalWeight = 0;
    const factorScores: Record<string, number> = {};

    for (const factor of input.riskFactors) {
      weightedScore += factor.weight * factor.score;
      totalWeight += factor.weight;
      factorScores[factor.name] = Math.round(factor.score * factor.weight * 10) / 10;
    }

    const normalizedScore = totalWeight > 0 ? weightedScore / totalWeight : 0;
    const thresholds = DEFAULT_METHODOLOGY.thresholds;

    const overallLevel: RiskLevel =
      normalizedScore >= thresholds.decline ? "decline"
      : normalizedScore >= thresholds.high ? "high"
      : normalizedScore >= thresholds.medium ? "medium"
      : "low";

    // Store risk factors breakdown
    const entityRisk = input.riskFactors.find(f => f.name === "entity_risk");
    const industryRisk = input.riskFactors.find(f => f.name === "industry_risk");
    const financialRisk = input.riskFactors.find(f => f.name === "financial_risk");
    const governanceRisk = input.riskFactors.find(f => f.name === "governance_risk");
    const regulatoryRisk = input.riskFactors.find(f => f.name === "regulatory_risk");

    const assessment = await prisma.clientRiskAssessment.upsert({
      where: { prospectId: input.prospectId },
      create: {
        prospectId: input.prospectId,
        clientId: input.clientId,
        assessmentType: input.assessmentType,
        status: "completed",
        overallRiskScore: Math.round(normalizedScore * 10) / 10,
        overallRiskLevel: overallLevel,
        entityRiskScore: entityRisk?.score ?? null,
        entityRiskLevel: entityRisk ? calcLevel(entityRisk.score) : null,
        industryRiskScore: industryRisk?.score ?? null,
        industryRiskLevel: industryRisk ? calcLevel(industryRisk.score) : null,
        financialRiskScore: financialRisk?.score ?? null,
        financialRiskLevel: financialRisk ? calcLevel(financialRisk.score) : null,
        governanceRiskScore: governanceRisk?.score ?? null,
        governanceRiskLevel: governanceRisk ? calcLevel(governanceRisk.score) : null,
        regulatoryRiskScore: regulatoryRisk?.score ?? null,
        regulatoryRiskLevel: regulatoryRisk ? calcLevel(regulatoryRisk.score) : null,
        riskFactors: input.riskFactors as Prisma.InputJsonValue,
        mitigatingFactors: (input.mitigatingFactors ?? []) as Prisma.InputJsonValue,
        methodology: input.methodology ?? DEFAULT_METHODOLOGY.name,
        assessedById: actor.actorId,
        assessedAt: new Date(),
      },
      update: {
        status: "completed",
        overallRiskScore: Math.round(normalizedScore * 10) / 10,
        overallRiskLevel: overallLevel,
        clientId: input.clientId,
        riskFactors: input.riskFactors as Prisma.InputJsonValue,
        mitigatingFactors: (input.mitigatingFactors ?? []) as Prisma.InputJsonValue,
        assessedById: actor.actorId,
        assessedAt: new Date(),
      },
    });

    return assessment;
  }

  async reviewRiskAssessment(actor: AuditActor, assessmentId: string) {
    return prisma.clientRiskAssessment.update({
      where: { id: assessmentId },
      data: {
        status: "reviewed",
        reviewedById: actor.actorId,
        reviewedAt: new Date(),
      },
    });
  }

  async approveRiskAssessment(actor: AuditActor, assessmentId: string) {
    return prisma.clientRiskAssessment.update({
      where: { id: assessmentId },
      data: {
        status: "approved",
        reviewedById: actor.actorId,
        reviewedAt: new Date(),
      },
    });
  }

  // ==================== Acceptance Decision ====================

  async makeDecision(
    actor: AuditActor,
    input: {
      prospectId: string;
      clientId?: string;
      decisionType: DecisionType;
      decision: Decision;
      rationale: string;
      conditions?: string[];
      effectiveDate?: Date;
      expiryDate?: Date;
    },
  ) {
    const decision = await prisma.acceptanceDecision.create({
      data: {
        prospectId: input.prospectId,
        clientId: input.clientId,
        decisionType: input.decisionType,
        decision: input.decision,
        rationale: input.rationale,
        conditions: (input.conditions ?? []) as Prisma.InputJsonValue,
        effectiveDate: input.effectiveDate,
        expiryDate: input.expiryDate,
        approvedById: actor.actorId,
        approvedAt: new Date(),
        createdById: actor.actorId,
      },
    });

    // Update prospect status
    if (input.decision === "accept" || input.decision === "accept_with_conditions") {
      await prisma.clientProspect.update({
        where: { id: input.prospectId },
        data: { status: "accepted" },
      });

      // If prospect doesn't exist as client yet, create one
      if (!input.clientId) {
        const prospect = await prisma.clientProspect.findUnique({
          where: { id: input.prospectId },
        });
        if (prospect) {
          // Find the audit organization
          const auditOrg = await prisma.auditOrganization.findFirst({
            where: { platformOrganizationId: prospect.organizationId },
          });
          if (auditOrg) {
            const client = await prisma.auditClient.create({
              data: {
                organizationId: auditOrg.id,
                name: prospect.companyName,
                registrationNumber: prospect.registrationNumber,
                industry: prospect.industry ?? "other",
                contactEmail: prospect.contactEmail,
                contactPhone: prospect.contactPhone,
                status: "active",
              },
            });

            // Update the decision with the client reference
            await prisma.acceptanceDecision.update({
              where: { id: decision.id },
              data: { clientId: client.id },
            });
          }
        }
      }
    } else {
      await prisma.clientProspect.update({
        where: { id: input.prospectId },
        data: { status: "declined" },
      });
    }

    return decision;
  }

  async getDecisions(prospectId: string) {
    return prisma.acceptanceDecision.findMany({
      where: { prospectId },
      orderBy: { createdAt: "desc" },
    });
  }

  // ==================== Continuance Review ====================

  async createContinuanceReview(
    actor: AuditActor,
    input: {
      organizationId: string;
      clientId: string;
      reviewYear: number;
      engagementHistory?: Record<string, unknown>;
      feeHistory?: Record<string, unknown>;
      clientChanges?: Record<string, unknown>;
    },
  ) {
    return prisma.continuanceReview.create({
      data: {
        organizationId: input.organizationId,
        clientId: input.clientId,
        reviewYear: input.reviewYear,
        engagementHistory: input.engagementHistory as Prisma.InputJsonValue,
        feeHistory: input.feeHistory as Prisma.InputJsonValue,
        clientChanges: input.clientChanges as Prisma.InputJsonValue,
        createdById: actor.actorId,
      },
    });
  }

  async completeContinuanceReview(
    actor: AuditActor,
    reviewId: string,
    decision: Decision,
    rationale: string,
    riskReassessmentId?: string,
  ) {
    return prisma.continuanceReview.update({
      where: { id: reviewId },
      data: {
        status: "completed",
        decision,
        rationale,
        riskReassessmentId,
        approvedById: actor.actorId,
        approvedAt: new Date(),
      },
    });
  }

  async listContinuanceReviews(clientId: string) {
    return prisma.continuanceReview.findMany({
      where: { clientId },
      orderBy: { reviewYear: "desc" },
    });
  }

  async getPendingContinuanceReviews(organizationId: string) {
    const reviews = await prisma.continuanceReview.findMany({
      where: { organizationId, status: "pending" },
      orderBy: { createdAt: "desc" },
    });

    // Enrich with client names
    const clientIds = [...new Set(reviews.map(r => r.clientId))];
    const clients = clientIds.length > 0
      ? await prisma.auditClient.findMany({ where: { id: { in: clientIds } }, select: { id: true, name: true } })
      : [];

    const clientMap = new Map(clients.map(c => [c.id, c]));

    return reviews.map(r => ({
      ...r,
      clientName: clientMap.get(r.clientId)?.name ?? "Unknown",
    }));
  }

  // ==================== Dashboard / Pipeline ====================

  async getPipeline(organizationId: string) {
    const [prospects, totalClients, continuityPending] = await Promise.all([
      prisma.clientProspect.findMany({
        where: { organizationId },
        orderBy: { createdAt: "desc" },
        include: {
          riskAssessment: { select: { overallRiskLevel: true, status: true } },
          decisions: { take: 1, orderBy: { createdAt: "desc" } },
        },
      }),
      prisma.auditClient.count({
        where: { organizationId: organizationId },
      }),
      prisma.continuanceReview.count({
        where: { organizationId, status: "pending" },
      }),
    ]);

    const byStatus = prospects.reduce(
      (acc, p) => {
        acc[p.status] = (acc[p.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    return {
      totalProspects: prospects.length,
      totalClients,
      pendingContinuance: continuityPending,
      byStatus,
      prospects,
    };
  }
}

function calcLevel(score: number): string {
  if (score >= 8) return "high";
  if (score >= 5) return "medium";
  return "low";
}

export const clientAcceptanceEngine = new ClientAcceptanceEngine();
