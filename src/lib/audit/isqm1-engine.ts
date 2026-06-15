// ─── AuditOS L6.7 ISQM1 Quality Engine ───
// محرك الجودة لإدارة نظام الجودة في المنشأة
// ISQM1 / ISA 220 compliant

import "server-only";
import { prisma } from "@/lib/prisma";
import type { AuditActor } from "./actor-context";
import { recordAuditEvent } from "./services";

// ─── Types ───

export type QualityObjectiveType = "firm" | "engagement";
export type QualityCategory =
  | "leadership"
  | "ethical"
  | "acceptance"
  | "resources"
  | "engagement_performance"
  | "monitoring";
export type QualityStatus = "active" | "archived";
export type RiskStatus = "identified" | "assessed" | "mitigated" | "re_assessed";
export type ResponseStatus = "designed" | "implemented" | "operating" | "not_effective";
export type MonitorStatus = "planned" | "in_progress" | "completed" | "overdue";
export type FindingStatus = "identified" | "investigated" | "remediating" | "closed";
export type RemediationStatus = "planned" | "in_progress" | "completed" | "verified" | "closed";
export type FindingSeverity = "minor" | "significant" | "material";
export type FindingType = "deficiency" | "improvement_opportunity" | "good_practice";

// ─── ISQM1 Category Reference ───

export const ISQM1_CATEGORIES: { category: QualityCategory; label: string; reference: string }[] = [
  { category: "leadership", label: "القيادة والمسؤولية", reference: "ISQM1.21-24" },
  { category: "ethical", label: "المتطلبات الأخلاقية", reference: "ISQM1.25-27" },
  { category: "acceptance", label: "قبول العملاء والاستمرار", reference: "ISQM1.28-30" },
  { category: "resources", label: "الموارد البشرية والتقنية", reference: "ISQM1.31-33" },
  { category: "engagement_performance", label: "أداء المهام", reference: "ISQM1.34-36" },
  { category: "monitoring", label: "المراقبة والتقييم", reference: "ISQM1.37-42" },
];

// ─── Service ───

export class Isqm1Engine {
  // ==================== Quality Objectives ====================

  async createObjective(
    actor: AuditActor,
    data: {
      organizationId: string;
      objectiveType: QualityObjectiveType;
      category: QualityCategory;
      reference?: string;
      description: string;
      targetState?: string;
      effectiveDate?: Date;
      reviewDate?: Date;
    },
  ) {
    const objective = await prisma.qualityObjective.create({
      data: {
        organizationId: data.organizationId,
        objectiveType: data.objectiveType,
        category: data.category,
        reference: data.reference,
        description: data.description,
        targetState: data.targetState,
        effectiveDate: data.effectiveDate,
        reviewDate: data.reviewDate,
        createdById: actor.actorId,
      },
    });

    await this.audit(actor, "quality.objective.created", data.organizationId, {
      objectiveId: objective.id,
      category: data.category,
    });

    return objective;
  }

  async updateObjective(
    actor: AuditActor,
    id: string,
    data: Partial<{
      description: string;
      targetState: string;
      status: QualityStatus;
      reviewDate: Date;
    }>,
  ) {
    const objective = await prisma.qualityObjective.update({
      where: { id },
      data,
    });

    await this.audit(actor, "quality.objective.updated", objective.organizationId, {
      objectiveId: id,
      changes: Object.keys(data),
    });

    return objective;
  }

  async getObjective(id: string) {
    return prisma.qualityObjective.findUnique({
      where: { id },
      include: { risks: { include: { responses: true } } },
    });
  }

  async listObjectives(organizationId: string, category?: QualityCategory) {
    return prisma.qualityObjective.findMany({
      where: {
        organizationId,
        ...(category ? { category } : {}),
      },
      include: { risks: true },
      orderBy: { createdAt: "desc" },
    });
  }

  // ==================== Quality Risks ====================

