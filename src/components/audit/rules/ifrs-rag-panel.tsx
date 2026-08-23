"use client"

import { useState } from "react"
import { BookOpen, Search } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RagCitationsList } from "@/components/audit/shared/rag-citations-list"
import type { IfrsRuleEvaluation } from "@/lib/audit/rules/types"

interface IfrsRagPanelProps {
  evaluations: IfrsRuleEvaluation[]
  citationCount: number
}

export function IfrsRagPanel({ evaluations, citationCount }: IfrsRagPanelProps) {
  const [expandedRule, setExpandedRule] = useState<string | null>(null)

  const rulesWithCitations = evaluations.filter(
    (e) => e.ragCitations && e.ragCitations.length > 0
  )

  if (rulesWithCitations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <BookOpen className="h-4 w-4" />
            مراجع IFRS المعرفية
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            لا توجد مراجع متاحة لهذا التدقيق
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <BookOpen className="h-4 w-4" />
          مراجع IFRS المعرفية
          <Badge variant="secondary">{citationCount}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {rulesWithCitations.map((eval_) => (
          <div key={eval_.ruleId} className="border rounded-lg p-3">
            <button
              onClick={() =>
                setExpandedRule(
                  expandedRule === eval_.ruleId ? null : eval_.ruleId
                )
              }
              className="w-full text-left flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <Badge variant={eval_.status === "fail" ? "destructive" : "outline"}>
                  {eval_.standardCode} {eval_.paragraphReference}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {eval_.ragCitations?.length} مرجع
                </span>
              </div>
              <Search className="h-4 w-4 text-muted-foreground" />
            </button>
            {expandedRule === eval_.ruleId && (
              <div className="mt-3">
                <RagCitationsList
                  citations={eval_.ragCitations ?? []}
                  size="sm"
                />
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
