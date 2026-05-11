import Link from "next/link"

const steps = [
  "/auditos",
  "/auditos/trial-balance",
  "/auditos/mapping",
  "/auditos/statements",
  "/auditos/evidence",
  "/auditos/traceability",
]

export function StepNav({ current, label }: { current: string; label?: string }) {
  const idx = steps.indexOf(current)
  const prev = idx > 0 ? steps[idx - 1] : null
  const next = idx < steps.length - 1 ? steps[idx + 1] : null

  return (
    <div className="mt-12 flex items-center justify-between border-t pt-6">
      <div>
        {prev && (
          <Link
            href={prev}
            className="inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            ← المرحلة السابقة
          </Link>
        )}
      </div>
      <span className="text-xs text-muted-foreground">
        {label ?? `${idx + 1} / ${steps.length}`}
      </span>
      <div>
        {next && (
          <Link
            href={next}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            المرحلة التالية ←
          </Link>
        )}
      </div>
    </div>
  )
}
