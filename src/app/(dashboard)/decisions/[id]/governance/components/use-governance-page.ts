"use client";

import { useEffect, useState, useCallback } from "react";
import { getDecisionById } from "@/actions/decisions";
import {
  getApprovalStatus,
  submitForReview,
  approveDecision,
  approveWithConditions,
  rejectDecision,
  requestRevision,
  getRecommendationDiff,
  requestReReview,
  getDecisionTimeline,
} from "@/actions/approval";
import { getDecisionExportData } from "@/actions/decision-export";
import {
  formatExportJSON,
  formatExportMarkdown,
} from "@/lib/decision/decision-export-formats";
import type { FieldDiff } from "@/lib/recommendation/recommendation-diff";
import type { TimelineEvent } from "@/lib/decision/decision-timeline";

interface DiffData {
  fields: FieldDiff[];
  changeCount: number;
  summary: string;
}

interface GovernanceState {
  id: string | null;
  decision: any;
  approvalStatus: any;
  loading: boolean;
  saving: boolean;
  error: string | null;
  success: string | null;
  userRole: string;
  notes: string;
  conditions: string;
  overrideReason: string;
  showApproveForm: boolean;
  showRejectForm: boolean;
  showConditionsForm: boolean;
  showDiff: boolean;
  diffData: DiffData | null;
  loadingDiff: boolean;
  showReReviewForm: boolean;
  reReviewReason: string;
  timeline: TimelineEvent[];
  loadingTimeline: boolean;
  exportFormat: "json" | "markdown" | null;
  exportData: string | null;
  loadingExport: boolean;
  copied: boolean;
}

interface GovernanceActions {
  setNotes: (value: string) => void;
  setConditions: (value: string) => void;
  setOverrideReason: (value: string) => void;
  setShowApproveForm: (value: boolean) => void;
  setShowRejectForm: (value: boolean) => void;
  setShowConditionsForm: (value: boolean) => void;
  setShowDiff: (value: boolean) => void;
  setShowReReviewForm: (value: boolean) => void;
  setReReviewReason: (value: string) => void;
  handleSubmitForReview: () => Promise<void>;
  handleApprove: () => Promise<void>;
  handleApproveWithConditions: () => Promise<void>;
  handleReject: () => Promise<void>;
  handleRequestRevision: () => Promise<void>;
  handleLoadDiff: () => Promise<void>;
  handleRequestReReview: () => Promise<void>;
  handleLoadTimeline: () => Promise<void>;
  handleExport: (format: "json" | "markdown") => Promise<void>;
  handleCopyExport: () => void;
  handleDownloadExport: () => void;
}

export type { GovernanceState, GovernanceActions };

