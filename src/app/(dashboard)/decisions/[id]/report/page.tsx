"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Printer } from "lucide-react"
import { DecisionTabs } from "@/components/decisions/decision-tabs"
import { getDecisionById } from "@/actions/decisions"
import { useEffect, useState } from "react"

export default function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState<string | null>(null)
  const [decision, setDecision] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Extract id from params Promise
  useEffect(() => {
    const getId = async () => {
      const { id: decisionId } = await params
      setId(decisionId)
    }
    getId()
  }, [params])

  // Load decision
  useEffect(() => {
    if (!id) return

    const loadDecision = async () => {
      const result = await getDecisionById(id)
      if (result.success && result.data) {
        setDecision(result.data)
      }
      setLoading(false)
    }
    loadDecision()
  }, [id])

  const handlePrint = () => window.print()

  if (loading || !id) {
    return (
      <div>
        <DecisionTabs decisionId={id || ""} />
        <div className="mt-6 text-center">Loading...</div>
      </div>
    )
  }

  if (!decision) {
    return (
      <div>
        <DecisionTabs decisionId={id} />
        <div className="mt-6 text-center text-muted-foreground">Decision not found</div>
      </div>
    )
  }

  // Helper function to safely parse JSON
  const parseJson = (json: string | null) => {
    if (!json) return null
    try {
      return JSON.parse(json)
    } catch {
      return null
    }
  }

  // Get recommendation data
  const recommendation = decision.recommendation
  const tender = decision.tenderProfile

  // Get simulation results
  const scenarios = decision.scenarios?.map((s: any) => ({
    type: s.type,
    simulation: s.simulation,
  })) || []

  // Get audit logs for governance trail
  const auditLogs = decision.auditLogs || []

  return (
    <div>
      <DecisionTabs decisionId={id} />
      <div className="mt-6 max-w-4xl mx-auto print:p-0">
        <div className="flex items-center justify-between mb-6 print:hidden">
          <h2 className="text-xl font-bold">Decision Report</h2>
          <Button onClick={handlePrint} variant="outline">
            <Printer className="w-4 h-4 mr-2" />
            Print Report
          </Button>
        </div>

        <div className="space-y-8 print:space-y-6">
          <section>
            <h3 className="text-lg font-bold mb-4 border-b pb-2">Decision Header</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-muted-foreground">Title:</span> {decision.title}</div>
              <div><span className="text-muted-foreground">Status:</span> <Badge>{decision.status}</Badge></div>
              <div><span className="text-muted-foreground">Owner:</span> {decision.owner?.name || 'Unassigned'}</div>
              <div><span className="text-muted-foreground">Date:</span> {new Date(decision.createdAt).toLocaleDateString()}</div>
              <div><span className="text-muted-foreground">Organization:</span> {decision.organization?.name || 'N/A'}</div>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-bold mb-4 border-b pb-2">Executive Summary</h3>
            <Card className="p-4">
              <p className="text-sm">
                {recommendation ? (
                  <>
                    Based on rule-based simulation across three scenarios, this tender shows an <strong>Expected Case overall score of {scenarios.find((s: any) => s.type === 'EXPECTED_CASE')?.simulation?.overallDecisionScore || 'N/A'}/100</strong>.
                    The decision is recommended as <Badge>{recommendation.type}</Badge> {recommendation.conditions ? 'pending conditions fulfillment.' : '.'}
                  </>
                ) : (
                  'No recommendation generated yet. Please run simulation first.'
                )}
              </p>
            </Card>
          </section>

          {tender && (
            <section>
              <h3 className="text-lg font-bold mb-4 border-b pb-2">Tender Context</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-muted-foreground">Client:</span> {tender.clientName}</div>
                <div><span className="text-muted-foreground">Contract Value:</span> SAR {tender.estimatedContractValue?.toLocaleString()}</div>
                <div><span className="text-muted-foreground">Est. Cost:</span> SAR {tender.estimatedCost?.toLocaleString()}</div>
                <div><span className="text-muted-foreground">Duration:</span> {tender.durationMonths} months</div>
                <div><span className="text-muted-foreground">Margin:</span> {tender.marginEstimate}%</div>
                <div><span className="text-muted-foreground">Risk Level:</span> <Badge variant="outline">{tender.riskLevel}</Badge></div>
                <div><span className="text-muted-foreground">Required Capacity:</span> {tender.requiredCapacity}</div>
                <div><span className="text-muted-foreground">Available Capacity:</span> {tender.internalAvailableCapacity}</div>
                <div><span className="text-muted-foreground">Strategic Fit:</span> {tender.strategicFitScore}/100</div>
              </div>
            </section>
          )}

          <section>
            <h3 className="text-lg font-bold mb-4 border-b pb-2">Objectives</h3>
            {decision.objectives?.length > 0 ? (
              <ul className="list-disc pl-5 text-sm space-y-1">
                {decision.objectives.map((obj: any) => (
                  <li key={obj.id}>{obj.description}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No objectives defined</p>
            )}
          </section>

          <section>
            <h3 className="text-lg font-bold mb-4 border-b pb-2">Constraints</h3>
            {decision.constraints?.length > 0 ? (
              <ul className="list-disc pl-5 text-sm space-y-1">
                {decision.constraints.map((con: any) => (
                  <li key={con.id}>{con.description}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No constraints defined</p>
            )}
          </section>

          <section>
            <h3 className="text-lg font-bold mb-4 border-b pb-2">Assumptions</h3>
            {decision.assumptions?.length > 0 ? (
              <ul className="list-disc pl-5 text-sm space-y-1">
                {decision.assumptions.map((ass: any) => (
                  <li key={ass.id}>{ass.description}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No assumptions defined</p>
            )}
          </section>

          <section>
            <h3 className="text-lg font-bold mb-4 border-b pb-2">Alternatives</h3>
            {decision.alternatives?.length > 0 ? (
              <ul className="list-disc pl-5 text-sm space-y-1">
                {decision.alternatives.map((alt: any) => (
                  <li key={alt.id}>{alt.description}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No alternatives defined</p>
            )}
          </section>

          <section>
            <h3 className="text-lg font-bold mb-4 border-b pb-2">Risk Map</h3>
            {decision.risks?.length > 0 ? (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-muted-foreground">Risk Level:</span> <Badge variant="outline">{tender?.riskLevel || 'N/A'}</Badge></div>
                </div>
                <div>
                  <span className="text-muted-foreground">Identified Risks:</span>
                  <ul className="list-disc pl-5 text-sm mt-1">
                    {decision.risks.map((risk: any) => (
                      <li key={risk.id}>{risk.description} - <span className="font-medium">{risk.level}</span></li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No risks identified</p>
            )}
          </section>

          <section>
            <h3 className="text-lg font-bold mb-4 border-b pb-2">Scenario Comparison</h3>
            {scenarios.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Scenario</TableHead>
                    <TableHead>Feasibility</TableHead>
                    <TableHead>Financial</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead>Risk</TableHead>
                    <TableHead>Strategic</TableHead>
                    <TableHead>Overall</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scenarios.map((s: any) => (
                    <TableRow key={s.type}>
                      <TableCell className="font-medium">{s.type?.replace('_', ' ') || 'Unknown'}</TableCell>
                      <TableCell>{s.simulation?.feasibilityScore ?? 'N/A'}</TableCell>
                      <TableCell>{s.simulation?.financialScore ?? 'N/A'}</TableCell>
                      <TableCell>{s.simulation?.capacityScore ?? 'N/A'}</TableCell>
                      <TableCell>{s.simulation?.riskScore ?? 'N/A'}</TableCell>
                      <TableCell>{s.simulation?.strategicFitScore ?? 'N/A'}</TableCell>
                      <TableCell className="font-bold">{s.simulation?.overallDecisionScore ?? 'N/A'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-muted-foreground">No simulation results yet. Please run simulation first.</p>
            )}
          </section>

          <section>
            <h3 className="text-lg font-bold mb-4 border-b pb-2">Score Breakdown</h3>
            {scenarios.length > 0 ? (
              <div className="grid grid-cols-3 gap-4">
                {(() => {
                  const expectedScenario = scenarios.find((s: any) => s.type === 'EXPECTED_CASE')
                  const sim = expectedScenario?.simulation
                  return [
                    { label: "Feasibility", score: sim?.feasibilityScore ?? 0 },
                    { label: "Financial", score: sim?.financialScore ?? 0 },
                    { label: "Capacity", score: sim?.capacityScore ?? 0 },
                    { label: "Risk", score: sim?.riskScore ?? 0 },
                    { label: "Strategic Fit", score: sim?.strategicFitScore ?? 0 },
                    { label: "Overall", score: sim?.overallDecisionScore ?? 0, highlight: true },
                  ].map((item) => (
                    <Card key={item.label} className={`p-4 ${item.highlight ? "border-primary" : ""}`}>
                      <div className="text-sm text-muted-foreground">{item.label}</div>
                      <div className={`text-2xl font-bold ${item.highlight ? "text-primary" : ""}`}>{item.score}</div>
                    </Card>
                  ))
                })()}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No simulation results available.</p>
            )}
          </section>

          {recommendation && (
            <section>
              <h3 className="text-lg font-bold mb-4 border-b pb-2">Final Recommendation</h3>
              <Card className="p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Recommendation:</span>
                  <Badge>{recommendation.type}</Badge>
                </div>
                {recommendation.confidenceScore && (
                  <div>
                    <span className="text-sm text-muted-foreground">Confidence Score:</span>
                    <span className="ml-2 font-medium">{recommendation.confidenceScore}%</span>
                  </div>
                )}
                {recommendation.reasoning && (
                  <div>
                    <span className="text-sm text-muted-foreground">Reasoning:</span>
                    <p className="text-sm mt-1">{recommendation.reasoning}</p>
                  </div>
                )}
                {recommendation.conditions && (
                  <div>
                    <span className="text-sm text-muted-foreground">Conditions:</span>
                    <p className="text-sm mt-1">{recommendation.conditions}</p>
                  </div>
                )}
                {recommendation.riskNotes && (
                  <div>
                    <span className="text-sm text-muted-foreground">Risk Notes:</span>
                    <p className="text-sm mt-1">{recommendation.riskNotes}</p>
                  </div>
                )}
              </Card>
            </section>
          )}

          <section>
            <h3 className="text-lg font-bold mb-4 border-b pb-2">Governance Trail</h3>
            {auditLogs.length > 0 ? (
                <div className="space-y-2">
                  {auditLogs.map((log: any) => (
                    <div key={log.id} className="flex items-center gap-4 text-sm border-l-2 pl-4 pb-2">
                      <span className="text-muted-foreground w-36">{new Date(log.createdAt).toLocaleString()}</span>
                      <Badge variant="outline">{log.action}</Badge>
                      <span className="font-medium w-40">{log.user?.name || 'Unknown'}</span>
                      <span className="text-muted-foreground">
                        {log.entity && log.entity !== 'undefined' ? `${log.entity} ` : ''}
                        {log.after && Object.keys(parseJson(log.after) || {}).join(', ')}
                      </span>
                    </div>
                  ))}
                </div>
            ) : (
              <p className="text-sm text-muted-foreground">No audit logs yet.</p>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
