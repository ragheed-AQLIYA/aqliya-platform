"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DecisionTabs } from "@/components/decisions/decision-tabs"
import { DecisionProgress, buildStageStatus } from "@/components/decisions/decision-progress"
import { getSimulationResults, runSimulationAndRecommendation } from "@/actions/simulation"
import { getWorkflowReadiness } from "@/actions/decisions"
import { getDecisionTypeConfig } from "@/lib/decision-type-config"
import { useEffect, useState } from "react"

export default function SimulationPage({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState<string | null>(null)
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [decisionType, setDecisionType] = useState<string | null>(null)
  const [readiness, setReadiness] = useState<any>(null)

  useEffect(() => {
    const getId = async () => {
      const { id: decisionId } = await params
      setId(decisionId)
    }
    getId()
  }, [params])

  useEffect(() => {
    if (!id) return

    const loadResults = async () => {
      const [result, readinessResult] = await Promise.all([
        getSimulationResults(id),
        getWorkflowReadiness(id),
      ])
      if (result.success && result.data) {
        setResults(result.data)
        setDecisionType(result.data.decisionType)
      } else {
        setError(result.error || "فشل في تحميل النتائج")
      }
      if (readinessResult.success && readinessResult.data) {
        setReadiness(readinessResult.data)
      }
      setLoading(false)
    }
    loadResults()
  }, [id])

  const handleRunSimulation = async () => {
    if (!id) return
    setSaving(true)
    setError(null)

    const result = await runSimulationAndRecommendation(id)
    if (result.success) {
      const [updated, readinessResult] = await Promise.all([
        getSimulationResults(id),
        getWorkflowReadiness(id),
      ])
      if (updated.success && updated.data) {
        setResults(updated.data)
        setDecisionType(updated.data.decisionType)
      }
      if (readinessResult.success && readinessResult.data) {
        setReadiness(readinessResult.data)
      }
    } else {
      setError(result.error || "فشل في تشغيل المحاكاة")
    }
    setSaving(false)
  }

  if (loading || !id) {
    return (
      <div>
        <DecisionTabs decisionId={id || ""} decisionType={undefined} />
        <div className="mt-6 text-center">جارٍ التحميل...</div>
      </div>
    )
  }

  const scenarios = results?.scenarios || []
  const recommendation = results?.recommendation
  const isTender = decisionType === "TENDER"
  const derivedScores = results?.derivedScores
  const scoreDrivers = results?.scoreDrivers
  const config = decisionType ? getDecisionTypeConfig(decisionType) : null
  const stages = readiness ? buildStageStatus("simulation", {
    intakeAccepted: readiness.intakeAccepted,
    frameworkComplete: readiness.frameworkComplete,
    scenariosComplete: readiness.scenariosComplete,
    risksComplete: readiness.risksComplete,
    simulationReady: readiness.simulationReady,
    recommendationReady: readiness.recommendationReady,
  }) : []

  return (
    <div>
      <DecisionTabs decisionId={id} decisionType={decisionType || undefined} />
      <div className="mt-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold">محاكاة السيناريوهات</h2>
            <p className="text-sm text-muted-foreground">
              {isTender
                ? "تسجيل مالي وقدرات ومخاطر خاص بالمنافسات"
                : config?.scenarioGuidance || "تسجيل قرار مدعوم بالبيانات عبر ثلاثة سيناريوهات"}
            </p>
          </div>
          <Button onClick={handleRunSimulation} disabled={saving}>
            {saving ? "جارٍ التشغيل..." : "تشغيل المحاكاة"}
          </Button>
        </div>

        {readiness && (
          <div className="mb-6">
            <DecisionProgress
              stages={stages}
              decisionType={decisionType || undefined}
              missingInputs={readiness.missingInputs}
              dataQuality={readiness.dataQuality}
            />
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">{error}</div>
        )}

        {!isTender && derivedScores && derivedScores.missingInputs?.length > 0 && (
          <Card className="p-4 mb-6 border-amber-200 bg-amber-50">
            <h3 className="text-sm font-semibold mb-2">المدخلات المفقودة</h3>
            <ul className="space-y-1 text-sm text-amber-800">
              {derivedScores.missingInputs.map((m: string) => (
                <li key={m}>- {m}</li>
              ))}
            </ul>
            <p className="mt-2 text-xs text-amber-600">جودة البيانات: {derivedScores.dataQuality}/100 — إكمال هذه المدخلات يُحسّن دقة التسجيل.</p>
          </Card>
        )}

        {!isTender && scoreDrivers && (
          <Card className="p-4 mb-6">
            <h3 className="text-sm font-semibold mb-3">محرّكات التسجيل</h3>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {Object.entries(scoreDrivers).map(([key, driver]: [string, any]) => (
                <div key={key} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{driver.label}</span>
                  <Badge variant={driver.impact === "positive" ? "default" : driver.impact === "negative" ? "destructive" : "secondary"}>
                    {Math.round(driver.score)}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        )}

        {scenarios.length === 0 && !loading ? (
          <p className="text-muted-foreground">لا توجد نتائج محاكاة بعد. اضغط "تشغيل المحاكاة" لتوليد النتائج.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {scenarios.map((s: any) => (
              <Card key={s.type} className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">{s.type?.replace("_", " ") || "غير معروف"}</h3>
                  {s.simulation && (
                    <Badge variant={s.simulation.overallDecisionScore >= 75 ? "default" : s.simulation.overallDecisionScore >= 55 ? "secondary" : "destructive"}>
                      {s.simulation.overallDecisionScore}/100
                    </Badge>
                  )}
                </div>
                {s.simulation ? (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>الجدوى:</span>
                      <span>{s.simulation.feasibilityScore}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>المالية:</span>
                      <span>{s.simulation.financialScore}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>القدرة:</span>
                      <span>{s.simulation.capacityScore}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>المخاطر:</span>
                      <span>{s.simulation.riskScore}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>الملاءمة الاستراتيجية:</span>
                      <span>{s.simulation.strategicFitScore}</span>
                    </div>
                    <div className="flex justify-between font-bold border-t pt-2">
                      <span>الإجمالي:</span>
                      <span>{s.simulation.overallDecisionScore}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">لا توجد نتائج</p>
                )}
              </Card>
            ))}
          </div>
        )}

        {recommendation && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">التوصية</h3>
            <Card className="p-4">
              <div className="space-y-2">
                {recommendation.recommendedAction && (
                  <div>
                    <span className="text-muted-foreground">الإجراء:</span>
                    <span className="ml-2 font-medium">{recommendation.recommendedAction}</span>
                  </div>
                )}
                {recommendation.rationale && (
                  <div>
                    <span className="text-muted-foreground">المبرّر:</span>
                    <p className="mt-1 text-sm">{recommendation.rationale}</p>
                  </div>
                )}
                {recommendation.expectedNextState && (
                  <div>
                    <span className="text-muted-foreground">الحالة التالية المتوقّعة:</span>
                    <p className="mt-1 text-sm">{recommendation.expectedNextState}</p>
                  </div>
                )}
                {isTender && recommendation.confidenceScore && (
                  <div>
                    <span className="text-muted-foreground">الثقة:</span>
                    <span className="ml-2 font-medium">{recommendation.confidenceScore}%</span>
                  </div>
                )}
                {isTender && recommendation.conditions && (
                  <div>
                    <span className="text-muted-foreground">الشروط:</span>
                    <p className="mt-1 text-sm">{recommendation.conditions}</p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
