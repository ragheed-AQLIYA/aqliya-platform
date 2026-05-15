import { cn } from "@/lib/utils";

interface BeforeAfterBlockProps {
  before: string[];
  after: string[];
  className?: string;
}

export function BeforeAfterBlock({
  before,
  after,
  className,
}: BeforeAfterBlockProps) {
  return (
    <div className={cn("grid gap-6 sm:grid-cols-2", className)}>
      <div className="rounded-[24px] border border-destructive/20 bg-gradient-to-br from-destructive/[0.06] to-background p-5 shadow-sm sm:p-6">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-destructive">
          قبل
        </h3>
        <ul className="space-y-3">
          {before.map((item, i) => (
            <li
              key={i}
              className="flex items-start gap-2 text-sm leading-6 text-muted-foreground"
            >
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-destructive/50" />
              {item}
            </li>
          ))}
        </ul>
      </div>
      <div className="rounded-[24px] border border-primary/20 bg-gradient-to-br from-primary/[0.06] to-background p-5 shadow-sm sm:p-6">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-primary">
          بعد
        </h3>
        <ul className="space-y-3">
          {after.map((item, i) => (
            <li
              key={i}
              className="flex items-start gap-2 text-sm leading-6 text-foreground"
            >
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
