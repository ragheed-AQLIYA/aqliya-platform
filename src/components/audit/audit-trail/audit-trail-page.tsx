"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Sparkles, User, Search, Filter, ChevronDown, ChevronRight, Clock, ArrowRight, Calendar, Share2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { getTraceabilityAction } from "@/actions/audit-actions"
import type { AuditEvent, Engagement } from "@/types/audit"
import { TraceabilityDrawer } from "@/components/audit/shared/traceability-drawer"
import type { TraceabilityNode } from "@/components/audit/shared/traceability-drawer"
import { getAuditEventsAction, getEngagementAction } from "@/actions/audit-read-actions"

const eventTypeLabels: Record<string, string> = {
  "engagement.created": "Engagement Created", "team.assigned": "Team Assigned",
  "trial_balance.uploaded": "TB Uploaded", "mapping.ai_suggested": "AI Mappings Suggested",
  "mapping.confirmed": "Mapping Confirmed", "validation.completed": "Validation Completed",
  "evidence.uploaded": "Evidence Uploaded", "evidence.accepted": "Evidence Accepted",
  "signal.generated": "AI Signal Generated", "finding.created": "Finding Created",
  "finding.state_changed": "Finding State Changed", "recommendation.ai_suggested": "AI Recommendation",
  "recommendation.created": "Recommendation Created", "recommendation.state_changed": "Recommendation Updated",
  "review.comment_added": "Review Comment Added",
  "engagement.state_changed": "Engagement State Changed",
  "ai.output_generated": "AI Output Generated",
  "ai.output_accepted": "AI Output Accepted",
  "ai.output_rejected": "AI Output Rejected",
  "ai.notes_draft_generated": "AI Draft Notes Generated",
  "ai.notes_draft_accepted": "AI Draft Notes Accepted",
  "ai.notes_draft_rejected": "AI Draft Notes Rejected",
  "ai.finding_draft_generated": "AI Finding Draft Generated",
  "ai.finding_draft_accepted": "AI Finding Draft Accepted",
  "ai.recommendation_draft_generated": "AI Recommendation Draft Generated",
  "ai.recommendation_draft_accepted": "AI Recommendation Draft Accepted",
  "ai.analytical_review_generated": "AI Analytical Review Generated",
  "evidence.state_changed": "Evidence State Changed",
  "evidence.file_scanned": "File Scan Result",
  "pilot.feedback_created": "Pilot Feedback Created",
  "pilot.feedback_updated": "Pilot Feedback Updated",
  "pilot.blocker_created": "Production Blocker Created",
  "pilot.blocker_updated": "Production Blocker Updated",
  "pilot.signoff_updated": "Pilot Sign-off Updated",
  "audit_user.created": "Audit User Created",
  "audit_user.role_updated": "Audit User Role Updated",
  "audit_user.deactivated": "Audit User Deactivated",
}

