import { generateWhatToDoNowAction } from "@/actions/decision-intelligence"
import { DecisionTabs } from "@/components/decisions/decision-tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function WhatToDoNowPage({ params }: PageProps) {
  const { id } = await params
  const result = await generateWhatToDoNowAction(id)

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

  const whatToDo = result.data!

  const priorityColor: Record<string, string> = {
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
              <CardTitle>ماذا تفعل الآن</CardTitle>
              <CardDescription>
                تُحسَب عند الطلب من مراحل أ-١. قابلة للمراجعة وغير منفّذة.
              </CardDescription>
            </div>
            <Badge className={priorityColor[whatToDo.priority] || ""}>
              الأولوية: {whatToDo.priority}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">إجراء فوري</h3>
            <p className="text-sm font-semibold text-muted-foreground">{whatToDo.immediateAction}</p>
          </div>

          {whatToDo.nextSteps.length > 0 && (
            <div>
              <h3 className="font-medium mb-2">الخطوات التالية</h3>
              <ul className="list-disc pl-5 text-sm text-muted-foreground">
                {whatToDo.nextSteps.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ul>
            </div>
          )}

          {whatToDo.blockers.length > 0 && (
            <div>
              <h3 className="font-medium mb-2 text-destructive">المعوقات</h3>
              <ul className="list-disc pl-5 text-sm text-destructive">
                {whatToDo.blockers.map((blocker, i) => (
                  <li key={i}>{blocker}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              تُحسَب هذه التوصية عند الطلب من بيانات أ-١. تبقى قابلة للمراجعة وغير منفّذة.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
