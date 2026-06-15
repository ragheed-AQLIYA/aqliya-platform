import { describe, expect, it, beforeEach, jest } from '@jest/globals'

// ─── Shared in-memory store for prisma mock ───
interface DecisionRecord {
  id: string; title: string; type: string; status: string
  ownerId: string; reviewerId: string | null; approverId: string | null
  organizationId: string; description: string
  createdAt: Date; updatedAt: Date
}
interface GovEventRecord {
  id: string; decisionId: string; action: string
  fromStatus: string; toStatus: string; userId: string
  reason: string | null; reviewNotes: string | null
  createdAt: Date
}
interface EscalationRuleRecord {
  id: string; organizationId: string; escalateAfterHours: number
  targetRoleSlug: string; isActive: boolean; createdById: string
  decisionTemplateId: string | null
  createdAt: Date; updatedAt: Date
}

const store: {
  decision: Map<string, DecisionRecord>
  decisionGovEvent: Map<string, GovEventRecord>
  decisionEscalationRule: Map<string, EscalationRuleRecord>
} = {
  decision: new Map(),
  decisionGovEvent: new Map(),
  decisionEscalationRule: new Map(),
}

let nextId = 1
function uid(): string { return `mock-id-${nextId++}` }
function now(): Date { return new Date() }

function mockModel<T extends { id: string }>(map: Map<string, T>) {
  return {
    findUnique: jest.fn(async ({ where: { id } }: { where: { id: string } }) => {
      return map.get(id) ?? null
    }),
    findMany: jest.fn(async ({ where, orderBy }: { where?: Record<string, unknown>; orderBy?: Record<string, string> } = {}) => {
      let items = Array.from(map.values())
      if (where) {
        for (const [key, val] of Object.entries(where)) {
          if (key === 'id') continue
          if (val && typeof val === 'object' && 'gte' in (val as object)) {
            const gte = (val as { gte: Date }).gte
            items = items.filter(i => (i as unknown as Record<string, Date>)[key] >= gte)
          } else if (val && typeof val === 'object' && 'lte' in (val as object)) {
            const lte = (val as { lte: Date }).lte
            items = items.filter(i => (i as unknown as Record<string, Date>)[key] <= lte)
          } else if (val !== undefined && val !== null) {
            items = items.filter(i => (i as unknown as Record<string, unknown>)[key] === val)
          }
        }
      }
      if (orderBy) {
        const [key, dir] = Object.entries(orderBy)[0]
        items.sort((a, b) => {
          const va = (a as unknown as Record<string, string | Date>)[key]
          const vb = (b as unknown as Record<string, string | Date>)[key]
          if (typeof va === 'string' && typeof vb === 'string') {
            return dir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va)
          }
          if (va instanceof Date && vb instanceof Date) {
            return dir === 'asc' ? va.getTime() - vb.getTime() : vb.getTime() - va.getTime()
          }
          return 0
        })
      }
      return items
    }),
    create: jest.fn(async ({ data }: { data: Record<string, unknown> }) => {
      const record = { id: (data.id as string) ?? uid(), createdAt: now(), updatedAt: now(), ...data } as unknown as T
      map.set(record.id, record)
      return record
    }),
    update: jest.fn(async ({ where: { id }, data }: { where: { id: string }; data: Record<string, unknown> }) => {
      const existing = map.get(id)
      if (!existing) throw new Error('Record not found')
      const updated = { ...existing, ...data, updatedAt: now() }
      map.set(id, updated)
      return updated
    }),
    deleteMany: jest.fn(async () => { map.clear(); return { count: 0 } }),
    count: jest.fn(async ({ where }: { where?: Record<string, unknown> } = {}) => {
      if (!where) return map.size
      let items = Array.from(map.values())
      for (const [key, val] of Object.entries(where)) {
        if (val && typeof val === 'object' && 'not' in (val as object)) {
          const notVal = (val as { not: unknown }).not
          items = items.filter(i => (i as unknown as Record<string, unknown>)[key] !== notVal)
        } else {
          items = items.filter(i => (i as unknown as Record<string, unknown>)[key] === val)
        }
      }
      return items.length
    }),
  }
}

