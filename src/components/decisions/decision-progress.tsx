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
  intake: "الاستلام",
  framework: "الإطار",
  scenarios: "السيناريوهات",
  risks: "المخاطر",
  simulation: "المحاكاة",
  recommendation: "التوصية",
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
    <Card className={`p-4 ${className || ""}`} role="region" aria-label="تقدم مسار العمل">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold">مسار العمل للقرار</h3>
        <Badge
          variant={completeCount === totalCount ? "default" : "secondary"}
          aria-label={`${completeCount} من ${totalCount} مراحل مكتملة`}
        >
          {completeCount}/{totalCount} مكتمل
        </Badge>
      </div>

      <div
        role="progressbar"
        aria-valuenow={completeCount}
        aria-valuemin={0}
        aria-valuemax={totalCount}
        aria-label={`تقدم العمل: ${completeCount} من ${totalCount} مراحل مكتملة`}
        className="flex items-center gap-1 mb-3 overflow-x-auto"
      >
        {stages.map((stage, index) => (
          <div key={stage.stage} className="flex items-center">
            <Badge
              variant={getStageVariant(stage)}
              className="text-xs whitespace-nowrap"
              aria-label={`${STAGE_LABELS[stage.stage]}: ${stage.complete ? "مكتمل" : stage.blocked ? "محظور" : stage.current ? "المرحلة الحالية" : "لم يبدأ"}`}
            >
              {stage.complete ? "✓" : stage.blocked ? "!" : stage.current ? "→" : "○"} {STAGE_LABELS[stage.stage]}
            </Badge>
            {index < stages.length - 1 && (
              <div className={`w-3 h-px mx-1 ${stage.complete ? "bg-primary" : "bg-muted"}`} aria-hidden="true" />
            )}
          </div>
        ))}
      </div>

      {currentStage && (
        <p className="text-xs text-muted-foreground">
          الحالي: <span className="font-medium">{STAGE_LABELS[currentStage.stage]}</span>
        </p>
      )}

      {blockedStage && (
        <p className="text-xs text-destructive mt-1">
          محظور: يجب إكمال <span className="font-medium">{STAGE_LABELS[blockedStage.stage]}</span> أولًا
        </p>
      )}

      {missingInputs && missingInputs.length > 0 && (
        <div className="mt-3 pt-3 border-t">
          <p className="text-xs font-medium mb-1">المفقود للمحاكاة:</p>
          <ul className="text-xs text-muted-foreground space-y-0.5">
            {missingInputs.slice(0, 4).map((m) => (
              <li key={m}>- {m}</li>
            ))}
            {missingInputs.length > 4 && (
              <li className="text-muted-foreground">+{missingInputs.length - 4} أخرى</li>
            )}
          </ul>
        </div>
      )}

      {dataQuality !== undefined && (
        <div className="mt-2 pt-2 border-t flex items-center justify-between">
          <span className="text-xs text-muted-foreground">جودة البيانات</span>
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
    { stage: "intake", label: "الاستلام", complete: data.intakeAccepted, current: currentStage === "intake", blocked: false },
    { stage: "framework", label: "الإطار", complete: data.frameworkComplete, current: currentStage === "framework", blocked: !data.intakeAccepted && currentStage !== "intake" },
    { stage: "scenarios", label: "السيناريوهات", complete: data.scenariosComplete, current: currentStage === "scenarios", blocked: !data.frameworkComplete && currentStage !== "intake" && currentStage !== "framework" },
    { stage: "risks", label: "المخاطر", complete: data.risksComplete, current: currentStage === "risks", blocked: !data.scenariosComplete && currentStage !== "intake" && currentStage !== "framework" && currentStage !== "scenarios" },
    { stage: "simulation", label: "المحاكاة", complete: data.simulationReady, current: currentStage === "simulation", blocked: !data.risksComplete && currentStage !== "intake" && currentStage !== "framework" && currentStage !== "scenarios" && currentStage !== "risks" },
    { stage: "recommendation", label: "التوصية", complete: data.recommendationReady, current: currentStage === "recommendation", blocked: !data.simulationReady && currentStage !== "intake" && currentStage !== "framework" && currentStage !== "scenarios" && currentStage !== "risks" && currentStage !== "simulation" },
  ]
}
