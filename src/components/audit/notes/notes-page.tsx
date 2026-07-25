"use client"

import { useTranslations } from "next-intl"
import { AlertTriangle, Bot, Loader2, ShieldCheck } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TraceabilityDrawer } from "@/components/audit/shared/traceability-drawer"
import { DisclosureAutoPanel } from "@/components/audit/notes/disclosure-auto-panel"
import { AuditIntelligencePanel } from "@/components/audit/notes/audit-intelligence-panel"
import { AiDraftsSection } from "@/components/audit/notes/components/ai-drafts-section"
import { NoteCard } from "@/components/audit/notes/components/note-card"
import { NotesEmptyState } from "@/components/audit/notes/components/notes-empty-state"
import { useNotesPage } from "@/components/audit/notes/use-notes-page"

export default function NotesPage() {
  const t = useTranslations("audit.notes")
  const {
    engagementId, engagement, loading, filtered, expandedId, setExpandedId,
    statusFilter, setStatusFilter, showMissing, setShowMissing,
    statuses, statusCounts, isEmpty, aiDrafts, generating, acceptingId,
    traceNote, traceabilityOpen, setTraceabilityOpen, traceData,
    handleGenerateDrafts, handleAcceptDraft, handleRejectDraft,
    handleNoteStatusChange, handleTrace, loadNotes, setTraceNote,
  } = useNotesPage()

  if (loading) return <div className="flex items-center justify-center h-64"><div className="size-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{engagement?.client?.name} — {engagement?.fiscalPeriod}</p>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {statuses.map(s => (
          <Button key={s} variant={statusFilter === s ? "default" : "outline"} size="sm" onClick={() => setStatusFilter(s)}>
            {s === "all" ? `${t("all")} (${statusCounts.all})` : `${s.replace("_", " ")} (${statusCounts[s] ?? 0})`}
          </Button>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <Button variant={showMissing ? "default" : "outline"} size="sm" onClick={() => setShowMissing(!showMissing)}>
            <AlertTriangle className="size-3 me-1" />{t("missingInfo")}
          </Button>
          <Button variant="outline" size="sm" onClick={handleGenerateDrafts} disabled={generating} className="gap-1.5">
            {generating ? <Loader2 className="size-3 animate-spin" /> : <Bot className="size-3" />}
            {t("generateDrafts")}
          </Button>
        </div>
      </div>

      <Card className="border-amber-200 bg-amber-50/50">
        <CardContent className="px-4 py-2.5 flex items-start gap-2">
          <ShieldCheck className="size-4 text-amber-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-medium text-amber-800">{t("draftBanner")}</p>
            <p className="text-[11px] text-amber-700/80 mt-0.5">{t("draftDescription")}</p>
          </div>
        </CardContent>
      </Card>

      <DisclosureAutoPanel engagementId={engagementId} onNotesChanged={loadNotes} />
      <AuditIntelligencePanel engagementId={engagementId} onNotesChanged={loadNotes} />

      {isEmpty && <NotesEmptyState />}

      {aiDrafts.length > 0 && (
        <AiDraftsSection
          aiDrafts={aiDrafts}
          acceptingId={acceptingId}
          onAccept={handleAcceptDraft}
          onReject={handleRejectDraft}
        />
      )}

      <div className="space-y-3">
        {filtered.map(note => (
          <NoteCard
            key={note.id}
            note={note}
            expanded={expandedId === note.id}
            onToggle={() => setExpandedId(expandedId === note.id ? null : note.id)}
            onTrace={handleTrace}
            onStatusChange={handleNoteStatusChange}
          />
        ))}
      </div>

      <TraceabilityDrawer
        open={traceabilityOpen}
        onClose={() => { setTraceabilityOpen(false); setTraceNote(null) }}
        entityType="disclosure_note"
        entityId={traceNote?.id || ''}
        entityLabel={`${t("note")} ${traceNote?.noteNumber} — ${traceNote?.title || ''}`}
        forwardTrace={traceData.forward}
        backwardTrace={traceData.backward}
      />
    </div>
  )
}
