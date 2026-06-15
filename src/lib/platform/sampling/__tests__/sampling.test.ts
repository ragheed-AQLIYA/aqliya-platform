import { describe, expect, it, jest, beforeEach } from '@jest/globals'

const mockStore: Record<string, any[]> = {
  samplingPlan: [],
  samplingResult: [],
  platformAuditLog: [],
}

let idCounter = 1

function nextId() {
  return `plan_${idCounter++}`
}

function resultNextId() {
  return `result_${idCounter++}`
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
  samplingPlan: {
    create: jest.fn(async ({ data }: any) => {
      const record = {
        id: nextId(),
        ...data,
        strataSizes: data.strataSizes ?? null,
        parameters: data.parameters ?? null,
        judgmentalItemIds: data.judgmentalItemIds ?? [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      mockStore.samplingPlan.push(record)
      return record
    }),
    findUnique: jest.fn(async ({ where }: any) => {
      return findInStore('samplingPlan', where) ?? null
    }),
    findMany: jest.fn(async ({ where, orderBy }: any) => {
      let results = filterStore('samplingPlan', where)
      if (orderBy?.createdAt === 'desc') {
        results = [...results].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
      }
      return results
    }),
    update: jest.fn(async ({ where, data }: any) => {
      const idx = mockStore.samplingPlan.findIndex((r) => r.id === where.id)
      if (idx === -1) throw new Error('Record not found')
      mockStore.samplingPlan[idx] = { ...mockStore.samplingPlan[idx], ...data, updatedAt: new Date() }
      return mockStore.samplingPlan[idx]
    }),
    deleteMany: jest.fn(async () => {
      const count = mockStore.samplingPlan.length
      mockStore.samplingPlan = []
      return { count }
    }),
  },
  samplingResult: {
    create: jest.fn(async ({ data }: any) => {
      const record = {
        id: resultNextId(),
        ...data,
        createdAt: new Date(),
        executedAt: new Date(),
      }
      mockStore.samplingResult.push(record)
      return record
    }),
    findUnique: jest.fn(async ({ where }: any) => {
      return findInStore('samplingResult', where) ?? null
    }),
    findMany: jest.fn(async ({ where, orderBy }: any) => {
      let results = filterStore('samplingResult', where)
      if (orderBy?.executedAt === 'desc') {
        results = [...results].sort(
          (a, b) => new Date(b.executedAt).getTime() - new Date(a.executedAt).getTime(),
        )
      }
      return results
    }),
    deleteMany: jest.fn(async () => {
      const count = mockStore.samplingResult.length
      mockStore.samplingResult = []
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
  calculateSampleSize,
  randomSample,
  stratifiedSample,
  systematicSample,
  projectError,
  createPlan,
  executeSample,
  getPlan,
  listPlans,
  getResult,
  getResultsByPlan,
  SamplingMethod,
  SamplingError,
} from '../index'

describe('calculateSampleSize', () => {
  it('returns 0 for population size 0', () => {
    expect(calculateSampleSize(0, 0.95, 5)).toBe(0)
  })

  it('returns full population if population < 30', () => {
    expect(calculateSampleSize(10, 0.95, 5)).toBe(10)
  })

  it('computes correct size at 95% confidence, 5% materiality, N=1000', () => {
    const size = calculateSampleSize(1000, 0.95, 5)
    expect(size).toBeGreaterThan(200)
    expect(size).toBeLessThan(400)
  })

  it('computes correct size at 90% confidence, 5% materiality, N=1000', () => {
    const size = calculateSampleSize(1000, 0.90, 5)
    expect(size).toBeGreaterThan(100)
    expect(size).toBeLessThan(400)
  })

  it('computes correct size at 99% confidence, 5% materiality, N=1000', () => {
    const size = calculateSampleSize(1000, 0.99, 5)
    expect(size).toBeGreaterThan(300)
    expect(size).toBeLessThan(600)
  })

  it('higher confidence requires larger sample', () => {
    const s90 = calculateSampleSize(1000, 0.90, 5)
    const s95 = calculateSampleSize(1000, 0.95, 5)
    const s99 = calculateSampleSize(1000, 0.99, 5)
    expect(s90).toBeLessThan(s95)
    expect(s95).toBeLessThan(s99)
  })

  it('lower materiality (tighter) requires larger sample', () => {
    const s1 = calculateSampleSize(1000, 0.95, 1)
    const s5 = calculateSampleSize(1000, 0.95, 5)
    expect(s1).toBeGreaterThan(s5)
  })
})

describe('randomSample', () => {
  const population = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100]

  it('returns correct count of indices', () => {
    const indices = randomSample(population, 3, 'test-seed')
    expect(indices).toHaveLength(3)
  })

  it('all returned indices are in valid range', () => {
    const indices = randomSample(population, 5, 'test-seed')
    for (const idx of indices) {
      expect(idx).toBeGreaterThanOrEqual(0)
      expect(idx).toBeLessThan(population.length)
    }
  })

  it('returns no duplicates', () => {
    const indices = randomSample(population, 5, 'test-seed')
    const unique = new Set(indices)
    expect(unique.size).toBe(indices.length)
  })

  it('returns all indices when sample size >= population', () => {
    const indices = randomSample(population, 20, 'test-seed')
    expect(indices).toHaveLength(population.length)
  })

  it('returns empty array for empty population', () => {
    const indices = randomSample([], 3, 'test-seed')
    expect(indices).toHaveLength(0)
  })

  it('same seed produces same result', () => {
    const a = randomSample(population, 3, 'deterministic')
    const b = randomSample(population, 3, 'deterministic')
    expect(a).toEqual(b)
  })

  it('different seed produces different result', () => {
    const a = randomSample(population, 3, 'seed-a')
    const b = randomSample(population, 3, 'seed-b')
    expect(a).not.toEqual(b)
  })
})

describe('stratifiedSample', () => {
  interface TestItem {
    id: number
    category: string
    value: number
  }

  const population: TestItem[] = [
    { id: 1, category: 'A', value: 100 },
    { id: 2, category: 'A', value: 200 },
    { id: 3, category: 'A', value: 300 },
    { id: 4, category: 'B', value: 400 },
    { id: 5, category: 'B', value: 500 },
    { id: 6, category: 'B', value: 600 },
    { id: 7, category: 'C', value: 700 },
    { id: 8, category: 'C', value: 800 },
    { id: 9, category: 'C', value: 900 },
  ]

  it('returns correct strata keys', () => {
    const result = stratifiedSample(population, 'category', 2, 'test')
    expect(result.has('A')).toBe(true)
    expect(result.has('B')).toBe(true)
    expect(result.has('C')).toBe(true)
  })

  it('selects at most sizePerStratum from each stratum', () => {
    const result = stratifiedSample(population, 'category', 2, 'test')
    for (const indices of result.values()) {
      expect(indices.length).toBeLessThanOrEqual(2)
    }
  })

  it('all returned indices are in valid range', () => {
    const result = stratifiedSample(population, 'category', 2, 'test')
    for (const indices of result.values()) {
      for (const idx of indices) {
        expect(idx).toBeGreaterThanOrEqual(0)
        expect(idx).toBeLessThan(population.length)
      }
    }
  })

  it('same seed produces same result', () => {
    const a = stratifiedSample(population, 'category', 1, 'seed1')
    const b = stratifiedSample(population, 'category', 1, 'seed1')
    expect(Array.from(a.keys())).toEqual(Array.from(b.keys()))
    for (const key of a.keys()) {
      expect(a.get(key)).toEqual(b.get(key))
    }
  })

  it('handles empty population', () => {
    const result = stratifiedSample([], 'category' as any, 1, 'test')
    expect(result.size).toBe(0)
  })
})

describe('systematicSample', () => {
  const population = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100]

  it('returns correct count', () => {
    const indices = systematicSample(population, 4, 'test')
    expect(indices).toHaveLength(4)
  })

  it('maintains approximately uniform spacing', () => {
    const indices = systematicSample(population, 5, 'test')
    expect(indices.length).toBe(5)
    for (let i = 1; i < indices.length; i++) {
      expect(indices[i] - indices[i - 1]).toBeGreaterThan(0)
    }
  })

  it('all indices are in valid range', () => {
    const indices = systematicSample(population, 3, 'test')
    for (const idx of indices) {
      expect(idx).toBeGreaterThanOrEqual(0)
      expect(idx).toBeLessThan(population.length)
    }
  })

  it('returns all indices when size >= population', () => {
    const indices = systematicSample(population, 20, 'test')
    expect(indices).toHaveLength(population.length)
  })

  it('returns [0] for single-item population', () => {
    const indices = systematicSample([42], 2, 'test')
    expect(indices).toEqual([0])
  })

  it('returns empty for empty population', () => {
    const indices = systematicSample([], 3, 'test')
    expect(indices).toHaveLength(0)
  })
})

describe('projectError', () => {
  it('projects error correctly when rate is known', () => {
    const result = projectError(5, 50, 500, 0.95)
    expect(result.projectedError).toBe(50)
    expect(result.lowerBound).toBeGreaterThanOrEqual(0)
    expect(result.upperBound).toBeGreaterThan(result.projectedError)
    expect(result.confidenceLevel).toBe(0.95)
  })

  it('returns zero projection when sample size is 0', () => {
    const result = projectError(0, 0, 500, 0.95)
    expect(result.projectedError).toBe(0)
    expect(result.lowerBound).toBe(0)
    expect(result.upperBound).toBe(0)
  })

  it('returns zero projection when population size is 0', () => {
    const result = projectError(5, 50, 0, 0.95)
    expect(result.projectedError).toBe(0)
  })

  it('projects error to whole population', () => {
    const result = projectError(2, 20, 200, 0.95)
    expect(result.projectedError).toBe(20)
  })

  it('lower bound increases with higher confidence', () => {
    const r1 = projectError(5, 50, 500, 0.90)
    const r2 = projectError(5, 50, 500, 0.99)
    expect(r2.upperBound).toBeGreaterThan(r1.upperBound)
  })

  it('handles no errors found', () => {
    const result = projectError(0, 50, 500, 0.95)
    expect(result.projectedError).toBe(0)
  })
})

describe('createPlan', () => {
  beforeEach(async () => {
    resetStores()
  })

  it('creates a plan with valid data', async () => {
    const plan = await createPlan('org-1', {
      title: 'Test Plan',
      method: SamplingMethod.RANDOM,
      populationSize: 1000,
      confidenceLevel: 0.95,
      materialityPct: 5,
    }, 'user-1')

    expect(plan.organizationId).toBe('org-1')
    expect(plan.title).toBe('Test Plan')
    expect(plan.method).toBe(SamplingMethod.RANDOM)
    expect(plan.populationSize).toBe(1000)
    expect(plan.confidenceLevel).toBe(0.95)
    expect(plan.materialityPct).toBe(5)
    expect(plan.sampleSize).toBeGreaterThan(0)
    expect(plan.status).toBe('DRAFT')
    expect(plan.createdById).toBe('user-1')
  })

  it('throws for empty orgId', async () => {
    await expect(createPlan('', {
      title: 'Test',
      method: SamplingMethod.RANDOM,
      populationSize: 100,
      confidenceLevel: 0.95,
      materialityPct: 5,
    }, 'user-1')).rejects.toThrow(SamplingError)
  })

  it('throws for invalid confidence level', async () => {
    await expect(createPlan('org-1', {
      title: 'Test',
      method: SamplingMethod.RANDOM,
      populationSize: 100,
      confidenceLevel: 0.80,
      materialityPct: 5,
    }, 'user-1')).rejects.toThrow(SamplingError)
  })

  it('throws for population size 0', async () => {
    await expect(createPlan('org-1', {
      title: 'Test',
      method: SamplingMethod.RANDOM,
      populationSize: 0,
      confidenceLevel: 0.95,
      materialityPct: 5,
    }, 'user-1')).rejects.toThrow(SamplingError)
  })

  it('throws for materiality <= 0', async () => {
    await expect(createPlan('org-1', {
      title: 'Test',
      method: SamplingMethod.RANDOM,
      populationSize: 100,
      confidenceLevel: 0.95,
      materialityPct: 0,
    }, 'user-1')).rejects.toThrow(SamplingError)
  })

  it('creates plan with STRATIFIED method', async () => {
    const plan = await createPlan('org-1', {
      title: 'Stratified Plan',
      method: SamplingMethod.STRATIFIED,
      populationSize: 500,
      confidenceLevel: 0.99,
      materialityPct: 3,
      strataField: 'category',
    }, 'user-1')

    expect(plan.method).toBe(SamplingMethod.STRATIFIED)
    expect(plan.strataField).toBe('category')
  })

  it('creates plan with JUDGMENTAL method and item IDs', async () => {
    const plan = await createPlan('org-1', {
      title: 'Judgmental Plan',
      method: SamplingMethod.JUDGMENTAL,
      populationSize: 10,
      confidenceLevel: 0.90,
      materialityPct: 5,
      judgmentalItemIds: ['item-1', 'item-2'],
    }, 'user-1')

    expect(plan.method).toBe(SamplingMethod.JUDGMENTAL)
    expect(plan.judgmentalItemIds).toEqual(['item-1', 'item-2'])
  })
})

describe('getPlan / listPlans', () => {
  beforeEach(async () => {
    resetStores()
  })

  it('returns null for non-existent plan', async () => {
    const plan = await getPlan('nonexistent')
    expect(plan).toBeNull()
  })

  it('returns plan by id', async () => {
    const created = await createPlan('org-1', {
      title: 'Find Me',
      method: SamplingMethod.RANDOM,
      populationSize: 100,
      confidenceLevel: 0.95,
      materialityPct: 5,
    }, 'user-1')

    const found = await getPlan(created.id)
    expect(found).not.toBeNull()
    expect(found!.id).toBe(created.id)
    expect(found!.title).toBe('Find Me')
  })

  it('lists plans scoped to organization', async () => {
    await createPlan('org-1', { title: 'Plan 1', method: SamplingMethod.RANDOM, populationSize: 100, confidenceLevel: 0.95, materialityPct: 5 }, 'user-1')
    await createPlan('org-1', { title: 'Plan 2', method: SamplingMethod.SYSTEMATIC, populationSize: 200, confidenceLevel: 0.95, materialityPct: 5 }, 'user-1')
    await createPlan('org-2', { title: 'Other Plan', method: SamplingMethod.RANDOM, populationSize: 50, confidenceLevel: 0.95, materialityPct: 5 }, 'user-2')

    const org1Plans = await listPlans('org-1')
    expect(org1Plans).toHaveLength(2)

    const org2Plans = await listPlans('org-2')
    expect(org2Plans).toHaveLength(1)

    const emptyPlans = await listPlans('org-3')
    expect(emptyPlans).toHaveLength(0)
  })
})

describe('executeSample', () => {
  beforeEach(async () => {
    resetStores()
  })

  it('executes a RANDOM plan against population', async () => {
    const plan = await createPlan('org-1', {
      title: 'Random Sample',
      method: SamplingMethod.RANDOM,
      populationSize: 100,
      confidenceLevel: 0.95,
      materialityPct: 5,
    }, 'user-1')

    const population = Array.from({ length: 100 }, (_, i) => ({
      id: `item-${i}`,
      value: Math.random() * 1000,
    }))

    const result = await executeSample(plan.id, population, 'user-1')
    expect(result.planId).toBe(plan.id)
    expect(result.sampleSize).toBeGreaterThan(0)
    expect(result.sampleIndices.length).toBe(result.sampleSize)
    expect(result.organizationId).toBe('org-1')
    expect(result.confidenceLevel).toBe(0.95)
    expect(typeof result.methodology).toBe('string')
  })

  it('executes SYSTEMATIC plan', async () => {
    const plan = await createPlan('org-1', {
      title: 'Systematic Sample',
      method: SamplingMethod.SYSTEMATIC,
      populationSize: 100,
      confidenceLevel: 0.95,
      materialityPct: 5,
    }, 'user-1')

    const population = Array.from({ length: 100 }, (_, i) => ({
      id: `item-${i}`,
      value: i * 10,
    }))

    const result = await executeSample(plan.id, population, 'user-1')
    expect(result.sampleSize).toBeGreaterThan(0)
    expect(result.planId).toBe(plan.id)
  })

  it('executes STRATIFIED plan', async () => {
    const plan = await createPlan('org-1', {
      title: 'Stratified Sample',
      method: SamplingMethod.STRATIFIED,
      populationSize: 90,
      confidenceLevel: 0.95,
      materialityPct: 5,
      strataField: 'category',
    }, 'user-1')

    const population = Array.from({ length: 90 }, (_, i) => ({
      id: `item-${i}`,
      category: i < 30 ? 'A' : i < 60 ? 'B' : 'C',
      value: Math.random() * 1000,
    }))

    const result = await executeSample(plan.id, population, 'user-1', { strataField: 'category' })
    expect(result.sampleSize).toBeGreaterThan(0)
  })

  it('executes JUDGMENTAL plan', async () => {
    const plan = await createPlan('org-1', {
      title: 'Judgmental Sample',
      method: SamplingMethod.JUDGMENTAL,
      populationSize: 10,
      confidenceLevel: 0.90,
      materialityPct: 5,
      judgmentalItemIds: ['item-1', 'item-3', 'item-5'],
    }, 'user-1')

    const population = Array.from({ length: 10 }, (_, i) => ({
      id: `item-${i}`,
      value: i * 100,
    }))

    const result = await executeSample(plan.id, population, 'user-1')
    expect(result.sampleSize).toBe(3)
  })

  it('throws for non-existent plan', async () => {
    await expect(executeSample('nonexistent', [{ id: '1' }], 'user-1')).rejects.toThrow(SamplingError)
  })

  it('throws for already executed plan', async () => {
    const plan = await createPlan('org-1', {
      title: 'Executed Plan',
      method: SamplingMethod.RANDOM,
      populationSize: 50,
      confidenceLevel: 0.95,
      materialityPct: 5,
    }, 'user-1')

    const population = Array.from({ length: 50 }, (_, i) => ({ id: `item-${i}` }))
    await executeSample(plan.id, population, 'user-1')

    await expect(executeSample(plan.id, population, 'user-1')).rejects.toThrow(SamplingError)
  })

  it('throws for empty population', async () => {
    const plan = await createPlan('org-1', {
      title: 'Empty Pop',
      method: SamplingMethod.RANDOM,
      populationSize: 100,
      confidenceLevel: 0.95,
      materialityPct: 5,
    }, 'user-1')

    await expect(executeSample(plan.id, [], 'user-1')).rejects.toThrow(SamplingError)
  })

  it('detects errors in population items', async () => {
    const plan = await createPlan('org-1', {
      title: 'Error Detection',
      method: SamplingMethod.RANDOM,
      populationSize: 10,
      confidenceLevel: 0.95,
      materialityPct: 5,
    }, 'user-1')

    const population = Array.from({ length: 10 }, (_, i) => ({
      id: `item-${i}`,
      value: i * 100,
      isError: i % 2 === 0,
      errorAmount: i % 2 === 0 ? 50 : 0,
    }))

    const result = await executeSample(plan.id, population, 'user-1')
    expect(typeof result.sampleErrors).toBe('number')
    expect(typeof result.totalErrorAmount).toBe('number')
    expect(typeof result.projectedError).toBe('number')
    expect(result.lowerBound).toBeGreaterThanOrEqual(0)
    expect(result.upperBound).toBeGreaterThan(0)
  })
})

describe('getResult / getResultsByPlan', () => {
  beforeEach(async () => {
    resetStores()
  })

  it('returns null for non-existent result', async () => {
    const result = await getResult('nonexistent')
    expect(result).toBeNull()
  })

  it('returns results scoped by plan', async () => {
    const plan1 = await createPlan('org-1', { title: 'P1', method: SamplingMethod.RANDOM, populationSize: 10, confidenceLevel: 0.95, materialityPct: 5 }, 'user-1')
    const plan2 = await createPlan('org-1', { title: 'P2', method: SamplingMethod.SYSTEMATIC, populationSize: 10, confidenceLevel: 0.95, materialityPct: 5 }, 'user-1')

    const pop = Array.from({ length: 10 }, (_, i) => ({ id: `item-${i}` }))
    await executeSample(plan1.id, pop, 'user-1')
    await executeSample(plan2.id, pop, 'user-1')

    const plan1Results = await getResultsByPlan(plan1.id)
    expect(plan1Results).toHaveLength(1)

    const plan2Results = await getResultsByPlan(plan2.id)
    expect(plan2Results).toHaveLength(1)

    const result = await getResult(plan1Results[0].id)
    expect(result).not.toBeNull()
    expect(result!.id).toBe(plan1Results[0].id)
  })
})

describe('SamplingError', () => {
  it('creates error with correct name', () => {
    const err = new SamplingError('test error')
    expect(err.name).toBe('SamplingError')
    expect(err.message).toBe('test error')
  })
})
