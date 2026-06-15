const stores = new Map()
let idCounter = 1

const MODEL_NAMES = [
  'platformOrganization', 'clientWorkspace', 'project', 'platformAuditLog',
  'officeAiTask', 'officeAiOutput', 'officeAiFile',
  'auditEngagement', 'auditOrganization', 'auditUser', 'auditClient',
  'auditTrialBalance', 'auditTrialBalanceLine', 'auditAccountMapping',
  'auditCanonicalAccount', 'auditFinancialStatement', 'auditDisclosureNote',
  'auditEvidence', 'auditEvidenceLink', 'auditFinding', 'auditRecommendation',
  'auditReviewComment', 'auditApprovalRecord', 'auditPublicationPackage',
  'auditEvent', 'auditAiOutput', 'auditValidationRun', 'auditValidationIssue',
  'auditValidationDisposition', 'organization', 'user', 'decision', 'tenderProfile',
  'objective', 'constraint', 'assumption', 'alternative', 'risk', 'approval',
  'recommendation', 'simulationResult', 'scenario', 'auditLog', 'decisionReport',
  'decisionFramework', 'decisionScenario', 'decisionRiskAnalysis', 'decisionRiskAlert',
  'decisionMonitoringSignal', 'decisionPattern', 'sectorPattern', 'pilotFeedback',
  'pilotSignoff', 'productionBlocker', 'sector', 'sectorBenchmark', 'sectorPlaybook',
  'sectorRule', 'decisionOutcome', 'decisionEvidence', 'sunbulClient', 'sunbulUserMembership', 'sunbulRecord',
  'sunbulDocument', 'sunbulReview', 'sunbulAuditEvent',
  'crmConnection', 'crmSyncLog',
  'tenantIntegration',
  'tBMappingPattern', 'tBMappingFeedback', 'tBClassificationHistory',
  'salesAccount', 'salesContact', 'salesDeal', 'salesAuditEvent',
  'salesPipeline', 'salesPipelineStage', 'salesInteraction',
  'salesEvidenceLink', 'salesSignal',
]

const AuditAction = {
  DECISION_CREATED: 'DECISION_CREATED',
  DECISION_UPDATED: 'DECISION_UPDATED',
  RECOMMENDATION_UPDATED: 'RECOMMENDATION_UPDATED',
  PATTERN_EXTRACTED: 'PATTERN_EXTRACTED',
  ALERT_RESOLVED: 'ALERT_RESOLVED',
  SECTOR_ASSIGNED: 'SECTOR_ASSIGNED',
  BENCHMARK_CREATED: 'BENCHMARK_CREATED',
  OUTPUT_PUBLISHED: 'OUTPUT_PUBLISHED',
  OUTPUT_UNPUBLISHED: 'OUTPUT_UNPUBLISHED',
  SUBMITTED_FOR_REVIEW: 'SUBMITTED_FOR_REVIEW',
  DECISION_APPROVED: 'DECISION_APPROVED',
  DECISION_APPROVED_WITH_CONDITIONS: 'DECISION_APPROVED_WITH_CONDITIONS',
  DECISION_REJECTED: 'DECISION_REJECTED',
  REVISION_REQUESTED: 'REVISION_REQUESTED',
  SNAPSHOT_PUBLISHED: 'SNAPSHOT_PUBLISHED',
  CURRENT_PUBLISHED_WITHOUT_APPROVAL: 'CURRENT_PUBLISHED_WITHOUT_APPROVAL',
  STALE_PUBLISH_BLOCKED: 'STALE_PUBLISH_BLOCKED',
  STALE_PUBLISH_OVERRIDE: 'STALE_PUBLISH_OVERRIDE',
  OUTCOME_CREATED: 'OUTCOME_CREATED',
  OUTCOME_UPDATED: 'OUTCOME_UPDATED',
  OUTCOME_REVIEWED: 'OUTCOME_REVIEWED',
}

function now() {
  return new Date()
}

function nextId(model) {
  return `${model}_${idCounter++}`
}

function clone(value) {
  if (value instanceof Date) return new Date(value)
  if (Array.isArray(value)) return value.map(clone)
  if (value && typeof value === 'object') {
    const result = {}
    for (const [key, child] of Object.entries(value)) {
      result[key] = clone(child)
    }
    return result
  }
  return value
}

function getStore(model) {
  if (!stores.has(model)) {
    stores.set(model, [])
  }
  return stores.get(model)
}

function resetStore(model) {
  const store = getStore(model)
  const count = store.length
  store.length = 0
  return { count }
}

