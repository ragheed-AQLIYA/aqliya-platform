import 'server-only'

import { prisma } from '@/lib/prisma'
import { writePlatformAuditLog } from '@/lib/platform/audit-log'
import { GOV_STRINGS } from './gov-strings'

export type GovAction = 'SUBMIT' | 'APPROVE' | 'REJECT' | 'EXPORT' | 'ARCHIVE'

const TRANSITIONS: Record<GovAction, { from: string[]; to: string }> = {
  SUBMIT: { from: ['DRAFT'], to: 'IN_REVIEW' },
  APPROVE: { from: ['IN_REVIEW'], to: 'APPROVED' },
  REJECT: { from: ['IN_REVIEW'], to: 'REJECTED' },
  EXPORT: { from: ['APPROVED'], to: 'APPROVED' },
  ARCHIVE: { from: ['APPROVED', 'REJECTED'], to: 'ARCHIVED' },
}

export class DecisionGovError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'DecisionGovError'
  }
}

export interface GateResult {
  allowed: boolean
  reason?: string
}

export interface DecisionGovEvent {
  id: string
  decisionId: string
  action: string
  fromStatus: string
  toStatus: string
  userId: string
  reason?: string | null
  reviewNotes?: string | null
  escalationRuleId?: string | null
  metadata?: Record<string, unknown> | null
  createdAt: Date
}

export interface EscalationCheck {
  decisionId: string
  decisionTitle: string
  escalationRuleId: string
  targetRoleSlug: string
  deadlinePassedAt: Date
}

export interface CreateEscalationRuleData {
  decisionTemplateId?: string
  escalateAfterHours: number
  targetRoleSlug: string
  isActive?: boolean
}

// ─── Gate Check ───

export async function checkGate(
  decisionId: string,
  action: GovAction,
  userId: string,
): Promise<GateResult> {
  const decision = await prisma.decision.findUnique({
    where: { id: decisionId },
    select: { id: true, status: true, ownerId: true },
  })

  if (!decision) {
    return { allowed: false, reason: GOV_STRINGS.error.DECISION_NOT_FOUND }
  }

  const transition = TRANSITIONS[action]

  if (!transition.from.includes(decision.status)) {
    return { allowed: false, reason: GOV_STRINGS.error.INVALID_TRANSITION }
  }

  if (action === 'APPROVE' && decision.ownerId === userId) {
    return { allowed: false, reason: GOV_STRINGS.error.AUTHOR_CANNOT_APPROVE }
  }

  if (action === 'REJECT') {
    return { allowed: true }
  }

  return { allowed: true }
}

// ─── Status Transitions ───

export async function submitForReview(
  decisionId: string,
  userId: string,
): Promise<DecisionGovEvent> {
  const gate = await checkGate(decisionId, 'SUBMIT', userId)
  if (!gate.allowed) {
    throw new DecisionGovError(gate.reason ?? GOV_STRINGS.error.INVALID_TRANSITION)
  }

  await prisma.decision.update({
    where: { id: decisionId },
    data: { status: 'IN_REVIEW', reviewerId: userId },
  })

  const event = await createGovEvent({
    decisionId,
    action: 'SUBMIT',
    fromStatus: 'DRAFT',
    toStatus: 'IN_REVIEW',
    userId,
  })

  await writePlatformAuditLog({
    productKey: 'decision',
    action: 'SUBMITTED_FOR_REVIEW',
    targetType: 'decision',
    targetId: decisionId,
    actorId: userId,
    metadata: { fromStatus: 'DRAFT', toStatus: 'IN_REVIEW' },
  })

  return event
}

export async function approve(
  decisionId: string,
  userId: string,
  reviewNotes?: string,
): Promise<DecisionGovEvent> {
  const gate = await checkGate(decisionId, 'APPROVE', userId)
  if (!gate.allowed) {
    throw new DecisionGovError(gate.reason ?? GOV_STRINGS.error.INVALID_TRANSITION)
  }

  await prisma.decision.update({
    where: { id: decisionId },
    data: { status: 'APPROVED', approverId: userId },
  })

  const event = await createGovEvent({
    decisionId,
    action: 'APPROVE',
    fromStatus: 'IN_REVIEW',
    toStatus: 'APPROVED',
    userId,
    reviewNotes,
  })

  await writePlatformAuditLog({
    productKey: 'decision',
    action: 'DECISION_APPROVED',
    targetType: 'decision',
    targetId: decisionId,
    actorId: userId,
    metadata: { reviewNotes },
  })

  return event
}

