import { generateExecutiveOverviewAction } from "@/actions/decision-intelligence"
import { DecisionTabs } from "@/components/decisions/decision-tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function ExecutiveOverviewPage({ params }: PageProps) {
  const { id } = await params
  const result = await generateExecutiveOverviewAction(id)

  if (!result.success) {
    return (
      <div className="space-y-6">
        <DecisionTabs decisionId={id} />
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle>Access Blocked</CardTitle>
            <CardDescription>
              {result.error}
              {result.missing && (
                <ul className="mt-2 list-disc pl-5">
                  {result.missing.map((m) => (
                    <li key={m}>{m.replace(/_/g, " ")}</li>
                  ))}
                </ul>
              )}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  const overview = result.data!

  return (
    <div className="space-y-6">
      <DecisionTabs decisionId={id} />
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Executive Decision Overview</CardTitle>
              <CardDescription>
                Computed on-demand from A-1 stages. Human-facing summary for executives.
              </CardDescription>
            </div>
            <Badge variant={overview.decisionQuality >= 80 ? "default" : overview.decisionQuality >= 60 ? "secondary" : "destructive"}>
              Quality: {overview.decisionQuality}%
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Executive Summary</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{overview.executiveSummary}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium mb-2">Strategic Fit</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{overview.strategicFit}</p>
            </div>

            <div>
              <h3 className="font-medium mb-2">Risk Posture</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{overview.riskPosture}</p>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-2">Recommendation</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{overview.recommendation}</p>
          </div>

          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              This overview is computed on-demand from A-1 data. Quality score: {overview.decisionQuality}/100.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
