import { cn } from "@/lib/utils"
import { FileText, FolderOpen, AlertCircle } from "lucide-react"

interface EmptyStateProps {
  icon?: React.ElementType
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
  variant?: "default" | "compact" | "large"
}

const iconDefaults: Record<string, React.ElementType> = {
  default: FileText,
  compact: FileText,
  large: FolderOpen,
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  variant = "default",
}: EmptyStateProps) {
  const DefaultIcon = iconDefaults[variant] ?? FileText
  const DisplayIcon = Icon ?? DefaultIcon

  const sizeClasses = {
    compact: "p-6",
    default: "p-12",
    large: "p-16",
  }

  const iconSizes = {
    compact: "h-8 w-8",
    default: "h-12 w-12",
    large: "h-16 w-16",
  }

  const titleSizes = {
    compact: "text-sm",
    default: "text-base",
    large: "text-lg",
  }

  return (
    <div className={cn("flex flex-col items-center justify-center text-center", sizeClasses[variant], className)}>
      <DisplayIcon className={cn("text-muted-foreground/40 mb-4", iconSizes[variant])} />
      <h3 className={cn("font-semibold text-foreground", titleSizes[variant])}>{title}</h3>
      {description && (
        <p className="mt-1 text-sm text-muted-foreground max-w-sm">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

interface LoadingStateProps {
  label?: string
  className?: string
  variant?: "spinner" | "skeleton" | "dots"
}

export function LoadingState({ label = "Loading...", className, variant = "spinner" }: LoadingStateProps) {
  if (variant === "skeleton") {
    return (
      <div className={cn("space-y-3", className)}>
        <div className="h-4 w-3/4 rounded bg-muted animate-pulse" />
        <div className="h-4 w-1/2 rounded bg-muted animate-pulse" />
        <div className="h-4 w-2/3 rounded bg-muted animate-pulse" />
      </div>
    )
  }

  if (variant === "dots") {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <div className="flex gap-1">
          <div className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
          <div className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
          <div className="h-2 w-2 rounded-full bg-primary animate-bounce" />
        </div>
        {label && <span className="text-sm text-muted-foreground">{label}</span>}
      </div>
    )
  }

  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      <div className="h-8 w-8 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
      {label && <span className="text-sm text-muted-foreground">{label}</span>}
    </div>
  )
}