// Mock prisma used by the source code
jest.mock("@/lib/prisma", () => ({
  prisma: {
    decision: mockModel(store.decision),
    decisionGovEvent: mockModel(store.decisionGovEvent),
    decisionEscalationRule: mockModel(store.decisionEscalationRule),
  },
}))

// Mock platform audit log
jest.mock("@/lib/platform/audit-log", () => ({
  writePlatformAuditLog: jest.fn(),
}))

import {
  checkGate,
  approve,
  reject,
  exportDecision,
  archiveDecision,
  createEscalationRule,
  getActiveEscalations,
  processEscalations,
  getDecisionEventLog,
  DecisionGovError,
} from '../index'
import { submitForReview } from '../decision-gov-service'

const { prisma } = jest.requireMock("@/lib/prisma") as { prisma: ReturnType<typeof mockModel> }

function seedDecision(overrides: Record<string, unknown> = {}) {
  return prisma.decision.create({
    data: {
      id: overrides.id as string | undefined ?? 'decision-1',
      title: (overrides.title as string) ?? 'Test Decision',
      type: 'TENDER',
      status: (overrides.status as string) ?? 'DRAFT',
      ownerId: (overrides.ownerId as string) ?? 'user-1',
      reviewerId: (overrides.reviewerId as string | undefined) ?? null,
      approverId: (overrides.approverId as string | undefined) ?? null,
      organizationId: (overrides.organizationId as string) ?? 'org-1',
      description: 'Test decision for governance',
      ...overrides,
    },
  })
}

function seedEscalationRule(overrides: Record<string, unknown> = {}) {
  return prisma.decisionEscalationRule.create({
    data: {
      id: overrides.id as string ?? 'rule-1',
      organizationId: (overrides.organizationId as string) ?? 'org-1',
      escalateAfterHours: overrides.escalateAfterHours as number ?? 24,
      targetRoleSlug: (overrides.targetRoleSlug as string) ?? 'senior-reviewer',
      isActive: overrides.isActive as boolean ?? true,
      createdById: 'system',
      ...overrides,
    },
  })
}

async function clearAll() {
  store.decision.clear()
  store.decisionGovEvent.clear()
  store.decisionEscalationRule.clear()
}

