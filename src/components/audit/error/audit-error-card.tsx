import { cn } from "@/lib/utils"
import { AlertTriangle, RefreshCw, ArrowLeft } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface AuditErrorCardProps {
  title?: string
  message: string
  onRetry?: () => void
  onBack?: () => void
  className?: string
  variant?: 'page' | 'inline' | 'card'
}

export function AuditErrorCard({
  title = 'Something went wrong',
  message,
  onRetry,
  onBack,
  className,
  variant = 'page',
}: AuditErrorCardProps) {
  const content = (
    <div className="flex flex-col items-center justify-center text-center space-y-4">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/30">
        <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
      </div>
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        <p className="text-sm text-muted-foreground max-w-md">{message}</p>
      </div>
      <div className="flex gap-2">
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry}>
            <RefreshCw className="size-4 mr-1" />Retry
          </Button>
        )}
        {onBack && (
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="size-4 mr-1" />Go Back
          </Button>
        )}
      </div>
    </div>
  )

  if (variant === 'inline') {
    return (
      <div className={cn("rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400", className)}>
        <p>{message}</p>
      </div>
    )
  }

  if (variant === 'card') {
    return (
      <Card className={cn("border-dashed border-red-200 dark:border-red-900/50", className)}>
        <CardContent className="p-6">{content}</CardContent>
      </Card>
    )
  }

  return (
    <div className={cn("flex min-h-[300px] items-center justify-center p-8", className)}>
      {content}
    </div>
  )
}

interface AuditEmptyStateProps {
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export function AuditEmptyState({ title, description, action, className }: AuditEmptyStateProps) {
  return (
    <Card className={cn("border-dashed", className)}>
      <CardContent className="p-8 flex flex-col items-center justify-center text-center space-y-3">
        <h3 className="font-semibold text-foreground">{title}</h3>
        {description && <p className="text-sm text-muted-foreground max-w-sm">{description}</p>}
        {action && <div className="pt-2">{action}</div>}
      </CardContent>
    </Card>
  )
}
