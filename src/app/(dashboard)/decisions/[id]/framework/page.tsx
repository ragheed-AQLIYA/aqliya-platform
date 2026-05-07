"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { DecisionTabs } from "@/components/decisions/decision-tabs"
import { getDecisionFramework, updateDecisionFramework } from "@/actions/decisions"
import type { DecisionFrameworkState, DecisionIntake } from "@/lib/types/decision"

type FrameworkForm = {
  context: string
  purpose: string
  options: string
  criteria: string
  values: string
  informationGaps: string
  certainty: string
  assumptions: string
}

type FrameworkRecord = FrameworkForm & {
  id: string
  decisionId: string
}

const emptyForm: FrameworkForm = {
  context: "",
  purpose: "",
  options: "",
  criteria: "",
  values: "",
  informationGaps: "",
  certainty: "",
  assumptions: "",
}

function getStateVariant(isComplete?: boolean) {
  return isComplete ? "default" as const : "secondary" as const
}

function getIntakeVariant(status?: string) {
  if (status === "accepted") return "default" as const
  if (status === "rejected") return "destructive" as const
  return "secondary" as const
}

export default function DecisionFrameworkPage({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [intake, setIntake] = useState<DecisionIntake | null>(null)
  const [frameworkState, setFrameworkState] = useState<DecisionFrameworkState | null>(null)
  const [formData, setFormData] = useState<FrameworkForm>(emptyForm)

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

    async function loadFramework() {
      const result = await getDecisionFramework(decisionId)

      if (result.success && result.data) {
        const decision = result.data
        const framework = decision.framework as FrameworkRecord | null
        setIntake(decision.intake)
        setFrameworkState(decision.frameworkState)
        setFormData(framework ? {
          context: framework.context,
          purpose: framework.purpose,
          options: framework.options,
          criteria: framework.criteria,
          values: framework.values,
          informationGaps: framework.informationGaps,
          certainty: framework.certainty,
          assumptions: framework.assumptions,
        } : emptyForm)
      } else {
        setError(result.error || "Failed to load decision framework")
      }

      setLoading(false)
    }

    loadFramework()
  }, [id])

  function handleChange(field: keyof FrameworkForm, value: string) {
    setFormData((current) => ({ ...current, [field]: value }))
    if (success) setSuccess(false)
    if (error) setError(null)
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!id || intake?.status !== "accepted") return

    setSaving(true)
    setError(null)
    setSuccess(false)

    const result = await updateDecisionFramework(id, formData)

    if (result.success && result.data) {
      setFormData(result.data.framework)
      setFrameworkState(result.data.frameworkState)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } else {
      setError(result.error || "Failed to save decision framework")
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

  const blocked = intake?.status !== "accepted"

  return (
    <div>
      <DecisionTabs decisionId={id} />
      <div className="mt-6 max-w-3xl mx-auto">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">A-1.1 Decision Framework</h2>
            <p className="text-sm text-muted-foreground">
              Framework captures context, purpose, options, criteria, values, gaps, certainty, and assumptions.
            </p>
          </div>
          {frameworkState && !blocked && (
            <Badge variant={getStateVariant(frameworkState.isComplete)}>
              {frameworkState.isComplete ? "complete" : "incomplete"}
            </Badge>
          )}
        </div>

        {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">{error}</div>}
        {success && <div className="bg-green-50 text-green-600 p-3 rounded mb-4 text-sm">Framework saved successfully.</div>}

        {blocked ? (
          <section className="rounded-lg border p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="font-semibold">Framework blocked</h3>
              <Badge variant={getIntakeVariant(intake?.status)}>{intake?.status.replace("_", " ") || "intake missing"}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              A-1.1 cannot proceed before A-1.0 intake is accepted. Resolve the intake issues first.
            </p>
            {intake && (
              <ul className="mt-4 list-disc pl-5 text-sm">
                {intake.requiredNextSteps.map((step) => <li key={step}>{step}</li>)}
              </ul>
            )}
          </section>
        ) : (
          <>
            {frameworkState && !frameworkState.isComplete && (
              <section className="mb-6 rounded-lg border p-4">
                <h3 className="text-sm font-medium">Required next steps</h3>
                <ul className="mt-2 list-disc pl-5 text-sm">
                  {frameworkState.nextSteps.map((step) => <li key={step}>{step}</li>)}
                </ul>
              </section>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="context">Context *</Label>
                <Textarea id="context" value={formData.context} onChange={(event) => handleChange("context", event.target.value)} placeholder="Decision background, boundaries, stakeholders, timing" />
              </div>
              <div>
                <Label htmlFor="purpose">Purpose *</Label>
                <Textarea id="purpose" value={formData.purpose} onChange={(event) => handleChange("purpose", event.target.value)} placeholder="What this decision must accomplish" />
              </div>
              <div>
                <Label htmlFor="options">Options *</Label>
                <Textarea id="options" value={formData.options} onChange={(event) => handleChange("options", event.target.value)} placeholder="One option per line" />
              </div>
              <div>
                <Label htmlFor="criteria">Criteria *</Label>
                <Textarea id="criteria" value={formData.criteria} onChange={(event) => handleChange("criteria", event.target.value)} placeholder="Evaluation criteria, one per line" />
              </div>
              <div>
                <Label htmlFor="values">Values *</Label>
                <Textarea id="values" value={formData.values} onChange={(event) => handleChange("values", event.target.value)} placeholder="Decision principles, trade-off preferences, non-negotiables" />
              </div>
              <div>
                <Label htmlFor="informationGaps">Information Gaps *</Label>
                <Textarea id="informationGaps" value={formData.informationGaps} onChange={(event) => handleChange("informationGaps", event.target.value)} placeholder="Unknowns or missing evidence" />
              </div>
              <div>
                <Label htmlFor="certainty">Certainty *</Label>
                <Input id="certainty" value={formData.certainty} onChange={(event) => handleChange("certainty", event.target.value)} placeholder="High, medium, low, or explain confidence level" />
              </div>
              <div>
                <Label htmlFor="assumptions">Assumptions *</Label>
                <Textarea id="assumptions" value={formData.assumptions} onChange={(event) => handleChange("assumptions", event.target.value)} placeholder="Assumptions this framework depends on" />
              </div>
              <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save Framework"}</Button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
