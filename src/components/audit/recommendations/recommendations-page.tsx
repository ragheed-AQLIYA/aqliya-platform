"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Lightbulb, Sparkles, CheckCircle, XCircle, ChevronDown, ChevronRight, AlertTriangle, Target, ExternalLink, Edit3, Share2, Plus, Bot, Loader2, RefreshCw } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table"

import { getTraceabilityAction, updateRecommendationStatusAction, createRecommendationAction, generateRecommendationDraftsAction, acceptRecommendationDraftAction, updateAIOutputStatusAction } from "@/actions/audit-actions"
import type { Recommendation, Finding, Engagement, AIAssistanceOutput } from "@/types/audit"
import { TraceabilityDrawer } from "@/components/audit/shared/traceability-drawer"
import type { TraceabilityNode } from "@/components/audit/shared/traceability-drawer"
import { getRecommendationsPaginatedAction, getEngagementAction, getFindingsAction } from "@/actions/audit-read-actions"

const riskColors: Record<string, string> = { low: "bg-green-100 text-green-700 border-green-300", medium: "bg-amber-100 text-amber-700 border-amber-300", high: "bg-orange-100 text-orange-700 border-orange-300", critical: "bg-red-100 text-red-700 border-red-300" }
const statusColors: Record<string, string> = { suggested: "bg-blue-100 text-blue-700 border-blue-300", under_review: "bg-amber-100 text-amber-700 border-amber-300", accepted: "bg-green-100 text-green-700 border-green-300", rejected: "bg-red-100 text-red-700 border-red-300", implemented: "bg-teal-100 text-teal-700 border-teal-300" }
const riskValues: Record<string, number> = { low: 0, medium: 1, high: 2, critical: 3 }

