import { z } from "zod"

const createDecisionSchema = z.object({
  title: z.string().min(1, "Title is required"),
  type: z.enum(["TENDER"]).default("TENDER"),
  ownerId: z.string().min(1, "Owner is required"),
  objectives: z.string().optional(),
  constraints: z.string().optional(),
  assumptions: z.string().optional(),
  alternatives: z.string().optional(),
  risks: z.string().optional(),
})

const decisionScenarioSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Scenario name is required"),
  description: z.string().min(1, "Description is required"),
  assumptions: z.string().min(1, "Assumptions are required"),
  expectedOutcome: z.string().min(1, "Expected outcome is required"),
  affectedStakeholders: z.string().min(1, "Affected stakeholders are required"),
  requiredConditions: z.string().min(1, "Required conditions are required"),
})

const decisionRiskAnalysisSchema = z.object({
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
