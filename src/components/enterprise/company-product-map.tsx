import { cn } from "@/lib/utils"

interface CompanyProductMapProps {
  className?: string
}

export function CompanyProductMap({ className }: CompanyProductMapProps) {
  const products = [
    "Custom Enterprise Systems",
    "Decision Systems",
    "Simulation Systems",
    "Sales Systems",
    "AQLIYA AuditOS",
    "Local Content Systems",
  ]

  return (
    <div className={cn("mx-auto max-w-2xl rounded-xl border bg-background p-6 shadow-sm", className)}>
      <div className="flex items-center gap-3 border-b pb-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground">A</div>
        <span className="text-lg font-bold tracking-tight">AQLIYA — الشركة الأم</span>
      </div>
      <div className="mt-4 space-y-2 pr-4 rtl:pr-0 rtl:pl-4">
        {products.map((product, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="h-px w-4 bg-border" />
            <span className="rounded-md border bg-muted/30 px-3 py-1.5 text-sm font-medium">
              {product}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
