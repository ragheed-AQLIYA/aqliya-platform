"use client";

import type { EligibleCandidateOption } from "./types";

export function CandidateList({
  eligibleCandidates,
  filteredCandidates,
  selectedIds,
  onToggle,
  onSelectAll,
  onClearSelection,
  selectedCount,
  summary,
}: {
  eligibleCandidates: EligibleCandidateOption[];
  filteredCandidates: EligibleCandidateOption[];
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  selectedCount: number;
  summary: { avgConfidence: number; totalOrgs: number } | null;
}) {
  return (
    <>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold">مرشّحات مُرقّاة متاحة للربط</h3>
          <p className="text-xs text-muted-foreground">
            اختر المرشّحات المُرقّاة (PROMOTED) غير المرتبطة بإصدار آخر.
          </p>
        </div>
        <div className="flex gap-2 text-xs">
          <button
            type="button"
            onClick={onSelectAll}
            className="underline text-primary"
          >
            تحديد المعروض
          </button>
          <button
            type="button"
            onClick={onClearSelection}
            className="underline text-muted-foreground"
          >
            مسح
          </button>
        </div>
      </div>

      {eligibleCandidates.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          لا توجد مرشّحات مُرقّاة متاحة حالياً. رقِّ مرشّحات من مراجعة المعرفة أولاً.
        </p>
      ) : filteredCandidates.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          لا توجد نتائج مطابقة للتصفية الحالية.
        </p>
      ) : (
        <div className="max-h-64 space-y-2 overflow-y-auto">
          {filteredCandidates.map((c) => (
            <label
              key={c.id}
              className="flex cursor-pointer items-start gap-3 rounded-lg border bg-card p-3 hover:bg-muted/30"
            >
              <input
                type="checkbox"
                checked={selectedIds.has(c.id)}
                onChange={() => onToggle(c.id)}
                className="mt-1"
              />
              <div className="min-w-0 flex-1">
                <p className="font-medium">{c.candidatePhrase}</p>
                <p className="text-xs text-muted-foreground font-mono">
                  {c.canonicalCode} · {c.category}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  ثقة {(c.confidence * 100).toFixed(0)}% · دعم {c.supportCount} ·
                  جهات {c.organizationCount} · أدلة {c.evidenceCount}
                </p>
              </div>
            </label>
          ))}
        </div>
      )}

      {summary && (
        <p className="mt-3 text-xs text-muted-foreground">
          المحدد: {selectedCount} مرشّح · متوسط الثقة{" "}
          {(summary.avgConfidence * 100).toFixed(0)}% · مجموع الجهات المساهمة{" "}
          {summary.totalOrgs}
        </p>
      )}
    </>
  );
}
