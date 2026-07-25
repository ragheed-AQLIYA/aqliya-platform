"use client";

import { useState, useCallback } from "react";
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import {
  approveCandidate,
  rejectCandidate,
  promoteCandidate,
  submitCandidateForReview,
} from "@/actions/knowledge-mining-actions";
import type { KnowledgeCandidateDTO, KnowledgeCandidateStatus } from "@/lib/tb-intelligence/knowledge-mining/types";

export type ReviewAction = "approve" | "reject" | "promote" | "submit";

export const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  CANDIDATE: {
    label: "مرشّح",
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  },
  UNDER_REVIEW: {
    label: "قيد المراجعة",
    color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  },
  APPROVED: {
    label: "معتمد",
    color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  },
  REJECTED: {
    label: "مرفوض",
    color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  },
  PROMOTED: {
    label: "مُرقّى",
    color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  },
};

export function useCandidateDetail(candidate: KnowledgeCandidateDTO, router: AppRouterInstance) {
  const [busy, setBusy] = useState(false);
  const [lastAction, setLastAction] = useState<ReviewAction | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [liveStatus, setLiveStatus] = useState<KnowledgeCandidateStatus>(candidate.status);
  const [liveNotes, setLiveNotes] = useState(candidate.reviewNotes ?? "");

  const statusCfg = STATUS_CONFIG[liveStatus] ?? {
    label: liveStatus,
    color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
  };

  const handleReview = useCallback(
    async (action: ReviewAction, notes?: string) => {
      setBusy(true);
      setLastAction(action);
      setActionError(null);

      try {
        let result;
        switch (action) {
          case "approve":
            result = await approveCandidate(candidate.id, notes);
            break;
          case "reject":
            result = await rejectCandidate(candidate.id, notes);
            break;
          case "promote":
            result = await promoteCandidate(candidate.id, "candidate-synonyms", notes);
            break;
          case "submit":
            result = await submitCandidateForReview(candidate.id);
            break;
        }

        if (result && "success" in result && result.success) {
          if (action === "promote") {
            setLiveStatus("PROMOTED");
          } else if ("newStatus" in result) {
            setLiveStatus(result.newStatus as KnowledgeCandidateStatus);
          }
          if (notes !== undefined) setLiveNotes(notes);
          router.refresh();
        } else {
          setActionError(
            (result && "error" in result ? result.error : "فشلت العملية") ?? "فشلت العملية",
          );
        }
      } catch (err) {
        setActionError(String(err));
      } finally {
        setBusy(false);
      }
    },
    [candidate.id, router],
  );

  return {
    busy,
    lastAction,
    actionError,
    liveStatus,
    liveNotes,
    statusCfg,
    handleReview,
    setActionError,
  };
}
