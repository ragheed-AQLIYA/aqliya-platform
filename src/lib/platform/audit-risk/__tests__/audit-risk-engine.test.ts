import { describe, expect, it, jest, beforeEach } from '@jest/globals'

// ─── In-Memory Mock Store ───

const mockStore: Record<string, any[]> = {
  auditRiskModel: [],
  auditRiskAssessment: [],
  auditRiskProcedure: [],
  platformAuditLog: [],
}

let idCounter = 1

function nextId(prefix = 'resource'): string {
  return prefix + '_' + idCounter++
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

function resetStores(): void {
  for (const key of Object.keys(mockStore)) {
    mockStore[key] = []
  }
  idCounter = 1
}

// ─── Mock Prisma ───

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
    createMany: jest.fn(async ({ data }: any) => {
      const rows = Array.isArray(data) ? data : []
      for (const row of rows) {
        mockStore.auditRiskProcedure.push({
          id: nextId('procedure'),
          ...row,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
      }
      return { count: rows.length }
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
      const record = { id: 'audit_' + idCounter++, ...data, createdAt: new Date() }
      mockStore.platformAuditLog.push(record)
      return record
    }),
  },
}

jest.mock('@/lib/prisma', () => ({
  prisma: mockPrisma,
}))

jest.mock('@/lib/platform/audit-log', () => ({
  writePlatformAuditLog: jest.fn(async () => ({ ok: true, id: 'audit_' + idCounter++ })),
}))

// ─── Imports from Engine ───

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
} from '../audit-risk-engine/index'

import type { RiskCategory, RiskThresholds } from '../audit-risk-engine/index'

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

// ============================================================
// 1. calculateRiskScore — pure function, no mock store needed
// ============================================================

describe('calculateRiskScore', () => {
  it('computes score for single category', () => {
    const result = calculateRiskScore(singleCategory, { q1: 50, q2: 50 }, thresholds)
    expect(result.overallScore).toBe(50)
    expect(result.overallLevel).toBe('MEDIUM')
    expect(result.categoryScores).toHaveLength(1)
    expect(result.categoryScores[0].score).toBe(50)
  })

  it('computes weighted score for multiple categories', () => {
    const result = calculateRiskScore(
      multiCategory,
      { q1: 20, q2: 20, q3: 60, q4: 60, q5: 80 },
      thresholds,
    )
    expect(result.categoryScores).toHaveLength(3)
    // Financial Reporting: (20*50 + 20*50) / 100 = 20 → LOW
    expect(result.categoryScores[0].score).toBe(20)
    expect(result.categoryScores[0].level).toBe('LOW')
    // Compliance: (60*60 + 60*40) / 100 = 60 → MEDIUM
    expect(result.categoryScores[1].score).toBe(60)
    expect(result.categoryScores[1].level).toBe('MEDIUM')
    // Operational: 80 → HIGH
    expect(result.categoryScores[2].score).toBe(80)
    expect(result.categoryScores[2].level).toBe('HIGH')
    // Overall: (40*20 + 30*60 + 30*80) / 100 = 50
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
    // (100*70 + 0*30) / 100 = 70
    expect(result.overallScore).toBe(70)
    expect(result.overallLevel).toBe('HIGH')
  })

  it('treats missing answers as 0', () => {
    const result = calculateRiskScore(singleCategory, { q1: 50 }, thresholds)
    expect(result.overallScore).toBe(25)
    expect(result.overallLevel).toBe('LOW')
  })

  it('returns LOW for empty categories', () => {
    const result = calculateRiskScore([], {}, thresholds)
    expect(result.overallScore).toBe(0)
    expect(result.overallLevel).toBe('LOW')
    expect(result.categoryScores).toHaveLength(0)
  })

  it('uses default thresholds when not provided', () => {
    const result = calculateRiskScore(singleCategory, { q1: 100, q2: 100 })
    expect(result.overallLevel).toBe('CRITICAL')
  })

  it('honours custom thresholds', () => {
    const customThresholds: RiskThresholds = { low: 20, medium: 55, high: 80, critical: 100 }
    const result = calculateRiskScore(singleCategory, { q1: 50, q2: 50 }, customThresholds)
    expect(result.overallLevel).toBe('MEDIUM')
  })
})

// ============================================================
// 2. assessRisk workflow
// ============================================================