export async function reject(
  decisionId: string,
  userId: string,
  reason: string,
  reviewNotes?: string,
): Promise<DecisionGovEvent> {
  if (!reason || reason.trim().length === 0) {
    throw new DecisionGovError(GOV_STRINGS.error.REASON_REQUIRED)
  }

  const gate = await checkGate(decisionId, 'REJECT', userId)
  if (!gate.allowed) {
    throw new DecisionGovError(gate.reason ?? GOV_STRINGS.error.INVALID_TRANSITION)
  }

  await prisma.decision.update({
    where: { id: decisionId },
    data: { status: 'REJECTED' },
  })

  const event = await createGovEvent({
    decisionId,
    action: 'REJECT',
    fromStatus: 'IN_REVIEW',
    toStatus: 'REJECTED',
    userId,
    reason,
    reviewNotes,
  })

  await writePlatformAuditLog({
    productKey: 'decision',
    action: 'DECISION_REJECTED',
    targetType: 'decision',
    targetId: decisionId,
    actorId: userId,
    metadata: { reason, reviewNotes },
  })

  return event
}

export async function exportDecision(
  decisionId: string,
  userId: string,
): Promise<DecisionGovEvent> {
  const gate = await checkGate(decisionId, 'EXPORT', userId)
  if (!gate.allowed) {
    throw new DecisionGovError(gate.reason ?? GOV_STRINGS.error.NOT_APPROVED)
  }

  const event = await createGovEvent({
    decisionId,
    action: 'EXPORT',
    fromStatus: 'APPROVED',
    toStatus: 'APPROVED',
    userId,
  })

  await writePlatformAuditLog({
    productKey: 'decision',
    action: 'OUTPUT_PUBLISHED',
    targetType: 'decision',
    targetId: decisionId,
    actorId: userId,
    metadata: { action: 'EXPORT' },
  })

  return event
}

export async function archiveDecision(
  decisionId: string,
  userId: string,
): Promise<DecisionGovEvent> {
  const gate = await checkGate(decisionId, 'ARCHIVE', userId)
  if (!gate.allowed) {
    throw new DecisionGovError(gate.reason ?? GOV_STRINGS.error.INVALID_TRANSITION)
  }

  const decision = await prisma.decision.findUnique({
    where: { id: decisionId },
    select: { status: true },
  })

  if (!decision) {
    throw new DecisionGovError(GOV_STRINGS.error.DECISION_NOT_FOUND)
  }

  const fromStatus = decision.status

  await prisma.decision.update({
    where: { id: decisionId },
    data: { status: 'ARCHIVED' },
  })

  const event = await createGovEvent({
    decisionId,
    action: 'ARCHIVE',
    fromStatus,
    toStatus: 'ARCHIVED',
    userId,
  })

  await writePlatformAuditLog({
    productKey: 'decision',
    action: 'DECISION_UPDATED',
    targetType: 'decision',
    targetId: decisionId,
    actorId: userId,
    metadata: { fromStatus, toStatus: 'ARCHIVED' },
  })

  return event
}

// ─── Escalation Rules ───

export async function createEscalationRule(
  orgId: string,
  data: CreateEscalationRuleData,
): Promise<{
  id: string
  organizationId: string
  decisionTemplateId: string | null
  escalateAfterHours: number
  targetRoleSlug: string
  isActive: boolean
  createdAt: Date
}> {
  if (!orgId) {
    throw new DecisionGovError(GOV_STRINGS.error.ORG_ID_REQUIRED)
  }

  const rule = await prisma.decisionEscalationRule.create({
    data: {
      organizationId: orgId,
      decisionTemplateId: data.decisionTemplateId ?? null,
      escalateAfterHours: data.escalateAfterHours,
      targetRoleSlug: data.targetRoleSlug,
      isActive: data.isActive ?? true,
      createdById: 'system',
    },
  })

  await writePlatformAuditLog({
    productKey: 'decision',
    action: 'DECISION_UPDATED',
    targetType: 'decisionEscalationRule',
    targetId: rule.id,
    actorId: 'system',
    metadata: { action: 'CREATE_ESCALATION_RULE', ...data },
  })

  return rule
}

