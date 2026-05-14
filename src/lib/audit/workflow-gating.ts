export interface WorkflowContext {
  engagementStatus: string
  hasTrialBalance: boolean
  hasMappings: boolean
  hasConfirmedMappings: boolean
  hasFinancialStatements: boolean
  hasNotes: boolean
  hasEvidence: boolean
  hasFindings: boolean
  hasRecommendations: boolean
  hasReviewActivity: boolean
  isApproved: boolean
  isPublished: boolean
  governanceFinalizationAllowed: boolean
}

export interface TabGateResult {
  locked: boolean
  reason?: string
}

type TabGate = (ctx: WorkflowContext) => TabGateResult

const tabGates: Record<string, TabGate> = {
  overview: () => ({ locked: false }),

  'trial-balance': () => ({ locked: false }),

  mapping: (ctx) => {
    if (!ctx.hasTrialBalance) {
      return { locked: true, reason: 'Upload a trial balance before accessing account mapping.' }
    }
    return { locked: false }
  },

  validation: (ctx) => {
    if (!ctx.hasTrialBalance) {
      return { locked: true, reason: 'Upload a trial balance before running validation.' }
    }
    return { locked: false }
  },

  statements: (ctx) => {
    if (!ctx.hasTrialBalance) {
      return { locked: true, reason: 'Upload a trial balance before generating financial statements.' }
    }
    if (!ctx.hasMappings) {
      return { locked: true, reason: 'Complete account mapping before generating financial statements.' }
    }
    return { locked: false }
  },

  notes: (ctx) => {
    if (!ctx.hasFinancialStatements) {
      return { locked: true, reason: 'Generate financial statements before drafting notes.' }
    }
    return { locked: false }
  },

  evidence: () => ({ locked: false }),

  findings: (ctx) => {
    if (!ctx.hasEvidence) {
      return { locked: true, reason: 'Create evidence requests before identifying findings.' }
    }
    return { locked: false }
  },

  recommendations: (ctx) => {
    if (!ctx.hasFindings) {
      return { locked: true, reason: 'Identify findings before creating recommendations.' }
    }
    return { locked: false }
  },

  review: (ctx) => {
    if (!ctx.hasFindings && !ctx.hasRecommendations && !ctx.hasReviewActivity) {
      return { locked: true, reason: 'Create findings or recommendations before starting the review process.' }
    }
    return { locked: false }
  },

  approval: (ctx) => {
    if (!ctx.hasReviewActivity) {
      return { locked: true, reason: 'Complete the review process before requesting approval.' }
    }
    if (ctx.isPublished) {
      return { locked: true, reason: 'This engagement is already published.' }
    }
    if (ctx.isApproved) {
      return { locked: true, reason: 'This engagement is already approved.' }
    }
    return { locked: false }
  },

  publication: (ctx) => {
    if (ctx.isPublished) {
      return { locked: true, reason: 'This engagement is already published.' }
    }
    if (!ctx.isApproved && !ctx.governanceFinalizationAllowed) {
      return { locked: true, reason: 'Approval is required before publication. Complete the approval step first.' }
    }
    return { locked: false }
  },

  'audit-trail': () => ({ locked: false }),

  pilot: () => ({ locked: false }),
}

export function evaluateTabGate(tabKey: string, ctx: WorkflowContext): TabGateResult {
  const gate = tabGates[tabKey]
  if (!gate) return { locked: false }
  return gate(ctx)
}

export function evaluateAllTabGates(ctx: WorkflowContext): Record<string, TabGateResult> {
  const results: Record<string, TabGateResult> = {}
  for (const tabKey of Object.keys(tabGates)) {
    results[tabKey] = evaluateTabGate(tabKey, ctx)
  }
  return results
}

export function isTabAccessible(tabKey: string, ctx: WorkflowContext): boolean {
  return !evaluateTabGate(tabKey, ctx).locked
}
