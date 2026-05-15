import { cn } from "@/lib/utils"
import { Sparkles, Check, AlertTriangle, Info } from "lucide-react"

interface AIIndicatorProps {
  type?: "insight" | "suggestion" | "verified" | "processing" | "confidence"
  label?: string
  confidence?: number
  className?: string
  size?: "sm" | "md"
}

const typeConfig: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  insight: { icon: Sparkles, color: "text-aqliya-cyan bg-aqliya-cyan/10 border-aqliya-cyan/20", label: "AI Insight" },
  suggestion: { icon: Sparkles, color: "text-aqliya-indigo bg-aqliya-indigo/10 border-aqliya-indigo/20", label: "AI Suggestion" },
  verified: { icon: Check, color: "text-status-success bg-status-success/10 border-status-success/20", label: "AI Verified" },
  processing: { icon: Sparkles, color: "text-aqliya-cyan bg-aqliya-cyan/10 border-aqliya-cyan/20", label: "Processing" },
  confidence: { icon: Info, color: "text-aqliya-blue bg-aqliya-blue/10 border-aqliya-blue/20", label: "AI Analysis" },
}

const sizeClasses = {
  sm: "text-[10px] px-1.5 py-0.5 gap-1 [&_svg]:size-2.5",
  md: "text-xs px-2.5 py-1 gap-1.5 [&_svg]:size-3",
}

export function AIIndicator({
  type = "insight",
  label,
  confidence,
  className,
  size = "md",
}: AIIndicatorProps) {
  const config = typeConfig[type]
  const Icon = config.icon
  const displayLabel = label ?? config.label

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-medium",
        config.color,
        sizeClasses[size],
        type === "processing" && "ai-thinking",
        className
      )}
    >
      <Icon className="shrink-0" />
      <span>{displayLabel}</span>
      {confidence !== undefined && (
        <span
          className={cn(
            "font-mono",
            confidence >= 0.9 && "text-status-success",
            confidence >= 0.7 && confidence < 0.9 && "text-status-warning",
            confidence < 0.7 && "text-status-error"
          )}
        >
          {Math.round(confidence * 100)}%
        </span>
      )}
    </span>
  )
}

interface AIInsightCardProps {
  title?: string
  children: React.ReactNode
  confidence?: number
  className?: string
}

export function AIInsightCard({ title, children, confidence, className }: AIInsightCardProps) {
  return (
    <div className={cn("rounded-lg border-l-[3px] border-l-aqliya-cyan bg-aqliya-cyan/5 p-4", className)}>
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="h-4 w-4 text-aqliya-cyan" />
        <span className="text-sm font-semibold text-aqliya-cyan">
          {title ?? "AI Insight"}
        </span>
        {confidence !== undefined && (
          <span
            className={cn(
              "text-xs font-mono",
              confidence >= 0.9 && "text-status-success",
              confidence >= 0.7 && confidence < 0.9 && "text-status-warning",
              confidence < 0.7 && "text-status-error"
            )}
          >
            {Math.round(confidence * 100)}% confidence
          </span>
        )}
      </div>
      <div className="text-sm text-foreground/80">
        {children}
      </div>
    </div>
  )
}

interface AITracingProps {
  steps: {
    label: string
    status: "complete" | "in-progress" | "pending"
  }[]
  className?: string
}

export function AITracing({ steps, className }: AITracingProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {steps.map((step, i) => (
        <div key={i} className="flex items-center gap-3">
          <div
            className={cn(
              "h-6 w-6 rounded-full flex items-center justify-center text-xs font-medium",
              step.status === "complete" && "bg-status-success/10 text-status-success",
              step.status === "in-progress" && "bg-aqliya-cyan/10 text-aqliya-cyan ai-thinking",
              step.status === "pending" && "bg-muted text-muted-foreground"
            )}
          >
            {step.status === "complete" ? (
              <Check className="h-3.5 w-3.5" />
            ) : step.status === "in-progress" ? (
              <Sparkles className="h-3.5 w-3.5" />
            ) : (
              i + 1
            )}
          </div>
          <span
            className={cn(
              "text-sm",
              step.status === "complete" && "text-foreground",
              step.status === "in-progress" && "text-aqliya-cyan font-medium",
              step.status === "pending" && "text-muted-foreground"
            )}
          >
            {step.label}
          </span>
        </div>
      ))}
    </div>
  )
}