describe('checkGate', () => {
  beforeEach(async () => {
    await clearAll()
  })

  it('allows SUBMIT from DRAFT', async () => {
    const result = await checkGate('decision-1', 'SUBMIT', 'user-1')
    expect(result.allowed).toBe(false)
    // decision doesn't exist yet
    expect(result.reason).toBe('Decision not found')
  })

  it('allows SUBMIT from DRAFT when decision exists', async () => {
    await seedDecision({ id: 'd-1', status: 'DRAFT', ownerId: 'user-1' })
    const result = await checkGate('d-1', 'SUBMIT', 'user-1')
    expect(result.allowed).toBe(true)
  })

  it('denies SUBMIT from IN_REVIEW', async () => {
    await seedDecision({ id: 'd-2', status: 'IN_REVIEW', ownerId: 'user-1' })
    const result = await checkGate('d-2', 'SUBMIT', 'user-1')
    expect(result.allowed).toBe(false)
    expect(result.reason).toBe('Decision status does not allow this action')
  })

  it('allows APPROVE from IN_REVIEW', async () => {
    await seedDecision({ id: 'd-3', status: 'IN_REVIEW', ownerId: 'user-1' })
    const result = await checkGate('d-3', 'APPROVE', 'user-2')
    expect(result.allowed).toBe(true)
  })

  it('denies APPROVE when author is the approver', async () => {
    await seedDecision({ id: 'd-4', status: 'IN_REVIEW', ownerId: 'user-1' })
    const result = await checkGate('d-4', 'APPROVE', 'user-1')
    expect(result.allowed).toBe(false)
    expect(result.reason).toBe(
      'Decision author cannot approve their own decision',
    )
  })

  it('denies APPROVE from DRAFT', async () => {
    await seedDecision({ id: 'd-5', status: 'DRAFT', ownerId: 'user-1' })
    const result = await checkGate('d-5', 'APPROVE', 'user-2')
    expect(result.allowed).toBe(false)
  })

  it('allows REJECT from IN_REVIEW', async () => {
    await seedDecision({ id: 'd-6', status: 'IN_REVIEW', ownerId: 'user-1' })
    const result = await checkGate('d-6', 'REJECT', 'user-2')
    expect(result.allowed).toBe(true)
  })

  it('denies REJECT from DRAFT', async () => {
    await seedDecision({ id: 'd-7', status: 'DRAFT', ownerId: 'user-1' })
    const result = await checkGate('d-7', 'REJECT', 'user-2')
    expect(result.allowed).toBe(false)
  })

  it('allows EXPORT from APPROVED', async () => {
    await seedDecision({ id: 'd-8', status: 'APPROVED', ownerId: 'user-1' })
    const result = await checkGate('d-8', 'EXPORT', 'user-2')
    expect(result.allowed).toBe(true)
  })

  it('denies EXPORT from DRAFT', async () => {
    await seedDecision({ id: 'd-9', status: 'DRAFT', ownerId: 'user-1' })
    const result = await checkGate('d-9', 'EXPORT', 'user-2')
    expect(result.allowed).toBe(false)
  })

  it('allows ARCHIVE from APPROVED', async () => {
    await seedDecision({ id: 'd-10', status: 'APPROVED', ownerId: 'user-1' })
    const result = await checkGate('d-10', 'ARCHIVE', 'user-2')
    expect(result.allowed).toBe(true)
  })

  it('allows ARCHIVE from REJECTED', async () => {
    await seedDecision({ id: 'd-11', status: 'REJECTED', ownerId: 'user-1' })
    const result = await checkGate('d-11', 'ARCHIVE', 'user-2')
    expect(result.allowed).toBe(true)
  })

  it('denies ARCHIVE from DRAFT', async () => {
    await seedDecision({ id: 'd-12', status: 'DRAFT', ownerId: 'user-1' })
    const result = await checkGate('d-12', 'ARCHIVE', 'user-2')
    expect(result.allowed).toBe(false)
  })

  it('returns not found for unknown decisionId', async () => {
    const result = await checkGate('nonexistent', 'SUBMIT', 'user-1')
    expect(result.allowed).toBe(false)
    expect(result.reason).toBe('Decision not found')
  })
})

describe('submitForReview', () => {
  beforeEach(async () => {
    await clearAll()
    await seedDecision({ id: 'd-1', status: 'DRAFT', ownerId: 'user-1' })
  })

  it('transitions DRAFT to IN_REVIEW', async () => {
    const event = await submitForReview('d-1', 'user-2')

    expect(event.action).toBe('SUBMIT')
    expect(event.fromStatus).toBe('DRAFT')
    expect(event.toStatus).toBe('IN_REVIEW')
    expect(event.userId).toBe('user-2')

    const updated = await prisma.decision.findUnique({ where: { id: 'd-1' } })
    expect(updated?.status).toBe('IN_REVIEW')
    expect(updated?.reviewerId).toBe('user-2')
  })

  it('throws when decision is not in DRAFT', async () => {
    await submitForReview('d-1', 'user-2')
    await expect(submitForReview('d-1', 'user-2')).rejects.toThrow(
      DecisionGovError,
    )
  })
})

describe('approve', () => {
  beforeEach(async () => {
    await clearAll()
    await seedDecision({
      id: 'd-1',
      status: 'IN_REVIEW',
      ownerId: 'user-1',
    })
  })

  it('transitions IN_REVIEW to APPROVED', async () => {
    const event = await approve('d-1', 'user-2', 'Looks good')

    expect(event.action).toBe('APPROVE')
    expect(event.fromStatus).toBe('IN_REVIEW')
    expect(event.toStatus).toBe('APPROVED')
    expect(event.reviewNotes).toBe('Looks good')

    const updated = await prisma.decision.findUnique({ where: { id: 'd-1' } })
    expect(updated?.status).toBe('APPROVED')
    expect(updated?.approverId).toBe('user-2')
  })

  it('throws when author tries to approve', async () => {
    await expect(approve('d-1', 'user-1')).rejects.toThrow(DecisionGovError)
  })

  it('throws when decision is not IN_REVIEW', async () => {
    await prisma.decision.update({
      where: { id: 'd-1' },
      data: { status: 'DRAFT' },
    })
    await expect(approve('d-1', 'user-2')).rejects.toThrow(DecisionGovError)
  })
})

