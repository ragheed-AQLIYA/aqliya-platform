"use client";

import { use, useCallback } from "react";
import { useRouter, notFound } from "next/navigation";
import {
  workflow_getRecordById,
  updateWorkflowRecordStatus,
} from "@/actions/workflowos-actions";
import {
  requestWorkflowExport,
  approveWorkflowExport,
  rejectWorkflowExport,
  downloadWorkflowExport,
} from "@/actions/workflowos-export-actions";
import { getSlaInfoForRecord } from "@/actions/workflowos-sla-actions";
import {
  getWorkflowEvidenceAction,
  getWorkflowAuditEventsAction,
} from "@/actions/workflowos-actions";
import type {
  RecordWithTemplate, SlaInfo, EvidenceItem, AuditEventItem, ExportDownloadData,
} from "./types";

export function useWorkflowRecordDetail(id: string): {
  record: RecordWithTemplate;
  slaInfo: SlaInfo;
  evidence: EvidenceItem[];
  auditEvents: AuditEventItem[];
  handleAdvance: () => Promise<void>;
  handleComplete: () => Promise<void>;
  handleReject: () => Promise<void>;
  handleRequestExport: () => Promise<void>;
  handleApproveExport: () => Promise<void>;
  handleRejectExport: (formData: FormData) => Promise<void>;
  handleDownloadExport: () => Promise<ExportDownloadData | null>;
  uploadEvidence: (formData: FormData) => Promise<void>;
} {
  const router = useRouter();
  const refresh = useCallback(() => router.refresh(), [router]);

  const recordResult = use(workflow_getRecordById(id));
  if (!recordResult.success || !recordResult.data) {
    notFound();
  }

  const record = recordResult.data as unknown as RecordWithTemplate;
  const slaResult = use(getSlaInfoForRecord(id));
  const slaInfo: SlaInfo = slaResult.success && slaResult.data ? slaResult.data : null;
  const evidenceResult = use(getWorkflowEvidenceAction(id, record.organizationId));
  const evidence: EvidenceItem[] = evidenceResult.evidence ?? [];
  const auditResult = use(getWorkflowAuditEventsAction(id, record.organizationId));
  const auditEvents: AuditEventItem[] = auditResult.events ?? [];

  const steps = (record.steps as unknown[]) ?? [];
  const stepResults = (record.stepResults as Record<string, unknown>) ?? {};
  const currentStep = record.currentStep;

  const handleAdvance = useCallback(async () => {
    const nextStep = currentStep + 1;
    const status = nextStep >= steps.length ? "completed" : "in_progress";
    await updateWorkflowRecordStatus(id, status);
    refresh();
  }, [id, currentStep, steps.length, refresh]);

  const handleComplete = useCallback(async () => {
    await updateWorkflowRecordStatus(id, "completed");
    refresh();
  }, [id, refresh]);

  const handleReject = useCallback(async () => {
    await updateWorkflowRecordStatus(id, "rejected");
    refresh();
  }, [id, refresh]);

  const handleRequestExport = useCallback(async () => {
    await requestWorkflowExport(id);
    refresh();
  }, [id, refresh]);

  const handleApproveExport = useCallback(async () => {
    await approveWorkflowExport(id);
    refresh();
  }, [id, refresh]);

  const handleRejectExport = useCallback(async (formData: FormData) => {
    const reason = formData.get("reason") as string;
    await rejectWorkflowExport(id, reason);
    refresh();
  }, [id, refresh]);

  const handleDownloadExport = useCallback(async () => {
    const result = await downloadWorkflowExport(id);
    if (result.success && result.data) return result.data as ExportDownloadData;
    return null;
  }, [id]);

  const uploadEvidence = useCallback(async (formData: FormData) => {
    const { uploadWorkflowEvidence } = await import("@/actions/workflowos-actions");
    await uploadWorkflowEvidence({
      recordId: id,
      filename: formData.get("filename") as string,
      fileType: formData.get("fileType") as string,
      description: (formData.get("description") as string) || undefined,
      stepIndex: formData.get("stepIndex")
        ? parseInt(formData.get("stepIndex") as string)
        : undefined,
    });
    refresh();
  }, [id, refresh]);

  return {
    record, slaInfo, evidence, auditEvents,
    handleAdvance, handleComplete, handleReject,
    handleRequestExport, handleApproveExport, handleRejectExport,
    handleDownloadExport, uploadEvidence,
  };
}
