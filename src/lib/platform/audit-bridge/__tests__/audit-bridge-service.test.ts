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
      if (Object.prototype.hasOwnProperty.call(value, 'lt')) return record[key] < (value as any).lt
      if (Object.prototype.hasOwnProperty.call(value, 'lte')) return record[key] <= (value as any).lte
      if (Object.prototype.hasOwnProperty.call(value, 'gt')) return record[key] > (value as any).gt
      if (Object.prototype.hasOwnProperty.call(value, 'gte')) return record[key] >= (value as any).gte
      if (Object.prototype.hasOwnProperty.call(value, 'equals')) return record[key] === (value as any).equals
      if (Object.prototype.hasOwnProperty.call(value, 'not')) return record[key] !== (value as any).not
      if (Object.prototype.hasOwnProperty.call(value, 'in')) return (value as any).in.includes(record[key])
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
    findUnique: jest.fn(async ({ where }: any) => findInStore('auditEvent', where) ?? null),
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
    findUnique: jest.fn(async ({ where }: any) => findInStore('auditLog', where) ?? null),
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
      const record = { id: nextId('rule'), ...data, createdAt: new Date(), updatedAt: new Date() }
      mockStore.auditBridgeRule.push(record)
      return record
    }),
    findUnique: jest.fn(async ({ where }: any) => findInStore('auditBridgeRule', where) ?? null),
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
      const record = { id: nextId('blog'), ...data, createdAt: new Date(), lastRetryAt: null }
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
    findFirst: jest.fn(async ({ where }: any) => {
      const { productKey, sourceModel, sourceId } = where;
      if (sourceModel === 'AuditEvent') {
        const event = findInStore('auditEvent', { id: sourceId });
        if (!event) return null;
        return {
          id: "pal_audit_".concat(event.id),
          productKey,
          sourceModel,
          sourceId,
          action: event.eventType,
          actorId: event.actorId,
          targetType: event.targetType,
          targetId: event.targetId,
          metadata: { ...(event.metadata ?? {}), engagementId: event.engagement?.organizationId },
          beforeState: event.previousState ?? null,
          afterState: event.newState ?? null,
          createdAt: event.timestamp ?? event.createdAt,
        };
      }
      if (sourceModel === 'AuditLog') {
        const log = findInStore('auditLog', { id: sourceId });
        if (!log) return null;
        return {
          id: "pal_dec_".concat(log.id),
          productKey,
          sourceModel,
          sourceId,
          action: log.action,
          actorId: log.userId,
          targetType: log.entity ?? 'decision',
          targetId: log.decisionId ?? '',
          beforeState: log.before ?? null,
          afterState: log.after ?? null,
          organizationId: log.organizationId ?? '',
          createdAt: log.createdAt,
          metadata: {},
        };
      }
      return findInStore('platformAuditLog', where) ?? null;
    }),
    findMany: jest.fn(async ({ where, orderBy, take }: any) => {
      const { productKey, sourceModel } = where ?? {};
      if (sourceModel === 'AuditEvent') {
        let events = [...mockStore.auditEvent];
        if (where?.action) events = events.filter(e => e.eventType === where.action);
        if (where?.actorId) events = events.filter(e => e.actorId === where.actorId);
        if (where?.sourceId) events = events.filter(e => e.engagement?.organizationId === where.sourceId);
        if (orderBy?.createdAt === 'desc') {
          events = [...events].sort((a, b) =>
            new Date(b.createdAt ?? b.timestamp).getTime() - new Date(a.createdAt ?? a.timestamp).getTime()
          );
        }
        if (typeof take === 'number') events = events.slice(0, take);
        return events.map(event => ({
          id: "pal_audit_".concat(event.id),
          productKey,
          sourceModel,
          sourceId: event.id,
          action: event.eventType,
          actorId: event.actorId,
          targetType: event.targetType,
          targetId: event.targetId,
          metadata: { ...(event.metadata ?? {}), engagementId: event.engagement?.organizationId },
          beforeState: event.previousState ?? null,
          afterState: event.newState ?? null,
          createdAt: event.timestamp ?? event.createdAt,
        }));
      }
      if (sourceModel === 'AuditLog') {
        let logs = [...mockStore.auditLog];
        if (where?.action) logs = logs.filter(l => l.action === where.action);
        if (where?.organizationId) logs = logs.filter(l => l.organizationId === where.organizationId);
        if (where?.actorId) logs = logs.filter(l => l.userId === where.actorId);
        if (orderBy?.createdAt === 'desc') {
          logs = [...logs].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }
        if (typeof take === 'number') logs = logs.slice(0, take);
        return logs.map(log => ({
          id: "pal_dec_".concat(log.id),
          productKey,
          sourceModel,
          sourceId: log.id,
          action: log.action,
          actorId: log.userId,
          targetType: log.entity ?? 'decision',
          targetId: log.decisionId ?? '',
          beforeState: log.before ?? null,
          afterState: log.after ?? null,
          organizationId: log.organizationId ?? '',
          createdAt: log.createdAt,
          metadata: {},
        }));
      }
      let results = filterStore('platformAuditLog', where);
      if (orderBy?.createdAt === 'desc') {
        results = [...results].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }
      if (typeof take === 'number') results = results.slice(0, take);
      return results;
    }),
    create: jest.fn(async ({ data }: any) => {
      const record = { id: "audit_".concat(idCounter++), ...data, createdAt: new Date() }
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
    const record = { id: `audit_${idCounter++}`, ...input, createdAt: new Date() }
    mockStore.platformAuditLog.push(record)
    return { ok: true, id: record.id }
  }),
}))

