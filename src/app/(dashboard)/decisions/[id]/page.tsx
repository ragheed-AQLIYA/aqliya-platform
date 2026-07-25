import { DecisionDetailClient } from "@/components/decisions/decision-detail-client";
import { DecisionSectorIntelligencePanel } from "@/components/decisions/decision-sector-intelligence-panel";
import { RecentActivity } from "@/components/decisions/components/recent-activity";
import { getDecisionById } from "@/actions/decisions";
import { evaluateDecisionIntake } from "@/lib/decision/intake";
import { evaluateDecisionFramework } from "@/lib/decision/framework";
import { evaluateDecisionScenarios } from "@/lib/decision/scenarios";
import { evaluateDecisionRiskAnalysis } from "@/lib/decision/risk-analysis";
import { evaluateDecisionRecommendation } from "@/lib/decision/recommendation";
import {
  getDecisionCompletionState,
  getDecisionProgressSummary,
} from "@/lib/decision/decision-engine";
import { getDecisionTypeConfig } from "@/lib/decision/decision-type-config";

export default async function DecisionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getDecisionById(id);
  const decision = result.success ? result.data : null;

  if (!decision) {
    return (
      <main className="p-8">
        <div className="flex items-center gap-4 mb-6">
          <a href="/decisions" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 rounded-md px-3">
            رجوع
          </a>
          <h1 className="text-2xl font-bold">القرار غير موجود</h1>
        </div>
      </main>
    );
  }

  const intake = evaluateDecisionIntake({
    title: decision.title,
    objectives: decision.objectives,
    alternatives: decision.alternatives,
    risks: decision.risks,
  });

  const frameworkState = evaluateDecisionFramework(decision.framework);
  const scenarioState = evaluateDecisionScenarios(decision.decisionScenarios);
  const riskAnalysisState = evaluateDecisionRiskAnalysis(
    decision.decisionScenarios,
    decision.riskAnalyses,
  );
  const recommendationState = evaluateDecisionRecommendation(
    decision.recommendation,
  );

  const completionState = getDecisionCompletionState(
    decision as Parameters<typeof getDecisionCompletionState>[0],
  );
  const progressSummary = getDecisionProgressSummary(
    decision as Parameters<typeof getDecisionProgressSummary>[0],
  );
  const typeConfig = getDecisionTypeConfig(decision.type);

  return (
    <>
      <DecisionDetailClient
        decision={decision as unknown as Record<string, unknown>}
        decisionId={id}
        initialData={{
          intake,
          framework: frameworkState,
          scenarios: scenarioState,
          riskAnalysis: riskAnalysisState,
          recommendation: recommendationState,
          completionState,
          progressSummary,
          typeConfig,
        }}
      />
      <div className="p-8 pt-0">
        <RecentActivity decisionId={id} />
      </div>
      <DecisionSectorIntelligencePanel
        decisionId={id}
        organizationId={decision.organizationId}
      />
    </>
  );
}
