import { cn } from "@/lib/utils"
import { IntelligenceScore } from "@/components/intelligence/intelligence-score"
import { RiskIndicator, type RiskLevel } from "@/components/intelligence/risk-indicator"
import { ConfidenceIndicator, type ConfidenceLevel } from "@/components/intelligence/confidence-indicator"
import { ReadinessState, type ReadinessState as ReadinessStateType } from "@/components/intelligence/readiness-state"
import { EvidenceStrength, type EvidenceStrength as EvidenceStrengthType } from "@/components/intelligence/evidence-strength"
import { PrioritySignal, type PriorityLevel } from "@/components/intelligence/priority-signal"

interface EntityIntelligenceSignal {
  type: "score" | "risk" | "confidence" | "readiness" | "priority" | "evidence"
  label: string
  value: number | RiskLevel | ConfidenceLevel | ReadinessStateType | PriorityLevel | EvidenceStrengthType
  confidence?: number
}

interface EntityIntelligencePanelProps {
  signals: EntityIntelligenceSignal[]
  className?: string
  module?: "audit" | "sales" | "decision" | "platform"
  title?: string
}

const moduleBorderClasses: Record<string, string> = {
  audit: "border-l-module-audit",
  sales: "border-l-module-sales",
  decision: "border-l-module-decision",
  platform: "",
}

function renderSignal(signal: EntityIntelligenceSignal) {
  switch (signal.type) {
    case "score":
      return (
        <IntelligenceScore
          score={signal.value as number}
          label={signal.label}
          size="sm"
        />
      )
    case "risk":
      return (
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">{signal.label}</span>
          <RiskIndicator level={signal.value as RiskLevel} size="sm" />
        </div>
      )
    case "confidence":
      return (
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">{signal.label}</span>
          <ConfidenceIndicator
            level={signal.value as ConfidenceLevel}
            value={signal.confidence}
            size="sm"
            showValue={false}
          />
        </div>
      )
    case "readiness":
      return (
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">{signal.label}</span>
          <ReadinessState state={signal.value as ReadinessStateType} size="sm" />
        </div>
      )
    case "priority":
      return (
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">{signal.label}</span>
          <PrioritySignal level={signal.value as PriorityLevel} size="sm" />
        </div>
      )
    case "evidence":
      return (
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">{signal.label}</span>
          <EvidenceStrength strength={signal.value as EvidenceStrengthType} size="sm" />
        </div>
      )
    default:
      return null
  }
}

export function EntityIntelligencePanel({
  signals,
  className,
  module = "platform",
  title = "Intelligence",
}: EntityIntelligencePanelProps) {
  if (signals.length === 0) return null

  return (
    <div
      className={cn(
        "rounded-lg border border-l-4 bg-card p-4",
        moduleBorderClasses[module],
        className
      )}
    >
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
        {title}
      </h3>
      <div className="space-y-3">
        {signals.map((signal, i) => (
          <div key={i}>{renderSignal(signal)}</div>
        ))}
      </div>
    </div>
  )
}
