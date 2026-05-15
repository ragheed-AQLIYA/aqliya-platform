import { cn } from "@/lib/utils";

interface TraceabilityChainProps {
  steps: string[];
  className?: string;
}

export function TraceabilityChain({
  steps,
  className,
}: TraceabilityChainProps) {
  return (
    <div
      className={cn("space-y-3", className)}
      role="list"
      aria-label="سلسلة التتبع"
    >
      {steps.map((step, i) => (
        <div key={i} className="flex items-center gap-4" role="listitem">
          <div className="flex flex-col items-center">
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-primary/20 bg-primary text-xs font-bold text-primary-foreground shadow-sm">
              {i + 1}
            </div>
            {i < steps.length - 1 && <div className="h-6 w-px bg-border" />}
          </div>
          <div className="flex-1 rounded-2xl border border-border/70 bg-gradient-to-br from-background to-muted/30 px-4 py-3 text-sm font-medium shadow-sm">
            {step}
          </div>
        </div>
      ))}
    </div>
  );
}
