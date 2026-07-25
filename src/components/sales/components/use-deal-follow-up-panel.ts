"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  draftFollowUpAction,
  approveFollowUpDraftAction,
  rejectFollowUpDraftAction,
} from "@/actions/sales-actions";
import { formatActionError } from "./follow-up-constants";

export function useDealFollowUpPanel(dealId: string) {
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

  return {
    loading,
    reviewingId,
    error,
    selectedInteractionId,
    setSelectedInteractionId,
    handleDraft,
    handleApprove,
    handleReject,
  };
}
