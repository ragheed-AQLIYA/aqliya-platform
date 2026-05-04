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
  conditions: z.string().optional(),
})
