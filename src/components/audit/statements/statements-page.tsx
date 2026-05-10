"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { FileText, MessageSquare, Download, FileSpreadsheet } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

import { getTraceabilityAction } from "@/actions/audit-actions"
import type { FinancialStatement, FinancialStatementLine, Engagement } from "@/types/audit"
import { TraceabilityDrawer } from "@/components/audit/shared/traceability-drawer"
import type { TraceabilityNode } from "@/components/audit/shared/traceability-drawer"
import { getFinancialStatementsAction, getEngagementAction } from "@/actions/audit-read-actions"

const sar = (v: number) => new Intl.NumberFormat('en-SA', { style: 'currency', currency: 'SAR', minimumFractionDigits: 0 }).format(v)

export default function StatementsPage() {
  const params = useParams()
  const engagementId = params.engagementId as string
  const [statements, setStatements] = useState<FinancialStatement[]>([])
  const [engagement, setEngagement] = useState<Engagement | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedLine, setSelectedLine] = useState<{ statement: FinancialStatement; line: FinancialStatementLine } | null>(null)
  const [traceabilityOpen, setTraceabilityOpen] = useState(false)
  const [traceData, setTraceData] = useState<{ forward: TraceabilityNode[]; backward: TraceabilityNode[] }>({ forward: [], backward: [] })

  useEffect(() => {
    Promise.all([getFinancialStatementsAction(engagementId), getEngagementAction(engagementId)]).then(([s, e]) => {
      setStatements(s); setEngagement(e); setLoading(false)
    })
  }, [engagementId])

  if (loading) return <div className="flex items-center justify-center h-64"><div className="size-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
  if (statements.length === 0) return <Card><CardContent className="p-6 text-muted-foreground">No financial statements found.</CardContent></Card>

  const getDefaultTab = () => {
    const bs = statements.find(s => s.statementType === "balance_sheet")
    const is = statements.find(s => s.statementType === "income_statement")
    return bs?.id || is?.id || statements[0]?.id || ""
  }

  const statementLabels: Record<string, string> = { balance_sheet: "Statement of Financial Position", income_statement: "Statement of Profit or Loss", equity: "Statement of Changes in Equity", cash_flow: "Statement of Cash Flows" }
  const statementIcons: Record<string, React.ReactNode> = { balance_sheet: <FileText className="size-4" />, income_statement: <FileSpreadsheet className="size-4" />, equity: <FileText className="size-4" />, cash_flow: <FileText className="size-4" /> }

  return (
    <div className="space-y-6" dir="ltr">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Financial Statements</h1>
          <p className="text-sm text-muted-foreground">{engagement?.client?.name} - {engagement?.fiscalPeriod}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-amber-100 text-amber-700">Draft</Badge>
          <Button variant="outline" size="sm"><Download className="size-4 mr-1" />Export</Button>
        </div>
      </div>

      <Tabs defaultValue={getDefaultTab()}>
        <TabsList className="mb-4">
          {statements.map(s => (
            <TabsTrigger key={s.id} value={s.id} className="flex items-center gap-1">
              {statementIcons[s.statementType]}
              {statementLabels[s.statementType] || s.title}
              {s.reviewComments.length > 0 && (
                <Badge variant="outline" className="ml-1 bg-amber-100 text-amber-700 text-[10px] px-1">{s.reviewComments.length}</Badge>
              )}
            </TabsTrigger>
          ))}
        </TabsList>
        {statements.map(s => (
          <TabsContent key={s.id} value={s.id}>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{s.title}</CardTitle>
                    <CardDescription>{engagement?.client?.name} - As at {engagement?.fiscalPeriod}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {s.reviewComments.length > 0 && (
                      <Badge variant="outline" className="bg-amber-100 text-amber-700 flex items-center gap-1">
                        <MessageSquare className="size-3" />{s.reviewComments.length} comments
                      </Badge>
                    )}
                    <Badge variant="outline" className={s.status === "draft" ? "bg-amber-100 text-amber-700" : s.status === "reviewed" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"}>{s.status}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="font-mono text-sm space-y-0.5">
                  {s.lines.map(line => (
                    <div
                      key={line.id}
                      className={`flex items-center justify-between py-1 px-2 rounded cursor-pointer hover:bg-muted/50 ${line.isTotal ? "font-bold border-t border-dashed mt-1 pt-2" : ""}`}
                      onClick={async () => {
                        setSelectedLine({ statement: s, line })
                        try {
                          const trace = await getTraceabilityAction(engagementId, 'statement_line', line.id)
                          setTraceData({ forward: trace.forwardTrace ?? [], backward: trace.backwardTrace ?? [] })
                        } catch {
                          setTraceData({ forward: [], backward: [] })
                        }
                        setTraceabilityOpen(true)
                      }}
                      style={{ paddingLeft: `${12 + line.indentLevel * 20}px` }}
                    >
                      <span className={line.isTotal ? "text-foreground" : "text-muted-foreground"}>{line.label}</span>
                      <span className={line.isTotal ? "text-foreground" : ""}>{sar(line.amount)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      <TraceabilityDrawer
        open={traceabilityOpen}
        onClose={() => { setTraceabilityOpen(false); setSelectedLine(null) }}
        entityType="financial_statement_line"
        entityId={selectedLine?.line.id || ''}
        entityLabel={selectedLine?.line.label || ''}
        forwardTrace={traceData.forward}
        backwardTrace={traceData.backward}
      />
    </div>
  )
}
