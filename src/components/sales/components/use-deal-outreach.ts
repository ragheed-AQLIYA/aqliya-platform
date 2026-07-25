"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  createOutreachDraftAction,
  submitOutreachDraftAction,
  reviewOutreachDraftAction,
} from "@/actions/sales-actions";

export const STATUS_LABELS: Record<string, string> = {
  draft: "مسودة",
  pending_review: "بانتظار المراجعة",
  approved: "معتمد",
  rejected: "مرفوض",
};

export const STATUS_COLORS: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  pending_review:
    "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  approved:
    "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

export function formatActionError(error: string, code?: string): string {
  if (code === "FORBIDDEN" || error === "Access denied") {
    return "لا تملك صلاحية تنفيذ هذا الإجراء";
  }
  if (code === "VALIDATION") {
    return error.replace(/^SalesOS validation:\s*/i, "");
  }
  return error || "تعذر تنفيذ الإجراء";
}

export function useDealOutreachPanel(dealId: string) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate(formData: FormData) {
    setLoading(true);
    setError(null);
    try {
      const res = await createOutreachDraftAction(dealId, formData);
      if (res.ok) {
        router.refresh();
      } else {
        setError(formatActionError(res.error, res.code));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "تعذر إنشاء المسودة");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(draftId: string) {
    setSubmittingId(draftId);
    setError(null);
    try {
      const res = await submitOutreachDraftAction(dealId, draftId);
      if (res.ok) {
        router.refresh();
      } else {
        setError(formatActionError(res.error, res.code));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "تعذر إرسال للمراجعة");
    } finally {
      setSubmittingId(null);
    }
  }

  async function handleReview(
    draftId: string,
    decision: "approved" | "rejected",
  ) {
    setReviewingId(draftId);
    setError(null);
    try {
      const res = await reviewOutreachDraftAction(dealId, draftId, decision);
      if (res.ok) {
        router.refresh();
      } else {
        setError(formatActionError(res.error, res.code));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "تعذر تسجيل المراجعة");
    } finally {
      setReviewingId(null);
    }
  }

  return {
    loading,
    submittingId,
    reviewingId,
    error,
    handleCreate,
    handleSubmit,
    handleReview,
  };
}

export function useOutreachReviewQueue() {
  const router = useRouter();
  const [reviewingKey, setReviewingKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleReview(
    dealId: string,
    draftId: string,
    decision: "approved" | "rejected",
  ) {
    const key = `${dealId}:${draftId}`;
    setReviewingKey(key);
    setError(null);
    try {
      const res = await reviewOutreachDraftAction(dealId, draftId, decision);
      if (res.ok) {
        router.refresh();
      } else {
        setError(formatActionError(res.error, res.code));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "تعذر تسجيل المراجعة");
    } finally {
      setReviewingKey(null);
    }
  }

  return { reviewingKey, error, handleReview };
}
