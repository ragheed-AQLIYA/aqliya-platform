"use client"

import { useEffect, useState } from "react"
import { Lock } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getWorkflowReadinessAction } from "@/actions/audit-read-actions"
import { evaluateTabGate } from "@/lib/audit/workflow-gating"
import type { WorkflowContext } from "@/lib/audit/workflow-gating"

interface WorkflowGuardProps {
  engagementId: string
  tabKey: string
  children: React.ReactNode
  fallbackMessage?: string
}

export function WorkflowGuard({ engagementId, tabKey, children, fallbackMessage }: WorkflowGuardProps) {
  const [context, setContext] = useState<WorkflowContext | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getWorkflowReadinessAction(engagementId)
      .then((r) => setContext(r.context))
      .catch(() => setContext(null))
      .finally(() => setLoading(false))
  }, [engagementId])

  if (loading) {
    return <div className="flex items-center justify-center h-64">
      <div className="size-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  }

  if (!context) return children

  const gate = evaluateTabGate(tabKey, context)
  if (!gate.locked) return children

  return (
    <Card className="border-dashed">
      <CardContent className="p-8 flex flex-col items-center justify-center space-y-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
          <Lock className="h-6 w-6 text-muted-foreground" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-lg font-semibold text-muted-foreground">الخطوة غير متاحة بعد</h2>
          <p className="text-sm text-muted-foreground max-w-md">
            {fallbackMessage || gate.reason || 'أكمل الخطوات السابقة قبل الوصول إلى هذا القسم.'}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => window.history.back()}>
          العودة
        </Button>
      </CardContent>
    </Card>
  )
}
