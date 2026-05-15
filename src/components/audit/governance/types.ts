export type EvidenceStatus = "complete" | "partial" | "missing" | "conflicting" | "weak" | "unverifiable"
export type EscalationLevel = "none" | "notice" | "review_required" | "senior_review_required" | "blocked"

export interface EvidenceStatusBadgeProps {
  status: EvidenceStatus
  label?: string
  className?: string
}

export interface EscalationBadgeProps {
  level: EscalationLevel
  reason?: string
  className?: string
}
