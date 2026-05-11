import Link from "next/link"
import { cn } from "@/lib/utils"

interface EnterpriseCTAProps {
  title: string
  description?: string
  primaryLabel: string
  primaryHref: string
  secondaryLabel?: string
  secondaryHref?: string
  align?: "left" | "center" | "right"
  className?: string
}

export function EnterpriseCTA({ title, description, primaryLabel, primaryHref, secondaryLabel, secondaryHref, align = "center", className }: EnterpriseCTAProps) {
  return (
    <div className={cn("mx-auto max-w-3xl rounded-2xl border bg-gradient-to-b from-background to-muted/30 p-8 shadow-lg sm:p-12", align === "center" && "text-center", align === "right" && "text-right", className)}>
      <h2 className="text-2xl font-black leading-tight tracking-tight sm:text-3xl">{title}</h2>
      {description && (
        <p className="mt-4 text-lg leading-8 text-muted-foreground">{description}</p>
      )}
      <div className={cn("mt-8 flex flex-wrap gap-4", align === "center" && "justify-center", align === "right" && "justify-start")}>
        <Link href={primaryHref} className="inline-flex h-12 items-center justify-center rounded-md bg-primary px-8 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90">
          {primaryLabel}
        </Link>
        {secondaryLabel && secondaryHref && (
          <Link href={secondaryHref} className="inline-flex h-12 items-center justify-center rounded-md border bg-background px-8 text-base font-medium text-foreground transition-colors hover:bg-muted">
            {secondaryLabel}
          </Link>
        )}
      </div>
    </div>
  )
}
