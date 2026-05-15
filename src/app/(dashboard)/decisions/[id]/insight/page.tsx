import { generateStrategicInsightAction } from "@/actions/decision-intelligence"
import { DecisionTabs } from "@/components/decisions/decision-tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function StrategicInsightPage({ params }: PageProps) {
  const { id } = await params
  const result = await generateStrategicInsightAction(id)

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

  const insight = result.data!

  const severityColor: Record<string, string> = {
    INFO: "bg-blue-100 text-blue-800",
    LOW: "bg-green-100 text-green-800",
    MEDIUM: "bg-yellow-100 text-yellow-800",
    HIGH: "bg-red-100 text-red-800",
  }

  return (
    <div className="space-y-6">
      <DecisionTabs decisionId={id} />
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>الرؤية الاستراتيجية للقرار</CardTitle>
              <CardDescription>
                تُحسَب عند الطلب من مراحل أ-١. ناتج للاطلاع فقط.
              </CardDescription>
            </div>
            <Badge className={severityColor[insight.severity] || ""}>
              {insight.severity} الثقة: {insight.confidence}%
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">الملخص</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{insight.summary}</p>
          </div>

          <div>
            <h3 className="font-medium mb-2">العوامل الرئيسية</h3>
            <ul className="list-disc pl-5 text-sm text-muted-foreground">
              {insight.keyFactors.map((factor, i) => (
                <li key={i}>{factor}</li>
              ))}
            </ul>
          </div>

          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              تُحسَب هذه الرؤية عند الطلب من بيانات أ-١. لا تُعدّل البيانات المصدر.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
