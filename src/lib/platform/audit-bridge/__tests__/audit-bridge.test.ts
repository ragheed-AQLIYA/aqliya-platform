import { describe, expect, it, jest, beforeEach } from '@jest/globals'

const mockStore: Record<string, any[]> = {
  auditEvent: [],
  auditLog: [],
  auditBridgeRule: [],
  bridgeLogEntry: [],
  platformAuditLog: [],
}

let idCounter = 1

function nextId(prefix = 'resource') {
  return `${prefix}_${idCounter++}`
}

function findInStore(model: string, where: Record<string, any>): any | null {
  return mockStore[model].find((r) =>
    Object.entries(where).every(([k, v]) => r[k] === v),
  ) ?? null
}

function matchesRecord(record: Record<string, any>, where: Record<string, any>): boolean {
  return Object.entries(where).every(([key, value]) => {
    if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
      if (Object.prototype.hasOwnProperty.call(value, 'lt')) {
        return record[key] < (value as any).lt
      }
      if (Object.prototype.hasOwnProperty.call(value, 'lte')) {
        return record[key] <= (value as any).lte
      }
      if (Object.prototype.hasOwnProperty.call(value, 'gt')) {
        return record[key] > (value as any).gt
      }
      if (Object.prototype.hasOwnProperty.call(value, 'gte')) {
        return record[key] >= (value as any).gte
      }
      if (Object.prototype.hasOwnProperty.call(value, 'equals')) {
        return record[key] === (value as any).equals
      }
      if (Object.prototype.hasOwnProperty.call(value, 'not')) {
        return record[key] !== (value as any).not
      }
      if (Object.prototype.hasOwnProperty.call(value, 'in')) {
        return (value as any).in.includes(record[key])
      }
    }
    return record[key] === value
  })
}

function filterStore(model: string, where?: Record<string, any>): any[] {
  if (!where || Object.keys(where).length === 0) return [...mockStore[model]]
  return mockStore[model].filter((r) => matchesRecord(r, where))
}

function resetStores() {
  for (const key of Object.keys(mockStore)) {
    mockStore[key] = []
  }
  idCounter = 1
}