// Import directly from audit-bridge-service (refactored module)
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
} from '../audit-bridge-service/index'

import type { BridgeEventData } from '../audit-bridge-service/types'

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

// ═══════════════════════════════════════
// bridgeAuditEvent (minimum 3 tests)
// ═══════════════════════════════════════

describe('bridgeAuditEvent', () => {
  beforeEach(() => { resetStores() })

  it('bridges auditos event and returns target log id', async () => {
    const event = makeAuditEventEvent()
    mockStore.auditEvent.push(event)

    const result = await bridgeAuditEvent('auditos', event.id, 'org-1')

    expect(result.ok).toBe(true)
    expect(result.sourceEventId).toBe(event.id)
    expect(result.targetLogId).toMatch(/^audit_/)
  })

  it('bridges decisionos event successfully', async () => {
    const log = makeDecisionAuditLog()
    mockStore.auditLog.push(log)

    const result = await bridgeAuditEvent('decisionos', log.id, 'org-1')

    expect(result.ok).toBe(true)
    expect(result.sourceEventId).toBe(log.id)
    expect(result.targetLogId).toMatch(/^audit_/)
  })

  it('returns error when source is empty', async () => {
    const result = await bridgeAuditEvent('', 'evt-1', 'org-1')
    expect(result.ok).toBe(false)
    expect(result.error).toBe('Source product is required')
  })

  it('returns error when eventId is empty', async () => {
    const result = await bridgeAuditEvent('auditos', '', 'org-1')
    expect(result.ok).toBe(false)
    expect(result.error).toBe('Event ID is required')
  })

  it('returns error when organizationId is empty', async () => {
    const result = await bridgeAuditEvent('auditos', 'evt-1', '')
    expect(result.ok).toBe(false)
    expect(result.error).toBe('Organization ID is required')
  })

  it('returns error for unknown source adapter', async () => {
    const result = await bridgeAuditEvent('unknown_source', 'evt-1', 'org-1')
    expect(result.ok).toBe(false)
    expect(result.error).toBe('No bridge adapter registered for source')
  })

  it('returns error when source event is not found', async () => {
    const result = await bridgeAuditEvent('auditos', 'nonexistent-id', 'org-1')
    expect(result.ok).toBe(false)
    expect(result.error).toBe('Source event not found')
  })

  it('logs FAILED bridge entry when event not found with ruleId', async () => {
    const rule = await createBridgeRule('org-1', {
      name: 'Test Rule',
      source: 'auditos',
      createdById: 'user-1',
    })

    const result = await bridgeAuditEvent('auditos', 'nonexistent-id', 'org-1', rule.id)

    expect(result.ok).toBe(false)
    const logs = mockStore.bridgeLogEntry.filter((l: any) => l.ruleId === rule.id)
    expect(logs).toHaveLength(1)
    expect(logs[0].status).toBe('FAILED')
  })

  it('handles adapter fetch rejection gracefully', async () => {
    mockPrisma.platformAuditLog.findFirst.mockRejectedValueOnce(new Error('DB error') as never)

    const result = await bridgeAuditEvent('auditos', 'evt-1', 'org-1')
    expect(result.ok).toBe(false)
    expect(result.error).toBe('DB error')
  })

  it('logs SUCCESS bridge entry when ruleId is provided', async () => {
    const rule = await createBridgeRule('org-1', {
      name: 'Audit Rule',
      source: 'auditos',
      createdById: 'user-1',
    })
    const event = makeAuditEventEvent()
    mockStore.auditEvent.push(event)

    const result = await bridgeAuditEvent('auditos', event.id, 'org-1', rule.id)

    expect(result.ok).toBe(true)
    const logs = mockStore.bridgeLogEntry.filter((l: any) => l.ruleId === rule.id)
    expect(logs).toHaveLength(1)
    expect(logs[0].status).toBe('SUCCESS')
    expect(logs[0].source).toBe('auditos')
    expect(logs[0].eventType).toBe(event.eventType)
  })
})

