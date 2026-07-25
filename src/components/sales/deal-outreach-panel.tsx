"use client";

import type { OutreachDraft } from "@/lib/sales/outreach";
import { SalesViewerReadOnlyNotice } from "@/components/sales/sales-shell";
import {
  useDealOutreachPanel,
  useOutreachReviewQueue,
} from "./components/use-deal-outreach";
import { OutreachDraftItem } from "./components/outreach-draft-item";
import { OutreachCreateForm } from "./components/outreach-create-form";
import { OutreachReviewItem } from "./components/outreach-review-item";

export function DealOutreachPanel({
  dealId,
  drafts,
  canCreate = false,
  canReview = false,
}: {
  dealId: string;
  drafts: OutreachDraft[];
  canCreate?: boolean;
  canReview?: boolean;
}) {
  const { loading, submittingId, reviewingId, error, handleCreate, handleSubmit, handleReview } =
    useDealOutreachPanel(dealId);

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        مسودات outreach محكومة — لا إرسال تلقائي ولا تكامل بريد. المراجعة
        البشرية (اعتماد/رفض) تُسجَّل في SalesAuditEvent فقط.
      </p>

      {drafts.length === 0 ? (
        <p className="text-sm text-muted-foreground">لا مسودات outreach بعد.</p>
      ) : (
        <ul className="space-y-3">
          {drafts.map((draft) => (
            <OutreachDraftItem
              key={draft.id}
              draft={draft}
              canCreate={canCreate}
              canReview={canReview}
              submittingId={submittingId}
              reviewingId={reviewingId}
              onSubmit={handleSubmit}
              onReview={handleReview}
            />
          ))}
        </ul>
      )}

      {!canCreate ? (
        <SalesViewerReadOnlyNotice action="إنشاء مسودات outreach" />
      ) : null}

      {canCreate ? (
        <OutreachCreateForm loading={loading} error={error} onCreate={handleCreate} />
      ) : null}
    </div>
  );
}

export function OutreachReviewQueue({
  items,
  canReview = false,
}: {
  items: Array<
    OutreachDraft & {
      dealId: string;
      dealTitle: string;
      accountId: string;
      accountName: string;
    }
  >;
  canReview?: boolean;
}) {
  const { reviewingKey, error, handleReview } = useOutreachReviewQueue();

  if (items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-8 text-center">
        لا مسودات بانتظار المراجعة في هذه المنظمة.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <ul className="space-y-3">
        {items.map((item) => (
          <OutreachReviewItem
            key={`${item.dealId}:${item.id}`}
            item={item}
            canReview={canReview}
            reviewingKey={reviewingKey}
            onReview={handleReview}
          />
        ))}
      </ul>
    </div>
  );
}