function applyDefaults(model, data) {
  const createdAt = data.createdAt ? new Date(data.createdAt) : now()
  const updatedAt = data.updatedAt ? new Date(data.updatedAt) : createdAt
  const defaults = {
    id: data.id || nextId(model),
    createdAt,
    updatedAt,
  }

  switch (model) {
    case 'decision':
      return { status: 'DRAFT', priority: 'MEDIUM', ...defaults, ...data }
    case 'recommendation':
      return {
        humanReviewRequired: true,
        isClientVisible: false,
        publishedVersion: 1,
        publishedFromSnapshot: false,
        ...defaults,
        ...data,
      }
    case 'approval':
      return { status: 'PENDING', ...defaults, ...data }
    case 'decisionMonitoringSignal':
      return { status: 'NEW', generatedBy: 'system', ...defaults, ...data }
    case 'decisionRiskAlert':
      return { status: 'OPEN', requiresReview: true, ...defaults, ...data }
    case 'sector':
      return { isActive: true, ...defaults, ...data }
    case 'officeAiTask':
      return { status: 'draft', language: 'ar', ...defaults, ...data }
    case 'officeAiOutput':
      return { status: 'draft', format: 'markdown', aiProvider: 'deterministic', ...defaults, ...data }
    case 'platformOrganization':
    case 'clientWorkspace':
    case 'project':
    case 'decisionEvidence':
    case 'sunbulClient':
    case 'sunbulUserMembership':
    case 'sunbulRecord':
    case 'sunbulDocument':
    case 'sunbulReview':
      return { status: 'active', ...defaults, ...data }
    default:
      return { ...defaults, ...data }
  }
}

function normalizeData(model, data) {
  const record = applyDefaults(model, clone(data))
  if (model === 'decisionRiskAlert' && !record.triggeringSignalId && record.triggeringSignal && record.triggeringSignal.id) {
    record.triggeringSignalId = record.triggeringSignal.id
  }
  return record
}

function matchesWhere(record, where) {
  if (!where) return true

  if (where.OR) {
    return where.OR.some((entry) => matchesWhere(record, entry))
  }

  if (where.AND) {
    return where.AND.every((entry) => matchesWhere(record, entry))
  }

  return Object.entries(where).every(([key, value]) => {
    if (key === 'OR' || key === 'AND') return true

    if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
      if (Object.prototype.hasOwnProperty.call(value, 'path') && Object.prototype.hasOwnProperty.call(value, 'equals')) {
        const pathArray = value.path;
        if (Array.isArray(pathArray)) {
          let current = record[key];
          for (const segment of pathArray) {
            if (current == null || typeof current !== 'object') return false;
            current = current[segment];
          }
          return current === value.equals;
        }
      }

      if (Object.prototype.hasOwnProperty.call(value, 'contains')) {
        const candidate = String(record[key] || '')
        const needle = String(value.contains || '')
        return value.mode === 'insensitive'
          ? candidate.toLowerCase().includes(needle.toLowerCase())
          : candidate.includes(needle)
      }

      if (Object.prototype.hasOwnProperty.call(value, 'increment')) {
        return record[key] === value.increment
      }

      if (Object.prototype.hasOwnProperty.call(value, 'lt')) {
        return record[key] < value.lt
      }

      if (Object.prototype.hasOwnProperty.call(value, 'gte')) {
        return record[key] >= value.gte
      }

      if (key.includes('_')) {
        return Object.entries(value).every(([nestedKey, nestedValue]) => record[nestedKey] === nestedValue)
      }

      return Object.entries(value).every(([nestedKey, nestedValue]) => {
        const nestedRecord = record[key]
        return nestedRecord && nestedRecord[nestedKey] === nestedValue
      })
    }

    return record[key] === value
  })
}

function sortRecords(records, orderBy) {
  if (!orderBy) return records
  const [field, direction] = Object.entries(orderBy)[0]
  const sorted = [...records].sort((a, b) => {
    if (a[field] < b[field]) return direction === 'desc' ? 1 : -1
    if (a[field] > b[field]) return direction === 'desc' ? -1 : 1
    return 0
  })
  return sorted
}

function applyMutation(record, data) {
  for (const [key, value] of Object.entries(data || {})) {
    if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
      if (Object.prototype.hasOwnProperty.call(value, 'increment')) {
        record[key] = (record[key] || 0) + value.increment
        continue
      }
      if (Object.prototype.hasOwnProperty.call(value, 'set')) {
        record[key] = value.set
        continue
      }
    }
    record[key] = value
  }
  record.updatedAt = now()
  return record
}

function getOne(model, where) {
  return getStore(model).find((record) => matchesWhere(record, where)) || null
}

function getMany(model, where) {
  return getStore(model).filter((record) => matchesWhere(record, where))
}

