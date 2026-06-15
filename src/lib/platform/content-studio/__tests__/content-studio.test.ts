import { describe, expect, it, jest, beforeEach } from '@jest/globals'

const mockStore: Record<string, any[]> = {
  contentWorkspace: [],
  contentItem: [],
  contentVersion: [],
  contentTemplate: [],
  platformAuditLog: [],
}

let idCounter = 1

function nextId(prefix = 'cs') {
  return `${prefix}_${idCounter++}`
}

function findInStore(model: string, where: Record<string, any>): any | null {
  return mockStore[model].find((r) =>
    Object.entries(where).every(([k, v]) => r[k] === v),
  ) ?? null
}

function matchesCondition(value: any, condition: any): boolean {
  if (condition === null || condition === undefined) return value === condition
  if (typeof condition !== 'object' || Array.isArray(condition)) return value === condition
  if ('in' in condition) return Array.isArray(condition.in) && condition.in.includes(value)
  if ('not' in condition) {
    if (condition.not === null) return value !== null
    return value !== condition.not
  }
  if ('contains' in condition) return String(value).includes(condition.contains)
  if ('gte' in condition) return value >= condition.gte
  if ('lte' in condition) return value <= condition.lte
  if ('gt' in condition) return value > condition.gt
  if ('lt' in condition) return value < condition.lt
  return value === condition
}

function filterStore(model: string, where?: Record<string, any>): any[] {
  if (!where || Object.keys(where).length === 0) return [...mockStore[model]]
  return mockStore[model].filter((r) =>
    Object.entries(where).every(([k, v]) => {
      if (k === 'AND') return v.every((clause: any) => Object.entries(clause).every(([ck, cv]) => matchesCondition(r[ck], cv)))
      if (k === 'OR') return v.some((clause: any) => Object.entries(clause).every(([ck, cv]) => matchesCondition(r[ck], cv)))
      return matchesCondition(r[k], v)
    }),
  )
}

function resetStores() {
  for (const key of Object.keys(mockStore)) {
    mockStore[key] = []
  }
  idCounter = 1
}

