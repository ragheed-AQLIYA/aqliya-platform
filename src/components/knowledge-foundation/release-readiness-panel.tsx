/**
 * Phase 28.3 — Release readiness display (governance only, no auto-release).
 */
import type { ReleaseReadinessResult } from "@/lib/knowledge-foundation/release-readiness";
import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";

export function ReleaseReadinessPanel({
  readiness,
}: {
  readiness: ReleaseReadinessResult;
}) {
  const { ready, score, warnings, blockers, metrics } = readiness;

  return (
    <section className="rounded-xl border bg-card p-5 shadow-sm" dir="rtl">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-semibold">جاهزية الإطلاق</h3>
        <div className="flex items-center gap-2">
          {ready ? (
            <CheckCircle2 className="h-5 w-5 text-green-600" aria-hidden />
          ) : (
            <XCircle className="h-5 w-5 text-red-600" aria-hidden />
          )}
          <span className="text-sm font-medium">
            {ready ? "جاهز للإطلاق" : "غير جاهز"}
          </span>
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-mono">
            {score}/100
          </span>
        </div>
      </div>

      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="مرتبطة" value={metrics.boundCandidateCount} />
        <Metric label="مُطلقة" value={metrics.releasedCandidateCount} />
        <Metric
          label="متوسط الثقة"
          value={`${(metrics.averageConfidence * 100).toFixed(0)}%`}
        />
        <Metric
          label="متوسط الأدلة"
          value={metrics.averageEvidenceCount.toFixed(1)}
        />
      </div>

      {blockers.length > 0 && (
        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 p-3">
          <p className="mb-2 flex items-center gap-1 text-xs font-semibold text-red-800">
            <XCircle className="h-3.5 w-3.5" />
            عوائق ({blockers.length})
          </p>
          <ul className="list-inside list-disc space-y-1 text-xs text-red-700">
            {blockers.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </div>
      )}

      {warnings.length > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
          <p className="mb-2 flex items-center gap-1 text-xs font-semibold text-amber-800">
            <AlertTriangle className="h-3.5 w-3.5" />
            تحذيرات ({warnings.length})
          </p>
          <ul className="list-inside list-disc space-y-1 text-xs text-amber-700">
            {warnings.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      {blockers.length === 0 && warnings.length === 0 && (
        <p className="text-xs text-muted-foreground">
          لا توجد عوائق أو تحذيرات — راجع الحوكمة قبل الإطلاق اليدوي.
        </p>
      )}
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border bg-muted/20 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-bold">{value}</p>
    </div>
  );
}
