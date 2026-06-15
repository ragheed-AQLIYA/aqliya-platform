import { getAIObservability } from "@/lib/ai/observability";

async function AiObservabilityCards() {
  const data = await getAIObservability(7);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">مراقبة الذكاء الاصطناعي</h2>
        <p className="text-sm text-muted-foreground">
          آخر 7 أيام — طلبات، تكلفة، ومراجعة بشرية
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          {
            label: "طلبات AI",
            value: data.summary.totalRequests,
            color: "text-purple-600",
          },
          {
            label: "التكلفة (USD)",
            value: data.summary.totalCost.toFixed(2),
            color: "text-module-decision",
          },
          {
            label: "نسبة المراجعة",
            value: `${Math.round(data.summary.reviewRate * 100)}%`,
            color: "text-status-warning",
          },
          {
            label: "متوسط الثقة",
            value: `${Math.round(data.summary.averageConfidence * 100)}%`,
            color: "text-status-success",
          },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            className="rounded-xl border bg-card p-4 text-center shadow-sm"
          >
            <p className={`text-2xl font-black ${color}`}>{value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>
      {Object.keys(data.byProvider).length > 0 && (
        <div className="rounded-xl border bg-card p-4">
          <p className="mb-2 text-sm font-medium">حسب الموفر</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(data.byProvider).map(([provider, stats]) => (
              <span
                key={provider}
                className="rounded-full border px-3 py-1 text-xs"
              >
                {provider}: {stats.requests} طلب
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export { AiObservabilityCards };
