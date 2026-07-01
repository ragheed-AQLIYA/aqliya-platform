"use client";

/**
 * Phase 9 — Version Detail Client Component.
 *
 * Displays knowledge foundation version details, diff summary, and
 * governance action buttons.
 */
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  approveFoundationVersion,
  activateFoundationVersion,
  deprecateFoundationVersion,
  rollbackFoundationVersion,
  generateFoundationRelease,
} from "@/actions/knowledge-foundation/actions";

export type VersionDetailStatus = "DRAFT" | "APPROVED" | "RELEASED" | "ACTIVE" | "DEPRECATED";

interface VersionData {
  id: string;
  versionNumber: string;
  status: VersionDetailStatus;
  notes: string | null;
  candidateCount: number;
  artifactPath: string | null;
  createdById: string;
  createdBy?: { id: string; name: string | null; email: string | null } | null;
  approvedById: string | null;
  approvedBy?: { id: string; name: string | null; email: string | null } | null;
  activatedAt: string | null;
  createdAt: string;
  rollbackVersionId: string | null;
  releases?: Array<{
    id: string;
    releaseNotes: string | null;
    createdAt: string;
    createdBy?: { id: string; name: string | null } | null;
  }>;
  diffsAsFrom?: Array<{
    id: string;
    toVersion: { id: string; versionNumber: string };
    riskScore: number;
    breakingChange: boolean;
    summary: string | null;
    generatedAt: string;
  }>;
  diffsAsTo?: Array<{
    id: string;
    fromVersion: { id: string; versionNumber: string };
    riskScore: number;
    breakingChange: boolean;
    summary: string | null;
    generatedAt: string;
  }>;
}

const STATUS_LABELS: Record<VersionDetailStatus, string> = {
  DRAFT: "مسودة",
  APPROVED: "معتمد",
  RELEASED: "مطلق",
  ACTIVE: "نشط",
  DEPRECATED: "متقاعد",
};

