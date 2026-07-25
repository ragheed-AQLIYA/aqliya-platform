"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams } from "next/navigation";
import {
  getTraceabilityAction,
  createFindingAction,
  updateFindingStatusAction,
  generateFindingDraftsAction,
  acceptFindingDraftAction,
  updateAIOutputStatusAction,
} from "@/actions/audit-actions";
import type {
  Finding,
  Engagement,
  EvidenceObject,
  Recommendation,
  AIAssistanceOutput,
} from "@/types/audit";
import type { TraceabilityNode } from "@/components/audit/shared/traceability-drawer";
import {
  getFindingsPaginatedAction,
  getEngagementAction,
  getEvidenceAction,
  getRecommendationsAction,
} from "@/actions/audit-read-actions";
import { severityValues } from "./constants";

const FINDINGS_PAGE_SIZE = 20;

export interface FindingsPageState {
  findings: Finding[];
  engagement: Engagement | null;
  loading: boolean;
  expandedId: string | null;
  statusFilter: string;
  severityFilter: string;
  typeFilter: string;
  showCreate: boolean;
  newFinding: {
    title: string;
    findingType: string;
    severity: string;
    description: string;
    rootCause: string;
    impact: string;
  };
  traceFinding: Finding | null;
  traceabilityOpen: boolean;
  traceData: {
    forward: TraceabilityNode[];
    backward: TraceabilityNode[];
  };
  showLinkedEvidence: Finding | null;
  linkedEvidence: EvidenceObject[];
  loadingLinked: boolean;
  showLinkedRecs: Finding | null;
  linkedRecs: Recommendation[];
  loadingLinkedRecs: boolean;
  aiDrafts: AIAssistanceOutput[];
  generatingFindingDrafts: boolean;
  acceptingFindingId: string | null;
  createSubmitting: boolean;
  createError: string | null;
  evidenceCount: number;
  linkedEvidenceCount: number;
  showDismissDialog: boolean;
  dismissTarget: Finding | null;
  dismissing: boolean;
  dismissError: string | null;
  findPage: number;
  findHasMore: boolean;
  findTotal: number;
  loadingFindMore: boolean;
  sorted: Finding[];
}

export interface FindingsPageActions {
  setExpandedId: (id: string | null) => void;
  setStatusFilter: (v: string) => void;
  setSeverityFilter: (v: string) => void;
  setTypeFilter: (v: string) => void;
  setShowCreate: (v: boolean) => void;
  setNewFinding: (v: FindingsPageState["newFinding"]) => void;
  setTraceabilityOpen: (v: boolean) => void;
  setTraceFinding: (v: Finding | null) => void;
  setTraceData: (
    v: { forward: TraceabilityNode[]; backward: TraceabilityNode[] },
  ) => void;
  setShowLinkedEvidence: (v: Finding | null) => void;
  setShowLinkedRecs: (v: Finding | null) => void;
  setShowDismissDialog: (v: boolean) => void;
  setDismissTarget: (v: Finding | null) => void;
  setDismissError: (v: string | null) => void;
  handleCreate: () => Promise<void>;
  handleAcceptDraft: (ai: AIAssistanceOutput) => Promise<void>;
  handleRejectDraft: (ai: AIAssistanceOutput) => void;
  handleAcceptFinding: (finding: Finding) => Promise<void>;
  handleStartReview: (finding: Finding) => Promise<void>;
  handleDismiss: () => Promise<void>;
  handleLoadMore: () => Promise<void>;
  handleGenerateDrafts: () => Promise<void>;
  openLinkedEvidence: (finding: Finding) => Promise<void>;
  openLinkedRecs: (finding: Finding) => Promise<void>;
  openTraceability: (finding: Finding) => Promise<void>;
}