export function useGovernancePage(params: Promise<{ id: string }>) {
  const [id, setId] = useState<string | null>(null);
  const [decision, setDecision] = useState<any>(null);
  const [approvalStatus, setApprovalStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string>("VIEWER");
  const [notes, setNotes] = useState("");
  const [conditions, setConditions] = useState("");
  const [overrideReason, setOverrideReason] = useState("");
  const [showApproveForm, setShowApproveForm] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [showConditionsForm, setShowConditionsForm] = useState(false);
  const [showDiff, setShowDiff] = useState(false);
  const [diffData, setDiffData] = useState<DiffData | null>(null);
  const [loadingDiff, setLoadingDiff] = useState(false);
  const [showReReviewForm, setShowReReviewForm] = useState(false);
  const [reReviewReason, setReReviewReason] = useState("");
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [loadingTimeline, setLoadingTimeline] = useState(false);
  const [exportFormat, setExportFormat] = useState<"json" | "markdown" | null>(
    null,
  );
  const [exportData, setExportData] = useState<string | null>(null);
  const [loadingExport, setLoadingExport] = useState(false);
  const [copied, setCopied] = useState(false);

  // Resolve ID from params
  useEffect(() => {
    const getId = async () => {
      const { id: decisionId } = await params;
      setId(decisionId);
    };
    getId();
  }, [params]);

  // Load decision and approval status
  useEffect(() => {
    if (!id) return;

    const loadData = async () => {
      const [decisionResult, approvalResult] = await Promise.all([
        getDecisionById(id),
        getApprovalStatus(id),
      ]);

      if (decisionResult.success && decisionResult.data) {
        setDecision(decisionResult.data);
        setUserRole(decisionResult.data.owner?.role || "VIEWER");
      }

      if (approvalResult.success && approvalResult.data) {
        setApprovalStatus(approvalResult.data);
      }

      setLoading(false);
    };
    loadData();
  }, [id]);

  // Refresh data helper
  const refreshData = useCallback(async () => {
    if (!id) return;
    const [decisionResult, approvalResult] = await Promise.all([
      getDecisionById(id),
      getApprovalStatus(id),
    ]);
    if (decisionResult.success && decisionResult.data) {
      setDecision(decisionResult.data);
    }
    if (approvalResult.success && approvalResult.data) {
      setApprovalStatus(approvalResult.data);
    }
  }, [id]);

  const handleSubmitForReview = useCallback(async () => {
    if (!id) return;
    setSaving(true);
    setError(null);
    const result = await submitForReview(id);
    if (result.success) {
      setSuccess("تم إرسال القرار للمراجعة");
      await refreshData();
    } else {
      setError(result.error || "فشل في إرسال القرار للمراجعة");
    }
    setSaving(false);
    setTimeout(() => setSuccess(null), 3000);
  }, [id, refreshData]);

  const handleApprove = useCallback(async () => {
    if (!id) return;
    setSaving(true);
    setError(null);
    const needsOverride = !approvalStatus?.hasRecommendation;
    const result = await approveDecision(
      id,
      notes,
      needsOverride ? overrideReason : undefined,
    );
    if (result.success) {
      setSuccess("تم اعتماد القرار");
      setNotes("");
      setOverrideReason("");
      setShowApproveForm(false);
      await refreshData();
    } else {
      setError(result.error || "فشل في اعتماد القرار");
    }
    setSaving(false);
    setTimeout(() => setSuccess(null), 3000);
  }, [id, notes, overrideReason, approvalStatus?.hasRecommendation, refreshData]);

  const handleApproveWithConditions = useCallback(async () => {
    if (!id) return;
    setSaving(true);
    setError(null);
    const needsOverride = !approvalStatus?.hasRecommendation;
    const result = await approveWithConditions(
      id,
      conditions,
      needsOverride ? overrideReason : undefined,
    );
    if (result.success) {
      setSuccess("تم اعتماد القرار مع الشروط");
      setConditions("");
      setOverrideReason("");
      setShowConditionsForm(false);
      await refreshData();
    } else {
      setError(result.error || "فشل في الاعتماد مع الشروط");
    }
    setSaving(false);
    setTimeout(() => setSuccess(null), 3000);
  }, [id, conditions, overrideReason, approvalStatus?.hasRecommendation, refreshData]);

  const handleReject = useCallback(async () => {
    if (!id) return;
    setSaving(true);
    setError(null);
    const result = await rejectDecision(id, notes);
    if (result.success) {
      setSuccess("تم رفض القرار");
      setNotes("");
      setShowRejectForm(false);
      await refreshData();
    } else {
      setError(result.error || "فشل في رفض القرار");
    }
    setSaving(false);
    setTimeout(() => setSuccess(null), 3000);
  }, [id, notes, refreshData]);

  const handleRequestRevision = useCallback(async () => {
    if (!id) return;
    setSaving(true);
    setError(null);
    const result = await requestRevision(id, notes);
    if (result.success) {
      setSuccess("طلب مراجعة — تمت إعادة القرار للمسودة");
      setNotes("");
      setShowRejectForm(false);
      await refreshData();
    } else {
      setError(result.error || "فشل في طلب المراجعة");
    }
    setSaving(false);
    setTimeout(() => setSuccess(null), 3000);
  }, [id, notes, refreshData]);

  const handleLoadDiff = useCallback(async () => {
    if (!id) return;
    setLoadingDiff(true);
    const result = await getRecommendationDiff(id);
    if (result.success && result.data) {
      setDiffData({
        fields: result.data.diff.fields,
        changeCount: result.data.diff.changeCount,
        summary: result.data.summary,
      });
      setShowDiff(true);
    } else {
      setError(result.error || "فشل في تحميل الفروقات");
    }
    setLoadingDiff(false);
  }, [id]);

  const handleRequestReReview = useCallback(async () => {
    if (!id) return;
    if (!reReviewReason.trim()) {
      setError("سبب إعادة المراجعة مطلوب");
      return;
    }
    setSaving(true);
    setError(null);
    const result = await requestReReview(id, reReviewReason);
    if (result.success) {
      setSuccess("طلب إعادة مراجعة — تمت إعادة القرار للمسودة");
      setReReviewReason("");
      setShowReReviewForm(false);
      setShowDiff(false);
      await refreshData();
    } else {
      setError(result.error || "فشل في طلب إعادة المراجعة");
    }
    setSaving(false);
    setTimeout(() => setSuccess(null), 3000);
  }, [id, reReviewReason, refreshData]);

  const handleLoadTimeline = useCallback(async () => {
    if (!id) return;
    setLoadingTimeline(true);
    const result = await getDecisionTimeline(id);
    if (result.success && result.data) {
      setTimeline(result.data);
    }
    setLoadingTimeline(false);
  }, [id]);

  const handleExport = useCallback(async (format: "json" | "markdown") => {
    if (!id) return;
    setLoadingExport(true);
    setExportFormat(format);
    const result = await getDecisionExportData(id, format);
    if (result.success && result.data) {
      const content =
        format === "json"
          ? formatExportJSON(result.data)
          : formatExportMarkdown(result.data);
      setExportData(content);
    } else {
      setError(result.error || "فشل في التصدير");
    }
    setLoadingExport(false);
  }, [id]);

  const handleCopyExport = useCallback(() => {
    if (exportData) {
      navigator.clipboard.writeText(exportData);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [exportData]);

  const handleDownloadExport = useCallback(() => {
    if (!exportData || !exportFormat || !id) return;
    const extension = exportFormat === "json" ? "json" : "md";
    const mimeType =
      exportFormat === "json" ? "application/json" : "text/markdown";
    const blob = new Blob([exportData], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `decision-export-${id}.${extension}`;
    a.click();
    URL.revokeObjectURL(url);
  }, [exportData, exportFormat, id]);

  const state: GovernanceState = {
    id,
    decision,
    approvalStatus,
    loading,
    saving,
    error,
    success,
    userRole,
    notes,
    conditions,
    overrideReason,
    showApproveForm,
    showRejectForm,
    showConditionsForm,
    showDiff,
    diffData,
    loadingDiff,
    showReReviewForm,
    reReviewReason,
    timeline,
    loadingTimeline,
    exportFormat,
    exportData,
    loadingExport,
    copied,
  };

  const actions: GovernanceActions = {
    setNotes,
    setConditions,
    setOverrideReason,
    setShowApproveForm,
    setShowRejectForm,
    setShowConditionsForm,
    setShowDiff,
    setShowReReviewForm,
    setReReviewReason,
    handleSubmitForReview,
    handleApprove,
    handleApproveWithConditions,
    handleReject,
    handleRequestRevision,
    handleLoadDiff,
    handleRequestReReview,
    handleLoadTimeline,
    handleExport,
    handleCopyExport,
    handleDownloadExport,
  };

  return { state, actions };
}