describe('assessRisk', () => {
  beforeEach(() => { resetStores() })

  it('creates assessment with computed inherent score', async () => {
    const model = await createRiskModel('org-1', {
      name: 'Test Model',
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
  })

  it('computes residual score when residual answers are supplied', async () => {
    const model = await createRiskModel('org-1', {
      name: 'Residual Model',
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

  it('throws for invalid answer values (negative or over 100)', async () => {
    const model = await createRiskModel('org-1', {
      name: 'Invalid Answers',
      categories: singleCategory,
    }, 'user-1')

    await expect(assessRisk(model.id, 'eng-1', {
      title: 'Negative',
      answers: { q1: { inherent: -5 }, q2: { inherent: 50 } },
    }, 'user-1')).rejects.toThrow(AuditRiskError)

    await expect(assessRisk(model.id, 'eng-1', {
      title: 'Over Max',
      answers: { q1: { inherent: 150 }, q2: { inherent: 50 } },
    }, 'user-1')).rejects.toThrow(AuditRiskError)
  })

  it('accepts risk response and notes', async () => {
    const model = await createRiskModel('org-1', {
      name: 'Response Model',
      categories: singleCategory,
    }, 'user-1')

    const assessment = await assessRisk(model.id, 'engagement-1', {
      title: 'With Response',
      answers: { q1: { inherent: 50 }, q2: { inherent: 50 } },
      riskResponse: 'MITIGATE',
      responseNotes: 'Add segregation of duties',
    }, 'user-1')

    expect(assessment.riskResponse).toBe('MITIGATE')
    expect(assessment.responseNotes).toBe('Add segregation of duties')
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

// ============================================================
// 3. getAssessment / getAssessmentsByEngagement
// ============================================================

describe('getAssessment / getAssessmentsByEngagement', () => {
  beforeEach(() => { resetStores() })

  it('returns null for non-existent assessment', async () => {
    const result = await getAssessment('nonexistent')
    expect(result).toBeNull()
  })

  it('returns assessment by id after creation', async () => {
    const model = await createRiskModel('org-1', { name: 'M', categories: singleCategory }, 'user-1')
    const created = await assessRisk(model.id, 'eng-1', {
      title: 'Find Me',
      answers: { q1: { inherent: 50 }, q2: { inherent: 50 } },
    }, 'user-1')

    const found = await getAssessment(created.id)
    expect(found).not.toBeNull()
    expect(found!.id).toBe(created.id)
    expect(found!.title).toBe('Find Me')
  })

  it('lists assessments scoped by engagement', async () => {
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

// ============================================================
// 4. transitionAssessmentStatus — valid and invalid transitions
// ============================================================

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

  it('throws for DRAFT to APPROVED (skip review)', async () => {
    const model = await createRiskModel('org-1', { name: 'M', categories: singleCategory }, 'user-1')
    const assessment = await assessRisk(model.id, 'eng-1', {
      title: 'Skip Review',
      answers: { q1: { inherent: 50 }, q2: { inherent: 50 } },
    }, 'auditor-1')

    await expect(
      transitionAssessmentStatus(assessment.id, 'APPROVED', 'user-1'),
    ).rejects.toThrow(AuditRiskError)
  })

  it('throws for non-existent assessment', async () => {
    await expect(
      transitionAssessmentStatus('nonexistent', 'REVIEWED', 'user-1'),
    ).rejects.toThrow(AuditRiskError)
  })

  it('throws for unknown target status', async () => {
    const model = await createRiskModel('org-1', { name: 'M', categories: singleCategory }, 'user-1')
    const assessment = await assessRisk(model.id, 'eng-1', {
      title: 'Bad Target',
      answers: { q1: { inherent: 50 }, q2: { inherent: 50 } },
    }, 'auditor-1')

    await expect(
      transitionAssessmentStatus(assessment.id, 'INVALID_STATUS', 'user-1'),
    ).rejects.toThrow(AuditRiskError)
  })

  it('sets approvedById on APPROVED transition', async () => {
    const model = await createRiskModel('org-1', { name: 'M', categories: singleCategory }, 'user-1')
    const assessment = await assessRisk(model.id, 'eng-1', {
      title: 'Approver',
      answers: { q1: { inherent: 50 }, q2: { inherent: 50 } },
    }, 'auditor-1')

    await transitionAssessmentStatus(assessment.id, 'REVIEWED', 'reviewer-42')
    const approved = await transitionAssessmentStatus(assessment.id, 'APPROVED', 'approver-99')
    expect(approved.approvedById).toBe('approver-99')
    expect(approved.reviewedById).toBe('reviewer-42')
  })
})

// ============================================================
// 5. Edge cases
// ============================================================

describe('edge cases', () => {
  beforeEach(() => { resetStores() })

  it('handles residual score being null when no residual answers', async () => {
    const model = await createRiskModel('org-1', { name: 'M', categories: singleCategory }, 'user-1')
    const assessment = await assessRisk(model.id, 'eng-1', {
      title: 'No Residual',
      answers: { q1: { inherent: 50 }, q2: { inherent: 50 } },
    }, 'user-1')

    expect(assessment.residualScore).toBeNull()
    expect(assessment.residualLevel).toBeNull()
  })

  it('handles model with zero-weight category gracefully', () => {
    const zeroWeightCat: RiskCategory[] = [
      {
        name: 'Zero',
        weight: 0,
        questions: [{ id: 'z1', text: 'Q', weight: 100, type: 'inherent' }],
      },
    ]
    // Zero-weight categories won't affect overall; totalWeight = 0 -> overallScore = 0
    const result = calculateRiskScore(zeroWeightCat, { z1: 80 }, thresholds)
    expect(result.overallScore).toBe(0)
    expect(result.overallLevel).toBe('LOW')
    expect(result.categoryScores[0].score).toBe(80)
    expect(result.categoryScores[0].level).toBe('HIGH')
  })

  it('handles category with question weight sum of zero', () => {
    const zeroQWeightCat: RiskCategory[] = [
      {
        name: 'No Weight',
        weight: 100,
        questions: [
          { id: 'n1', text: 'Q1', weight: 0, type: 'inherent' },
          { id: 'n2', text: 'Q2', weight: 0, type: 'inherent' },
        ],
      },
    ]
    const result = calculateRiskScore(zeroQWeightCat, { n1: 100, n2: 50 }, thresholds)
    expect(result.overallScore).toBe(0)
    expect(result.categoryScores[0].score).toBe(0)
    expect(result.categoryScores[0].level).toBe('LOW')
  })

  it('returns empty list for engagement with no assessments', async () => {
    const results = await getAssessmentsByEngagement('non-existent-engagement')
    expect(results).toHaveLength(0)
  })
})

// ============================================================
// 6. AuditRiskError
// ============================================================

describe('AuditRiskError', () => {
  it('creates error with correct name and message', () => {
    const err = new AuditRiskError('custom error')
    expect(err.name).toBe('AuditRiskError')
    expect(err.message).toBe('custom error')
  })
})