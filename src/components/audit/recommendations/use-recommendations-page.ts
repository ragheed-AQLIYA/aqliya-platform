"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  getTraceabilityAction,
  updateRecommendationStatusAction,
  createRecommendationAction,
  generateRecommendationDraftsAction,
  acceptRecommendationDraftAction,
  updateAIOutputStatusAction,
} from "@/actions/audit-actions";
import {
  getRecommendationsPaginatedAction,
  getEngagementAction,
  getFindingsAction,
} from "@/actions/audit-read-actions";
import type {
  Recommendation,
  Finding,
  Engagement,
  AIAssistanceOutput,
} from "@/types/audit";
import type { TraceabilityNode } from "@/components/audit/shared/traceability-drawer";

export const riskColors: Record<string, string> = {
  low: "bg-green-100 text-green-700 border-green-300",
  medium: "bg-amber-100 text-amber-700 border-amber-300",
  high: "bg-orange-100 text-orange-700 border-orange-300",
  critical: "bg-red-100 text-red-700 border-red-300",
};
export const statusColors: Record<string, string> = {
  suggested: "bg-blue-100 text-blue-700 border-blue-300",
  under_review: "bg-amber-100 text-amber-700 border-amber-300",
  accepted: "bg-green-100 text-green-700 border-green-300",
  rejected: "bg-red-100 text-red-700 border-red-300",
  implemented: "bg-teal-100 text-teal-700 border-teal-300",
};
export const riskValues: Record<string, number> = {
  low: 0,
  medium: 1,
  high: 2,
  critical: 3,
};

const RECS_PAGE_SIZE = 20;

