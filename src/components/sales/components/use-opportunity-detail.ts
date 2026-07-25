import { useTransition } from "react";
import {
  submitOpportunityReviewAction,
  approveOpportunityAction,
  linkEvidenceAction,
  requestClaimReviewAction,
} from "@/actions/sales-actions";

export function useOpportunityDetail(opportunityId: string) {
  const [pending, startTransition] = useTransition();

  function handleSubmitReview() {
    startTransition(async () => {
      await submitOpportunityReviewAction(opportunityId);
      window.location.reload();
    });
  }

  function handleApprove() {
    startTransition(async () => {
      await approveOpportunityAction(opportunityId);
      window.location.reload();
    });
  }

  function handleLinkEvidence() {
    startTransition(async () => {
      await linkEvidenceAction(
        opportunityId,
        "qualification_note",
        "Qualification evidence — v1 seed",
      );
      window.location.reload();
    });
  }

  function handleAIReview() {
    startTransition(async () => {
      await requestClaimReviewAction(opportunityId);
      window.location.reload();
    });
  }

  return {
    pending,
    handleSubmitReview,
    handleApprove,
    handleLinkEvidence,
    handleAIReview,
  };
}
