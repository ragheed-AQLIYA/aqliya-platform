"use client";

export function StepBar({ label, avg, max }: { label: string; avg: number | null; max: number | null }) {
  const pct = max && avg ? Math.min((avg / max) * 100, 100) : 0;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span>{label}</span>
        <span className="text-muted-foreground">
          {avg !== null ? `${avg} س` : "N/A"}
        </span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
