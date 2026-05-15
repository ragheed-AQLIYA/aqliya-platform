import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DecisionTabs } from "@/components/decisions/decision-tabs"
import { getDecisionById } from "@/actions/decisions"
import { evaluateDecisionIntake } from "@/lib/decision/intake"
import { evaluateDecisionFramework } from "@/lib/decision/framework"
import { evaluateDecisionScenarios } from "@/lib/decision/scenarios"
import { evaluateDecisionRiskAnalysis } from "@/lib/decision/risk-analysis"
import { evaluateDecisionRecommendation } from "@/lib/decision/recommendation"
import { getDecisionCompletionState, getDecisionProgressSummary } from "@/lib/decision/decision-engine"
import { getDecisionTypeConfig } from "@/lib/decision/decision-type-config"

export default async function DecisionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const result = await getDecisionById(id)
  const decision = result.success ? result.data : null

  if (!decision) {
    return (
      <main className="p-8">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/decisions">
            <Button variant="outline" size="sm">رجوع</Button>
          </Link>
          <h1 className="text-2xl font-bold">القرار غير موجود</h1>
        </div>
      </main>
    )
  }

  const intake = evaluateDecisionIntake({
    title: decision.title,
    objectives: decision.objectives,
    alternatives: decision.alternatives,
    risks: decision.risks,
  })

  const frameworkState = evaluateDecisionFramework(decision.framework)
  const scenarioState = evaluateDecisionScenarios(decision.decisionScenarios)
  const riskAnalysisState = evaluateDecisionRiskAnalysis(
    decision.decisionScenarios,
    decision.riskAnalyses
  )
  const recommendationState = evaluateDecisionRecommendation(decision.recommendation)

  const completionState = getDecisionCompletionState(decision as Parameters<typeof getDecisionCompletionState>[0])
  const progressSummary = getDecisionProgressSummary(decision as Parameters<typeof getDecisionProgressSummary>[0])
  const typeConfig = getDecisionTypeConfig(decision.type)

  return (
    <main className="p-8">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/decisions">
          <Button variant="outline" size="sm">رجوع</Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">{decision.title}</h1>
          <p className="text-sm text-muted-foreground">{typeConfig.description}</p>
        </div>
      </div>
      <DecisionTabs decisionId={id} decisionType={decision.type} />
        <div className="mt-4 mb-6">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-muted-foreground">التقدّم: {progressSummary.completed}/{progressSummary.total} مرحلة</span>
          <span className="font-medium">{progressSummary.percentage}%</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${progressSummary.percentage}%` }} />
        </div>
        {completionState.nextStep && (
          <p className="text-xs text-muted-foreground mt-1">التالي: {completionState.nextStep.label} — {completionState.nextStep.description}</p>
        )}
      </div>
      <div className="mt-6">
        <div className="grid grid-cols-2 gap-4 text-sm mb-6">
          <div>
            <span className="text-muted-foreground">الحالة:</span> {decision.status}
          </div>
          <div>
            <span className="text-muted-foreground">المالك:</span> {decision.owner?.name || 'غير معيّن'}
          </div>
          <div>
            <span className="text-muted-foreground">النوع:</span> {decision.type || 'N/A'}
          </div>
          <div>
            <span className="text-muted-foreground">المؤسسة:</span> {decision.organization?.name || 'N/A'}
          </div>
          {decision.priority && (
            <div>
              <span className="text-muted-foreground">الأولوية:</span> {decision.priority}
            </div>
          )}
          {decision.targetDate && (
            <div>
              <span className="text-muted-foreground">التاريخ المستهدف:</span> {new Date(decision.targetDate).toLocaleDateString()}
            </div>
          )}
        </div>

        {decision.description && (
          <section className="rounded-lg border p-4 mb-4">
            <h2 className="text-sm font-semibold mb-2">الوصف</h2>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{decision.description}</p>
          </section>
        )}

        <div className="space-y-4">
          <section className="rounded-lg border p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">أ-١٫٠ استلام القرار</h2>
              <Badge variant={intake.status === "accepted" ? "default" : intake.status === "rejected" ? "destructive" : "secondary"}>
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

          <section className="rounded-lg border p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">أ-١٫١ إطار القرار</h2>
              {intake.status === "accepted" ? (
                <Badge variant={frameworkState.isComplete ? "default" : "secondary"}>
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
                      {(decision.framework as any)[field.key] || "غير محدّد"}
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
            ) : decision.decisionScenarios && decision.decisionScenarios.length > 0 ? (
              <div className="grid gap-3 md:grid-cols-3">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {decision.decisionScenarios.map((scenario: any) => (
                  <div key={scenario.id} className="rounded border p-3 text-sm">
                    <h3 className="font-medium">{scenario.name}</h3>
                    <p className="mt-2 whitespace-pre-wrap text-muted-foreground">{scenario.description}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                لم تبدأ السيناريوهات بعد. افتح تبويب السيناريوهات لتعريف الحالات الأساسية والإيجابية والسلبية.
              </p>
            )}
          </section>

          <section className="rounded-lg border p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">أ-١٫٣ المخاطر والمفاضلات</h2>
              {intake.status !== "accepted" || !frameworkState.isComplete || !scenarioState.isComplete ? (
                <Badge variant="secondary">محظور</Badge>
              ) : (
                <Badge variant={riskAnalysisState.isComplete ? "default" : "secondary"}>
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
                لا يمكن متابعة تحليل المخاطر قبل وجود ثلاثة سيناريوهات مكتملة على الأقل.
              </p>
            ) : decision.riskAnalyses && decision.riskAnalyses.length > 0 ? (
              <div className="grid gap-3 md:grid-cols-3">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {decision.riskAnalyses.map((analysis: any) => (
                  <div key={analysis.id} className="rounded border p-3 text-sm">
                    <h3 className="font-medium">{analysis.scenario?.name || "Scenario"}</h3>
                    <p className="mt-2 whitespace-pre-wrap text-muted-foreground">{analysis.risks}</p>
                    <p className="mt-2 text-xs text-muted-foreground">درجة عدم اليقين: {analysis.uncertaintyLevel}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                لم يبدأ تحليل المخاطر بعد. افتح تبويب المخاطر لتحليل المخاطر والمفاضلات لكل سيناريو.
              </p>
            )}
          </section>

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
                  <p className="mt-1 whitespace-pre-wrap text-muted-foreground">{decision.recommendation.recommendedAction}</p>
                </div>
                <div>
                  <h3 className="font-medium">المبرّر</h3>
                  <p className="mt-1 whitespace-pre-wrap text-muted-foreground">{decision.recommendation.rationale}</p>
                </div>
                <div>
                  <h3 className="font-medium">الحالة التالية المتوقّعة</h3>
                  <p className="mt-1 whitespace-pre-wrap text-muted-foreground">{decision.recommendation.expectedNextState}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                لم تبدأ التوصية بعد. افتح تبويب التوصية لتعريفها.
              </p>
            )}
          </section>

          {decision.objectives && decision.objectives.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold mb-2">الأهداف</h2>
              <ul className="list-disc pl-5 text-sm">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {decision.objectives.map((obj: any) => (
                  <li key={obj.id}>{obj.description}</li>
                ))}
              </ul>
            </section>
          )}

          {decision.constraints && decision.constraints.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold mb-2">القيود</h2>
              <ul className="list-disc pl-5 text-sm">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {decision.constraints.map((con: any) => (
                  <li key={con.id}>{con.description}</li>
                ))}
              </ul>
            </section>
          )}

          {decision.assumptions && decision.assumptions.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold mb-2">الافتراضات</h2>
              <ul className="list-disc pl-5 text-sm">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {decision.assumptions.map((ass: any) => (
                  <li key={ass.id}>{ass.description}</li>
                ))}
              </ul>
            </section>
          )}

          {decision.alternatives && decision.alternatives.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold mb-2">البدائل</h2>
              <ul className="list-disc pl-5 text-sm">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {decision.alternatives.map((alt: any) => (
                  <li key={alt.id}>{alt.description}</li>
                ))}
              </ul>
            </section>
          )}

          {decision.risks && decision.risks.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold mb-2">المخاطر</h2>
              <ul className="list-disc pl-5 text-sm">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {decision.risks.map((risk: any) => (
                  <li key={risk.id}>{risk.description} - <span className="font-medium">{risk.level}</span></li>
                ))}
              </ul>
            </section>
          )}

          {decision.tenderProfile && (
            <section>
              <h2 className="text-lg font-semibold mb-2">ملف المنافسة</h2>
              <div className="text-sm grid grid-cols-2 gap-2">
                <div><span className="text-muted-foreground">العميل:</span> {decision.tenderProfile.clientName}</div>
                <div><span className="text-muted-foreground">قيمة العقد:</span> {decision.tenderProfile.estimatedContractValue?.toLocaleString()} ريال</div>
                <div><span className="text-muted-foreground">المدة:</span> {decision.tenderProfile.durationMonths} شهراً</div>
                <div><span className="text-muted-foreground">الهامش:</span> {decision.tenderProfile.marginEstimate}%</div>
              </div>
            </section>
          )}
        </div>
      </div>
    </main>
  )
}