export function useRecommendationsPage() {
  const params = useParams();
  const engagementId = params.engagementId as string;
  const t = useTranslations("audit.recommendations");

  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [engagement, setEngagement] = useState<Engagement | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [traceRec, setTraceRec] = useState<Recommendation | null>(null);
  const [traceabilityOpen, setTraceabilityOpen] = useState(false);
  const [traceData, setTraceData] = useState<{
    forward: TraceabilityNode[];
    backward: TraceabilityNode[];
  }>({ forward: [], backward: [] });
  const [showCreate, setShowCreate] = useState(false);
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [newRec, setNewRec] = useState({
    findingId: "",
    title: "",
    description: "",
    recommendedAction: "",
    riskLevel: "medium",
  });
  const [createRecError, setCreateRecError] = useState<string | null>(null);
  const [aiDrafts, setAiDrafts] = useState<AIAssistanceOutput[]>([]);
  const [generatingRecDrafts, setGeneratingRecDrafts] = useState(false);
  const [acceptingRecId, setAcceptingRecId] = useState<string | null>(null);
  const [recPage, setRecPage] = useState(1);
  const [recHasMore, setRecHasMore] = useState(false);
  const [recTotal, setRecTotal] = useState(0);
  const [loadingRecMore, setLoadingRecMore] = useState(false);

  useEffect(() => {
    Promise.all([
      getRecommendationsPaginatedAction(engagementId, 1, RECS_PAGE_SIZE),
      getEngagementAction(engagementId),
      getFindingsAction(engagementId),
    ]).then(([r, e, f]) => {
      setRecommendations(r.items);
      setRecTotal(r.total);
      setRecHasMore(r.hasMore);
      setRecPage(1);
      setEngagement(e);
      setFindings(f);
      setLoading(false);
    });
  }, [engagementId]);

  const handleCreateRec = async () => {
    setCreateSubmitting(true);
    setCreateRecError(null);
    try {
      const result = await createRecommendationAction({
        engagementId,
        findingId: newRec.findingId,
        title: newRec.title,
        description: newRec.description,
        recommendedAction: newRec.recommendedAction,
        riskLevel: newRec.riskLevel,
      });
      if (result.recommendation)
        setRecommendations((prev) => [result.recommendation!, ...prev]);
      setShowCreate(false);
      setNewRec({
        findingId: "",
        title: "",
        description: "",
        recommendedAction: "",
        riskLevel: "medium",
      });
    } catch {
      setCreateRecError(t("createError"));
    } finally {
      setCreateSubmitting(false);
    }
  };

  const onGenerateDrafts = async () => {
    setGeneratingRecDrafts(true);
    try {
      const r = await generateRecommendationDraftsAction(engagementId);
      setAiDrafts((prev) => [...r, ...prev]);
    } catch {
    } finally {
      setGeneratingRecDrafts(false);
    }
  };

  const onAcceptDraft = async (ai: AIAssistanceOutput) => {
    setAcceptingRecId(ai.id);
    try {
      const r = await acceptRecommendationDraftAction(ai.id, engagementId);
      if (r.recommendation) {
        setRecommendations((prev) => [r.recommendation!, ...prev]);
        setAiDrafts((prev) => prev.filter((a) => a.id !== ai.id));
      }
    } catch {
    } finally {
      setAcceptingRecId(null);
    }
  };

  const onRejectDraft = async (ai: AIAssistanceOutput) => {
    await updateAIOutputStatusAction(ai.id, "rejected");
    setAiDrafts((prev) => prev.filter((a) => a.id !== ai.id));
  };

  const onToggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const onTraceability = async (rec: Recommendation) => {
    setTraceRec(rec);
    try {
      const trace = await getTraceabilityAction(
        engagementId,
        "recommendation",
        rec.id,
      );
      setTraceData({
        forward: trace.forwardTrace ?? [],
        backward: trace.backwardTrace ?? [],
      });
    } catch {
      setTraceData({ forward: [], backward: [] });
    }
    setTraceabilityOpen(true);
  };

  const onAcceptStatus = async (rec: Recommendation) => {
    try {
      const r = await updateRecommendationStatusAction(
        rec.id,
        "accepted",
        engagementId,
      );
      if (r.recommendation)
        setRecommendations((prev) =>
          prev.map((rr) =>
            rr.id === rec.id ? { ...rr, status: "accepted" as const } : rr,
          ),
        );
    } catch {
    }
  };

  const onRejectStatus = async (rec: Recommendation) => {
    try {
      const r = await updateRecommendationStatusAction(
        rec.id,
        "rejected",
        engagementId,
        "Rejected by reviewer",
      );
      if (r.recommendation)
        setRecommendations((prev) =>
          prev.map((rr) =>
            rr.id === rec.id ? { ...rr, status: "rejected" as const } : rr,
          ),
        );
    } catch {
    }
  };

  const onLoadMore = async () => {
    setLoadingRecMore(true);
    try {
      const nextPage = recPage + 1;
      const r = await getRecommendationsPaginatedAction(
        engagementId,
        nextPage,
        RECS_PAGE_SIZE,
      );
      setRecommendations((prev) => [...prev, ...r.items]);
      setRecPage(nextPage);
      setRecHasMore(r.hasMore);
    } catch {
    } finally {
      setLoadingRecMore(false);
    }
  };

  const onNewRecChange = (
    update: Partial<{
      findingId: string;
      title: string;
      description: string;
      recommendedAction: string;
      riskLevel: string;
    }>,
  ) => {
    setNewRec((prev) => ({ ...prev, ...update }));
  };

  const sorted = [...recommendations].sort(
    (a, b) =>
      (riskValues[b.riskLevel] || 0) - (riskValues[a.riskLevel] || 0),
  );

  return {
    engagementId,
    t,
    recommendations,
    engagement,
    loading,
    expandedId,
    traceRec,
    traceabilityOpen,
    traceData,
    showCreate,
    createSubmitting,
    findings,
    newRec,
    createRecError,
    aiDrafts,
    generatingRecDrafts,
    acceptingRecId,
    recHasMore,
    recTotal,
    loadingRecMore,
    sorted,
    handleCreateRec,
    onGenerateDrafts,
    onAcceptDraft,
    onRejectDraft,
    onToggleExpand,
    onTraceability,
    onAcceptStatus,
    onRejectStatus,
    onLoadMore,
    onNewRecChange,
    setShowCreate,
    setTraceabilityOpen,
    setTraceRec,
  };
}
