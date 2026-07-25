"use client";

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "مسودة",
  APPROVED: "معتمد",
  RELEASED: "مطلق",
  ACTIVE: "نشط",
  DEPRECATED: "متقاعد",
};

interface Props {
  isAdmin: boolean;
  versionStatus: string;
  targetVersions: Array<{ id: string; versionNumber: string; status: string }>;
  loading: string | null;
  rollbackId: string;
  onRollbackIdChange: (id: string) => void;
  rollbackReason: string;
  onRollbackReasonChange: (reason: string) => void;
  showRollback: boolean;
  onShowRollbackChange: (show: boolean) => void;
  onRollback: () => void;
}

export function VersionRollbackSection({
  isAdmin,
  versionStatus,
  targetVersions,
  loading,
  rollbackId,
  onRollbackIdChange,
  rollbackReason,
  onRollbackReasonChange,
  showRollback,
  onShowRollbackChange,
  onRollback,
}: Props) {
  if (!isAdmin || versionStatus === "DEPRECATED") return null;

  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <button
        onClick={() => onShowRollbackChange(!showRollback)}
        className="text-sm font-medium text-amber-600 hover:text-amber-700"
      >
        {showRollback ? "إخفاء" : "↙ استرجاع الإصدار"}
      </button>

      {showRollback && (
        <div className="mt-4 space-y-3">
          <p className="text-sm text-muted-foreground">
            استرجاع إلى إصدار سابق. هذا الإجراء يتطلب صلاحية مدير وسيبقى
            الإصدار الحالي محفوظاً كمتقاعد.
          </p>
          <select
            value={rollbackId}
            onChange={(e) => onRollbackIdChange(e.target.value)}
            className="w-full rounded-lg border bg-background p-2 text-sm"
          >
            <option value="">اختر إصدار الهدف...</option>
            {targetVersions.map((v) => (
              <option key={v.id} value={v.id}>
                v{v.versionNumber} ({STATUS_LABELS[v.status] ?? v.status})
              </option>
            ))}
          </select>
          <textarea
            value={rollbackReason}
            onChange={(e) => onRollbackReasonChange(e.target.value)}
            placeholder="سبب الاسترجاع (مطلوب)..."
            className="w-full rounded-lg border bg-background p-2 text-sm"
            rows={3}
          />
          <button
            onClick={onRollback}
            disabled={loading !== null || !rollbackId || !rollbackReason.trim()}
            className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50"
          >
            {loading === "الاسترجاع" ? "جاري..." : "↙ تأكيد الاسترجاع"}
          </button>
        </div>
      )}
    </div>
  );
}
