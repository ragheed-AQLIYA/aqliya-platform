"use client";

/**
 * Phase 9 — Knowledge Foundation Diff Viewer.
 *
 * Compare two versions and display added, modified, and removed rules.
 */
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { generateFoundationDiff } from "@/actions/knowledge-foundation/actions";

type Version = { id: string; versionNumber: string };

interface DiffData {
  fromVersionId: string;
  toVersionId: string;
  fromVersionNumber: string;
  toVersionNumber: string;
  addedRules: Array<{ phrase: string; canonicalCode: string; category: string; confidence: number }>;
  modifiedRules: Array<{ phrase: string; canonicalCode: string; category: string; oldConfidence: number; newConfidence: number }>;
  removedRules: Array<{ phrase: string; canonicalCode: string; category: string; confidence: number }>;
  breakingChange: boolean;
  riskScore: number;
  summary: string;
}

export function DiffViewer({ versions }: { versions: Version[] }) {
  const router = useRouter();
  const [fromId, setFromId] = useState("");
  const [toId, setToId] = useState("");
  const [diff, setDiff] = useState<DiffData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCompare = useCallback(async () => {
    if (!fromId || !toId) {
      setError("الرجاء اختيار إصدارين للمقارنة");
      return;
    }
    if (fromId === toId) {
      setError("لا يمكن مقارنة الإصدار بنفسه");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await generateFoundationDiff({
        fromVersionId: fromId,
        toVersionId: toId,
      });
      setDiff(result);
      router.refresh();
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "حدث خطأ أثناء المقارنة",
      );
    } finally {
      setLoading(false);
    }
  }, [fromId, toId, router]);

  const selectable = versions.filter((v) => v.id);

  return (
    <div className="space-y-6" dir="rtl">
      {/* Selectors */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">من الإصدار</label>
          <select
            value={fromId}
            onChange={(e) => setFromId(e.target.value)}
            className="w-full rounded-lg border bg-background p-2 text-sm"
          >
            <option value="">اختر...</option>
            {selectable.map((v) => (
              <option key={v.id} value={v.id}>
                v{v.versionNumber}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">إلى الإصدار</label>
          <select
            value={toId}
            onChange={(e) => setToId(e.target.value)}
            className="w-full rounded-lg border bg-background p-2 text-sm"
          >
            <option value="">اختر...</option>
            {selectable.map((v) => (
              <option key={v.id} value={v.id}>
                v{v.versionNumber}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        onClick={handleCompare}
        disabled={loading}
        className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
      >
        {loading ? "جاري المقارنة..." : "مقارنة الإصدارات"}
      </button>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {/* Diff results */}
      {diff && (
        <div className="space-y-4">
          {/* Summary */}
          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <h3 className="mb-2 text-lg font-semibold">
              الفرق: v{diff.fromVersionNumber} → v{diff.toVersionNumber}
            </h3>
            <p className="text-sm text-muted-foreground">{diff.summary}</p>
            <div className="mt-3 flex flex-wrap gap-3">
              {diff.breakingChange && (
                <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
                  تغيير جذري
                </span>
              )}
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                خطورة: {diff.riskScore.toFixed(2)}
              </span>
              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                +{diff.addedRules.length} مضاف
              </span>
              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                ~{diff.modifiedRules.length} معدّل
              </span>
              {diff.removedRules.length > 0 && (
                <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
                  -{diff.removedRules.length} محذوف
                </span>
              )}
            </div>
          </div>

          {/* Added rules */}
          {diff.addedRules.length > 0 && (
            <section className="rounded-xl border bg-card p-5 shadow-sm">
              <h4 className="mb-3 text-sm font-semibold text-green-700">
                قواعد مضافة ({diff.addedRules.length})
              </h4>
              <div className="space-y-2 text-sm">
                {diff.addedRules.map((r, i) => (
                  <div
                    key={i}
                    className="rounded-lg border border-green-100 bg-green-50 p-2"
                  >
                    <span className="font-medium">{r.phrase}</span>
                    <span className="mr-2 text-xs text-muted-foreground">
                      {r.canonicalCode} · {r.category} · ثقة: {r.confidence}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Modified rules */}
          {diff.modifiedRules.length > 0 && (
            <section className="rounded-xl border bg-card p-5 shadow-sm">
              <h4 className="mb-3 text-sm font-semibold text-blue-700">
                قواعد معدّلة ({diff.modifiedRules.length})
              </h4>
              <div className="space-y-2 text-sm">
                {diff.modifiedRules.map((r, i) => (
                  <div
                    key={i}
                    className="rounded-lg border border-blue-100 bg-blue-50 p-2"
                  >
                    <span className="font-medium">{r.phrase}</span>
                    <span className="mr-2 text-xs text-muted-foreground">
                      {r.canonicalCode} · {r.category} · ثقة: {r.oldConfidence}
                      → {r.newConfidence}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Removed rules */}
          {diff.removedRules.length > 0 && (
            <section className="rounded-xl border bg-card p-5 shadow-sm">
              <h4 className="mb-3 text-sm font-semibold text-red-700">
                قواعد محذوفة ({diff.removedRules.length})
              </h4>
              <div className="space-y-2 text-sm">
                {diff.removedRules.map((r, i) => (
                  <div
                    key={i}
                    className="rounded-lg border border-red-100 bg-red-50 p-2"
                  >
                    <span className="font-medium">{r.phrase}</span>
                    <span className="mr-2 text-xs text-muted-foreground">
                      {r.canonicalCode} · {r.category} · ثقة: {r.confidence}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
