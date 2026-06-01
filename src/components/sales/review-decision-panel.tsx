"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { recordSalesReviewDecisionAction } from "@/actions/sales-actions";
import type { ReviewDecisionRecord } from "@/lib/sales/governance";
import { CheckCircle2, XCircle, RefreshCw } from "lucide-react";
import { SalesViewerReadOnlyNotice } from "@/components/sales/sales-shell";

const DECISION_LABELS: Record<string, string> = {
  approved: "معتمد",
  rejected: "مرفوض",
  pending: "قيد الانتظار",
};

function formatActionError(error: string, code?: string): string {
  if (code === "FORBIDDEN" || error === "Access denied") {
    return "لا تملك صلاحية تسجيل قرار المراجعة";
  }
  if (code === "VALIDATION") {
    return error.replace(/^SalesOS validation:\s*/i, "");
  }
  return error || "تعذر تسجيل قرار المراجعة";
}

export function ReviewDecisionPanel({
  dealId,
  decisions,
  stageSlug,
  canUpdate = true,
}: {
  dealId: string;
  decisions: ReviewDecisionRecord[];
  stageSlug?: string | null;
  canUpdate?: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    try {
      const res = await recordSalesReviewDecisionAction(dealId, formData);
      if (res.ok) {
        router.refresh();
      } else {
        setError(formatActionError(res.error, res.code));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "تعذر تسجيل قرار المراجعة");
    } finally {
      setLoading(false);
    }
  }

  if (!canUpdate) {
    return <SalesViewerReadOnlyNotice action="تسجيل قرار مراجعة الحوكمة" />;
  }

  return (
    <div className="space-y-4">
      {decisions.length > 0 ? (
        <ul className="space-y-2 text-sm">
          {decisions.map((d) => (
            <li
              key={d.id}
              className="rounded-md border border-border p-3"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium">
                  {DECISION_LABELS[d.decision] ?? d.decision}
                </span>
                {d.stageSlug ? (
                  <span className="text-xs text-muted-foreground">
                    مرحلة: {d.stageSlug}
                  </span>
                ) : null}
              </div>
              <p className="mt-1 text-muted-foreground">{d.reason}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {d.actorName ?? d.actorId} —{" "}
                {new Date(d.createdAt).toLocaleString("ar-SA")}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">
          لا توجد قرارات مراجعة مسجّلة بعد.
        </p>
      )}

      <form action={handleSubmit} className="space-y-3 border-t pt-4">
        <div>
          <Label htmlFor="reviewDecision">قرار المراجعة</Label>
          <select
            id="reviewDecision"
            name="decision"
            required
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
            defaultValue="approved"
          >
            <option value="approved">معتمد</option>
            <option value="rejected">مرفوض</option>
            <option value="pending">قيد الانتظار</option>
          </select>
        </div>
        <div>
          <Label htmlFor="reviewReason">السبب / الملاحظة</Label>
          <textarea
            id="reviewReason"
            name="reason"
            required
            rows={3}
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            placeholder="سبب القرار — يُخزَّن في metadata.reviewDecisions ويُسجَّل في التدقيق"
          />
        </div>
        {stageSlug ? (
          <input type="hidden" name="stageSlug" value={stageSlug} />
        ) : null}

        {error ? (
          <div className="rounded-md bg-red-50 dark:bg-red-950 p-3 text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
            <XCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        ) : null}

        <Button type="submit" size="sm" disabled={loading} className="gap-1">
          <CheckCircle2 className="h-4 w-4" />
          {loading ? "جارٍ الحفظ..." : "تسجيل قرار المراجعة"}
        </Button>
      </form>
    </div>
  );
}