// ═══════════════════════════════════════
// bridgeGenericEvent
// ═══════════════════════════════════════

describe('bridgeGenericEvent', () => {
  beforeEach(() => { resetStores() })

  it('bridges a generic event successfully', async () => {
    const data = makeGenericEventData()

    const result = await bridgeGenericEvent(data, 'org-1')

    expect(result.ok).toBe(true)
    expect(result.sourceEventId).toBe(data.sourceId)
    expect(result.targetLogId).toMatch(/^audit_/)
  })

  it('creates bridge log entry when ruleId is provided', async () => {
    const rule = await createBridgeRule('org-1', {
      name: 'Generic Rule',
      source: 'generic',
      createdById: 'user-1',
    })
    const data = makeGenericEventData()

    const result = await bridgeGenericEvent(data, 'org-1', rule.id)

    expect(result.ok).toBe(true)
    const logs = mockStore.bridgeLogEntry.filter((l: any) => l.ruleId === rule.id)
    expect(logs).toHaveLength(1)
    expect(logs[0].status).toBe('SUCCESS')
    expect(logs[0].source).toBe('generic')
  })

  it('returns error when writePlatformAuditLog fails', async () => {
    const { writePlatformAuditLog } = require('@/lib/platform/audit-log')
    writePlatformAuditLog.mockResolvedValueOnce({ ok: false, error: 'Write rejected' })

    const data = makeGenericEventData()
    const result = await bridgeGenericEvent(data, 'org-1')

    expect(result.ok).toBe(false)
    expect(result.error).toBe('Write rejected')
  })
})

// ═══════════════════════════════════════
// bulkBridge (minimum 2 tests)
// ═══════════════════════════════════════

