import { cn } from "@/lib/utils"
import { Check, Circle, Clock, AlertCircle } from "lucide-react"

interface WorkflowStep {
  id: string
  label: string
  labelAr?: string
  status: "complete" | "current" | "pending" | "blocked"
  description?: string
}

interface WorkflowProgressProps {
  steps: WorkflowStep[]
  className?: string
  orientation?: "horizontal" | "vertical"
  module?: "audit" | "sales" | "decision" | "platform"
}

const moduleColors: Record<string, { complete: string; current: string; line: string }> = {
  audit: { complete: "bg-module-audit", current: "ring-module-audit", line: "bg-module-audit/20" },
  sales: { complete: "bg-module-sales", current: "ring-module-sales", line: "bg-module-sales/20" },
  decision: { complete: "bg-module-decision", current: "ring-module-decision", line: "bg-module-decision/20" },
  platform: { complete: "bg-primary", current: "ring-primary", line: "bg-primary/20" },
}

const statusIcons: Record<string, React.ElementType> = {
  complete: Check,
  current: Clock,
  pending: Circle,
  blocked: AlertCircle,
}

export function WorkflowProgress({
  steps,
  className,
  orientation = "horizontal",
  module = "platform",
}: WorkflowProgressProps) {
  const colors = moduleColors[module]

  if (orientation === "vertical") {
    return (
      <div className={cn("space-y-0", className)}>
        {steps.map((step, i) => {
          const Icon = statusIcons[step.status]
          const isLast = i === steps.length - 1

          return (
            <div key={step.id} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-medium",
                    step.status === "complete" && cn(colors.complete, "border-transparent text-white"),
                    step.status === "current" && cn("border-current bg-background", colors.current),
                    step.status === "pending" && "border-border bg-muted text-muted-foreground",
                    step.status === "blocked" && "border-status-error bg-status-error/10 text-status-error"
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>
                {!isLast && (
                  <div
                    className={cn(
                      "h-full w-0.5 min-h-[2rem]",
                      step.status === "complete" ? colors.complete : colors.line
                    )}
                  />
                )}
              </div>
              <div className="pb-6 pt-1">
                <div className="text-sm font-medium text-foreground">{step.label}</div>
                {step.description && (
                  <div className="text-xs text-muted-foreground mt-0.5">{step.description}</div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className={cn("flex items-center", className)}>
      {steps.map((step, i) => {
        const Icon = statusIcons[step.status]
        const isLast = i === steps.length - 1

        return (
          <div key={step.id} className="flex items-center flex-1">
            <div className="flex flex-col items-center gap-2">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-medium",
                  step.status === "complete" && cn(colors.complete, "border-transparent text-white"),
                  step.status === "current" && cn("border-current bg-background", colors.current),
                  step.status === "pending" && "border-border bg-muted text-muted-foreground",
                  step.status === "blocked" && "border-status-error bg-status-error/10 text-status-error"
                )}
              >
                <Icon className="h-4 w-4" />
              </div>
              <span
                className={cn(
                  "text-xs font-medium whitespace-nowrap",
                  step.status === "complete" && "text-foreground",
                  step.status === "current" && "text-foreground font-semibold",
                  step.status === "pending" && "text-muted-foreground",
                  step.status === "blocked" && "text-status-error"
                )}
              >
                {step.label}
              </span>
            </div>
            {!isLast && (
              <div
                className={cn(
                  "flex-1 h-0.5 mx-2",
                  step.status === "complete" ? colors.complete : colors.line
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
