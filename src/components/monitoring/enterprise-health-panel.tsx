import { getEnterpriseHealthSnapshot } from "@/lib/platform/enterprise-health";
import { EnterpriseHealthOperatorActions } from "@/components/monitoring/enterprise-health-operator-actions";

export async function EnterpriseHealthPanel() {
  const snapshot = await getEnterpriseHealthSnapshot();

  return (
    <section className="space-y-4 rounded-xl border bg-card p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">جاهزية المؤسسة (Tier 3)</h2>
          <p className="text-sm text-muted-foreground">
            Rate limiter · Outbox · ABAC · تنبيهات التشغيل
          </p>
        </div>
        <EnterpriseHealthOperatorActions />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Metric label="Rate Limiter" value={snapshot.rateLimiter.mode} />
        <Metric label="Outbox failed" value={snapshot.outbox.failed} />
        <Metric label="Outbox pending" value={snapshot.outbox.pending} />
        <Metric
          label="ABAC enforce orgs"
          value={snapshot.intelligenceCore.abacEnforceOrgCount}
        />
      </div>

      <ul className="space-y-2">
        {snapshot.alerts.map((alert) => (
          <li
            key={alert.code}
            className={`rounded-lg border px-3 py-2 text-sm ${
              alert.severity === "critical"
                ? "border-red-300 bg-red-50 text-red-900"
                : alert.severity === "warning"
                  ? "border-amber-300 bg-amber-50 text-amber-900"
                  : "border-muted bg-muted/30 text-muted-foreground"
            }`}
          >
            <span className="font-mono text-xs">{alert.code}</span>
            <p className="mt-1">{alert.message}</p>
          </li>
        ))}
      </ul>

      {snapshot.outbox.recentFailed.length > 0 ? (
        <div>
          <h3 className="mb-2 text-sm font-medium">Outbox — آخر failed</h3>
          <ul className="max-h-40 space-y-1 overflow-y-auto text-xs">
            {snapshot.outbox.recentFailed.map((row) => (
              <li key={row.id} className="rounded border px-2 py-1 font-mono">
                {row.eventType} · {row.lastError ?? "unknown"} · attempts=
                {row.attempts}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border px-3 py-2 text-center">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-xl font-bold">{value}</p>
    </div>
  );
}
