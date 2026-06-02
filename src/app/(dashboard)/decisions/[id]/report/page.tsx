"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Printer, FileDown } from "lucide-react"
import { DecisionTabs } from "@/components/decisions/decision-tabs"
import { getDecisionById, exportDecisionReport } from "@/actions/decisions"
import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"

export default function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const t = useTranslations("decisions.report")
  const [id, setId] = useState<string | null>(null)
  const [decision, setDecision] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)

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

  const handleExportPDF = async () => {
    if (!id) return
    setExporting(true)
    try {
      const result = await exportDecisionReport(id)
      if (result.success && result.content) {
        const byteChars = atob(result.content)
        const byteNums = new Array(byteChars.length)
        for (let i = 0; i < byteChars.length; i++) {
          byteNums[i] = byteChars.charCodeAt(i)
        }
        const byteArray = new Uint8Array(byteNums)
        const blob = new Blob([byteArray], { type: result.mimeType })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = result.filename
        a.click()
        URL.revokeObjectURL(url)
      }
    } finally {
      setExporting(false)
    }
  }

  if (loading || !id) {
    return (
      <div>
        <DecisionTabs decisionId={id || ""} />
        <div className="mt-6 text-center">{t("loading")}</div>
      </div>
    )
  }

  if (!decision) {
    return (
      <div>
        <DecisionTabs decisionId={id} />
        <div className="mt-6 text-center text-muted-foreground">{t("decisionNotFound")}</div>
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
          <h2 className="text-xl font-bold">{t("title")}</h2>
          <div className="flex gap-2">
            <Button onClick={handleExportPDF} variant="outline" disabled={exporting}>
              <FileDown className="w-4 h-4 mr-2" />
              {exporting ? t("loading") : t("exportPDF")}
            </Button>
            <Button onClick={handlePrint} variant="outline">
              <Printer className="w-4 h-4 mr-2" />
              {t("printReport")}
            </Button>
          </div>
        </div>

        <div className="space-y-8 print:space-y-6">
          <section>
            <h3 className="text-lg font-bold mb-4 border-b pb-2">{t("decisionHeader")}</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-muted-foreground">{t("titleLabel")}</span> {decision.title}</div>
              <div><span className="text-muted-foreground">{t("statusLabel")}</span> <Badge>{decision.status}</Badge></div>
              <div><span className="text-muted-foreground">{t("ownerLabel")}</span> {decision.owner?.name || t("unassigned")}</div>
              <div><span className="text-muted-foreground">{t("dateLabel")}</span> {new Date(decision.createdAt).toLocaleDateString()}</div>
              <div><span className="text-muted-foreground">{t("organizationLabel")}</span> {decision.organization?.name || t("notAvailable")}</div>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-bold mb-4 border-b pb-2">{t("executiveSummary")}</h3>
            <Card className="p-4">
              <p className="text-sm">
                {recommendation ? (
                  <>
                    Based on rule-based simulation across three scenarios, this tender shows an <strong>Expected Case overall score of {scenarios.find((s: any) => s.type === 'EXPECTED_CASE')?.simulation?.overallDecisionScore || 'N/A'}/100</strong>.
                    The decision is recommended as <Badge>{recommendation.type}</Badge> {recommendation.conditions ? 'pending conditions fulfillment.' : '.'}
                  </>
                ) : (
                  t("noRecommendation")
                )}
              </p>
            </Card>
          </section>

          {tender && (
            <section>
              <h3 className="text-lg font-bold mb-4 border-b pb-2">{t("tenderContext")}</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-muted-foreground">{t("clientLabel")}</span> {tender.clientName}</div>
                <div><span className="text-muted-foreground">{t("contractValue")}</span> SAR {tender.estimatedContractValue?.toLocaleString()}</div>
                <div><span className="text-muted-foreground">{t("estimatedCost")}</span> SAR {tender.estimatedCost?.toLocaleString()}</div>
                <div><span className="text-muted-foreground">{t("duration")}</span> {tender.durationMonths} months</div>
                <div><span className="text-muted-foreground">{t("margin")}</span> {tender.marginEstimate}%</div>
                <div><span className="text-muted-foreground">{t("riskLevel")}</span> <Badge variant="outline">{tender.riskLevel}</Badge></div>
                <div><span className="text-muted-foreground">{t("requiredCapacity")}</span> {tender.requiredCapacity}</div>
                <div><span className="text-muted-foreground">{t("availableCapacity")}</span> {tender.internalAvailableCapacity}</div>
                <div><span className="text-muted-foreground">{t("strategicFit")}</span> {tender.strategicFitScore}/100</div>
              </div>
            </section>
          )}

          <section>
            <h3 className="text-lg font-bold mb-4 border-b pb-2">{t("objectives")}</h3>
            {decision.objectives?.length > 0 ? (
              <ul className="list-disc pl-5 text-sm space-y-1">
                {decision.objectives.map((obj: any) => (
                  <li key={obj.id}>{obj.description}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">{t("noObjectives")}</p>
            )}
          </section>

          <section>
            <h3 className="text-lg font-bold mb-4 border-b pb-2">{t("constraints")}</h3>
            {decision.constraints?.length > 0 ? (
              <ul className="list-disc pl-5 text-sm space-y-1">
                {decision.constraints.map((con: any) => (
                  <li key={con.id}>{con.description}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">{t("noConstraints")}</p>
            )}
          </section>

          <section>
            <h3 className="text-lg font-bold mb-4 border-b pb-2">{t("assumptions")}</h3>
            {decision.assumptions?.length > 0 ? (
              <ul className="list-disc pl-5 text-sm space-y-1">
                {decision.assumptions.map((ass: any) => (
                  <li key={ass.id}>{ass.description}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">{t("noAssumptions")}</p>
            )}
          </section>

          <section>
            <h3 className="text-lg font-bold mb-4 border-b pb-2">{t("alternatives")}</h3>
            {decision.alternatives?.length > 0 ? (
              <ul className="list-disc pl-5 text-sm space-y-1">
                {decision.alternatives.map((alt: any) => (
                  <li key={alt.id}>{alt.description}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">{t("noAlternatives")}</p>
            )}
          </section>

          <section>
            <h3 className="text-lg font-bold mb-4 border-b pb-2">{t("riskMap")}</h3>
            {decision.risks?.length > 0 ? (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-muted-foreground">{t("riskLevel")}</span> <Badge variant="outline">{tender?.riskLevel || t("notAvailable")}</Badge></div>
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
              <p className="text-sm text-muted-foreground">{t("noRisks")}</p>
            )}
          </section>

          <section>
            <h3 className="text-lg font-bold mb-4 border-b pb-2">{t("scenarioComparison")}</h3>
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
              <p className="text-sm text-muted-foreground">{t("noSimulation")}</p>
            )}
          </section>

          <section>
            <h3 className="text-lg font-bold mb-4 border-b pb-2">{t("scoreBreakdown")}</h3>
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
              <h3 className="text-lg font-bold mb-4 border-b pb-2">{t("finalRecommendation")}</h3>
              <Card className="p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">{t("recommendationLabel")}</span>
                  <Badge>{recommendation.type}</Badge>
                </div>
                {recommendation.confidenceScore && (
                  <div>
                    <span className="text-sm text-muted-foreground">{t("confidenceScore")}</span>
                    <span className="ml-2 font-medium">{recommendation.confidenceScore}%</span>
                  </div>
                )}
                {recommendation.reasoning && (
                  <div>
                    <span className="text-sm text-muted-foreground">{t("reasoning")}</span>
                    <p className="text-sm mt-1">{recommendation.reasoning}</p>
                  </div>
                )}
                {recommendation.conditions && (
                  <div>
                    <span className="text-sm text-muted-foreground">{t("conditions")}</span>
                    <p className="text-sm mt-1">{recommendation.conditions}</p>
                  </div>
                )}
                {recommendation.riskNotes && (
                  <div>
                    <span className="text-sm text-muted-foreground">{t("riskNotes")}</span>
                    <p className="text-sm mt-1">{recommendation.riskNotes}</p>
                  </div>
                )}
              </Card>
            </section>
          )}

          <section>
            <h3 className="text-lg font-bold mb-4 border-b pb-2">{t("governanceTrail")}</h3>
            {auditLogs.length > 0 ? (
                <div className="space-y-2">
                  {auditLogs.map((log: any) => (
                    <div key={log.id} className="flex items-center gap-4 text-sm border-l-2 pl-4 pb-2">
                      <span className="text-muted-foreground w-36">{new Date(log.createdAt).toLocaleString()}</span>
                      <Badge variant="outline">{log.action}</Badge>
                      <span className="font-medium w-40">{log.user?.name || t("unassigned")}</span>
                      <span className="text-muted-foreground">
                        {log.entity && log.entity !== 'undefined' ? `${log.entity} ` : ''}
                        {log.after && Object.keys(parseJson(log.after) || {}).join(', ')}
                      </span>
                    </div>
                  ))}
                </div>
            ) : (
              <p className="text-sm text-muted-foreground">{t("noAuditLogs")}</p>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
