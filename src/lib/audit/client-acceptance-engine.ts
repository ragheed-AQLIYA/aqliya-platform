// ─── AuditOS L6.1 Client Acceptance & Continuance Engine ───
// محرك قبول العملاء والاستمرار
// ISA 210, ISA 220, ISA 315 compliant

import "server-only";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type { AuditActor } from "./actor-context";
import { recordAuditEvent } from "./services";

// ─── Types ───

export type ProspectStatus =
  | "new"
  | "qualified"
  | "kyc_in_progress"
  | "kyc_completed"
  | "risk_assessment"
  | "risk_completed"
  | "decision_pending"
  | "accepted"
  | "declined"
  | "withdrawn";

export type RiskLevel = "low" | "medium" | "high" | "decline";

// ─── Workflow Transitions ───

const VALID_TRANSITIONS: Record<string, string[]> = {
  new: ["qualified", "kyc_in_progress", "kyc_completed", "declined", "withdrawn"],
  qualified: ["kyc_in_progress", "declined"],
  kyc_in_progress: ["kyc_completed", "declined"],
  kyc_completed: ["risk_assessment", "declined"],
  risk_assessment: ["risk_completed", "declined"],
  risk_completed: ["decision_pending", "accepted", "declined"],
  decision_pending: ["accepted", "declined", "withdrawn"],
  accepted: ["withdrawn"],
  declined: [],
  withdrawn: [],
};

function assertValidTransition(current: string, next: string): void {
  const allowed = VALID_TRANSITIONS[current];
  if (!allowed?.includes(next)) {
    throw new Error(
      `Invalid prospect status transition: ${current} → ${next}. Allowed: ${(allowed ?? []).join(", ") || "none"}`,
    );
  }
}

// ─── Engine ───

class ClientAcceptanceEngineImpl {
  // ==================== Prospect ───

  async createProspect(
    actor: AuditActor,
    data: {
      organizationId: string;
      companyName: string;
      registrationNumber?: string;
      jurisdiction?: string;
      industry?: string;
      source?: string;
      contactName?: string;
      contactEmail?: string;
      contactPhone?: string;
      estimatedFee?: number;
      estimatedFeeCurrency?: string;
      referredBy?: string;
      referralNotes?: string;
    },
  ) {
    const prospect = await prisma.clientProspect.create({
      data: {
        organizationId: data.organizationId,
        companyName: data.companyName,
        registrationNumber: data.registrationNumber,
        jurisdiction: data.jurisdiction,
        industry: data.industry,
        source: data.source,
        contactName: data.contactName,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone,
        estimatedFee: data.estimatedFee,
        estimatedFeeCurrency: data.estimatedFeeCurrency,
        referredBy: data.referredBy,
        referralNotes: data.referralNotes,
        createdById: actor.actorId,
        status: "new",
      },
    });

    await this.audit(actor, "prospect.created", {
      prospectId: prospect.id,
      companyName: data.companyName,
      source: data.source,
    });

    return prospect;
  }

  async updateProspect(
    id: string,
    data: {
      status?: string;
      companyName?: string;
      registrationNumber?: string;
      contactEmail?: string;
      contactPhone?: string;
    },
  ) {
    const current = await prisma.clientProspect.findUniqueOrThrow({
      where: { id },
    });

    if (data.status) {
      assertValidTransition(current.status, data.status);
    }

    return prisma.clientProspect.update({
      where: { id },
      data: { ...data },
    });
  }

  async getProspect(id: string) {
    return prisma.clientProspect.findUnique({
      where: { id },
      include: {
        kycPackage: true,
        riskAssessment: true,
        decisions: { orderBy: { createdAt: "desc" } },
      },
    });
  }