export default function AuditTrailPage() {
  const params = useParams()
  const engagementId = params.engagementId as string
  const [events, setEvents] = useState<AuditEvent[]>([])
  const [engagement, setEngagement] = useState<Engagement | null>(null)
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [actorFilter, setActorFilter] = useState<string>("all")
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(0)
  const pageSize = 20
  const [traceEvent, setTraceEvent] = useState<AuditEvent | null>(null)
  const [traceabilityOpen, setTraceabilityOpen] = useState(false)
  const [traceData, setTraceData] = useState<{ forward: TraceabilityNode[]; backward: TraceabilityNode[] }>({ forward: [], backward: [] })

  useEffect(() => {
    Promise.all([getAuditEventsAction(engagementId), getEngagementAction(engagementId)]).then(([e, eng]) => {
      setEvents(e); setEngagement(eng); setLoading(false)
    })
  }, [engagementId])

  if (loading) return <div className="flex items-center justify-center h-64"><div className="size-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
  if (events.length === 0) return <Card><CardContent className="p-6 text-muted-foreground">No audit events found.</CardContent></Card>

  const uniqueTypes = [...new Set(events.map(e => e.eventType))]
  const uniqueActors = [...new Set(events.map(e => e.actorName))]

  let filtered = [...events]
  if (typeFilter !== "all") filtered = filtered.filter(e => e.eventType === typeFilter)
  if (actorFilter !== "all") filtered = filtered.filter(e => e.actorName === actorFilter)
  if (search) filtered = filtered.filter(e => e.description.toLowerCase().includes(search.toLowerCase()) || e.actorName.toLowerCase().includes(search.toLowerCase()))

  const sorted = filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  const paged = sorted.slice(0, (page + 1) * pageSize)
  const hasMore = paged.length < sorted.length

  return (
    <div className="space-y-6" dir="ltr">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Audit Trail</h1>
        <p className="text-sm text-muted-foreground">{engagement?.client?.name} - {engagement?.fiscalPeriod}</p>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input placeholder="Search events..." className="pl-8" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={typeFilter} onValueChange={(v) => { if (v !== null) { setTypeFilter(v) } }}>
          <SelectTrigger className="w-48"><SelectValue placeholder="Event type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {uniqueTypes.map(t => <SelectItem key={t} value={t}>{eventTypeLabels[t] || t}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={actorFilter} onValueChange={(v) => { if (v !== null) { setActorFilter(v) } }}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Actor" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actors</SelectItem>
            {uniqueActors.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
          </SelectContent>
        </Select>
        <div className="text-xs text-muted-foreground ml-auto">{sorted.length} events</div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="relative">
            <div className="absolute left-6 top-0 bottom-0 w-px bg-border hidden md:block" />
            <div className="divide-y">
              {paged.map(ev => (
                <div key={ev.id} className="relative md:pl-14 p-4 hover:bg-muted/20">
                  <div className="hidden md:flex absolute left-3 top-5 w-2 h-2 rounded-full bg-muted-foreground/30 ring-2 ring-background" />
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium">{eventTypeLabels[ev.eventType] || ev.eventType}</span>
                        {ev.aiRelated && (
                          <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-300 flex items-center gap-1 text-[10px]">
                            <Sparkles className="size-2.5" />AI
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5">{ev.description}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><User className="size-3" />{ev.actorName}</span>
                        <Badge variant="outline" className="text-[10px]">{ev.actorRole}</Badge>
                        <span className="flex items-center gap-1"><Clock className="size-3" />{new Date(ev.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                        <Button size="xs" variant="ghost" className="h-5 px-1" onClick={async () => { setTraceEvent(ev); try { const trace = await getTraceabilityAction(engagementId, 'audit_event', ev.id); setTraceData({ forward: trace.forwardTrace ?? [], backward: trace.backwardTrace ?? [] }) } catch { setTraceData({ forward: [], backward: [] }) }; setTraceabilityOpen(true) }}><Share2 className="size-3" /></Button>
                      </div>
                      {ev.previousState && (
                        <div className="flex items-center gap-1 mt-1 text-xs">
                          <Badge variant="outline" className="text-[10px] bg-muted">{ev.previousState}</Badge>
                          <ArrowRight className="size-3 text-muted-foreground" />
                          <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-700">{ev.newState}</Badge>
                        </div>
                      )}
                      <div className="text-[10px] text-muted-foreground/50 mt-0.5">
                        {ev.targetType}: {ev.targetId}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {hasMore && (
        <div className="flex justify-center">
          <Button variant="outline" onClick={() => setPage(page + 1)}>Load More</Button>
        </div>
      )}

      <TraceabilityDrawer
        open={traceabilityOpen}
        onClose={() => { setTraceabilityOpen(false); setTraceEvent(null) }}
        entityType="audit_event"
        entityId={traceEvent?.id || ''}
        entityLabel={traceEvent?.eventType || ''}
        forwardTrace={traceData.forward}
        backwardTrace={traceData.backward}
      />
    </div>
  )
}
