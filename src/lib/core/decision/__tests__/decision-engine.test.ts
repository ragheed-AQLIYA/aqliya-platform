import { describe, expect, it } from '@jest/globals'

import {
  evaluateDecisionIntake,
  evaluateDecisionFramework,
  evaluateDecisionScenarios,
  evaluateDecisionRiskAnalysis,
  evaluateDecisionRecommendation,
  createDefaultDecisionScenarios,
} from '../evaluators'

import {
  getDecisionCompletionState,
  getNextDecisionStep,
  getDecisionProgressSummary,
} from '../engine'

import type { DecisionEngineConfig, DecisionForEngine, DecisionStageState } from '../types'

// ─── Mock Engine Config with evaluators ───

const mockEvaluator = (moduleId: string, status: DecisionStageState['status']) => ({
  evaluate: () => ({
    id: moduleId, label: moduleId, href: `/${moduleId}`, status, description: `${moduleId} stage`,
  }),
})

const mockConfig: DecisionEngineConfig = {
  modules: [
    { id: 'intake', label: 'Intake', href: '/intake', description: 'Define objectives', required: true },
    { id: 'recommendation', label: 'Recommendation', href: '/recommendation', description: 'Recommend', required: true },
    { id: 'optional-module', label: 'Optional', href: '/optional', description: 'Optional', required: false },
  ],
  getStageEvaluator(moduleId: string) {
    if (moduleId === 'intake') return mockEvaluator('intake', 'complete')
    if (moduleId === 'recommendation') return mockEvaluator('recommendation', 'not_started')
    return null
  },
}

const completeDecision: DecisionForEngine = {
  id: 'dec-1', type: 'TENDER', title: 'Test Decision', status: 'DRAFT',
  objectives: [{ description: 'Obj 1' }],
  alternatives: [{ description: 'Alt 1' }],
  risks: [{ description: 'Risk 1' }],
}

// ─── Intake Tests ───

describe('evaluateDecisionIntake', () => {
  it('accepts valid decision intake', () => {
    const result = evaluateDecisionIntake({
      title: 'Should we bid for contract X?',
      objectives: [{ description: 'Increase revenue' }],
      alternatives: [{ description: 'Bid on contract' }, { description: 'Do nothing and wait' }],
      risks: [{ description: 'Cost overrun' }],
    })
    expect(result.status).toBe('accepted')
    expect(result.readyForFramework).toBe(true)
  })

  it('rejects information requests', () => {
    const result = evaluateDecisionIntake({
      title: 'What is the current budget?',
    })
    expect(result.status).toBe('rejected')
    expect(result.reasonCodes).toContain('information_request')
  })

  it('flags missing objective', () => {
    const result = evaluateDecisionIntake({
      title: 'Should we expand?',
      objectives: [],
      alternatives: [{ description: 'Option A' }],
      risks: [{ description: 'Risk' }],
    })
    expect(result.status).not.toBe('accepted')
    expect(result.reasonCodes).toContain('missing_objective')
  })
})

// ─── Framework Tests ───

describe('evaluateDecisionFramework', () => {
  it('reports complete when all fields filled', () => {
    const result = evaluateDecisionFramework({
      context: 'Market analysis', purpose: 'Decide direction',
      options: 'Option A, B', criteria: 'Cost, Impact',
      values: 'Efficiency', informationGaps: 'None',
      certainty: 'Medium', assumptions: 'Stable market',
    })
    expect(result.isComplete).toBe(true)
    expect(result.missingFields).toHaveLength(0)
  })

  it('detects missing fields', () => {
    const result = evaluateDecisionFramework({ context: 'Only context' })
    expect(result.isComplete).toBe(false)
    expect(result.missingFields.length).toBeGreaterThan(0)
  })
})

// ─── Scenario Tests ───

