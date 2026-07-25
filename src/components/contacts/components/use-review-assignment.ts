"use client";

import { useState } from "react";

import type { Review, Reviewer } from "./types";

interface UseReviewAssignmentProps {
  contactId: string;
  reviews: Review[];
  userRole: string;
}

export function useReviewAssignment({
  contactId,
  reviews,
  userRole,
}: UseReviewAssignmentProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [selectedReviewer, setSelectedReviewer] = useState("");
  const [reviewType, setReviewType] = useState("sensitivity");
  const [reason, setReason] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [completeReviewId, setCompleteReviewId] = useState("");

  async function handleAssign(
    reviewerId: string,
    type: string,
    assignReason: string | undefined,
    assignDueDate: string | undefined,
  ) {
    if (!reviewerId) return;
    setLoading("assign");
    try {
      const { assignReviewer } = await import("@/actions/contact-review-actions");
      await assignReviewer(contactId, reviewerId, type, assignReason, assignDueDate);
      window.location.reload();
    } finally {
      setLoading(null);
    }
  }

  async function handleComplete(reviewId: string, reviewNotes: string | undefined) {
    setLoading(`complete-${reviewId}`);
    try {
      const { completeReview } = await import("@/actions/contact-review-actions");
      await completeReview(reviewId, reviewNotes);
      window.location.reload();
    } finally {
      setLoading(null);
    }
  }

  const canManage = userRole === "ADMIN" || userRole === "OPERATOR";
  const pendingReviews = reviews.filter((r) => r.status === "pending");

  return {
    loading,
    selectedReviewer, setSelectedReviewer,
    reviewType, setReviewType,
    reason, setReason,
    dueDate, setDueDate,
    notes, setNotes,
    completeReviewId, setCompleteReviewId,
    handleAssign,
    handleComplete,
    canManage,
    pendingReviews,
  };
}
