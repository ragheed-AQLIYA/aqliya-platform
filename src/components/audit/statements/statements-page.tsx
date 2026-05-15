"use client"

import { useEffect, useState, useRef } from "react"
import { useParams } from "next/navigation"
import { FileText, MessageSquare, Download, FileSpreadsheet, Shield, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

import { getTraceabilityAction } from "@/actions/audit-actions"
import type { FinancialStatement, FinancialStatementLine, Engagement } from "@/types/audit"
import { TraceabilityDrawer } from "@/components/audit/shared/traceability-drawer"
import type { TraceabilityNode } from "@/components/audit/shared/traceability-drawer"
import { getFinancialStatementsAction, getEngagementAction } from "@/actions/audit-read-actions"
import { exportEngagementAction } from "@/actions/audit-export-actions"

// Read-only governance indicators — no business logic coupling
import { DraftOnlyBanner, ProvenanceSummary, GovernanceTooltip } from "@/components/audit/governance"
import { getGovernanceContext } from "@/lib/governance/retrieval-router"

const sar = (v: number) => new Intl.NumberFormat('en-SA', { style: 'currency', currency: 'SAR', minimumFractionDigits: 0 }).format(v)

const governanceCtx = getGovernanceContext('statement_drafting')

export default function StatementsPage() {
  const params = useParams()
  const engagementId = params.engagementId as string
  const [statements, setStatements] = useState<FinancialStatement[]>([])
  const [engagement, setEngagement] = useState<Engagement | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedLine, setSelectedLine] = useState<{ statement: FinancialStatement; line: FinancialStatementLine } | null>(null)
  const [traceabilityOpen, setTraceabilityOpen] = useState(false)
  const [traceData, setTraceData] = useState<{ forward: TraceabilityNode[]; backward: TraceabilityNode[] }>({ forward: [], backward: [] })
  const [governanceOpen, setGovernanceOpen] = useState(false)
  const [exporting, setExporting] = useState<'pdf' | 'xlsx' | null>(null)
  const [exportError, setExportError] = useState<string | null>(null)
  const downloadLinkRef = useRef<HTMLAnchorElement>(null)

  useEffect(() => {
    Promise.all([getFinancialStatementsAction(engagementId), getEngagementAction(engagementId)]).then(([s, e]) => {
      setStatements(s); setEngagement(e); setLoading(false)
    })
  }, [engagementId])

  if (loading) return <div className="flex items-center justify-center h-64"><div className="size-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
  if (statements.length === 0) return <Card><CardContent className="p-6 text-muted-foreground">لم يتم العثور على قوائم مالية.</CardContent></Card>

  const getDefaultTab = () => {
    const bs = statements.find(s => s.statementType === "balance_sheet")
    const is = statements.find(s => s.statementType === "income_statement")
    return bs?.id || is?.id || statements[0]?.id || ""
  }

  const statementLabels: Record<string, string> = { balance_sheet: "قائمة المركز المالي", income_statement: "قائمة الدخل", equity: "قائمة التغيرات في حقوق الملكية", cash_flow: "قائمة التدفقات النقدية" }
  const statementIcons: Record<string, React.ReactNode> = { balance_sheet: <FileText className="size-4" />, income_statement: <FileSpreadsheet className="size-4" />, equity: <FileText className="size-4" />, cash_flow: <FileText className="size-4" /> }

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">القوائم المالية</h1>
          <p className="text-sm text-muted-foreground">{engagement?.client?.name} - {engagement?.fiscalPeriod}</p>
        </div>
        <div className="flex items-center gap-2">
          {exportError && <span className="text-xs text-red-600">{exportError}</span>}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" disabled={exporting !== null}>
                {exporting ? <Loader2 className="size-4 ml-1 animate-spin" /> : <Download className="size-4 ml-1" />}
                {exporting ? `جاري تصدير ${exporting.toUpperCase()}...` : 'تصدير'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={async () => {
                setExporting('pdf'); setExportError(null)
                try {
                  const result = await exportEngagementAction(engagementId, 'pdf')
                  const blob = new Blob([Uint8Array.from(atob(result.buffer as string), c => c.charCodeAt(0))], { type: result.mimeType })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a'); a.href = url; a.download = result.filename; a.click()
                  URL.revokeObjectURL(url)
                } catch (e: unknown) { setExportError(e instanceof Error ? e.message : 'فشل التصدير') }
                finally { setExporting(null) }
              }}>
                <FileText className="size-4 ml-2" />تصدير PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={async () => {
                setExporting('xlsx'); setExportError(null)
                try {
                  const result = await exportEngagementAction(engagementId, 'xlsx')
                  const blob = new Blob([Uint8Array.from(atob(result.buffer as string), c => c.charCodeAt(0))], { type: result.mimeType })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a'); a.href = url; a.download = result.filename; a.click()
                  URL.revokeObjectURL(url)
                } catch (e: unknown) { setExportError(e instanceof Error ? e.message : 'فشل التصدير') }
                finally { setExporting(null) }
              }}>
                <FileSpreadsheet className="size-4 ml-2" />تصدير XLSX
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <a ref={downloadLinkRef} className="hidden" />
        </div>
      </div>

      <DraftOnlyBanner taskType="statement_drafting" />

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <GovernanceTooltip content={`المرجعية: ${governanceCtx.doctrineReferences.length} مرجع يوجه سير العمل. الحوكمة: ${governanceCtx.governanceReferences.length} قاعدة مطبقة. ${governanceCtx.humanApprovalRequired ? 'المراجعة البشرية مطلوبة.' : 'لا تتطلب مراجعة بشرية.'}`}>
          <button onClick={() => setGovernanceOpen(!governanceOpen)} className="flex items-center gap-1 hover:text-foreground transition-colors">
            <Shield className="size-3.5" />
            سياق الحوكمة
          </button>
        </GovernanceTooltip>
        <span className="text-muted-foreground/60">·</span>
        <span className="text-muted-foreground/80">{governanceCtx.humanApprovalRequired ? 'المراجعة البشرية مطلوبة قبل الاعتماد' : 'لا تتطلب مراجعة بشرية'}</span>
      </div>

      {governanceOpen && (
        <Card className="border-dashed">
          <CardContent className="p-4 space-y-2 text-sm">
            <p className="font-medium">لماذا الحوكمة مهمة هنا</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              {governanceCtx.doctrineReferences.map(d => <li key={d.documentId}><strong>{d.documentId}:</strong> {d.principle}</li>)}
            </ul>
            <div className="pt-2 border-t">
              <ProvenanceSummary taskType="Statement Drafting" doctrineCount={governanceCtx.doctrineReferences.length} governanceCount={governanceCtx.governanceReferences.length} evidenceStatus="partial" escalationLevel="notice" reviewRequired={governanceCtx.humanApprovalRequired} />
            </div>
          </CardContent>
        </Card>
      )}

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
                    <CardDescription>{engagement?.client?.name} - بتاريخ {engagement?.fiscalPeriod}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {s.reviewComments.length > 0 && (
                      <Badge variant="outline" className="bg-amber-100 text-amber-700 flex items-center gap-1">
                        <MessageSquare className="size-3" />{s.reviewComments.length} تعليقات
                      </Badge>
                    )}
                    <Badge variant="outline" className={s.status === "draft" ? "bg-amber-100 text-amber-700" : s.status === "reviewed" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"}>{s.status === "draft" ? "مسودة" : s.status === "reviewed" ? "تمت المراجعة" : s.status}</Badge>
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
