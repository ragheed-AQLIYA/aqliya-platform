import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DecisionTabs } from "@/components/decisions/decision-tabs"
import { getDecisionById } from "@/actions/decisions"
import { evaluateDecisionIntake } from "@/lib/decision/intake"
import { evaluateDecisionFramework } from "@/lib/decision/framework"
import { evaluateDecisionScenarios } from "@/lib/decision/scenarios"
import { evaluateDecisionRiskAnalysis } from "@/lib/decision/risk-analysis"
import { evaluateDecisionRecommendation } from "@/lib/decision/recommendation"

export default async function DecisionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const result = await getDecisionById(id)
  const decision = result.success ? result.data : null

  if (!decision) {
    return (
      <main className="p-8">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/decisions">
            <Button variant="outline" size="sm">Back</Button>
          </Link>
          <h1 className="text-2xl font-bold">Decision not found</h1>
        </div>
      </main>
    )
  }

  const intake = evaluateDecisionIntake({
    title: decision.title,
    objectives: decision.objectives,
    alternatives: decision.alternatives,
    risks: decision.risks,
  })

  const frameworkState = evaluateDecisionFramework(decision.framework)
  const scenarioState = evaluateDecisionScenarios(decision.decisionScenarios)
  const riskAnalysisState = evaluateDecisionRiskAnalysis(
    decision.decisionScenarios,
    decision.riskAnalyses
  )
  const recommendationState = evaluateDecisionRecommendation(decision.recommendation)

  return (
    <main className="p-8">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/decisions">
          <Button variant="outline" size="sm">Back</Button>
        </Link>
        <h1 className="text-2xl font-bold">{decision.title}</h1>
      </div>
      <DecisionTabs decisionId={id} />
      <div className="mt-6">
        <div className="grid grid-cols-2 gap-4 text-sm mb-6">
          <div>
            <span className="text-muted-foreground">Status:</span> {decision.status}
          </div>
          <div>
            <span className="text-muted-foreground">Owner:</span> {decision.owner?.name || 'Unassigned'}
          </div>
          <div>
            <span className="text-muted-foreground">Type:</span> {decision.type || 'N/A'}
          </div>
          <div>
            <span className="text-muted-foreground">Organization:</span> {decision.organization?.name || 'N/A'}
          </div>
        </div>

        <div className="space-y-4">
          <section className="rounded-lg border p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">A-1.0 Decision Intake</h2>
              <Badge variant={intake.status === "accepted" ? "default" : intake.status === "rejected" ? "destructive" : "secondary"}>
                {intake.status.replace("_", " ")}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {intake.readyForFramework
                ? "Ready to proceed to A-1.1 Decision Frameworks."
                : "Not ready for framework analysis until intake issues are resolved."}
            </p>
            {intake.reasons.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-medium">Reasons</h3>
                <ul className="mt-2 list-disc pl-5 text-sm">
                  {intake.reasons.map((reason: string) => (
                    <li key={reason}>{reason}</li>
                  ))}
                </ul>
              </div>
            )}
            {intake.requiredNextSteps.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-medium">Required next steps</h3>
                <ul className="mt-2 list-disc pl-5 text-sm">
                  {intake.requiredNextSteps.map((step: string) => (
                    <li key={step}>{step}</li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          <section className="rounded-lg border p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">A-1.1 Decision Framework</h2>
              {intake.status === "accepted" ? (
                <Badge variant={frameworkState.isComplete ? "default" : "secondary"}>
                  {frameworkState.isComplete ? "complete" : "incomplete"}
                </Badge>
              ) : (
                <Badge variant="secondary">blocked</Badge>
              )}
            </div>
            {intake.status !== "accepted" ? (
              <p className="text-sm text-muted-foreground">
                Framework cannot proceed before intake acceptance.
              </p>
            ) : decision.framework ? (
              <div className="grid gap-3 text-sm md:grid-cols-2">
                {[
                  { key: "context", label: "Context" },
                  { key: "purpose", label: "Purpose" },
                  { key: "options", label: "Options" },
                  { key: "criteria", label: "Criteria" },
                  { key: "values", label: "Values" },
                  { key: "informationGaps", label: "Information Gaps" },
                  { key: "certainty", label: "Certainty" },
                  { key: "assumptions", label: "Assumptions" },
                ].map((field) => (
                  <div key={field.key}>
                    <h3 className="font-medium">{field.label}</h3>
                    <p className="mt-1 whitespace-pre-wrap text-muted-foreground">
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      {(decision.framework as any)[field.key] || "Not defined"}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Framework has not been started. Open the Framework tab to define it.
              </p>
            )}
          </section>

          <section className="rounded-lg border p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">A-1.2 Scenarios & Optionality</h2>
              {intake.status !== "accepted" || !frameworkState.isComplete ? (
                <Badge variant="secondary">blocked</Badge>
              ) : (
                <Badge variant={scenarioState.isComplete ? "default" : "secondary"}>
                  {scenarioState.isComplete ? "complete" : "incomplete"}
                </Badge>
              )}
            </div>
            {intake.status !== "accepted" ? (
              <p className="text-sm text-muted-foreground">
                Scenarios cannot proceed before intake acceptance.
              </p>
            ) : !frameworkState.isComplete ? (
              <p className="text-sm text-muted-foreground">
                Scenarios cannot proceed before the framework exists and is complete enough.
              </p>
            ) : decision.decisionScenarios && decision.decisionScenarios.length > 0 ? (
              <div className="grid gap-3 md:grid-cols-3">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {decision.decisionScenarios.map((scenario: any) => (
                  <div key={scenario.id} className="rounded border p-3 text-sm">
                    <h3 className="font-medium">{scenario.name}</h3>
                    <p className="mt-2 whitespace-pre-wrap text-muted-foreground">{scenario.description}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Scenarios have not been started. Open the Scenarios tab to define the base, upside, and downside cases.
              </p>
            )}
          </section>

          <section className="rounded-lg border p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">A-1.3 Risk & Trade-offs</h2>
              {intake.status !== "accepted" || !frameworkState.isComplete || !scenarioState.isComplete ? (
                <Badge variant="secondary">blocked</Badge>
              ) : (
                <Badge variant={riskAnalysisState.isComplete ? "default" : "secondary"}>
                  {riskAnalysisState.isComplete ? "complete" : "incomplete"}
                </Badge>
              )}
            </div>
            {intake.status !== "accepted" ? (
              <p className="text-sm text-muted-foreground">
                Risk analysis cannot proceed before intake acceptance.
              </p>
            ) : !frameworkState.isComplete ? (
              <p className="text-sm text-muted-foreground">
                Risk analysis cannot proceed before the framework exists and is complete.
              </p>
            ) : !scenarioState.isComplete ? (
              <p className="text-sm text-muted-foreground">
                Risk analysis cannot proceed before at least three complete scenarios exist.
              </p>
            ) : decision.riskAnalyses && decision.riskAnalyses.length > 0 ? (
              <div className="grid gap-3 md:grid-cols-3">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {decision.riskAnalyses.map((analysis: any) => (
                  <div key={analysis.id} className="rounded border p-3 text-sm">
                    <h3 className="font-medium">{analysis.scenario?.name || "Scenario"}</h3>
                    <p className="mt-2 whitespace-pre-wrap text-muted-foreground">{analysis.risks}</p>
                    <p className="mt-2 text-xs text-muted-foreground">Uncertainty: {analysis.uncertaintyLevel}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Risk analysis has not been started. Open the Risks tab to analyze risk and trade-offs for each scenario.
              </p>
            )}
          </section>

          <section className="rounded-lg border p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">A-1.4 Recommendation</h2>
              {!recommendationState.isComplete ? (
                <Badge variant="secondary">blocked</Badge>
              ) : (
                <Badge variant="default">complete</Badge>
              )}
            </div>
            {!recommendationState.isComplete ? (
              <p className="text-sm text-muted-foreground">
                Recommendation is blocked until all prerequisites are met.
              </p>
            ) : decision.recommendation ? (
              <div className="space-y-3 text-sm">
                <div>
                  <h3 className="font-medium">Recommended Action</h3>
                  <p className="mt-1 whitespace-pre-wrap text-muted-foreground">{decision.recommendation.recommendedAction}</p>
                </div>
                <div>
                  <h3 className="font-medium">Rationale</h3>
                  <p className="mt-1 whitespace-pre-wrap text-muted-foreground">{decision.recommendation.rationale}</p>
                </div>
                <div>
                  <h3 className="font-medium">Expected Next State</h3>
                  <p className="mt-1 whitespace-pre-wrap text-muted-foreground">{decision.recommendation.expectedNextState}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Recommendation has not been started. Open the Recommendation tab to define it.
              </p>
            )}
          </section>

          {decision.objectives && decision.objectives.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold mb-2">Objectives</h2>
              <ul className="list-disc pl-5 text-sm">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {decision.objectives.map((obj: any) => (
                  <li key={obj.id}>{obj.description}</li>
                ))}
              </ul>
            </section>
          )}

          {decision.constraints && decision.constraints.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold mb-2">Constraints</h2>
              <ul className="list-disc pl-5 text-sm">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {decision.constraints.map((con: any) => (
                  <li key={con.id}>{con.description}</li>
                ))}
              </ul>
            </section>
          )}

          {decision.assumptions && decision.assumptions.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold mb-2">Assumptions</h2>
              <ul className="list-disc pl-5 text-sm">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {decision.assumptions.map((ass: any) => (
                  <li key={ass.id}>{ass.description}</li>
                ))}
              </ul>
            </section>
          )}

          {decision.alternatives && decision.alternatives.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold mb-2">Alternatives</h2>
              <ul className="list-disc pl-5 text-sm">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {decision.alternatives.map((alt: any) => (
                  <li key={alt.id}>{alt.description}</li>
                ))}
              </ul>
            </section>
          )}

          {decision.risks && decision.risks.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold mb-2">Risks</h2>
              <ul className="list-disc pl-5 text-sm">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {decision.risks.map((risk: any) => (
                  <li key={risk.id}>{risk.description} - <span className="font-medium">{risk.level}</span></li>
                ))}
              </ul>
            </section>
          )}

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
        </div>
      </div>
    </main>
  )
}
