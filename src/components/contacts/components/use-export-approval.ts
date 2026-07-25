"use client";

import { useState } from "react";

export interface ExportRequest {
  id: string;
  status: string;
  requestedByName: string | null;
  reason: string | null;
  requiresLegalReview: boolean;
  legalReviewStatus: string | null;
  reviewedByName: string | null;
  reviewNote: string | null;
  reviewedAt: string | null;
  exportedAt: string | null;
  createdAt: string;
}

export function useExportApproval(
  contactId: string,
  exportRequests: ExportRequest[],
) {
  const [loading, setLoading] = useState<string | null>(null);
  const [reason, setReason] = useState("");

  async function handleRequest() {
    setLoading("request");
    try {
      const { requestContactExport } = await import(
        "@/actions/contact-export-actions"
      );
      await requestContactExport(contactId, reason || undefined);
      window.location.reload();
    } finally {
      setLoading(null);
    }
  }

  async function handleApprove() {
    setLoading("approve");
    try {
      const { approveContactExport } = await import(
        "@/actions/contact-export-actions"
      );
      await approveContactExport(contactId, reason || undefined);
      window.location.reload();
    } finally {
      setLoading(null);
    }
  }

  async function handleReject() {
    if (!reason.trim()) return;
    setLoading("reject");
    try {
      const { rejectContactExport } = await import(
        "@/actions/contact-export-actions"
      );
      await rejectContactExport(contactId, reason);
      window.location.reload();
    } finally {
      setLoading(null);
    }
  }

  async function handleLegalClear(cleared: boolean) {
    setLoading("legal");
    try {
      const { clearLegalReview } = await import(
        "@/actions/contact-export-actions"
      );
      await clearLegalReview(contactId, cleared, reason || undefined);
      window.location.reload();
    } finally {
      setLoading(null);
    }
  }

  async function handleExport() {
    setLoading("export");
    try {
      const { recordExportDownload } = await import(
        "@/actions/contact-export-actions"
      );
      await recordExportDownload(contactId);
      window.location.reload();
    } finally {
      setLoading(null);
    }
  }

  const pendingRequest = exportRequests.find((r) => r.status === "pending");

  return {
    loading,
    reason,
    setReason,
    handleRequest,
    handleApprove,
    handleReject,
    handleLegalClear,
    handleExport,
    pendingRequest,
  };
}
