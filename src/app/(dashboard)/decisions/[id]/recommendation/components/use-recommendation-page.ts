"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  getDecisionRecommendation,
  updateDecisionRecommendation,
  checkRecommendationGate,
  publishRecommendationAction,
  unpublishRecommendationAction,
} from "@/actions/decisions";
import { getApprovalStatus, getRecommendationDiff } from "@/actions/approval";
import type { FieldDiff } from "@/lib/recommendation/recommendation-diff";

interface GateState {
  allowed: boolean;
  missing: string[];
}

interface FormData {
  recommendedAction: string;
  rationale: string;
  expectedNextState: string;
  scopeExclusions: string;
  assumptionsUsed: string;
  risksAccepted: string;
  risksRejected: string;
  humanReviewRequired: boolean;
}

const DEFAULT_FORM: FormData = {
  recommendedAction: "",
  rationale: "",
  expectedNextState: "",
  scopeExclusions: "",
  assumptionsUsed: "",
  risksAccepted: "",
  risksRejected: "",
  humanReviewRequired: false,
};

interface PublicationState {
  isClientVisible: boolean;
  publishedVersion: number;
}

interface SnapshotWarning {
  differs: boolean;
  approvedAction: string;
  currentAction: string;
  approvedAt: string | null;
  approver: string | null;
}

interface DiffData {
  fields: FieldDiff[];
  changeCount: number;
  summary: string;
  approvedAt: string | null;
  approver: string | null;
}

export interface RecommendationPageState {
  id: string | null;
  loading: boolean;
  saving: boolean;
  gate: GateState;
  formData: FormData;
  error: string;
  hasRecommendation: boolean;
  currentUserRole: "ADMIN" | "OPERATOR" | "VIEWER";
  publication: PublicationState;
  decisionType: string | null;
  snapshotWarning: SnapshotWarning | null;
  showPublishConfirm: boolean;
  diffData: DiffData | null;
  loadingDiff: boolean;
  showDiff: boolean;
}

export interface RecommendationPageActions {
  updateFormField: (field: string, value: string) => void;
  toggleHumanReview: () => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  handlePublish: () => Promise<void>;
  handleUnpublish: () => Promise<void>;
  loadDiff: () => Promise<void>;
  setShowPublishConfirm: (v: boolean) => void;
  setShowDiff: (v: boolean) => void;
}