describe('bulkBridge', () => {
  beforeEach(() => { resetStores() })

  it('bridges all events when all succeed', async () => {
    const e1 = makeAuditEventEvent({ eventType: 'A' })
    const e2 = makeAuditEventEvent({ eventType: 'B' })
    const e3 = makeAuditEventEvent({ eventType: 'C' })
    mockStore.auditEvent.push(e1, e2, e3)

    const result = await bulkBridge('auditos', 'org-1', [e1.id, e2.id, e3.id])

    expect(result.totalProcessed).toBe(3)
    expect(result.succeeded).toBe(3)
    expect(result.failed).toBe(0)
    expect(result.results).toHaveLength(3)
    expect(result.results.every((r) => r.ok)).toBe(true)
  })

  it('reports partial failures without crashing', async () => {
    const okEvent = makeAuditEventEvent()
    mockStore.auditEvent.push(okEvent)

    const result = await bulkBridge('auditos', 'org-1', [okEvent.id, 'bad-1', 'bad-2'])

    expect(result.totalProcessed).toBe(3)
    expect(result.succeeded).toBe(1)
    expect(result.failed).toBe(2)
  })

  it('returns empty result for empty event list', async () => {
    const result = await bulkBridge('auditos', 'org-1', [])
    expect(result.totalProcessed).toBe(0)
    expect(result.succeeded).toBe(0)
    expect(result.failed).toBe(0)
    expect(result.results).toHaveLength(0)
  })

  it('handles adapter rejection without stopping other events', async () => {
    const okEvent = makeAuditEventEvent()
    mockStore.auditEvent.push(okEvent)

    mockPrisma.platformAuditLog.findFirst
      .mockResolvedValueOnce(okEvent as never)
      .mockRejectedValueOnce(new Error('Network error') as never)
      .mockResolvedValueOnce(okEvent as never)

    const result = await bulkBridge('auditos', 'org-1', [okEvent.id, 'fail-id', okEvent.id])

    expect(result.totalProcessed).toBe(3)
    expect(result.succeeded).toBe(2)
    expect(result.failed).toBe(1)
  })

  it('correctly reports all failures when all events fail', async () => {
    const result = await bulkBridge('auditos', 'org-1', ['x', 'y', 'z'])
    expect(result.totalProcessed).toBe(3)
    expect(result.succeeded).toBe(0)
    expect(result.failed).toBe(3)
    expect(result.results.every((r) => !r.ok)).toBe(true)
  })
})

// ═══════════════════════════════════════
// verifyBridgeRuleAccess (minimum 2 tests)
// ═══════════════════════════════════════

describe('verifyBridgeRuleAccess', () => {
  beforeEach(() => { resetStores() })

  it('returns false for a non-existent rule', async () => {
    const result = await verifyBridgeRuleAccess('nonexistent-rule', 'org-1')
    expect(result).toBe(false)
  })

  it('returns true when organization matches the rule', async () => {
    const rule = await createBridgeRule('org-1', {
      name: 'Access Check',
      source: 'auditos',
      createdById: 'user-1',
    })

    const result = await verifyBridgeRuleAccess(rule.id, 'org-1')
    expect(result).toBe(true)
  })

  it('returns false when organization does not match the rule', async () => {
    const rule = await createBridgeRule('org-1', {
      name: 'Org Mismatch',
      source: 'auditos',
      createdById: 'user-1',
    })

    const result = await verifyBridgeRuleAccess(rule.id, 'org-2')
    expect(result).toBe(false)
  })

  it('returns false for empty rule id', async () => {
    const result = await verifyBridgeRuleAccess('', 'org-1')
    expect(result).toBe(false)
  })
})

// ═══════════════════════════════════════
// Rules CRUD - create / get / list / update / delete
// ═══════════════════════════════════════

