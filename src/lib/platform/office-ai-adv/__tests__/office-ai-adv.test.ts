import { describe, expect, it, jest, beforeEach, afterAll } from '@jest/globals'

jest.useFakeTimers()
jest.setSystemTime(new Date('2026-06-05T12:00:00Z'))

const mockStore: Record<string, any[]> = {
  officeAiWorkflowTemplate: [],
  officeAiSchedule: [],
  officeAiRoleConfig: [],
  officeAiTask: [],
}

let idCounter = 1

function nextId(prefix = 'rec') {
  return `${prefix}_${idCounter++}`
}

function findInStore(model: string, where: Record<string, any>): any | null {
  return mockStore[model].find((r) =>
    Object.entries(where).every(([k, v]) => r[k] === v),
  ) ?? null
}

function matchesWhere(record: any, where: Record<string, any>): boolean {
  return Object.entries(where).every(([key, condition]) => {
    const val = record[key]
    if (condition !== null && typeof condition === 'object' && !(condition instanceof Date) && !Array.isArray(condition)) {
      if ('equals' in condition) return val === condition.equals
      if ('gte' in condition && 'lte' in condition) return val >= condition.gte && val <= condition.lte
      if ('gte' in condition) return val >= condition.gte
      if ('lte' in condition) return val <= condition.lte
      if ('in' in condition) return condition.in.includes(val)
      return false
    }
    if (condition instanceof Date && val instanceof Date) {
      return val.getTime() === condition.getTime()
    }
    return val === condition
  })
}

function filterStore(model: string, where?: Record<string, any>): any[] {
  if (!where || Object.keys(where).length === 0) return [...mockStore[model]]
  return mockStore[model].filter((r) => matchesWhere(r, where))
}

function resetStores() {
  for (const key of Object.keys(mockStore)) {
    mockStore[key] = []
  }
  idCounter = 1
}

