"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { DecisionTabs } from "@/components/decisions/decision-tabs"
import { getSimulationResults, runSimulationAndRecommendation } from "@/actions/simulation"
import { useEffect, useState } from "react"

export default function SimulationPage({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState<string | null>(null)
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Extract id from params Promise
  useEffect(() => {
    const getId = async () => {
      const { id: decisionId } = await params
      setId(decisionId)
    }
    getId()
  }, [params])

  // Load results
  useEffect(() => {
    if (!id) return

    const loadResults = async () => {
      const result = await getSimulationResults(id)
      if (result.success) {
        setResults(result.data)
      } else {
        setError(result.error || "Failed to load results")
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
      // Reload results
      const updated = await getSimulationResults(id)
      if (updated.success) {
        setResults(updated.data)
      }
    } else {
      setError(result.error || "Failed to run simulation")
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

  const scenarios = results?.scenarios || []
  const recommendation = results?.recommendation

  return (
    <div>
      <DecisionTabs decisionId={id} />
      <div className="mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Scenario Simulation</h2>
          <Button onClick={handleRunSimulation} disabled={saving}>
            {saving ? "Running..." : "Run Simulation"}
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        {scenarios.length === 0 && !loading ? (
          <p className="text-muted-foreground">No simulation results yet. Click "Run Simulation" to generate results.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {scenarios.map((s: any) => (
              <Card key={s.type} className="p-4">
                <h3 className="text-lg font-semibold mb-4">{s.type?.replace('_', ' ') || 'Unknown'}</h3>
                {s.simulation ? (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Feasibility:</span>
                      <span>{s.simulation.feasibilityScore}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Financial:</span>
                      <span>{s.simulation.financialScore}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Capacity:</span>
                      <span>{s.simulation.capacityScore}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Risk:</span>
                      <span>{s.simulation.riskScore}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Strategic Fit:</span>
                      <span>{s.simulation.strategicFitScore}</span>
                    </div>
                    <div className="flex justify-between font-bold border-t pt-2">
                      <span>Overall:</span>
                      <span>{s.simulation.overallDecisionScore}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No results</p>
                )}
              </Card>
            ))}
          </div>
        )}

        {recommendation && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Recommendation</h3>
            <Card className="p-4">
              <div className="space-y-2">
                <div>
                  <span className="text-muted-foreground">Type:</span>
                  <span className="ml-2 font-medium">{recommendation.type}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Confidence:</span>
                  <span className="ml-2 font-medium">{recommendation.confidenceScore}%</span>
                </div>
                {recommendation.reasoning && (
                  <div>
                    <span className="text-muted-foreground">Reasoning:</span>
                    <p className="mt-1 text-sm">{recommendation.reasoning}</p>
                  </div>
                )}
                {recommendation.conditions && (
                  <div>
                    <span className="text-muted-foreground">Conditions:</span>
                    <p className="mt-1 text-sm">{recommendation.conditions}</p>
                  </div>
                )}
                {recommendation.riskNotes && (
                  <div>
                    <span className="text-muted-foreground">Risk Notes:</span>
                    <p className="mt-1 text-sm">{recommendation.riskNotes}</p>
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
