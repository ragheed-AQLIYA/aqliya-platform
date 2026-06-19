'use server'

import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import {
  createRiskModel,
  getRiskModel,
  listRiskModels,
  assessRisk,
  getAssessment,
  getAssessmentsByEngagement,
  getRiskProcedures,
  updateProcedure,
  verifyOrgAccess,
  transitionAssessmentStatus,
} from '@/lib/platform/audit-risk'
import type {
  CreateRiskModelData,
  CreateAssessmentData,
  UpdateProcedureData,
} from '@/lib/platform/audit-risk'
import { writePlatformAuditLog } from '@/lib/platform/audit-log'

export type ActionResult<T = unknown> =
  | { ok: true; data: T }
  | { ok: false; error: string }

export async function listRiskModelsAction(): Promise<ActionResult> {
  try {
    const user = await getCurrentUser()
    const models = await listRiskModels(user.organizationId)
    return { ok: true, data: models }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

export async function getRiskModelAction(modelId: string): Promise<ActionResult> {
  try {
    const user = await getCurrentUser()
    const model = await getRiskModel(modelId)
    if (!model) return { ok: false, error: 'النموذج غير موجود' }
    const hasAccess = await verifyOrgAccess('model', modelId, user.organizationId)
    if (!hasAccess) return { ok: false, error: 'وصول مرفوض' }
    return { ok: true, data: model }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

export async function createRiskModelAction(data: CreateRiskModelData): Promise<ActionResult> {
  try {
    const user = await getCurrentUser()
    const model = await createRiskModel(user.organizationId, data, user.id)
    return { ok: true, data: model }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

export async function listAssessmentsAction(): Promise<ActionResult> {
  try {
    const user = await getCurrentUser()
    const engagements = await prisma.auditEngagement.findMany({
      where: { organizationId: user.organizationId },
      select: { id: true },
    })
    const all = await Promise.all(
      engagements.map(e => getAssessmentsByEngagement(e.id))
    )
    return { ok: true, data: all.flat() }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

export async function getAssessmentAction(assessmentId: string): Promise<ActionResult> {
  try {
    const user = await getCurrentUser()
    const assessment = await getAssessment(assessmentId)
    if (!assessment) return { ok: false, error: 'التقييم غير موجود' }
    const hasAccess = await verifyOrgAccess('assessment', assessmentId, user.organizationId)
    if (!hasAccess) return { ok: false, error: 'وصول مرفوض' }
    const procedures = await getRiskProcedures(assessmentId)
    return { ok: true, data: { assessment, procedures } }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

export async function createAssessmentAction(
  modelId: string,
  engagementId: string,
  data: CreateAssessmentData
): Promise<ActionResult> {
  try {
    const user = await getCurrentUser()
    let resolvedEngagementId = engagementId
    if (!resolvedEngagementId || resolvedEngagementId === 'engagement-placeholder') {
      const engagements = await prisma.auditEngagement.findMany({
        where: { organizationId: user.organizationId },
        select: { id: true },
        take: 1,
      })
      if (engagements.length === 0) {
        return { ok: false, error: 'لا توجد مهمة تدقيق متاحة. أنشئ مهمة أولاً.' }
      }
      resolvedEngagementId = engagements[0].id
    }
    const assessment = await assessRisk(modelId, resolvedEngagementId, data, user.id)
    return { ok: true, data: assessment }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

export async function updateProcedureAction(
  procedureId: string,
  data: UpdateProcedureData
): Promise<ActionResult> {
  try {
    const user = await getCurrentUser()
    const hasAccess = await verifyOrgAccess('procedure', procedureId, user.organizationId)
    if (!hasAccess) return { ok: false, error: 'وصول مرفوض' }
    const updated = await updateProcedure(procedureId, data)
    return { ok: true, data: updated }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

export type DashboardStats = {
  totalModels: number;
  totalAssessments: number;
  pendingReview: number;
  approved: number;
  highCritical: number;
  lowMedium: number;
  assessmentsByLevel: { level: string; count: number }[];
  recentAssessments: Array<{ id: string; title: string; status: string; inherentLevel: string | null; createdAt: Date }>;
};

export async function getRiskDashboardStatsAction(): Promise<ActionResult<DashboardStats>> {
  try {
    const user = await getCurrentUser();
    const orgId = user.organizationId;
    const [models, engagements] = await Promise.all([
      listRiskModels(orgId),
      prisma.auditEngagement.findMany({ where: { organizationId: orgId }, select: { id: true } }),
    ]);
    const allAssessments = (await Promise.all(
      engagements.map((e) => getAssessmentsByEngagement(e.id)),
    )).flat();

    const pendingReview = allAssessments.filter((a) => a.status === "draft" || a.status === "reviewed").length;
    const approved = allAssessments.filter((a) => a.status === "approved").length;
    const highCritical = allAssessments.filter(
      (a) => a.inherentLevel === "HIGH" || a.inherentLevel === "CRITICAL",
    ).length;
    const lowMedium = allAssessments.filter(
      (a) => a.inherentLevel === "LOW" || a.inherentLevel === "MEDIUM",
    ).length;

    const levelCounts: Record<string, number> = {};
    for (const a of allAssessments) {
      if (a.inherentLevel) levelCounts[a.inherentLevel] = (levelCounts[a.inherentLevel] ?? 0) + 1;
    }

    return {
      ok: true,
      data: {
        totalModels: models.length,
        totalAssessments: allAssessments.length,
        pendingReview,
        approved,
        highCritical,
        lowMedium,
        assessmentsByLevel: Object.entries(levelCounts).map(([level, count]) => ({ level, count })),
        recentAssessments: allAssessments
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 10)
          .map((a) => ({
            id: a.id,
            title: a.title,
            status: a.status,
            inherentLevel: a.inherentLevel,
            createdAt: a.createdAt,
          })),
      },
    };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function transitionAssessmentAction(
  assessmentId: string,
  targetStatus: string
): Promise<ActionResult> {
  try {
    const user = await getCurrentUser()
    const updated = await transitionAssessmentStatus(assessmentId, targetStatus, user.id)
    return { ok: true, data: updated }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

export type AuditTrailEntry = {
  id: string;
  action: string;
  actorId: string | null;
  actorName: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
};

export async function getAssessmentAuditTrailAction(assessmentId: string): Promise<ActionResult<AuditTrailEntry[]>> {
  try {
    const user = await getCurrentUser()
    const hasAccess = await verifyOrgAccess('assessment', assessmentId, user.organizationId)
    if (!hasAccess) return { ok: false, error: 'وصول مرفوض' }
    const events = await prisma.platformAuditLog.findMany({
      where: {
        targetType: 'auditRiskAssessment',
        targetId: assessmentId,
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        action: true,
        actorId: true,
        actorName: true,
        metadata: true,
        createdAt: true,
      },
    })
    const mapped: AuditTrailEntry[] = events.map(e => ({
      ...e,
      metadata: e.metadata as Record<string, unknown> | null,
    }))
    return { ok: true, data: mapped }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

export async function getAssessmentProceduresAction(assessmentId: string): Promise<ActionResult> {
  try {
    const user = await getCurrentUser()
    const hasAccess = await verifyOrgAccess('assessment', assessmentId, user.organizationId)
    if (!hasAccess) return { ok: false, error: 'وصول مرفوض' }
    const procedures = await getRiskProcedures(assessmentId)
    return { ok: true, data: procedures }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

export async function exportAssessmentAction(assessmentId: string): Promise<ActionResult> {
  try {
    const user = await getCurrentUser()
    const assessment = await getAssessment(assessmentId)
    if (!assessment) return { ok: false, error: 'التقييم غير موجود' }
    const hasAccess = await verifyOrgAccess('assessment', assessmentId, user.organizationId)
    if (!hasAccess) return { ok: false, error: 'وصول مرفوض' }
    const procedures = await getRiskProcedures(assessmentId)

    const exportData = {
      title: assessment.title,
      assessedAt: assessment.assessedAt,
      status: assessment.status,
      inherentScore: assessment.inherentScore,
      inherentLevel: assessment.inherentLevel,
      residualScore: assessment.residualScore,
      residualLevel: assessment.residualLevel,
      riskResponse: assessment.riskResponse,
      responseNotes: assessment.responseNotes,
      categoryScores: assessment.categoryScores,
      procedures: procedures.map(p => ({
        code: p.procedureCode,
        description: p.description,
        category: p.riskCategory,
        steps: p.procedureSteps,
        evidenceRequired: p.evidenceRequired,
        status: p.status,
      })),
      exportedAt: new Date().toISOString(),
      exportedBy: user.id,
    }

    await writePlatformAuditLog({
      productKey: 'audit',
      action: 'RISK_ASSESSMENT_EXPORTED',
      targetType: 'auditRiskAssessment',
      targetId: assessment.id,
      actorId: user.id,
      metadata: { exportFormat: 'json' },
    })

    return { ok: true, data: exportData }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}
