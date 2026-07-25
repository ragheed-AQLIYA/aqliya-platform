import type { MonthlyTrend } from "@/actions/decisions-monthly-trends";

function formatMonth(month: string) {
  const [y, m] = month.split("-");
  const date = new Date(Number(y), Number(m) - 1);
  return date.toLocaleDateString("ar-SA", { month: "short", year: "numeric" });
}

function maxCount(trends: MonthlyTrend[]) {
  return Math.max(...trends.map((t) => Math.max(t.created, t.approved, t.rejected)), 1);
}

function Bar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = (value / max) * 100;
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-[10px] tabular-nums text-muted-foreground">{value}</span>
      <div className="h-16 w-5 rounded-sm bg-muted relative overflow-hidden">
        <div
          className={`absolute bottom-0 w-full rounded-sm transition-all ${color}`}
          style={{ height: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function MonthlyTrendsChart({ trends }: { trends: MonthlyTrend[] }) {
  const max = maxCount(trends);

  return (
    <div className="rounded-lg border p-4">
      <h3 className="text-sm font-semibold mb-4">الاتجاهات الشهرية</h3>
      <div className="flex items-end gap-4 justify-between">
        {trends.map((t) => (
          <div key={t.month} className="flex items-end gap-2">
            <Bar value={t.created} max={max} color="bg-primary" />
            <Bar value={t.approved} max={max} color="bg-emerald-500" />
            <Bar value={t.rejected} max={max} color="bg-red-400" />
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-2">
        {trends.map((t) => (
          <span key={t.month} className="text-[10px] text-muted-foreground">
            {formatMonth(t.month)}
          </span>
        ))}
      </div>
      <div className="flex items-center gap-4 mt-3 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded bg-primary" /> منشأة</span>
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded bg-emerald-500" /> معتمدة</span>
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded bg-red-400" /> مرفوضة</span>
      </div>
    </div>
  );
}
