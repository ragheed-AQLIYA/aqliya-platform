import type { ReactNode } from "react";

interface ReportCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  trend?: { direction: "up" | "down"; pct: number };
}

export function ReportCard({ label, value, subtitle, icon, trend }: ReportCardProps) {
  return (
    <div className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
          {subtitle ? (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>
        {icon ? (
          <div className="rounded-md bg-primary/10 p-2 text-primary">{icon}</div>
        ) : null}
      </div>
      {trend ? (
        <div className="mt-2 flex items-center gap-1 text-xs">
          <span
            className={
              trend.direction === "up"
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400"
            }
          >
            {trend.direction === "up" ? "↑" : "↓"} {trend.pct}%
          </span>
          <span className="text-muted-foreground">عن الفترة السابقة</span>
        </div>
      ) : null}
    </div>
  );
}
