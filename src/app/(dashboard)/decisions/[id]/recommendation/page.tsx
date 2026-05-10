"use client"

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import { getDecisionRecommendation, updateDecisionRecommendation, checkRecommendationGate, publishRecommendationAction, unpublishRecommendationAction } from "@/actions/decisions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { DecisionTabs } from "@/components/decisions/decision-tabs"
import { Badge } from "@/components/ui/badge"
import { Loader2, AlertTriangle } from "lucide-react"

const missingLabels: Record<string, string> = {
  intake_not_accepted: "Intake must be accepted",
  framework_incomplete: "Framework must be complete",
  scenarios_missing: "At least 3 scenarios required",
  scenarios_incomplete: "All scenarios must be complete",
  risks_missing: "Risk analysis missing for some scenarios",
  risks_incomplete: "Risk analysis incomplete for some scenarios",
}

type PageProps = {
  params: Promise<{ id: string }>
}

export default function RecommendationPage({ params }: PageProps) {
  const { id } = use(params)
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [gate, setGate] = useState<{ allowed: boolean; missing: string[] }>({ allowed: false, missing: [] })
  const [formData, setFormData] = useState({
    recommendedAction: "",
    rationale: "",
    expectedNextState: "",
    scopeExclusions: "",
    assumptionsUsed: "",
    risksAccepted: "",
    risksRejected: "",
    humanReviewRequired: false,
  })
  const [error, setError] = useState("")
  const [hasRecommendation, setHasRecommendation] = useState(false)
  const [currentUserRole, setCurrentUserRole] = useState<"ADMIN" | "OPERATOR" | "VIEWER">("OPERATOR")
  const [publication, setPublication] = useState({
    isClientVisible: false,
    publishedVersion: 1,
  })

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async function checkGate() {
    setLoading(true)
    const result = await checkRecommendationGate(id)
    setGate(result)
    if (result.allowed) {
      loadRecommendation()
    } else {
      setLoading(false)
    }
  }

  async function loadRecommendation() {
    const result = await getDecisionRecommendation(id)
    if (result.success && result.data) {
      setCurrentUserRole(result.data.currentUserRole || "OPERATOR")
      const rec = result.data.recommendation
      setHasRecommendation(Boolean(rec))
      if (rec) {
        setPublication({
          isClientVisible: rec.isClientVisible,
          publishedVersion: rec.publishedVersion,
        })
        if ("scopeExclusions" in rec) {
          setFormData({
            recommendedAction: rec.recommendedAction || "",
            rationale: rec.rationale || "",
            expectedNextState: rec.expectedNextState || "",
            scopeExclusions: rec.scopeExclusions || "",
            assumptionsUsed: rec.assumptionsUsed || "",
            risksAccepted: rec.risksAccepted || "",
            risksRejected: rec.risksRejected || "",
            humanReviewRequired: rec.humanReviewRequired || false,
          })
        }
      }
    }
    setLoading(false)
  }

  useEffect(() => {
    let cancelled = false
    async function run() {
      setLoading(true)
      const result = await checkRecommendationGate(id)
      if (cancelled) return
      setGate(result)
      if (result.allowed) {
        const recResult = await getDecisionRecommendation(id)
        if (cancelled) return
        if (recResult.success && recResult.data) {
          setCurrentUserRole(recResult.data.currentUserRole || "OPERATOR")
          const rec = recResult.data.recommendation
          setHasRecommendation(Boolean(rec))
          if (rec) {
            setPublication({
              isClientVisible: rec.isClientVisible,
              publishedVersion: rec.publishedVersion,
            })
            if ("scopeExclusions" in rec) {
              setFormData({
                recommendedAction: rec.recommendedAction || "",
                rationale: rec.rationale || "",
                expectedNextState: rec.expectedNextState || "",
                scopeExclusions: rec.scopeExclusions || "",
                assumptionsUsed: rec.assumptionsUsed || "",
                risksAccepted: rec.risksAccepted || "",
                risksRejected: rec.risksRejected || "",
                humanReviewRequired: rec.humanReviewRequired || false,
              })
            }
          }
        }
      }
      setLoading(false)
    }
    run()
    return () => { cancelled = true }
  }, [id])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError("")

    const result = await updateDecisionRecommendation(id, formData)
    if (result.success) {
      router.refresh()
    } else {
      setError(result.error || "Failed to save recommendation")
      if ("missing" in result && result.missing) {
        setGate({ allowed: false, missing: result.missing as string[] })
      }
    }
    setSaving(false)
  }

  async function handlePublish() {
    setSaving(true)
    setError("")
    const result = await publishRecommendationAction(id)
    if (result.success) {
      await loadRecommendation()
      router.refresh()
    } else {
      setError(result.error || "Failed to publish recommendation")
    }
    setSaving(false)
  }

  async function handleUnpublish() {
    setSaving(true)
    setError("")
    const result = await unpublishRecommendationAction(id)
    if (result.success) {
      await loadRecommendation()
      router.refresh()
    } else {
      setError(result.error || "Failed to unpublish recommendation")
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!gate.allowed) {
    return (
      <div className="space-y-6">
        <DecisionTabs decisionId={id} />
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Recommendation Blocked
            </CardTitle>
            <CardDescription>
              The recommendation stage is blocked until all prerequisites are met.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {gate.missing.map((reason) => (
                <li key={reason}>
                  <Badge variant="outline" className="text-destructive border-destructive">
                    {missingLabels[reason] || reason}
                  </Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <DecisionTabs decisionId={id} />
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle>Recommendation</CardTitle>
              <CardDescription>
                Define the recommended action and rationale. This is human-facing and requires review.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={publication.isClientVisible ? "default" : "outline"}>
                {publication.isClientVisible ? "Published" : "Draft/Internal"}
              </Badge>
              <Badge variant="secondary">v{publication.publishedVersion}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {currentUserRole === "ADMIN" && hasRecommendation && (
            <div className="mb-4 flex gap-2">
              {publication.isClientVisible ? (
                <Button type="button" variant="outline" onClick={handleUnpublish} disabled={saving}>
                  Unpublish Recommendation
                </Button>
              ) : (
                <Button type="button" variant="outline" onClick={handlePublish} disabled={saving}>
                  Publish Recommendation
                </Button>
              )}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="recommendedAction">Recommended Action</Label>
              <Textarea
                id="recommendedAction"
                value={formData.recommendedAction}
                onChange={(e) => setFormData({ ...formData, recommendedAction: e.target.value })}
                placeholder="Describe the recommended action..."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rationale">Rationale</Label>
              <Textarea
                id="rationale"
                value={formData.rationale}
                onChange={(e) => setFormData({ ...formData, rationale: e.target.value })}
                placeholder="Explain the rationale behind this recommendation..."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expectedNextState">Expected Next State</Label>
              <Textarea
                id="expectedNextState"
                value={formData.expectedNextState}
                onChange={(e) => setFormData({ ...formData, expectedNextState: e.target.value })}
                placeholder="Describe the expected state after implementing this recommendation..."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="scopeExclusions">Scope Exclusions</Label>
              <Textarea
                id="scopeExclusions"
                value={formData.scopeExclusions}
                onChange={(e) => setFormData({ ...formData, scopeExclusions: e.target.value })}
                placeholder="Define what is explicitly out of scope..."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="assumptionsUsed">Assumptions Used</Label>
              <Textarea
                id="assumptionsUsed"
                value={formData.assumptionsUsed}
                onChange={(e) => setFormData({ ...formData, assumptionsUsed: e.target.value })}
                placeholder="List assumptions made in this recommendation..."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="risksAccepted">Risks Accepted</Label>
              <Textarea
                id="risksAccepted"
                value={formData.risksAccepted}
                onChange={(e) => setFormData({ ...formData, risksAccepted: e.target.value })}
                placeholder="List risks that are accepted with this recommendation..."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="risksRejected">Risks Rejected</Label>
              <Textarea
                id="risksRejected"
                value={formData.risksRejected}
                onChange={(e) => setFormData({ ...formData, risksRejected: e.target.value })}
                placeholder="List risks that are rejected or mitigated..."
                required
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="humanReviewRequired"
                checked={formData.humanReviewRequired}
                onChange={(e) => setFormData({ ...formData, humanReviewRequired: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="humanReviewRequired">Human Review Required</Label>
            </div>

            {error && (
              <div className="text-destructive text-sm">{error}</div>
            )}

            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Recommendation
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