function resolveRelation(model, record, key) {
  if (!record) return null

  switch (model) {
    case 'decision':
      if (key === 'organization') return getOne('organization', { id: record.organizationId })
      if (key === 'owner') return getOne('user', { id: record.ownerId })
      if (key === 'reviewer') return getOne('user', { id: record.reviewerId })
      if (key === 'approver') return getOne('user', { id: record.approverId })
      if (key === 'recommendation') return getOne('recommendation', { decisionId: record.id })
      if (key === 'approvals') return getMany('approval', { decisionId: record.id })
      if (key === 'auditLogs') return getMany('auditLog', { decisionId: record.id })
      if (key === 'tenderProfile') return getOne('tenderProfile', { decisionId: record.id })
      if (key === 'framework') return getOne('decisionFramework', { decisionId: record.id })
      if (key === 'decisionScenarios') return getMany('decisionScenario', { decisionId: record.id })
      if (key === 'riskAnalyses') return getMany('decisionRiskAnalysis', { decisionId: record.id })
      if (key === 'objectives') return getMany('objective', { decisionId: record.id })
      if (key === 'constraints') return getMany('constraint', { decisionId: record.id })
      if (key === 'assumptions') return getMany('assumption', { decisionId: record.id })
      if (key === 'alternatives') return getMany('alternative', { decisionId: record.id })
      if (key === 'risks') return getMany('risk', { decisionId: record.id })
      if (key === 'scenarios') return getMany('scenario', { decisionId: record.id })
      if (key === 'signals') return getMany('decisionMonitoringSignal', { decisionId: record.id })
      if (key === 'alerts') return getMany('decisionRiskAlert', { decisionId: record.id })
      if (key === 'reports') return getMany('decisionReport', { decisionId: record.id })
      if (key === 'outcome') return getOne('decisionOutcome', { decisionId: record.id })
      break
    case 'recommendation':
      if (key === 'decision') return getOne('decision', { id: record.decisionId })
      if (key === 'publishedBy') return getOne('user', { id: record.publishedById })
      if (key === 'approvals') return getMany('approval', { recommendationId: record.id })
      break
    case 'approval':
      if (key === 'decision') return getOne('decision', { id: record.decisionId })
      if (key === 'approver') return getOne('user', { id: record.approverId })
      if (key === 'recommendation') return getOne('recommendation', { id: record.recommendationId })
      break
    case 'auditLog':
      if (key === 'decision') return getOne('decision', { id: record.decisionId })
      if (key === 'organization') return getOne('organization', { id: record.organizationId })
      if (key === 'user') return getOne('user', { id: record.userId })
      break
    case 'organization':
      if (key === 'users') return getMany('user', { organizationId: record.id })
      if (key === 'decisions') return getMany('decision', { organizationId: record.id })
      break
    case 'user':
      if (key === 'organization') return getOne('organization', { id: record.organizationId })
      break
    case 'decisionMonitoringSignal':
      if (key === 'alerts') return getMany('decisionRiskAlert', { triggeringSignalId: record.id })
      if (key === 'decision') return getOne('decision', { id: record.decisionId })
      if (key === 'organization') return getOne('organization', { id: record.organizationId })
      break
    case 'decisionRiskAlert':
      if (key === 'triggeringSignal') return getOne('decisionMonitoringSignal', { id: record.triggeringSignalId })
      if (key === 'decision') return getOne('decision', { id: record.decisionId })
      if (key === 'organization') return getOne('organization', { id: record.organizationId })
      break
    case 'scenario':
      if (key === 'simulation') return getOne('simulationResult', { scenarioId: record.id })
      break
    case 'officeAiOutput':
      if (key === 'task') return getOne('officeAiTask', { id: record.taskId })
      break
    case 'officeAiFile':
      if (key === 'task') return getOne('officeAiTask', { id: record.taskId })
      break
    case 'officeAiTask':
      if (key === 'outputs') return getMany('officeAiOutput', { taskId: record.id })
      if (key === 'sourceFiles') return getMany('officeAiFile', { taskId: record.id })
      break
    case 'auditEvidence':
      if (key === 'engagement') return getOne('auditEngagement', { id: record.engagementId })
      break
    case 'auditAccountMapping':
      if (key === 'canonicalAccount') {
        return getOne('auditCanonicalAccount', { id: record.canonicalAccountId })
      }
      break
  }

  return record[key] ?? null
}

