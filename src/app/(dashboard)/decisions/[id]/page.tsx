import Link from "next/link"
import { Button } from "@/components/ui/button"
import { DecisionTabs } from "@/components/decisions/decision-tabs"
import { getDecisionById } from "@/actions/decisions"

export default async function DecisionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const result = await getDecisionById(id)
  const decision = result.success ? result.data : null

  // Fallback mocked data if decision not found
  const mockDecision = {
    id: id,
    title: "Decision not found - Mock Data",
    status: "DRAFT",
    owner: { name: "Unknown" },
    type: undefined,
    organization: undefined,
  }

  const displayDecision = decision || mockDecision

  return (
    <main className="p-8">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/decisions">
          <Button variant="outline" size="sm">Back</Button>
        </Link>
        <h1 className="text-2xl font-bold">{displayDecision.title}</h1>
      </div>
      <DecisionTabs decisionId={id} />
      <div className="mt-6">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Status:</span> {displayDecision.status}
          </div>
          <div>
            <span className="text-muted-foreground">Owner:</span> {displayDecision.owner?.name || 'Unassigned'}
          </div>
          <div>
            <span className="text-muted-foreground">Type:</span> {displayDecision.type || 'N/A'}
          </div>
          <div>
            <span className="text-muted-foreground">Organization:</span> {displayDecision.organization?.name || 'N/A'}
          </div>
        </div>

        {decision && (
          <div className="mt-6 space-y-4">
            <section>
              <h2 className="text-lg font-semibold mb-2">Objectives</h2>
              {decision.objectives?.length > 0 ? (
                <ul className="list-disc pl-5 text-sm">
                  {decision.objectives.map((obj: any) => (
                    <li key={obj.id}>{obj.description}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No objectives defined</p>
              )}
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2">Constraints</h2>
              {decision.constraints?.length > 0 ? (
                <ul className="list-disc pl-5 text-sm">
                  {decision.constraints.map((con: any) => (
                    <li key={con.id}>{con.description}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No constraints defined</p>
              )}
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2">Assumptions</h2>
              {decision.assumptions?.length > 0 ? (
                <ul className="list-disc pl-5 text-sm">
                  {decision.assumptions.map((ass: any) => (
                    <li key={ass.id}>{ass.description}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No assumptions defined</p>
              )}
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2">Alternatives</h2>
              {decision.alternatives?.length > 0 ? (
                <ul className="list-disc pl-5 text-sm">
                  {decision.alternatives.map((alt: any) => (
                    <li key={alt.id}>{alt.description}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No alternatives defined</p>
              )}
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2">Risks</h2>
              {decision.risks?.length > 0 ? (
                <ul className="list-disc pl-5 text-sm">
                  {decision.risks.map((risk: any) => (
                    <li key={risk.id}>{risk.description} - <span className="font-medium">{risk.level}</span></li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No risks identified</p>
              )}
            </section>

            {decision.tenderProfile && (
              <section>
                <h2 className="text-lg font-semibold mb-2">Tender Profile</h2>
                <div className="text-sm grid grid-cols-2 gap-2">
                  <div><span className="text-muted-foreground">Client:</span> {decision.tenderProfile.clientName}</div>
                  <div><span className="text-muted-foreground">Contract Value:</span> SAR {decision.tenderProfile.estimatedContractValue?.toLocaleString()}</div>
                  <div><span className="text-muted-foreground">Duration:</span> {decision.tenderProfile.durationMonths} months</div>
                  <div><span className="text-muted-foreground">Margin:</span> {decision.tenderProfile.marginEstimate}%</div>
                </div>
              </section>
            )}

            {decision.scenarios?.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold mb-2">Scenarios & Results</h2>
                <div className="grid gap-4 md:grid-cols-3">
                  {decision.scenarios.map((scenario: any) => (
                    <div key={scenario.id} className="border rounded p-4">
                      <h3 className="font-medium">{scenario.type}</h3>
                      {scenario.simulation && (
                        <div className="text-sm mt-2 space-y-1">
                          <div>Overall Score: <span className="font-bold">{scenario.simulation.overallDecisionScore}</span></div>
                          <div>Financial: {scenario.simulation.financialScore}</div>
                          <div>Capacity: {scenario.simulation.capacityScore}</div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {decision.recommendation && (
              <section>
                <h2 className="text-lg font-semibold mb-2">Recommendation</h2>
                <div className="border rounded p-4">
                  <div className="font-medium">{decision.recommendation.type}</div>
                  <div className="text-sm mt-2">{decision.recommendation.reasoning}</div>
                  {decision.recommendation.conditions && (
                    <div className="text-sm mt-2">
                      <span className="text-muted-foreground">Conditions:</span> {decision.recommendation.conditions}
                    </div>
                  )}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
