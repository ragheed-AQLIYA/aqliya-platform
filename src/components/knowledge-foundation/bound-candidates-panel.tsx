"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { unbindFoundationCandidate } from "@/actions/knowledge-foundation/actions";

export type BoundCandidateView = {
  bindingId: string;
  candidateId: string;
  candidatePhrase: string;
  canonicalCode: string;
  category: string;
  confidence: number;
  supportCount: number;
  organizationCount: number;
  boundAt: string;
  boundByName: string | null;
  promotionDate: string | null;
  evidenceCount: number;
};

export function BoundCandidatesPanel({
  versionId,
  versionStatus,
  userRole,
  candidates,
}: {
  versionId: string;
  versionStatus: string;
  userRole: string;
  candidates: BoundCandidateView[];
}) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canUnbind =
    versionStatus === "DRAFT" &&
    (userRole === "ADMIN" || userRole === "OPERATOR");

  const handleUnbind = useCallback(
    async (candidateId: string) => {
      setLoadingId(candidateId);
      setError(null);
      try {
        await unbindFoundationCandidate({ versionId, candidateId });
        router.refresh();
      } catch (err: unknown) {
        setError(
          err instanceof Error ? err.message : "تعذر إلغاء ربط المرشّح",
        );
      } finally {
        setLoadingId(null);
      }
    },
    [versionId, router],
  );

  return (
    <section className="rounded-xl border bg-card p-5 shadow-sm" dir="rtl">
      <h3 className="mb-3 text-sm font-semibold">المرشّحات المرتبطة</h3>
      {error && (
        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 p-2 text-sm text-red-800">
          {error}
        </div>
      )}
      {candidates.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          لا توجد مرشّحات مرتبطة بهذا الإصدار بعد.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-right text-xs text-muted-foreground">
                <th className="p-2">العبارة</th>
                <th className="p-2">الرمز</th>
                <th className="p-2">الثقة</th>
                <th className="p-2">الدعم</th>
                <th className="p-2">الجهات</th>
                <th className="p-2">الأدلة</th>
                {canUnbind && <th className="p-2">إجراء</th>}
              </tr>
            </thead>
            <tbody>
              {candidates.map((c) => (
                <tr key={c.bindingId} className="border-b last:border-0">
                  <td className="p-2 font-medium">{c.candidatePhrase}</td>
                  <td className="p-2 font-mono text-xs">{c.canonicalCode}</td>
                  <td className="p-2">{(c.confidence * 100).toFixed(0)}%</td>
                  <td className="p-2">{c.supportCount}</td>
                  <td className="p-2">{c.organizationCount}</td>
                  <td className="p-2">{c.evidenceCount}</td>
                  {canUnbind && (
                    <td className="p-2">
                      <button
                        type="button"
                        onClick={() => handleUnbind(c.candidateId)}
                        disabled={loadingId !== null}
                        className="text-xs text-red-600 underline disabled:opacity-50"
                      >
                        {loadingId === c.candidateId ? "جاري..." : "إلغاء الربط"}
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