  async createRisk(
    actor: AuditActor,
    data: {
      organizationId: string;
      objectiveId: string;
      riskDescription: string;
      riskCategory?: string;
      inherentRisk?: string;
    },
  ) {
    const risk = await prisma.qualityRisk.create({
      data: {
        organizationId: data.organizationId,
        objectiveId: data.objectiveId,
        riskDescription: data.riskDescription,
        riskCategory: data.riskCategory,
        inherentRisk: data.inherentRisk ?? "medium",
        status: "identified",
        lastAssessmentDate: new Date(),
        createdById: actor.actorId,
      },
    });

    await this.audit(actor, "quality.risk.created", data.organizationId, {
      riskId: risk.id,
      objectiveId: data.objectiveId,
    });

    return risk;
  }

  async assessRisk(
    actor: AuditActor,
    id: string,
    data: {
      inherentRisk?: string;
      residualRisk?: string;
      residualRiskAssessment?: string;
      nextAssessmentDate?: Date;
    },
  ) {
    const risk = await prisma.qualityRisk.update({
      where: { id },
      data: {
        ...data,
        status: "assessed",
        lastAssessmentDate: new Date(),
      },
    });

    await this.audit(actor, "quality.risk.assessed", risk.organizationId, {
      riskId: id,
      inherentRisk: data.inherentRisk,
      residualRisk: data.residualRisk,
    });

    return risk;
  }

  async listRisks(organizationId: string, objectiveId?: string) {
    return prisma.qualityRisk.findMany({
      where: {
        organizationId,
        ...(objectiveId ? { objectiveId } : {}),
      },
      include: { objective: true, responses: true },
      orderBy: { createdAt: "desc" },
    });
  }

  // ==================== Quality Responses ====================

  async createResponse(
    actor: AuditActor,
    data: {
      organizationId: string;
      riskId: string;
      responseType: string;
      responseDescription: string;
      responsiblePersonId?: string;
    },
  ) {
    const response = await prisma.qualityResponse.create({
      data: {
        organizationId: data.organizationId,
        riskId: data.riskId,
        responseType: data.responseType,
        responseDescription: data.responseDescription,
        responsiblePersonId: data.responsiblePersonId,
        createdById: actor.actorId,
      },
    });

    await this.audit(actor, "quality.response.created", data.organizationId, {
      responseId: response.id,
      riskId: data.riskId,
    });

    return response;
  }

  async updateResponseStatus(
    actor: AuditActor,
    id: string,
    status: ResponseStatus,
    evaluation?: string,
  ) {
    const response = await prisma.qualityResponse.update({
      where: { id },
      data: {
        implementationStatus: status,
        ...(evaluation ? { effectivenessEvaluation: evaluation, evaluationDate: new Date() } : {}),
      },
    });

    await this.audit(actor, "quality.response.status.updated", response.organizationId, {
      responseId: id,
      newStatus: status,
    });

    return response;
  }

  async listResponses(organizationId: string, riskId?: string) {
    return prisma.qualityResponse.findMany({
      where: {
        organizationId,
        ...(riskId ? { riskId } : {}),
      },
      include: { risk: true },
      orderBy: { createdAt: "desc" },
    });
  }

  // ==================== Monitoring Activities ====================

  async createMonitoringActivity(
    actor: AuditActor,
    data: {
      organizationId: string;
      activityType: string;
      scope?: string;
      frequency?: string;
      scheduledDate?: Date;
      performedById?: string;
    },
  ) {
    const activity = await prisma.qualityMonitoringActivity.create({
      data: {
        organizationId: data.organizationId,
        activityType: data.activityType,
        scope: data.scope,
        frequency: data.frequency,
        status: "planned",
        scheduledDate: data.scheduledDate,
        performedById: data.performedById,
        createdById: actor.actorId,
      },
    });

    await this.audit(actor, "quality.monitoring.created", data.organizationId, {
      activityId: activity.id,
      activityType: data.activityType,
    });

    return activity;
  }

