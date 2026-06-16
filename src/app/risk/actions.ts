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
