"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, RefreshCw, X } from "lucide-react";
import { SalesViewerReadOnlyNotice } from "@/components/sales/sales-shell";
import type { OutreachDraft } from "@/lib/sales/outreach";
import { STATUS_LABELS, STATUS_COLORS } from "./use-deal-outreach";

export function OutreachReviewItem({
  item,
  canReview,
  reviewingKey,
  onReview,
}: {
  item: OutreachDraft & {
    dealId: string;
    dealTitle: string;
    accountId: string;
    accountName: string;
  };
  canReview: boolean;
  reviewingKey: string | null;
  onReview: (
    dealId: string,
    draftId: string,
    decision: "approved" | "rejected",
  ) => void;
}) {
  const key = `${item.dealId}:${item.id}`;

  return (
    <li className="rounded-lg border p-4 space-y-2 text-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-semibold">{item.subject}</p>
          <p className="text-xs text-muted-foreground mt-1">
            <Link
              href={`/sales/deals/${item.dealId}`}
              className="text-primary hover:underline"
            >
              {item.dealTitle}
            </Link>
            {" · "}
            {item.accountName}
          </p>
        </div>
        <Badge variant="outline" className={STATUS_COLORS.pending_review}>
          {STATUS_LABELS.pending_review}
        </Badge>
      </div>
      <p className="text-xs whitespace-pre-wrap rounded bg-muted/40 p-2">
        {item.body}
      </p>
      <p className="text-xs text-muted-foreground">
        بواسطة {item.createdByName ?? item.createdById} ·{" "}
        {new Date(item.submittedAt ?? item.createdAt).toLocaleString("ar-SA")}
      </p>
      {canReview ? (
        <div className="flex flex-wrap gap-2 pt-1">
          <Button
            type="button"
            size="sm"
            disabled={reviewingKey === key}
            onClick={() => onReview(item.dealId, item.id, "approved")}
          >
            {reviewingKey === key ? (
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
            disabled={reviewingKey === key}
            onClick={() => onReview(item.dealId, item.id, "rejected")}
          >
            <X className="h-4 w-4" />
            رفض
          </Button>
        </div>
      ) : (
        <SalesViewerReadOnlyNotice action="اعتماد أو رفض المسودات" />
      )}
    </li>
  );
}
