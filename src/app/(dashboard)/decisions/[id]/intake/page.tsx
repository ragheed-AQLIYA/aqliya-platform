"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { DecisionTabs } from "@/components/decisions/decision-tabs"
import { getDecisionIntake, updateDecisionIntake } from "@/actions/decisions"
import type { DecisionIntake } from "@/lib/types/decision"

type IntakeForm = {
  title: string
  objectives: string
  constraints: string
  assumptions: string
  alternatives: string
  risks: string
}

function getIntakeVariant(status?: string) {
  if (status === "accepted") return "default" as const
  if (status === "rejected") return "destructive" as const
  return "secondary" as const
}

function joinDescriptions(items?: Array<{ description: string; level?: string }>) {
  return items?.map((item) => item.level ? `${item.level}: ${item.description}` : item.description).join("\n") ?? ""
}

export default function DecisionIntakePage({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [intake, setIntake] = useState<DecisionIntake | null>(null)
  const [formData, setFormData] = useState<IntakeForm>({
    title: "",
    objectives: "",
    constraints: "",
    assumptions: "",
    alternatives: "",
    risks: "",
  })

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

    async function loadIntake() {
      const result = await getDecisionIntake(decisionId)

      if (result.success && result.data) {
        const decision = result.data
        setFormData({
          title: decision.title,
          objectives: joinDescriptions(decision.objectives),
          constraints: joinDescriptions(decision.constraints),
          assumptions: joinDescriptions(decision.assumptions),
          alternatives: joinDescriptions(decision.alternatives),
          risks: joinDescriptions(decision.risks),
        })
        setIntake(decision.intake)
      } else {
        setError(result.error || "Failed to load decision intake")
      }

      setLoading(false)
    }

    loadIntake()
  }, [id])

  function handleChange(field: keyof IntakeForm, value: string) {
    setFormData((current) => ({ ...current, [field]: value }))
    if (success) setSuccess(false)
    if (error) setError(null)
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!id) return

    setSaving(true)
    setError(null)
    setSuccess(false)

    const result = await updateDecisionIntake(id, formData)

    if (result.success && result.data) {
      setIntake(result.data.intake)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } else {
      setError(result.error || "Failed to save decision intake")
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

  return (
    <div>
      <DecisionTabs decisionId={id} />
      <div className="mt-6 max-w-3xl mx-auto">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">A-1.0 Decision Intake</h2>
            <p className="text-sm text-muted-foreground">
              Intake gates decisions before frameworks, scenarios, risks, or recommendations.
            </p>
          </div>
          {intake && (
            <Badge variant={getIntakeVariant(intake.status)}>
              {intake.status.replace("_", " ")}
            </Badge>
          )}
        </div>

        {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">{error}</div>}
        {success && <div className="bg-green-50 text-green-600 p-3 rounded mb-4 text-sm">Intake saved successfully.</div>}

        {intake && (
          <section className="mb-6 rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">
              {intake.readyForFramework
                ? "Ready to proceed to A-1.1 Decision Frameworks."
                : "Resolve intake issues before proceeding to framework analysis."}
            </p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <h3 className="text-sm font-medium">Reasons</h3>
                <ul className="mt-2 list-disc pl-5 text-sm">
                  {intake.reasons.map((reason) => <li key={reason}>{reason}</li>)}
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-medium">Required next steps</h3>
                <ul className="mt-2 list-disc pl-5 text-sm">
                  {intake.requiredNextSteps.map((step) => <li key={step}>{step}</li>)}
                </ul>
              </div>
            </div>
          </section>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Decision Title *</Label>
            <Input id="title" value={formData.title} onChange={(event) => handleChange("title", event.target.value)} required />
          </div>
          <div>
            <Label htmlFor="objectives">Objectives *</Label>
            <Textarea id="objectives" value={formData.objectives} onChange={(event) => handleChange("objectives", event.target.value)} placeholder="One objective per line" />
          </div>
          <div>
            <Label htmlFor="alternatives">Alternatives *</Label>
            <Textarea id="alternatives" value={formData.alternatives} onChange={(event) => handleChange("alternatives", event.target.value)} placeholder="At least two viable options, one per line" />
          </div>
          <div>
            <Label htmlFor="risks">Risks / Uncertainty *</Label>
            <Textarea id="risks" value={formData.risks} onChange={(event) => handleChange("risks", event.target.value)} placeholder="Use LOW:, MEDIUM:, or HIGH: prefixes when useful" />
          </div>
          <div>
            <Label htmlFor="constraints">Constraints</Label>
            <Textarea id="constraints" value={formData.constraints} onChange={(event) => handleChange("constraints", event.target.value)} placeholder="One constraint per line" />
          </div>
          <div>
            <Label htmlFor="assumptions">Assumptions</Label>
            <Textarea id="assumptions" value={formData.assumptions} onChange={(event) => handleChange("assumptions", event.target.value)} placeholder="One assumption per line" />
          </div>
          <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save Intake"}</Button>
        </form>
      </div>
    </div>
  )
}
