"use client";

import { Badge } from "@/components/ui/badge";
import { evaluateDecisionIntake } from "@/lib/decision/intake";
import { evaluateDecisionFramework } from "@/lib/decision/framework";
import { evaluateDecisionScenarios } from "@/lib/decision/scenarios";

type ScenariosSectionProps = {
  intake: ReturnType<typeof evaluateDecisionIntake>;
  frameworkState: ReturnType<typeof evaluateDecisionFramework>;
  scenarioState: ReturnType<typeof evaluateDecisionScenarios>;
  decision: Record<string, unknown>;
};

export function DecisionDetailSectionScenarios({
  intake,
  frameworkState,
  scenarioState,
  decision,
}: ScenariosSectionProps) {
  return (
    <section className="rounded-lg border p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">أ-١٫٢ السيناريوهات والخيارات</h2>
        {intake.status !== "accepted" || !frameworkState.isComplete ? (
          <Badge variant="secondary">محظور</Badge>
        ) : (
          <Badge variant={scenarioState.isComplete ? "default" : "secondary"}>
            {scenarioState.isComplete ? "مكتمل" : "غير مكتمل"}
          </Badge>
        )}
      </div>
      {intake.status !== "accepted" ? (
        <p className="text-sm text-muted-foreground">
          لا يمكن متابعة السيناريوهات قبل قبول الاستلام.
        </p>
      ) : !frameworkState.isComplete ? (
        <p className="text-sm text-muted-foreground">
          لا يمكن متابعة السيناريوهات قبل اكتمال الإطار.
        </p>
      ) : (decision.decisionScenarios as Array<{ id: string; name: string; description: string }>) &&
        (decision.decisionScenarios as Array<unknown>).length > 0 ? (
        <div className="grid gap-3 md:grid-cols-3">
          {(decision.decisionScenarios as Array<{ id: string; name: string; description: string }>).map((scenario) => (
            <div key={scenario.id} className="rounded border p-3 text-sm">
              <h3 className="font-medium">{scenario.name}</h3>
              <p className="mt-2 whitespace-pre-wrap text-muted-foreground">
                {scenario.description}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          لم تبدأ السيناريوهات بعد. افتح تبويب السيناريوهات لتعريف الحالات
          الأساسية والإيجابية والسلبية.
        </p>
      )}
    </section>
  );
}