export async function getActiveEscalations(): Promise<EscalationCheck[]> {
  const now = new Date()

  const activeRules = await prisma.decisionEscalationRule.findMany({
    where: { isActive: true },
  })

  const results: EscalationCheck[] = []

  for (const rule of activeRules) {
    const deadline = new Date(
      now.getTime() - rule.escalateAfterHours * 60 * 60 * 1000,
    )

    const overdueDecisions = await prisma.decision.findMany({
      where: {
        organizationId: rule.organizationId,
        status: 'IN_REVIEW',
        updatedAt: { lte: deadline },
        ...(rule.decisionTemplateId
          ? { id: rule.decisionTemplateId }
          : {}),
      },
      select: { id: true, title: true, updatedAt: true },
    })

    for (const d of overdueDecisions) {
      results.push({
        decisionId: d.id,
        decisionTitle: d.title,
        escalationRuleId: rule.id,
        targetRoleSlug: rule.targetRoleSlug,
        deadlinePassedAt: new Date(
          d.updatedAt.getTime() + rule.escalateAfterHours * 60 * 60 * 1000,
        ),
      })
    }
  }

  return results
}

export async function processEscalations(): Promise<number> {
  const escalations = await getActiveEscalations()
  let count = 0

  for (const esc of escalations) {
    const existingEvents = await prisma.decisionGovEvent.count({
      where: {
        decisionId: esc.decisionId,
        action: 'ESCALATE',
        escalationRuleId: esc.escalationRuleId,
      },
    })

    if (existingEvents > 0) {
      continue
    }

    await createGovEvent({
      decisionId: esc.decisionId,
      action: 'ESCALATE',
      fromStatus: 'IN_REVIEW',
      toStatus: 'IN_REVIEW',
      userId: 'system',
      escalationRuleId: esc.escalationRuleId,
      metadata: {
        targetRoleSlug: esc.targetRoleSlug,
        deadlinePassedAt: esc.deadlinePassedAt.toISOString(),
      },
    })

    await writePlatformAuditLog({
      productKey: 'decision',
      action: 'DECISION_UPDATED',
      targetType: 'decision',
      targetId: esc.decisionId,
      actorId: 'system',
      metadata: {
        action: 'ESCALATE',
        escalationRuleId: esc.escalationRuleId,
        targetRoleSlug: esc.targetRoleSlug,
      },
    })

    count++
  }

  return count
}

export async function getDecisionEventLog(
  decisionId: string,
): Promise<DecisionGovEvent[]> {
  const events = await prisma.decisionGovEvent.findMany({
    where: { decisionId },
    orderBy: { createdAt: 'asc' },
  })

  return events.map((e) => ({
    id: e.id,
    decisionId: e.decisionId,
    action: e.action,
    fromStatus: e.fromStatus,
    toStatus: e.toStatus,
    userId: e.userId,
    reason: e.reason ?? null,
    reviewNotes: e.reviewNotes ?? null,
    escalationRuleId: e.escalationRuleId ?? null,
    metadata: e.metadata as Record<string, unknown> | null,
    createdAt: e.createdAt,
  }))
}

// ─── Internal Helpers ───

async function createGovEvent(data: {
  decisionId: string
  action: string
  fromStatus: string
  toStatus: string
  userId: string
  reason?: string
  reviewNotes?: string
  escalationRuleId?: string
  metadata?: Record<string, unknown>
}): Promise<DecisionGovEvent> {
  const record = await prisma.decisionGovEvent.create({
    data: {
      decisionId: data.decisionId,
      action: data.action,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      fromStatus: data.fromStatus as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      toStatus: data.toStatus as any,
      userId: data.userId,
      reason: data.reason ?? null,
      reviewNotes: data.reviewNotes ?? null,
      escalationRuleId: data.escalationRuleId ?? null,
      metadata: (data.metadata ?? undefined) as any,
    },
  })

  return {
    id: record.id,
    decisionId: record.decisionId,
    action: record.action,
    fromStatus: record.fromStatus,
    toStatus: record.toStatus,
    userId: record.userId,
    reason: record.reason ?? null,
    reviewNotes: record.reviewNotes ?? null,
    escalationRuleId: record.escalationRuleId ?? null,
    metadata: record.metadata as Record<string, unknown> | null,
    createdAt: record.createdAt,
  }
}
