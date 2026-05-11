import { cn } from "@/lib/utils"

interface ProofCardProps {
  title: string
  description: string
  icon?: React.ReactNode
  className?: string
}

export function ProofCard({ title, description, icon, className }: ProofCardProps) {
  return (
    <div className={cn("group relative rounded-xl border bg-background p-6 shadow-sm transition-all hover:border-primary/30 hover:shadow-md", className)}>
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg border bg-muted/50 text-primary">
        {icon || (
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
          </svg>
        )}
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
    </div>
  )
}
