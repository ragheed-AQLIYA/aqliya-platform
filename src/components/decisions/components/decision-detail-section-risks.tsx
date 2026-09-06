"use client";

import { Badge } from "@/components/ui/badge";
import { evaluateDecisionIntake } from "@/lib/decision/intake";
import { evaluateDecisionFramework } from "@/lib/decision/framework";
import { evaluateDecisionScenarios } from "@/lib/decision/scenarios";
import { evaluateDecisionRiskAnalysis } from "@/lib/decision/risk-analysis";

type RisksSectionProps = {
  intake: ReturnType<typeof evaluateDecisionIntake>;
  frameworkState: ReturnType<typeof evaluateDecisionFramework>;
  scenarioState: ReturnType<typeof evaluateDecisionScenarios>;
  riskAnalysisState: ReturnType<typeof evaluateDecisionRiskAnalysis>;
  decision: Record<string, unknown>;
};

export function DecisionDetailSectionRisks({
  intake,
  frameworkState,
  scenarioState,
  riskAnalysisState,
  decision,
}: RisksSectionProps) {
  return (
    <section className="rounded-lg border p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">أ-١٫٣ المخاطر والمفاضلات</h2>
        {intake.status !== "accepted" ||
        !frameworkState.isComplete ||
        !scenarioState.isComplete ? (
          <Badge variant="secondary">محظور</Badge>
        ) : (
          <Badge
            variant={riskAnalysisState.isComplete ? "default" : "secondary"}
          >
            {riskAnalysisState.isComplete ? "مكتمل" : "غير مكتمل"}
          </Badge>
        )}
      </div>
      {intake.status !== "accepted" ? (
        <p className="text-sm text-muted-foreground">
          لا يمكن متابعة تحليل المخاطر قبل قبول الاستلام.
        </p>
      ) : !frameworkState.isComplete ? (
        <p className="text-sm text-muted-foreground">
          لا يمكن متابعة تحليل المخاطر قبل اكتمال الإطار.
        </p>
      ) : !scenarioState.isComplete ? (
        <p className="text-sm text-muted-foreground">
          لا يمكن متابعة تحليل المخاطر قبل وجود ثلاثة سيناريوهات مكتملة
          على الأقل.
        </p>
      ) : (decision.riskAnalyses as Array<unknown>) &&
        (decision.riskAnalyses as Array<unknown>).length > 0 ? (
        <div className="grid gap-3 md:grid-cols-3">
          {(decision.riskAnalyses as Array<{ id: string; risks: string; uncertaintyLevel: string; scenario?: { name: string } }>).map((analysis) => (
            <div key={analysis.id} className="rounded border p-3 text-sm">
              <h3 className="font-medium">
                {analysis.scenario?.name || "السيناريو"}
              </h3>
              <p className="mt-2 whitespace-pre-wrap text-muted-foreground">
                {analysis.risks}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                درجة عدم اليقين: {analysis.uncertaintyLevel}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          لم يبدأ تحليل المخاطر بعد. افتح تبويب المخاطر لتحليل المخاطر
          والمفاضلات لكل سيناريو.
        </p>
      )}
    </section>
  );
}
