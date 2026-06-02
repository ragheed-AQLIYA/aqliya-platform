"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  draftFollowUpAction,
  approveFollowUpDraftAction,
  rejectFollowUpDraftAction,
} from "@/actions/sales-actions";
import type { FollowUpDraft } from "@/lib/sales/agents/follow-up";
import { Check, FileText, RefreshCw, Sparkles, X } from "lucide-react";
import { SalesViewerReadOnlyNotice } from "@/components/sales/sales-shell";

const STATUS_LABELS: Record<string, string> = {
  draft: "مسودة",
  approved: "معتمد",
  rejected: "مرفوض",
};

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  approved:
    "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

function formatActionError(error: string, code?: string): string {
  if (code === "FORBIDDEN" || error === "Access denied") {
    return "لا تملك صلاحية تنفيذ هذا الإجراء";
  }
  if (code === "VALIDATION") {
    return error.replace(/^SalesOS validation:\s*/i, "");
  }
  return error || "تعذر تنفيذ الإجراء";
}

export function DealFollowUpPanel({
  dealId,
  drafts,
  interactions,
  canCreate = false,
  canReview = false,
}: {
  dealId: string;
  drafts: FollowUpDraft[];
  interactions: Array<{ id: string; type: string; subject: string | null }>;
  canCreate?: boolean;
  canReview?: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedInteractionId, setSelectedInteractionId] = useState("");

  async function handleDraft() {
    setLoading(true);
    setError(null);
    try {
      const res = await draftFollowUpAction(
        dealId,
        selectedInteractionId || undefined,
      );
      if (res.ok) {
        router.refresh();
      } else {
        setError(formatActionError(res.error, res.code));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "تعذر إنشاء مسودة المتابعة");
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(draftId: string) {
    setReviewingId(draftId);
    setError(null);
    try {
      const res = await approveFollowUpDraftAction(dealId, draftId);
      if (res.ok) {
        router.refresh();
      } else {
        setError(formatActionError(res.error, res.code));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "تعذر اعتماد المسودة");
    } finally {
      setReviewingId(null);
    }
  }

  async function handleReject(draftId: string) {
    setReviewingId(draftId);
    setError(null);
    try {
      const res = await rejectFollowUpDraftAction(dealId, draftId, undefined);
      if (res.ok) {
        router.refresh();
      } else {
        setError(formatActionError(res.error, res.code));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "تعذر رفض المسودة");
    } finally {
      setReviewingId(null);
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        مسودات متابعة محكومة من ملاحظات التفاعل — لا إرسال تلقائي. الاعتماد
        ينسخ الإجراء التالي فقط بعد تأكيد بشري.
      </p>

      {drafts.length === 0 ? (
        <p className="text-sm text-muted-foreground">لا مسودات متابعة بعد.</p>
      ) : (
        <ul className="space-y-3">
          {drafts.map((draft) => (
            <li
              key={draft.id}
              className="rounded-md border p-3 text-sm space-y-2"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-medium">{draft.subject}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {draft.sourceInteractionType ?? "—"} ·{" "}
                    {new Date(draft.createdAt).toLocaleString("ar-SA")}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={STATUS_COLORS[draft.status] ?? ""}
                >
                  {STATUS_LABELS[draft.status] ?? draft.status}
                </Badge>
              </div>
              <p className="text-xs whitespace-pre-wrap rounded bg-muted/40 p-2">
                {draft.body}
              </p>
              <p className="text-xs text-muted-foreground">
                الإجراء التالي المقترح:{" "}
                <span className="font-medium">{draft.suggestedNextAction}</span>
              </p>
              {draft.reviewedAt ? (
                <p className="text-xs text-muted-foreground">
                  مراجعة: {draft.reviewedByName ?? draft.reviewedById} ·{" "}
                  {new Date(draft.reviewedAt).toLocaleString("ar-SA")}
                  {draft.reviewNote ? ` — ${draft.reviewNote}` : ""}
                </p>
              ) : null}
              {canReview && draft.status === "draft" ? (
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    disabled={reviewingId === draft.id}
                    onClick={() => handleApprove(draft.id)}
                  >
                    {reviewingId === draft.id ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                    اعتماد → نسخ للإجراء التالي
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    disabled={reviewingId === draft.id}
                    onClick={() => handleReject(draft.id)}
                  >
                    <X className="h-4 w-4" />
                    رفض
                  </Button>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      {!canCreate ? (
        <SalesViewerReadOnlyNotice action="إنشاء مسودات متابعة" />
      ) : null}

      {canCreate ? (
        <div className="space-y-3 border-t pt-4">
          {interactions.length > 0 ? (
            <div className="space-y-1">
              <label
                htmlFor="followUpInteraction"
                className="text-sm font-medium"
              >
                التفاعل المصدر (اختياري — الافتراضي: الأحدث)
              </label>
              <select
                id="followUpInteraction"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                disabled={loading}
                value={selectedInteractionId}
                onChange={(e) => setSelectedInteractionId(e.target.value)}
              >
                <option value="">آخر تفاعل</option>
                {interactions.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.type}
                    {item.subject ? ` — ${item.subject}` : ""}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              أضف تفاعلاً (اجتماع/ملاحظة) قبل إنشاء مسودة متابعة.
            </p>
          )}
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <Button
            type="button"
            size="sm"
            disabled={loading || interactions.length === 0}
            className="gap-1"
            onClick={handleDraft}
          >
            {loading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            إنشاء مسودة متابعة (Stub)
          </Button>
        </div>
      ) : null}
    </div>
  );
}
