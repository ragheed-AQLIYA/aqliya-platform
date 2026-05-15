"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DecisionTabs } from "@/components/decisions/decision-tabs";
import {
  DecisionProgress,
  buildStageStatus,
} from "@/components/decisions/decision-progress";
import {
  getDecisionRiskAnalysis,
  updateDecisionRiskAnalysis,
  getWorkflowReadiness,
} from "@/actions/decisions";
import { getDecisionTypeConfig } from "@/lib/decision-type-config";
import type {
  DecisionFrameworkState,
  DecisionIntake,
  DecisionRiskAnalysisState,
  DecisionScenariosState,
} from "@/lib/types/decision";

type ScenarioRef = {
  id: string;
  name: string;
};

type RiskAnalysisForm = {
  id?: string;
  scenarioId: string;
  risks: string;
  tradeoffs: string;
  sacrifices: string;
  opportunityCosts: string;
  stakeholderRisks: string;
  operationalRisks: string;
  strategicRisks: string;
  knowledgeRisks: string;
  uncertaintyLevel: string;
};

function getIntakeVariant(status?: string) {
  if (status === "accepted") return "default" as const;
  if (status === "rejected") return "destructive" as const;
  return "secondary" as const;
}

export default function DecisionRisksPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [id, setId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [intake, setIntake] = useState<DecisionIntake | null>(null);
  const [frameworkState, setFrameworkState] =
    useState<DecisionFrameworkState | null>(null);
  const [scenarioState, setScenarioState] =
    useState<DecisionScenariosState | null>(null);
  const [riskAnalysisState, setRiskAnalysisState] =
    useState<DecisionRiskAnalysisState | null>(null);
  const [decisionType, setDecisionType] = useState<string>("CUSTOM");
  const [readiness, setReadiness] = useState<any>(null);
  const [scenarios, setScenarios] = useState<ScenarioRef[]>([]);
  const [analyses, setAnalyses] = useState<RiskAnalysisForm[]>([]);

  useEffect(() => {
    async function resolveParams() {
      const { id: decisionId } = await params;
      setId(decisionId);
    }
    resolveParams();
  }, [params]);

  useEffect(() => {
    if (!id) return;
    const decisionId: string = id;

    async function loadData() {
      const [risksResult, readinessResult] = await Promise.all([
        getDecisionRiskAnalysis(decisionId),
        getWorkflowReadiness(decisionId),
      ]);

      if (risksResult.success && risksResult.data) {
        setIntake(risksResult.data.intake);
        setFrameworkState(risksResult.data.frameworkState);
        setScenarioState(risksResult.data.scenarioState);
        setRiskAnalysisState(risksResult.data.riskAnalysisState);
        setDecisionType(risksResult.data.type || "CUSTOM");
        setScenarios(risksResult.data.decisionScenarios);
        setAnalyses(risksResult.data.analysisDrafts);
      } else {
        setError(risksResult.error || "فشل في تحميل تحليل المخاطر");
      }

      if (readinessResult.success && readinessResult.data) {
        setReadiness(readinessResult.data);
      }

      setLoading(false);
    }

    loadData();
  }, [id]);

  function handleAnalysisChange(
    index: number,
    field: keyof RiskAnalysisForm,
    value: string,
  ) {
    setAnalyses((current) =>
      current.map((analysis, currentIndex) =>
        currentIndex === index ? { ...analysis, [field]: value } : analysis,
      ),
    );
    if (success) setSuccess(false);
    if (error) setError(null);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (
      !id ||
      intake?.status !== "accepted" ||
      !frameworkState?.isComplete ||
      !scenarioState?.isComplete
    )
      return;

    setSaving(true);
    setError(null);
    setSuccess(false);

    const result = await updateDecisionRiskAnalysis(id, { analyses });

    if (result.success && result.data) {
      setAnalyses(result.data.riskAnalyses);
      setRiskAnalysisState(result.data.riskAnalysisState);
      setSuccess(true);
      const readinessResult = await getWorkflowReadiness(id);
      if (readinessResult.success && readinessResult.data) {
        setReadiness(readinessResult.data);
      }
      setTimeout(() => setSuccess(false), 3000);
    } else {
      setError(result.error || "فشل في حفظ تحليل المخاطر");
    }

    setSaving(false);
  }

  if (loading || !id) {
    return (
      <div>
        <DecisionTabs decisionId={id || ""} />
        <div className="mt-6 text-center">جارٍ التحميل...</div>
      </div>
    );
  }

  const intakeBlocked = intake?.status !== "accepted";
  const frameworkBlocked = !intakeBlocked && !frameworkState?.isComplete;
  const scenariosBlocked =
    !intakeBlocked &&
    !frameworkBlocked &&
    (!scenarioState?.isComplete || scenarios.length < 3);
  const blocked = intakeBlocked || frameworkBlocked || scenariosBlocked;
  const config = getDecisionTypeConfig(decisionType);
  const stages = readiness
    ? buildStageStatus("risks", {
        intakeAccepted: readiness.intakeAccepted,
        frameworkComplete: readiness.frameworkComplete,
        scenariosComplete: readiness.scenariosComplete,
        risksComplete: readiness.risksComplete,
        simulationReady: readiness.simulationReady,
        recommendationReady: readiness.recommendationReady,
      })
    : [];

  return (
    <div>
      <DecisionTabs decisionId={id} decisionType={decisionType} />
      <div className="mx-auto mt-6 max-w-4xl">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-black">أ-١٫٣ المخاطر والمفاضلات</h2>
            <p className="text-sm leading-7 text-muted-foreground">
              {config.riskGuidance}
            </p>
          </div>
          {riskAnalysisState && !blocked && (
            <Badge
              variant={riskAnalysisState.isComplete ? "default" : "secondary"}
            >
              {riskAnalysisState.isComplete ? "مكتمل" : "غير مكتمل"}
            </Badge>
          )}
        </div>

        {readiness && (
          <div className="mb-6">
            <DecisionProgress
              stages={stages}
              decisionType={decisionType}
              missingInputs={readiness.missingInputs}
              dataQuality={readiness.dataQuality}
            />
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-2xl bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 rounded-2xl bg-green-50 p-3 text-sm text-green-600">
            تم حفظ تحليل المخاطر. وهذا يرفع جاهزية المحاكاة والتوصية.
          </div>
        )}

        {blocked ? (
          <section className="rounded-[24px] border border-border/70 p-4 shadow-sm">
            <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="font-bold">تحليل المخاطر محظور</h3>
              {intakeBlocked ? (
                <Badge variant={getIntakeVariant(intake?.status)}>
                  {intake?.status.replace("_", " ") || "الاستلام مفقود"}
                </Badge>
              ) : frameworkBlocked ? (
                <Badge variant="secondary">الإطار غير مكتمل</Badge>
              ) : (
                <Badge variant="secondary">السيناريوهات غير مكتملة</Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {intakeBlocked
                ? "أ-١٫٣ لا يمكن المتابعة قبل قبول أ-١٫٠ الاستلام."
                : frameworkBlocked
                  ? "أ-١٫٣ لا يمكن المتابعة قبل اكتمال أ-١٫١ الإطار."
                  : "أ-١٫٣ لا يمكن المتابعة قبل وجود ثلاثة سيناريوهات مكتملة على الأقل."}
            </p>
            <ul className="mt-4 list-disc pl-5 text-sm">
              {(intakeBlocked
                ? intake?.requiredNextSteps
                : frameworkBlocked
                  ? frameworkState?.nextSteps
                  : scenarioState?.nextSteps
              )?.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ul>
          </section>
        ) : (
          <>
            {riskAnalysisState && !riskAnalysisState.isComplete && (
              <section className="mb-6 rounded-[24px] border border-border/70 p-4 shadow-sm">
                <h3 className="text-sm font-bold">الخطوات التالية المطلوبة</h3>
                <ul className="mt-2 list-disc pl-5 text-sm">
                  {riskAnalysisState.nextSteps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ul>
              </section>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {analyses.map((analysis, index) => {
                const scenario = scenarios.find(
                  (item) => item.id === analysis.scenarioId,
                );

                return (
                  <section
                    key={analysis.scenarioId || index}
                    className="rounded-[24px] border border-border/70 p-4 shadow-sm"
                  >
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <h3 className="font-bold">
                        {scenario?.name || `السيناريو ${index + 1}`}
                      </h3>
                      <Badge variant="outline">تحليل فقط</Badge>
                    </div>
                    <input type="hidden" value={analysis.scenarioId} readOnly />
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor={`risks-${index}`}>المخاطر *</Label>
                        <Textarea
                          id={`risks-${index}`}
                          value={analysis.risks}
                          onChange={(event) =>
                            handleAnalysisChange(
                              index,
                              "risks",
                              event.target.value,
                            )
                          }
                          placeholder="مخاطر خاصة بهذا السيناريو فقط"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`tradeoffs-${index}`}>
                          المفاضلات *
                        </Label>
                        <Textarea
                          id={`tradeoffs-${index}`}
                          value={analysis.tradeoffs}
                          onChange={(event) =>
                            handleAnalysisChange(
                              index,
                              "tradeoffs",
                              event.target.value,
                            )
                          }
                          placeholder="المفاضلات الناتجة عن هذا السيناريو"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`sacrifices-${index}`}>
                          التنازلات *
                        </Label>
                        <Textarea
                          id={`sacrifices-${index}`}
                          value={analysis.sacrifices}
                          onChange={(event) =>
                            handleAnalysisChange(
                              index,
                              "sacrifices",
                              event.target.value,
                            )
                          }
                          placeholder="ما يجب التخلي عنه أو تقييده"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`opportunityCosts-${index}`}>
                          تكاليف الفرصة *
                        </Label>
                        <Textarea
                          id={`opportunityCosts-${index}`}
                          value={analysis.opportunityCosts}
                          onChange={(event) =>
                            handleAnalysisChange(
                              index,
                              "opportunityCosts",
                              event.target.value,
                            )
                          }
                          placeholder="الخيارات أو الوقت أو رأس المال أو التركيز المفوّت"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`stakeholderRisks-${index}`}>
                          مخاطر أصحاب المصلحة *
                        </Label>
                        <Textarea
                          id={`stakeholderRisks-${index}`}
                          value={analysis.stakeholderRisks}
                          onChange={(event) =>
                            handleAnalysisChange(
                              index,
                              "stakeholderRisks",
                              event.target.value,
                            )
                          }
                          placeholder="تعرض أصحاب المصلحة أو الاحتكاك"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`operationalRisks-${index}`}>
                          المخاطر التشغيلية *
                        </Label>
                        <Textarea
                          id={`operationalRisks-${index}`}
                          value={analysis.operationalRisks}
                          onChange={(event) =>
                            handleAnalysisChange(
                              index,
                              "operationalRisks",
                              event.target.value,
                            )
                          }
                          placeholder="مخاطر التنفيذ والقدرة والعملية والتسليم"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`strategicRisks-${index}`}>
                          المخاطر الاستراتيجية *
                        </Label>
                        <Textarea
                          id={`strategicRisks-${index}`}
                          value={analysis.strategicRisks}
                          onChange={(event) =>
                            handleAnalysisChange(
                              index,
                              "strategicRisks",
                              event.target.value,
                            )
                          }
                          placeholder="الملاءمة الاستراتيجية أو التمركز أو الآثار طويلة المدى"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`knowledgeRisks-${index}`}>
                          مخاطر المعرفة *
                        </Label>
                        <Textarea
                          id={`knowledgeRisks-${index}`}
                          value={analysis.knowledgeRisks}
                          onChange={(event) =>
                            handleAnalysisChange(
                              index,
                              "knowledgeRisks",
                              event.target.value,
                            )
                          }
                          placeholder="المجهولات أو الأدلة الضعيفة أو المعلومات المفقودة"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`uncertaintyLevel-${index}`}>
                          مستوى عدم اليقين *
                        </Label>
                        <Input
                          id={`uncertaintyLevel-${index}`}
                          value={analysis.uncertaintyLevel}
                          onChange={(event) =>
                            handleAnalysisChange(
                              index,
                              "uncertaintyLevel",
                              event.target.value,
                            )
                          }
                          placeholder="عالٍ، متوسط، منخفض، أو شرح"
                        />
                      </div>
                    </div>
                  </section>
                );
              })}
              <Button type="submit" disabled={saving}>
                {saving ? "جارٍ الحفظ..." : "حفظ تحليل المخاطر"}
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
