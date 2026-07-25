"use client";

import { useEffect, useState } from "react";
import {
  getTrialBalanceAction,
  getMappingsAction,
  getEvidenceAction,
  getMissingEvidenceAction,
  getFindingsAction,
  getOpenReviewCountAction,
  getApprovalStatusAction,
  getAuditEventsAction,
  getWorkflowReadinessAction,
} from "@/actions/audit-read-actions";
import type { TrialBalance, AuditEvent } from "@/types/audit";
import type { WorkflowContext } from "@/lib/audit/workflow-gating";
import { getNextWorkflowAction } from "@/lib/audit/workflow-next-action";
import type { NextWorkflowAction } from "@/lib/audit/workflow-next-action";

export function useOverviewTab(engagementId: string) {
  const [tb, setTb] = useState<TrialBalance | null>(null);
  const [mappings, setMappings] = useState<{
    total: number;
    confirmed: number;
  }>({ total: 0, confirmed: 0 });
  const [evidence, setEvidence] = useState<{
    uploaded: number;
    missing: number;
  }>({ uploaded: 0, missing: 0 });
  const [findings, setFindings] = useState<{ total: number; open: number }>({
    total: 0,
    open: 0,
  });
  const [openReviews, setOpenReviews] = useState(0);
  const [approvalStatus, setApprovalStatus] = useState<{
    status: string;
    blockingIssues: string[];
  }>({ status: "not_ready", blockingIssues: [] });
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [workflowContext, setWorkflowContext] =
    useState<WorkflowContext | null>(null);
  const [blockingIssues, setBlockingIssues] = useState<string[]>([]);

  useEffect(() => {
    async function load() {
      const [
        tbData,
        mappingsData,
        evidenceData,
        missingData,
        findingsData,
        reviews,
        approval,
        auditEvents,
        readiness,
      ] = await Promise.all([
        getTrialBalanceAction(engagementId),
        getMappingsAction(engagementId),
        getEvidenceAction(engagementId),
        getMissingEvidenceAction(engagementId),
        getFindingsAction(engagementId),
        getOpenReviewCountAction(engagementId),
        getApprovalStatusAction(engagementId),
        getAuditEventsAction(engagementId),
        getWorkflowReadinessAction(engagementId).catch(() => null),
      ]);

      if (tbData) setTb(tbData);
      setMappings({
        total: mappingsData.length,
        confirmed: mappingsData.filter((m) => m.status === "confirmed").length,
      });
      setEvidence({
        uploaded: evidenceData.filter((e) => e.state !== "missing").length,
        missing: missingData.length,
      });
      setFindings({
        total: findingsData.length,
        open: findingsData.filter(
          (f) => f.status === "open" || f.status === "in_review",
        ).length,
      });
      setOpenReviews(reviews);
      setApprovalStatus({
        status: approval.status,
        blockingIssues: [...approval.blockingIssues],
      });
      setEvents(auditEvents.slice(-3).reverse());
      if (readiness) {
        setWorkflowContext(readiness.context);
        setBlockingIssues([...readiness.workflowStatus.blockingIssues]);
      }
    }
    load();
  }, [engagementId]);

  const nextAction: NextWorkflowAction | null = workflowContext
    ? getNextWorkflowAction(engagementId, workflowContext, blockingIssues)
    : null;

  return {
    tb,
    mappings,
    evidence,
    findings,
    openReviews,
    approvalStatus,
    events,
    workflowContext,
    blockingIssues,
    nextAction,
  };
}
