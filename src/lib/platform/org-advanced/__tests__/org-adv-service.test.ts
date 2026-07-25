import { describe, expect, it, jest, beforeEach } from '@jest/globals'

// ─── In-Memory Store (self-contained) ───

interface StoredRecord {
  [key: string]: unknown
}

const mockStore: Record<string, StoredRecord[]> = {
  organization: [],
  orgHierarchyNode: [],
  orgSetting: [],
  orgLifecycleEvent: [],
  user: [],
}

let idCounter = 1

function nextId(prefix = 'rec'): string {
  return `${prefix}_${idCounter++}`
}

function resetStores(): void {
  for (const key of Object.keys(mockStore)) {
    mockStore[key] = []
  }
  idCounter = 1
}

function findInStore(model: string, where: Record<string, unknown>): StoredRecord | null {
  return mockStore[model].find((r) =>
    Object.entries(where).every(([k, v]) => r[k] === v),
  ) ?? null
}

function matchWhere(record: StoredRecord, where: Record<string, unknown>): boolean {
  return Object.entries(where).every(([k, v]) => {
    if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
      const op = v as Record<string, unknown>
      if (op.in !== undefined && Array.isArray(op.in)) {
        return (op.in as unknown[]).includes(record[k])
      }
      if (k === 'createdAt' || k.endsWith('At')) {
        const recordDate = record[k] as Date
        if (op.gte && recordDate < (op.gte as Date)) return false
        if (op.lte && recordDate > (op.lte as Date)) return false
        return true
      }
      return false
    }
    return record[k] === v
  })
}

function filterStore(model: string, where?: Record<string, unknown>): StoredRecord[] {
  if (!where || Object.keys(where).length === 0) return [...mockStore[model]]
  return mockStore[model].filter((r) => matchWhere(r, where))
}

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj))
}

// ─── Mock Prisma ────────────────────────────────────────

