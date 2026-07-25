"use client";

import type { AiGovernanceStats } from "@/actions/ai-governance-actions";
import { useAiGovernance } from "./use-ai-governance";
import { AiGovernanceHeader } from "./components/ai-governance-header";
import { AiGovernanceOverview } from "./components/ai-governance-overview";
import { AiGovernanceModelsSection } from "./components/ai-governance-models-section";
import { AiGovernanceActionsBreakdown } from "./components/ai-governance-actions-breakdown";
import { AiGovernanceEventsTable } from "./components/ai-governance-events-table";
import { AiGovernanceRules } from "./components/ai-governance-rules";

interface ModelStats {
  total: number;
  byStatus: Record<string, number>;
  byRiskLevel: Record<string, number>;
  byProvider: Record<string, number>;
  pendingReview: number;
  pendingApproval: number;
  activeDeployments: number;
}

interface Props {
  stats: AiGovernanceStats | null;
  error: string | null;
  modelStats?: ModelStats | null;
}

export function AiGovernanceClient({ stats, error, modelStats: modelStatsProp }: Props) {
  const { formatDate } = useAiGovernance(stats, error, modelStatsProp ?? null);

  return (
    <div className="space-y-6">
      <AiGovernanceHeader error={error} stats={stats} />

      {stats && (
        <>
          <AiGovernanceOverview stats={stats} />

          <AiGovernanceModelsSection stats={stats} modelStats={modelStatsProp ?? null} />

          <AiGovernanceActionsBreakdown stats={stats} />

          <AiGovernanceEventsTable stats={stats} formatDate={formatDate} />

          <AiGovernanceRules />
        </>
      )}
    </div>
  );
}
