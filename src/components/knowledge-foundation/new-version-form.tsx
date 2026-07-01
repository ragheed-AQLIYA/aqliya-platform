"use client";

/**
 * Phase 28.1 / 28.3 — New Knowledge Foundation Version Form with candidate binding + pool filters.
 */
import { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createFoundationVersion } from "@/actions/knowledge-foundation/actions";
import type { CandidatePoolOverview } from "@/lib/knowledge-foundation/candidate-pool-overview";

export type EligibleCandidateOption = {
  id: string;
  candidatePhrase: string;
  canonicalCode: string;
  category: string;
  confidence: number;
  supportCount: number;
  organizationCount: number;
  promotedAt: string | null;
  evidenceCount: number;
};

export function NewVersionForm({
  eligibleCandidates,
  poolOverview,
}: {
  eligibleCandidates: EligibleCandidateOption[];
  poolOverview?: CandidatePoolOverview;
}) {
  const router = useRouter();
  const [versionNumber, setVersionNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [canonicalFilter, setCanonicalFilter] = useState("");
  const [minConfidence, setMinConfidence] = useState(0);
  const [promotedAfter, setPromotedAfter] = useState("");

  const selectedCount = selectedIds.size;

  const filteredCandidates = useMemo(() => {
    return eligibleCandidates.filter((c) => {
      if (
        canonicalFilter &&
        !c.canonicalCode.toLowerCase().includes(canonicalFilter.toLowerCase()) &&
        !c.candidatePhrase.toLowerCase().includes(canonicalFilter.toLowerCase())
      ) {
        return false;
      }
      if (c.confidence < minConfidence / 100) return false;
      if (promotedAfter && c.promotedAt) {
        if (new Date(c.promotedAt) < new Date(promotedAfter)) return false;
      }
      if (promotedAfter && !c.promotedAt) return false;
      return true;
    });
  }, [eligibleCandidates, canonicalFilter, minConfidence, promotedAfter]);

  const toggleCandidate = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const summary = useMemo(() => {
    const selected = eligibleCandidates.filter((c) => selectedIds.has(c.id));
    if (selected.length === 0) return null;
    const avgConfidence =
      selected.reduce((sum, c) => sum + c.confidence, 0) / selected.length;
    const totalOrgs = selected.reduce((sum, c) => sum + c.organizationCount, 0);
    return { avgConfidence, totalOrgs };
  }, [eligibleCandidates, selectedIds]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!versionNumber.trim()) {
        setError("الرجاء إدخال رقم الإصدار");
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const version = await createFoundationVersion({
          versionNumber: versionNumber.trim(),
          notes: notes.trim() || undefined,
          candidateIds: [...selectedIds],
        });
        router.push(`/knowledge-foundation/${version.id}`);
      } catch (err: unknown) {
        setError(
          err instanceof Error ? err.message : "حدث خطأ أثناء إنشاء الإصدار",
        );
      } finally {
        setLoading(false);
      }
    },
    [versionNumber, notes, selectedIds, router],
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6" dir="rtl">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <div>
        <label
          htmlFor="versionNumber"
          className="mb-1 block text-sm font-medium"
        >
          رقم الإصدار <span className="text-red-500">*</span>
        </label>
        <input
          id="versionNumber"
          type="text"
          value={versionNumber}
          onChange={(e) => setVersionNumber(e.target.value)}
          placeholder="مثال: 1.0.0"
          className="w-full rounded-lg border bg-background p-2 text-sm"
          required
        />
        <p className="mt-1 text-xs text-muted-foreground">
          استخدم التنسيق الدلالي: رئيسي.فرعي.تصحيحي
        </p>
      </div>

      <div>
        <label htmlFor="notes" className="mb-1 block text-sm font-medium">
          ملاحظات
        </label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="وصف موجز لمحتوى هذا الإصدار..."
          className="w-full rounded-lg border bg-background p-2 text-sm"
          rows={3}
        />
      </div>

      <div className="rounded-xl border bg-muted/20 p-4">
        {poolOverview && (
          <div className="mb-4 grid gap-2 rounded-lg border bg-card p-3 text-xs sm:grid-cols-3">
            <p>
              إجمالي المُرقّاة:{" "}
              <span className="font-bold">{poolOverview.totalPromoted}</span>
            </p>
            <p>
              مرتبطة:{" "}
              <span className="font-bold">{poolOverview.boundTotal}</span>
            </p>
            <p>
              متاحة للربط:{" "}
              <span className="font-bold">{poolOverview.eligibleUnbound}</span>
            </p>
          </div>
        )}

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
              onClick={() => setSelectedIds(new Set(filteredCandidates.map((c) => c.id)))}
              className="underline text-primary"
            >
              تحديد المعروض
            </button>
            <button
              type="button"
              onClick={clearSelection}
              className="underline text-muted-foreground"
            >
              مسح
            </button>
          </div>
        </div>

        <div className="mb-3 grid gap-2 sm:grid-cols-3">
          <input
            type="text"
            value={canonicalFilter}
            onChange={(e) => setCanonicalFilter(e.target.value)}
            placeholder="تصفية بالرمز أو العبارة..."
            className="rounded-lg border bg-background p-2 text-xs"
          />
          <label className="flex items-center gap-2 text-xs">
            <span className="shrink-0">أدنى ثقة %</span>
            <input
              type="range"
              min={0}
              max={100}
              value={minConfidence}
              onChange={(e) => setMinConfidence(Number(e.target.value))}
              className="flex-1"
            />
            <span className="w-8 font-mono">{minConfidence}</span>
          </label>
          <input
            type="date"
            value={promotedAfter}
            onChange={(e) => setPromotedAfter(e.target.value)}
            className="rounded-lg border bg-background p-2 text-xs"
            title="تاريخ الترقية من"
          />
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
                  onChange={() => toggleCandidate(c.id)}
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
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {loading ? "جاري الإنشاء..." : `إنشاء الإصدار (${selectedCount} مرشّح)`}
        </button>
        <Link
          href="/knowledge-foundation"
          className="rounded-lg border bg-card px-4 py-2 text-sm font-medium hover:bg-muted/50"
        >
          إلغاء
        </Link>
      </div>
    </form>
  );
}
