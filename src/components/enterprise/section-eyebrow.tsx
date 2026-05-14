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
      <span className="inline-block rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[11px] font-semibold tracking-wider text-primary uppercase">
        {label}
      </span>
      <h2 className="mt-4 text-2xl font-black leading-tight tracking-tight sm:text-3xl lg:text-4xl">
        {title}
      </h2>
      {description && (
        <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
          {description}
        </p>
      )}
    </div>
  )
}
