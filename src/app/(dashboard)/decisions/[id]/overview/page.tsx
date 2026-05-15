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
            <CardTitle>الوصول محظور</CardTitle>
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
              <CardTitle>نظرة تنفيذية على القرار</CardTitle>
              <CardDescription>
                تُحسَب عند الطلب من مراحل أ-١. موجّهة للجهات التنفيذية.
              </CardDescription>
            </div>
            <Badge variant={overview.decisionQuality >= 80 ? "default" : overview.decisionQuality >= 60 ? "secondary" : "destructive"}>
              الجودة: {overview.decisionQuality}%
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">الملخص التنفيذي</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{overview.executiveSummary}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium mb-2">الملاءمة الاستراتيجية</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{overview.strategicFit}</p>
            </div>

            <div>
              <h3 className="font-medium mb-2">الموقف المخاطري</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{overview.riskPosture}</p>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-2">التوصية</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{overview.recommendation}</p>
          </div>

          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              تُحسَب هذه النظرة عند الطلب من بيانات أ-١. درجة الجودة: {overview.decisionQuality}/100.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