describe('reject', () => {
  beforeEach(async () => {
    await clearAll()
    await seedDecision({
      id: 'd-1',
      status: 'IN_REVIEW',
      ownerId: 'user-1',
    })
  })

  it('transitions IN_REVIEW to REJECTED', async () => {
    const event = await reject('d-1', 'user-2', 'Not viable', 'Needs more data')

    expect(event.action).toBe('REJECT')
    expect(event.fromStatus).toBe('IN_REVIEW')
    expect(event.toStatus).toBe('REJECTED')
    expect(event.reason).toBe('Not viable')
    expect(event.reviewNotes).toBe('Needs more data')
  })

  it('throws when reason is empty', async () => {
    await expect(reject('d-1', 'user-2', '')).rejects.toThrow(DecisionGovError)
    await expect(reject('d-1', 'user-2', '  ')).rejects.toThrow(
      DecisionGovError,
    )
  })
})

describe('exportDecision', () => {
  beforeEach(async () => {
    await clearAll()
  })

  it('creates export event for approved decision', async () => {
    await seedDecision({ id: 'd-1', status: 'APPROVED', ownerId: 'user-1' })
    const event = await exportDecision('d-1', 'user-2')

    expect(event.action).toBe('EXPORT')
    expect(event.fromStatus).toBe('APPROVED')
    expect(event.toStatus).toBe('APPROVED')
  })

  it('throws for non-approved decision', async () => {
    await seedDecision({ id: 'd-1', status: 'DRAFT', ownerId: 'user-1' })
    await expect(exportDecision('d-1', 'user-2')).rejects.toThrow(
      DecisionGovError,
    )
  })
})

describe('archiveDecision', () => {
  beforeEach(async () => {
    await clearAll()
  })

  it('archives an approved decision', async () => {
    await seedDecision({ id: 'd-1', status: 'APPROVED', ownerId: 'user-1' })
    const event = await archiveDecision('d-1', 'user-2')

    expect(event.action).toBe('ARCHIVE')
    expect(event.toStatus).toBe('ARCHIVED')

    const updated = await prisma.decision.findUnique({ where: { id: 'd-1' } })
    expect(updated?.status).toBe('ARCHIVED')
  })

  it('archives a rejected decision', async () => {
    await seedDecision({ id: 'd-1', status: 'REJECTED', ownerId: 'user-1' })
    const event = await archiveDecision('d-1', 'user-2')

    expect(event.action).toBe('ARCHIVE')
    expect(event.toStatus).toBe('ARCHIVED')
  })

  it('throws for draft decision', async () => {
    await seedDecision({ id: 'd-1', status: 'DRAFT', ownerId: 'user-1' })
    await expect(archiveDecision('d-1', 'user-2')).rejects.toThrow(
      DecisionGovError,
    )
  })
})

describe('createEscalationRule', () => {
  beforeEach(async () => {
    await clearAll()
  })

  it('creates an escalation rule with required fields', async () => {
    const rule = await createEscalationRule('org-1', {
      escalateAfterHours: 48,
      targetRoleSlug: 'senior-reviewer',
    })

    expect(rule.organizationId).toBe('org-1')
    expect(rule.escalateAfterHours).toBe(48)
    expect(rule.targetRoleSlug).toBe('senior-reviewer')
    expect(rule.isActive).toBe(true)
  })

  it('creates an escalation rule with optional template', async () => {
    const rule = await createEscalationRule('org-1', {
      decisionTemplateId: 'template-1',
      escalateAfterHours: 24,
      targetRoleSlug: 'director',
      isActive: true,
    })

    expect(rule.decisionTemplateId).toBe('template-1')
    expect(rule.escalateAfterHours).toBe(24)
  })

  it('throws for empty orgId', async () => {
    await expect(
      createEscalationRule('', {
        escalateAfterHours: 24,
        targetRoleSlug: 'reviewer',
      }),
    ).rejects.toThrow(DecisionGovError)
  })
})

