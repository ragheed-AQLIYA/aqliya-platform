"use client"

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import { getDecisionRecommendation, updateDecisionRecommendation, checkRecommendationGate, publishRecommendationAction, unpublishRecommendationAction } from "@/actions/decisions"
import { getApprovalStatus, getRecommendationDiff } from "@/actions/approval"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { DecisionTabs } from "@/components/decisions/decision-tabs"
import { Badge } from "@/components/ui/badge"
import { Loader2, AlertTriangle, ArrowRight, FileDiff } from "lucide-react"
import type { FieldDiff } from "@/lib/recommendation/recommendation-diff"

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
  const [decisionType, setDecisionType] = useState<string | null>(null)
  const [snapshotWarning, setSnapshotWarning] = useState<{
    differs: boolean
    approvedAction: string
    currentAction: string
    approvedAt: string | null
    approver: string | null
  } | null>(null)
  const [showPublishConfirm, setShowPublishConfirm] = useState(false)
  const [diffData, setDiffData] = useState<{
    fields: FieldDiff[]
    changeCount: number
    summary: string
    approvedAt: string | null
    approver: string | null
  } | null>(null)
  const [loadingDiff, setLoadingDiff] = useState(false)
  const [showDiff, setShowDiff] = useState(false)

  async function loadRecommendation() {
    const result = await getDecisionRecommendation(id)
    if (result.success && result.data) {
      setCurrentUserRole(result.data.currentUserRole || "OPERATOR")
      const rec = result.data.recommendation
      setHasRecommendation(Boolean(rec))
      if (result.data.decisionType) {
        setDecisionType(result.data.decisionType)
      }
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
            humanReviewRequired: "humanReviewRequired" in rec ? (rec.humanReviewRequired as boolean) : false,
          })
        }
      }
    }

    const approvalResult = await getApprovalStatus(id)
    if (approvalResult.success && approvalResult.data) {
      if (approvalResult.data.recommendationDiffers && approvalResult.data.approvedSnapshot) {
        setSnapshotWarning({
          differs: true,
          approvedAction: approvalResult.data.approvedSnapshot.recommendedAction ?? "",
          currentAction: approvalResult.data.recommendationSummary?.action ?? "",
          approvedAt: approvalResult.data.approvedSnapshot.approvedAt
            ? new Date(approvalResult.data.approvedSnapshot.approvedAt).toLocaleString()
            : null,
          approver: approvalResult.data.approvedSnapshot.approver || null,
        })

        const diffResult = await getRecommendationDiff(id)
        if (diffResult.success && diffResult.data) {
          setDiffData({
            fields: diffResult.data.diff.fields,
            changeCount: diffResult.data.diff.changeCount,
            summary: diffResult.data.summary,
            approvedAt: diffResult.data.approvedAt
              ? new Date(diffResult.data.approvedAt).toLocaleString()
              : null,
            approver: diffResult.data.approver || null,
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
          if (recResult.data.decisionType) {
            setDecisionType(recResult.data.decisionType)
          }
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
                humanReviewRequired: "humanReviewRequired" in rec ? (rec.humanReviewRequired as boolean) : false,
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

    if (snapshotWarning?.differs && !showPublishConfirm) {
      setShowPublishConfirm(true)
      setSaving(false)
      return
    }

    const result = await publishRecommendationAction(id, showPublishConfirm)
    if (result.success) {
      setShowPublishConfirm(false)
      setSnapshotWarning(null)
      await loadRecommendation()
      router.refresh()
    } else {
      setError(result.error || "Failed to publish recommendation")
      if (result.requiresOverride) {
        setShowPublishConfirm(true)
      }
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

  async function loadDiff() {
    setLoadingDiff(true)
    const result = await getRecommendationDiff(id)
    if (result.success && result.data) {
      setDiffData({
        fields: result.data.diff.fields,
        changeCount: result.data.diff.changeCount,
        summary: result.data.summary,
        approvedAt: result.data.approvedAt
          ? new Date(result.data.approvedAt).toLocaleString()
          : null,
        approver: result.data.approver || null,
      })
      setShowDiff(true)
    }
    setLoadingDiff(false)
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

  const isTender = decisionType === "TENDER"

  return (
    <div className="space-y-6">
      <DecisionTabs decisionId={id} decisionType={decisionType || undefined} />
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle>Recommendation</CardTitle>
              <CardDescription>
                {isTender
                  ? "Tender-specific recommendation based on financial, capacity, and risk analysis"
                  : "Decision recommendation based on simulation scoring and risk assessment"}
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

          {snapshotWarning?.differs && (
            <div className="mb-4 space-y-4">
              <div className="rounded-md border border-amber-200 bg-amber-50 p-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-amber-800">Current Recommendation Differs from Approved Version</h3>
                    <p className="text-sm text-amber-700 mt-1">
                      {diffData?.summary || "The current recommendation has changed since it was approved by " + snapshotWarning.approver + " (" + snapshotWarning.approvedAt + ")."}
                    </p>
                    <p className="text-sm text-amber-700 mt-1">
                      Re-review is recommended before publishing.
                    </p>
                    <div className="mt-3 flex gap-2">
                      <Button type="button" variant="outline" size="sm" onClick={() => setShowDiff(!showDiff)} disabled={loadingDiff}>
                        <FileDiff className="h-4 w-4 mr-1" />
                        {showDiff ? "Hide Diff" : "View Side-by-Side Diff"}
                      </Button>
                      <Button type="button" variant="outline" size="sm" onClick={loadDiff} disabled={loadingDiff}>
                        {loadingDiff ? "Loading..." : "Refresh Diff"}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {showDiff && diffData && (
                <div className="rounded-md border p-4">
                  <h4 className="text-sm font-semibold mb-3">
                    Field Comparison — {diffData.changeCount} changed
                  </h4>
                  <div className="space-y-2">
                    {diffData.fields.filter((f) => f.changed).map((field) => (
                      <div key={field.field} className="grid grid-cols-2 gap-3 text-sm">
                        <div className="rounded border border-green-200 bg-green-50 p-3">
                          <div className="text-xs font-medium text-green-700 mb-1">
                            Approved: {field.label}
                          </div>
                          <div className="whitespace-pre-wrap text-xs text-green-900">
                            {field.approvedValue ?? "(empty)"}
                          </div>
                        </div>
                        <div className="rounded border border-red-200 bg-red-50 p-3">
                          <div className="text-xs font-medium text-red-700 mb-1">
                            Current: {field.label}
                          </div>
                          <div className="whitespace-pre-wrap text-xs text-red-900">
                            {field.currentValue ?? "(empty)"}
                          </div>
                        </div>
                      </div>
                    ))}
                    {diffData.fields.filter((f) => !f.changed).length > 0 && (
                      <div className="text-xs text-muted-foreground pt-2 border-t">
                        {diffData.fields.filter((f) => !f.changed).length} field(s) unchanged: {diffData.fields.filter((f) => !f.changed).map((f) => f.label).join(", ")}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {showPublishConfirm && (
                <div className="rounded-md border border-red-200 bg-red-50 p-4">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-red-700">
                        Publish current (changed) recommendation instead of approved version?
                      </p>
                      <p className="text-xs text-red-600 mt-1">
                        This will log an override in the audit trail. The approved snapshot remains preserved.
                      </p>
                      <div className="mt-3 flex gap-2">
                        <Button type="button" variant="destructive" size="sm" onClick={handlePublish} disabled={saving}>
                          Publish Current Version (Override)
                        </Button>
                        <Button type="button" variant="outline" size="sm" onClick={() => setShowPublishConfirm(false)}>
                          Cancel — Publish Approved Version
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
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
