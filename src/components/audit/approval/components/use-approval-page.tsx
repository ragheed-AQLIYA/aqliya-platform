"use client";

import { useEffect, useState } from "react";
import {
  getApprovalRecordsAction,
  getApprovalStatusAction,
  getEngagementAction,
  getWorkflowReadinessAction,
} from "@/actions/audit-read-actions";
import {
  getTraceabilityAction,
  createApprovalRecordAction,
} from "@/actions/audit-actions";
import { getNextWorkflowAction } from "@/lib/audit/workflow-next-action";
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import type { ApprovalRecord, Engagement } from "@/types/audit";
import type { TraceabilityNode } from "@/components/audit/shared/traceability-drawer";

export const statusColors: Record<string, string> = {
  not_ready: "bg-gray-100 text-gray-600",
  ready: "bg-green-100 text-green-700",
  pending_approval: "bg-amber-100 text-amber-700",
  approved: "bg-green-100 text-green-700",
  blocked: "bg-red-100 text-red-700",
};

export const actionIcons: Record<string, React.ReactNode> = {
  approved: <CheckCircle className="size-4 text-green-600" />,
  rejected: <XCircle className="size-4 text-red-600" />,
  modifications_requested: <AlertTriangle className="size-4 text-amber-600" />,
};

export interface ApprovalInfo {
  status: string;
  blockingIssues: readonly string[];
  checklist: Array<{ label: string; passed: boolean; detail: string }>;
}

export function useApprovalPage(engagementId: string) {
  const [records, setRecords] = useState<ApprovalRecord[]>([]);
  const [approvalInfo, setApprovalInfo] = useState<ApprovalInfo>({
    status: "not_ready",
    blockingIssues: [],
    checklist: [],
  });
  const [engagement, setEngagement] = useState<Engagement | null>(null);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(false);
  const [approveError, setApproveError] = useState<string | null>(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejecting, setRejecting] = useState(false);
  const [rejectError, setRejectError] = useState<string | null>(null);
  const [traceApproval, setTraceApproval] = useState<ApprovalRecord | null>(
    null,
  );
  const [traceabilityOpen, setTraceabilityOpen] = useState(false);
  const [traceData, setTraceData] = useState<{
    forward: TraceabilityNode[];
    backward: TraceabilityNode[];
  }>({ forward: [], backward: [] });
  const [nextActionHref, setNextActionHref] = useState<string | null>(null);
  const [nextActionLabel, setNextActionLabel] = useState<string | null>(null);
  const [nextActionReason, setNextActionReason] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      getApprovalRecordsAction(engagementId),
      getApprovalStatusAction(engagementId),
      getEngagementAction(engagementId),
      getWorkflowReadinessAction(engagementId).catch(() => null),
    ]).then(([r, a, e, readiness]) => {
      setRecords(r);
      setApprovalInfo({
        status: a.status,
        blockingIssues: a.blockingIssues,
        checklist: a.checklist,
      });
      setEngagement(e);
      if (readiness && a.status !== "approved") {
        const next = getNextWorkflowAction(
          engagementId,
          readiness.context,
          readiness.workflowStatus.blockingIssues,
        );
        if (!next.href.endsWith("/approval")) {
          setNextActionHref(next.href);
          setNextActionLabel(next.label);
          setNextActionReason(next.reason ?? null);
        }
      }
      setLoading(false);
    });
  }, [engagementId]);

  const canApprove = approvalInfo.status === "ready";
  const isApproved = approvalInfo.status === "approved";

  const handleApprove = async () => {
    setApproving(true);
    setApproveError(null);
    try {
      const result = await createApprovalRecordAction({
        engagementId,
        action: "approved",
        targetType: "engagement",
        targetId: engagementId,
      });
      if (result.record)
        setRecords((prev) => [...prev, result.record]);
      setApprovalInfo({
        status: "approved",
        blockingIssues: [],
        checklist: approvalInfo.checklist.map((c) => ({ ...c, passed: true })),
      });
    } catch {
      setApproveError("approveFailed");
    } finally {
      setApproving(false);
    }
  };

  const handleRejectConfirm = async () => {
    setRejecting(true);
    setRejectError(null);
    try {
      const result = await createApprovalRecordAction({
        engagementId,
        action: "rejected",
        rationale: rejectReason.trim(),
        targetType: "engagement",
        targetId: engagementId,
      });
      if (result.record)
        setRecords((prev) => [...prev, result.record]);
      getApprovalStatusAction(engagementId).then((a) =>
        setApprovalInfo({
          status: a.status,
          blockingIssues: a.blockingIssues,
          checklist: a.checklist,
        }),
      );
      setShowRejectDialog(false);
      setRejectReason("");
    } catch {
      setRejectError("rejectFailed");
    } finally {
      setRejecting(false);
    }
  };

  const handleTraceOpen = async (rec: ApprovalRecord) => {
    setTraceApproval(rec);
    try {
      const trace = await getTraceabilityAction(
        engagementId,
        "approval",
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

  const handleTraceClose = () => {
    setTraceabilityOpen(false);
    setTraceApproval(null);
  };

  return {
    records,
    approvalInfo,
    engagement,
    loading,
    approving,
    approveError,
    showRejectDialog,
    rejectReason,
    rejecting,
    rejectError,
    traceApproval,
    traceabilityOpen,
    traceData,
    nextActionHref,
    nextActionLabel,
    nextActionReason,
    canApprove,
    isApproved,
    setShowRejectDialog,
    setRejectReason,
    handleApprove,
    handleRejectConfirm,
    handleTraceOpen,
    handleTraceClose,
  };
}
