// ============================================
// AQLIYA — Intelligence Graph Contracts
// ============================================
// Shared intelligence semantics across all modules

export type IntelligenceDimension =
  | "confidence"
  | "risk"
  | "readiness"
  | "evidence_strength"
  | "materiality"
  | "pipeline_quality"
  | "operational_urgency"
  | "decision_quality"
  | "stakeholder_alignment"
  | "review_depth"
  | "workflow_health"
  | "execution_confidence"
  | "financial_impact"
  | "strategic_fit"
  | "compliance"

export type IntelligenceLevel = "very-low" | "low" | "medium" | "high" | "very-high"

export interface IntelligenceSignal {
  id: string
  dimension: IntelligenceDimension
  level: IntelligenceLevel
  value: number
  confidence: number
  label: string
  description?: string
  entityId?: string
  entityType?: string
  module: string
  timestamp: Date
  source: "system" | "ai" | "human" | "derived"
  metadata?: Record<string, unknown>
}

export interface IntelligenceSummary {
  entityId: string
  entityType: string
  module: string
  overallScore: number
  overallConfidence: number
  signals: IntelligenceSignal[]
  risks: IntelligenceSignal[]
  recommendations: string[]
  lastUpdated: Date
}

export interface RiskAssessment {
  level: "low" | "medium" | "high" | "critical"
  score: number
  factors: RiskFactor[]
  mitigation?: string
}

export interface RiskFactor {
  name: string
  level: "low" | "medium" | "high" | "critical"
  weight: number
  description?: string
}

export interface ReadinessAssessment {
  state: "not-ready" | "needs-review" | "ready" | "approved" | "blocked"
  score: number
  blockers: string[]
  requirements: ReadinessRequirement[]
}

export interface ReadinessRequirement {
  name: string
  met: boolean
  description?: string
}

export interface EvidenceAssessment {
  strength: "none" | "weak" | "partial" | "strong" | "complete"
  score: number
  total: number
  collected: number
  missing: number
  items: EvidenceItem[]
}

export interface EvidenceItem {
  id: string
  name: string
  status: "missing" | "requested" | "collected" | "verified"
  weight: number
}

export interface WorkflowHealth {
  state: "healthy" | "warning" | "degraded" | "blocked"
  score: number
  stage: string
  progress: number
  bottlenecks: string[]
  estimatedCompletion?: Date
}

export function calculateOverallScore(signals: IntelligenceSignal[]): number {
  if (signals.length === 0) return 0
  const weighted = signals.reduce((sum, s) => sum + s.value * s.confidence, 0)
  const totalWeight = signals.reduce((sum, s) => sum + s.confidence, 0)
  return totalWeight > 0 ? Math.round((weighted / totalWeight) * 100) : 0
}

export function scoreToLevel(score: number): IntelligenceLevel {
  if (score >= 90) return "very-high"
  if (score >= 75) return "high"
  if (score >= 50) return "medium"
  if (score >= 25) return "low"
  return "very-low"
}

export function levelToScore(level: IntelligenceLevel): number {
  const map: Record<IntelligenceLevel, number> = {
    "very-low": 10,
    low: 30,
    medium: 55,
    high: 80,
    "very-high": 95,
  }
  return map[level]
}