function createMockPrisma() {
  return {
    organization: {
      findUnique: jest.fn(async ({ where }: { where: Record<string, unknown> }) => {
        const found = findInStore('organization', where)
        return found ? deepClone(found) : null
      }),
      findMany: jest.fn(async ({ where }: { where?: Record<string, unknown> } = {}) => {
        return deepClone(filterStore('organization', where))
      }),
    },
    orgHierarchyNode: {
      findFirst: jest.fn(async ({ where }: { where: Record<string, unknown> } = {}) => {
        const found = findInStore('orgHierarchyNode', where ?? {})
        return found ? deepClone(found) : null
      }),
      findMany: jest.fn(async ({ where, orderBy }: { where?: Record<string, unknown>; orderBy?: Record<string, string> } = {}) => {
        let results = filterStore('orgHierarchyNode', where)
        if (orderBy?.sortOrder === 'asc') {
          results = [...results].sort((a, b) => (a.sortOrder as number) - (b.sortOrder as number))
        }
        return deepClone(results)
      }),
      create: jest.fn(async ({ data }: { data: Record<string, unknown> }) => {
        const record = {
          id: nextId('hier'),
          ...data,
          metadata: data.metadata ?? null,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        mockStore.orgHierarchyNode.push(record)
        return deepClone(record)
      }),
    },
    orgSetting: {
      findUnique: jest.fn(async ({ where }: { where: Record<string, unknown> }) => {
        if (where.organizationId_key) {
          const { organizationId, key } = where.organizationId_key as Record<string, string>
          const found = findInStore('orgSetting', { organizationId, key })
          return found ? deepClone(found) : null
        }
        return null
      }),
      findMany: jest.fn(async ({ where }: { where?: Record<string, unknown> } = {}) => {
        return deepClone(filterStore('orgSetting', where))
      }),
      upsert: jest.fn(async ({ where, create, update }: { where: Record<string, unknown>; create: Record<string, unknown>; update: Record<string, unknown> }) => {
        const { organizationId, key } = (where.organizationId_key ?? where) as Record<string, string>
        const existing = findInStore('orgSetting', { organizationId, key })
        if (existing) {
          const idx = mockStore.orgSetting.findIndex((r) => r.id === existing.id)
          mockStore.orgSetting[idx] = { ...mockStore.orgSetting[idx], ...update, updatedAt: new Date() }
          return deepClone(mockStore.orgSetting[idx])
        }
        const record = { id: nextId('set'), ...create, createdAt: new Date(), updatedAt: new Date() }
        mockStore.orgSetting.push(record)
        return deepClone(record)
      }),
      delete: jest.fn(async ({ where }: { where: Record<string, unknown> }) => {
        const { organizationId, key } = (where.organizationId_key ?? where) as Record<string, string>
        const idx = mockStore.orgSetting.findIndex(
          (r) => r.organizationId === organizationId && r.key === key,
        )
        if (idx !== -1) {
          mockStore.orgSetting.splice(idx, 1)
        }
        return { count: idx !== -1 ? 1 : 0 }
      }),
    },
    orgLifecycleEvent: {
      create: jest.fn(async ({ data }: { data: Record<string, unknown> }) => {
        const record = {
          id: nextId('evt'),
          ...data,
          metadata: data.metadata ?? null,
          createdAt: new Date(),
        }
        mockStore.orgLifecycleEvent.push(record)
        return deepClone(record)
      }),
      findMany: jest.fn(async ({ where, orderBy }: { where?: Record<string, unknown>; orderBy?: Record<string, string> } = {}) => {
        let results = filterStore('orgLifecycleEvent', where)
        if (orderBy?.createdAt === 'desc') {
          results = [...results].sort(
            (a, b) => new Date(b.createdAt as Date).getTime() - new Date(a.createdAt as Date).getTime(),
          )
        }
        return deepClone(results)
      }),
    },
    user: {
      findMany: jest.fn(async ({ where }: { where?: Record<string, unknown> } = {}) => {
        return deepClone(filterStore('user', where))
      }),
    },
  }
}

const mockPrisma = createMockPrisma()

jest.mock('@/lib/prisma', () => ({
  prisma: mockPrisma,
}))

jest.mock('@/lib/platform/audit-log', () => ({
  writePlatformAuditLog: jest.fn(async () => ({ ok: true, id: 'audit-' + String(idCounter++) })),
}))

// ─── Import from service barrel ─────────────────────────

import {
  OrgAdvError,
  createOrgNode,
  getOrgTree,
  getChildOrgs,
  getParentChain,
  getOrgSetting,
  setOrgSetting,
  getOrgSettings,
  deleteOrgSetting,
  recordLifecycleEvent,
  getLifecycleEvents,
  getOrgHealth,
} from '../org-adv-service'

// ─── Seed helpers ───────────────────────────────────────

function seedOrg(overrides: Record<string, unknown> = {}) {
  const record = {
    id: overrides.id ?? 'org-1',
    name: overrides.name ?? 'Test Organization',
    slug: overrides.slug ?? 'test-org',
    domain: overrides.domain ?? null,
    metadata: overrides.metadata ?? null,
    isActive: overrides.isActive ?? true,
    createdById: overrides.createdById ?? 'user-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  }
  mockStore.organization.push(record)
  return record
}

function seedHierarchyNode(overrides: Record<string, unknown> = {}) {
  const record = {
    id: overrides.id ?? nextId('hier'),
    organizationId: overrides.organizationId ?? 'org-1',
    parentOrgId: overrides.parentOrgId ?? null,
    level: overrides.level ?? 0,
    sortOrder: overrides.sortOrder ?? 0,
    metadata: overrides.metadata ?? null,
    createdById: overrides.createdById ?? 'user-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  }
  mockStore.orgHierarchyNode.push(record)
  return record
}

function seedSetting(overrides: Record<string, unknown> = {}) {
  const record = {
    id: overrides.id ?? nextId('set'),
    organizationId: overrides.organizationId ?? 'org-1',
    key: overrides.key ?? 'default_locale',
    value: overrides.value ?? 'ar',
    createdById: overrides.createdById ?? 'user-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  }
  mockStore.orgSetting.push(record)
  return record
}

function seedUser(overrides: Record<string, unknown> = {}) {
  const record = {
    id: overrides.id ?? 'user-1',
    email: overrides.email ?? 'user@test.com',
    name: overrides.name ?? 'Test User',
    organizationId: overrides.organizationId ?? 'org-1',
    createdAt: new Date(),
  }
  mockStore.user.push(record)
  return record
}

function seedLifecycleEvent(overrides: Record<string, unknown> = {}) {
  const record = {
    id: overrides.id ?? nextId('evt'),
    organizationId: overrides.organizationId ?? 'org-1',
    eventType: overrides.eventType ?? 'CREATED',
    description: overrides.description ?? 'Organization created',
    metadata: overrides.metadata ?? null,
    actorId: overrides.actorId ?? 'user-1',
    createdAt: overrides.createdAt ?? new Date(),
  }
  mockStore.orgLifecycleEvent.push(record)
  return record
}

// ────────────────────────────────────────────────────────
// Hierarchy — org tree
// ────────────────────────────────────────────────────────
describe('org-adv-service / Hierarchy Tree', () => {
  beforeEach(() => { resetStores() })

  it('creates root node at level 0', async () => {
    seedOrg({ id: 'org-root' })
    const node = await createOrgNode('org-root', null, 'user-1')
    expect(node.organizationId).toBe('org-root')
    expect(node.parentOrgId).toBeNull()
    expect(node.level).toBe(0)
    expect(node.createdById).toBe('user-1')
    expect(node.id).toBeTruthy()
  })

  it('creates child node with incremented level', async () => {
    seedOrg({ id: 'parent' })
    seedOrg({ id: 'child' })
    seedHierarchyNode({ organizationId: 'parent', level: 2 })

    const node = await createOrgNode('child', 'parent', 'user-1')
    expect(node.level).toBe(3)
    expect(node.parentOrgId).toBe('parent')
  })

  it('prevents self-parent assignment', async () => {
    seedOrg({ id: 'org-1' })
    await expect(createOrgNode('org-1', 'org-1', 'user-1')).rejects.toThrow(OrgAdvError)
    await expect(createOrgNode('org-1', 'org-1', 'user-1')).rejects.toThrow(
      'An organization cannot be its own parent',
    )
  })

  it('rejects duplicate hierarchy node', async () => {
    seedOrg({ id: 'org-1' })
    seedHierarchyNode({ organizationId: 'org-1' })
    await expect(createOrgNode('org-1', null, 'user-1')).rejects.toThrow(OrgAdvError)
    await expect(createOrgNode('org-1', null, 'user-1')).rejects.toThrow(
      'Hierarchy node already exists for this organization',
    )
  })

  it('getOrgTree returns all descendants recursively', async () => {
    seedHierarchyNode({ organizationId: 'root', level: 0 })
    seedHierarchyNode({ organizationId: 'a', parentOrgId: 'root', level: 1 })
    seedHierarchyNode({ organizationId: 'b', parentOrgId: 'root', level: 1 })
    seedHierarchyNode({ organizationId: 'a1', parentOrgId: 'a', level: 2 })
    seedHierarchyNode({ organizationId: 'a2', parentOrgId: 'a', level: 2 })

    const tree = await getOrgTree('root')
    expect(tree).toHaveLength(4)
    const ids = tree.map((n) => n.organizationId)
    expect(ids).toEqual(expect.arrayContaining(['a', 'b', 'a1', 'a2']))
  })

  it('getOrgTree returns empty for org with no hierarchy node', async () => {
    const tree = await getOrgTree('nonexistent')
    expect(tree).toEqual([])
  })

  it('getChildOrgs returns direct children sorted by sortOrder', async () => {
    seedHierarchyNode({ organizationId: 'root', level: 0 })
    seedHierarchyNode({ organizationId: 'z-child', parentOrgId: 'root', level: 1, sortOrder: 2 })
    seedHierarchyNode({ organizationId: 'a-child', parentOrgId: 'root', level: 1, sortOrder: 1 })

    const children = await getChildOrgs('root')
    expect(children).toHaveLength(2)
    expect(children[0].organizationId).toBe('a-child')
    expect(children[1].organizationId).toBe('z-child')
  })

  it('getChildOrgs returns empty for leaf node', async () => {
    seedHierarchyNode({ organizationId: 'leaf', level: 3 })
    const children = await getChildOrgs('leaf')
    expect(children).toEqual([])
  })

  it('getParentChain walks from deep node to root', async () => {
    seedHierarchyNode({ organizationId: 'gp', level: 0 })
    seedHierarchyNode({ organizationId: 'parent', parentOrgId: 'gp', level: 1 })
    seedHierarchyNode({ organizationId: 'child', parentOrgId: 'parent', level: 2 })

    const chain = await getParentChain('child')
    expect(chain).toHaveLength(3)
    expect(chain[0].organizationId).toBe('child')
    expect(chain[1].organizationId).toBe('parent')
    expect(chain[2].organizationId).toBe('gp')
  })

  it('getParentChain returns empty for missing org', async () => {
    const chain = await getParentChain('nonexistent')
    expect(chain).toEqual([])
  })
})

// ────────────────────────────────────────────────────────
// Settings CRUD
// ────────────────────────────────────────────────────────
describe('org-adv-service / Settings CRUD', () => {
  beforeEach(() => { resetStores() })

  it('creates a new setting via upsert', async () => {
    seedOrg({ id: 'org-1' })
    const setting = await setOrgSetting('org-1', 'default_locale', 'en', 'user-1')
    expect(setting.key).toBe('default_locale')
    expect(setting.value).toBe('en')
    expect(setting.organizationId).toBe('org-1')
  })

  it('updates an existing setting', async () => {
    seedOrg({ id: 'org-1' })
    seedSetting({ organizationId: 'org-1', key: 'timezone', value: 'America/New_York' })

    const updated = await setOrgSetting('org-1', 'timezone', 'Asia/Riyadh', 'user-1')
    expect(updated.key).toBe('timezone')
    expect(updated.value).toBe('Asia/Riyadh')
  })

  it('rejects setting with empty value', async () => {
    seedOrg({ id: 'org-1' })
    await expect(setOrgSetting('org-1', 'key', '', 'user-1')).rejects.toThrow(OrgAdvError)
    await expect(setOrgSetting('org-1', 'key', '   ', 'user-1')).rejects.toThrow(OrgAdvError)
  })

  it('getOrgSetting returns null for missing key', async () => {
    const setting = await getOrgSetting('org-1', 'nonexistent_key')
    expect(setting).toBeNull()
  })

  it('getOrgSettings returns defaults for unset known settings', async () => {
    seedSetting({ organizationId: 'org-1', key: 'default_locale', value: 'en' })

    const settings = await getOrgSettings('org-1')
    expect(settings.default_locale).toBe('en')
    expect(settings.timezone).toBe('Asia/Riyadh')
    expect(settings.max_users).toBe('100')
    expect(settings.require_mfa).toBe('false')
    expect(settings.content_approval_required).toBe('true')
  })

  it('deleteOrgSetting silently removes existing setting', async () => {
    seedSetting({ organizationId: 'org-1', key: 'timezone', value: 'UTC' })
    expect(mockStore.orgSetting.length).toBe(1)

    await deleteOrgSetting('org-1', 'timezone')
    expect(mockStore.orgSetting.length).toBe(0)
  })

  it('deleteOrgSetting silently handles missing setting', async () => {
    await expect(deleteOrgSetting('org-1', 'nonexistent')).resolves.toBeUndefined()
  })
})

// ────────────────────────────────────────────────────────
// Lifecycle Events
// ────────────────────────────────────────────────────────
describe('org-adv-service / Lifecycle Events', () => {
  beforeEach(() => { resetStores() })

  it('records a lifecycle event with metadata', async () => {
    const event = await recordLifecycleEvent(
      'org-1', 'CREATED', 'Organization created', 'user-1',
      { source: 'import', plan: 'enterprise' },
    )
    expect(event.organizationId).toBe('org-1')
    expect(event.eventType).toBe('CREATED')
    expect(event.description).toBe('Organization created')
    expect(event.metadata).toEqual({ source: 'import', plan: 'enterprise' })
  })

  it('throws on missing event description', async () => {
    await expect(recordLifecycleEvent('org-1', 'CREATED', '', 'user-1')).rejects.toThrow(OrgAdvError)
  })

  it('getLifecycleEvents filters by event type', async () => {
    seedLifecycleEvent({ organizationId: 'org-1', eventType: 'CREATED' })
    seedLifecycleEvent({ organizationId: 'org-1', eventType: 'UPDATED' })
    seedLifecycleEvent({ organizationId: 'org-1', eventType: 'SUSPENDED' })

    const filtered = await getLifecycleEvents('org-1', { eventType: 'SUSPENDED' })
    expect(filtered).toHaveLength(1)
    expect(filtered[0].eventType).toBe('SUSPENDED')
  })

  it('getLifecycleEvents filters by date range', async () => {
    const now = new Date()
    seedLifecycleEvent({ organizationId: 'org-1', eventType: 'CREATED', createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000) })

    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    const lastWeek = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const events = await getLifecycleEvents('org-1', { fromDate: lastWeek, toDate: nextWeek })
    expect(events).toHaveLength(1)
  })
})

// ────────────────────────────────────────────────────────
// Health Checks
// ────────────────────────────────────────────────────────
describe('org-adv-service / Health Checks', () => {
  beforeEach(() => {
    resetStores()
    seedOrg({ id: 'org-health' })
  })

  it('returns minimum score (20) for bare org with no critical events', async () => {
    const health = await getOrgHealth('org-health')
    expect(health.score).toBe(20)
    expect(health.breakdown.hasSettings.score).toBe(0)
    expect(health.breakdown.hasActiveUsers.score).toBe(0)
    expect(health.breakdown.noCriticalEvents.score).toBe(20)
  })

  it('returns 100 for fully configured org', async () => {
    seedSetting({ organizationId: 'org-health', key: 'timezone', value: 'Asia/Riyadh' })
    seedUser({ organizationId: 'org-health' })
    seedHierarchyNode({ organizationId: 'org-health' })
    seedLifecycleEvent({
      organizationId: 'org-health', eventType: 'UPDATED',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    })

    const health = await getOrgHealth('org-health')
    expect(health.score).toBe(100)
    expect(health.breakdown.hasSettings.score).toBe(20)
    expect(health.breakdown.hasActiveUsers.score).toBe(25)
    expect(health.breakdown.hasHierarchy.score).toBe(15)
    expect(health.breakdown.recentActivity.score).toBe(20)
    expect(health.breakdown.noCriticalEvents.score).toBe(20)
  })

  it('deducts critical events score when SUSPENDED exists', async () => {
    seedLifecycleEvent({ organizationId: 'org-health', eventType: 'SUSPENDED', createdAt: new Date() })
    const health = await getOrgHealth('org-health')
    expect(health.breakdown.noCriticalEvents.score).toBe(0)
  })

  it('deducts critical events score when MERGED exists', async () => {
    seedLifecycleEvent({ organizationId: 'org-health', eventType: 'MERGED', createdAt: new Date() })
    const health = await getOrgHealth('org-health')
    expect(health.breakdown.noCriticalEvents.score).toBe(0)
  })

  it('reports breakdown details for all dimensions', async () => {
    const health = await getOrgHealth('org-health')
    const b = health.breakdown
    expect(b.hasSettings.detail).toBeTruthy()
    expect(b.hasActiveUsers.detail).toBeTruthy()
    expect(b.hasHierarchy.detail).toBeTruthy()
    expect(b.recentActivity.detail).toBeTruthy()
    expect(b.noCriticalEvents.detail).toBeTruthy()
    expect(b.hasSettings.max).toBe(20)
    expect(b.hasActiveUsers.max).toBe(25)
    expect(b.hasHierarchy.max).toBe(15)
    expect(b.recentActivity.max).toBe(20)
    expect(b.noCriticalEvents.max).toBe(20)
  })

  it('throws when orgId is empty', async () => {
    await expect(getOrgHealth('')).rejects.toThrow(OrgAdvError)
  })
})

// ────────────────────────────────────────────────────────
// Edge Cases — Input validation
// ────────────────────────────────────────────────────────
describe('org-adv-service / Input Validation Edge Cases', () => {
  beforeEach(() => { resetStores() })

  it('rejects createOrgNode with empty orgId', async () => {
    await expect(createOrgNode('', null, 'user-1')).rejects.toThrow(OrgAdvError)
  })

  it('rejects createOrgNode with empty userId', async () => {
    await expect(createOrgNode('org-1', null, '')).rejects.toThrow(OrgAdvError)
  })

  it('rejects getOrgSetting with empty key', async () => {
    await expect(getOrgSetting('org-1', '')).rejects.toThrow(OrgAdvError)
  })

  it('rejects setOrgSetting with empty userId', async () => {
    await expect(setOrgSetting('org-1', 'key', 'val', '')).rejects.toThrow(OrgAdvError)
  })

  it('rejects getLifecycleEvents with empty orgId', async () => {
    await expect(getLifecycleEvents('')).rejects.toThrow(OrgAdvError)
  })

  it('accepts custom sortOrder and metadata on createOrgNode', async () => {
    seedOrg({ id: 'org-custom' })
    const node = await createOrgNode('org-custom', null, 'user-1', {
      sortOrder: 42,
      metadata: { region: 'KSA', tier: 'gold' },
    })
    expect(node.sortOrder).toBe(42)
    expect(node.metadata).toEqual({ region: 'KSA', tier: 'gold' })
  })
})
