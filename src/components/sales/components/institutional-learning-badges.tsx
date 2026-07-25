"use client";

export function RecommendationBadge({ label }: { label: string }) {
  return (
    <span className="rounded border border-amber-300 bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-900 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-200">
      {label}
    </span>
  );
}

export function ConfidenceBadge({ value }: { value: number }) {
  return (
    <span className="rounded border border-border px-2 py-0.5 text-[10px] text-muted-foreground">
      ثقة {Math.round(value * 100)}%
    </span>
  );
}
