"use client";

/**
 * Phase 28.4 — Explicit integrity re-verification with audit log.
 */
import { useCallback, useState } from "react";
import { verifyFoundationReleaseAction } from "@/actions/knowledge-foundation/actions";
import type { ReleaseIntegrityResult } from "@/lib/knowledge-foundation/release-integrity";
import { IntegrityStatusCard } from "./integrity-status-card";
import { RefreshCw } from "lucide-react";

export function IntegritySection({
  versionId,
  initialIntegrity,
}: {
  versionId: string;
  initialIntegrity: ReleaseIntegrityResult;
}) {
  const [integrity, setIntegrity] = useState(initialIntegrity);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleVerify = useCallback(async () => {
    setLoading(true);
    setMessage(null);
    try {
      const result = await verifyFoundationReleaseAction(versionId);
      setIntegrity(result);
      setMessage(
        result.valid
          ? "تم التحقق بنجاح وتسجيله في سجل التدقيق."
          : "فشل التحقق — راجع العوائق أدناه (مسجّل في سجل التدقيق).",
      );
    } catch (err: unknown) {
      setMessage(
        err instanceof Error ? err.message : "تعذّر إجراء التحقق من السلامة",
      );
    } finally {
      setLoading(false);
    }
  }, [versionId]);

  return (
    <div className="space-y-3">
      <IntegrityStatusCard integrity={integrity} />
      <div className="flex flex-wrap items-center gap-3" dir="rtl">
        <button
          type="button"
          onClick={handleVerify}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg border bg-background px-3 py-2 text-sm hover:bg-muted/50 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          إعادة التحقق من السلامة
        </button>
        {message && (
          <p className="text-xs text-muted-foreground">{message}</p>
        )}
      </div>
    </div>
  );
}
