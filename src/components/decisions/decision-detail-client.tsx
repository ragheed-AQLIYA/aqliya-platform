"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DecisionTabs } from "./decision-tabs";
import { DecisionEvidence } from "./decision-evidence";
import { DecisionSectorIntelligencePanel } from "./decision-sector-intelligence-panel";
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

export function DecisionDetailClient({
  decision,
  decisionId,
  initialData,
}: DecisionDetailClientProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const { completionState, progressSummary, typeConfig } = initialData;

  const onTabChange = useCallback((tab: string) => {
    setActiveTab(tab);
  }, []);

  const intake = initialData.intake;
  const frameworkState = initialData.framework;
  const scenarioState = initialData.scenarios;
  const riskAnalysisState = initialData.riskAnalysis;
  const recommendationState = initialData.recommendation;

  const renderTabContent = () => {
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
            <SectionObjectives decision={decision} />
            <SectionConstraints decision={decision} />
            <SectionAssumptions decision={decision} />
            <SectionAlternatives decision={decision} />
            <SectionRisks decision={decision} />
            <SectionTenderProfile decision={decision} />
          </div>
        );

      case "intake":
        return <IntakeSection intake={intake} />;

      case "framework":
        return (
          <FrameworkSection
            intake={intake}
            frameworkState={frameworkState}
            decision={decision}
          />
        );

      case "scenarios":
        return (
          <ScenariosSection
            intake={intake}
            frameworkState={frameworkState}
            scenarioState={scenarioState}
            decision={decision}
          />
        );

      case "risks":
        return (
          <RisksSection
            intake={intake}
            frameworkState={frameworkState}
            scenarioState={scenarioState}
            riskAnalysisState={riskAnalysisState}
            decision={decision}
          />
        );

      case "recommendation":
        return (
          <RecommendationSection
            recommendationState={recommendationState}
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
  };

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

      <div className="mt-4">
        <DecisionSectorIntelligencePanel
          decisionId={decisionId}
          organizationId={decision.organizationId as string}
        />
      </div>

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

      <div className="mt-6">
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

        {renderTabContent()}
      </div>
    </main>
  );
}

