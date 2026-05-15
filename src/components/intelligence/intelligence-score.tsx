import { cn } from "@/lib/utils"

interface IntelligenceScoreProps {
  score: number
  maxScore?: number
  label?: string
  size?: "sm" | "md" | "lg"
  showLabel?: boolean
  className?: string
}

function getScoreColor(score: number, maxScore: number): string {
  const percentage = (score / maxScore) * 100
  if (percentage >= 80) return "text-status-success"
  if (percentage >= 60) return "text-status-warning"
  return "text-status-error"
}

function getScoreBg(score: number, maxScore: number): string {
  const percentage = (score / maxScore) * 100
  if (percentage >= 80) return "bg-status-success"
  if (percentage >= 60) return "bg-status-warning"
  return "bg-status-error"
}

export function IntelligenceScore({
  score,
  maxScore = 100,
  label,
  size = "md",
  showLabel = true,
  className,
}: IntelligenceScoreProps) {
  const percentage = Math.round((score / maxScore) * 100)
  const color = getScoreColor(score, maxScore)
  const bgColor = getScoreBg(score, maxScore)

  const sizeClasses = {
    sm: "h-1.5",
    md: "h-2",
    lg: "h-2.5",
  }

  const textClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  }

  return (
    <div className={cn("space-y-1.5", className)}>
      {showLabel && label && (
        <div className="flex items-center justify-between">
          <span className={cn("font-medium text-foreground", textClasses[size])}>{label}</span>
          <span className={cn("font-semibold tabular-nums", color)}>
            {percentage}%
          </span>
        </div>
      )}
      <div className={cn("w-full rounded-full bg-muted overflow-hidden", sizeClasses[size])}>
        <div
          className={cn("h-full rounded-full transition-all duration-500", bgColor)}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

interface IntelligenceScoreCompactProps {
  score: number
  maxScore?: number
  size?: "sm" | "md"
  className?: string
}

export function IntelligenceScoreCompact({
  score,
  maxScore = 100,
  size = "md",
  className,
}: IntelligenceScoreCompactProps) {
  const percentage = Math.round((score / maxScore) * 100)
  const color = getScoreColor(score, maxScore)

  const sizeClasses = {
    sm: "h-5 w-5 text-[10px]",
    md: "h-7 w-7 text-xs",
  }

  return (
    <div
      className={cn(
        "inline-flex items-center justify-center rounded-full font-bold tabular-nums",
        sizeClasses[size],
        color,
        className
      )}
      style={{
        background: `conic-gradient(currentColor ${percentage * 3.6}deg, transparent 0deg)`,
        WebkitMask: "radial-gradient(farthest-side, transparent calc(100% - 3px), #fff calc(100% - 2px))",
        mask: "radial-gradient(farthest-side, transparent calc(100% - 3px), #fff calc(100% - 2px))",
      }}
    >
      <span className="bg-background rounded-full flex items-center justify-center w-full h-full">
        {percentage}
      </span>
    </div>
  )
}
