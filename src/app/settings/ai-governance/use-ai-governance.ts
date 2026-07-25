"use client";

import type { AiGovernanceStats } from "@/actions/ai-governance-actions";
import { useMemo } from "react";

interface ModelStats {
  total: number;
  byStatus: Record<string, number>;
  byRiskLevel: Record<string, number>;
  byProvider: Record<string, number>;
  pendingReview: number;
  pendingApproval: number;
  activeDeployments: number;
}

export function useAiGovernance(
  stats: AiGovernanceStats | null,
  error: string | null,
  modelStats: ModelStats | null
) {
  const formatDate = useMemo(
    () => (iso: string) => {
      try {
        return new Date(iso).toLocaleString("ar-SA");
      } catch {
        return iso;
      }
    },
    []
  );

  return {
    stats,
    error,
    modelStats,
    formatDate,
  };
}
