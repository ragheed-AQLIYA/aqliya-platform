"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { DecisionTabs } from "@/components/decisions/decision-tabs"
import { getDecisionScenarios, updateDecisionScenarios } from "@/actions/decisions"
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

    async function loadScenarios() {
      const result = await getDecisionScenarios(decisionId)

      if (result.success && result.data) {
        setIntake(result.data.intake)
        setFrameworkState(result.data.frameworkState)
        setScenarioState(result.data.scenarioState)
        setScenarios(result.data.scenarioDrafts)
      } else {
        setError(result.error || "Failed to load decision scenarios")
      }

      setLoading(false)
    }

    loadScenarios()
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

  return (
    <div>
      <DecisionTabs decisionId={id} />
      <div className="mt-6 max-w-4xl mx-auto">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">A-1.2 Scenarios & Optionality</h2>
            <p className="text-sm text-muted-foreground">
              Scenarios are descriptive only. Do not rank, evaluate, recommend, or attach risk judgment here.
            </p>
          </div>
          {scenarioState && !blocked && (
            <Badge variant={scenarioState.isComplete ? "default" : "secondary"}>
              {scenarioState.isComplete ? "complete" : "incomplete"}
            </Badge>
          )}
        </div>

        {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">{error}</div>}
        {success && <div className="bg-green-50 text-green-600 p-3 rounded mb-4 text-sm">Scenarios saved successfully.</div>}

        {blocked ? (
          <section className="rounded-lg border p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="font-semibold">Scenarios blocked</h3>
              {intakeBlocked ? (
                <Badge variant={getIntakeVariant(intake?.status)}>{intake?.status.replace("_", " ") || "intake missing"}</Badge>
              ) : (
                <Badge variant="secondary">framework incomplete</Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {intakeBlocked
                ? "A-1.2 cannot proceed before A-1.0 intake is accepted."
                : "A-1.2 cannot proceed before A-1.1 framework exists and is complete enough."}
            </p>
            <ul className="mt-4 list-disc pl-5 text-sm">
              {(intakeBlocked ? intake?.requiredNextSteps : frameworkState?.nextSteps)?.map((step) => <li key={step}>{step}</li>)}
            </ul>
          </section>
        ) : (
          <>
            {scenarioState && !scenarioState.isComplete && (
              <section className="mb-6 rounded-lg border p-4">
                <h3 className="text-sm font-medium">Required next steps</h3>
                <ul className="mt-2 list-disc pl-5 text-sm">
                  {scenarioState.nextSteps.map((step) => <li key={step}>{step}</li>)}
                </ul>
              </section>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {scenarios.map((scenario, index) => (
                <section key={`${scenario.name}-${index}`} className="rounded-lg border p-4">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <h3 className="font-semibold">{scenario.name || `Scenario ${index + 1}`}</h3>
                    <Badge variant="outline">descriptive</Badge>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor={`name-${index}`}>Name *</Label>
                      <Input id={`name-${index}`} value={scenario.name} onChange={(event) => handleScenarioChange(index, "name", event.target.value)} />
                    </div>
                    <div>
                      <Label htmlFor={`description-${index}`}>Description *</Label>
                      <Textarea id={`description-${index}`} value={scenario.description} onChange={(event) => handleScenarioChange(index, "description", event.target.value)} placeholder="Describe this possible path without ranking or evaluation" />
                    </div>
                    <div>
                      <Label htmlFor={`assumptions-${index}`}>Assumptions *</Label>
                      <Textarea id={`assumptions-${index}`} value={scenario.assumptions} onChange={(event) => handleScenarioChange(index, "assumptions", event.target.value)} placeholder="Assumptions required for this scenario to hold" />
                    </div>
                    <div>
                      <Label htmlFor={`expectedOutcome-${index}`}>Expected Outcome *</Label>
                      <Textarea id={`expectedOutcome-${index}`} value={scenario.expectedOutcome} onChange={(event) => handleScenarioChange(index, "expectedOutcome", event.target.value)} placeholder="Expected descriptive outcome, not a recommendation" />
                    </div>
                    <div>
                      <Label htmlFor={`affectedStakeholders-${index}`}>Affected Stakeholders *</Label>
                      <Textarea id={`affectedStakeholders-${index}`} value={scenario.affectedStakeholders} onChange={(event) => handleScenarioChange(index, "affectedStakeholders", event.target.value)} placeholder="Stakeholders affected by this path" />
                    </div>
                    <div>
                      <Label htmlFor={`requiredConditions-${index}`}>Required Conditions *</Label>
                      <Textarea id={`requiredConditions-${index}`} value={scenario.requiredConditions} onChange={(event) => handleScenarioChange(index, "requiredConditions", event.target.value)} placeholder="Conditions needed for this scenario to be plausible" />
                    </div>
                  </div>
                </section>
              ))}
              <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save Scenarios"}</Button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
