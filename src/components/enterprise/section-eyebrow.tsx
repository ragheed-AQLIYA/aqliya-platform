import { cn } from "@/lib/utils"

interface SectionEyebrowProps {
  label: string
  title: string
  description?: string
  align?: "left" | "center" | "right"
  className?: string
}

export function SectionEyebrow({ label, title, description, align = "center", className }: SectionEyebrowProps) {
  return (
    <div className={cn("mx-auto max-w-3xl", align === "center" && "text-center", align === "right" && "text-right", className)}>
      <span className="inline-block rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold tracking-wider text-primary uppercase">
        {label}
      </span>
      <h2 className="mt-4 text-2xl font-black leading-tight tracking-tight sm:text-3xl lg:text-4xl">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-lg leading-8 text-muted-foreground">
          {description}
        </p>
      )}
    </div>
  )
}