  async updateMonitoringStatus(
    actor: AuditActor,
    id: string,
    status: MonitorStatus,
    completedDate?: Date,
  ) {
    const activity = await prisma.qualityMonitoringActivity.update({
      where: { id },
      data: {
        status,
        ...(completedDate ? { completedDate } : {}),
      },
    });

    await this.audit(actor, "quality.monitoring.status.updated", activity.organizationId, {
      activityId: id,
      newStatus: status,
    });

    return activity;
  }

  async listMonitoringActivities(organizationId: string, status?: MonitorStatus) {
    return prisma.qualityMonitoringActivity.findMany({
      where: {
        organizationId,
        ...(status ? { status } : {}),
      },
      include: { findings: true },
      orderBy: { scheduledDate: "asc" },
    });
  }

  // ==================== Quality Findings ====================

  async createFinding(
    actor: AuditActor,
    data: {
      organizationId: string;
      monitoringActivityId?: string;
      findingType: FindingType;
      severity: FindingSeverity;
      description: string;
      rootCause?: string;
      rootCauseAnalysis?: string;
      engagementId?: string;
    },
  ) {
    const finding = await prisma.qualityFinding.create({
      data: {
        organizationId: data.organizationId,
        monitoringActivityId: data.monitoringActivityId,
        findingType: data.findingType,
        severity: data.severity,
        description: data.description,
        rootCause: data.rootCause,
        rootCauseAnalysis: data.rootCauseAnalysis,
        engagementId: data.engagementId,
        status: "identified",
        createdById: actor.actorId,
      },
    });

    await this.audit(actor, "quality.finding.created", data.organizationId, {
      findingId: finding.id,
      findingType: data.findingType,
      severity: data.severity,
    });

    return finding;
  }

  async updateFindingStatus(actor: AuditActor, id: string, status: FindingStatus) {
    const finding = await prisma.qualityFinding.update({
      where: { id },
      data: { status },
    });

    await this.audit(actor, "quality.finding.status.updated", finding.organizationId, {
      findingId: id,
      newStatus: status,
    });

    return finding;
  }

  async listFindings(organizationId: string, status?: FindingStatus) {
    return prisma.qualityFinding.findMany({
      where: {
        organizationId,
        ...(status ? { status } : {}),
      },
      include: { remediation: true, monitoringActivity: true },
      orderBy: { createdAt: "desc" },
    });
  }

  // ==================== Remediation ====================

  async createRemediation(
    actor: AuditActor,
    data: {
      organizationId: string;
      findingId: string;
      actionDescription: string;
      actionType?: string;
      responsiblePersonId?: string;
      targetDate?: Date;
    },
  ) {
    const remediation = await prisma.qualityRemediation.create({
      data: {
        organizationId: data.organizationId,
        findingId: data.findingId,
        actionDescription: data.actionDescription,
        actionType: data.actionType ?? "corrective",
        responsiblePersonId: data.responsiblePersonId,
        targetDate: data.targetDate,
        createdById: actor.actorId,
      },
    });

    // Update finding status
    await prisma.qualityFinding.update({
      where: { id: data.findingId },
      data: { status: "remediating" },
    });

    await this.audit(actor, "quality.remediation.created", data.organizationId, {
      remediationId: remediation.id,
      findingId: data.findingId,
    });

    return remediation;
  }

  async updateRemediationStatus(
    actor: AuditActor,
    id: string,
    status: RemediationStatus,
    effectivenessResult?: string,
  ) {
    const data: Record<string, unknown> = { status };
    if (effectivenessResult) {
      data.effectivenessResult = effectivenessResult;
      data.effectivenessCheckDate = new Date();
    }
    if (status === "completed") data.completedDate = new Date();
    if (status === "verified" || status === "closed") {
      data.effectivenessCheckDate = new Date();
    }

    const remediation = await prisma.qualityRemediation.update({
      where: { id },
      data,
    });

    if (status === "closed") {
      await prisma.qualityFinding.update({
        where: { id: remediation.findingId },
        data: { status: "closed" },
      });
    }

    await this.audit(actor, "quality.remediation.status.updated", remediation.organizationId, {
      remediationId: id,
      newStatus: status,
    });

    return remediation;
  }