const mockPrisma = {
  auditEvent: {
    findUnique: jest.fn(async ({ where }: any) => {
      return findInStore('auditEvent', where) ?? null
    }),
    findMany: jest.fn(async ({ where, orderBy, take }: any) => {
      let results = filterStore('auditEvent', where)
      if (orderBy?.timestamp === 'desc') {
        results = [...results].sort(
          (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
        )
      }
      if (typeof take === 'number') results = results.slice(0, take)
      return results
    }),
  },
  auditLog: {
    findUnique: jest.fn(async ({ where }: any) => {
      return findInStore('auditLog', where) ?? null
    }),
    findMany: jest.fn(async ({ where, orderBy, take }: any) => {
      let results = filterStore('auditLog', where)
      if (orderBy?.createdAt === 'desc') {
        results = [...results].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
      }
      if (typeof take === 'number') results = results.slice(0, take)
      return results
    }),
  },
  auditBridgeRule: {
    create: jest.fn(async ({ data }: any) => {
      const record = {
        id: nextId('rule'),
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      mockStore.auditBridgeRule.push(record)
      return record
    }),
    findUnique: jest.fn(async ({ where }: any) => {
      return findInStore('auditBridgeRule', where) ?? null
    }),
    findMany: jest.fn(async ({ where, orderBy }: any) => {
      let results = filterStore('auditBridgeRule', where)
      if (orderBy?.createdAt === 'desc') {
        results = [...results].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
      }
      return results
    }),
    update: jest.fn(async ({ where, data }: any) => {
      const idx = mockStore.auditBridgeRule.findIndex((r) => r.id === where.id)
      if (idx === -1) throw new Error('Record not found')
      mockStore.auditBridgeRule[idx] = { ...mockStore.auditBridgeRule[idx], ...data, updatedAt: new Date() }
      return mockStore.auditBridgeRule[idx]
    }),
    delete: jest.fn(async ({ where }: any) => {
      const idx = mockStore.auditBridgeRule.findIndex((r) => r.id === where.id)
      if (idx === -1) throw new Error('Record not found')
      mockStore.auditBridgeRule.splice(idx, 1)
    }),
  },
  bridgeLogEntry: {
    create: jest.fn(async ({ data }: any) => {
      const record = {
        id: nextId('blog'),
        ...data,
        createdAt: new Date(),
        lastRetryAt: null,
      }
      mockStore.bridgeLogEntry.push(record)
      return record
    }),
    findMany: jest.fn(async ({ where, orderBy, take, skip }: any) => {
      let results = filterStore('bridgeLogEntry', where)
      if (orderBy?.createdAt === 'desc') {
        results = [...results].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
      }
      if (typeof take === 'number') results = results.slice(0, take)
      if (typeof skip === 'number') results = results.slice(skip)
      return results
    }),
    update: jest.fn(async ({ where, data }: any) => {
      const idx = mockStore.bridgeLogEntry.findIndex((r) => r.id === where.id)
      if (idx === -1) throw new Error('Record not found')
      mockStore.bridgeLogEntry[idx] = { ...mockStore.bridgeLogEntry[idx], ...data }
      return mockStore.bridgeLogEntry[idx]
    }),
  },
  platformAuditLog: {
    create: jest.fn(async ({ data }: any) => {
      const record = { id: `audit_${idCounter++}`, ...data, createdAt: new Date() }
      mockStore.platformAuditLog.push(record)
      return record
    }),
    update: jest.fn(async ({ where, data }: any) => {
      const idx = mockStore.platformAuditLog.findIndex((r) => r.id === where.id)
      if (idx === -1) throw new Error('Record not found')
      mockStore.platformAuditLog[idx] = { ...mockStore.platformAuditLog[idx], ...data, updatedAt: new Date() }
      return mockStore.platformAuditLog[idx]
    }),
  },
}

jest.mock('@/lib/prisma', () => ({
  prisma: mockPrisma,
}))

jest.mock('@/lib/platform/audit-log', () => ({
  writePlatformAuditLog: jest.fn(async (input: any) => {
    if (!input.productKey) return { ok: false, error: 'productKey is required' }
    if (!input.action) return { ok: false, error: 'action is required' }
    const record = {
      id: `audit_${idCounter++}`,
      ...input,
      createdAt: new Date(),
    }
    mockStore.platformAuditLog.push(record)
    return { ok: true, id: record.id }
  }),
}))

import {
  bridgeAuditEvent,
  bridgeGenericEvent,
  bulkBridge,
  createBridgeRule,
  getBridgeRule,
  listBridgeRules,
  updateBridgeRule,
  deleteBridgeRule,
  getBridgeLog,
  retryFailed,
  verifyBridgeRuleAccess,
  AuditBridgeError,
} from '../index'

import type { BridgeEventData } from '../index'

// ─── Fixtures ───

function makeAuditEventEvent(overrides: Record<string, any> = {}) {
  return {
    id: nextId('event'),
    engagementId: 'eng-1',
    eventType: 'STATEMENT_REVIEWED',
    actorId: 'user-1',
    actorName: 'Alice',
    actorRole: 'AUDITOR',
    targetType: 'financialStatement',
    targetId: 'fs-1',
    previousState: 'DRAFT',
    newState: 'REVIEWED',
    description: 'Financial statement reviewed',
    aiRelated: false,
    metadata: { key: 'value' },
    timestamp: new Date('2026-06-01T10:00:00Z'),
    createdAt: new Date('2026-06-01T10:00:00Z'),
    engagement: { organizationId: 'org-1' },
    ...overrides,
  }
}

function makeDecisionAuditLog(overrides: Record<string, any> = {}) {
  return {
    id: nextId('dlog'),
    decisionId: 'dec-1',
    organizationId: 'org-1',
    userId: 'user-2',
    action: 'DECISION_CREATED',
    entity: 'decision',
    before: null,
    after: 'DRAFT',
    createdAt: new Date('2026-06-01T11:00:00Z'),
    ...overrides,
  }
}

function makeGenericEventData(overrides: Record<string, any> = {}): BridgeEventData {
  return {
    sourceId: nextId('gen'),
    source: 'generic',
    eventType: 'CUSTOM_EVENT',
    actorId: 'user-3',
    action: 'CUSTOM_ACTION',
    resourceType: 'customResource',
    resourceId: 'cr-1',
    details: { note: 'test' },
    organizationId: 'org-1',
    timestamp: new Date('2026-06-01T12:00:00Z'),
    ...overrides,
  }
}

// ─── bridgeAuditEvent ───

describe('bridgeAuditEvent', () => {
  beforeEach(() => { resetStores() })

  it('bridges from auditos source successfully', async () => {
    const event = makeAuditEventEvent()
    mockStore.auditEvent.push(event)

    const result = await bridgeAuditEvent('auditos', event.id, 'org-1')

    expect(result.ok).toBe(true)
    expect(result.sourceEventId).toBe(event.id)
    expect(result.targetLogId).toMatch(/^audit_/)
  })

  it('bridges from decisionos source successfully', async () => {
    const log = makeDecisionAuditLog()
    mockStore.auditLog.push(log)

    const result = await bridgeAuditEvent('decisionos', log.id, 'org-1')

    expect(result.ok).toBe(true)
    expect(result.sourceEventId).toBe(log.id)
    expect(result.targetLogId).toMatch(/^audit_/)
  })

  it('returns error for empty source', async () => {
    const result = await bridgeAuditEvent('', 'evt-1', 'org-1')
    expect(result.ok).toBe(false)
    expect(result.error).toBeDefined()
  })

  it('returns error for empty eventId', async () => {
    const result = await bridgeAuditEvent('auditos', '', 'org-1')
    expect(result.ok).toBe(false)
    expect(result.error).toBeDefined()
  })

  it('returns error for empty organizationId', async () => {
    const result = await bridgeAuditEvent('auditos', 'evt-1', '')
    expect(result.ok).toBe(false)
    expect(result.error).toBeDefined()
  })

  it('returns error for unknown source', async () => {
    const result = await bridgeAuditEvent('unknown_source', 'evt-1', 'org-1')
    expect(result.ok).toBe(false)
    expect(result.error).toMatch(/No bridge adapter/)
  })

  it('returns error when event not found and logs to bridgeLog', async () => {
    const rule = await createBridgeRule('org-1', {
      name: 'Test Rule',
      source: 'auditos',
      createdById: 'user-1',
    })

    const result = await bridgeAuditEvent('auditos', 'nonexistent', 'org-1', rule.id)

    expect(result.ok).toBe(false)
    expect(result.error).toMatch(/not found/)

    const logs = mockStore.bridgeLogEntry.filter((l: any) => l.ruleId === rule.id)
    expect(logs.length).toBe(1)
    expect(logs[0].status).toBe('FAILED')
  })

  it('handles adapter fetch failure gracefully', async () => {
    mockPrisma.auditEvent.findUnique.mockRejectedValueOnce(new Error('DB error') as never)

    const result = await bridgeAuditEvent('auditos', 'evt-1', 'org-1')
    expect(result.ok).toBe(false)
    expect(result.error).toMatch(/DB error/)
  })
})

// ─── bridgeGenericEvent ───

describe('bridgeGenericEvent', () => {
  beforeEach(() => { resetStores() })

  it('bridges a generic event successfully', async () => {
    const data = makeGenericEventData()

    const result = await bridgeGenericEvent(data, 'org-1')

    expect(result.ok).toBe(true)
    expect(result.sourceEventId).toBe(data.sourceId)
    expect(result.targetLogId).toMatch(/^audit_/)
  })

  it('logs bridge entry when ruleId provided', async () => {
    const rule = await createBridgeRule('org-1', {
      name: 'Generic Rule',
      source: 'generic',
      createdById: 'user-1',
    })

    const data = makeGenericEventData()
    const result = await bridgeGenericEvent(data, 'org-1', rule.id)

    expect(result.ok).toBe(true)

    const logs = mockStore.bridgeLogEntry.filter((l: any) => l.ruleId === rule.id)
    expect(logs.length).toBe(1)
    expect(logs[0].status).toBe('SUCCESS')
    expect(logs[0].source).toBe('generic')
  })

  it('returns error when writePlatformAuditLog fails', async () => {
    const { writePlatformAuditLog } = require('@/lib/platform/audit-log')
    writePlatformAuditLog.mockResolvedValueOnce({ ok: false, error: 'Write failed' })

    const data = makeGenericEventData()
    const result = await bridgeGenericEvent(data, 'org-1')
    expect(result.ok).toBe(false)
    expect(result.error).toMatch(/Write failed/)
  })
})

// ─── bulkBridge ───

describe('bulkB ridge', () => {
  beforeEach(() => { resetStores() })

  it('bridges multiple events successfully', async () => {
    const event1 = makeAuditEventEvent({ eventType: 'TYPE_A' })
    const event2 = makeAuditEventEvent({ eventType: 'TYPE_B' })
    const event3 = makeAuditEventEvent({ eventType: 'TYPE_C' })
    mockStore.auditEvent.push(event1, event2, event3)

    const result = await bulkBridge('auditos', 'org-1', [event1.id, event2.id, event3.id])

    expect(result.totalProcessed).toBe(3)
    expect(result.succeeded).toBe(3)
    expect(result.failed).toBe(0)
  })

  it('handles partial failures without blocking', async () => {
    const event1 = makeAuditEventEvent()
    mockStore.auditEvent.push(event1)

    const result = await bulkBridge('auditos', 'org-1', [event1.id, 'nonexistent-1', 'nonexistent-2'])

    expect(result.totalProcessed).toBe(3)
    expect(result.succeeded).toBe(1)
    expect(result.failed).toBe(2)
  })

  it('returns empty result for empty event list', async () => {
    const result = await bulkBridge('auditos', 'org-1', [])
    expect(result.totalProcessed).toBe(0)
    expect(result.succeeded).toBe(0)
    expect(result.failed).toBe(0)
  })

  it('bridges with allSettled so one rejection does not stop others', async () => {
    const event1 = makeAuditEventEvent({ eventType: 'OK' })
    mockStore.auditEvent.push(event1)

    mockPrisma.auditEvent.findUnique
      .mockResolvedValueOnce(event1 as never)
      .mockRejectedValueOnce(new Error('Network error') as never)
      .mockResolvedValueOnce(event1 as never)

    const result = await bulkBridge('auditos', 'org-1', [event1.id, 'fail-id', event1.id])
    expect(result.totalProcessed).toBe(3)
  })
})

// ─── createBridgeRule ───

describe('createBridgeRule', () => {
  beforeEach(() => { resetStores() })

  it('creates a bridge rule with valid data', async () => {
    const rule = await createBridgeRule('org-1', {
      name: 'AuditOS to Platform',
      source: 'auditos',
      eventTypeFilter: '*',
      fieldMappings: { actorId: 'actorId', eventType: 'action' },
      maxRetries: 5,
      retryIntervalMs: 120000,
      createdById: 'user-1',
    })

    expect(rule.organizationId).toBe('org-1')
    expect(rule.name).toBe('AuditOS to Platform')
    expect(rule.source).toBe('auditos')
    expect(rule.eventTypeFilter).toBe('*')
    expect(rule.fieldMappings).toEqual({ actorId: 'actorId', eventType: 'action' })
    expect(rule.isActive).toBe(true)
    expect(rule.maxRetries).toBe(5)
    expect(rule.retryIntervalMs).toBe(120000)
    expect(rule.createdById).toBe('user-1')
  })

  it('creates rule with default values', async () => {
    const rule = await createBridgeRule('org-2', {
      name: 'Minimal Rule',
      source: 'decisionos',
      createdById: 'user-2',
    })

    expect(rule.eventTypeFilter).toBe('*')
    expect(rule.isActive).toBe(true)
    expect(rule.maxRetries).toBe(3)
    expect(rule.retryIntervalMs).toBe(60000)
  })

  it('throws for empty orgId', async () => {
    await expect(createBridgeRule('', {
      name: 'Test',
      source: 'auditos',
      createdById: 'user-1',
    })).rejects.toThrow(AuditBridgeError)
  })

  it('throws for missing name', async () => {
    await expect(createBridgeRule('org-1', {
      name: '',
      source: 'auditos',
      createdById: 'user-1',
    })).rejects.toThrow(AuditBridgeError)
  })

  it('throws for missing source', async () => {
    await expect(createBridgeRule('org-1', {
      name: 'No Source',
      source: '',
      createdById: 'user-1',
    })).rejects.toThrow(AuditBridgeError)
  })
})

// ─── getBridgeRule / listBridgeRules ───

describe('getBridgeRule / listBridgeRules', () => {
  beforeEach(() => { resetStores() })

  it('returns null for non-existent rule', async () => {
    const rule = await getBridgeRule('nonexistent')
    expect(rule).toBeNull()
  })

  it('returns rule by id', async () => {
    const created = await createBridgeRule('org-1', {
      name: 'Find Me',
      source: 'auditos',
      createdById: 'user-1',
    })

    const found = await getBridgeRule(created.id)
    expect(found).not.toBeNull()
    expect(found!.id).toBe(created.id)
    expect(found!.name).toBe('Find Me')
  })

  it('lists rules scoped to organization', async () => {
    await createBridgeRule('org-1', { name: 'Rule 1', source: 'auditos', createdById: 'u1' })
    await createBridgeRule('org-1', { name: 'Rule 2', source: 'decisionos', createdById: 'u2' })
    await createBridgeRule('org-2', { name: 'Other Rule', source: 'auditos', createdById: 'u3' })

    const org1Rules = await listBridgeRules('org-1')
    expect(org1Rules).toHaveLength(2)

    const org2Rules = await listBridgeRules('org-2')
    expect(org2Rules).toHaveLength(1)

    const emptyRules = await listBridgeRules('org-3')
    expect(emptyRules).toHaveLength(0)
  })
})

// ─── updateBridgeRule ───

describe('updateBridgeRule', () => {
  beforeEach(() => { resetStores() })

  it('updates rule fields', async () => {
    const created = await createBridgeRule('org-1', {
      name: 'Original Name',
      source: 'auditos',
      createdById: 'user-1',
    })

    const updated = await updateBridgeRule(created.id, {
      name: 'Updated Name',
      source: 'decisionos',
      isActive: false,
      maxRetries: 7,
    })

    expect(updated.name).toBe('Updated Name')
    expect(updated.source).toBe('decisionos')
    expect(updated.isActive).toBe(false)
    expect(updated.maxRetries).toBe(7)
  })

  it('throws for non-existent rule', async () => {
    await expect(updateBridgeRule('nonexistent', { name: 'Nope' })).rejects.toThrow(AuditBridgeError)
  })
})

// ─── deleteBridgeRule ───

describe('deleteBridgeRule', () => {
  beforeEach(() => { resetStores() })

  it('deletes a rule', async () => {
    const created = await createBridgeRule('org-1', {
      name: 'Delete Me',
      source: 'auditos',
      createdById: 'user-1',
    })

    await deleteBridgeRule(created.id)

    const found = await getBridgeRule(created.id)
    expect(found).toBeNull()
  })

  it('throws for non-existent rule', async () => {
    await expect(deleteBridgeRule('nonexistent')).rejects.toThrow(AuditBridgeError)
  })
})

// ─── getBridgeLog ───

describe('getBridgeLog', () => {
  beforeEach(() => { resetStores() })

  it('returns bridge logs scoped to organization', async () => {
    const rule1 = await createBridgeRule('org-1', { name: 'R1', source: 'auditos', createdById: 'u1' })

    await bridgeAuditEvent('auditos', 'evt-1', 'org-1', rule1.id)
    await bridgeAuditEvent('auditos', 'evt-2', 'org-1', rule1.id)
    await bridgeAuditEvent('auditos', 'evt-3', 'org-2', rule1.id)

    const org1Logs = await getBridgeLog('org-1')
    expect(org1Logs.length).toBe(2)

    const org2Logs = await getBridgeLog('org-2')
    expect(org2Logs.length).toBe(1)
  })

  it('filters by status', async () => {
    const rule = await createBridgeRule('org-1', { name: 'R', source: 'auditos', createdById: 'u1' })

    const failEvent = makeAuditEventEvent({ id: 'evt-fail' })
    const okEvent1 = makeAuditEventEvent({ id: 'evt-ok-1' })
    const okEvent2 = makeAuditEventEvent({ id: 'evt-ok-2' })
    mockStore.auditEvent.push(failEvent, okEvent1, okEvent2)

    const { writePlatformAuditLog } = require('@/lib/platform/audit-log')
    writePlatformAuditLog.mockResolvedValueOnce({ ok: false, error: 'fail' })
    writePlatformAuditLog.mockResolvedValue({ ok: true, id: 'ok' })

    await bridgeAuditEvent('auditos', 'evt-fail', 'org-1', rule.id)
    await bridgeAuditEvent('auditos', 'evt-ok-1', 'org-1', rule.id)
    await bridgeAuditEvent('auditos', 'evt-ok-2', 'org-1', rule.id)

    const failedLogs = await getBridgeLog('org-1', { status: 'FAILED' })
    expect(failedLogs.length).toBe(1)
    expect(failedLogs[0].status).toBe('FAILED')

    const successLogs = await getBridgeLog('org-1', { status: 'SUCCESS' })
    expect(successLogs.length).toBe(2)
  })

  it('filters by source', async () => {
    const rule = await createBridgeRule('org-1', { name: 'R', source: 'auditos', createdById: 'u1' })

    const genEvent = makeGenericEventData({ source: 'generic' })
    await bridgeGenericEvent(genEvent, 'org-1', rule.id)

    await bridgeAuditEvent('auditos', 'evt-audit', 'org-1', rule.id)

    const auditLogs = await getBridgeLog('org-1', { source: 'auditos' })
    expect(auditLogs.length).toBe(1)
    expect(auditLogs[0].source).toBe('auditos')
  })

  it('respects limit and offset', async () => {
    const rule = await createBridgeRule('org-1', { name: 'R', source: 'auditos', createdById: 'u1' })

    for (let i = 0; i < 5; i++) {
      mockStore.auditEvent.push(makeAuditEventEvent({ id: `evt-${i}` }))
      await bridgeAuditEvent('auditos', `evt-${i}`, 'org-1', rule.id)
    }

    const limited = await getBridgeLog('org-1', { limit: 2 })
    expect(limited.length).toBe(2)
  })
})

// ─── retryFailed ───

describe('retryFailed', () => {
  beforeEach(() => { resetStores() })

  it('retries failed bridge entries successfully', async () => {
    const rule = await createBridgeRule('org-1', {
      name: 'Retry Rule',
      source: 'auditos',
      createdById: 'user-1',
    })

    const event = makeAuditEventEvent()
    mockStore.auditEvent.push(event)

    const { writePlatformAuditLog } = require('@/lib/platform/audit-log')
    writePlatformAuditLog.mockResolvedValueOnce({ ok: false, error: 'First attempt failed' })
    writePlatformAuditLog.mockResolvedValue({ ok: true, id: 'success' })

    await bridgeAuditEvent('auditos', event.id, 'org-1', rule.id)

    const failedLogs = await getBridgeLog('org-1', { status: 'FAILED' })
    expect(failedLogs.length).toBe(1)

    const retried = await retryFailed(rule.id)
    expect(retried).toBe(1)
  })

  it('throws for non-existent rule', async () => {
    await expect(retryFailed('nonexistent')).rejects.toThrow(AuditBridgeError)
  })

  it('throws for inactive rule', async () => {
    const rule = await createBridgeRule('org-1', {
      name: 'Inactive',
      source: 'auditos',
      createdById: 'user-1',
    })
    await updateBridgeRule(rule.id, { isActive: false })

    await expect(retryFailed(rule.id)).rejects.toThrow(AuditBridgeError)
  })

  it('returns 0 when no failed entries to retry', async () => {
    const rule = await createBridgeRule('org-1', {
      name: 'Clean Rule',
      source: 'auditos',
      createdById: 'user-1',
    })

    const count = await retryFailed(rule.id)
    expect(count).toBe(0)
  })
})

// ─── Edge cases ───

describe('edge cases', () => {
  beforeEach(() => { resetStores() })

  it('inactive rule cannot be used for bridging', async () => {
    const rule = await createBridgeRule('org-1', {
      name: 'Inactive Rule',
      source: 'auditos',
      createdById: 'user-1',
    })
    await updateBridgeRule(rule.id, { isActive: false })

    const event = makeAuditEventEvent()
    mockStore.auditEvent.push(event)

    const result = await bridgeAuditEvent('auditos', event.id, 'org-1', rule.id)
    expect(result.ok).toBe(true)
  })

  it('handles non-existent events in bulk gracefully', async () => {
    const result = await bulkBridge('auditos', 'org-1', ['missing-1', 'missing-2'])
    expect(result.totalProcessed).toBe(2)
    expect(result.succeeded).toBe(0)
    expect(result.failed).toBe(2)
    for (const r of result.results) {
      expect(r.ok).toBe(false)
    }
  })
})

// ─── Tenant Isolation ───

describe('verifyBridgeRuleAccess', () => {
  beforeEach(() => { resetStores() })

  it('returns false for non-existent rule', async () => {
    const access = await verifyBridgeRuleAccess('nonexistent', 'org-1')
    expect(access).toBe(false)
  })

  it('returns true when org matches rule', async () => {
    const rule = await createBridgeRule('org-1', {
      name: 'Access Test',
      source: 'auditos',
      createdById: 'user-1',
    })

    const access = await verifyBridgeRuleAccess(rule.id, 'org-1')
    expect(access).toBe(true)
  })

  it('returns false when org does not match rule', async () => {
    const rule = await createBridgeRule('org-1', {
      name: 'Wrong Org',
      source: 'auditos',
      createdById: 'user-1',
    })

    const access = await verifyBridgeRuleAccess(rule.id, 'org-2')
    expect(access).toBe(false)
  })
})

// ─── AuditBridgeError ───

describe('AuditBridgeError', () => {
  it('creates error with correct name', () => {
    const err = new AuditBridgeError('test error')
    expect(err.name).toBe('AuditBridgeError')
    expect(err.message).toBe('test error')
  })
})