describe('rules CRUD', () => {
  beforeEach(() => { resetStores() })

  it('createBridgeRule rejects empty orgId', async () => {
    await expect(createBridgeRule('', {
      name: 'Test',
      source: 'auditos',
      createdById: 'user-1',
    })).rejects.toThrow(AuditBridgeError)
  })

  it('createBridgeRule rejects empty name', async () => {
    await expect(createBridgeRule('org-1', {
      name: '',
      source: 'auditos',
      createdById: 'user-1',
    })).rejects.toThrow(AuditBridgeError)
  })

  it('createBridgeRule rejects empty source', async () => {
    await expect(createBridgeRule('org-1', {
      name: 'No Source',
      source: '',
      createdById: 'user-1',
    })).rejects.toThrow(AuditBridgeError)
  })

  it('createBridgeRule applies default values when optional fields omitted', async () => {
    const rule = await createBridgeRule('org-1', {
      name: 'Defaults Test',
      source: 'auditos',
      createdById: 'user-1',
    })

    expect(rule.eventTypeFilter).toBe('*')
    expect(rule.isActive).toBe(true)
    expect(rule.maxRetries).toBe(3)
    expect(rule.retryIntervalMs).toBe(60000)
  })

  it('updateBridgeRule throws for non-existent rule', async () => {
    await expect(updateBridgeRule('nonexistent', { name: 'Updated' })).rejects.toThrow(AuditBridgeError)
  })

  it('updateBridgeRule accepts partial updates', async () => {
    const rule = await createBridgeRule('org-1', {
      name: 'Partial Update Test',
      source: 'auditos',
      createdById: 'user-1',
    })

    const updated = await updateBridgeRule(rule.id, { maxRetries: 10, retryIntervalMs: 300000 })

    expect(updated.name).toBe('Partial Update Test')
    expect(updated.maxRetries).toBe(10)
    expect(updated.retryIntervalMs).toBe(300000)
  })

  it('deleteBridgeRule throws for non-existent rule', async () => {
    await expect(deleteBridgeRule('nonexistent')).rejects.toThrow(AuditBridgeError)
  })

  it('deleteBridgeRule removes rule successfully', async () => {
    const rule = await createBridgeRule('org-1', {
      name: 'To Delete',
      source: 'auditos',
      createdById: 'user-1',
    })

    await deleteBridgeRule(rule.id)
    const found = await getBridgeRule(rule.id)
    expect(found).toBeNull()
  })

  it('getBridgeRule returns null for non-existent rule', async () => {
    const result = await getBridgeRule('nonexistent')
    expect(result).toBeNull()
  })

  it('listBridgeRules returns only rules for the specified org', async () => {
    await createBridgeRule('org-1', { name: 'R1', source: 'auditos', createdById: 'u1' })
    await createBridgeRule('org-1', { name: 'R2', source: 'decisionos', createdById: 'u2' })
    await createBridgeRule('org-2', { name: 'R3', source: 'auditos', createdById: 'u3' })

    const org1Rules = await listBridgeRules('org-1')
    expect(org1Rules).toHaveLength(2)

    const org2Rules = await listBridgeRules('org-2')
    expect(org2Rules).toHaveLength(1)

    const emptyRules = await listBridgeRules('org-99')
    expect(emptyRules).toHaveLength(0)
  })

  it('listBridgeRules returns rules sorted by createdAt descending', async () => {
    await createBridgeRule('org-1', { name: 'Alpha', source: 'auditos', createdById: 'u1' })
    await createBridgeRule('org-1', { name: 'Beta', source: 'auditos', createdById: 'u2' })

    const rules = await listBridgeRules('org-1')
    expect(rules.length).toBeGreaterThanOrEqual(2)
    // Verify descending sort by comparing first two
    expect(rules[0].createdAt.getTime()).toBeGreaterThanOrEqual(rules[1].createdAt.getTime())
  })

  it('AuditBridgeError has correct name and message', () => {
    const err = new AuditBridgeError('Something went wrong')
    expect(err.name).toBe('AuditBridgeError')
    expect(err.message).toBe('Something went wrong')
    expect(err).toBeInstanceOf(Error)
  })
})

// ═══════════════════════════════════════
// getBridgeLog
// ═══════════════════════════════════════

