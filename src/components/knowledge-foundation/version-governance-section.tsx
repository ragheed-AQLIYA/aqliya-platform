"use client";

/**
 * Phase 28.3 — Combined readiness display + governance tools.
 */
import { useCallback, useState } from "react";
import {
  getFoundationReleaseReadiness,
  generateFoundationGovernanceReportAction,
} from "@/actions/knowledge-foundation/actions";
import type { ReleaseReadinessResult } from "@/lib/knowledge-foundation/release-readiness";
import { ReleaseReadinessPanel } from "./release-readiness-panel";
import { FileDown, RefreshCw } from "lucide-react";

export function VersionGovernanceSection({
  versionId,
  initialReadiness,
}: {
  versionId: string;
  initialReadiness: ReleaseReadinessResult;
}) {
  const [readiness, setReadiness] = useState(initialReadiness);
  const [loading, setLoading] = useState<"refresh" | "report" | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleRefresh = useCallback(async () => {
    setLoading("refresh");
    setMessage(null);
    try {
      const result = await getFoundationReleaseReadiness(versionId);
      setReadiness(result);
      setMessage("تم تحديث تقييم الجاهزية وتسجيله في سجل التدقيق.");
    } catch (err: unknown) {
      setMessage(
        err instanceof Error ? err.message : "تعذّر تحديث تقييم الجاهزية",
      );
    } finally {
      setLoading(null);
    }
  }, [versionId]);

  const handleDownloadReport = useCallback(async () => {
    setLoading("report");
    setMessage(null);
    try {
      const report = await generateFoundationGovernanceReportAction(versionId);
      const blob = new Blob([JSON.stringify(report, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `foundation-governance-${report.versionNumber}-${report.generatedAt.slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setMessage("تم إنشاء تقرير الحوكمة وتسجيله في سجل التدقيق.");
    } catch (err: unknown) {
      setMessage(
        err instanceof Error ? err.message : "تعذّر إنشاء تقرير الحوكمة",
      );
    } finally {
      setLoading(null);
    }
  }, [versionId]);

  return (
    <div className="space-y-4">
      <ReleaseReadinessPanel readiness={readiness} />
      <section className="rounded-xl border bg-card p-5 shadow-sm" dir="rtl">
        <h3 className="mb-3 text-sm font-semibold">أدوات الحوكمة</h3>
        <p className="mb-4 text-xs text-muted-foreground">
          تقييم الجاهزية وتصدير التقرير للمراجعة فقط — لا يغيّر دورة حياة الإصدار.
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={loading !== null}
            className="inline-flex items-center gap-2 rounded-lg border bg-background px-3 py-2 text-sm hover:bg-muted/50 disabled:opacity-50"
          >
            <RefreshCw
              className={`h-4 w-4 ${loading === "refresh" ? "animate-spin" : ""}`}
            />
            تحديث تقييم الجاهزية
          </button>
          <button
            type="button"
            onClick={handleDownloadReport}
            disabled={loading !== null}
            className="inline-flex items-center gap-2 rounded-lg border bg-background px-3 py-2 text-sm hover:bg-muted/50 disabled:opacity-50"
          >
            <FileDown className="h-4 w-4" />
            تصدير تقرير الحوكمة
          </button>
        </div>
        {message && (
          <p className="mt-3 text-xs text-muted-foreground">{message}</p>
        )}
      </section>
    </div>
  );
}