export function useFindingsPage() {
  const params = useParams();
  const engagementId = params.engagementId as string;

  const [findings, setFindings] = useState<Finding[]>([]);
  const [engagement, setEngagement] = useState<Engagement | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [showCreate, setShowCreate] = useState(false);
  const [newFinding, setNewFinding] = useState({
    title: "",
    findingType: "observation",
    severity: "low",
    description: "",
    rootCause: "",
    impact: "",
  });
  const [traceFinding, setTraceFinding] = useState<Finding | null>(null);
  const [traceabilityOpen, setTraceabilityOpen] = useState(false);
  const [traceData, setTraceData] = useState<{
    forward: TraceabilityNode[];
    backward: TraceabilityNode[];
  }>({ forward: [], backward: [] });
  const [showLinkedEvidence, setShowLinkedEvidence] =
    useState<Finding | null>(null);
  const [linkedEvidence, setLinkedEvidence] = useState<EvidenceObject[]>([]);
  const [loadingLinked, setLoadingLinked] = useState(false);
  const [showLinkedRecs, setShowLinkedRecs] = useState<Finding | null>(null);
  const [linkedRecs, setLinkedRecs] = useState<Recommendation[]>([]);
  const [loadingLinkedRecs, setLoadingLinkedRecs] = useState(false);
  const [aiDrafts, setAiDrafts] = useState<AIAssistanceOutput[]>([]);
  const [generatingFindingDrafts, setGeneratingFindingDrafts] =
    useState(false);
  const [acceptingFindingId, setAcceptingFindingId] = useState<string | null>(
    null,
  );
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [evidenceCount, setEvidenceCount] = useState(0);
  const [linkedEvidenceCount, setLinkedEvidenceCount] = useState(0);
  const [showDismissDialog, setShowDismissDialog] = useState(false);
  const [dismissTarget, setDismissTarget] = useState<Finding | null>(null);
  const [dismissing, setDismissing] = useState(false);
  const [dismissError, setDismissError] = useState<string | null>(null);
  const [findPage, setFindPage] = useState(1);
  const [findHasMore, setFindHasMore] = useState(false);
  const [findTotal, setFindTotal] = useState(0);
  const [loadingFindMore, setLoadingFindMore] = useState(false);

  useEffect(() => {
    Promise.all([
      getFindingsPaginatedAction(engagementId, 1, FINDINGS_PAGE_SIZE),
      getEngagementAction(engagementId),
      getEvidenceAction(engagementId).catch(() => []),
    ]).then(([r, e, ev]) => {
      setFindings(r.items);
      setFindTotal(r.total);
      setFindHasMore(r.hasMore);
      setFindPage(1);
      setEngagement(e);
      setEvidenceCount(ev.length);
      setLinkedEvidenceCount(
        ev.filter((item) => item.linkedEntities.length > 0).length,
      );
      setLoading(false);
    });
  }, [engagementId]);

  const sorted = useMemo(() => {
    let filtered = findings;
    if (statusFilter !== "all")
      filtered = filtered.filter((f) => f.status === statusFilter);
    if (severityFilter !== "all")
      filtered = filtered.filter((f) => f.severity === severityFilter);
    if (typeFilter !== "all")
      filtered = filtered.filter((f) => f.findingType === typeFilter);

    return [...filtered].sort(
      (a, b) =>
        (severityValues[b.severity] || 0) - (severityValues[a.severity] || 0),
    );
  }, [findings, statusFilter, severityFilter, typeFilter]);

  const handleCreate = useCallback(async () => {
    setCreateSubmitting(true);
    setCreateError(null);
    try {
      const result = await createFindingAction({
        engagementId,
        title: newFinding.title,
        findingType: newFinding.findingType,
        severity: newFinding.severity,
        description: newFinding.description,
        rootCause: newFinding.rootCause,
        impact: newFinding.impact,
      });
      if (result.finding) setFindings((prev) => [result.finding, ...prev]);
      setShowCreate(false);
      setNewFinding({
        title: "",
        findingType: "observation",
        severity: "low",
        description: "",
        rootCause: "",
        impact: "",
      });
    } catch {
      setCreateError("تعذر إنشاء النتيجة. حاول مرة أخرى.");
    } finally {
      setCreateSubmitting(false);
    }
  }, [engagementId, newFinding]);

  const handleAcceptDraft = useCallback(
    async (ai: AIAssistanceOutput) => {
      setAcceptingFindingId(ai.id);
      try {
        const r = await acceptFindingDraftAction(ai.id, engagementId);
        if (r.finding) {
          setFindings((prev) => [r.finding!, ...prev]);
          setAiDrafts((prev) => prev.filter((a) => a.id !== ai.id));
        }
      } catch {
      } finally {
        setAcceptingFindingId(null);
      }
    },
    [engagementId],
  );

  const handleRejectDraft = useCallback(
    (ai: AIAssistanceOutput) => {
      updateAIOutputStatusAction(ai.id, "rejected");
      setAiDrafts((prev) => prev.filter((a) => a.id !== ai.id));
    },
    [],
  );

  const handleAcceptFinding = useCallback(
    async (finding: Finding) => {
      try {
        const r = await updateFindingStatusAction(
          finding.id,
          "open",
          engagementId,
        );
        if (r.finding)
          setFindings((prev) =>
            prev.map((f) =>
              f.id === finding.id ? { ...f, status: "open" } : f,
            ),
          );
      } catch {}
    },
    [engagementId],
  );

  const handleStartReview = useCallback(
    async (finding: Finding) => {
      try {
        const r = await updateFindingStatusAction(
          finding.id,
          "in_review",
          engagementId,
        );
        if (r.finding)
          setFindings((prev) =>
            prev.map((f) =>
              f.id === finding.id ? { ...f, status: "in_review" } : f,
            ),
          );
      } catch {}
    },
    [engagementId],
  );

  const handleDismiss = useCallback(async () => {
    if (!dismissTarget) return;
    setDismissing(true);
    setDismissError(null);
    try {
      const r = await updateFindingStatusAction(
        dismissTarget.id,
        "dismissed",
        engagementId,
      );
      if (r.finding) {
        setFindings((prev) =>
          prev.map((f) =>
            f.id === dismissTarget.id ? { ...f, status: "dismissed" } : f,
          ),
        );
      }
      setShowDismissDialog(false);
      setDismissTarget(null);
    } catch {
      setDismissError("تعذر تجاهل النتيجة. حاول مرة أخرى.");
    } finally {
      setDismissing(false);
    }
  }, [dismissTarget, engagementId]);

  const handleLoadMore = useCallback(async () => {
    setLoadingFindMore(true);
    try {
      const nextPage = findPage + 1;
      const r = await getFindingsPaginatedAction(
        engagementId,
        nextPage,
        FINDINGS_PAGE_SIZE,
      );
      setFindings((prev) => [...prev, ...r.items]);
      setFindPage(nextPage);
      setFindHasMore(r.hasMore);
    } catch {
    } finally {
      setLoadingFindMore(false);
    }
  }, [engagementId, findPage]);

  const handleGenerateDrafts = useCallback(async () => {
    setGeneratingFindingDrafts(true);
    try {
      const r = await generateFindingDraftsAction(engagementId);
      setAiDrafts((prev) => [...r, ...prev]);
    } catch {
    } finally {
      setGeneratingFindingDrafts(false);
    }
  }, [engagementId]);

  const openLinkedEvidence = useCallback(
    async (finding: Finding) => {
      setLoadingLinked(true);
      try {
        const ev = await getEvidenceAction(engagementId);
        const linked = ev.filter((e) =>
          e.linkedEntities.some(
            (le) =>
              le.targetId === finding.id || le.targetType === "finding",
          ),
        );
        setLinkedEvidence(linked);
        setShowLinkedEvidence(finding);
      } catch {
      } finally {
        setLoadingLinked(false);
      }
    },
    [engagementId],
  );

  const openLinkedRecs = useCallback(
    async (finding: Finding) => {
      setLoadingLinkedRecs(true);
      try {
        const r = await getRecommendationsAction(engagementId);
        const recs = r.filter((re) => re.findingId === finding.id);
        setLinkedRecs(recs);
        setShowLinkedRecs(finding);
      } catch {
      } finally {
        setLoadingLinkedRecs(false);
      }
    },
    [engagementId],
  );

  const openTraceability = useCallback(
    async (finding: Finding) => {
      setTraceFinding(finding);
      try {
        const trace = await getTraceabilityAction(
          engagementId,
          "finding",
          finding.id,
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

  const state: FindingsPageState = {
    findings,
    engagement,
    loading,
    expandedId,
    statusFilter,
    severityFilter,
    typeFilter,
    showCreate,
    newFinding,
    traceFinding,
    traceabilityOpen,
    traceData,
    showLinkedEvidence,
    linkedEvidence,
    loadingLinked,
    showLinkedRecs,
    linkedRecs,
    loadingLinkedRecs,
    aiDrafts,
    generatingFindingDrafts,
    acceptingFindingId,
    createSubmitting,
    createError,
    evidenceCount,
    linkedEvidenceCount,
    showDismissDialog,
    dismissTarget,
    dismissing,
    dismissError,
    findPage,
    findHasMore,
    findTotal,
    loadingFindMore,
    sorted,
  };

  const actions: FindingsPageActions = {
    setExpandedId,
    setStatusFilter,
    setSeverityFilter,
    setTypeFilter,
    setShowCreate,
    setNewFinding,
    setTraceabilityOpen,
    setTraceFinding,
    setTraceData,
    setShowLinkedEvidence,
    setShowLinkedRecs,
    setShowDismissDialog,
    setDismissTarget,
    setDismissError,
    handleCreate,
    handleAcceptDraft,
    handleRejectDraft,
    handleAcceptFinding,
    handleStartReview,
    handleDismiss,
    handleLoadMore,
    handleGenerateDrafts,
    openLinkedEvidence,
    openLinkedRecs,
    openTraceability,
  };

  return { engagementId, state, actions };
}
