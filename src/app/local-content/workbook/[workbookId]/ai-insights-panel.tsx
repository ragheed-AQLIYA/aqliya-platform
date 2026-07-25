"use client";

import { useAiInsights } from "./components/use-ai-insights";
import { HealthBanner } from "./components/health-banner";
import { ActionMessage } from "./components/action-message";
import { ReviewStatusCard } from "./components/review-status-card";
import { RecommendationsCard } from "./components/recommendations-card";
import { SimulationCard } from "./components/simulation-card";
import type { TbLine } from "@/lib/local-content/workbook/types";

interface Props {
  organizationId: string;
  workbookId: string;
  projectId?: string;
  tbLines?: TbLine[];
}

export function AiInsightsPanel({
  organizationId,
  workbookId,
  tbLines,
}: Props) {
  const {
    health,
    reviewStatus,
    recommendations,
    simulationResult,
    actionMsg,
    isLoading,
    showSimulation,
    supplierIncrease,
    setSupplierIncrease,
    handleRunReview,
    handleGenerateRecommendations,
    handleRunSimulation,
    setShowSimulation,
  } = useAiInsights(organizationId, workbookId, tbLines);

  return (
    <div className="space-y-4">
      <HealthBanner health={health} />
      <ActionMessage message={actionMsg} />
      <ReviewStatusCard
        reviewStatus={reviewStatus}
        isLoading={isLoading}
        onRunReview={handleRunReview}
      />
      <RecommendationsCard
        recommendations={recommendations}
        isLoading={isLoading}
        onGenerate={handleGenerateRecommendations}
      />
      <SimulationCard
        simulationResult={simulationResult}
        showSimulation={showSimulation}
        isLoading={isLoading}
        supplierIncrease={supplierIncrease}
        onSupplierIncreaseChange={setSupplierIncrease}
        onRunSimulation={handleRunSimulation}
        onToggleSimulation={() => setShowSimulation(!showSimulation)}
      />
    </div>
  );
}