  async listProspects(organizationId: string, status?: string) {
    return prisma.clientProspect.findMany({
      where: {
        organizationId,
        ...(status ? { status } : {}),
      },
      include: { kycPackage: true, riskAssessment: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async getPipeline(organizationId: string) {
    const prospects = await prisma.clientProspect.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
    });

    const pipeline: Record<string, number> = {};
    for (const p of prospects) {
      pipeline[p.status] = (pipeline[p.status] ?? 0) + 1;
    }

    return {
      total: prospects.length,
      pipeline,
      recent: prospects.slice(0, 10),
    };
  }

  // ==================== KYC ───

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

    const kycData = {
      ownershipStructure: (data.ownershipStructure ?? undefined) as unknown as Prisma.InputJsonValue | undefined,
      financialHealth: (data.financialHealth ?? undefined) as unknown as Prisma.InputJsonValue | undefined,
      litigationHistory: (data.litigationHistory ?? undefined) as unknown as Prisma.InputJsonValue | undefined,
    };

    if (existing) {
      const pkg = await prisma.kycPackage.update({
        where: { prospectId },
        data: { ...kycData },
      });

      await this.audit(actor, "kyc.updated", { prospectId });

      return pkg;
    }

    const pkg = await prisma.kycPackage.create({
      data: {
        prospectId,
        ...kycData,
        status: "pending",
      },
    });

    await this.updateProspect(prospectId, { status: "kyc_completed" });
    await this.audit(actor, "kyc.created", { prospectId, kycPackageId: pkg.id });

    return pkg;
  }

  // ==================== Risk Assessment ───

  async assessRisk(
    actor: AuditActor,
    input: {
      prospectId: string;
      assessmentType: string;
      clientId?: string;
      riskFactors: Array<{ name: string; weight: number; score: number; rationale: string }>;
      mitigatingFactors?: string[];
    },
  ) {
    const overallScore = input.riskFactors.length > 0
      ? Math.round(
          input.riskFactors.reduce((sum, f) => sum + f.score * f.weight, 0) /
            input.riskFactors.reduce((sum, f) => sum + f.weight, 1),
        )
      : 0;

    const overallLevel: RiskLevel =
      overallScore >= 75 ? "high" : overallScore >= 50 ? "medium" : "low";

    const assessment = await prisma.clientRiskAssessment.create({
      data: {
        prospectId: input.prospectId,
        clientId: input.clientId,
        assessmentType: input.assessmentType,
        overallRiskLevel: overallLevel,
        overallRiskScore: overallScore,
        riskFactors: input.riskFactors as unknown as Prisma.InputJsonValue,
        mitigatingFactors: (input.mitigatingFactors ?? undefined) as unknown as Prisma.InputJsonValue,
        assessedById: actor.actorId,
        assessedAt: new Date(),
        status: "draft",
      },
    });

    await this.updateProspect(input.prospectId, { status: "risk_assessment" });
    await this.audit(actor, "risk_assessment.created", {
      prospectId: input.prospectId,
      assessmentId: assessment.id,
      overallRiskLevel: overallLevel,
    });

    return assessment;
  }

  async reviewRiskAssessment(actor: AuditActor, assessmentId: string) {
    const assessment = await prisma.clientRiskAssessment.update({
      where: { id: assessmentId },
      data: {
        status: "completed",
        reviewedById: actor.actorId,
        reviewedAt: new Date(),
      },
    });

    await this.audit(actor, "risk_assessment.reviewed", {
      assessmentId,
      prospectId: assessment.prospectId,
    });

    return assessment;
  }

  async approveRiskAssessment(actor: AuditActor, assessmentId: string) {
    const assessment = await prisma.clientRiskAssessment.update({
      where: { id: assessmentId },
      data: {
        status: "completed",
        reviewedById: actor.actorId,
        reviewedAt: new Date(),
      },
    });

    await this.updateProspect(assessment.prospectId, { status: "risk_completed" });
    await this.audit(actor, "risk_assessment.approved", {
      assessmentId,
      prospectId: assessment.prospectId,
    });

    return assessment;
  }

  // ==================== Decision ───

  async makeDecision(
    actor: AuditActor,
    input: {
      prospectId: string;
      clientId?: string;
      decisionType: string;
      decision: string;
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
        conditions: (input.conditions ?? undefined) as unknown as Prisma.InputJsonValue,
        effectiveDate: input.effectiveDate,
        expiryDate: input.expiryDate,
        approvedById: actor.actorId,
        approvedAt: new Date(),
        createdById: actor.actorId,
      },
    });

    const statusMap: Record<string, string> = {
      accept: "accepted",
      accept_with_conditions: "accepted",
      decline: "declined",
      withdraw: "withdrawn",
    };

    if (statusMap[input.decision]) {
      await this.updateProspect(input.prospectId, { status: statusMap[input.decision] });
    }

    await this.audit(actor, "prospect.decision_made", {
      prospectId: input.prospectId,
      decisionId: decision.id,
      decision: input.decision,
    });

    return decision;
  }

  async getDecisions(prospectId: string) {
    return prisma.acceptanceDecision.findMany({
      where: { prospectId },
      orderBy: { createdAt: "desc" },
    });
  }

  // ==================== Continuance Review ───

  async createContinuanceReview(
    actor: AuditActor,
    data: {
      organizationId: string;
      clientId: string;
      reviewYear: number;
      engagementHistory?: Record<string, unknown>;
      feeHistory?: Record<string, unknown>;
      clientChanges?: Record<string, unknown>;
    },
  ) {
    const review = await prisma.continuanceReview.create({
      data: {
        organizationId: data.organizationId,
        clientId: data.clientId,
        reviewYear: data.reviewYear,
        engagementHistory: (data.engagementHistory ?? undefined) as unknown as Prisma.InputJsonValue,
        feeHistory: (data.feeHistory ?? undefined) as unknown as Prisma.InputJsonValue,
        clientChanges: (data.clientChanges ?? undefined) as unknown as Prisma.InputJsonValue,
        status: "pending",
        createdById: actor.actorId,
      },
    });

    await this.audit(actor, "continuance_review.created", {
      reviewId: review.id,
      clientId: data.clientId,
      reviewYear: data.reviewYear,
    });

    return review;
  }

  async completeContinuanceReview(
    actor: AuditActor,
    reviewId: string,
    decision: string,
    rationale: string,
    riskReassessmentId?: string,
  ) {
    const review = await prisma.continuanceReview.update({
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

    await this.audit(actor, "continuance_review.completed", {
      reviewId,
      clientId: review.clientId,
      decision,
    });

    return review;
  }

  async listContinuanceReviews(clientId: string) {
    return prisma.continuanceReview.findMany({
      where: { clientId },
      orderBy: { reviewYear: "desc" },
    });
  }

  // ─── Private ───

  private async audit(
    actor: AuditActor,
    eventType: string,
    metadata?: Record<string, unknown>,
  ) {
    const now = new Date();
    const safe = await recordAuditEvent({
      engagementId: metadata?.prospectId as string ?? metadata?.clientId as string ?? "unknown",
      eventType,
      actorId: actor.actorId,
      actorName: actor.actorName,
      actorRole: actor.actorRole,
      targetType: "client_prospect",
      targetId: metadata?.prospectId as string ?? metadata?.reviewId as string ?? "unknown",
      newState: eventType,
      description: `[ClientAcceptance] ${eventType}`,
      aiRelated: false,
      metadata: (metadata ?? {}) as Record<string, unknown>,
    }).catch(() => null);
    return safe;
  }
}

// Singleton instance
export const clientAcceptanceEngine = new ClientAcceptanceEngineImpl();