function seedWorkspace(overrides: Record<string, any> = {}) {
  const record = {
    id: overrides.id ?? nextId('ws'),
    organizationId: overrides.organizationId ?? 'org-1',
    name: overrides.name ?? 'Test Workspace',
    description: overrides.description ?? null,
    category: overrides.category ?? null,
    isActive: overrides.isActive ?? true,
    createdById: overrides.createdById ?? 'user-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
  mockStore.contentWorkspace.push(record)
  return record
}

function seedContent(overrides: Record<string, any> = {}) {
  const record = {
    id: overrides.id ?? nextId('cnt'),
    workspaceId: overrides.workspaceId ?? 'ws-1',
    organizationId: overrides.organizationId ?? 'org-1',
    title: overrides.title ?? 'Test Content',
    body: overrides.body ?? 'Content body',
    summary: overrides.summary ?? null,
    locale: overrides.locale ?? 'ar',
    tags: overrides.tags ?? [],
    status: overrides.status ?? 'DRAFT',
    contentType: overrides.contentType ?? 'article',
    version: overrides.version ?? 1,
    templateId: overrides.templateId ?? null,
    createdById: overrides.createdById ?? 'user-1',
    reviewedById: overrides.reviewedById ?? null,
    approvedById: overrides.approvedById ?? null,
    publishedAt: overrides.publishedAt ?? null,
    createdAt: overrides.createdAt ?? new Date(),
    updatedAt: overrides.updatedAt ?? new Date(),
    ...overrides,
  }
  mockStore.contentItem.push(record)
  return record
}

function seedVersion(overrides: Record<string, any> = {}) {
  const record = {
    id: overrides.id ?? nextId('ver'),
    contentId: overrides.contentId ?? 'cnt-1',
    version: overrides.version ?? 1,
    title: overrides.title ?? 'Test Content',
    body: overrides.body ?? 'Content body',
    summary: overrides.summary ?? null,
    tags: overrides.tags ?? [],
    metadata: overrides.metadata ?? null,
    changeSummary: overrides.changeSummary ?? null,
    createdById: overrides.createdById ?? 'user-1',
    createdAt: overrides.createdAt ?? new Date(),
    ...overrides,
  }
  mockStore.contentVersion.push(record)
  return record
}

function seedTemplate(overrides: Record<string, any> = {}) {
  const record = {
    id: overrides.id ?? nextId('tpl'),
    organizationId: overrides.organizationId ?? 'org-1',
    name: overrides.name ?? 'Test Template',
    description: overrides.description ?? null,
    category: overrides.category ?? null,
    bodyTemplate: overrides.bodyTemplate ?? 'Hello {{name}}',
    metadataTemplate: overrides.metadataTemplate ?? null,
    defaultReviewRoles: overrides.defaultReviewRoles ?? [],
    isActive: overrides.isActive ?? true,
    createdById: overrides.createdById ?? 'user-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
  mockStore.contentTemplate.push(record)
  return record
}

const mockPrisma = {
  contentWorkspace: {
    create: jest.fn(async ({ data }: any) => {
      const record = {
        id: nextId('ws'),
        ...data,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      mockStore.contentWorkspace.push(record)
      return record
    }),
    findUnique: jest.fn(async ({ where }: any) => {
      return structuredClone(findInStore('contentWorkspace', where)) ?? null
    }),
    findMany: jest.fn(async ({ where, orderBy }: any) => {
      let results = filterStore('contentWorkspace', where)
      if (orderBy?.createdAt === 'desc') {
        results = [...results].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
      }
      return structuredClone(results)
    }),
    update: jest.fn(async ({ where, data }: any) => {
      const idx = mockStore.contentWorkspace.findIndex((r) => r.id === where.id)
      if (idx === -1) throw new Error('Record not found')
      mockStore.contentWorkspace[idx] = { ...mockStore.contentWorkspace[idx], ...data, updatedAt: new Date() }
      return structuredClone(mockStore.contentWorkspace[idx])
    }),
    deleteMany: jest.fn(async () => {
      const count = mockStore.contentWorkspace.length
      mockStore.contentWorkspace = []
      return { count }
    }),
  },
  contentItem: {
    create: jest.fn(async ({ data }: any) => {
      const record = {
        id: nextId('cnt'),
        ...data,
        status: data.status ?? 'DRAFT',
        version: data.version ?? 1,
        locale: data.locale ?? 'ar',
        tags: data.tags ?? [],
        reviewedById: null,
        approvedById: null,
        publishedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      mockStore.contentItem.push(record)
      return record
    }),
    findUnique: jest.fn(async ({ where }: any) => {
      return structuredClone(findInStore('contentItem', where)) ?? null
    }),
    findMany: jest.fn(async ({ where, orderBy }: any) => {
      let results = filterStore('contentItem', where)
      if (orderBy?.updatedAt === 'desc') {
        results = [...results].sort(
          (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
        )
      }
      return structuredClone(results)
    }),
    update: jest.fn(async ({ where, data }: any) => {
      const idx = mockStore.contentItem.findIndex((r) => r.id === where.id)
      if (idx === -1) throw new Error('Record not found')
      mockStore.contentItem[idx] = { ...mockStore.contentItem[idx], ...data, updatedAt: new Date() }
      return structuredClone(mockStore.contentItem[idx])
    }),
    groupBy: jest.fn(async ({ by, where }: any) => {
      const items = filterStore('contentItem', where)
      const groups: Record<string, any[]> = {}
      for (const item of items) {
        const key = item.status
        if (!groups[key]) groups[key] = []
        groups[key].push(item)
      }
      return Object.entries(groups).map(([status, items]) => ({
        status,
        _count: { id: items.length },
      }))
    }),
    count: jest.fn(async ({ where }: any) => {
      return filterStore('contentItem', where).length
    }),
    deleteMany: jest.fn(async () => {
      const count = mockStore.contentItem.length
      mockStore.contentItem = []
      return { count }
    }),
  },
  contentVersion: {
    create: jest.fn(async ({ data }: any) => {
      const record = {
        id: nextId('ver'),
        ...data,
        tags: data.tags ?? [],
        metadata: data.metadata ?? null,
        createdAt: new Date(),
      }
      mockStore.contentVersion.push(record)
      return record
    }),
    findUnique: jest.fn(async ({ where }: any) => {
      return structuredClone(findInStore('contentVersion', where)) ?? null
    }),
    findMany: jest.fn(async ({ where, orderBy }: any) => {
      let results = filterStore('contentVersion', where)
      if (orderBy?.version === 'desc') {
        results = [...results].sort((a, b) => b.version - a.version)
      }
      return structuredClone(results)
    }),
    count: jest.fn(async ({ where }: any) => {
      return filterStore('contentVersion', where).length
    }),
    deleteMany: jest.fn(async () => {
      const count = mockStore.contentVersion.length
      mockStore.contentVersion = []
      return { count }
    }),
  },
  contentTemplate: {
    create: jest.fn(async ({ data }: any) => {
      const record = {
        id: nextId('tpl'),
        ...data,
        isActive: true,
        defaultReviewRoles: data.defaultReviewRoles ?? [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      mockStore.contentTemplate.push(record)
      return record
    }),
    findUnique: jest.fn(async ({ where }: any) => {
      return structuredClone(findInStore('contentTemplate', where)) ?? null
    }),
    findMany: jest.fn(async ({ where, orderBy }: any) => {
      let results = filterStore('contentTemplate', where)
      if (orderBy?.createdAt === 'desc') {
        results = [...results].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
      }
      return structuredClone(results)
    }),
    deleteMany: jest.fn(async () => {
      const count = mockStore.contentTemplate.length
      mockStore.contentTemplate = []
      return { count }
    }),
  },
  platformAuditLog: {
    create: jest.fn(async ({ data }: any) => {
      const record = { id: `audit_${idCounter++}`, ...data, createdAt: new Date() }
      mockStore.platformAuditLog.push(record)
      return record
    }),
  },
}

jest.mock('@/lib/prisma', () => ({
  prisma: mockPrisma,
}))

jest.mock('@/lib/platform/audit-log', () => ({
  writePlatformAuditLog: jest.fn(async () => ({ ok: true, id: `audit_${idCounter++}` })),
}))

import {
  ContentStudioError,
  createWorkspace,
  getWorkspace,
  listWorkspaces,
  updateWorkspace,
  createContent,
  getContent,
  listContent,
  updateContent,
  approveContent,
  rejectContent,
  publishContent,
  archiveContent,
  createTemplate,
  getTemplate,
  listTemplates,
  createFromTemplate,
  getVersionHistory,
  getVersion,
  restoreVersion,
  getWorkspaceStats,
} from '../index'
import { submitForReview } from '../content-studio-service'

describe('ContentStudioError', () => {
  it('creates error with correct name', () => {
    const err = new ContentStudioError('test error')
    expect(err.name).toBe('ContentStudioError')
    expect(err.message).toBe('test error')
  })
})

describe('createWorkspace', () => {
  beforeEach(async () => {
    resetStores()
  })

  it('creates a workspace with required fields', async () => {
    const ws = await createWorkspace('org-1', { name: 'Marketing Content' }, 'user-1')

    expect(ws.organizationId).toBe('org-1')
    expect(ws.name).toBe('Marketing Content')
    expect(ws.description).toBeNull()
    expect(ws.category).toBeNull()
    expect(ws.isActive).toBe(true)
    expect(ws.createdById).toBe('user-1')
  })

  it('creates a workspace with category', async () => {
    const ws = await createWorkspace('org-1', {
      name: 'Technical Docs',
      description: 'Technical documentation workspace',
      category: 'technical',
    }, 'user-1')

    expect(ws.name).toBe('Technical Docs')
    expect(ws.description).toBe('Technical documentation workspace')
    expect(ws.category).toBe('technical')
  })

  it('throws for empty orgId', async () => {
    await expect(createWorkspace('', { name: 'Test' }, 'user-1')).rejects.toThrow(ContentStudioError)
  })

  it('throws for empty workspace name', async () => {
    await expect(createWorkspace('org-1', { name: '' }, 'user-1')).rejects.toThrow(ContentStudioError)
    await expect(createWorkspace('org-1', { name: '  ' }, 'user-1')).rejects.toThrow(ContentStudioError)
  })
})

describe('getWorkspace', () => {
  beforeEach(async () => {
    resetStores()
  })

  it('returns workspace by id', async () => {
    seedWorkspace({ id: 'ws-1', name: 'My Workspace' })
    const ws = await getWorkspace('ws-1')
    expect(ws).not.toBeNull()
    expect(ws!.id).toBe('ws-1')
    expect(ws!.name).toBe('My Workspace')
  })

  it('returns null for non-existent workspace', async () => {
    const ws = await getWorkspace('nonexistent')
    expect(ws).toBeNull()
  })
})

describe('listWorkspaces', () => {
  beforeEach(async () => {
    resetStores()
  })

  it('lists workspaces scoped to organization', async () => {
    seedWorkspace({ id: 'ws-1', organizationId: 'org-1', name: 'WS 1' })
    seedWorkspace({ id: 'ws-2', organizationId: 'org-1', name: 'WS 2' })
    seedWorkspace({ id: 'ws-3', organizationId: 'org-2', name: 'Other WS' })

    const org1 = await listWorkspaces('org-1')
    expect(org1).toHaveLength(2)

    const org2 = await listWorkspaces('org-2')
    expect(org2).toHaveLength(1)
  })

  it('returns empty array for org with no workspaces', async () => {
    const result = await listWorkspaces('nonexistent')
    expect(result).toEqual([])
  })
})

describe('updateWorkspace', () => {
  beforeEach(async () => {
    resetStores()
    seedWorkspace({ id: 'ws-1', name: 'Original', organizationId: 'org-1' })
  })

  it('updates workspace name and description', async () => {
    const updated = await updateWorkspace('ws-1', { name: 'Updated', description: 'New desc' })

    expect(updated.name).toBe('Updated')
    expect(updated.description).toBe('New desc')
  })

  it('throws for non-existent workspace', async () => {
    await expect(updateWorkspace('nonexistent', { name: 'Test' })).rejects.toThrow(ContentStudioError)
  })
})

describe('createContent', () => {
  beforeEach(async () => {
    resetStores()
    seedWorkspace({ id: 'ws-1', organizationId: 'org-1' })
  })

  it('creates content with required fields', async () => {
    const content = await createContent('ws-1', {
      title: 'My Article',
      body: 'Article body text',
    }, 'user-1')

    expect(content.workspaceId).toBe('ws-1')
    expect(content.organizationId).toBe('org-1')
    expect(content.title).toBe('My Article')
    expect(content.body).toBe('Article body text')
    expect(content.status).toBe('DRAFT')
    expect(content.version).toBe(1)
    expect(content.locale).toBe('ar')
    expect(content.tags).toEqual([])
    expect(content.contentType).toBe('article')
    expect(content.createdById).toBe('user-1')
  })

  it('creates content with all optional fields', async () => {
    const content = await createContent('ws-1', {
      title: 'English Report',
      body: 'Report body',
      summary: 'A short summary',
      locale: 'en',
      tags: ['report', 'quarterly'],
      contentType: 'report',
    }, 'user-1')

    expect(content.title).toBe('English Report')
    expect(content.summary).toBe('A short summary')
    expect(content.locale).toBe('en')
    expect(content.tags).toEqual(['report', 'quarterly'])
    expect(content.contentType).toBe('report')
  })

  it('throws for empty title', async () => {
    await expect(createContent('ws-1', { title: '', body: 'body' }, 'user-1')).rejects.toThrow(ContentStudioError)
  })

  it('throws for non-existent workspace', async () => {
    await expect(createContent('nonexistent', { title: 'Test', body: 'body' }, 'user-1')).rejects.toThrow(ContentStudioError)
  })

  it('allows empty body', async () => {
    const content = await createContent('ws-1', { title: 'Empty Body', body: '' }, 'user-1')
    expect(content.body).toBe('')
  })
})

describe('getContent', () => {
  beforeEach(async () => {
    resetStores()
  })

  it('returns content by id', async () => {
    seedContent({ id: 'cnt-1', title: 'Find Me' })
    const c = await getContent('cnt-1')
    expect(c).not.toBeNull()
    expect(c!.title).toBe('Find Me')
  })

  it('returns null for non-existent content', async () => {
    const c = await getContent('nonexistent')
    expect(c).toBeNull()
  })
})

describe('listContent', () => {
  beforeEach(async () => {
    resetStores()
  })

  it('lists content scoped to workspace', async () => {
    seedContent({ id: 'cnt-1', workspaceId: 'ws-1', title: 'A' })
    seedContent({ id: 'cnt-2', workspaceId: 'ws-1', title: 'B' })
    seedContent({ id: 'cnt-3', workspaceId: 'ws-2', title: 'C' })

    const ws1 = await listContent('ws-1')
    expect(ws1).toHaveLength(2)

    const ws2 = await listContent('ws-2')
    expect(ws2).toHaveLength(1)
  })

  it('filters content by status', async () => {
    seedContent({ id: 'cnt-1', workspaceId: 'ws-1', status: 'DRAFT', title: 'Draft' })
    seedContent({ id: 'cnt-2', workspaceId: 'ws-1', status: 'PUBLISHED', title: 'Published' })
    seedContent({ id: 'cnt-3', workspaceId: 'ws-1', status: 'DRAFT', title: 'Draft 2' })

    const drafts = await listContent('ws-1', { status: 'DRAFT' })
    expect(drafts).toHaveLength(2)

    const published = await listContent('ws-1', { status: 'PUBLISHED' })
    expect(published).toHaveLength(1)
  })
})

describe('updateContent', () => {
  beforeEach(async () => {
    resetStores()
    seedContent({ id: 'cnt-1', workspaceId: 'ws-1', title: 'Original', body: 'Original body', version: 1 })
  })

  it('updates content fields and increments version', async () => {
    const updated = await updateContent('cnt-1', { title: 'Updated', body: 'Updated body' }, 'user-2')

    expect(updated.title).toBe('Updated')
    expect(updated.body).toBe('Updated body')
    expect(updated.version).toBe(2)
  })

  it('creates version snapshot on update', async () => {
    await updateContent('cnt-1', { title: 'V2', body: 'V2 body' }, 'user-2')

    const versions = mockStore.contentVersion.filter((v: any) => v.contentId === 'cnt-1')
    expect(versions).toHaveLength(1)
    expect(versions[0].title).toBe('Original')
    expect(versions[0].body).toBe('Original body')
    expect(versions[0].version).toBe(1)
  })

  it('stores change summary in version', async () => {
    await updateContent('cnt-1', { title: 'V2', body: 'V2 body', changeSummary: 'Updated title' }, 'user-2')

    const versions = mockStore.contentVersion.filter((v: any) => v.contentId === 'cnt-1')
    expect(versions[0].changeSummary).toBe('Updated title')
  })

  it('throws for non-existent content', async () => {
    await expect(updateContent('nonexistent', { title: 'Test' }, 'user-1')).rejects.toThrow(ContentStudioError)
  })
})

describe('content status transitions', () => {
  beforeEach(async () => {
    resetStores()
    seedContent({ id: 'cnt-1', workspaceId: 'ws-1', title: 'Flow Content', status: 'DRAFT' })
  })

  it('submitForReview: DRAFT → IN_REVIEW', async () => {
    const result = await submitForReview('cnt-1', 'user-2')
    expect(result.status).toBe('IN_REVIEW')
    expect(result.reviewedById).toBe('user-2')

    const stored = mockStore.contentItem.find((c: any) => c.id === 'cnt-1')
    expect(stored.status).toBe('IN_REVIEW')
  })

  it('submitForReview throws for non-DRAFT content', async () => {
    mockStore.contentItem[0].status = 'PUBLISHED'
    await expect(submitForReview('cnt-1', 'user-2')).rejects.toThrow(ContentStudioError)
  })

  it('approveContent: IN_REVIEW → APPROVED', async () => {
    mockStore.contentItem[0].status = 'IN_REVIEW'
    const result = await approveContent('cnt-1', 'user-2', 'Looks good')
    expect(result.status).toBe('APPROVED')
    expect(result.approvedById).toBe('user-2')
  })

  it('approveContent throws for non-IN_REVIEW content', async () => {
    await expect(approveContent('cnt-1', 'user-2')).rejects.toThrow(ContentStudioError)
  })

  it('rejectContent: IN_REVIEW → DRAFT', async () => {
    mockStore.contentItem[0].status = 'IN_REVIEW'
    const result = await rejectContent('cnt-1', 'user-2', 'Needs revisions')
    expect(result.status).toBe('DRAFT')
  })

  it('rejectContent throws with empty reason', async () => {
    mockStore.contentItem[0].status = 'IN_REVIEW'
    await expect(rejectContent('cnt-1', 'user-2', '')).rejects.toThrow(ContentStudioError)
    await expect(rejectContent('cnt-1', 'user-2', '  ')).rejects.toThrow(ContentStudioError)
  })

  it('rejectContent throws for non-IN_REVIEW content', async () => {
    await expect(rejectContent('cnt-1', 'user-2', 'Reason')).rejects.toThrow(ContentStudioError)
  })

  it('publishContent: APPROVED → PUBLISHED', async () => {
    mockStore.contentItem[0].status = 'APPROVED'
    const result = await publishContent('cnt-1', 'user-2')
    expect(result.status).toBe('PUBLISHED')
    expect(result.publishedAt).not.toBeNull()
  })

  it('publishContent throws for non-APPROVED content', async () => {
    mockStore.contentItem[0].status = 'DRAFT'
    await expect(publishContent('cnt-1', 'user-2')).rejects.toThrow(ContentStudioError)
  })

  it('archiveContent: PUBLISHED → ARCHIVED', async () => {
    mockStore.contentItem[0].status = 'PUBLISHED'
    const result = await archiveContent('cnt-1', 'user-2')
    expect(result.status).toBe('ARCHIVED')
  })

  it('archiveContent throws for non-PUBLISHED content', async () => {
    mockStore.contentItem[0].status = 'DRAFT'
    await expect(archiveContent('cnt-1', 'user-2')).rejects.toThrow(ContentStudioError)
  })

  it('full lifecycle transitions correctly', async () => {
    expect(mockStore.contentItem[0].status).toBe('DRAFT')

    await submitForReview('cnt-1', 'user-2')
    expect(mockStore.contentItem.find((c: any) => c.id === 'cnt-1').status).toBe('IN_REVIEW')

    await approveContent('cnt-1', 'user-2')
    expect(mockStore.contentItem.find((c: any) => c.id === 'cnt-1').status).toBe('APPROVED')

    await publishContent('cnt-1', 'user-2')
    expect(mockStore.contentItem.find((c: any) => c.id === 'cnt-1').status).toBe('PUBLISHED')

    await archiveContent('cnt-1', 'user-2')
    expect(mockStore.contentItem.find((c: any) => c.id === 'cnt-1').status).toBe('ARCHIVED')
  })

  it('reject transitions back to DRAFT and allows resubmit', async () => {
    mockStore.contentItem[0].status = 'IN_REVIEW'

    await rejectContent('cnt-1', 'user-2', 'Fix this')
    expect(mockStore.contentItem.find((c: any) => c.id === 'cnt-1').status).toBe('DRAFT')

    await submitForReview('cnt-1', 'user-3')
    expect(mockStore.contentItem.find((c: any) => c.id === 'cnt-1').status).toBe('IN_REVIEW')
  })
})

describe('createTemplate', () => {
  beforeEach(async () => {
    resetStores()
  })

  it('creates a template with required fields', async () => {
    const tpl = await createTemplate('org-1', {
      name: 'Policy Memo',
      bodyTemplate: '# {{title}}\n\n{{body}}',
    }, 'user-1')

    expect(tpl.organizationId).toBe('org-1')
    expect(tpl.name).toBe('Policy Memo')
    expect(tpl.bodyTemplate).toBe('# {{title}}\n\n{{body}}')
    expect(tpl.defaultReviewRoles).toEqual([])
    expect(tpl.isActive).toBe(true)
  })

  it('creates a template with all optional fields', async () => {
    const tpl = await createTemplate('org-1', {
      name: 'Report Template',
      description: 'For quarterly reports',
      category: 'reporting',
      bodyTemplate: 'Report: {{title}}',
      metadataTemplate: { department: '{{dept}}' },
      defaultReviewRoles: ['editor', 'manager'],
    }, 'user-1')

    expect(tpl.description).toBe('For quarterly reports')
    expect(tpl.category).toBe('reporting')
    expect(tpl.defaultReviewRoles).toEqual(['editor', 'manager'])
  })

  it('throws for empty orgId', async () => {
    await expect(createTemplate('', { name: 'Test', bodyTemplate: 'body' }, 'user-1')).rejects.toThrow(ContentStudioError)
  })

  it('throws for empty template name', async () => {
    await expect(createTemplate('org-1', { name: '', bodyTemplate: 'body' }, 'user-1')).rejects.toThrow(ContentStudioError)
  })

  it('throws for empty body template', async () => {
    await expect(createTemplate('org-1', { name: 'Test', bodyTemplate: '' }, 'user-1')).rejects.toThrow(ContentStudioError)
  })
})

describe('getTemplate / listTemplates', () => {
  beforeEach(async () => {
    resetStores()
  })

  it('returns template by id', async () => {
    seedTemplate({ id: 'tpl-1', name: 'My Template' })
    const tpl = await getTemplate('tpl-1')
    expect(tpl).not.toBeNull()
    expect(tpl!.name).toBe('My Template')
  })

  it('returns null for non-existent template', async () => {
    const tpl = await getTemplate('nonexistent')
    expect(tpl).toBeNull()
  })

  it('lists templates by organization', async () => {
    seedTemplate({ id: 'tpl-1', organizationId: 'org-1', name: 'T1' })
    seedTemplate({ id: 'tpl-2', organizationId: 'org-1', name: 'T2' })
    seedTemplate({ id: 'tpl-3', organizationId: 'org-2', name: 'T3' })

    const org1 = await listTemplates('org-1')
    expect(org1).toHaveLength(2)

    const org2 = await listTemplates('org-2')
    expect(org2).toHaveLength(1)
  })
})

describe('createFromTemplate', () => {
  beforeEach(async () => {
    resetStores()
    seedWorkspace({ id: 'ws-1', organizationId: 'org-1' })
    seedTemplate({
      id: 'tpl-1',
      organizationId: 'org-1',
      name: 'Welcome Letter',
      bodyTemplate: 'Dear {{name}},\n\nWelcome to {{organization}}.\n\nBest regards,\n{{sender}}',
      metadataTemplate: { title: 'Welcome: {{name}}' },
    })
  })

  it('creates content with variable substitution', async () => {
    const content = await createFromTemplate('tpl-1', 'ws-1', 'user-1', {
      name: 'Ahmed',
      organization: 'AQLIYA',
      sender: 'Management',
    })

    expect(content.title).toBe('Welcome: Ahmed')
    expect(content.body).toContain('Dear Ahmed')
    expect(content.body).toContain('Welcome to AQLIYA')
    expect(content.body).toContain('Management')
    expect(content.templateId).toBe('tpl-1')
  })

  it('creates content without variables (uses placeholder as-is)', async () => {
    const content = await createFromTemplate('tpl-1', 'ws-1', 'user-1')

    expect(content.body).toContain('Dear {{name}}')
    expect(content.templateId).toBe('tpl-1')
  })

  it('throws for non-existent template', async () => {
    await expect(createFromTemplate('nonexistent', 'ws-1', 'user-1')).rejects.toThrow(ContentStudioError)
  })

  it('throws for non-existent workspace', async () => {
    await expect(createFromTemplate('tpl-1', 'nonexistent', 'user-1')).rejects.toThrow(ContentStudioError)
  })
})

describe('getVersionHistory / getVersion', () => {
  beforeEach(async () => {
    resetStores()
    seedVersion({ id: 'ver-1', contentId: 'cnt-1', version: 1, title: 'V1' })
    seedVersion({ id: 'ver-2', contentId: 'cnt-1', version: 2, title: 'V2' })
    seedVersion({ id: 'ver-3', contentId: 'cnt-2', version: 1, title: 'Other' })
  })

  it('lists versions for content in descending order', async () => {
    const versions = await getVersionHistory('cnt-1')
    expect(versions).toHaveLength(2)
    expect(versions[0].version).toBe(2)
    expect(versions[1].version).toBe(1)
  })

  it('returns empty array for content with no versions', async () => {
    const versions = await getVersionHistory('nonexistent')
    expect(versions).toEqual([])
  })

  it('returns specific version by id', async () => {
    const ver = await getVersion('ver-1')
    expect(ver).not.toBeNull()
    expect(ver!.id).toBe('ver-1')
    expect(ver!.version).toBe(1)
    expect(ver!.title).toBe('V1')
  })

  it('returns null for non-existent version', async () => {
    const ver = await getVersion('nonexistent')
    expect(ver).toBeNull()
  })
})

describe('restoreVersion', () => {
  beforeEach(async () => {
    resetStores()
    seedContent({ id: 'cnt-1', title: 'Current', body: 'Current body', version: 3 })
    seedVersion({ id: 'ver-1', contentId: 'cnt-1', version: 1, title: 'Original Title', body: 'Original body', tags: ['original'] })
  })

  it('restores content to a previous version and increments version', async () => {
    const restored = await restoreVersion('ver-1', 'user-2')

    expect(restored.title).toBe('Original Title')
    expect(restored.body).toBe('Original body')
    expect(restored.tags).toEqual(['original'])
    expect(restored.version).toBe(4)
  })

  it('creates a snapshot of current version before restoring', async () => {
    await restoreVersion('ver-1', 'user-2')

    const versions = mockStore.contentVersion.filter((v: any) => v.contentId === 'cnt-1')
    const currentSnapshot = versions.find((v: any) => v.version === 3)
    expect(currentSnapshot).toBeDefined()
    expect(currentSnapshot.title).toBe('Current')
    expect(currentSnapshot.body).toBe('Current body')
  })

  it('throws for non-existent version', async () => {
    await expect(restoreVersion('nonexistent', 'user-1')).rejects.toThrow(ContentStudioError)
  })

  it('throws when content no longer exists', async () => {
    const missingContentId = 'ver-orphan'
    seedVersion({ id: missingContentId, contentId: 'cnt-missing', version: 1 })
    await expect(restoreVersion(missingContentId, 'user-1')).rejects.toThrow(ContentStudioError)
  })
})

describe('getWorkspaceStats', () => {
  beforeEach(async () => {
    resetStores()
    seedWorkspace({ id: 'ws-1', organizationId: 'org-1' })
    seedContent({ id: 'cnt-1', workspaceId: 'ws-1', status: 'PUBLISHED', title: 'Published 1' })
    seedContent({ id: 'cnt-2', workspaceId: 'ws-1', status: 'PUBLISHED', title: 'Published 2' })
    seedContent({ id: 'cnt-3', workspaceId: 'ws-1', status: 'DRAFT', title: 'Draft 1' })
    seedContent({ id: 'cnt-4', workspaceId: 'ws-1', status: 'IN_REVIEW', title: 'In Review' })
    seedContent({ id: 'cnt-5', workspaceId: 'ws-1', status: 'ARCHIVED', title: 'Archived' })
    seedContent({ id: 'cnt-6', workspaceId: 'ws-1', status: 'PUBLISHED', title: 'With Template', templateId: 'tpl-1' })
    seedVersion({ contentId: 'cnt-1', version: 1 })
    seedVersion({ contentId: 'cnt-1', version: 2 })
    seedVersion({ contentId: 'cnt-2', version: 1 })
  })

  it('returns correct content counts', async () => {
    const stats = await getWorkspaceStats('ws-1')
    expect(stats.totalContent).toBe(6)
    expect(stats.publishedPercentage).toBe(50)
  })

  it('returns correct status breakdown', async () => {
    const stats = await getWorkspaceStats('ws-1')
    expect(stats.contentByStatus['PUBLISHED']).toBe(3)
    expect(stats.contentByStatus['DRAFT']).toBe(1)
    expect(stats.contentByStatus['IN_REVIEW']).toBe(1)
    expect(stats.contentByStatus['ARCHIVED']).toBe(1)
  })

  it('returns version and template counts', async () => {
    const stats = await getWorkspaceStats('ws-1')
    expect(stats.totalVersions).toBe(3)
    expect(stats.templatesUsed).toBe(1)
  })

  it('throws for non-existent workspace', async () => {
    await expect(getWorkspaceStats('nonexistent')).rejects.toThrow(ContentStudioError)
  })
})

describe('tenant isolation', () => {
  beforeEach(async () => {
    resetStores()
    seedWorkspace({ id: 'ws-1', organizationId: 'org-1', name: 'Org 1 WS' })
    seedWorkspace({ id: 'ws-2', organizationId: 'org-2', name: 'Org 2 WS' })
  })

  it('listWorkspaces does not leak across organizations', async () => {
    const org1 = await listWorkspaces('org-1')
    const org2 = await listWorkspaces('org-2')

    expect(org1).toHaveLength(1)
    expect(org1[0].id).toBe('ws-1')

    expect(org2).toHaveLength(1)
    expect(org2[0].id).toBe('ws-2')
  })

  it('listTemplates does not leak across organizations', async () => {
    seedTemplate({ id: 'tpl-1', organizationId: 'org-1', name: 'Org 1 Tpl' })
    seedTemplate({ id: 'tpl-2', organizationId: 'org-2', name: 'Org 2 Tpl' })

    const org1 = await listTemplates('org-1')
    expect(org1).toHaveLength(1)
    expect(org1[0].id).toBe('tpl-1')
  })
})
