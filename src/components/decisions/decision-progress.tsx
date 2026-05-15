"use client"

import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"

export type WorkflowStage = "intake" | "framework" | "scenarios" | "risks" | "simulation" | "recommendation"

interface StageStatus {
  stage: WorkflowStage
  label: string
  complete: boolean
  current: boolean
  blocked: boolean
}

interface DecisionProgressProps {
  stages: StageStatus[]
  decisionType?: string
  missingInputs?: string[]
  dataQuality?: number
  className?: string
}

const STAGE_ORDER: WorkflowStage[] = ["intake", "framework", "scenarios", "risks", "simulation", "recommendation"]

const STAGE_LABELS: Record<WorkflowStage, string> = {
  intake: "Intake",
  framework: "Framework",
  scenarios: "Scenarios",
  risks: "Risks",
  simulation: "Simulation",
  recommendation: "Recommendation",
}

function getStageVariant(stage: StageStatus): "default" | "secondary" | "destructive" | "outline" {
  if (stage.current) return "default"
  if (stage.complete) return "default"
  if (stage.blocked) return "destructive"
  return "secondary"
}

export function DecisionProgress({ stages, decisionType, missingInputs, dataQuality, className }: DecisionProgressProps) {
  const completeCount = stages.filter((s) => s.complete).length
  const totalCount = stages.length
  const currentStage = stages.find((s) => s.current)
  const blockedStage = stages.find((s) => s.blocked && !s.current)

  return (
    <Card className={`p-4 ${className || ""}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold">Decision Workflow</h3>
        <Badge variant={completeCount === totalCount ? "default" : "secondary"}>
          {completeCount}/{totalCount} complete
        </Badge>
      </div>

      <div className="flex items-center gap-1 mb-3 overflow-x-auto">
        {stages.map((stage, index) => (
          <div key={stage.stage} className="flex items-center">
            <Badge
              variant={getStageVariant(stage)}
              className="text-xs whitespace-nowrap"
            >
              {stage.complete ? "✓" : stage.blocked ? "!" : stage.current ? "→" : "○"} {STAGE_LABELS[stage.stage]}
            </Badge>
            {index < stages.length - 1 && (
              <div className={`w-3 h-px mx-1 ${stage.complete ? "bg-primary" : "bg-muted"}`} />
            )}
          </div>
        ))}
      </div>

      {currentStage && (
        <p className="text-xs text-muted-foreground">
          Current: <span className="font-medium">{STAGE_LABELS[currentStage.stage]}</span>
        </p>
      )}

      {blockedStage && (
        <p className="text-xs text-destructive mt-1">
          Blocked: <span className="font-medium">{STAGE_LABELS[blockedStage.stage]}</span> must be completed first
        </p>
      )}

      {missingInputs && missingInputs.length > 0 && (
        <div className="mt-3 pt-3 border-t">
          <p className="text-xs font-medium mb-1">Missing for simulation:</p>
          <ul className="text-xs text-muted-foreground space-y-0.5">
            {missingInputs.slice(0, 4).map((m) => (
              <li key={m}>- {m}</li>
            ))}
            {missingInputs.length > 4 && (
              <li className="text-muted-foreground">+{missingInputs.length - 4} more</li>
            )}
          </ul>
        </div>
      )}

      {dataQuality !== undefined && (
        <div className="mt-2 pt-2 border-t flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Data quality</span>
          <Badge variant={dataQuality >= 70 ? "default" : dataQuality >= 40 ? "secondary" : "destructive"} className="text-xs">
            {dataQuality}%
          </Badge>
        </div>
      )}
    </Card>
  )
}

export function buildStageStatus(
  currentStage: WorkflowStage,
  data: {
    intakeAccepted: boolean
    frameworkComplete: boolean
    scenariosComplete: boolean
    risksComplete: boolean
    simulationReady: boolean
    recommendationReady: boolean
  }
): StageStatus[] {
  return [
    { stage: "intake", label: "Intake", complete: data.intakeAccepted, current: currentStage === "intake", blocked: false },
    { stage: "framework", label: "Framework", complete: data.frameworkComplete, current: currentStage === "framework", blocked: !data.intakeAccepted && currentStage !== "intake" },
    { stage: "scenarios", label: "Scenarios", complete: data.scenariosComplete, current: currentStage === "scenarios", blocked: !data.frameworkComplete && currentStage !== "intake" && currentStage !== "framework" },
    { stage: "risks", label: "Risks", complete: data.risksComplete, current: currentStage === "risks", blocked: !data.scenariosComplete && currentStage !== "intake" && currentStage !== "framework" && currentStage !== "scenarios" },
    { stage: "simulation", label: "Simulation", complete: data.simulationReady, current: currentStage === "simulation", blocked: !data.risksComplete && currentStage !== "intake" && currentStage !== "framework" && currentStage !== "scenarios" && currentStage !== "risks" },
    { stage: "recommendation", label: "Recommendation", complete: data.recommendationReady, current: currentStage === "recommendation", blocked: !data.simulationReady && currentStage !== "intake" && currentStage !== "framework" && currentStage !== "scenarios" && currentStage !== "risks" && currentStage !== "simulation" },
  ]
}