function projectValue(model, record, key, config, mode) {
  const relation = resolveRelation(model, record, key)
  if (mode === 'select' && config === true) {
    return clone(relation)
  }
  if (config === true) {
    return clone(relation)
  }

  if (Array.isArray(relation)) {
    let items = relation
    if (config.where) items = items.filter((item) => matchesWhere(item, config.where))
    if (config.orderBy) items = sortRecords(items, config.orderBy)
    if (typeof config.take === 'number') items = items.slice(0, config.take)
    return items.map((item) => projectRecord(inferModelName(key), item, config.select, config.include))
  }

  if (relation && typeof relation === 'object') {
    return projectRecord(inferModelName(key), relation, config.select, config.include)
  }

  return relation
}

function projectRecord(model, record, select, include) {
  if (!record) return null
  const source = clone(record)

  if (select) {
    const result = {}
    for (const [key, config] of Object.entries(select)) {
      if (config === true && Object.prototype.hasOwnProperty.call(source, key)) {
        result[key] = source[key]
      } else {
        result[key] = projectValue(model, source, key, config, 'select')
      }
    }
    return result
  }

  if (include) {
    for (const [key, config] of Object.entries(include)) {
      source[key] = projectValue(model, source, key, config, 'include')
    }
  }

  return source
}

function inferModelName(key) {
  const mapping = {
    organization: 'organization',
    owner: 'user',
    reviewer: 'user',
    approver: 'user',
    recommendation: 'recommendation',
    approvals: 'approval',
    auditLogs: 'auditLog',
    tenderProfile: 'tenderProfile',
    framework: 'decisionFramework',
    decisionScenarios: 'decisionScenario',
    riskAnalyses: 'decisionRiskAnalysis',
    objectives: 'objective',
    constraints: 'constraint',
    assumptions: 'assumption',
    alternatives: 'alternative',
    risks: 'risk',
    scenarios: 'scenario',
    signals: 'decisionMonitoringSignal',
    alerts: 'decisionRiskAlert',
    reports: 'decisionReport',
    outcome: 'decisionOutcome',
    user: 'user',
    decision: 'decision',
    publishedBy: 'user',
    triggeringSignal: 'decisionMonitoringSignal',
    simulation: 'simulationResult',
    task: 'officeAiTask',
    outputs: 'officeAiOutput',
    sourceFiles: 'officeAiFile',
    engagement: 'auditEngagement',
    canonicalAccount: 'auditCanonicalAccount',
  }
  return mapping[key] || key
}

function makeModel(model) {
  return {
    create: async ({ data }) => {
      const record = normalizeData(model, data)
      getStore(model).push(record)
      return clone(record)
    },
    findUnique: async (args = {}) => {
      const record = getOne(model, args.where)
      return projectRecord(model, record, args.select, args.include)
    },
    findFirst: async (args = {}) => {
      const records = sortRecords(getMany(model, args.where), args.orderBy)
      return projectRecord(model, records[0] || null, args.select, args.include)
    },
    findMany: async (args = {}) => {
      let records = getMany(model, args.where)
      records = sortRecords(records, args.orderBy)
      if (typeof args.take === 'number') records = records.slice(0, args.take)
      return records.map((record) => projectRecord(model, record, args.select, args.include))
    },
    update: async ({ where, data, select, include }) => {
      const record = getOne(model, where)
      if (!record) throw new Error(`${model} not found`)
      applyMutation(record, data)
      return projectRecord(model, record, select, include)
    },
    upsert: async ({ where, create, update }) => {
      const existing = getOne(model, where)
      if (existing) {
        applyMutation(existing, update)
        return clone(existing)
      }
      const record = normalizeData(model, create)
      getStore(model).push(record)
      return clone(record)
    },
    deleteMany: async ({ where } = {}) => {
      if (!where) return resetStore(model)
      const store = getStore(model)
      const remaining = store.filter((record) => !matchesWhere(record, where))
      const count = store.length - remaining.length
      store.length = 0
      store.push(...remaining)
      return { count }
    },
    count: async ({ where } = {}) => getMany(model, where).length,
    groupBy: async ({ by, where, _count }) => {
      const field = by[0]
      const groups = new Map()
      for (const record of getMany(model, where)) {
        const key = record[field]
        groups.set(key, (groups.get(key) || 0) + 1)
      }
      return Array.from(groups.entries()).map(([value, count]) => ({
        [field]: value,
        _count: _count ? count : undefined,
      }))
    },
  }
}

// eslint-disable-next-line @typescript-eslint/no-this-alias
function PrismaClient() {
  for (const model of MODEL_NAMES) {
    this[model] = makeModel(model)
  }

  this.$queryRaw = () => Promise.resolve([{ 1: 1 }])
  this.$disconnect = () => Promise.resolve()
  this.$transaction = async (fn) => fn(this)
}

module.exports = { PrismaClient, AuditAction }
