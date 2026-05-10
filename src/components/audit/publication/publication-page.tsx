"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { FileText, CheckCircle, XCircle, AlertTriangle, Clock, Download, Send, Eye, Sparkles, History, BarChart3, BookOpen, Target, Lightbulb, FileDown, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

import type { PublicationPackage, Engagement } from "@/types/audit"
import { exportFinancialStatementsAction, exportAuditFileAction, exportBilingualAction } from "@/actions/audit-actions"
import { getPublicationPackageAction, getEngagementAction } from "@/actions/audit-read-actions"

const pubStatusColors: Record<string, string> = { draft: "bg-gray-100 text-gray-700 border-gray-300", ready: "bg-green-100 text-green-700 border-green-300", published: "bg-blue-100 text-blue-700 border-blue-300", locked: "bg-red-100 text-red-700 border-red-300" }
const actionIcons: Record<string, React.ReactNode> = { approved: <CheckCircle className="size-4 text-green-600" />, rejected: <XCircle className="size-4 text-red-600" />, modifications_requested: <AlertTriangle className="size-4 text-amber-600" /> }

export default function PublicationPage() {
  const params = useParams()
  const engagementId = params.engagementId as string
  const [pkg, setPkg] = useState<PublicationPackage | null>(null)
  const [engagement, setEngagement] = useState<Engagement | null>(null)
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState<"fs" | "audit" | "bilingual" | null>(null)

  useEffect(() => {
    Promise.all([getPublicationPackageAction(engagementId), getEngagementAction(engagementId)]).then(([p, e]) => {
      setPkg(p); setEngagement(e); setLoading(false)
    })
  }, [engagementId])

function downloadJSON(data: unknown, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}

  if (loading) return <div className="flex items-center justify-center h-64"><div className="size-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
  if (!pkg) return <Card><CardContent className="p-6 text-muted-foreground">Publication package not found.</CardContent></Card>

  const isReady = pkg.status === "ready"

  return (
    <div className="space-y-6" dir="ltr">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Publication</h1>
          <p className="text-sm text-muted-foreground">{engagement?.client?.name} - {engagement?.fiscalPeriod}</p>
        </div>
        <Badge variant="outline" className={`${pubStatusColors[pkg.status]} text-sm px-3 py-1`}>{pkg.status}</Badge>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <FileText className="size-8 mx-auto mb-2 text-muted-foreground" />
            <div className="text-2xl font-bold">{pkg.statements.length}</div>
            <div className="text-xs text-muted-foreground">Statements</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <BookOpen className="size-8 mx-auto mb-2 text-muted-foreground" />
            <div className="text-2xl font-bold">{pkg.notes.length}</div>
            <div className="text-xs text-muted-foreground">Notes</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Target className="size-8 mx-auto mb-2 text-muted-foreground" />
            <div className="text-2xl font-bold">{pkg.findings.length}</div>
            <div className="text-xs text-muted-foreground">Findings</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Lightbulb className="size-8 mx-auto mb-2 text-muted-foreground" />
            <div className="text-2xl font-bold">{pkg.recommendations.length}</div>
            <div className="text-xs text-muted-foreground">Recommendations</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><BarChart3 className="size-4" />Summaries</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-2 p-2 rounded bg-muted/30">
              <CheckCircle className="size-4 text-green-600 mt-0.5" />
              <div>
                <div className="text-sm font-medium">Review Summary</div>
                <p className="text-xs text-muted-foreground">{pkg.reviewSummary}</p>
              </div>
            </div>
            <div className="flex items-start gap-2 p-2 rounded bg-muted/30">
              <AlertTriangle className="size-4 text-amber-600 mt-0.5" />
              <div>
                <div className="text-sm font-medium">Findings Summary</div>
                <p className="text-xs text-muted-foreground">{pkg.findingsSummary}</p>
              </div>
            </div>
            <div className="flex items-start gap-2 p-2 rounded bg-muted/30">
              <FileText className="size-4 text-blue-600 mt-0.5" />
              <div>
                <div className="text-sm font-medium">Evidence Summary</div>
                <p className="text-xs text-muted-foreground">{pkg.evidenceSummary}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><History className="size-4" />Approval History</CardTitle>
        </CardHeader>
        <CardContent>
          {pkg.approvalHistory.length === 0 ? (
            <div className="text-sm text-muted-foreground italic">No approval actions recorded.</div>
          ) : (
            <div className="space-y-3">
              {pkg.approvalHistory.map(rec => (
                <div key={rec.id} className="flex items-start gap-3 p-2 rounded bg-muted/30">
                  {actionIcons[rec.action]}
                  <div>
                    <div className="text-sm font-medium">{rec.approverName} - {rec.action.replace(/_/g, " ")}</div>
                    {rec.rationale && <p className="text-xs text-muted-foreground">{rec.rationale}</p>}
                    <div className="text-xs text-muted-foreground">{new Date(rec.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center gap-3 flex-wrap">
        <Button variant="outline" size="sm" disabled={exporting !== null} onClick={async () => { setExporting("fs"); try { const data = await exportFinancialStatementsAction(engagementId); downloadJSON(data, `financial_statements_${engagementId}.json`) } catch {} finally { setExporting(null) } }} className="gap-1.5">
          {exporting === "fs" ? <Loader2 className="size-3 animate-spin" /> : <FileDown className="size-3" />} Export Statements
        </Button>
        <Button variant="outline" size="sm" disabled={exporting !== null} onClick={async () => { setExporting("audit"); try { const data = await exportAuditFileAction(engagementId); downloadJSON(data, `audit_file_${engagementId}.json`) } catch {} finally { setExporting(null) } }} className="gap-1.5">
          {exporting === "audit" ? <Loader2 className="size-3 animate-spin" /> : <Download className="size-3" />} Export Audit File
        </Button>
        <Button variant="outline" size="sm" disabled={exporting !== null} onClick={async () => { setExporting("bilingual"); try { const data = await exportBilingualAction(engagementId, "ar"); downloadJSON(data, `bilingual_report_${engagementId}.json`) } catch {} finally { setExporting(null) } }} className="gap-1.5">
          {exporting === "bilingual" ? <Loader2 className="size-3 animate-spin" /> : <Sparkles className="size-3" />} Bilingual Export (AR/EN)
        </Button>
        {isReady && <Button size="lg"><Send className="size-4 mr-2" />Publish</Button>}
        {!isReady && pkg.status !== "published" && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="size-3" />Complete the approval checklist to enable publishing
          </div>
        )}
      </div>

      <div className="text-[10px] text-muted-foreground">
        {pkg.status === "draft" && "Draft export — not final. Approved content will include approval metadata."}
        {pkg.status === "published" && "Published — export includes final approved content."}
      </div>
    </div>
  )
}