export function useRecommendationPage(params: Promise<{ id: string }>) {
  const router = useRouter();
  const [id, setId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [gate, setGate] = useState<GateState>({ allowed: false, missing: [] });
  const [formData, setFormData] = useState<FormData>(DEFAULT_FORM);
  const [error, setError] = useState("");
  const [hasRecommendation, setHasRecommendation] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState<"ADMIN" | "OPERATOR" | "VIEWER">("OPERATOR");
  const [publication, setPublication] = useState<PublicationState>({ isClientVisible: false, publishedVersion: 1 });
  const [decisionType, setDecisionType] = useState<string | null>(null);
  const [snapshotWarning, setSnapshotWarning] = useState<SnapshotWarning | null>(null);
  const [showPublishConfirm, setShowPublishConfirm] = useState(false);
  const [diffData, setDiffData] = useState<DiffData | null>(null);
  const [loadingDiff, setLoadingDiff] = useState(false);
  const [showDiff, setShowDiff] = useState(false);

  useEffect(() => {
    params.then(({ id: decisionId }) => setId(decisionId));
  }, [params]);

  const loadRecommendation = useCallback(async () => {
    if (!id) return;
    const result = await getDecisionRecommendation(id);
    if (result.success) {
      setCurrentUserRole(result.data.currentUserRole || "OPERATOR");
      const rec = result.data.recommendation;
      setHasRecommendation(Boolean(rec));
      if (result.data.decisionType) setDecisionType(result.data.decisionType);
      if (rec) {
        setPublication({
          isClientVisible: rec.isClientVisible,
          publishedVersion: rec.publishedVersion,
        });
        if ("scopeExclusions" in rec) {
          setFormData({
            recommendedAction: rec.recommendedAction || "",
            rationale: rec.rationale || "",
            expectedNextState: rec.expectedNextState || "",
            scopeExclusions: rec.scopeExclusions || "",
            assumptionsUsed: rec.assumptionsUsed || "",
            risksAccepted: rec.risksAccepted || "",
            risksRejected: rec.risksRejected || "",
            humanReviewRequired: "humanReviewRequired" in rec ? (rec.humanReviewRequired as boolean) : false,
          });
        }
      }
    }
    const approvalResult = await getApprovalStatus(id);
    if (approvalResult.success && approvalResult.data) {
      if (approvalResult.data.recommendationDiffers && approvalResult.data.approvedSnapshot) {
        setSnapshotWarning({
          differs: true,
          approvedAction: approvalResult.data.approvedSnapshot.recommendedAction ?? "",
          currentAction: approvalResult.data.recommendationSummary?.action ?? "",
          approvedAt: approvalResult.data.approvedSnapshot.approvedAt
            ? new Date(approvalResult.data.approvedSnapshot.approvedAt).toLocaleString()
            : null,
          approver: approvalResult.data.approvedSnapshot.approver || null,
        });
        const diffResult = await getRecommendationDiff(id);
        if (diffResult.success && diffResult.data) {
          setDiffData({
            fields: diffResult.data.diff.fields,
            changeCount: diffResult.data.diff.changeCount,
            summary: diffResult.data.summary,
            approvedAt: diffResult.data.approvedAt
              ? new Date(diffResult.data.approvedAt).toLocaleString()
              : null,
            approver: diffResult.data.approver || null,
          });
        }
      }
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    if (!id) return;
    const decisionId = id;
    let cancelled = false;
    async function run() {
      setLoading(true);
      const result = await checkRecommendationGate(decisionId);
      if (cancelled) return;
      setGate(result);
      if (result.allowed) {
        const recResult = await getDecisionRecommendation(decisionId);
        if (cancelled) return;
        if (recResult.success) {
          setCurrentUserRole(recResult.data.currentUserRole || "OPERATOR");
          const rec = recResult.data.recommendation;
          setHasRecommendation(Boolean(rec));
          if (recResult.data.decisionType) setDecisionType(recResult.data.decisionType);
          if (rec) {
            setPublication({
              isClientVisible: rec.isClientVisible,
              publishedVersion: rec.publishedVersion,
            });
            if ("scopeExclusions" in rec) {
              setFormData({
                recommendedAction: rec.recommendedAction || "",
                rationale: rec.rationale || "",
                expectedNextState: rec.expectedNextState || "",
                scopeExclusions: rec.scopeExclusions || "",
                assumptionsUsed: rec.assumptionsUsed || "",
                risksAccepted: rec.risksAccepted || "",
                risksRejected: rec.risksRejected || "",
                humanReviewRequired: "humanReviewRequired" in rec ? (rec.humanReviewRequired as boolean) : false,
              });
            }
          }
        }
      }
      setLoading(false);
    }
    run();
    return () => { cancelled = true; };
  }, [id]);

  const updateFormField = useCallback((field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const toggleHumanReview = useCallback(() => {
    setFormData(prev => ({ ...prev, humanReviewRequired: !prev.humanReviewRequired }));
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setSaving(true);
    setError("");
    const result = await updateDecisionRecommendation(id, formData);
    if (result.success) {
      router.refresh();
    } else {
      setError(result.error || "Failed to save recommendation");
      if ("missing" in result && result.missing) {
        setGate({ allowed: false, missing: result.missing as string[] });
      }
    }
    setSaving(false);
  }, [id, formData, router]);

  const handlePublish = useCallback(async () => {
    if (!id) return;
    setSaving(true);
    setError("");
    if (snapshotWarning?.differs && !showPublishConfirm) {
      setShowPublishConfirm(true);
      setSaving(false);
      return;
    }
    const result = await publishRecommendationAction(id, showPublishConfirm);
    if (result.success) {
      setShowPublishConfirm(false);
      setSnapshotWarning(null);
      await loadRecommendation();
      router.refresh();
    } else {
      setError(result.error || "Failed to publish recommendation");
      if ("requiresOverride" in result && result.requiresOverride) {
        setShowPublishConfirm(true);
      }
    }
    setSaving(false);
  }, [id, snapshotWarning, showPublishConfirm, loadRecommendation, router]);

  const handleUnpublish = useCallback(async () => {
    if (!id) return;
    setSaving(true);
    setError("");
    const result = await unpublishRecommendationAction(id);
    if (result.success) {
      await loadRecommendation();
      router.refresh();
    } else {
      setError(result.error || "Failed to unpublish recommendation");
    }
    setSaving(false);
  }, [id, loadRecommendation, router]);

  const loadDiff = useCallback(async () => {
    if (!id) return;
    setLoadingDiff(true);
    const result = await getRecommendationDiff(id);
    if (result.success && result.data) {
      setDiffData({
        fields: result.data.diff.fields,
        changeCount: result.data.diff.changeCount,
        summary: result.data.summary,
        approvedAt: result.data.approvedAt
          ? new Date(result.data.approvedAt).toLocaleString()
          : null,
        approver: result.data.approver || null,
      });
      setShowDiff(true);
    }
    setLoadingDiff(false);
  }, [id]);

  const state: RecommendationPageState = {
    id, loading, saving, gate, formData, error, hasRecommendation,
    currentUserRole, publication, decisionType, snapshotWarning,
    showPublishConfirm, diffData, loadingDiff, showDiff,
  };

  const actions: RecommendationPageActions = {
    updateFormField, toggleHumanReview, handleSubmit, handlePublish,
    handleUnpublish, loadDiff, setShowPublishConfirm, setShowDiff,
  };

  return { state, actions };
}