export default function RecommendationsPage() {
  const params = useParams()
  const engagementId = params.engagementId as string
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [engagement, setEngagement] = useState<Engagement | null>(null)
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [traceRec, setTraceRec] = useState<Recommendation | null>(null)
  const [traceabilityOpen, setTraceabilityOpen] = useState(false)
  const [traceData, setTraceData] = useState<{ forward: TraceabilityNode[]; backward: TraceabilityNode[] }>({ forward: [], backward: [] })
  const [showCreate, setShowCreate] = useState(false)
  const [createSubmitting, setCreateSubmitting] = useState(false)
  const [findings, setFindings] = useState<Finding[]>([])
  const [newRec, setNewRec] = useState({ findingId: "", title: "", description: "", recommendedAction: "", riskLevel: "medium" })
  const [createRecError, setCreateRecError] = useState<string | null>(null)
  const [aiDrafts, setAiDrafts] = useState<AIAssistanceOutput[]>([])
  const [generatingRecDrafts, setGeneratingRecDrafts] = useState(false)
  const [acceptingRecId, setAcceptingRecId] = useState<string | null>(null)
  const [recPage, setRecPage] = useState(1)
  const [recHasMore, setRecHasMore] = useState(false)
  const [recTotal, setRecTotal] = useState(0)
  const [loadingRecMore, setLoadingRecMore] = useState(false)
  const RECS_PAGE_SIZE = 20

  useEffect(() => {
    Promise.all([getRecommendationsPaginatedAction(engagementId, 1, RECS_PAGE_SIZE), getEngagementAction(engagementId), getFindingsAction(engagementId)]).then(([r, e, f]) => {
      setRecommendations(r.items); setRecTotal(r.total); setRecHasMore(r.hasMore); setRecPage(1); setEngagement(e); setFindings(f); setLoading(false)
    })
  }, [engagementId])

  const handleCreateRec = async () => {
    setCreateSubmitting(true)
    setCreateRecError(null)
    try {
      const result = await createRecommendationAction({
        engagementId, findingId: newRec.findingId, title: newRec.title,
        description: newRec.description, recommendedAction: newRec.recommendedAction,
        riskLevel: newRec.riskLevel,
      })
      if (result.recommendation) setRecommendations(prev => [result.recommendation, ...prev])
      setShowCreate(false)
      setNewRec({ findingId: "", title: "", description: "", recommendedAction: "", riskLevel: "medium" })
    } catch { setCreateRecError('فشل في إنشاء التوصية') } finally { setCreateSubmitting(false) }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="size-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
  if (recommendations.length === 0) return <Card><CardContent className="p-6 text-muted-foreground">لم يتم العثور على توصيات.</CardContent></Card>

  const sorted = [...recommendations].sort((a, b) => (riskValues[b.riskLevel] || 0) - (riskValues[a.riskLevel] || 0))

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">التوصيات</h1>
          <p className="text-sm text-muted-foreground">{engagement?.client?.name} - {engagement?.fiscalPeriod}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled={generatingRecDrafts} onClick={async () => { setGeneratingRecDrafts(true); try { const r = await generateRecommendationDraftsAction(engagementId); setAiDrafts(prev => [...r, ...prev]) } catch {} finally { setGeneratingRecDrafts(false) } }} className="gap-1.5">
            {generatingRecDrafts ? <Loader2 className="size-3 animate-spin" /> : <Bot className="size-3" />} إنشاء توصيات أولية
          </Button>
          <Button onClick={() => setShowCreate(true)}><Plus className="size-4 ml-1" />توصية جديدة</Button>
        </div>
      </div>

      {aiDrafts.length > 0 && (
        <Card className="border-violet-200">
          <CardHeader className="border-b border-violet-100 px-4 py-3">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <Bot className="h-4 w-4 text-violet-500" />
              توصيات أولية بالذكاء الاصطناعي — تتطلب مراجعة بشرية
              <Badge variant="outline" className="bg-violet-100 text-violet-700 border-violet-200 text-[10px]">غير نهائية</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-violet-100 pt-0">
            {aiDrafts.map(ai => {
              let parsed: Record<string, unknown> = {}
              try { parsed = JSON.parse(ai.outputContent) } catch { parsed = { description: ai.outputContent } }
              return (
                <div key={ai.id} className="py-3 flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border border-violet-200 bg-violet-50 shrink-0">
                    <Sparkles className="h-4 w-4 text-violet-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">{(parsed.title as string) ?? "توصية أولية"}</span>
                      {(() => { const v = parsed.riskLevel; return v != null && v !== "" ? <Badge variant="outline" className={(riskColors[String(v)] ?? "") + " text-[10px]"}>{String(v)}</Badge> : null })()}
                      <span className="text-[10px] text-muted-foreground">{Math.round((ai.confidence ?? 0) * 100)}%</span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{String(parsed.description ?? "")}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">الإجراء: {String(parsed.recommendedAction ?? "")}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                      onClick={async () => { setAcceptingRecId(ai.id); try { const r = await acceptRecommendationDraftAction(ai.id, engagementId); if (r.recommendation) { setRecommendations(prev => [r.recommendation!, ...prev]); setAiDrafts(prev => prev.filter(a => a.id !== ai.id)) } } catch {} finally { setAcceptingRecId(null) } }}
                      disabled={acceptingRecId === ai.id} title="قبول">
                      {acceptingRecId === ai.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={async () => { await updateAIOutputStatusAction(ai.id, 'rejected'); setAiDrafts(prev => prev.filter(a => a.id !== ai.id)) }} title="رفض">
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>العنوان</TableHead>
                <TableHead>النتيجة المرتبطة</TableHead>
                <TableHead>مستوى المخاطرة</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>الذكاء الاصطناعي</TableHead>
                <TableHead>تاريخ الإنشاء</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map(rec => (
                <>
                  <TableRow key={rec.id} className="cursor-pointer" onClick={() => setExpandedId(expandedId === rec.id ? null : rec.id)}>
                    <TableCell className="font-medium">{rec.title}</TableCell>
                    <TableCell>
                      {rec.finding ? (
                        <span className="flex items-center gap-1 text-xs">
                          <Target className="size-3" />{rec.finding.title}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">{rec.findingId}</span>
                      )}
                    </TableCell>
                    <TableCell><Badge variant="outline" className={riskColors[rec.riskLevel]}>{rec.riskLevel}</Badge></TableCell>
                    <TableCell><Badge variant="outline" className={statusColors[rec.status]}>{rec.status.replace(/_/g, " ")}</Badge></TableCell>
                    <TableCell>{rec.aiContributed ? <Sparkles className="size-4 text-purple-500" /> : "-"}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">{new Date(rec.createdAt).toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' })}</TableCell>
                  </TableRow>
                  {expandedId === rec.id && (
                    <TableRow key={`${rec.id}-detail`}>
                      <TableCell colSpan={6} className="bg-muted/30">
                        <div className="p-4 space-y-3 text-sm">
                          <div>
                            <div className="text-muted-foreground text-xs uppercase tracking-wide mb-1">الوصف</div>
                            <p>{rec.description}</p>
                          </div>
                          <div>
                            <div className="text-muted-foreground text-xs uppercase tracking-wide mb-1">الإجراء الموصى به</div>
                            <p>{rec.recommendedAction}</p>
                          </div>
                          {rec.impactAssessment && (
                            <div>
                              <div className="text-muted-foreground text-xs uppercase tracking-wide mb-1">تقييم الأثر</div>
                              <p>{rec.impactAssessment}</p>
                            </div>
                          )}
                          <div className="text-xs text-muted-foreground flex items-center gap-2">
                            <span>النتيجة: <button className="text-blue-600 hover:underline inline-flex items-center gap-0.5">{rec.finding?.title || rec.findingId}<ExternalLink className="size-3" /></button></span>
                          </div>
                          <div className="flex gap-2 pt-1">
                            <Button size="xs" variant="outline" onClick={async (e) => { e.stopPropagation(); setTraceRec(rec); try { const trace = await getTraceabilityAction(engagementId, 'recommendation', rec.id); setTraceData({ forward: trace.forwardTrace ?? [], backward: trace.backwardTrace ?? [] }) } catch { setTraceData({ forward: [], backward: [] }) }; setTraceabilityOpen(true) }}>
                              <Share2 className="size-3 ml-1" />تتبع
                            </Button>
                          </div>
                          {rec.aiContributed && (
                            <div className="border-2 border-purple-300 bg-purple-50/50 rounded-lg p-3 space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="flex items-center gap-1 text-xs font-medium text-purple-700"><Sparkles className="size-3" />اقتراح الذكاء الاصطناعي</span>
                                  <div className="flex items-center gap-1">
                                    <Button size="xs" variant="outline" className="text-green-600 border-green-300" disabled={rec.status === 'accepted' || rec.status === 'rejected'} onClick={async (e) => { e.stopPropagation(); try { const r = await updateRecommendationStatusAction(rec.id, 'accepted', engagementId); if (r.recommendation) setRecommendations(prev => prev.map(rr => rr.id === rec.id ? { ...rr, status: 'accepted' } : rr)) } catch {} }}><CheckCircle className="size-3 ml-1" />قبول</Button>
                                    <Button size="xs" variant="outline" className="text-red-600 border-red-300" disabled={rec.status === 'accepted' || rec.status === 'rejected'} onClick={async (e) => { e.stopPropagation(); try { const r = await updateRecommendationStatusAction(rec.id, 'rejected', engagementId, 'Rejected by reviewer'); if (r.recommendation) setRecommendations(prev => prev.map(rr => rr.id === rec.id ? { ...rr, status: 'rejected' } : rr)) } catch {} }}><XCircle className="size-3 ml-1" />رفض</Button>
                                    <Button size="xs" variant="outline"><Edit3 className="size-3 ml-1" />تعديل</Button>
                                  </div>
                              </div>
                              <p className="text-xs text-purple-900">{rec.description}</p>
                            </div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        {recHasMore && (
          <div className="flex justify-center py-3 border-t">
            <Button variant="outline" size="sm" disabled={loadingRecMore || generatingRecDrafts} onClick={async () => {
              setLoadingRecMore(true)
              try {
                const nextPage = recPage + 1
                const r = await getRecommendationsPaginatedAction(engagementId, nextPage, RECS_PAGE_SIZE)
                setRecommendations(prev => [...prev, ...r.items])
                setRecPage(nextPage)
                setRecHasMore(r.hasMore)
              } catch {} finally { setLoadingRecMore(false) }
            }}>
              {loadingRecMore ? <Loader2 className="size-4 ml-1 animate-spin" /> : <RefreshCw className="size-4 ml-1" />}
              تحميل المزيد ({recTotal - recommendations.length} متبقي)
            </Button>
          </div>
        )}
      </Card>
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>توصية جديدة</DialogTitle><DialogDescription>إنشاء توصية مرتبطة بنتيجة.</DialogDescription></DialogHeader>
          <div className="space-y-3">
            <div><Label>النتيجة المرتبطة</Label>
              <Select value={newRec.findingId} onValueChange={(v) => { if (v !== null) setNewRec({ ...newRec, findingId: v }) }}>
                <SelectTrigger><SelectValue placeholder="اختر نتيجة" /></SelectTrigger>
                <SelectContent>{findings.map(f => <SelectItem key={f.id} value={f.id}>{f.title}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>العنوان</Label><Input value={newRec.title} onChange={e => setNewRec({ ...newRec, title: e.target.value })} placeholder="عنوان التوصية" /></div>
            <div><Label>الوصف</Label><Textarea value={newRec.description} onChange={e => setNewRec({ ...newRec, description: e.target.value })} placeholder="وصف التوصية" /></div>
            <div><Label>الإجراء الموصى به</Label><Textarea value={newRec.recommendedAction} onChange={e => setNewRec({ ...newRec, recommendedAction: e.target.value })} placeholder="ما الإجراء الموصى به؟" /></div>
            <div><Label>مستوى المخاطرة</Label>
              <Select value={newRec.riskLevel} onValueChange={(v) => { if (v !== null) setNewRec({ ...newRec, riskLevel: v }) }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="low">Low</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="high">High</SelectItem></SelectContent>
              </Select>
            </div>
          </div>
          {createRecError && <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"><AlertTriangle className="size-4 shrink-0" /><span>{createRecError}</span></div>}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>إلغاء</Button>
            <Button disabled={!newRec.findingId || !newRec.title.trim() || createSubmitting} onClick={handleCreateRec}>{createSubmitting ? 'جارٍ الإنشاء...' : 'إنشاء'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <TraceabilityDrawer
        open={traceabilityOpen}
        onClose={() => { setTraceabilityOpen(false); setTraceRec(null) }}
        entityType="recommendation"
        entityId={traceRec?.id || ''}
        entityLabel={traceRec?.title || ''}
        forwardTrace={traceData.forward}
        backwardTrace={traceData.backward}
      />
    </div>
  )
}
