"use client";

import { Button } from "@/components/ui/button";
import { DecisionTabs } from "./decision-tabs";
import { DecisionEvidence } from "./decision-evidence";
import { useDecisionDetail } from "./components/use-decision-detail";
import { DecisionDetailSectionIntake } from "./components/decision-detail-section-intake";
import { DecisionDetailSectionFramework } from "./components/decision-detail-section-framework";
import { DecisionDetailSectionScenarios } from "./components/decision-detail-section-scenarios";
import { DecisionDetailSectionRisks } from "./components/decision-detail-section-risks";
import { DecisionDetailSectionRecommendation } from "./components/decision-detail-section-recommendation";
import {
  OverviewSectionObjectives,
  OverviewSectionConstraints,
  OverviewSectionAssumptions,
  OverviewSectionAlternatives,
  OverviewSectionRisks as OverviewSectionRisksSections,
  OverviewSectionTenderProfile,
} from "./components/decision-detail-overview-sections";
import type { evaluateDecisionIntake } from "@/lib/decision/intake";
import type { evaluateDecisionFramework } from "@/lib/decision/framework";
import type { evaluateDecisionScenarios } from "@/lib/decision/scenarios";
import type { evaluateDecisionRiskAnalysis } from "@/lib/decision/risk-analysis";
import type { evaluateDecisionRecommendation } from "@/lib/decision/recommendation";
import type {
  getDecisionCompletionState,
  getDecisionProgressSummary,
} from "@/lib/decision/decision-engine";
import type { getDecisionTypeConfig } from "@/lib/decision/decision-type-config";

type DecisionDetailClientProps = {
  decision: Record<string, unknown>;
  decisionId: string;
  initialData: {
    intake: ReturnType<typeof evaluateDecisionIntake>;
    framework: ReturnType<typeof evaluateDecisionFramework>;
    scenarios: ReturnType<typeof evaluateDecisionScenarios>;
    riskAnalysis: ReturnType<typeof evaluateDecisionRiskAnalysis>;
    recommendation: ReturnType<typeof evaluateDecisionRecommendation>;
    completionState: ReturnType<typeof getDecisionCompletionState>;
    progressSummary: ReturnType<typeof getDecisionProgressSummary>;
    typeConfig: ReturnType<typeof getDecisionTypeConfig>;
  };
};

function TabContent({
  activeTab,
  decision,
  decisionId,
  initialData,
}: DecisionDetailClientProps & { activeTab: string }) {
  switch (activeTab) {
    case "overview":
      return (
        <div className="space-y-4">
          {decision.description ? (
            <section className="rounded-lg border p-4">
              <h2 className="text-sm font-semibold mb-2">الوصف</h2>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {decision.description as string}
              </p>
            </section>
          ) : null}
          <DecisionEvidence decisionId={decisionId} />
          <OverviewSectionObjectives decision={decision} />
          <OverviewSectionConstraints decision={decision} />
          <OverviewSectionAssumptions decision={decision} />
          <OverviewSectionAlternatives decision={decision} />
          <OverviewSectionRisksSections decision={decision} />
          <OverviewSectionTenderProfile decision={decision} />
        </div>
      );
    case "intake":
      return <DecisionDetailSectionIntake intake={initialData.intake} />;
    case "framework":
      return (
        <DecisionDetailSectionFramework
          intake={initialData.intake}
          frameworkState={initialData.framework}
          decision={decision}
        />
      );
    case "scenarios":
      return (
        <DecisionDetailSectionScenarios
          intake={initialData.intake}
          frameworkState={initialData.framework}
          scenarioState={initialData.scenarios}
          decision={decision}
        />
      );
    case "risks":
      return (
        <DecisionDetailSectionRisks
          intake={initialData.intake}
          frameworkState={initialData.framework}
          scenarioState={initialData.scenarios}
          riskAnalysisState={initialData.riskAnalysis}
          decision={decision}
        />
      );
    case "recommendation":
      return (
        <DecisionDetailSectionRecommendation
          recommendationState={initialData.recommendation}
          decision={decision}
        />
      );
    default:
      return (
        <div className="rounded-lg border p-8 text-center">
          <p className="text-sm text-muted-foreground">
            اضغط على التبويب لعرض المحتوى
          </p>
        </div>
      );
  }
}

function ProgressBar({
  completionState,
  progressSummary,
}: {
  completionState: ReturnType<typeof getDecisionCompletionState>;
  progressSummary: ReturnType<typeof getDecisionProgressSummary>;
}) {
  return (
    <div className="mt-4 mb-6">
      <div className="flex items-center justify-between text-sm mb-2">
        <span className="text-muted-foreground">
          التقدّم: {progressSummary.completed}/{progressSummary.total} مرحلة
        </span>
        <span className="font-medium">{progressSummary.percentage}%</span>
      </div>
      <div className="w-full bg-muted rounded-full h-2">
        <div
          className="bg-primary h-2 rounded-full transition-all"
          style={{ width: `${progressSummary.percentage}%` }}
        />
      </div>
      {completionState.nextStep && (
        <p className="text-xs text-muted-foreground mt-1">
          التالي: {completionState.nextStep.label} —{" "}
          {completionState.nextStep.description}
        </p>
      )}
    </div>
  );
}

function MetadataGrid({ decision }: { decision: Record<string, unknown> }) {
  return (
    <div className="grid grid-cols-2 gap-4 text-sm mb-6">
      <div>
        <span className="text-muted-foreground">الحالة:</span>{" "}
        {decision.status as string}
      </div>
      <div>
        <span className="text-muted-foreground">المالك:</span>{" "}
        {(decision.owner as { name?: string })?.name || "غير معيّن"}
      </div>
      <div>
        <span className="text-muted-foreground">النوع:</span>{" "}
        {(decision.type as string) || "N/A"}
      </div>
      <div>
        <span className="text-muted-foreground">المؤسسة:</span>{" "}
        {(decision.organization as { name?: string })?.name || "N/A"}
      </div>
      {decision.priority ? (
        <div>
          <span className="text-muted-foreground">الأولوية:</span>{" "}
          {decision.priority as string}
        </div>
      ) : null}
      {decision.targetDate ? (
        <div>
          <span className="text-muted-foreground">التاريخ المستهدف:</span>{" "}
          {new Date(decision.targetDate as string).toLocaleDateString()}
        </div>
      ) : null}
    </div>
  );
}

export function DecisionDetailClient({
  decision,
  decisionId,
  initialData,
}: DecisionDetailClientProps) {
  const { activeTab, onTabChange } = useDecisionDetail();
  const { completionState, progressSummary, typeConfig } = initialData;

  return (
    <main className="p-8">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="sm" onClick={() => window.location.href = "/decisions"}>
          رجوع
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{decision.title as string}</h1>
          <p className="text-sm text-muted-foreground">
            {typeConfig.description}
          </p>
        </div>
      </div>

      <DecisionTabs
        decisionId={decisionId}
        decisionType={decision.type as string}
        activeTab={activeTab}
        onTabChange={onTabChange}
      />

      <ProgressBar
        completionState={completionState}
        progressSummary={progressSummary}
      />

      <div className="mt-6">
        <MetadataGrid decision={decision} />
        <TabContent
          activeTab={activeTab}
          decision={decision}
          decisionId={decisionId}
          initialData={initialData}
        />
      </div>
    </main>
  );
}