function IntakeSection({
  intake,
}: {
  intake: ReturnType<typeof evaluateDecisionIntake>;
}) {
  return (
    <section className="rounded-lg border p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">أ-١٫٠ استلام القرار</h2>
        <Badge
          variant={
            intake.status === "accepted"
              ? "default"
              : intake.status === "rejected"
                ? "destructive"
                : "secondary"
          }
        >
          {intake.status.replace("_", " ")}
        </Badge>
      </div>
      <p className="text-sm text-muted-foreground">
        {intake.readyForFramework
          ? "جاهز للمتابعة إلى أ-١٫١ أطر القرار."
          : "غير جاهز لتحليل الإطار حتى حل مشكلات الاستلام."}
      </p>
      {intake.reasons.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-medium">الأسباب</h3>
          <ul className="mt-2 list-disc pl-5 text-sm">
            {intake.reasons.map((reason: string) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
        </div>
      )}
      {intake.requiredNextSteps.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-medium">الخطوات التالية المطلوبة</h3>
          <ul className="mt-2 list-disc pl-5 text-sm">
            {intake.requiredNextSteps.map((step: string) => (
              <li key={step}>{step}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

function FrameworkSection({
  intake,
  frameworkState,
  decision,
}: {
  intake: ReturnType<typeof evaluateDecisionIntake>;
  frameworkState: ReturnType<typeof evaluateDecisionFramework>;
  decision: Record<string, unknown>;
}) {
  return (
    <section className="rounded-lg border p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">أ-١٫١ إطار القرار</h2>
        {intake.status === "accepted" ? (
          <Badge
            variant={frameworkState.isComplete ? "default" : "secondary"}
          >
            {frameworkState.isComplete ? "مكتمل" : "غير مكتمل"}
          </Badge>
        ) : (
          <Badge variant="secondary">محظور</Badge>
        )}
      </div>
      {intake.status !== "accepted" ? (
        <p className="text-sm text-muted-foreground">
          لا يمكن متابعة الإطار قبل قبول الاستلام.
        </p>
      ) : decision.framework ? (
        <div className="grid gap-3 text-sm md:grid-cols-2">
          {[
            { key: "context", label: "السياق" },
            { key: "purpose", label: "الغرض" },
            { key: "options", label: "الخيارات" },
            { key: "criteria", label: "المعايير" },
            { key: "values", label: "القيم" },
            { key: "informationGaps", label: "فجوات المعلومات" },
            { key: "certainty", label: "درجة اليقين" },
            { key: "assumptions", label: "الافتراضات" },
          ].map((field) => (
            <div key={field.key}>
              <h3 className="font-medium">{field.label}</h3>
              <p className="mt-1 whitespace-pre-wrap text-muted-foreground">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {(decision.framework as Record<string, unknown>)[field.key] as string || "غير محدّد"}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          لم يبدأ إطار القرار بعد. افتح تبويب الإطار لتعريفه.
        </p>
      )}
    </section>
  );
}

function ScenariosSection({
  intake,
  frameworkState,
  scenarioState,
  decision,
}: {
  intake: ReturnType<typeof evaluateDecisionIntake>;
  frameworkState: ReturnType<typeof evaluateDecisionFramework>;
  scenarioState: ReturnType<typeof evaluateDecisionScenarios>;
  decision: Record<string, unknown>;
}) {
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

function RisksSection({
  intake,
  frameworkState,
  scenarioState,
  riskAnalysisState,
  decision,
}: {
  intake: ReturnType<typeof evaluateDecisionIntake>;
  frameworkState: ReturnType<typeof evaluateDecisionFramework>;
  scenarioState: ReturnType<typeof evaluateDecisionScenarios>;
  riskAnalysisState: ReturnType<typeof evaluateDecisionRiskAnalysis>;
  decision: Record<string, unknown>;
}) {
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
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {(decision.riskAnalyses as Array<{ id: string; risks: string; uncertaintyLevel: string; scenario?: { name: string } }>).map((analysis) => (
            <div key={analysis.id} className="rounded border p-3 text-sm">
              <h3 className="font-medium">
                {analysis.scenario?.name || "Scenario"}
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

function RecommendationSection({
  recommendationState,
  decision,
}: {
  recommendationState: ReturnType<typeof evaluateDecisionRecommendation>;
  decision: Record<string, unknown>;
}) {
  return (
    <section className="rounded-lg border p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">أ-١٫٤ التوصية</h2>
        {!recommendationState.isComplete ? (
          <Badge variant="secondary">محظور</Badge>
        ) : (
          <Badge variant="default">مكتمل</Badge>
        )}
      </div>
      {!recommendationState.isComplete ? (
        <p className="text-sm text-muted-foreground">
          التوصية محظورة حتى استيفاء جميع المتطلبات.
        </p>
      ) : decision.recommendation ? (
        <div className="space-y-3 text-sm">
          <div>
            <h3 className="font-medium">الإجراء الموصى به</h3>
            <p className="mt-1 whitespace-pre-wrap text-muted-foreground">
              {(decision.recommendation as { recommendedAction: string }).recommendedAction}
            </p>
          </div>
          <div>
            <h3 className="font-medium">المبرّر</h3>
            <p className="mt-1 whitespace-pre-wrap text-muted-foreground">
              {(decision.recommendation as { rationale: string }).rationale}
            </p>
          </div>
          <div>
            <h3 className="font-medium">الحالة التالية المتوقّعة</h3>
            <p className="mt-1 whitespace-pre-wrap text-muted-foreground">
              {(decision.recommendation as { expectedNextState: string }).expectedNextState}
            </p>
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          لم تبدأ التوصية بعد. افتح تبويب التوصية لتعريفها.
        </p>
      )}
    </section>
  );
}

function SectionObjectives({ decision }: { decision: Record<string, unknown> }) {
  const objectives = decision.objectives as Array<{ id: string; description: string }> | undefined | null;
  if (!objectives || objectives.length === 0) return null;
  return (
    <section>
      <h2 className="text-lg font-semibold mb-2">الأهداف</h2>
      <ul className="list-disc pl-5 text-sm">
        {objectives.map((obj) => (
          <li key={obj.id}>{obj.description}</li>
        ))}
      </ul>
    </section>
  );
}

function SectionConstraints({ decision }: { decision: Record<string, unknown> }) {
  const constraints = decision.constraints as Array<{ id: string; description: string }> | undefined | null;
  if (!constraints || constraints.length === 0) return null;
  return (
    <section>
      <h2 className="text-lg font-semibold mb-2">القيود</h2>
      <ul className="list-disc pl-5 text-sm">
        {constraints.map((con) => (
          <li key={con.id}>{con.description}</li>
        ))}
      </ul>
    </section>
  );
}

function SectionAssumptions({ decision }: { decision: Record<string, unknown> }) {
  const assumptions = decision.assumptions as Array<{ id: string; description: string }> | undefined | null;
  if (!assumptions || assumptions.length === 0) return null;
  return (
    <section>
      <h2 className="text-lg font-semibold mb-2">الافتراضات</h2>
      <ul className="list-disc pl-5 text-sm">
        {assumptions.map((ass) => (
          <li key={ass.id}>{ass.description}</li>
        ))}
      </ul>
    </section>
  );
}

function SectionAlternatives({ decision }: { decision: Record<string, unknown> }) {
  const alternatives = decision.alternatives as Array<{ id: string; description: string }> | undefined | null;
  if (!alternatives || alternatives.length === 0) return null;
  return (
    <section>
      <h2 className="text-lg font-semibold mb-2">البدائل</h2>
      <ul className="list-disc pl-5 text-sm">
        {alternatives.map((alt) => (
          <li key={alt.id}>{alt.description}</li>
        ))}
      </ul>
    </section>
  );
}

function SectionRisks({ decision }: { decision: Record<string, unknown> }) {
  const risks = decision.risks as Array<{ id: string; description: string; level: string }> | undefined | null;
  if (!risks || risks.length === 0) return null;
  return (
    <section>
      <h2 className="text-lg font-semibold mb-2">المخاطر</h2>
      <ul className="list-disc pl-5 text-sm">
        {risks.map((risk) => (
          <li key={risk.id}>
            {risk.description} -{" "}
            <span className="font-medium">{risk.level}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function SectionTenderProfile({ decision }: { decision: Record<string, unknown> }) {
  const tenderProfile = decision.tenderProfile as {
    clientName?: string;
    estimatedContractValue?: number;
    durationMonths?: number;
    marginEstimate?: number;
  } | undefined | null;
  if (!tenderProfile) return null;
  return (
    <section>
      <h2 className="text-lg font-semibold mb-2">ملف المنافسة</h2>
      <div className="text-sm grid grid-cols-2 gap-2">
        <div>
          <span className="text-muted-foreground">العميل:</span>{" "}
          {tenderProfile.clientName}
        </div>
        <div>
          <span className="text-muted-foreground">قيمة العقد:</span>{" "}
          {tenderProfile.estimatedContractValue?.toLocaleString()}{" "}
          ريال
        </div>
        <div>
          <span className="text-muted-foreground">المدة:</span>{" "}
          {tenderProfile.durationMonths} شهراً
        </div>
        <div>
          <span className="text-muted-foreground">الهامش:</span>{" "}
          {tenderProfile.marginEstimate}%
        </div>
      </div>
    </section>
  );
}