export function VersionDetailClient({
  version,
  userRole,
  versions,
}: {
  version: VersionData;
  userRole: string;
  versions: Array<{ id: string; versionNumber: string; status: string }>;
}) {
  const router = useRouter();
  const [actionMsg, setActionMsg] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [rollbackId, setRollbackId] = useState("");
  const [rollbackReason, setRollbackReason] = useState("");
  const [showRollback, setShowRollback] = useState(false);

  const isAdmin = userRole === "ADMIN";
  const isOperator = userRole === "OPERATOR" || isAdmin;
  const isActive = version.status === "ACTIVE";

  const doAction = useCallback(
    async (
      action: string,
      fn: () => Promise<unknown>,
    ) => {
      setLoading(action);
      setActionMsg(null);
      setActionError(null);
      try {
        await fn();
        setActionMsg(`تم ${action} الإصدار بنجاح.`);
        router.refresh();
      } catch (err: unknown) {
        setActionError(
          err instanceof Error ? err.message : "حدث خطأ غير متوقع",
        );
      } finally {
        setLoading(null);
      }
    },
    [router],
  );

  const handleRollback = useCallback(async () => {
    if (!rollbackId || !rollbackReason.trim()) {
      setActionError("الرجاء اختيار إصدار الهدف وذكر السبب");
      return;
    }
    await doAction("الاسترجاع", () =>
      rollbackFoundationVersion({
        versionId: version.id,
        targetVersionId: rollbackId,
        reason: rollbackReason,
      }),
    );
  }, [version.id, rollbackId, rollbackReason, doAction]);

  const targetVersions = versions.filter(
    (v) => v.id !== version.id && v.status !== "DRAFT",
  );

  return (
    <div className="space-y-6" dir="rtl">
      {/* Status and actions */}
      {actionMsg && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">
          {actionMsg}
        </div>
      )}
      {actionError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {actionError}
        </div>
      )}

      {/* Quick actions */}
      <div className="flex flex-wrap gap-3">
        {version.status === "DRAFT" && isAdmin && (
          <button
            onClick={() =>
              doAction("اعتماد", () =>
                approveFoundationVersion({ versionId: version.id }),
              )
            }
            disabled={loading !== null}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading === "اعتماد" ? "جاري..." : "اعتماد الإصدار"}
          </button>
        )}

        {version.status === "APPROVED" && isOperator && (
          <button
            onClick={() =>
              doAction("إطلاق", () =>
                generateFoundationRelease({
                  versionId: version.id,
                  versionNumber: version.versionNumber,
                  releaseNotes: version.notes ?? undefined,
                }),
              )
            }
            disabled={loading !== null}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading === "إطلاق" ? "جاري..." : "إطلاق الحزمة"}
          </button>
        )}

        {version.status === "RELEASED" && isAdmin && (
          <button
            onClick={() =>
              doAction("تفعيل", () =>
                activateFoundationVersion({ versionId: version.id }),
              )
            }
            disabled={loading !== null}
            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
          >
            {loading === "تفعيل" ? "جاري..." : "تفعيل الإصدار"}
          </button>
        )}

        {isActive && isAdmin && (
          <button
            onClick={() =>
              doAction("إيقاف", () =>
                deprecateFoundationVersion({
                  versionId: version.id,
                  notes: "إيقاف يدوي",
                }),
              )
            }
            disabled={loading !== null}
            className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50"
          >
            {loading === "إيقاف" ? "جاري..." : "إيقاف الإصدار"}
          </button>
        )}
      </div>

      {/* Rollback section (ADMIN only, when not already deprecated) */}
      {isAdmin && version.status !== "DEPRECATED" && (
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <button
            onClick={() => setShowRollback(!showRollback)}
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
                onChange={(e) => setRollbackId(e.target.value)}
                className="w-full rounded-lg border bg-background p-2 text-sm"
              >
                <option value="">اختر إصدار الهدف...</option>
                {targetVersions.map((v) => (
                  <option key={v.id} value={v.id}>
                    v{v.versionNumber} ({STATUS_LABELS[v.status as VersionDetailStatus] ?? v.status})
                  </option>
                ))}
              </select>
              <textarea
                value={rollbackReason}
                onChange={(e) => setRollbackReason(e.target.value)}
                placeholder="سبب الاسترجاع (مطلوب)..."
                className="w-full rounded-lg border bg-background p-2 text-sm"
                rows={3}
              />
              <button
                onClick={handleRollback}
                disabled={loading !== null || !rollbackId || !rollbackReason.trim()}
                className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50"
              >
                {loading === "الاسترجاع"
                  ? "جاري..."
                  : "↙ تأكيد الاسترجاع"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Diffs section */}
      {version.diffsAsFrom && version.diffsAsFrom.length > 0 && (
        <section className="rounded-xl border bg-card p-5 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold">الفروقات (كنقطة بداية)</h3>
          {version.diffsAsFrom.map((d) => (
            <div
              key={d.id}
              className="mb-2 rounded-lg border bg-muted/30 p-3 text-sm"
            >
              <p>
                إلى v{d.toVersion.versionNumber}
                {d.breakingChange && (
                  <span className="mr-2 rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700">
                    تغيير جذري
                  </span>
                )}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {d.summary ?? "—"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                                خطورة: {d.riskScore} · {new Date(d.generatedAt).toLocaleDateString("ar-SA")}
              </p>
            </div>
          ))}
        </section>
      )}

      {/* Releases section */}
      {version.releases && version.releases.length > 0 && (
        <section className="rounded-xl border bg-card p-5 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold">الإطلاقات</h3>
          {version.releases.map((r) => (
            <div
              key={r.id}
              className="mb-2 rounded-lg border bg-muted/30 p-3 text-sm"
            >
              <p className="font-medium">
                {new Date(r.createdAt).toLocaleDateString("ar-SA")}
              </p>
              {r.releaseNotes && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {r.releaseNotes}
                </p>
              )}
              <p className="mt-1 text-xs text-muted-foreground">
                بواسطة: {r.createdBy?.name ?? r.createdBy?.id ?? "—"}
              </p>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
