import { cn } from "@/lib/utils"

interface EnterpriseCardProps {
  children: React.ReactNode
  className?: string
  variant?: "default" | "elevated" | "flat" | "interactive"
  module?: "audit" | "sales" | "decision" | "platform"
  hover?: boolean
  onClick?: () => void
}

const variantClasses: Record<string, string> = {
  default: "border bg-card",
  elevated: "border shadow-md bg-card",
  flat: "bg-muted/50",
  interactive: "border bg-card cursor-pointer transition-all hover:shadow-md hover:border-primary/30",
}

const moduleBorderClasses: Record<string, string> = {
  audit: "border-l-2 border-l-module-audit",
  sales: "border-l-2 border-l-module-sales",
  decision: "border-l-2 border-l-module-decision",
  platform: "",
}

export function EnterpriseCard({
  children,
  className,
  variant = "default",
  module,
  hover = false,
  onClick,
}: EnterpriseCardProps) {
  return (
    <div
      className={cn(
        "rounded-lg overflow-hidden",
        variantClasses[variant],
        module && moduleBorderClasses[module],
        hover && "transition-all hover:shadow-md",
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

interface EnterpriseCardHeaderProps {
  children: React.ReactNode
  className?: string
  border?: boolean
}

export function EnterpriseCardHeader({ children, className, border = true }: EnterpriseCardHeaderProps) {
  return (
    <div
      className={cn(
        "px-5 py-4",
        border && "border-b",
        className
      )}
    >
      {children}
    </div>
  )
}

interface EnterpriseCardTitleProps {
  children: React.ReactNode
  className?: string
}

export function EnterpriseCardTitle({ children, className }: EnterpriseCardTitleProps) {
  return (
    <h3 className={cn("text-sm font-semibold text-foreground", className)}>
      {children}
    </h3>
  )
}

interface EnterpriseCardDescriptionProps {
  children: React.ReactNode
  className?: string
}

export function EnterpriseCardDescription({ children, className }: EnterpriseCardDescriptionProps) {
  return (
    <p className={cn("text-xs text-muted-foreground mt-0.5", className)}>
      {children}
    </p>
  )
}

interface EnterpriseCardContentProps {
  children: React.ReactNode
  className?: string
}

export function EnterpriseCardContent({ children, className }: EnterpriseCardContentProps) {
  return (
    <div className={cn("px-5 py-4", className)}>
      {children}
    </div>
  )
}

interface EnterpriseCardFooterProps {
  children: React.ReactNode
  className?: string
  border?: boolean
}

export function EnterpriseCardFooter({ children, className, border = true }: EnterpriseCardFooterProps) {
  return (
    <div
      className={cn(
        "px-5 py-3 bg-muted/50",
        border && "border-t",
        className
      )}
    >
      {children}
    </div>
  )
}