describe('getActiveEscalations', () => {
  beforeEach(async () => {
    await clearAll()
  })

  it('returns empty array when no rules exist', async () => {
    const result = await getActiveEscalations()
    expect(result).toEqual([])
  })

  it('finds overdue decisions', async () => {
    await seedEscalationRule({
      id: 'rule-1',
      organizationId: 'org-1',
      escalateAfterHours: 1,
      targetRoleSlug: 'senior-reviewer',
    })

    const oldDate = new Date(Date.now() - 2 * 60 * 60 * 1000)
    await seedDecision({
      id: 'd-1',
      status: 'IN_REVIEW',
      ownerId: 'user-1',
      organizationId: 'org-1',
      updatedAt: oldDate,
      createdAt: oldDate,
    })

    const result = await getActiveEscalations()
    expect(result.length).toBeGreaterThanOrEqual(1)
    expect(result[0].decisionId).toBe('d-1')
    expect(result[0].targetRoleSlug).toBe('senior-reviewer')
  })

  it('skips decisions not past deadline', async () => {
    await seedEscalationRule({
      id: 'rule-2',
      organizationId: 'org-1',
      escalateAfterHours: 100,
      targetRoleSlug: 'senior-reviewer',
    })

    await seedDecision({
      id: 'd-2',
      status: 'IN_REVIEW',
      ownerId: 'user-1',
      organizationId: 'org-1',
    })

    const result = await getActiveEscalations()
    const match = result.find((r) => r.decisionId === 'd-2')
    expect(match).toBeUndefined()
  })
})

describe('processEscalations', () => {
  beforeEach(async () => {
    await clearAll()
  })

  it('creates escalation events for overdue decisions', async () => {
    await seedEscalationRule({
      id: 'rule-1',
      organizationId: 'org-1',
      escalateAfterHours: 1,
      targetRoleSlug: 'senior-reviewer',
    })

    const oldDate = new Date(Date.now() - 2 * 60 * 60 * 1000)
    await seedDecision({
      id: 'd-1',
      status: 'IN_REVIEW',
      ownerId: 'user-1',
      organizationId: 'org-1',
      title: 'Overdue Decision',
      updatedAt: oldDate,
      createdAt: oldDate,
    })

    const count = await processEscalations()
    expect(count).toBe(1)

    const events = await getDecisionEventLog('d-1')
    const escalationEvent = events.find((e) => e.action === 'ESCALATE')
    expect(escalationEvent).toBeDefined()
    expect(escalationEvent!.fromStatus).toBe('IN_REVIEW')
    expect(escalationEvent!.toStatus).toBe('IN_REVIEW')
  })

  it('does not create duplicate escalation events', async () => {
    await seedEscalationRule({
      id: 'rule-1',
      organizationId: 'org-1',
      escalateAfterHours: 1,
      targetRoleSlug: 'senior-reviewer',
    })

    const oldDate = new Date(Date.now() - 2 * 60 * 60 * 1000)
    await seedDecision({
      id: 'd-1',
      status: 'IN_REVIEW',
      ownerId: 'user-1',
      organizationId: 'org-1',
      updatedAt: oldDate,
      createdAt: oldDate,
    })

    await processEscalations()
    const count2 = await processEscalations()
    expect(count2).toBe(0)
  })
})

describe('getDecisionEventLog', () => {
  beforeEach(async () => {
    await clearAll()
  })

  it('returns events in chronological order', async () => {
    await seedDecision({ id: 'd-1', status: 'DRAFT', ownerId: 'user-1' })

    await submitForReview('d-1', 'user-2')
    await approve('d-1', 'user-2')
    await archiveDecision('d-1', 'user-2')

    const events = await getDecisionEventLog('d-1')
    expect(events.length).toBeGreaterThanOrEqual(3)
    expect(events[0].action).toBe('SUBMIT')
    expect(events[events.length - 1].action).toBe('ARCHIVE')
  })

  it('returns empty array for decision with no events', async () => {
    const events = await getDecisionEventLog('nonexistent')
    expect(events).toEqual([])
  })
})
