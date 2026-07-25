"use client";

import { useDealFollowUpPanel } from "./components/use-deal-follow-up-panel";
import { FollowUpDraftListItem } from "./components/follow-up-draft-list-item";
import { FollowUpCreateForm } from "./components/follow-up-create-form";
import type { FollowUpDraft } from "@/lib/sales/agents/follow-up";

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
  const {
    loading,
    reviewingId,
    error,
    selectedInteractionId,
    setSelectedInteractionId,
    handleDraft,
    handleApprove,
    handleReject,
  } = useDealFollowUpPanel(dealId);

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
            <FollowUpDraftListItem
              key={draft.id}
              draft={draft}
              reviewingId={reviewingId}
              canReview={canReview}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          ))}
        </ul>
      )}

      <FollowUpCreateForm
        loading={loading}
        error={error}
        selectedInteractionId={selectedInteractionId}
        interactions={interactions}
        canCreate={canCreate}
        onSelectInteraction={setSelectedInteractionId}
        onDraft={handleDraft}
      />
    </div>
  );
}
