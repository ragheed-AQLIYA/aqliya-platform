"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { DecisionTabs } from "@/components/decisions/decision-tabs"
import { getDecisionRiskAnalysis, updateDecisionRiskAnalysis } from "@/actions/decisions"
import type { DecisionFrameworkState, DecisionIntake, DecisionRiskAnalysisState, DecisionScenariosState } from "@/lib/types/decision"

type ScenarioRef = {
  id: string
  name: string
}

type RiskAnalysisForm = {
  id?: string
  scenarioId: string
  risks: string
  tradeoffs: string
  sacrifices: string
  opportunityCosts: string
  stakeholderRisks: string
  operationalRisks: string
  strategicRisks: string
  knowledgeRisks: string
  uncertaintyLevel: string
}

function getIntakeVariant(status?: string) {
  if (status === "accepted") return "default" as const
  if (status === "rejected") return "destructive" as const
  return "secondary" as const
}

export default function DecisionRisksPage({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [intake, setIntake] = useState<DecisionIntake | null>(null)
  const [frameworkState, setFrameworkState] = useState<DecisionFrameworkState | null>(null)
  const [scenarioState, setScenarioState] = useState<DecisionScenariosState | null>(null)
  const [riskAnalysisState, setRiskAnalysisState] = useState<DecisionRiskAnalysisState | null>(null)
  const [scenarios, setScenarios] = useState<ScenarioRef[]>([])
  const [analyses, setAnalyses] = useState<RiskAnalysisForm[]>([])

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

    async function loadRiskAnalysis() {
      const result = await getDecisionRiskAnalysis(decisionId)

      if (result.success && result.data) {
        setIntake(result.data.intake)
        setFrameworkState(result.data.frameworkState)
        setScenarioState(result.data.scenarioState)
        setRiskAnalysisState(result.data.riskAnalysisState)
        setScenarios(result.data.decisionScenarios)
        setAnalyses(result.data.analysisDrafts)
      } else {
        setError(result.error || "Failed to load decision risk analysis")
      }

      setLoading(false)
    }

    loadRiskAnalysis()
  }, [id])

  function handleAnalysisChange(index: number, field: keyof RiskAnalysisForm, value: string) {
    setAnalyses((current) => current.map((analysis, currentIndex) => (
      currentIndex === index ? { ...analysis, [field]: value } : analysis
    )))
    if (success) setSuccess(false)
    if (error) setError(null)
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!id || intake?.status !== "accepted" || !frameworkState?.isComplete || !scenarioState?.isComplete) return

    setSaving(true)
    setError(null)
    setSuccess(false)

    const result = await updateDecisionRiskAnalysis(id, { analyses })

    if (result.success && result.data) {
      setAnalyses(result.data.riskAnalyses)
      setRiskAnalysisState(result.data.riskAnalysisState)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } else {
      setError(result.error || "Failed to save decision risk analysis")
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
  const scenariosBlocked = !intakeBlocked && !frameworkBlocked && (!scenarioState?.isComplete || scenarios.length < 3)
  const blocked = intakeBlocked || frameworkBlocked || scenariosBlocked

  return (
    <div>
      <DecisionTabs decisionId={id} />
      <div className="mt-6 max-w-4xl mx-auto">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">A-1.3 Risk & Trade-offs</h2>
            <p className="text-sm text-muted-foreground">
              Analyze risks and trade-offs for each scenario. Do not recommend, rank, choose a path, or modify scenarios.
            </p>
          </div>
          {riskAnalysisState && !blocked && (
            <Badge variant={riskAnalysisState.isComplete ? "default" : "secondary"}>
              {riskAnalysisState.isComplete ? "complete" : "incomplete"}
            </Badge>
          )}
        </div>

        {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">{error}</div>}
        {success && <div className="bg-green-50 text-green-600 p-3 rounded mb-4 text-sm">Risk analysis saved successfully.</div>}

        {blocked ? (
          <section className="rounded-lg border p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="font-semibold">Risk analysis blocked</h3>
              {intakeBlocked ? (
                <Badge variant={getIntakeVariant(intake?.status)}>{intake?.status.replace("_", " ") || "intake missing"}</Badge>
              ) : frameworkBlocked ? (
                <Badge variant="secondary">framework incomplete</Badge>
              ) : (
                <Badge variant="secondary">scenarios incomplete</Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {intakeBlocked
                ? "A-1.3 cannot proceed before A-1.0 intake is accepted."
                : frameworkBlocked
                  ? "A-1.3 cannot proceed before A-1.1 framework exists and is complete."
                  : "A-1.3 cannot proceed before at least three complete scenarios exist."}
            </p>
            <ul className="mt-4 list-disc pl-5 text-sm">
              {(intakeBlocked ? intake?.requiredNextSteps : frameworkBlocked ? frameworkState?.nextSteps : scenarioState?.nextSteps)?.map((step) => <li key={step}>{step}</li>)}
            </ul>
          </section>
        ) : (
          <>
            {riskAnalysisState && !riskAnalysisState.isComplete && (
              <section className="mb-6 rounded-lg border p-4">
                <h3 className="text-sm font-medium">Required next steps</h3>
                <ul className="mt-2 list-disc pl-5 text-sm">
                  {riskAnalysisState.nextSteps.map((step) => <li key={step}>{step}</li>)}
                </ul>
              </section>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {analyses.map((analysis, index) => {
                const scenario = scenarios.find((item) => item.id === analysis.scenarioId)

                return (
                  <section key={analysis.scenarioId || index} className="rounded-lg border p-4">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <h3 className="font-semibold">{scenario?.name || `Scenario ${index + 1}`}</h3>
                      <Badge variant="outline">analysis only</Badge>
                    </div>
                    <input type="hidden" value={analysis.scenarioId} readOnly />
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor={`risks-${index}`}>Risks *</Label>
                        <Textarea id={`risks-${index}`} value={analysis.risks} onChange={(event) => handleAnalysisChange(index, "risks", event.target.value)} placeholder="Scenario-specific risks only" />
                      </div>
                      <div>
                        <Label htmlFor={`tradeoffs-${index}`}>Trade-offs *</Label>
                        <Textarea id={`tradeoffs-${index}`} value={analysis.tradeoffs} onChange={(event) => handleAnalysisChange(index, "tradeoffs", event.target.value)} placeholder="Trade-offs created by this scenario" />
                      </div>
                      <div>
                        <Label htmlFor={`sacrifices-${index}`}>Sacrifices *</Label>
                        <Textarea id={`sacrifices-${index}`} value={analysis.sacrifices} onChange={(event) => handleAnalysisChange(index, "sacrifices", event.target.value)} placeholder="What must be given up or constrained" />
                      </div>
                      <div>
                        <Label htmlFor={`opportunityCosts-${index}`}>Opportunity Costs *</Label>
                        <Textarea id={`opportunityCosts-${index}`} value={analysis.opportunityCosts} onChange={(event) => handleAnalysisChange(index, "opportunityCosts", event.target.value)} placeholder="Foregone options, time, capital, or focus" />
                      </div>
                      <div>
                        <Label htmlFor={`stakeholderRisks-${index}`}>Stakeholder Risks *</Label>
                        <Textarea id={`stakeholderRisks-${index}`} value={analysis.stakeholderRisks} onChange={(event) => handleAnalysisChange(index, "stakeholderRisks", event.target.value)} placeholder="Stakeholder exposure or friction" />
                      </div>
                      <div>
                        <Label htmlFor={`operationalRisks-${index}`}>Operational Risks *</Label>
                        <Textarea id={`operationalRisks-${index}`} value={analysis.operationalRisks} onChange={(event) => handleAnalysisChange(index, "operationalRisks", event.target.value)} placeholder="Execution, capacity, process, delivery risks" />
                      </div>
                      <div>
                        <Label htmlFor={`strategicRisks-${index}`}>Strategic Risks *</Label>
                        <Textarea id={`strategicRisks-${index}`} value={analysis.strategicRisks} onChange={(event) => handleAnalysisChange(index, "strategicRisks", event.target.value)} placeholder="Strategic fit, positioning, or long-term implications" />
                      </div>
                      <div>
                        <Label htmlFor={`knowledgeRisks-${index}`}>Knowledge Risks *</Label>
                        <Textarea id={`knowledgeRisks-${index}`} value={analysis.knowledgeRisks} onChange={(event) => handleAnalysisChange(index, "knowledgeRisks", event.target.value)} placeholder="Unknowns, weak evidence, or missing information" />
                      </div>
                      <div>
                        <Label htmlFor={`uncertaintyLevel-${index}`}>Uncertainty Level *</Label>
                        <Input id={`uncertaintyLevel-${index}`} value={analysis.uncertaintyLevel} onChange={(event) => handleAnalysisChange(index, "uncertaintyLevel", event.target.value)} placeholder="High, medium, low, or explain" />
                      </div>
                    </div>
                  </section>
                )
              })}
              <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save Risk Analysis"}</Button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
