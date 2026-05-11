import { cn } from "@/lib/utils"

interface ExecutiveSurfaceProps {
  title?: string
  children: React.ReactNode
  className?: string
}

export function ExecutiveSurface({ title, children, className }: ExecutiveSurfaceProps) {
  return (
    <div className={cn("rounded-xl border bg-gradient-to-b from-background to-muted/20 p-6 shadow-sm sm:p-8", className)}>
      {title && (
        <h3 className="mb-6 text-xl font-semibold">{title}</h3>
      )}
      {children}
    </div>
  )
}
