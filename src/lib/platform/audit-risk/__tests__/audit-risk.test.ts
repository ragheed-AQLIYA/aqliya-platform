import { describe, expect, it, jest, beforeEach } from '@jest/globals'

const mockStore: Record<string, any[]> = {
  auditRiskModel: [],
  auditRiskAssessment: [],
  auditRiskProcedure: [],
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

function filterStore(model: string, where?: Record<string, any>): any[] {
  if (!where || Object.keys(where).length === 0) return [...mockStore[model]]
  return mockStore[model].filter((r) =>
    Object.entries(where).every(([k, v]) => r[k] === v),
  )
}

function resetStores() {
  for (const key of Object.keys(mockStore)) {
    mockStore[key] = []
  }
  idCounter = 1
}

const mockPrisma = {
  auditRiskModel: {
    create: jest.fn(async ({ data }: any) => {
      const record = {
        id: nextId('model'),
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      mockStore.auditRiskModel.push(record)
      return record
    }),
    findUnique: jest.fn(async ({ where }: any) => {
      return findInStore('auditRiskModel', where) ?? null
    }),
    findMany: jest.fn(async ({ where, orderBy }: any) => {
      let results = filterStore('auditRiskModel', where)
      if (orderBy?.createdAt === 'desc') {
        results = [...results].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
      }
      return results
    }),
    update: jest.fn(async ({ where, data }: any) => {
      const idx = mockStore.auditRiskModel.findIndex((r) => r.id === where.id)
      if (idx === -1) throw new Error('Record not found')
      mockStore.auditRiskModel[idx] = { ...mockStore.auditRiskModel[idx], ...data, updatedAt: new Date() }
      return mockStore.auditRiskModel[idx]
    }),
  },
  auditRiskAssessment: {
    create: jest.fn(async ({ data }: any) => {
      const record = {
        id: nextId('assessment'),
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
        assessedAt: new Date(),
      }
      mockStore.auditRiskAssessment.push(record)
      return record
    }),
    findUnique: jest.fn(async ({ where }: any) => {
      return findInStore('auditRiskAssessment', where) ?? null
    }),
    findMany: jest.fn(async ({ where, orderBy }: any) => {
      let results = filterStore('auditRiskAssessment', where)
      if (orderBy?.assessedAt === 'desc') {
        results = [...results].sort(
          (a, b) => new Date(b.assessedAt).getTime() - new Date(a.assessedAt).getTime(),
        )
      }
      return results
    }),
    update: jest.fn(async ({ where, data }: any) => {
      const idx = mockStore.auditRiskAssessment.findIndex((r) => r.id === where.id)
      if (idx === -1) throw new Error('Record not found')
      mockStore.auditRiskAssessment[idx] = { ...mockStore.auditRiskAssessment[idx], ...data, updatedAt: new Date() }
      return mockStore.auditRiskAssessment[idx]
    }),
  },
  auditRiskProcedure: {
    create: jest.fn(async ({ data }: any) => {
      const record = {
        id: nextId('procedure'),
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      mockStore.auditRiskProcedure.push(record)
      return record
    }),
    findUnique: jest.fn(async ({ where }: any) => {
      return findInStore('auditRiskProcedure', where) ?? null
    }),
    findMany: jest.fn(async ({ where, orderBy }: any) => {
      let results = filterStore('auditRiskProcedure', where)
      if (orderBy?.createdAt === 'asc') {
        results = [...results].sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        )
      }
      return results
    }),
    update: jest.fn(async ({ where, data }: any) => {
      const idx = mockStore.auditRiskProcedure.findIndex((r) => r.id === where.id)
      if (idx === -1) throw new Error('Record not found')
      mockStore.auditRiskProcedure[idx] = { ...mockStore.auditRiskProcedure[idx], ...data, updatedAt: new Date() }
      return mockStore.auditRiskProcedure[idx]
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
  calculateRiskScore,
  createRiskModel,
  getRiskModel,
  listRiskModels,
  assessRisk,
  getAssessment,
  getAssessmentsByEngagement,
  transitionAssessmentStatus,
  getRiskProcedures,
  updateProcedure,
  verifyOrgAccess,
  AuditRiskError,
} from '../index'

import type { RiskCategory, RiskThresholds } from '../index'

// ─── Fixtures ───

const singleCategory: RiskCategory[] = [
  {
    name: 'Financial Reporting',
    weight: 100,
    questions: [
      { id: 'q1', text: 'Accuracy of financial statements', weight: 50, type: 'inherent' },
      { id: 'q2', text: 'Completeness of revenue recognition', weight: 50, type: 'inherent' },
    ],
  },
]

const multiCategory: RiskCategory[] = [
  {
    name: 'Financial Reporting',
    weight: 40,
    questions: [
      { id: 'q1', text: 'Accuracy', weight: 50, type: 'inherent' },
      { id: 'q2', text: 'Completeness', weight: 50, type: 'inherent' },
    ],
  },
  {
    name: 'Compliance',
    weight: 30,
    questions: [
      { id: 'q3', text: 'Regulatory adherence', weight: 60, type: 'inherent' },
      { id: 'q4', text: 'Policy compliance', weight: 40, type: 'inherent' },
    ],
  },
  {
    name: 'Operational',
    weight: 30,
    questions: [
      { id: 'q5', text: 'Process efficiency', weight: 100, type: 'inherent' },
    ],
  },
]

const thresholds: RiskThresholds = { low: 30, medium: 60, high: 80, critical: 100 }

// ─── calculateRiskScore ───

describe('calculateRiskScore', () => {
  it('computes score for single category with equal weights', () => {
    const result = calculateRiskScore(singleCategory, { q1: 50, q2: 50 }, thresholds)
    expect(result.overallScore).toBe(50)
    expect(result.overallLevel).toBe('MEDIUM')
    expect(result.categoryScores).toHaveLength(1)
    expect(result.categoryScores[0].score).toBe(50)
  })

  it('computes score for multiple categories with weights', () => {
    const result = calculateRiskScore(multiCategory, { q1: 20, q2: 20, q3: 60, q4: 60, q5: 80 }, thresholds)
    expect(result.categoryScores).toHaveLength(3)
    const fr = result.categoryScores.find((c) => c.name === 'Financial Reporting')
    expect(fr).toBeDefined()
    expect(fr!.score).toBe(20)
    expect(fr!.level).toBe('LOW')
    const comp = result.categoryScores.find((c) => c.name === 'Compliance')
    expect(comp).toBeDefined()
    expect(comp!.score).toBe(60)
    expect(comp!.level).toBe('MEDIUM')
    const ops = result.categoryScores.find((c) => c.name === 'Operational')
    expect(ops).toBeDefined()
    expect(ops!.score).toBe(80)
    expect(ops!.level).toBe('HIGH')
    // (40*20 + 30*60 + 30*80) / 100 = (800 + 1800 + 2400) / 100 = 50
    expect(result.overallScore).toBe(50)
    expect(result.overallLevel).toBe('MEDIUM')
  })

  it('all zeros produces LOW risk', () => {
    const result = calculateRiskScore(singleCategory, { q1: 0, q2: 0 }, thresholds)
    expect(result.overallScore).toBe(0)
    expect(result.overallLevel).toBe('LOW')
  })

  it('max values produces CRITICAL risk', () => {
    const result = calculateRiskScore(singleCategory, { q1: 100, q2: 100 }, thresholds)
    expect(result.overallScore).toBe(100)
    expect(result.overallLevel).toBe('CRITICAL')
  })

  it('handles weighted questions within category', () => {
    const weightedCat: RiskCategory[] = [
      {
        name: 'Fraud',
        weight: 100,
        questions: [
          { id: 'f1', text: 'Management override', weight: 70, type: 'inherent' },
          { id: 'f2', text: 'Unusual transactions', weight: 30, type: 'inherent' },
        ],
      },
    ]
    const result = calculateRiskScore(weightedCat, { f1: 100, f2: 0 }, thresholds)
    // (100*70 + 0*30) / (70+30) = 70
    expect(result.overallScore).toBe(70)
    expect(result.overallLevel).toBe('HIGH')
  })

  it('handles missing answers by treating them as 0', () => {
    const result = calculateRiskScore(singleCategory, { q1: 50 }, thresholds)
    expect(result.overallScore).toBe(25)
  })

  it('returns LOW for empty categories', () => {
    const result = calculateRiskScore([], {}, thresholds)
    expect(result.overallScore).toBe(0)
    expect(result.overallLevel).toBe('LOW')
  })

  it('uses default thresholds when not provided', () => {
    const result = calculateRiskScore(singleCategory, { q1: 100, q2: 100 })
    expect(result.overallLevel).toBe('CRITICAL')
  })

  it('handles custom thresholds', () => {
    const customThresholds: RiskThresholds = { low: 20, medium: 55, high: 80, critical: 100 }
    const result = calculateRiskScore(singleCategory, { q1: 50, q2: 50 }, customThresholds)
    expect(result.overallLevel).toBe('MEDIUM')
  })
})

// ─── Risk Level Boundaries ───

describe('risk level mapping at boundaries', () => {
  const cat: RiskCategory[] = [
    {
      name: 'Test',
      weight: 100,
      questions: [{ id: 'x', text: 'Single question', weight: 100, type: 'inherent' }],
    },
  ]

  it('score <= 30 is LOW', () => {
    expect(calculateRiskScore(cat, { x: 0 }, thresholds).overallLevel).toBe('LOW')
    expect(calculateRiskScore(cat, { x: 30 }, thresholds).overallLevel).toBe('LOW')
  })

  it('score 31-60 is MEDIUM', () => {
    expect(calculateRiskScore(cat, { x: 31 }, thresholds).overallLevel).toBe('MEDIUM')
    expect(calculateRiskScore(cat, { x: 60 }, thresholds).overallLevel).toBe('MEDIUM')
  })

  it('score 61-80 is HIGH', () => {
    expect(calculateRiskScore(cat, { x: 61 }, thresholds).overallLevel).toBe('HIGH')
    expect(calculateRiskScore(cat, { x: 80 }, thresholds).overallLevel).toBe('HIGH')
  })

  it('score 81-100 is CRITICAL', () => {
    expect(calculateRiskScore(cat, { x: 81 }, thresholds).overallLevel).toBe('CRITICAL')
    expect(calculateRiskScore(cat, { x: 100 }, thresholds).overallLevel).toBe('CRITICAL')
  })
})

// ─── createRiskModel ───

describe('createRiskModel', () => {
  beforeEach(() => { resetStores() })

  it('creates a risk model with valid data', async () => {
    const model = await createRiskModel('org-1', {
      name: 'Standard Audit Risk Model',
      description: 'Standard risk model for audit engagements',
      categories: singleCategory,
    }, 'user-1')

    expect(model.organizationId).toBe('org-1')
    expect(model.name).toBe('Standard Audit Risk Model')
    expect(model.description).toBe('Standard risk model for audit engagements')
    expect(model.version).toBe(1)
    expect(model.isActive).toBe(true)
    expect(model.createdById).toBe('user-1')
    expect(model.categories).toHaveLength(1)
    expect(model.thresholds.low).toBe(30)
    expect(model.thresholds.critical).toBe(100)
  })

  it('throws for empty orgId', async () => {
    await expect(createRiskModel('', {
      name: 'Test',
      categories: singleCategory,
    }, 'user-1')).rejects.toThrow(AuditRiskError)
  })

  it('throws for missing name', async () => {
    await expect(createRiskModel('org-1', {
      name: '',
      categories: singleCategory,
    }, 'user-1')).rejects.toThrow(AuditRiskError)
  })

  it('throws for empty categories', async () => {
    await expect(createRiskModel('org-1', {
      name: 'Empty',
      categories: [],
    }, 'user-1')).rejects.toThrow(AuditRiskError)
  })

  it('throws when category weights do not sum to 100', async () => {
    await expect(createRiskModel('org-1', {
      name: 'Bad Weights',
      categories: [{
        name: 'Only',
        weight: 50,
        questions: [{ id: 'q1', text: 'Q', weight: 100, type: 'inherent' }],
      }],
    }, 'user-1')).rejects.toThrow(AuditRiskError)
  })

  it('throws when a category has no questions', async () => {
    await expect(createRiskModel('org-1', {
      name: 'No Questions',
      categories: [{
        name: 'Empty Cat',
        weight: 100,
        questions: [],
      }],
    }, 'user-1')).rejects.toThrow(AuditRiskError)
  })

  it('creates model with multi-category and custom thresholds', async () => {
    const model = await createRiskModel('org-1', {
      name: 'Custom Thresholds',
      categories: multiCategory,
      thresholds: { low: 20, medium: 50, high: 75, critical: 100 },
    }, 'user-1')

    expect(model.thresholds.low).toBe(20)
    expect(model.thresholds.medium).toBe(50)
    expect(model.thresholds.high).toBe(75)
    expect(model.categories).toHaveLength(3)
  })

  it('creates model with partial custom thresholds', async () => {
    const model = await createRiskModel('org-1', {
      name: 'Partial Thresholds',
      categories: singleCategory,
      thresholds: { low: 25 },
    }, 'user-1')

    expect(model.thresholds.low).toBe(25)
    expect(model.thresholds.medium).toBe(60)
    expect(model.thresholds.high).toBe(80)
    expect(model.thresholds.critical).toBe(100)
  })
})

// ─── getRiskModel / listRiskModels ───

describe('getRiskModel / listRiskModels', () => {
  beforeEach(() => { resetStores() })

  it('returns null for non-existent model', async () => {
    const model = await getRiskModel('nonexistent')
    expect(model).toBeNull()
  })

  it('returns model by id', async () => {
    const created = await createRiskModel('org-1', {
      name: 'Find Me',
      categories: singleCategory,
    }, 'user-1')

    const found = await getRiskModel(created.id)
    expect(found).not.toBeNull()
    expect(found!.id).toBe(created.id)
    expect(found!.name).toBe('Find Me')
  })

  it('lists models scoped to organization', async () => {
    await createRiskModel('org-1', { name: 'Model 1', categories: singleCategory }, 'user-1')
    await createRiskModel('org-1', { name: 'Model 2', categories: singleCategory }, 'user-2')
    await createRiskModel('org-2', { name: 'Other Model', categories: singleCategory }, 'user-3')

    const org1Models = await listRiskModels('org-1')
    expect(org1Models).toHaveLength(2)

    const org2Models = await listRiskModels('org-2')
    expect(org2Models).toHaveLength(1)

    const emptyModels = await listRiskModels('org-3')
    expect(emptyModels).toHaveLength(0)
  })
})

// ─── assessRisk ───

describe('assessRisk', () => {
  beforeEach(() => { resetStores() })

  it('creates an assessment with computed scores', async () => {
    const model = await createRiskModel('org-1', {
      name: 'Assessment Test Model',
      categories: singleCategory,
    }, 'user-1')

    const assessment = await assessRisk(model.id, 'engagement-1', {
      title: 'Q4 Risk Assessment',
      answers: { q1: { inherent: 80 }, q2: { inherent: 60 } },
    }, 'user-1')

    expect(assessment.modelId).toBe(model.id)
    expect(assessment.organizationId).toBe('org-1')
    expect(assessment.engagementId).toBe('engagement-1')
    expect(assessment.title).toBe('Q4 Risk Assessment')
    expect(assessment.inherentScore).toBe(70)
    expect(assessment.inherentLevel).toBe('HIGH')
    expect(assessment.status).toBe('DRAFT')
    expect(assessment.assessedById).toBe('user-1')
    expect(assessment.categoryScores).toHaveLength(1)
  })

  it('computes residual score when residual answers provided', async () => {
    const model = await createRiskModel('org-1', {
      name: 'Residual Test',
      categories: singleCategory,
    }, 'user-1')

    const assessment = await assessRisk(model.id, 'engagement-1', {
      title: 'With Residual',
      answers: {
        q1: { inherent: 90, residual: 30 },
        q2: { inherent: 90, residual: 40 },
      },
    }, 'user-1')

    expect(assessment.inherentScore).toBe(90)
    expect(assessment.inherentLevel).toBe('CRITICAL')
    expect(assessment.residualScore).toBe(35)
    expect(assessment.residualLevel).toBe('MEDIUM')
  })

  it('throws for non-existent model', async () => {
    await expect(assessRisk('nonexistent', 'eng-1', {
      title: 'Bad',
      answers: {},
    }, 'user-1')).rejects.toThrow(AuditRiskError)
  })

  it('throws for inactive model', async () => {
    const modelId = nextId('model')
    mockStore.auditRiskModel.push({
      id: modelId,
      organizationId: 'org-1',
      name: 'Inactive',
      categories: singleCategory,
      thresholds: { low: 30, medium: 60, high: 80, critical: 100 },
      isActive: false,
      version: 1,
      createdById: 'user-1',
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    await expect(assessRisk(modelId, 'eng-1', {
      title: 'Inactive Model',
      answers: { q1: { inherent: 50 }, q2: { inherent: 50 } },
    }, 'user-1')).rejects.toThrow(AuditRiskError)
  })

  it('throws for missing answers', async () => {
    const model = await createRiskModel('org-1', {
      name: 'Missing Answers',
      categories: singleCategory,
    }, 'user-1')

    await expect(assessRisk(model.id, 'eng-1', {
      title: 'Incomplete',
      answers: { q1: { inherent: 50 } },
    }, 'user-1')).rejects.toThrow(AuditRiskError)
  })

  it('throws for invalid answer values', async () => {
    const model = await createRiskModel('org-1', {
      name: 'Invalid',
      categories: singleCategory,
    }, 'user-1')

    await expect(assessRisk(model.id, 'eng-1', {
      title: 'Bad Value',
      answers: { q1: { inherent: -5 }, q2: { inherent: 50 } },
    }, 'user-1')).rejects.toThrow(AuditRiskError)

    await expect(assessRisk(model.id, 'eng-1', {
      title: 'Over Max',
      answers: { q1: { inherent: 150 }, q2: { inherent: 50 } },
    }, 'user-1')).rejects.toThrow(AuditRiskError)
  })

  it('creates assessment with risk response', async () => {
    const model = await createRiskModel('org-1', {
      name: 'Response Test',
      categories: singleCategory,
    }, 'user-1')

    const assessment = await assessRisk(model.id, 'engagement-1', {
      title: 'With Response',
      answers: { q1: { inherent: 50 }, q2: { inherent: 50 } },
      riskResponse: 'MITIGATE',
      responseNotes: 'Implement additional controls',
    }, 'user-1')

    expect(assessment.riskResponse).toBe('MITIGATE')
    expect(assessment.responseNotes).toBe('Implement additional controls')
  })

  it('generates procedures during assessment', async () => {
    const categories: RiskCategory[] = [
      {
        name: 'Financial',
        weight: 60,
        questions: [{ id: 'a1', text: 'Quality', weight: 100, type: 'inherent' }],
      },
      {
        name: 'Compliance',
        weight: 40,
        questions: [{ id: 'a2', text: 'Adherence', weight: 100, type: 'inherent' }],
      },
    ]

    const model = await createRiskModel('org-1', {
      name: 'Procedure Gen',
      categories,
    }, 'user-1')

    const assessment = await assessRisk(model.id, 'eng-1', {
      title: 'High Risk',
      answers: { a1: { inherent: 90 }, a2: { inherent: 20 } },
    }, 'user-1')

    const procedures = await getRiskProcedures(assessment.id)
    expect(procedures.length).toBeGreaterThanOrEqual(1)
    expect(procedures[0].procedureCode).toMatch(/^RP-\d{3}$/)
    expect(procedures[0].status).toBe('DRAFT')
  })
})

// ─── getAssessment / getAssessmentsByEngagement ───

describe('getAssessment / getAssessmentsByEngagement', () => {
  beforeEach(() => { resetStores() })

  it('returns null for non-existent assessment', async () => {
    const assessment = await getAssessment('nonexistent')
    expect(assessment).toBeNull()
  })

  it('returns assessment by id', async () => {
    const model = await createRiskModel('org-1', { name: 'M', categories: singleCategory }, 'user-1')
    const created = await assessRisk(model.id, 'eng-1', {
      title: 'Find Assessment',
      answers: { q1: { inherent: 50 }, q2: { inherent: 50 } },
    }, 'user-1')

    const found = await getAssessment(created.id)
    expect(found).not.toBeNull()
    expect(found!.id).toBe(created.id)
    expect(found!.title).toBe('Find Assessment')
  })

  it('lists assessments by engagement', async () => {
    const model = await createRiskModel('org-1', { name: 'M', categories: singleCategory }, 'user-1')
    await assessRisk(model.id, 'eng-1', { title: 'A1', answers: { q1: { inherent: 10 }, q2: { inherent: 20 } } }, 'user-1')
    await assessRisk(model.id, 'eng-1', { title: 'A2', answers: { q1: { inherent: 30 }, q2: { inherent: 40 } } }, 'user-1')
    await assessRisk(model.id, 'eng-2', { title: 'A3', answers: { q1: { inherent: 50 }, q2: { inherent: 60 } } }, 'user-1')

    const eng1 = await getAssessmentsByEngagement('eng-1')
    expect(eng1).toHaveLength(2)

    const eng2 = await getAssessmentsByEngagement('eng-2')
    expect(eng2).toHaveLength(1)

    const engX = await getAssessmentsByEngagement('eng-x')
    expect(engX).toHaveLength(0)
  })
})

// ─── Status Transitions ───

describe('transitionAssessmentStatus', () => {
  beforeEach(() => { resetStores() })

  it('transitions DRAFT to REVIEWED', async () => {
    const model = await createRiskModel('org-1', { name: 'M', categories: singleCategory }, 'user-1')
    const assessment = await assessRisk(model.id, 'eng-1', {
      title: 'Status Test',
      answers: { q1: { inherent: 50 }, q2: { inherent: 50 } },
    }, 'auditor-1')

    const reviewed = await transitionAssessmentStatus(assessment.id, 'REVIEWED', 'reviewer-1')
    expect(reviewed.status).toBe('REVIEWED')
    expect(reviewed.reviewedById).toBe('reviewer-1')
  })

  it('transitions REVIEWED to APPROVED', async () => {
    const model = await createRiskModel('org-1', { name: 'M', categories: singleCategory }, 'user-1')
    const assessment = await assessRisk(model.id, 'eng-1', {
      title: 'Approve Test',
      answers: { q1: { inherent: 50 }, q2: { inherent: 50 } },
    }, 'auditor-1')

    await transitionAssessmentStatus(assessment.id, 'REVIEWED', 'reviewer-1')
    const approved = await transitionAssessmentStatus(assessment.id, 'APPROVED', 'approver-1')
    expect(approved.status).toBe('APPROVED')
    expect(approved.approvedById).toBe('approver-1')
  })

  it('throws for invalid transition', async () => {
    const model = await createRiskModel('org-1', { name: 'M', categories: singleCategory }, 'user-1')
    const assessment = await assessRisk(model.id, 'eng-1', {
      title: 'Invalid',
      answers: { q1: { inherent: 50 }, q2: { inherent: 50 } },
    }, 'auditor-1')

    await expect(transitionAssessmentStatus(assessment.id, 'APPROVED', 'user-1')).rejects.toThrow(AuditRiskError)
  })

  it('throws for non-existent assessment', async () => {
    await expect(transitionAssessmentStatus('nonexistent', 'REVIEWED', 'user-1')).rejects.toThrow(AuditRiskError)
  })
})

// ─── Procedure Generation by Risk Level ───

describe('procedure generation by risk level', () => {
  async function createModelWithLevel(level: 'LOW' | 'HIGH' | 'CRITICAL') {
    const scores: Record<string, { inherent: number }> = {}
    let catConfig: RiskCategory[]

    switch (level) {
      case 'CRITICAL':
        catConfig = [
          { name: 'Financial', weight: 50, questions: [{ id: 'c1', text: 'Q', weight: 100, type: 'inherent' }] },
          { name: 'Operational', weight: 50, questions: [{ id: 'c2', text: 'Q', weight: 100, type: 'inherent' }] },
        ]
        scores.c1 = { inherent: 90 }; scores.c2 = { inherent: 85 }
        break
      case 'HIGH':
        catConfig = [
          { name: 'Financial', weight: 100, questions: [{ id: 'h1', text: 'Q', weight: 100, type: 'inherent' }] },
        ]
        scores.h1 = { inherent: 70 }
        break
      case 'LOW':
        catConfig = [
          { name: 'LowRisk', weight: 100, questions: [{ id: 'l1', text: 'Q', weight: 100, type: 'inherent' }] },
        ]
        scores.l1 = { inherent: 10 }
        break
    }

    // @ts-expect-error - TS can't narrow catConfig here
    const model = await createRiskModel('org-1', { name: `${level} Model`, categories: catConfig }, 'user-1')
    const assessment = await assessRisk(model.id, 'eng-1', {
      title: `${level} Assessment`,
      answers: scores,
    }, 'user-1')
    return assessment
  }

  beforeEach(() => { resetStores() })

  it('LOW risk produces 1 procedure with 1 step', async () => {
    const assessment = await createModelWithLevel('LOW')
    const procs = await getRiskProcedures(assessment.id)
    // LOW with single category => 1 procedure
    expect(procs.length).toBeGreaterThanOrEqual(1)
    const mainProc = procs[0]
    expect(mainProc.procedureSteps.length).toBe(1)
    expect(mainProc.evidenceRequired).toBe(false)
  })

  it('HIGH risk produces procedure with 3 steps', async () => {
    const assessment = await createModelWithLevel('HIGH')
    const procs = await getRiskProcedures(assessment.id)
    expect(procs.length).toBeGreaterThanOrEqual(1)
    const mainProc = procs[0]
    expect(mainProc.procedureSteps.length).toBe(3)
    expect(mainProc.evidenceRequired).toBe(true)
  })

  it('CRITICAL risk produces multiple procedures with 4 steps each', async () => {
    const assessment = await createModelWithLevel('CRITICAL')
    const procs = await getRiskProcedures(assessment.id)
    expect(procs.length).toBeGreaterThanOrEqual(2)
    for (const proc of procs) {
      expect(proc.procedureSteps.length).toBe(4)
      expect(proc.evidenceRequired).toBe(true)
    }
  })

  it('procedure codes are sequential', async () => {
    const assessment = await createModelWithLevel('CRITICAL')
    const procs = await getRiskProcedures(assessment.id)
    expect(procs[0].procedureCode).toBe('RP-001')
    if (procs.length > 1) {
      expect(procs[1].procedureCode).toBe('RP-002')
    }
  })
})

// ─── updateProcedure ───

describe('updateProcedure', () => {
  beforeEach(() => { resetStores() })

  it('updates procedure fields', async () => {
    const model = await createRiskModel('org-1', { name: 'M', categories: singleCategory }, 'user-1')
    const assessment = await assessRisk(model.id, 'eng-1', {
      title: 'Proc Update',
      answers: { q1: { inherent: 50 }, q2: { inherent: 50 } },
    }, 'user-1')
    const procs = await getRiskProcedures(assessment.id)

    const updated = await updateProcedure(procs[0].id, {
      description: 'Updated description',
      evidenceRequired: false,
      status: 'REVIEWED',
    })

    expect(updated.description).toBe('Updated description')
    expect(updated.evidenceRequired).toBe(false)
    expect(updated.status).toBe('REVIEWED')
  })

  it('throws for non-existent procedure', async () => {
    await expect(updateProcedure('nonexistent', { description: 'Nope' })).rejects.toThrow(AuditRiskError)
  })
})

// ─── Tenant Isolation ───

describe('verifyOrgAccess', () => {
  beforeEach(() => { resetStores() })

  it('returns false for non-existent resources', async () => {
    const access = await verifyOrgAccess('model', 'nonexistent', 'org-1')
    expect(access).toBe(false)
  })

  it('returns true when org matches model', async () => {
    const model = await createRiskModel('org-1', { name: 'M', categories: singleCategory }, 'user-1')
    const access = await verifyOrgAccess('model', model.id, 'org-1')
    expect(access).toBe(true)
  })

  it('returns false when org does not match model', async () => {
    const model = await createRiskModel('org-1', { name: 'M', categories: singleCategory }, 'user-1')
    const access = await verifyOrgAccess('model', model.id, 'org-2')
    expect(access).toBe(false)
  })

  it('verifies assessment org access', async () => {
    const model = await createRiskModel('org-1', { name: 'M', categories: singleCategory }, 'user-1')
    const assessment = await assessRisk(model.id, 'eng-1', {
      title: 'Test',
      answers: { q1: { inherent: 50 }, q2: { inherent: 50 } },
    }, 'user-1')

    expect(await verifyOrgAccess('assessment', assessment.id, 'org-1')).toBe(true)
    expect(await verifyOrgAccess('assessment', assessment.id, 'org-2')).toBe(false)
  })

  it('verifies procedure org access', async () => {
    const model = await createRiskModel('org-1', { name: 'M', categories: singleCategory }, 'user-1')
    const assessment = await assessRisk(model.id, 'eng-1', {
      title: 'Test',
      answers: { q1: { inherent: 50 }, q2: { inherent: 50 } },
    }, 'user-1')
    const procs = await getRiskProcedures(assessment.id)

    expect(await verifyOrgAccess('procedure', procs[0].id, 'org-1')).toBe(true)
    expect(await verifyOrgAccess('procedure', procs[0].id, 'org-2')).toBe(false)
  })
})

// ─── AuditRiskError ───

describe('AuditRiskError', () => {
  it('creates error with correct name', () => {
    const err = new AuditRiskError('test error')
    expect(err.name).toBe('AuditRiskError')
    expect(err.message).toBe('test error')
  })
})