describe('getBridgeLog', () => {
  beforeEach(() => { resetStores() })

  it('returns only logs scoped to the given org', async () => {
    const rule = await createBridgeRule('org-1', { name: 'R', source: 'auditos', createdById: 'u1' })

    await bridgeAuditEvent('auditos', 'evt-1', 'org-1', rule.id)
    await bridgeAuditEvent('auditos', 'evt-2', 'org-2', rule.id)

    const org1Logs = await getBridgeLog('org-1')
    expect(org1Logs).toHaveLength(1)

    const org2Logs = await getBridgeLog('org-2')
    expect(org2Logs).toHaveLength(1)
  })

  it('filters logs by status', async () => {
    const rule = await createBridgeRule('org-1', { name: 'R', source: 'auditos', createdById: 'u1' })
    mockStore.auditEvent.push(makeAuditEventEvent({ id: 'evt-fail' }))
    mockStore.auditEvent.push(makeAuditEventEvent({ id: 'evt-ok-1' }))

    const { writePlatformAuditLog } = require('@/lib/platform/audit-log')
    writePlatformAuditLog.mockResolvedValueOnce({ ok: false, error: 'fail' })
    writePlatformAuditLog.mockResolvedValue({ ok: true, id: 'ok' })

    await bridgeAuditEvent('auditos', 'evt-fail', 'org-1', rule.id)
    await bridgeAuditEvent('auditos', 'evt-ok-1', 'org-1', rule.id)

    const failed = await getBridgeLog('org-1', { status: 'FAILED' })
    expect(failed).toHaveLength(1)
    expect(failed[0].status).toBe('FAILED')

    const success = await getBridgeLog('org-1', { status: 'SUCCESS' })
    expect(success).toHaveLength(1)
    expect(success[0].status).toBe('SUCCESS')
  })

  it('filters logs by source', async () => {
    const rule = await createBridgeRule('org-1', { name: 'R', source: 'auditos', createdById: 'u1' })
    mockStore.auditEvent.push(makeAuditEventEvent({ id: 'evt-1' }))
    mockStore.auditEvent.push(makeAuditEventEvent({ id: 'evt-2' }))
    mockStore.auditEvent.push(makeAuditEventEvent({ id: 'evt-3' }))

    await bridgeAuditEvent('auditos', 'evt-1', 'org-1', rule.id)
    await bridgeAuditEvent('auditos', 'evt-2', 'org-1', rule.id)
    await bridgeAuditEvent('auditos', 'evt-3', 'org-1', rule.id)

    const auditLogs = await getBridgeLog('org-1', { source: 'auditos' })
    expect(auditLogs).toHaveLength(3)
  })

  it('respects limit parameter', async () => {
    const rule = await createBridgeRule('org-1', { name: 'R', source: 'auditos', createdById: 'u1' })
    for (let i = 0; i < 10; i++) {
      mockStore.auditEvent.push(makeAuditEventEvent({ id: 'evt-' + i }))
      await bridgeAuditEvent('auditos', 'evt-' + i, 'org-1', rule.id)
    }

    const limited = await getBridgeLog('org-1', { limit: 3 })
    expect(limited).toHaveLength(3)
  })

  it('respects offset parameter', async () => {
    const rule = await createBridgeRule('org-1', { name: 'R', source: 'auditos', createdById: 'u1' })
    for (let i = 0; i < 5; i++) {
      mockStore.auditEvent.push(makeAuditEventEvent({ id: 'evt-' + i }))
      await bridgeAuditEvent('auditos', 'evt-' + i, 'org-1', rule.id)
    }

    const allLogs = await getBridgeLog('org-1')
    const offset2 = await getBridgeLog('org-1', { offset: 2 })
    expect(offset2).toHaveLength(allLogs.length - 2)
  })
})

// ═══════════════════════════════════════
// retryFailed
// ═══════════════════════════════════════

describe('retryFailed', () => {
  beforeEach(() => { resetStores() })

  it('throws for non-existent rule', async () => {
    await expect(retryFailed('nonexistent')).rejects.toThrow(AuditBridgeError)
  })

  it('throws for inactive rule', async () => {
    const rule = await createBridgeRule('org-1', {
      name: 'Inactive Rule',
      source: 'auditos',
      createdById: 'user-1',
    })
    await updateBridgeRule(rule.id, { isActive: false })

    await expect(retryFailed(rule.id)).rejects.toThrow(AuditBridgeError)
  })

  it('returns 0 when no failed entries exist', async () => {
    const rule = await createBridgeRule('org-1', {
      name: 'Clean Rule',
      source: 'auditos',
      createdById: 'user-1',
    })

    const count = await retryFailed(rule.id)
    expect(count).toBe(0)
  })

  it('retries failed entries and returns count', async () => {
    const rule = await createBridgeRule('org-1', {
      name: 'Retry Me',
      source: 'auditos',
      createdById: 'user-1',
    })
    const event = makeAuditEventEvent()
    mockStore.auditEvent.push(event)

    const { writePlatformAuditLog } = require('@/lib/platform/audit-log')
    writePlatformAuditLog.mockResolvedValueOnce({ ok: false, error: 'First fail' })
    writePlatformAuditLog.mockResolvedValue({ ok: true, id: 'success' })

    await bridgeAuditEvent('auditos', event.id, 'org-1', rule.id)

    const failedBefore = mockStore.bridgeLogEntry.filter((l: any) => l.status === 'FAILED')
    expect(failedBefore).toHaveLength(1)

    const retried = await retryFailed(rule.id)
    expect(retried).toBe(1)
  })
})