"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  updateEvidenceStateWithEventAction,
  createEvidenceAction,
  linkEvidenceToEntityAction,
  generateEvidenceSuggestionsAction,
  acceptEvidenceSuggestionAction,
  uploadEvidenceFileAction,
  getEvidenceDownloadUrlAction,
} from "@/actions/audit-actions";
import {
  getEvidencePaginatedAction,
  getEvidenceAction,
  getEngagementAction,
  getFindingsAction,
} from "@/actions/audit-read-actions";
import type {
  EvidenceObject,
  Engagement,
  Finding,
  AIAssistanceOutput,
} from "@/types/audit";
import type { TraceabilityNode } from "@/components/audit/shared/traceability-drawer";

const PAGE_SIZE = 20;

export function useEvidencePage() {
  const params = useParams();
  const engagementId = params.engagementId as string;
  const t = useTranslations("audit.evidence");

  const [evidence, setEvidence] = useState<EvidenceObject[]>([]);
  const [engagement, setEngagement] = useState<Engagement | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedEv, setSelectedEv] = useState<EvidenceObject | null>(null);
  const [traceEvOpen, setTraceEvOpen] = useState(false);
  const [traceEvData, setTraceEvData] = useState<{
    forward: TraceabilityNode[];
    backward: TraceabilityNode[];
  }>({ forward: [], backward: [] });
  const [stateFilter, setStateFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [showRequest, setShowRequest] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkTargetType, setLinkTargetType] = useState("finding");
  const [linkTargetId, setLinkTargetId] = useState("");
  const [linkSubmitting, setLinkSubmitting] = useState(false);
  const [findingsList, setFindingsList] = useState<Finding[]>([]);
  const [linkError, setLinkError] = useState<string | null>(null);
  const [aiSuggestions, setAiSuggestions] = useState<AIAssistanceOutput[]>([]);
  const [suggesting, setSuggesting] = useState(false);
  const [acceptingSuggestionId, setAcceptingSuggestionId] = useState<
    string | null
  >(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [evPage, setEvPage] = useState(1);
  const [evHasMore, setEvHasMore] = useState(false);
  const [evTotal, setEvTotal] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [versionHistoryOpen, setVersionHistoryOpen] = useState(false);

  const missingCount = evidence.filter((e) => e.state === "missing").length;

  const filtered = evidence
    .filter((e) => stateFilter === "all" || e.state === stateFilter)
    .filter(
      (e) => !search || e.filename.toLowerCase().includes(search.toLowerCase()),
    );

  const stateLabel: Record<string, string> = {
    missing: t("missingState"),
    requested: t("requestedState"),
    uploaded: t("uploadedState"),
    linked: t("linkedState"),
    reviewed: t("reviewedState"),
    accepted: t("acceptedState"),
    rejected: t("rejectedState"),
  };

  useEffect(() => {
    Promise.all([
      getEvidencePaginatedAction(engagementId, 1, PAGE_SIZE),
      getEngagementAction(engagementId),
    ]).then(([r, eng]) => {
      setEvidence(r.items);
      setEvTotal(r.total);
      setEvHasMore(r.hasMore);
      setEvPage(1);
      setEngagement(eng);
      setLoading(false);
    });
  }, [engagementId]);

  const handleGenerateSuggestions = useCallback(async () => {
    setSuggesting(true);
    try {
      const result = await generateEvidenceSuggestionsAction(engagementId);
      setAiSuggestions((prev) => [...result, ...prev]);
    } catch {
      /* silent */
    } finally {
      setSuggesting(false);
    }
  }, [engagementId]);

  const handleAcceptSuggestion = useCallback(
    async (ai: AIAssistanceOutput) => {
      setAcceptingSuggestionId(ai.id);
      try {
        const r = await acceptEvidenceSuggestionAction(ai.id, engagementId);
        if (r.evidence) {
          setEvidence((prev) => [r.evidence!, ...prev]);
          setAiSuggestions((prev) => prev.filter((a) => a.id !== ai.id));
        }
      } catch {
        /* silent */
      } finally {
        setAcceptingSuggestionId(null);
      }
    },
    [engagementId],
  );

  const handleDismissSuggestion = useCallback((id: string) => {
    setAiSuggestions((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const handleLoadMore = useCallback(async () => {
    setLoadingMore(true);
    try {
      const nextPage = evPage + 1;
      const r = await getEvidencePaginatedAction(
        engagementId,
        nextPage,
        PAGE_SIZE,
      );
      setEvidence((prev) => [...prev, ...r.items]);
      setEvPage(nextPage);
      setEvHasMore(r.hasMore);
    } catch {
      /* silent */
    } finally {
      setLoadingMore(false);
    }
  }, [engagementId, evPage]);

  const handleUploadFile = useCallback(
    async (file: File, targetId: string) => {
      setUploadingId(targetId);
      setActionError(null);
      try {
        const ext = file.name.split(".").pop()?.toLowerCase() || "pdf";
        const buf = await file.arrayBuffer();
        const base64 = Buffer.from(buf).toString("base64");
        const result = await uploadEvidenceFileAction({
          engagementId,
          filename: file.name,
          fileType: ext,
          fileData: base64,
        });
        const updated = await getEvidenceAction(engagementId);
        setEvidence(updated);
        if (result.evidence) setSelectedEv(result.evidence);
      } catch (e: unknown) {
        setActionError(e instanceof Error ? e.message : t("uploadFailed"));
      } finally {
        setUploadingId(null);
      }
    },
    [engagementId, t],
  );

  const handleDownload = useCallback(
    async (ev: EvidenceObject) => {
      setDownloadingId(ev.id);
      setActionError(null);
      try {
        const info = await getEvidenceDownloadUrlAction(ev.id, engagementId);
        if (info) {
          window.open(info.url, "_blank");
        } else {
          setActionError(
            "الملف غير متوفر للتنزيل — قد يكون محذوفاً من التخزين أو لم يُرفع بعد.",
          );
        }
      } catch (e: unknown) {
        setActionError(e instanceof Error ? e.message : t("downloadFailed"));
      } finally {
        setDownloadingId(null);
      }
    },
    [engagementId, t],
  );

  const handleAccept = useCallback(
    async (ev: EvidenceObject) => {
      setActionError(null);
      try {
        const result = await updateEvidenceStateWithEventAction(
          ev.id,
          "accepted",
          engagementId,
        );
        if (result.evidence) {
          setEvidence((prev) =>
            prev.map((e) =>
              e.id === ev.id ? { ...e, state: "accepted" } : e,
            ),
          );
          setSelectedEv({ ...ev, state: "accepted" });
        }
      } catch {
        setActionError(t("verifyFailed"));
      }
    },
    [engagementId, t],
  );

  const handleMarkReviewed = useCallback(
    async (ev: EvidenceObject) => {
      setActionError(null);
      try {
        const result = await updateEvidenceStateWithEventAction(
          ev.id,
          "reviewed",
          engagementId,
        );
        if (result.evidence) {
          setEvidence((prev) =>
            prev.map((e) =>
              e.id === ev.id ? { ...e, state: "reviewed" } : e,
            ),
          );
          setSelectedEv({ ...ev, state: "reviewed" });
        }
      } catch {
        setActionError(t("updateFailed"));
      }
    },
    [engagementId, t],
  );

  const handleRejectEvidence = useCallback(async () => {
    if (!selectedEv) return;
    const result = await updateEvidenceStateWithEventAction(
      selectedEv.id,
      "rejected",
      engagementId,
    );
    if (result.evidence) {
      setEvidence((prev) =>
        prev.map((e) =>
          e.id === selectedEv.id ? { ...e, state: "rejected" } : e,
        ),
      );
      setSelectedEv({ ...selectedEv, state: "rejected" });
    }
  }, [selectedEv, engagementId]);

  const handleOpenLinkDialog = useCallback(
    async (ev: EvidenceObject) => {
      void ev;
      setLinkTargetId("");
      setLinkTargetType("finding");
      setLinkError(null);
      try {
        const f = await getFindingsAction(engagementId);
        setFindingsList(f);
      } catch {
        /* silent */
      }
      setShowLinkDialog(true);
    },
    [engagementId],
  );

  const handleLinkEvidence = useCallback(async () => {
    if (!selectedEv) return;
    setLinkSubmitting(true);
    setLinkError(null);
    try {
      await linkEvidenceToEntityAction({
        engagementId,
        evidenceId: selectedEv.id,
        targetType: linkTargetType,
        targetId: linkTargetId,
        context: "User linked",
      });
      const updated = await getEvidenceAction(engagementId);
      setEvidence(updated);
      setSelectedEv(updated.find((e) => e.id === selectedEv.id) ?? null);
      setShowLinkDialog(false);
    } catch (e: unknown) {
      setLinkError(e instanceof Error ? e.message : t("updateFailed"));
    } finally {
      setLinkSubmitting(false);
    }
  }, [selectedEv, engagementId, linkTargetType, linkTargetId, t]);

  const handleVersionRevert = useCallback(async () => {
    if (!selectedEv) return;
    const list = await getEvidenceAction(engagementId);
    setEvidence(list);
    const updated = list.find((e) => e.id === selectedEv.id);
    if (updated) setSelectedEv(updated);
  }, [selectedEv, engagementId]);

  return {
    engagementId,
    evidence,
    setEvidence,
    engagement,
    loading,
    selectedEv,
    setSelectedEv,
    traceEvOpen,
    setTraceEvOpen,
    traceEvData,
    setTraceEvData,
    stateFilter,
    setStateFilter,
    search,
    setSearch,
    showRequest,
    setShowRequest,
    showLinkDialog,
    setShowLinkDialog,
    linkTargetType,
    setLinkTargetType,
    linkTargetId,
    setLinkTargetId,
    linkSubmitting,
    findingsList,
    linkError,
    setLinkError,
    aiSuggestions,
    setAiSuggestions,
    suggesting,
    acceptingSuggestionId,
    uploadingId,
    downloadingId,
    actionError,
    setActionError,
    evHasMore,
    evTotal,
    loadingMore,
    showRejectDialog,
    setShowRejectDialog,
    versionHistoryOpen,
    setVersionHistoryOpen,
    missingCount,
    filtered,
    stateLabel,
    handleGenerateSuggestions,
    handleAcceptSuggestion,
    handleDismissSuggestion,
    handleLoadMore,
    handleUploadFile,
    handleDownload,
    handleAccept,
    handleMarkReviewed,
    handleRejectEvidence,
    handleOpenLinkDialog,
    handleLinkEvidence,
    handleVersionRevert,
  };
}
