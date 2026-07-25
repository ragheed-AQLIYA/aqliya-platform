"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, RefreshCw, Send, X } from "lucide-react";
import type { OutreachDraft } from "@/lib/sales/outreach";
import { STATUS_LABELS, STATUS_COLORS } from "./use-deal-outreach";

export function OutreachDraftItem({
  draft,
  canCreate,
  canReview,
  submittingId,
  reviewingId,
  onSubmit,
  onReview,
}: {
  draft: OutreachDraft;
  canCreate: boolean;
  canReview: boolean;
  submittingId: string | null;
  reviewingId: string | null;
  onSubmit: (draftId: string) => void;
  onReview: (draftId: string, decision: "approved" | "rejected") => void;
}) {
  return (
    <li className="rounded-md border p-3 text-sm space-y-2">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-medium">{draft.subject}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {draft.channel ?? "—"} ·{" "}
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
      {draft.reviewedAt ? (
        <p className="text-xs text-muted-foreground">
          مراجعة: {draft.reviewedByName ?? draft.reviewedById} ·{" "}
          {new Date(draft.reviewedAt).toLocaleString("ar-SA")}
          {draft.reviewNote ? ` — ${draft.reviewNote}` : ""}
        </p>
      ) : null}
      <div className="flex flex-wrap gap-2">
        {canCreate && draft.status === "draft" ? (
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={submittingId === draft.id}
            onClick={() => onSubmit(draft.id)}
          >
            {submittingId === draft.id ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            إرسال للمراجعة
          </Button>
        ) : null}
        {canReview && draft.status === "pending_review" ? (
          <>
            <Button
              type="button"
              size="sm"
              disabled={reviewingId === draft.id}
              onClick={() => onReview(draft.id, "approved")}
            >
              {reviewingId === draft.id ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              اعتماد
            </Button>
            <Button
              type="button"
              size="sm"
              variant="destructive"
              disabled={reviewingId === draft.id}
              onClick={() => onReview(draft.id, "rejected")}
            >
              <X className="h-4 w-4" />
              رفض
            </Button>
          </>
        ) : null}
      </div>
    </li>
  );
}
