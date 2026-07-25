"use client";

import { useCallback, useState } from "react";

export function useAiAdvisorOverview(
  onReviewFlag: (id: string, decision: "confirmed" | "rejected", notes: string) => Promise<unknown>,
  onReviewSuggestion: (id: string, decision: "approved" | "rejected", notes: string) => Promise<unknown>,
) {
  const [reviewing, setReviewing] = useState<string | null>(null);

  const handleReviewFlag = useCallback(
    async (id: string, decision: "confirmed" | "rejected") => {
      setReviewing(id);
      try {
        await onReviewFlag(id, decision, "");
      } finally {
        setReviewing(null);
      }
    },
    [onReviewFlag],
  );

  const handleReviewSuggestion = useCallback(
    async (id: string, decision: "approved" | "rejected") => {
      setReviewing(id);
      try {
        await onReviewSuggestion(id, decision, "");
      } finally {
        setReviewing(null);
      }
    },
    [onReviewSuggestion],
  );

  return { isReviewing: reviewing !== null, reviewing, handleReviewFlag, handleReviewSuggestion };
}
