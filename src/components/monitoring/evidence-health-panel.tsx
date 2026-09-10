import { getEvidenceHealthSnapshot } from "@/lib/core/evidence/health";
import { getCurrentUser } from "@/lib/auth";
import { isPlatformAdmin } from "@/lib/authorization/platform-admin";

export async function EvidenceHealthPanel() {
  const user = await getCurrentUser();
  if (!isPlatformAdmin(user)) return null;
  const snapshot = await getEvidenceHealthSnapshot();

  return (
    <section className="space-y-4 rounded-xl border bg-card p-5 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold">منصة الأدلة — Core Evidence</h2>
        <p className="text-sm text-muted-foreground">
          تغطية Backfill · دورة الحياة · مزامنة المحولات · العلاقات
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Metric label="CoreEvidence" value={snapshot.totalCoreEvidence} />
        <Metric
          label="تغطية Backfill"
          value={`${snapshot.backfillCoverage.overall.percent}%`}
        />
        <Metric label="مزامنة ناقصة" value={snapshot.failedAdapterSyncs} />
        <Metric label="أدلة يتيمة" value={snapshot.orphanedEvidence} />
        <Metric label="علاقات ناقصة" value={snapshot.missingRelations} />
        <Metric
          label="Audit / LC"
          value={`${snapshot.backfillCoverage.audit.percent}% / ${snapshot.backfillCoverage.localContent.percent}%`}
        />
      </div>

      <div>
        <h3 className="mb-2 text-sm font-medium">توزيع دورة الحياة</h3>
        <div className="flex flex-wrap gap-2">
          {Object.entries(snapshot.lifecycleDistribution).map(
            ([status, count]) => (
              <span
                key={status}
                className="rounded-full border px-3 py-1 text-xs font-mono"
              >
                {status}: {count}
              </span>
            ),
          )}
        </div>
      </div>

      {snapshot.alerts.length > 0 ? (
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
      ) : (
        <p className="text-sm text-status-success">✓ لا توجد تنبيهات تشغيلية</p>
      )}

      <p className="text-xs text-muted-foreground font-mono">
        API: GET /api/platform/evidence/health ·{" "}
        {new Date(snapshot.generatedAt).toLocaleString("ar-SA")}
      </p>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border px-3 py-2 text-center">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-lg font-bold">{value}</p>
    </div>
  );
}
