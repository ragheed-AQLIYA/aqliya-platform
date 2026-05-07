import { z } from "zod"

export const createDecisionSchema = z.object({
  title: z.string().min(1, "Title is required"),
  type: z.enum(["TENDER"]).default("TENDER"),
  ownerId: z.string().min(1, "Owner is required"),
  objectives: z.string().optional(),
  constraints: z.string().optional(),
  assumptions: z.string().optional(),
  alternatives: z.string().optional(),
  risks: z.string().optional(),
})

export const updateDecisionSchema = createDecisionSchema.partial()

export const decisionIntakeSchema = z.object({
  title: z.string().min(1, "Decision title is required"),
  objectives: z.string().min(1, "At least one objective is required"),
  alternatives: z.string().min(1, "At least two alternatives are required"),
  risks: z.string().min(1, "At least one risk or uncertainty is required"),
})

export const decisionFrameworkSchema = z.object({
  context: z.string().min(1, "Context is required"),
  purpose: z.string().min(1, "Purpose is required"),
  options: z.string().min(1, "Options are required"),
  criteria: z.string().min(1, "Criteria are required"),
  values: z.string().min(1, "Values are required"),
  informationGaps: z.string().min(1, "Information gaps are required"),
  certainty: z.string().min(1, "Certainty is required"),
  assumptions: z.string().min(1, "Assumptions are required"),
})

export const decisionScenarioSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Scenario name is required"),
  description: z.string().min(1, "Description is required"),
  assumptions: z.string().min(1, "Assumptions are required"),
  expectedOutcome: z.string().min(1, "Expected outcome is required"),
  affectedStakeholders: z.string().min(1, "Affected stakeholders are required"),
  requiredConditions: z.string().min(1, "Required conditions are required"),
})

export const decisionScenariosSchema = z.object({
  scenarios: z.array(decisionScenarioSchema).min(3, "At least the three default scenarios are required"),
})

export const decisionRiskAnalysisSchema = z.object({
  id: z.string().optional(),
  scenarioId: z.string().min(1, "Scenario is required"),
  risks: z.string().min(1, "Risks are required"),
  tradeoffs: z.string().min(1, "Trade-offs are required"),
  sacrifices: z.string().min(1, "Sacrifices are required"),
  opportunityCosts: z.string().min(1, "Opportunity costs are required"),
  stakeholderRisks: z.string().min(1, "Stakeholder risks are required"),
  operationalRisks: z.string().min(1, "Operational risks are required"),
  strategicRisks: z.string().min(1, "Strategic risks are required"),
  knowledgeRisks: z.string().min(1, "Knowledge risks are required"),
  uncertaintyLevel: z.string().min(1, "Uncertainty level is required"),
})

export const decisionRiskAnalysesSchema = z.object({
  analyses: z.array(decisionRiskAnalysisSchema).min(3, "Risk analysis is required for each scenario"),
})

export const tenderSchema = z.object({
  clientName: z.string().min(1, "Client name is required"),
  estimatedContractValue: z.number().positive("Must be positive"),
  estimatedCost: z.number().positive("Must be positive"),
  durationMonths: z.number().int().positive("Must be positive"),
  requiredCapacity: z.number().int().positive("Must be positive"),
  internalAvailableCapacity: z.number().int().min(0, "Cannot be negative"),
  strategicFitScore: z.number().int().min(0).max(100, "Must be 0-100"),
  riskLevel: z.enum(["LOW", "MEDIUM", "HIGH"]),
  marginEstimate: z.number().min(0, "Cannot be negative"),
})

export const simulationSchema = z.object({
  scenarioType: z.enum(["BEST_CASE", "EXPECTED_CASE", "WORST_CASE"]),
  feasibilityScore: z.number().min(0).max(100),
  financialScore: z.number().min(0).max(100),
  capacityScore: z.number().min(0).max(100),
  riskScore: z.number().min(0).max(100),
  strategicFitScore: z.number().min(0).max(100),
  overallScore: z.number().min(0).max(100),
})

export const recommendationSchema = z.object({
  type: z.enum(["GO", "GO_WITH_CONDITIONS", "NO_GO"]),
  recommendedAction: z.string().min(1, "Recommended action is required"),
  rationale: z.string().min(1, "Rationale is required"),
  expectedNextState: z.string().min(1, "Expected next state is required"),
  scopeExclusions: z.string().min(1, "Explicit scope exclusions are required"),
  assumptionsUsed: z.string().min(1, "Assumptions used are required"),
  risksAccepted: z.string().min(1, "Risks accepted are required"),
  risksRejected: z.string().min(1, "Risks rejected are required"),
  humanReviewRequired: z.boolean().default(true),
  conditions: z.string().optional(),
})
