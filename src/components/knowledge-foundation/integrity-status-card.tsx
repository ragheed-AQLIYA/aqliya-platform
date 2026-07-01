/**
 * Phase 28.4 — Release integrity status (DB truth + FS verification evidence).
 */
import type { ReleaseIntegrityResult } from "@/lib/knowledge-foundation/release-integrity";
import {
  AlertTriangle,
  CheckCircle2,
  Link2,
  ShieldCheck,
  XCircle,
} from "lucide-react";

export function IntegrityStatusCard({
  integrity,
}: {
  integrity: ReleaseIntegrityResult;
}) {
  const statusLabel = integrity.valid
    ? "تم التحقق"
    : integrity.hashMatch === false
      ? "عدم تطابق التجزئة"
      : !integrity.artifactFound || !integrity.manifestFound
        ? "أدلة مفقودة"
        : !integrity.chainValid
          ? "سلسلة ثقة مكسورة"
          : "فشل التحقق";

  const StatusIcon = integrity.valid
    ? CheckCircle2
    : integrity.hashMatch === false
      ? XCircle
      : AlertTriangle;

  const iconClass = integrity.valid
    ? "text-green-600"
    : integrity.hashMatch === false
      ? "text-red-600"
      : "text-amber-600";

  return (
    <section className="rounded-xl border bg-card p-5 shadow-sm" dir="rtl">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 text-sm font-semibold">
          <ShieldCheck className="h-4 w-4" />
          حالة سلامة الإطلاق
        </h3>
        <div className="flex items-center gap-2">
          <StatusIcon className={`h-5 w-5 ${iconClass}`} aria-hidden />
          <span className="text-sm font-medium">{statusLabel}</span>
        </div>
      </div>

      <p className="mb-4 text-xs text-muted-foreground">
        مصدر الحقيقة: قاعدة البيانات (manifestSha256 · provenanceSnapshot ·
        artifactStatus). الملفات على القرص أدلة تحقق فقط.
      </p>

      <div className="mb-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        <CheckRow label="صف الإطلاق (COMPLETE)" ok={integrity.releaseRowValid} />
        <CheckRow label="الحزمة (knowledge-foundation.json)" ok={integrity.artifactFound} />
        <CheckRow label="manifest.json (دليل)" ok={integrity.manifestFound} />
        <CheckRow label="provenance (يطابق DB)" ok={integrity.provenanceFound} />
        <CheckRow label="تطابق SHA256" ok={integrity.hashMatch} />
        <CheckRow label="سلسلة الثقة" ok={integrity.chainValid} />
      </div>

      {integrity.previousReleaseId && (
        <p className="mb-3 flex items-center gap-1 text-xs text-muted-foreground">
          <Link2 className="h-3.5 w-3.5" />
          الإصدار السابق في السلسلة:{" "}
          <span className="font-mono">{integrity.previousReleaseId}</span>
          {integrity.previousReleaseHash && (
            <>
              {" "}
              · hash{" "}
              <span className="font-mono">
                {integrity.previousReleaseHash.slice(0, 12)}…
              </span>
            </>
          )}
        </p>
      )}

      {integrity.blockers.length > 0 && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3">
          <p className="mb-2 text-xs font-semibold text-red-800">عوائق التحقق</p>
          <ul className="list-inside list-disc space-y-1 text-xs text-red-700">
            {integrity.blockers.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

function CheckRow({ label, ok }: { label: string; ok: boolean }) {
  return (
    <div className="flex items-center justify-between rounded border bg-muted/20 px-3 py-2 text-xs">
      <span>{label}</span>
      {ok ? (
        <CheckCircle2 className="h-4 w-4 text-green-600" aria-label="نعم" />
      ) : (
        <XCircle className="h-4 w-4 text-red-600" aria-label="لا" />
      )}
    </div>
  );
}
