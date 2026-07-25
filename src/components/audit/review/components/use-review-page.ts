"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  getReviewCommentsAction,
  getEngagementAction,
  getFinancialStatementsAction,
  getDisclosureNotesAction,
  getFindingsAction,
  getEvidenceAction,
  getRecommendationsAction,
} from "@/actions/audit-read-actions";
import {
  createReviewCommentAction,
  updateReviewCommentStatusAction,
  getTraceabilityAction,
} from "@/actions/audit-actions";
import type {
  ReviewComment,
  Engagement,
  FinancialStatement,
  DisclosureNote,
  Finding,
  EvidenceObject,
  Recommendation,
} from "@/types/audit";
import type { TraceabilityNode } from "@/components/audit/shared/traceability-drawer";

export function useReviewPage() {
  const t = useTranslations("audit.review");
  const params = useParams();
  const engagementId = params.engagementId as string;

  const [comments, setComments] = useState<ReviewComment[]>([]);
  const [engagement, setEngagement] = useState<Engagement | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "open" | "resolved">("all");
  const [newComment, setNewComment] = useState("");
  const [commentTargetType, setCommentTargetType] = useState("statement_line");
  const [commentTargetId, setCommentTargetId] = useState("");
  const [sending, setSending] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);
  const [traceComment, setTraceComment] = useState<ReviewComment | null>(null);
  const [traceabilityOpen, setTraceabilityOpen] = useState(false);
  const [traceData, setTraceData] = useState<{
    forward: TraceabilityNode[];
    backward: TraceabilityNode[];
  }>({ forward: [], backward: [] });
  const [statements, setStatements] = useState<FinancialStatement[]>([]);
  const [notes, setNotes] = useState<DisclosureNote[]>([]);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [evidenceList, setEvidenceList] = useState<EvidenceObject[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);

  useEffect(() => {
    Promise.all([
      getReviewCommentsAction(engagementId),
      getEngagementAction(engagementId),
    ]).then(([c, e]) => {
      setComments(c);
      setEngagement(e);
      setLoading(false);
    });
    Promise.all([
      getFinancialStatementsAction(engagementId),
      getDisclosureNotesAction(engagementId),
      getFindingsAction(engagementId),
      getEvidenceAction(engagementId),
      getRecommendationsAction(engagementId),
    ]).then(([s, n, f, ev, r]) => {
      setStatements(s);
      setNotes(n);
      setFindings(f);
      setEvidenceList(ev);
      setRecommendations(r);
    });
  }, [engagementId]);

  const getTargetOptions = useCallback((): { id: string; label: string }[] => {
    switch (commentTargetType) {
      case "statement_line":
        return statements.flatMap((s) =>
          (s.lines || []).map((l) => ({
            id: l.id,
            label: `${s.title} — ${l.label}`,
          })),
        );
      case "note":
        return notes.map((n) => ({
          id: n.id,
          label: `Note ${n.noteNumber} — ${n.title}`,
        }));
      case "finding":
        return findings.map((f) => ({ id: f.id, label: f.title }));
      case "evidence":
        return evidenceList.map((e) => ({ id: e.id, label: e.filename }));
      case "recommendation":
        return recommendations.map((r) => ({ id: r.id, label: r.title }));
      default:
        return [];
    }
  }, [commentTargetType, statements, notes, findings, evidenceList, recommendations]);

  const handleAddComment = useCallback(async () => {
    if (!newComment.trim()) return;
    setSending(true);
    setCommentError(null);
    try {
      const result = await createReviewCommentAction({
        engagementId,
        targetType: commentTargetType,
        targetId: commentTargetId,
        comment: newComment,
        requiredAction: "revise",
      });
      if (result.comment) setComments((prev) => [result.comment, ...prev]);
      setNewComment("");
    } catch {
      setCommentError(t("failedToAdd"));
    } finally {
      setSending(false);
    }
  }, [engagementId, commentTargetType, commentTargetId, newComment, t]);

  const handleTrace = useCallback(
    async (c: ReviewComment) => {
      setTraceComment(c);
      try {
        const trace = await getTraceabilityAction(
          engagementId,
          "review_comment",
          c.id,
        );
        setTraceData({
          forward: trace.forwardTrace ?? [],
          backward: trace.backwardTrace ?? [],
        });
      } catch {
        setTraceData({ forward: [], backward: [] });
      }
      setTraceabilityOpen(true);
    },
    [engagementId],
  );

  const handleResolve = useCallback(async (c: ReviewComment) => {
    try {
      const r = await updateReviewCommentStatusAction(
        c.id,
        "resolved",
        "Addressed",
      );
      if (r.comment)
        setComments((prev) =>
          prev.map((cc) =>
            cc.id === c.id
              ? {
                  ...cc,
                  status: "resolved",
                  resolution: "Addressed",
                  resolvedAt: new Date().toISOString(),
                }
              : cc,
          ),
        );
    } catch { /* noop */ }
  }, []);

  const openCount = useMemo(
    () => comments.filter((c) => c.status === "open").length,
    [comments],
  );

  const filteredComments = useMemo(() => {
    if (filter === "all") return comments;
    return comments.filter((c) => c.status === filter);
  }, [comments, filter]);

  const targetLabels = useMemo(
    () =>
      new Map(
        comments.map((c) => [
          c.id,
          `${c.targetType}: ${c.targetId.substring(0, 8)}...`,
        ]),
      ),
    [comments],
  );

  return {
    comments,
    engagement,
    loading,
    filter,
    setFilter,
    newComment,
    setNewComment,
    commentTargetType,
    setCommentTargetType,
    commentTargetId,
    setCommentTargetId,
    sending,
    commentError,
    traceComment,
    traceabilityOpen,
    setTraceabilityOpen,
    setTraceComment,
    traceData,
    openCount,
    filteredComments,
    targetLabels,
    getTargetOptions,
    handleAddComment,
    handleTrace,
    handleResolve,
  };
}
