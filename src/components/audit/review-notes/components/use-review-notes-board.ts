"use client";

import { useState, useEffect, useCallback } from "react";
import {
  createReviewNoteAction,
  listReviewNotesAction,
  startReviewNoteWorkAction,
  respondReviewNoteAction,
  reviewReviewNoteAction,
  escalateReviewNoteAction,
  getReviewNoteSLAMetricsAction,
  getReviewNoteSLATargetsAction,
} from "@/actions/audit-review-notes-actions";

interface ReviewNotesBoardState {
  activeTab: string;
  loading: boolean;
  notes: any[];
  slaMetrics: any;
  slaTargets: any;
  error: string | null;
  success: string | null;
  showNewForm: boolean;
  newTargetType: string;
  newTargetId: string;
  newTargetLabel: string;
  newPriority: string;
  newStage: string;
  newComment: string;
  newAssignee: string;
  respondingId: string | null;
  reviewingId: string | null;
  escalatingId: string | null;
  filterStatus: string;
  submitting: boolean;
}

interface ReviewNotesBoardActions {
  setActiveTab: (tab: string) => void;
  setShowNewForm: (show: boolean) => void;
  setNewTargetType: (type: string) => void;
  setNewTargetId: (id: string) => void;
  setNewTargetLabel: (label: string) => void;
  setNewPriority: (priority: string) => void;
  setNewStage: (stage: string) => void;
  setNewComment: (comment: string) => void;
  setNewAssignee: (assignee: string) => void;
  setRespondingId: (id: string | null) => void;
  setReviewingId: (id: string | null) => void;
  setEscalatingId: (id: string | null) => void;
  setFilterStatus: (status: string) => void;
  handleCreateNote: () => Promise<void>;
  handleRespond: (noteId: string, responseText: string) => Promise<void>;
  handleReview: (noteId: string, conclusion: string, comment: string) => Promise<void>;
  handleEscalate: (noteId: string, level: string, reason: string) => Promise<void>;
  handleStartWork: (noteId: string) => Promise<void>;
  resetForm: () => void;
}

export type { ReviewNotesBoardState, ReviewNotesBoardActions };

export function useReviewNotesBoard(engagementId: string) {
  const [activeTab, setActiveTab] = useState("board");
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState<any[]>([]);
  const [slaMetrics, setSlaMetrics] = useState<any>(null);
  const [slaTargets, setSlaTargets] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // New note form
  const [showNewForm, setShowNewForm] = useState(false);
  const [newTargetType, setNewTargetType] = useState("finding");
  const [newTargetId, setNewTargetId] = useState("");
  const [newTargetLabel, setNewTargetLabel] = useState("");
  const [newPriority, setNewPriority] = useState("medium");
  const [newStage, setNewStage] = useState("execution");
  const [newComment, setNewComment] = useState("");
  const [newAssignee, setNewAssignee] = useState("");

  // Interaction state (which forms are open)
  const [respondingId, setRespondingId] = useState<string | null>(null);
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [escalatingId, setEscalatingId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [submitting, setSubmitting] = useState(false);

  const loadNotes = useCallback(async () => {
    try {
      const [n, m, t] = await Promise.all([
        listReviewNotesAction(engagementId, filterStatus !== "all" ? { status: filterStatus } : undefined),
        getReviewNoteSLAMetricsAction(engagementId),
        getReviewNoteSLATargetsAction(),
      ]);
      setNotes(n);
      setSlaMetrics(m);
      setSlaTargets(t);
    } catch (e) {
      setError(e instanceof Error ? e.message : "فشل تحميل ملاحظات المراجعة");
    }
    setLoading(false);
  }, [engagementId, filterStatus]);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  const handleCreateNote = useCallback(async () => {
    setSubmitting(true);
    setError(null);
    try {
      await createReviewNoteAction({
        engagementId,
        targetType: newTargetType,
        targetId: newTargetId,
        targetLabel: newTargetLabel || undefined,
        reviewStage: newStage,
        priority: newPriority,
        comment: newComment,
        assignedToId: newAssignee || undefined,
      });
      setSuccess("تم إنشاء ملاحظة المراجعة");
      setShowNewForm(false);
      resetForm();
      await loadNotes();
    } catch (e) {
      setError(e instanceof Error ? e.message : "فشل إنشاء الملاحظة");
    }
    setSubmitting(false);
  }, [engagementId, newTargetType, newTargetId, newTargetLabel, newStage, newPriority, newComment, newAssignee, loadNotes]);

  const handleRespond = useCallback(async (noteId: string, responseText: string) => {
    if (!responseText.trim()) return;
    setSubmitting(true);
    try {
      await respondReviewNoteAction(noteId, engagementId, responseText);
      setRespondingId(null);
      await loadNotes();
    } catch (e) {
      setError(e instanceof Error ? e.message : "فشل إرسال الرد");
    }
    setSubmitting(false);
  }, [engagementId, loadNotes]);

  const handleReview = useCallback(async (noteId: string, conclusion: string, comment: string) => {
    setSubmitting(true);
    try {
      await reviewReviewNoteAction(noteId, engagementId, conclusion as "satisfactory" | "needs_revision" | "re_open", comment);
      setReviewingId(null);
      await loadNotes();
    } catch (e) {
      setError(e instanceof Error ? e.message : "فشل مراجعة الملاحظة");
    }
    setSubmitting(false);
  }, [engagementId, loadNotes]);

  const handleEscalate = useCallback(async (noteId: string, level: string, reason: string) => {
    if (!reason.trim()) return;
    setSubmitting(true);
    try {
      await escalateReviewNoteAction(noteId, engagementId, level, reason);
      setEscalatingId(null);
      await loadNotes();
    } catch (e) {
      setError(e instanceof Error ? e.message : "فشل تصعيد الملاحظة");
    }
    setSubmitting(false);
  }, [engagementId, loadNotes]);

  const handleStartWork = useCallback(async (noteId: string) => {
    await startReviewNoteWorkAction(noteId, engagementId);
    await loadNotes();
  }, [engagementId, loadNotes]);

  const resetForm = useCallback(() => {
    setNewTargetType("finding");
    setNewTargetId("");
    setNewTargetLabel("");
    setNewPriority("medium");
    setNewStage("execution");
    setNewComment("");
    setNewAssignee("");
  }, []);

  const state: ReviewNotesBoardState = {
    activeTab,
    loading,
    notes,
    slaMetrics,
    slaTargets,
    error,
    success,
    showNewForm,
    newTargetType,
    newTargetId,
    newTargetLabel,
    newPriority,
    newStage,
    newComment,
    newAssignee,
    respondingId,
    reviewingId,
    escalatingId,
    filterStatus,
    submitting,
  };

  const actions: ReviewNotesBoardActions = {
    setActiveTab,
    setShowNewForm,
    setNewTargetType,
    setNewTargetId,
    setNewTargetLabel,
    setNewPriority,
    setNewStage,
    setNewComment,
    setNewAssignee,
    setRespondingId,
    setReviewingId,
    setEscalatingId,
    setFilterStatus,
    handleCreateNote,
    handleRespond,
    handleReview,
    handleEscalate,
    handleStartWork,
    resetForm,
  };

  return { state, actions };
}
