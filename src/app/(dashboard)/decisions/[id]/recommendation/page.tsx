"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DecisionTabs } from "@/components/decisions/decision-tabs"
import { getDecisionById } from "@/actions/decisions"
import { getSimulationResults } from "@/actions/simulation"
import { useEffect, useState } from "react"

export default function RecommendationPage({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState<string | null>(null)
  const [decision, setDecision] = useState<any>(null)
  const [recommendation, setRecommendation] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Extract id from params Promise
  useEffect(() => {
    const getId = async () => {
      const { id: decisionId } = await params
      setId(decisionId)
    }
    getId()
  }, [params])

  // Load data
  useEffect(() => {
    if (!id) return

    const loadData = async () => {
      // Get decision details
      const decisionResult = await getDecisionById(id)
      if (decisionResult.success && decisionResult.data) {
        setDecision(decisionResult.data)
      }

      // Get simulation results (includes recommendation)
      const simResult = await getSimulationResults(id)
      if (simResult.success && simResult.data?.recommendation) {
        setRecommendation(simResult.data.recommendation)
      }

      setLoading(false)
    }
    loadData()
  }, [id])

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
      <div className="mt-6 max-w-2xl mx-auto">
        <h2 className="text-xl font-semibold mb-4">Recommendation</h2>

        {!recommendation ? (
          <Card className="p-6 space-y-4">
            <p className="text-muted-foreground">No recommendation generated yet. Run simulation first.</p>
            <Button onClick={() => window.location.href = `/decisions/${id}/simulation`}>
              Go to Simulation
            </Button>
          </Card>
        ) : (
          <Card className="p-6 space-y-4">
            <div>
              <h3 className="text-sm text-muted-foreground">Recommendation</h3>
              <Badge variant="outline" className="text-lg mt-1">
                {recommendation.type || 'PENDING'}
              </Badge>
            </div>

            {recommendation.confidenceScore && (
              <div>
                <h3 className="text-sm text-muted-foreground">Confidence Score</h3>
                <p className="text-3xl font-bold">{recommendation.confidenceScore}%</p>
              </div>
            )}

            {recommendation.overallScore && (
              <div>
                <h3 className="text-sm text-muted-foreground">Overall Score</h3>
                <p className="text-3xl font-bold">{recommendation.overallScore}</p>
              </div>
            )}

            {recommendation.reasoning && (
              <div>
                <h3 className="text-sm text-muted-foreground">Reasoning</h3>
                <p className="text-sm mt-1">{recommendation.reasoning}</p>
              </div>
            )}

            {recommendation.conditions && (
              <div>
                <h3 className="text-sm text-muted-foreground">Conditions</h3>
                <p className="text-sm mt-1">{recommendation.conditions}</p>
              </div>
            )}

            {recommendation.riskNotes && (
              <div>
                <h3 className="text-sm text-muted-foreground">Risk Notes</h3>
                <p className="text-sm mt-1">{recommendation.riskNotes}</p>
              </div>
            )}

            <Button onClick={() => window.location.href = `/decisions/${id}/simulation`}>
              Re-run Simulation
            </Button>
          </Card>
        )}
      </div>
    </div>
  )
}
