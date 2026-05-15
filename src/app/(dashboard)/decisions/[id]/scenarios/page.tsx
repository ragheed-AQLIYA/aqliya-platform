"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { DecisionTabs } from "@/components/decisions/decision-tabs"
import { DecisionProgress, buildStageStatus } from "@/components/decisions/decision-progress"
import { getDecisionScenarios, updateDecisionScenarios, getWorkflowReadiness } from "@/actions/decisions"
import { getDecisionTypeConfig } from "@/lib/decision-type-config"
import type { DecisionFrameworkState, DecisionIntake, DecisionScenariosState } from "@/lib/types/decision"

type ScenarioForm = {
  id?: string
  name: string
  description: string
  assumptions: string
  expectedOutcome: string
  affectedStakeholders: string
  requiredConditions: string
}

function getIntakeVariant(status?: string) {
  if (status === "accepted") return "default" as const
  if (status === "rejected") return "destructive" as const
  return "secondary" as const
}

export default function DecisionScenariosPage({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [intake, setIntake] = useState<DecisionIntake | null>(null)
  const [frameworkState, setFrameworkState] = useState<DecisionFrameworkState | null>(null)
  const [scenarioState, setScenarioState] = useState<DecisionScenariosState | null>(null)
  const [decisionType, setDecisionType] = useState<string>("CUSTOM")
  const [readiness, setReadiness] = useState<any>(null)
  const [scenarios, setScenarios] = useState<ScenarioForm[]>([])

  useEffect(() => {
    async function resolveParams() {
      const { id: decisionId } = await params
      setId(decisionId)
    }
    resolveParams()
  }, [params])

  useEffect(() => {
    if (!id) return
    const decisionId: string = id

    async function loadData() {
      const [scenariosResult, readinessResult] = await Promise.all([
        getDecisionScenarios(decisionId),
        getWorkflowReadiness(decisionId),
      ])

      if (scenariosResult.success && scenariosResult.data) {
        setIntake(scenariosResult.data.intake)
        setFrameworkState(scenariosResult.data.frameworkState)
        setScenarioState(scenariosResult.data.scenarioState)
        setDecisionType(scenariosResult.data.type || "CUSTOM")
        setScenarios(scenariosResult.data.scenarioDrafts)
      } else {
        setError(scenariosResult.error || "Failed to load decision scenarios")
      }

      if (readinessResult.success && readinessResult.data) {
        setReadiness(readinessResult.data)
      }

      setLoading(false)
    }

    loadData()
  }, [id])

  function handleScenarioChange(index: number, field: keyof ScenarioForm, value: string) {
    setScenarios((current) => current.map((scenario, currentIndex) => (
      currentIndex === index ? { ...scenario, [field]: value } : scenario
    )))
    if (success) setSuccess(false)
    if (error) setError(null)
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!id || intake?.status !== "accepted" || !frameworkState?.isComplete) return

    setSaving(true)
    setError(null)
    setSuccess(false)

    const result = await updateDecisionScenarios(id, { scenarios })

    if (result.success && result.data) {
      setScenarios(result.data.decisionScenarios)
      setScenarioState(result.data.scenarioState)
      setSuccess(true)
      const readinessResult = await getWorkflowReadiness(id)
      if (readinessResult.success && readinessResult.data) {
        setReadiness(readinessResult.data)
      }
      setTimeout(() => setSuccess(false), 3000)
    } else {
      setError(result.error || "Failed to save decision scenarios")
    }

    setSaving(false)
  }

  if (loading || !id) {
    return (
      <div>
        <DecisionTabs decisionId={id || ""} />
        <div className="mt-6 text-center">Loading...</div>
      </div>
    )
  }

  const intakeBlocked = intake?.status !== "accepted"
  const frameworkBlocked = !intakeBlocked && !frameworkState?.isComplete
  const blocked = intakeBlocked || frameworkBlocked
  const config = getDecisionTypeConfig(decisionType)
  const stages = readiness ? buildStageStatus("scenarios", {
    intakeAccepted: readiness.intakeAccepted,
    frameworkComplete: readiness.frameworkComplete,
    scenariosComplete: readiness.scenariosComplete,
    risksComplete: readiness.risksComplete,
    simulationReady: readiness.simulationReady,
    recommendationReady: readiness.recommendationReady,
  }) : []

  return (
    <div>
      <DecisionTabs decisionId={id} decisionType={decisionType} />
      <div className="mt-6 max-w-4xl mx-auto">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">أ-١٫٢ السيناريوهات والخيارات</h2>
            <p className="text-sm text-muted-foreground">
              {config.scenarioGuidance}
            </p>
          </div>
          {scenarioState && !blocked && (
            <Badge variant={scenarioState.isComplete ? "default" : "secondary"}>
              {scenarioState.isComplete ? "مكتمل" : "غير مكتمل"}
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

        {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">{error}</div>}
        {success && <div className="bg-green-50 text-green-600 p-3 rounded mb-4 text-sm">تم حفظ السيناريوهات بنجاح. ٣+ سيناريوهات تمكّن جاهزية المحاكاة.</div>}

        {blocked ? (
          <section className="rounded-lg border p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="font-semibold">السيناريوهات محظورة</h3>
              {intakeBlocked ? (
                <Badge variant={getIntakeVariant(intake?.status)}>{intake?.status.replace("_", " ") || "الاستلام مفقود"}</Badge>
              ) : (
                <Badge variant="secondary">الإطار غير مكتمل</Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {intakeBlocked
                ? "أ-١٫٢ لا يمكن المتابعة قبل قبول أ-١٫٠ الاستلام."
                : "أ-١٫٢ لا يمكن المتابعة قبل اكتمال أ-١٫١ الإطار بشكل كافٍ."}
            </p>
            <ul className="mt-4 list-disc pl-5 text-sm">
              {(intakeBlocked ? intake?.requiredNextSteps : frameworkState?.nextSteps)?.map((step) => <li key={step}>{step}</li>)}
            </ul>
          </section>
        ) : (
          <>
            {scenarioState && !scenarioState.isComplete && (
              <section className="mb-6 rounded-lg border p-4">
                <h3 className="text-sm font-medium">الخطوات التالية المطلوبة</h3>
                <ul className="mt-2 list-disc pl-5 text-sm">
                  {scenarioState.nextSteps.map((step) => <li key={step}>{step}</li>)}
                </ul>
              </section>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {scenarios.map((scenario, index) => (
                <section key={`${scenario.name}-${index}`} className="rounded-lg border p-4">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <h3 className="font-semibold">{scenario.name || `السيناريو ${index + 1}`}</h3>
                    <Badge variant="outline">وصفي</Badge>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor={`name-${index}`}>الاسم *</Label>
                      <Input id={`name-${index}`} value={scenario.name} onChange={(event) => handleScenarioChange(index, "name", event.target.value)} />
                    </div>
                    <div>
                      <Label htmlFor={`description-${index}`}>الوصف *</Label>
                      <Textarea id={`description-${index}`} value={scenario.description} onChange={(event) => handleScenarioChange(index, "description", event.target.value)} placeholder="صِف هذا المسار المحتمل دون ترتيب أو تقييم" />
                    </div>
                    <div>
                      <Label htmlFor={`assumptions-${index}`}>الافتراضات *</Label>
                      <Textarea id={`assumptions-${index}`} value={scenario.assumptions} onChange={(event) => handleScenarioChange(index, "assumptions", event.target.value)} placeholder="الافتراضات اللازمة لتحقّق هذا السيناريو" />
                    </div>
                    <div>
                      <Label htmlFor={`expectedOutcome-${index}`}>النتيجة المتوقّعة *</Label>
                      <Textarea id={`expectedOutcome-${index}`} value={scenario.expectedOutcome} onChange={(event) => handleScenarioChange(index, "expectedOutcome", event.target.value)} placeholder="النتيجة الوصفية المتوقّعة، وليست توصية" />
                    </div>
                    <div>
                      <Label htmlFor={`affectedStakeholders-${index}`}>أصحاب المصلحة المتأثرون *</Label>
                      <Textarea id={`affectedStakeholders-${index}`} value={scenario.affectedStakeholders} onChange={(event) => handleScenarioChange(index, "affectedStakeholders", event.target.value)} placeholder="أصحاب المصلحة المتأثرون بهذا المسار" />
                    </div>
                    <div>
                      <Label htmlFor={`requiredConditions-${index}`}>الشروط المطلوبة *</Label>
                      <Textarea id={`requiredConditions-${index}`} value={scenario.requiredConditions} onChange={(event) => handleScenarioChange(index, "requiredConditions", event.target.value)} placeholder="الشروط اللازمة ليكون هذا السيناريو محتملاً" />
                    </div>
                  </div>
                </section>
              ))}
              <Button type="submit" disabled={saving}>{saving ? "جارٍ الحفظ..." : "حفظ السيناريوهات"}</Button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
