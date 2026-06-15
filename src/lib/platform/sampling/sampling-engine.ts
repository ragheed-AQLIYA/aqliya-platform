import 'server-only'

import { prisma } from '@/lib/prisma'
import { writePlatformAuditLog } from '@/lib/platform/audit-log'
import { SAMPLING_STRINGS } from './sampling-strings'

export enum SamplingMethod {
  RANDOM = 'RANDOM',
  STRATIFIED = 'STRATIFIED',
  SYSTEMATIC = 'SYSTEMATIC',
  JUDGMENTAL = 'JUDGMENTAL',
}

export interface CreatePlanData {
  title: string
  method: SamplingMethod
  populationSize: number
  confidenceLevel: number
  materialityPct: number
  engagementId?: string
  strataField?: string
  judgmentalItemIds?: string[]
  parameters?: Record<string, unknown>
}

export interface SamplingPlan {
  id: string
  organizationId: string
  engagementId: string | null
  title: string
  method: SamplingMethod
  populationSize: number
  sampleSize: number | null
  confidenceLevel: number
  materialityPct: number
  strataField: string | null
  strataSizes: Record<string, number> | null
  judgmentalItemIds: string[]
  parameters: Record<string, unknown> | null
  status: string
  createdById: string
  createdAt: Date
  updatedAt: Date
}

export interface SamplingResult {
  id: string
  planId: string
  organizationId: string
  sampleIndices: number[]
  sampleSize: number
  sampleErrors: number
  totalErrorAmount: number | null
  projectedError: number | null
  lowerBound: number | null
  upperBound: number | null
  confidenceLevel: number
  methodology: string
  notes: string | null
  executedById: string
  executedAt: Date
  createdAt: Date
}

export interface ProjectedError {
  projectedError: number
  lowerBound: number
  upperBound: number
  confidenceLevel: number
}

export class SamplingError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'SamplingError'
  }
}

const Z_SCORES: Record<string, number> = {
  '0.90': 1.645,
  '0.95': 1.96,
  '0.99': 2.576,
}

function getZScore(confidenceLevel: number): number {
  const key = confidenceLevel.toFixed(2)
  return Z_SCORES[key] ?? 1.96
}

