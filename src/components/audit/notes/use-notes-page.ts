"use client"

import { createLogger } from "@/lib/observability/logger";

import { useCallback, useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { getDisclosureNotesAction, getEngagementAction } from "@/actions/audit-read-actions"
import { generateDraftNotesAction, acceptDraftNoteAction, rejectDraftNoteAction, updateNoteStatusAction } from "@/actions/audit-actions"
import { getTraceabilityAction } from "@/actions/audit-actions"
import type { DisclosureNote, Engagement, AIAssistanceOutput } from "@/types/audit"
import type { TraceabilityNode } from "@/components/audit/shared/traceability-drawer"

const logger = createLogger({ product: "platform", action: "unknown" });

export function useNotesPage() {
  const params = useParams()
  const engagementId = params.engagementId as string

  const [notes, setNotes] = useState<DisclosureNote[]>([])
  const [engagement, setEngagement] = useState<Engagement | null>(null)
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [showMissing, setShowMissing] = useState(false)
  const [traceNote, setTraceNote] = useState<DisclosureNote | null>(null)
  const [traceabilityOpen, setTraceabilityOpen] = useState(false)
  const [traceData, setTraceData] = useState<{ forward: TraceabilityNode[]; backward: TraceabilityNode[] }>({ forward: [], backward: [] })
  const [aiDrafts, setAiDrafts] = useState<AIAssistanceOutput[]>([])
  const [generating, setGenerating] = useState(false)
  const [acceptingId, setAcceptingId] = useState<string | null>(null)

  const loadNotes = useCallback(() => {
    Promise.all([getDisclosureNotesAction(engagementId), getEngagementAction(engagementId)]).then(([n, e]) => {
      setNotes(n); setEngagement(e); setLoading(false)
    })
  }, [engagementId])

  useEffect(() => { loadNotes() }, [loadNotes])

  const handleGenerateDrafts = async () => {
    setGenerating(true)
    try {
      const result = await generateDraftNotesAction(engagementId)
      setAiDrafts(prev => [...result, ...prev])
    } catch (e) {
      logger.error("Failed to generate draft notes", e instanceof Error ? e : undefined)
    } finally {
      setGenerating(false)
    }
  }

  const handleAcceptDraft = async (ai: AIAssistanceOutput) => {
    setAcceptingId(ai.id)
    try {
      const result = await acceptDraftNoteAction(ai.id, ai.outputContent, engagementId)
      if (result.note) {
        setAiDrafts(prev => prev.filter(a => a.id !== ai.id))
        loadNotes()
      }
    } catch (e) {
      logger.error("Failed to accept draft", e instanceof Error ? e : undefined)
    } finally {
      setAcceptingId(null)
    }
  }

  const handleRejectDraft = async (ai: AIAssistanceOutput) => {
    setAcceptingId(ai.id)
    try {
      await rejectDraftNoteAction(ai.id, engagementId)
      setAiDrafts(prev => prev.filter(a => a.id !== ai.id))
    } catch (e) {
      logger.error("Failed to reject draft", e instanceof Error ? e : undefined)
    } finally {
      setAcceptingId(null)
    }
  }

  const handleNoteStatusChange = async (noteId: string, status: string, comment?: string) => {
    try {
      const result = await updateNoteStatusAction(noteId, status, engagementId, comment)
      if (result.note) {
        setNotes(prev => prev.map(n => n.id === noteId ? result.note! : n))
        loadNotes()
      }
    } catch (e) {
      logger.error("Failed to update note status", e instanceof Error ? e : undefined)
    }
  }

  const handleTrace = async (n: DisclosureNote) => {
    setTraceNote(n)
    try {
      const trace = await getTraceabilityAction(engagementId, 'note', n.id)
      setTraceData({ forward: trace.forwardTrace ?? [], backward: trace.backwardTrace ?? [] })
    } catch {
      setTraceData({ forward: [], backward: [] })
    }
    setTraceabilityOpen(true)
  }

  const isEmpty = notes.length === 0 && aiDrafts.length === 0

  let filtered = notes
  if (statusFilter !== "all") filtered = filtered.filter(n => n.status === statusFilter)
  if (showMissing) filtered = filtered.filter(n => n.missingInformation.length > 0)

  const statuses = ["all", ...new Set(notes.map(n => n.status))]
  const statusCounts: Record<string, number> = {
    all: notes.length,
    draft: notes.filter(n => n.status === "draft").length,
    needs_info: notes.filter(n => n.status === "needs_info").length,
    reviewed: notes.filter(n => n.status === "reviewed").length,
    approved: notes.filter(n => n.status === "approved").length,
    rejected: notes.filter(n => n.status === "rejected").length,
  }

  return {
    engagementId,
    engagement,
    loading,
    notes,
    filtered,
    expandedId,
    setExpandedId,
    statusFilter,
    setStatusFilter,
    showMissing,
    setShowMissing,
    statuses,
    statusCounts,
    isEmpty,
    aiDrafts,
    generating,
    acceptingId,
    traceNote,
    setTraceNote,
    traceabilityOpen,
    setTraceabilityOpen,
    traceData,
    handleGenerateDrafts,
    handleAcceptDraft,
    handleRejectDraft,
    handleNoteStatusChange,
    handleTrace,
    loadNotes,
  }
}
