"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { DecisionTabs } from "@/components/decisions/decision-tabs"
import { DecisionProgress, buildStageStatus } from "@/components/decisions/decision-progress"
import { getDecisionIntake, updateDecisionIntake, getWorkflowReadiness } from "@/actions/decisions"
import { getDecisionTypeConfig } from "@/lib/decision-type-config"
import type { DecisionIntake as DecisionIntakeState } from "@/lib/types/decision"

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
  const [intake, setIntake] = useState<DecisionIntakeState | null>(null)
  const [decisionType, setDecisionType] = useState<string>("CUSTOM")
  const [readiness, setReadiness] = useState<any>(null)
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

    async function loadData() {
      const [intakeResult, readinessResult] = await Promise.all([
        getDecisionIntake(decisionId),
        getWorkflowReadiness(decisionId),
      ])

      if (intakeResult.success && intakeResult.data) {
        const decision = intakeResult.data
        setFormData({
          title: decision.title,
          objectives: joinDescriptions(decision.objectives),
          constraints: joinDescriptions(decision.constraints),
          assumptions: joinDescriptions(decision.assumptions),
          alternatives: joinDescriptions(decision.alternatives),
          risks: joinDescriptions(decision.risks),
        })
        setIntake(decision.intake)
        setDecisionType(decision.type || "CUSTOM")
      } else {
        setError(intakeResult.error || "Failed to load decision intake")
      }

      if (readinessResult.success && readinessResult.data) {
        setReadiness(readinessResult.data)
      }

      setLoading(false)
    }

    loadData()
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
      const readinessResult = await getWorkflowReadiness(id)
      if (readinessResult.success && readinessResult.data) {
        setReadiness(readinessResult.data)
      }
      setTimeout(() => setSuccess(false), 3000)
    } else {
      setError(result.error || "فشل في حفظ استلام القرار")
    }

    setSaving(false)
  }

  if (loading || !id) {
    return (
      <div>
        <DecisionTabs decisionId={id || ""} />
        <div className="mt-6 text-center">جارٍ التحميل...</div>
      </div>
    )
  }

  const config = getDecisionTypeConfig(decisionType)
  const stages = readiness ? buildStageStatus("intake", {
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
      <div className="mt-6 max-w-3xl mx-auto">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">أ-١٫٠ استلام القرار</h2>
            <p className="text-sm text-muted-foreground">
              {config.intakeGuidance}
            </p>
          </div>
          {intake && (
            <Badge variant={getIntakeVariant(intake.status)}>
              {intake.status.replace("_", " ")}
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
        {success && <div className="bg-green-50 text-green-600 p-3 rounded mb-4 text-sm">تم حفظ الاستلام بنجاح.</div>}

        {intake && (
          <section className="mb-6 rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">
              {intake.readyForFramework
                ? "جاهز للمتابعة إلى أ-١٫١ إطار القرار."
                : "حل مشكلات الاستلام قبل المتابعة إلى تحليل الإطار."}
            </p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <h3 className="text-sm font-medium">الأسباب</h3>
                <ul className="mt-2 list-disc pl-5 text-sm">
                  {intake.reasons.map((reason) => <li key={reason}>{reason}</li>)}
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-medium">الخطوات التالية المطلوبة</h3>
                <ul className="mt-2 list-disc pl-5 text-sm">
                  {intake.requiredNextSteps.map((step) => <li key={step}>{step}</li>)}
                </ul>
              </div>
            </div>
          </section>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">عنوان القرار *</Label>
            <Input id="title" value={formData.title} onChange={(event) => handleChange("title", event.target.value)} required />
          </div>
          <div>
            <Label htmlFor="objectives">الأهداف *</Label>
            <Textarea id="objectives" value={formData.objectives} onChange={(event) => handleChange("objectives", event.target.value)} placeholder="هدف واحد في كل سطر" />
            <p className="text-xs text-muted-foreground mt-1">يُحدّد الملاءمة الاستراتيجية ودرجات الجدوى. استهدف ٣-٥ أهداف.</p>
          </div>
          <div>
            <Label htmlFor="alternatives">البدائل *</Label>
            <Textarea id="alternatives" value={formData.alternatives} onChange={(event) => handleChange("alternatives", event.target.value)} placeholder="خياران ممكنان على الأقل، واحد في كل سطر" />
            <p className="text-xs text-muted-foreground mt-1">المزيد من البدائل يُحسّن تسجيل الملاءمة الاستراتيجية. استهدف ٢-٣.</p>
          </div>
          <div>
            <Label htmlFor="risks">المخاطر / عدم اليقين *</Label>
            <Textarea id="risks" value={formData.risks} onChange={(event) => handleChange("risks", event.target.value)} placeholder="استخدم البادئات: LOW: أو MEDIUM: أو HIGH: عند اللزوم" />
            <p className="text-xs text-muted-foreground mt-1">تقييم المخاطر يؤثّر مباشرة على درجة المخاطر. وثّق جميع المخاطر المعروفة.</p>
          </div>
          <div>
            <Label htmlFor="constraints">القيود</Label>
            <Textarea id="constraints" value={formData.constraints} onChange={(event) => handleChange("constraints", event.target.value)} placeholder="قيد واحد في كل سطر" />
            <p className="text-xs text-muted-foreground mt-1">قيود أقل = درجة قدرة أعلى. كن محدّداً.</p>
          </div>
          <div>
            <Label htmlFor="assumptions">الافتراضات</Label>
            <Textarea id="assumptions" value={formData.assumptions} onChange={(event) => handleChange("assumptions", event.target.value)} placeholder="افتراض واحد في كل سطر" />
            <p className="text-xs text-muted-foreground mt-1">الافتراضات الموثّقة تُحسّن الثقة ودرجات المخاطر. استهدف ٣-٤.</p>
          </div>
          <Button type="submit" disabled={saving}>{saving ? "جارٍ الحفظ..." : "حفظ الاستلام"}</Button>
        </form>
      </div>
    </div>
  )
}
