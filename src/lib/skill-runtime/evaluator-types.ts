// ─── AQLIYA Skill Evaluator — Types ───
// Types for the Skill Evaluation Engine.
// Covers: dataset loading, sample execution, scoring, report generation.

// ─── Evaluation Dataset ───

export interface EvaluationSample {
  id: string
  description: string
  input: Record<string, unknown>
  expected: Record<string, unknown>
  tags?: string[]
}

export interface EvaluationDataset {
  version: number
  skillId: string
  createdAt?: string
  description?: string
  samples: EvaluationSample[]
}

// ─── Scoring ───

export interface CriterionConfig {
  name: string
  type: "accuracy" | "completeness" | "consistency" | "speed" | "cost" | "custom"
  weight: number
  threshold: number
  metric?: string
}

export interface CriterionScore {
  name: string
  score: number
  weight: number
  threshold: number
  weighted: number
  passed: boolean
}

// ─── Sample-level Result ───

export interface EvaluationSampleResult {
  sampleId: string
  description: string
  status: "completed" | "failed" | "error"
  output: unknown
  error?: string
  criterionScores: Record<string, number>
  overallScore: number
  durationMs: number
}

// ─── Aggregated Evaluation Result ───

export interface EvaluationResult {
  skillId: string
  skillName: string
  skillVersion: string
  datasetName: string
  datasetDescription: string
  sampleCount: number
  timestamp: string
  overallScore: number
  passThreshold: number
  passed: boolean
  criterionBreakdown: CriterionScore[]
  samples: EvaluationSampleResult[]
  errors: string[]
  durationMs: number
}

// ─── Evaluation Options ───

export interface EvaluationOptions {
  /** Path to specific dataset file. Default: from manifest. */
  datasetPath?: string
  /** Override criteria (subset of manifest's). Default: all manifest criteria. */
  criteria?: CriterionConfig[]
  /** Pass threshold override. Default: computed from criteria. */
  passThreshold?: number
  /** Fail on first failing sample. Default: false. */
  failFast?: boolean
  /** Session context to pass to skill execution. */
  session?: { userId?: string; organizationId?: string; role?: string }
  /** Whether to write audit logs during evaluation. Default: false. */
  auditEnabled?: boolean
}

// ─── Batch Evaluation ───

export interface BatchEvaluationResult {
  timestamp: string
  totalSkills: number
  passed: number
  failed: number
  errored: number
  overallPassRate: number
  results: EvaluationResult[]
  durationMs: number
}