  async listRemediations(organizationId: string, status?: RemediationStatus) {
    return prisma.qualityRemediation.findMany({
      where: {
        organizationId,
        ...(status ? { status } : {}),
      },
      include: { finding: true },
      orderBy: { createdAt: "desc" },
    });
  }

  // ==================== System Evaluation ====================

  async createOrUpdateEvaluation(
    actor: AuditActor,
    data: {
      organizationId: string;
      year: number;
      systemEffectiveness: string;
      overallConclusion?: string;
      summaryOfFindings?: string;
      keyStrengths?: string;
      keyWeaknesses?: string;
      nextEvaluationDate?: Date;
    },
  ) {
    const existing = await prisma.qualitySystemEvaluation.findUnique({
      where: { organizationId_year: { organizationId: data.organizationId, year: data.year } },
    });

    const evaluation = existing
      ? await prisma.qualitySystemEvaluation.update({
          where: { id: existing.id },
          data: {
            ...data,
            approvedById: actor.actorId,
            approvedAt: new Date(),
          },
        })
      : await prisma.qualitySystemEvaluation.create({
          data: {
            ...data,
            approvedById: actor.actorId,
            approvedAt: new Date(),
          },
        });

    await this.audit(actor, "quality.evaluation.completed", data.organizationId, {
      evaluationId: evaluation.id,
      year: data.year,
      effectiveness: data.systemEffectiveness,
    });

    return evaluation;
  }

  async getEvaluation(organizationId: string, year: number) {
    return prisma.qualitySystemEvaluation.findUnique({
      where: { organizationId_year: { organizationId, year } },
    });
  }

  async listEvaluations(organizationId: string) {
    return prisma.qualitySystemEvaluation.findMany({
      where: { organizationId },
      orderBy: { year: "desc" },
    });
  }

  // ==================== Dashboard / Summary ====================

  async getDashboard(organizationId: string) {
    const [
      objectives,
      risks,
      responses,
      monitoring,
      findings,
      remediations,
      evaluations,
    ] = await Promise.all([
      prisma.qualityObjective.count({ where: { organizationId } }),
      prisma.qualityRisk.count({ where: { organizationId } }),
      prisma.qualityResponse.count({ where: { organizationId } }),
      prisma.qualityMonitoringActivity.findMany({
        where: { organizationId },
        select: { status: true },
      }),
      prisma.qualityFinding.findMany({
        where: { organizationId },
        select: { severity: true, status: true },
      }),
      prisma.qualityRemediation.findMany({
        where: { organizationId },
        select: { status: true },
      }),
      prisma.qualitySystemEvaluation.findFirst({
        where: { organizationId },
        orderBy: { year: "desc" },
      }),
    ]);

    return {
      totalObjectives: objectives,
      totalRisks: risks,
      totalResponses: responses,
      monitoringByStatus: monitoring.reduce(
        (acc, m) => {
          acc[m.status] = (acc[m.status] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      ),
      findingsBySeverity: findings.reduce(
        (acc, f) => {
          acc[f.severity] = (acc[f.severity] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      ),
      findingsByStatus: findings.reduce(
        (acc, f) => {
          acc[f.status] = (acc[f.status] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      ),
      remediationsByStatus: remediations.reduce(
        (acc, r) => {
          acc[r.status] = (acc[r.status] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      ),
      latestEvaluation: evaluations,
    };
  }

  // ==================== ISQM1 Categories ====================

  getCategories() {
    return ISQM1_CATEGORIES;
  }

  // ==================== Private Helpers ====================

  private async audit(
    actor: AuditActor,
    action: string,
    organizationId: string,
    metadata?: Record<string, unknown>,
  ) {
    await recordAuditEvent({
      engagementId: "",
      eventType: action,
      actorId: actor.actorId,
      actorName: actor.actorName,
      actorRole: actor.actorRole,
      targetType: "organization",
      targetId: organizationId,
      newState: action,
      description: `[ISQM1] ${action}`,
      aiRelated: false,
      metadata,
    });
  }
}

export const isqm1Engine = new Isqm1Engine();