function mulberry32(seed: number): () => number {
  return () => {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function hashSeed(input: string): number {
  let h = 0
  for (let i = 0; i < input.length; i++) {
    h = Math.imul(31, h) + input.charCodeAt(i)
  }
  return h >>> 0
}

function shuffleIndices(count: number, seed: string): number[] {
  const indices = Array.from({ length: count }, (_, i) => i)
  const rng = mulberry32(hashSeed(seed))
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[indices[i], indices[j]] = [indices[j], indices[i]]
  }
  return indices
}

export function calculateSampleSize(
  populationSize: number,
  confidenceLevel: number,
  materialityPct: number,
): number {
  if (populationSize <= 0) return 0
  if (populationSize < 30) return populationSize

  const Z = getZScore(confidenceLevel)
  const p = 0.5
  const e = materialityPct / 100
  const N = populationSize

  const numerator = Z * Z * p * (1 - p) * N
  const denominator = e * e * (N - 1) + Z * Z * p * (1 - p)

  if (denominator <= 0) return N

  const n = numerator / denominator
  return Math.max(1, Math.ceil(n))
}

export function randomSample<T>(population: T[], size: number, seed?: string): number[] {
  if (population.length === 0) return []
  const actualSize = Math.min(size, population.length)
  const effectiveSeed = seed ?? `random-${Date.now()}`
  const shuffled = shuffleIndices(population.length, effectiveSeed)
  return shuffled.slice(0, actualSize)
}

export function stratifiedSample<T>(
  population: T[],
  strataField: keyof T,
  sizePerStratum: number,
  seed?: string,
): Map<string, number[]> {
  const strata = new Map<string, number[]>()

  for (let i = 0; i < population.length; i++) {
    const key = String(population[i][strataField])
    const group = strata.get(key) ?? []
    group.push(i)
    strata.set(key, group)
  }

  const result = new Map<string, number[]>()
  for (const [key, indices] of strata) {
    const effectiveSeed = seed ? `${seed}-stratum-${key}` : `strat-${key}-${Date.now()}`
    const shuffled = shuffleIndices(indices.length, effectiveSeed)
    const selected = shuffled.slice(0, Math.min(sizePerStratum, indices.length))
    result.set(key, selected.map((i) => indices[i]))
  }

  return result
}

export function systematicSample<T>(population: T[], size: number, seed?: string): number[] {
  if (population.length === 0) return []
  if (population.length < 2) return [0]

  const actualSize = Math.min(size, population.length)
  const interval = Math.max(1, Math.floor(population.length / actualSize))
  const effectiveSeed = seed ?? `sys-${Date.now()}`
  const start = hashSeed(effectiveSeed) % interval

  const result: number[] = []
  for (let i = start; result.length < actualSize && i < population.length; i += interval) {
    result.push(i)
  }

  if (result.length < actualSize) {
    const remaining = shuffleIndices(population.length, `${effectiveSeed}-fill`)
    for (const idx of remaining) {
      if (result.length >= actualSize) break
      if (!result.includes(idx)) result.push(idx)
    }
  }

  return result
}

export function projectError(
  sampleErrors: number,
  sampleSize: number,
  populationSize: number,
  confidenceLevel: number,
): ProjectedError {
  if (sampleSize <= 0 || populationSize <= 0) {
    return { projectedError: 0, lowerBound: 0, upperBound: 0, confidenceLevel }
  }

  const errorRate = sampleErrors / sampleSize
  const projectedErrorValue = errorRate * populationSize

  const Z = getZScore(confidenceLevel)
  const se = Math.sqrt((errorRate * (1 - errorRate)) / sampleSize) * Math.sqrt((populationSize - sampleSize) / (populationSize - 1))
  const moe = Z * se * populationSize

  return {
    projectedError: Math.round(projectedErrorValue * 100) / 100,
    lowerBound: Math.max(0, Math.round((projectedErrorValue - moe) * 100) / 100),
    upperBound: Math.round((projectedErrorValue + moe) * 100) / 100,
    confidenceLevel,
  }
}

export async function createPlan(
  orgId: string,
  data: CreatePlanData,
  userId: string,
): Promise<SamplingPlan> {
  if (!orgId) throw new SamplingError(SAMPLING_STRINGS.error.ORG_ID_REQUIRED)
  if (!data.title) throw new SamplingError(SAMPLING_STRINGS.error.TITLE_REQUIRED)
  if (data.populationSize <= 0) throw new SamplingError(SAMPLING_STRINGS.error.POPULATION_SIZE_REQUIRED)
  if (![0.9, 0.90, 0.95, 0.99].includes(data.confidenceLevel)) {
    throw new SamplingError(SAMPLING_STRINGS.error.CONFIDENCE_LEVEL_INVALID)
  }
  if (data.materialityPct <= 0) throw new SamplingError(SAMPLING_STRINGS.error.MATERIALITY_INVALID)

  const computedSampleSize = calculateSampleSize(data.populationSize, data.confidenceLevel, data.materialityPct)

  const plan = await prisma.samplingPlan.create({
    data: {
      organizationId: orgId,
      engagementId: data.engagementId ?? null,
      title: data.title,
      method: data.method,
      populationSize: data.populationSize,
      sampleSize: computedSampleSize,
      confidenceLevel: data.confidenceLevel,
      materialityPct: data.materialityPct,
      strataField: data.strataField ?? null,
      judgmentalItemIds: data.judgmentalItemIds ?? [],
      parameters: (data.parameters ?? undefined) as any,
      status: 'DRAFT',
      createdById: userId,
    },
  })

  await writePlatformAuditLog({
    productKey: 'audit',
    action: 'SAMPLING_PLAN_CREATED',
    targetType: 'samplingPlan',
    targetId: plan.id,
    actorId: userId,
    metadata: {
      method: data.method,
      populationSize: data.populationSize,
      sampleSize: computedSampleSize,
      confidenceLevel: data.confidenceLevel,
      materialityPct: data.materialityPct,
    },
  })

  return mapPlan(plan)
}

export async function executeSample(
  planId: string,
  population: unknown[],
  userId: string,
  options?: { strataField?: string },
): Promise<SamplingResult> {
  const plan = await prisma.samplingPlan.findUnique({ where: { id: planId } })
  if (!plan) throw new SamplingError(SAMPLING_STRINGS.error.PLAN_NOT_FOUND)
  if (plan.status !== 'DRAFT') throw new SamplingError(SAMPLING_STRINGS.error.PLAN_NOT_DRAFT)
  if (!population.length) throw new SamplingError(SAMPLING_STRINGS.error.POPULATION_EMPTY)

  const method = plan.method as SamplingMethod
  let sampleIndices: number[] = []

  switch (method) {
    case SamplingMethod.RANDOM: {
      const seed = `${plan.id}-random`
      sampleIndices = randomSample(population, plan.sampleSize ?? 1, seed)
      break
    }
    case SamplingMethod.STRATIFIED: {
      const strataField = options?.strataField ?? plan.strataField
      if (!strataField) throw new SamplingError(SAMPLING_STRINGS.error.STRATA_FIELD_MISSING)
      const sizePerStratum = Math.max(1, Math.floor((plan.sampleSize ?? population.length) / 3))
      const strataResult = stratifiedSample(population, strataField as keyof typeof population[0], sizePerStratum, plan.id)
      for (const indices of strataResult.values()) {
        sampleIndices.push(...indices)
      }
      break
    }
    case SamplingMethod.SYSTEMATIC: {
      const seed = `${plan.id}-systematic`
      sampleIndices = systematicSample(population, plan.sampleSize ?? 1, seed)
      break
    }
    case SamplingMethod.JUDGMENTAL: {
      const itemIds = (plan.judgmentalItemIds ?? []) as string[]
      if (!itemIds.length) throw new SamplingError(SAMPLING_STRINGS.error.JUDGMENTAL_IDS_MISSING)
      sampleIndices = itemIds
        .map((id: string) => population.findIndex((item: unknown, idx: number) => {
          const obj = item as Record<string, unknown>
          return obj.id === id || (obj as Record<string, unknown>)['id'] === id
        }))
        .filter((i: number) => i >= 0)
      break
    }
  }

  if (sampleIndices.length === 0) {
    sampleIndices = [0]
  }

  const selectedItems = sampleIndices.map((i) => population[i])
  let sampleErrors = 0
  let totalErrorAmount: number | null = null

  for (const item of selectedItems) {
    const obj = item as Record<string, unknown>
    const err = obj.isError ?? obj.hasError ?? false
    const amt = obj.errorAmount ?? obj.error ?? null
    if (err) sampleErrors++
    if (amt !== null && amt !== undefined) {
      totalErrorAmount = (totalErrorAmount ?? 0) + Number(amt)
    }
  }

  const proj = projectError(sampleErrors, sampleIndices.length, population.length, plan.confidenceLevel)

  const result = await prisma.samplingResult.create({
    data: {
      planId: plan.id,
      organizationId: plan.organizationId,
      sampleIndices,
      sampleSize: sampleIndices.length,
      sampleErrors,
      totalErrorAmount,
      projectedError: proj.projectedError,
      lowerBound: proj.lowerBound,
      upperBound: proj.upperBound,
      confidenceLevel: plan.confidenceLevel,
      methodology: SAMPLING_STRINGS.method[method as keyof typeof SAMPLING_STRINGS.method] ?? method,
      executedById: userId,
    },
  })

  await prisma.samplingPlan.update({
    where: { id: plan.id },
    data: { status: 'EXECUTED', sampleSize: sampleIndices.length },
  })

  await writePlatformAuditLog({
    productKey: 'audit',
    action: 'SAMPLING_PLAN_EXECUTED',
    targetType: 'samplingPlan',
    targetId: plan.id,
    actorId: userId,
    metadata: {
      method,
      sampleSize: sampleIndices.length,
      sampleErrors,
      projectedError: proj.projectedError,
    },
  })

  return mapResult(result)
}

export async function getPlan(planId: string): Promise<SamplingPlan | null> {
  const plan = await prisma.samplingPlan.findUnique({ where: { id: planId } })
  return plan ? mapPlan(plan) : null
}

export async function listPlans(orgId: string): Promise<SamplingPlan[]> {
  const plans = await prisma.samplingPlan.findMany({
    where: { organizationId: orgId },
    orderBy: { createdAt: 'desc' },
  })
  return plans.map(mapPlan)
}

export async function getResult(resultId: string): Promise<SamplingResult | null> {
  const result = await prisma.samplingResult.findUnique({ where: { id: resultId } })
  return result ? mapResult(result) : null
}

export async function getResultsByPlan(planId: string): Promise<SamplingResult[]> {
  const results = await prisma.samplingResult.findMany({
    where: { planId },
    orderBy: { executedAt: 'desc' },
  })
  return results.map(mapResult)
}

function mapPlan(record: {
  id: string
  organizationId: string
  engagementId: string | null
  title: string
  method: string
  populationSize: number
  sampleSize: number | null
  confidenceLevel: number
  materialityPct: number
  strataField: string | null
  strataSizes: unknown
  judgmentalItemIds: unknown
  parameters: unknown
  status: string
  createdById: string
  createdAt: Date
  updatedAt: Date
}): SamplingPlan {
  return {
    id: record.id,
    organizationId: record.organizationId,
    engagementId: record.engagementId,
    title: record.title,
    method: record.method as SamplingMethod,
    populationSize: record.populationSize,
    sampleSize: record.sampleSize,
    confidenceLevel: record.confidenceLevel,
    materialityPct: record.materialityPct,
    strataField: record.strataField,
    strataSizes: record.strataSizes as Record<string, number> | null,
    judgmentalItemIds: record.judgmentalItemIds as string[],
    parameters: record.parameters as Record<string, unknown> | null,
    status: record.status,
    createdById: record.createdById,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  }
}

function mapResult(record: {
  id: string
  planId: string
  organizationId: string
  sampleIndices: unknown
  sampleSize: number
  sampleErrors: number
  totalErrorAmount: number | null
  projectedError: number | null
  lowerBound: number | null
  upperBound: number | null
  confidenceLevel: number
  methodology: string
  notes: string | null
  executedById: string
  executedAt: Date
  createdAt: Date
}): SamplingResult {
  return {
    id: record.id,
    planId: record.planId,
    organizationId: record.organizationId,
    sampleIndices: record.sampleIndices as number[],
    sampleSize: record.sampleSize,
    sampleErrors: record.sampleErrors,
    totalErrorAmount: record.totalErrorAmount,
    projectedError: record.projectedError,
    lowerBound: record.lowerBound,
    upperBound: record.upperBound,
    confidenceLevel: record.confidenceLevel,
    methodology: record.methodology,
    notes: record.notes,
    executedById: record.executedById,
    executedAt: record.executedAt,
    createdAt: record.createdAt,
  }
}