const mockPrisma = {
  officeAiTask: {
    create: jest.fn(async ({ data }: any) => {
      const record = {
        id: nextId('task'),
        createdAt: new Date(),
        updatedAt: new Date(),
        ...data,
      }
      mockStore.officeAiTask.push(record)
      return record
    }),
    findMany: jest.fn(async ({ where, orderBy }: any) => {
      let results = filterStore('officeAiTask', where)
      if (orderBy?.createdAt === 'desc') {
        results = [...results].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
      }
      return results
    }),
    findUnique: jest.fn(async ({ where }: any) => {
      return findInStore('officeAiTask', where) ?? null
    }),
    deleteMany: jest.fn(async () => {
      const count = mockStore.officeAiTask.length
      mockStore.officeAiTask = []
      return { count }
    }),
  },
  officeAiWorkflowTemplate: {
    create: jest.fn(async ({ data }: any) => {
      const record = {
        id: nextId('tmpl'),
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      mockStore.officeAiWorkflowTemplate.push(record)
      return record
    }),
    findUnique: jest.fn(async ({ where }: any) => {
      return findInStore('officeAiWorkflowTemplate', where) ?? null
    }),
    findMany: jest.fn(async ({ where, orderBy }: any) => {
      let results = filterStore('officeAiWorkflowTemplate', where)
      if (orderBy?.createdAt === 'desc') {
        results = [...results].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
      }
      return results
    }),
    deleteMany: jest.fn(async () => {
      const count = mockStore.officeAiWorkflowTemplate.length
      mockStore.officeAiWorkflowTemplate = []
      return { count }
    }),
  },
  officeAiSchedule: {
    create: jest.fn(async ({ data }: any) => {
      const record = {
        id: nextId('sched'),
        ...data,
        lastRunAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      mockStore.officeAiSchedule.push(record)
      return record
    }),
    findUnique: jest.fn(async ({ where }: any) => {
      return findInStore('officeAiSchedule', where) ?? null
    }),
    findMany: jest.fn(async ({ where, orderBy }: any) => {
      let results = filterStore('officeAiSchedule', where)
      if (orderBy?.nextRunAt === 'asc') {
        results = [...results].sort(
          (a, b) => new Date(a.nextRunAt).getTime() - new Date(b.nextRunAt).getTime(),
        )
      }
      return results
    }),
    update: jest.fn(async ({ where, data }: any) => {
      const idx = mockStore.officeAiSchedule.findIndex((r) => r.id === where.id)
      if (idx === -1) throw new Error('Record not found')
      mockStore.officeAiSchedule[idx] = {
        ...mockStore.officeAiSchedule[idx],
        ...data,
        updatedAt: new Date(),
      }
      return mockStore.officeAiSchedule[idx]
    }),
    deleteMany: jest.fn(async () => {
      const count = mockStore.officeAiSchedule.length
      mockStore.officeAiSchedule = []
      return { count }
    }),
  },
  officeAiRoleConfig: {
    create: jest.fn(async ({ data }: any) => {
      const record = {
        id: nextId('role'),
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      mockStore.officeAiRoleConfig.push(record)
      return record
    }),
    findFirst: jest.fn(async ({ where }: any) => {
      return findInStore('officeAiRoleConfig', where) ?? null
    }),
    deleteMany: jest.fn(async () => {
      const count = mockStore.officeAiRoleConfig.length
      mockStore.officeAiRoleConfig = []
      return { count }
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
  OfficeAiAdvError,
  createWorkflowTemplate,
  getWorkflowTemplate,
  listWorkflowTemplates,
  instantiateWorkflow,
  createSchedule,
  getSchedule,
  listSchedules,
  processDueSchedules,
  createRoleConfig,
  getRoleConfig,
  getTaskStats,
  ADV_STRINGS,
} from '../index'

// ─── createWorkflowTemplate ───

describe('createWorkflowTemplate', () => {
  beforeEach(() => resetStores())

  const validSteps = [
    { stepOrder: 0, title: 'Upload Documents', description: 'Upload {{type}} documents', taskType: 'document_summary', defaultPriority: 'MEDIUM', assignedRoleSlug: 'auditor', estimatedHours: 2 },
    { stepOrder: 1, title: 'Analyze', description: 'Analyze {{type}} for {{client}}', taskType: 'excel_analysis', defaultPriority: 'HIGH', assignedRoleSlug: 'manager', estimatedHours: 4 },
  ]

  it('creates a workflow template with valid data', async () => {
    const tpl = await createWorkflowTemplate('org-1', { name: 'Test Template', steps: validSteps }, 'user-1')
    expect(tpl.organizationId).toBe('org-1')
    expect(tpl.name).toBe('Test Template')
    expect(tpl.steps).toHaveLength(2)
    expect(tpl.isActive).toBe(true)
    expect(tpl.createdById).toBe('user-1')
  })

  it('throws if orgId is empty', async () => {
    await expect(createWorkflowTemplate('', { name: 'T', steps: validSteps }, 'u-1')).rejects.toThrow(OfficeAiAdvError)
  })

  it('throws if userId is empty', async () => {
    await expect(createWorkflowTemplate('org-1', { name: 'T', steps: validSteps }, '')).rejects.toThrow(OfficeAiAdvError)
  })

  it('throws if name is empty', async () => {
    await expect(createWorkflowTemplate('org-1', { name: '', steps: validSteps }, 'u-1')).rejects.toThrow(OfficeAiAdvError)
  })

  it('throws if steps is empty', async () => {
    await expect(createWorkflowTemplate('org-1', { name: 'T', steps: [] }, 'u-1')).rejects.toThrow(OfficeAiAdvError)
  })

  it('throws if a step has no title', async () => {
    const badSteps = [{ stepOrder: 0, title: '', description: 'x', taskType: 'sum', defaultPriority: 'LOW', assignedRoleSlug: 'auditor', estimatedHours: 1 }]
    await expect(createWorkflowTemplate('org-1', { name: 'T', steps: badSteps }, 'u-1')).rejects.toThrow(OfficeAiAdvError)
  })

  it('throws if a step has negative stepOrder', async () => {
    const badSteps = [{ stepOrder: -1, title: 'X', description: 'x', taskType: 'sum', defaultPriority: 'LOW', assignedRoleSlug: 'auditor', estimatedHours: 1 }]
    await expect(createWorkflowTemplate('org-1', { name: 'T', steps: badSteps }, 'u-1')).rejects.toThrow(OfficeAiAdvError)
  })

  it('throws if a step has no taskType', async () => {
    const badSteps = [{ stepOrder: 0, title: 'X', description: 'x', taskType: '', defaultPriority: 'LOW', assignedRoleSlug: 'auditor', estimatedHours: 1 }]
    await expect(createWorkflowTemplate('org-1', { name: 'T', steps: badSteps }, 'u-1')).rejects.toThrow(OfficeAiAdvError)
  })

  it('sets isActive to false when specified', async () => {
    const tpl = await createWorkflowTemplate('org-1', { name: 'Inactive', steps: [validSteps[0]], isActive: false }, 'u-1')
    expect(tpl.isActive).toBe(false)
  })
})

// ─── getWorkflowTemplate / listWorkflowTemplates ───

describe('getWorkflowTemplate / listWorkflowTemplates', () => {
  beforeEach(() => resetStores())

  it('returns null for non-existent template', async () => {
    const tpl = await getWorkflowTemplate('nonexistent')
    expect(tpl).toBeNull()
  })

  it('returns template by id', async () => {
    const created = await createWorkflowTemplate('org-1', {
      name: 'Find Me', steps: [{ stepOrder: 0, title: 'Step 1', description: 'Do something', taskType: 'document_summary', defaultPriority: 'MEDIUM', assignedRoleSlug: 'auditor', estimatedHours: 1 }],
    }, 'u-1')
    const found = await getWorkflowTemplate(created.id)
    expect(found).not.toBeNull()
    expect(found!.id).toBe(created.id)
    expect(found!.name).toBe('Find Me')
  })

  it('lists templates scoped to organization', async () => {
    const step = { stepOrder: 0, title: 'S1', description: 'x', taskType: 'document_summary', defaultPriority: 'LOW', assignedRoleSlug: 'a', estimatedHours: 1 }
    await createWorkflowTemplate('org-1', { name: 'A', steps: [step] }, 'u-1')
    await createWorkflowTemplate('org-1', { name: 'B', steps: [step] }, 'u-1')
    await createWorkflowTemplate('org-2', { name: 'C', steps: [step] }, 'u-2')

    const org1 = await listWorkflowTemplates('org-1')
    expect(org1).toHaveLength(2)
    const org2 = await listWorkflowTemplates('org-2')
    expect(org2).toHaveLength(1)
    const empty = await listWorkflowTemplates('org-3')
    expect(empty).toHaveLength(0)
  })
})

// ─── instantiateWorkflow ───

describe('instantiateWorkflow', () => {
  beforeEach(() => resetStores())

  const step = { stepOrder: 0, title: 'Review {{document}}', description: 'Analyze {{document}} for {{client}}', taskType: 'document_summary', defaultPriority: 'HIGH', assignedRoleSlug: 'auditor', estimatedHours: 3 }

  it('creates tasks from template steps with variable substitution', async () => {
    const tpl = await createWorkflowTemplate('org-1', {
      name: 'Doc Review', steps: [step],
    }, 'u-1')

    const tasks = await instantiateWorkflow(tpl.id, 'u-1', { document: 'Q4 Report', client: 'ACME Corp' })
    expect(tasks).toHaveLength(1)
    expect(tasks[0].title).toBe('Review Q4 Report')
    expect(tasks[0].instructions).toBe('Analyze Q4 Report for ACME Corp')
    expect(tasks[0].platformOrganizationId).toBe('org-1')
    expect(tasks[0].taskType).toBe('document_summary')
  })

  it('creates multiple tasks for multi-step templates', async () => {
    const tpl = await createWorkflowTemplate('org-1', {
      name: 'Multi',
      steps: [
        { stepOrder: 0, title: 'Step A', description: 'First', taskType: 'document_summary', defaultPriority: 'MEDIUM', assignedRoleSlug: 'auditor', estimatedHours: 1 },
        { stepOrder: 1, title: 'Step B', description: 'Second', taskType: 'excel_analysis', defaultPriority: 'HIGH', assignedRoleSlug: 'manager', estimatedHours: 2 },
      ],
    }, 'u-1')

    const tasks = await instantiateWorkflow(tpl.id, 'u-1', {})
    expect(tasks).toHaveLength(2)
  })

  it('throws if template not found', async () => {
    await expect(instantiateWorkflow('nonexistent', 'u-1', {})).rejects.toThrow(OfficeAiAdvError)
  })

  it('throws if template is inactive', async () => {
    const tpl = await createWorkflowTemplate('org-1', {
      name: 'Inactive', steps: [step], isActive: false,
    }, 'u-1')
    await expect(instantiateWorkflow(tpl.id, 'u-1', { document: 'R', client: 'C' })).rejects.toThrow(OfficeAiAdvError)
  })

  it('throws if required variable is missing', async () => {
    const tpl = await createWorkflowTemplate('org-1', {
      name: 'VarTest', steps: [step],
    }, 'u-1')
    await expect(instantiateWorkflow(tpl.id, 'u-1', { document: 'OnlyDoc' })).rejects.toThrow(OfficeAiAdvError)
  })

  it('stores workflow metadata in each task', async () => {
    const tpl = await createWorkflowTemplate('org-1', {
      name: 'Meta',
      steps: [{ stepOrder: 0, title: 'Do {{x}}', description: 'Do {{x}}', taskType: 'document_summary', defaultPriority: 'HIGH', assignedRoleSlug: 'lead', estimatedHours: 5 }],
    }, 'u-1')

    const tasks = await instantiateWorkflow(tpl.id, 'u-1', { x: 'task' })
    expect(tasks[0].metadata.workflowTemplateId).toBe(tpl.id)
    expect(tasks[0].metadata.stepOrder).toBe(0)
    expect(tasks[0].metadata.assignedRoleSlug).toBe('lead')
    expect(tasks[0].metadata.estimatedHours).toBe(5)
  })
})

// ─── createSchedule ───

describe('createSchedule', () => {
  beforeEach(() => resetStores())

  const baseConfig = { taskType: 'document_summary', title: 'Weekly Report' }

  it('creates a DAILY schedule', async () => {
    const sched = await createSchedule('org-1', {
      name: 'Daily Digest', taskConfig: baseConfig, recurrence: 'DAILY',
      nextRunAt: new Date('2026-06-06T09:00:00Z'),
    }, 'u-1')
    expect(sched.organizationId).toBe('org-1')
    expect(sched.recurrence).toBe('DAILY')
    expect(sched.isActive).toBe(true)
  })

  it('creates a WEEKLY schedule', async () => {
    const sched = await createSchedule('org-1', {
      name: 'Weekly Summary', taskConfig: baseConfig, recurrence: 'WEEKLY',
      nextRunAt: new Date('2026-06-08T09:00:00Z'),
    }, 'u-1')
    expect(sched.recurrence).toBe('WEEKLY')
  })

  it('creates a MONTHLY schedule', async () => {
    const sched = await createSchedule('org-1', {
      name: 'Monthly Review', taskConfig: baseConfig, recurrence: 'MONTHLY',
      nextRunAt: new Date('2026-07-01T09:00:00Z'),
    }, 'u-1')
    expect(sched.recurrence).toBe('MONTHLY')
  })

  it('throws for invalid recurrence', async () => {
    await expect(createSchedule('org-1', {
      name: 'Bad', taskConfig: baseConfig, recurrence: 'YEARLY',
      nextRunAt: new Date(),
    }, 'u-1')).rejects.toThrow(OfficeAiAdvError)
  })

  it('throws if name is empty', async () => {
    await expect(createSchedule('org-1', {
      name: '', taskConfig: baseConfig, recurrence: 'DAILY',
      nextRunAt: new Date(),
    }, 'u-1')).rejects.toThrow(OfficeAiAdvError)
  })

  it('throws if orgId is empty', async () => {
    await expect(createSchedule('', {
      name: 'S', taskConfig: baseConfig, recurrence: 'DAILY',
      nextRunAt: new Date(),
    }, 'u-1')).rejects.toThrow(OfficeAiAdvError)
  })
})

// ─── getSchedule / listSchedules ───

describe('getSchedule / listSchedules', () => {
  beforeEach(() => resetStores())

  it('returns null for non-existent schedule', async () => {
    expect(await getSchedule('nonexistent')).toBeNull()
  })

  it('returns schedule by id', async () => {
    const created = await createSchedule('org-1', {
      name: 'Find Me', taskConfig: { taskType: 'report_draft' }, recurrence: 'WEEKLY',
      nextRunAt: new Date('2026-06-10T09:00:00Z'),
    }, 'u-1')
    const found = await getSchedule(created.id)
    expect(found).not.toBeNull()
    expect(found!.id).toBe(created.id)
    expect(found!.name).toBe('Find Me')
  })

  it('lists schedules scoped to organization', async () => {
    const cfg = { taskType: 'summary' }
    await createSchedule('org-1', { name: 'S1', taskConfig: cfg, recurrence: 'DAILY', nextRunAt: new Date() }, 'u-1')
    await createSchedule('org-1', { name: 'S2', taskConfig: cfg, recurrence: 'WEEKLY', nextRunAt: new Date() }, 'u-1')
    await createSchedule('org-2', { name: 'S3', taskConfig: cfg, recurrence: 'MONTHLY', nextRunAt: new Date() }, 'u-2')

    const org1 = await listSchedules('org-1')
    expect(org1).toHaveLength(2)
    const org2 = await listSchedules('org-2')
    expect(org2).toHaveLength(1)
  })
})

// ─── processDueSchedules ───

describe('processDueSchedules', () => {
  beforeEach(() => resetStores())

  it('creates tasks for due schedules and updates nextRunAt', async () => {
    const past = new Date('2026-06-01T09:00:00Z')
    await createSchedule('org-1', {
      name: 'Due Daily', taskConfig: { taskType: 'document_summary', title: 'Daily Task' },
      recurrence: 'DAILY', nextRunAt: past,
    }, 'u-1')

    const created = await processDueSchedules()
    expect(created).toBe(1)
    expect(mockStore.officeAiTask).toHaveLength(1)
    expect(mockStore.officeAiTask[0].title).toBe('Daily Task')
    expect(mockStore.officeAiTask[0].platformOrganizationId).toBe('org-1')

    const updated = mockStore.officeAiSchedule[0]
    expect(updated.lastRunAt.getTime()).toBe(new Date().getTime())
    expect(updated.nextRunAt.getTime()).toBe(new Date('2026-06-02T09:00:00Z').getTime())
  })

  it('processes multiple due schedules', async () => {
    const past = new Date('2026-06-01T09:00:00Z')
    await createSchedule('org-1', { name: 'S1', taskConfig: { taskType: 'summary' }, recurrence: 'DAILY', nextRunAt: past }, 'u-1')
    await createSchedule('org-1', { name: 'S2', taskConfig: { taskType: 'analysis' }, recurrence: 'WEEKLY', nextRunAt: past }, 'u-1')
    await createSchedule('org-1', { name: 'S3', taskConfig: { taskType: 'draft' }, recurrence: 'MONTHLY', nextRunAt: new Date('2099-01-01') }, 'u-1')

    const created = await processDueSchedules()
    expect(created).toBe(2)
    expect(mockStore.officeAiTask).toHaveLength(2)
  })

  it('does nothing when no schedules are due', async () => {
    const future = new Date('2099-12-31T09:00:00Z')
    await createSchedule('org-1', { name: 'Future', taskConfig: { taskType: 'summary' }, recurrence: 'DAILY', nextRunAt: future }, 'u-1')

    const created = await processDueSchedules()
    expect(created).toBe(0)
    expect(mockStore.officeAiTask).toHaveLength(0)
  })

  it('does not process inactive schedules', async () => {
    const past = new Date('2026-06-01T09:00:00Z')
    await createSchedule('org-1', {
      name: 'Inactive', taskConfig: { taskType: 'summary' },
      recurrence: 'DAILY', nextRunAt: past, isActive: false,
    }, 'u-1')

    const created = await processDueSchedules()
    expect(created).toBe(0)
  })
})

// ─── createRoleConfig ───

describe('createRoleConfig', () => {
  beforeEach(() => resetStores())

  it('creates role config with defaults', async () => {
    const rc = await createRoleConfig('org-1', { roleSlug: 'auditor' }, 'u-1')
    expect(rc.organizationId).toBe('org-1')
    expect(rc.roleSlug).toBe('auditor')
    expect(rc.maxTasksPerDay).toBe(10)
    expect(rc.requireApproval).toBe(false)
    expect(rc.autoAssignThreshold).toBe(5)
    expect(rc.responseStyle).toBe('BALANCED')
    expect(rc.confidenceThreshold).toBe(0.7)
  })

  it('creates role config with custom values', async () => {
    const rc = await createRoleConfig('org-1', {
      roleSlug: 'manager',
      maxTasksPerDay: 20,
      allowedTaskTypes: ['document_summary', 'excel_analysis'],
      requireApproval: true,
      autoAssignThreshold: 3,
      responseStyle: 'CONCISE',
      confidenceThreshold: 0.85,
    }, 'u-1')
    expect(rc.maxTasksPerDay).toBe(20)
    expect(rc.allowedTaskTypes).toEqual(['document_summary', 'excel_analysis'])
    expect(rc.requireApproval).toBe(true)
    expect(rc.autoAssignThreshold).toBe(3)
    expect(rc.responseStyle).toBe('CONCISE')
    expect(rc.confidenceThreshold).toBe(0.85)
  })

  it('throws for invalid confidence threshold', async () => {
    await expect(createRoleConfig('org-1', { roleSlug: 'a', confidenceThreshold: 1.5 }, 'u-1')).rejects.toThrow(OfficeAiAdvError)
    await expect(createRoleConfig('org-1', { roleSlug: 'a', confidenceThreshold: -0.1 }, 'u-1')).rejects.toThrow(OfficeAiAdvError)
  })

  it('throws for negative autoAssignThreshold', async () => {
    await expect(createRoleConfig('org-1', { roleSlug: 'a', autoAssignThreshold: -1 }, 'u-1')).rejects.toThrow(OfficeAiAdvError)
  })

  it('throws for invalid maxTasksPerDay', async () => {
    await expect(createRoleConfig('org-1', { roleSlug: 'a', maxTasksPerDay: 0 }, 'u-1')).rejects.toThrow(OfficeAiAdvError)
  })

  it('throws for missing roleSlug', async () => {
    await expect(createRoleConfig('org-1', { roleSlug: '' }, 'u-1')).rejects.toThrow(OfficeAiAdvError)
  })

  it('throws for invalid responseStyle', async () => {
    await expect(createRoleConfig('org-1', { roleSlug: 'a', responseStyle: 'VERBOSE' }, 'u-1')).rejects.toThrow(OfficeAiAdvError)
  })
})

// ─── getRoleConfig ───

describe('getRoleConfig', () => {
  beforeEach(() => resetStores())

  it('returns role config for specific role', async () => {
    await createRoleConfig('org-1', { roleSlug: 'auditor', responseStyle: 'DETAILED' }, 'u-1')
    await createRoleConfig('org-1', { roleSlug: 'manager' }, 'u-1')

    const rc = await getRoleConfig('org-1', 'auditor')
    expect(rc).not.toBeNull()
    expect(rc!.roleSlug).toBe('auditor')
    expect(rc!.responseStyle).toBe('DETAILED')
  })

  it('returns null if role config not found', async () => {
    const rc = await getRoleConfig('org-1', 'nonexistent')
    expect(rc).toBeNull()
  })

  it('scopes by organization', async () => {
    await createRoleConfig('org-1', { roleSlug: 'auditor' }, 'u-1')
    const rc = await getRoleConfig('org-2', 'auditor')
    expect(rc).toBeNull()
  })
})

// ─── getTaskStats ───

describe('getTaskStats', () => {
  beforeEach(() => resetStores())

  it('returns zero stats when no tasks exist', async () => {
    const stats = await getTaskStats('org-1')
    expect(stats.total).toBe(0)
    expect(stats.completed).toBe(0)
    expect(stats.overdue).toBe(0)
    expect(stats.completionRate).toBe(0)
    expect(stats.overdueRate).toBe(0)
    expect(stats.byType).toEqual({})
  })

  it('counts total and completed tasks', async () => {
    await mockPrisma.officeAiTask.create({ data: { platformOrganizationId: 'org-1', taskType: 'summary', status: 'finalized', title: 'Done', language: 'ar' } })
    await mockPrisma.officeAiTask.create({ data: { platformOrganizationId: 'org-1', taskType: 'analysis', status: 'approved', title: 'Approved', language: 'ar' } })
    await mockPrisma.officeAiTask.create({ data: { platformOrganizationId: 'org-1', taskType: 'draft', status: 'draft', title: 'Pending', language: 'ar' } })
    await mockPrisma.officeAiTask.create({ data: { platformOrganizationId: 'org-2', taskType: 'summary', status: 'finalized', title: 'Other', language: 'ar' } })

    const stats = await getTaskStats('org-1')
    expect(stats.total).toBe(3)
    expect(stats.completed).toBe(2)
    expect(stats.completionRate).toBeCloseTo(2 / 3)
  })

  it('counts overdue tasks (not finalized/approved/archived)', async () => {
    await mockPrisma.officeAiTask.create({ data: { platformOrganizationId: 'org-1', taskType: 'summary', status: 'draft', title: 'Draft', language: 'ar' } })
    await mockPrisma.officeAiTask.create({ data: { platformOrganizationId: 'org-1', taskType: 'analysis', status: 'needs_review', title: 'In Review', language: 'ar' } })
    await mockPrisma.officeAiTask.create({ data: { platformOrganizationId: 'org-1', taskType: 'report', status: 'archived', title: 'Archived', language: 'ar' } })
    await mockPrisma.officeAiTask.create({ data: { platformOrganizationId: 'org-1', taskType: 'done', status: 'finalized', title: 'Final', language: 'ar' } })

    const stats = await getTaskStats('org-1')
    expect(stats.overdue).toBe(2)
    expect(stats.overdueRate).toBeCloseTo(0.5)
  })

  it('groups by task type', async () => {
    await mockPrisma.officeAiTask.create({ data: { platformOrganizationId: 'org-1', taskType: 'summary', status: 'draft', title: 'A', language: 'ar' } })
    await mockPrisma.officeAiTask.create({ data: { platformOrganizationId: 'org-1', taskType: 'summary', status: 'finalized', title: 'B', language: 'ar' } })
    await mockPrisma.officeAiTask.create({ data: { platformOrganizationId: 'org-1', taskType: 'analysis', status: 'draft', title: 'C', language: 'ar' } })

    const stats = await getTaskStats('org-1')
    expect(stats.byType).toEqual({ summary: 2, analysis: 1 })
  })

  it('respects custom period', async () => {
    const oldDate = new Date('2025-01-01')
    const recentDate = new Date('2026-06-01')

    await mockPrisma.officeAiTask.create({ data: { platformOrganizationId: 'org-1', taskType: 'old', status: 'finalized', title: 'Old', language: 'ar', createdAt: oldDate } })
    await mockPrisma.officeAiTask.create({ data: { platformOrganizationId: 'org-1', taskType: 'recent', status: 'draft', title: 'Recent', language: 'ar', createdAt: recentDate } })

    const stats = await getTaskStats('org-1', { start: new Date('2026-05-01'), end: new Date('2026-07-01') })
    expect(stats.total).toBe(1)
    expect(stats.byType).toEqual({ recent: 1 })
  })
})

// ─── Edge Cases ───

describe('edge cases', () => {
  beforeEach(() => resetStores())

  it('handles template with no variables', async () => {
    const tpl = await createWorkflowTemplate('org-1', {
      name: 'No Vars',
      steps: [{ stepOrder: 0, title: 'Static Title', description: 'Static description', taskType: 'document_summary', defaultPriority: 'LOW', assignedRoleSlug: 'auditor', estimatedHours: 1 }],
    }, 'u-1')
    const tasks = await instantiateWorkflow(tpl.id, 'u-1', {})
    expect(tasks).toHaveLength(1)
    expect(tasks[0].title).toBe('Static Title')
    expect(tasks[0].instructions).toBe('Static description')
  })

  it('processDueSchedules with WEEKLY recurrence', async () => {
    const past = new Date('2026-05-01T09:00:00Z')
    await createSchedule('org-1', {
      name: 'Weekly Process', taskConfig: { taskType: 'report_draft' },
      recurrence: 'WEEKLY', nextRunAt: past,
    }, 'u-1')

    await processDueSchedules()
    const updated = mockStore.officeAiSchedule[0]
    expect(updated.lastRunAt.getTime()).toBe(new Date().getTime())
    const expectedNext = new Date(past)
    expectedNext.setDate(expectedNext.getDate() + 7)
    expect(updated.nextRunAt.getTime()).toBe(expectedNext.getTime())
  })

  it('processDueSchedules with MONTHLY recurrence', async () => {
    const past = new Date('2026-01-15T09:00:00Z')
    await createSchedule('org-1', {
      name: 'Monthly Process', taskConfig: { taskType: 'executive_summary' },
      recurrence: 'MONTHLY', nextRunAt: past,
    }, 'u-1')

    await processDueSchedules()
    const updated = mockStore.officeAiSchedule[0]
    const expectedNext = new Date(past)
    expectedNext.setMonth(expectedNext.getMonth() + 1)
    expect(updated.nextRunAt.getTime()).toBe(expectedNext.getTime())
  })

  it('throws OfficeAiAdvError with correct name', () => {
    const err = new OfficeAiAdvError('test error')
    expect(err.name).toBe('OfficeAiAdvError')
    expect(err.message).toBe('test error')
  })
})
