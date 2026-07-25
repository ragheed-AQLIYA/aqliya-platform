"use client";

import type { FollowUpDraft } from "@/lib/sales/agents/follow-up";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, RefreshCw, X } from "lucide-react";
import { STATUS_LABELS, STATUS_COLORS } from "./follow-up-constants";

export function FollowUpDraftListItem({
  draft,
  reviewingId,
  canReview,
  onApprove,
  onReject,
}: {
  draft: FollowUpDraft;
  reviewingId: string | null;
  canReview: boolean;
  onApprove: (draftId: string) => void;
  onReject: (draftId: string) => void;
}) {
  return (
    <li className="rounded-md border p-3 text-sm space-y-2">
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
            onClick={() => onApprove(draft.id)}
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
            onClick={() => onReject(draft.id)}
          >
            <X className="h-4 w-4" />
            رفض
          </Button>
        </div>
      ) : null}
    </li>
  );
}