describe('evaluateDecisionScenarios', () => {
  it('reports complete when all default scenarios are filled', () => {
    const scenarios = [
      { name: 'Base case', description: 'Expected', assumptions: 'Normal', expectedOutcome: 'Stable', affectedStakeholders: 'All', requiredConditions: 'None' },
      { name: 'Upside case', description: 'Best', assumptions: 'Growth', expectedOutcome: 'Profit', affectedStakeholders: 'Investors', requiredConditions: 'Funding' },
      { name: 'Downside case', description: 'Worst', assumptions: 'Decline', expectedOutcome: 'Loss', affectedStakeholders: 'Employees', requiredConditions: 'Reserves' },
    ]
    const result = evaluateDecisionScenarios(scenarios)
    expect(result.isComplete).toBe(true)
  })

  it('detects missing default scenarios', () => {
    const result = evaluateDecisionScenarios([{ name: 'Custom' }])
    expect(result.isComplete).toBe(false)
    expect(result.missingDefaultScenarios).toContain('Upside case')
  })
})

describe('createDefaultDecisionScenarios', () => {
  it('creates missing default scenarios', () => {
    const result = createDefaultDecisionScenarios([])
    const names = result.map((s) => s.name)
    expect(names).toContain('Base case')
    expect(names).toContain('Upside case')
    expect(names).toContain('Downside case')
  })
})

// ─── Risk Analysis Tests ───

describe('evaluateDecisionRiskAnalysis', () => {
  const scenarios = [
    { id: 's1', name: 'Base case' },
    { id: 's2', name: 'Upside case' },
    { id: 's3', name: 'Downside case' },
  ]

  it('reports complete when all scenarios have risk analysis', () => {
    const analyses = [
      { scenarioId: 's1', risks: 'Low', tradeoffs: 'Minor', sacrifices: 'Time', opportunityCosts: 'Revenue', stakeholderRisks: 'Low', operationalRisks: 'Medium', strategicRisks: 'None', knowledgeRisks: 'Low', uncertaintyLevel: 'Medium' },
      { scenarioId: 's2', risks: 'Medium', tradeoffs: 'Significant', sacrifices: 'Resources', opportunityCosts: 'Growth', stakeholderRisks: 'Medium', operationalRisks: 'High', strategicRisks: 'Low', knowledgeRisks: 'Medium', uncertaintyLevel: 'High' },
      { scenarioId: 's3', risks: 'High', tradeoffs: 'Critical', sacrifices: 'Capital', opportunityCosts: 'Market share', stakeholderRisks: 'High', operationalRisks: 'High', strategicRisks: 'Medium', knowledgeRisks: 'High', uncertaintyLevel: 'Very High' },
    ]
    const result = evaluateDecisionRiskAnalysis(scenarios, analyses)
    expect(result.isComplete).toBe(true)
  })

  it('detects missing scenario analyses', () => {
    const result = evaluateDecisionRiskAnalysis(scenarios, [])
    expect(result.missingScenarioAnalyses.length).toBeGreaterThan(0)
  })
})

// ─── Recommendation Tests ───

describe('evaluateDecisionRecommendation', () => {
  it('reports complete when all fields are filled', () => {
    const result = evaluateDecisionRecommendation({
      recommendedAction: 'Proceed', rationale: 'Sound investment',
      expectedNextState: 'Contract signed', scopeExclusions: 'None',
      assumptionsUsed: 'Market stable', risksAccepted: 'Cost variance',
      risksRejected: 'None', humanReviewRequired: true,
    })
    expect(result.isComplete).toBe(true)
  })

  it('detects missing fields', () => {
    const result = evaluateDecisionRecommendation({ recommendedAction: 'Proceed' })
    expect(result.isComplete).toBe(false)
    expect(result.missingFields).toContain('rationale')
  })
})

// ─── Engine Tests ───

describe('DecisionEngine', () => {
  it('returns completion state with progress', () => {
    const state = getDecisionCompletionState(completeDecision, mockConfig)
    expect(state.overallProgress).toBeGreaterThanOrEqual(0)
    expect(state.stages).toHaveLength(3)
    expect(state.blockedStages).toBeDefined()
  })

  it('getNextDecisionStep returns first incomplete stage', () => {
    const next = getNextDecisionStep(completeDecision, mockConfig)
    expect(next).not.toBeNull()
  })

  it('getDecisionProgressSummary returns metrics', () => {
    const summary = getDecisionProgressSummary(completeDecision, mockConfig)
    expect(summary.completed).toBeGreaterThanOrEqual(0)
    expect(summary.total).toBeGreaterThan(0)
  })
})
