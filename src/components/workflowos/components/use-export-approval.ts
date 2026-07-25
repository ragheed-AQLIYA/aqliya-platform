"use client";

import { useState } from "react";

export interface ExportStatus {
  exportStatus: string;
  exportRequestedAt: string | null;
  exportRequestedById: string | null;
  exportApprovedAt: string | null;
  exportApprovedById: string | null;
  exportRejectedReason: string | null;
  escalatedAt: string | null;
  escalatedToId: string | null;
}

export function useExportApproval(
  exportStatus: ExportStatus | null,
  userId: string,
) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const status = exportStatus?.exportStatus ?? "none";
  const isRequester =
    userId === exportStatus?.exportRequestedById && status === "requested";
  const canRequest = status === "none";
  const canReview = status === "requested" && !isRequester;
  const canDownload = status === "approved";

  async function handleAction(action: string, fn: () => Promise<void>) {
    setLoading(action);
    setError(null);
    try {
      await fn();
      setOpen(false);
    } catch {
      setError("فشل تنفيذ الإجراء");
    } finally {
      setLoading(null);
    }
  }

  return {
    open,
    setOpen,
    loading,
    rejectReason,
    setRejectReason,
    showRejectInput,
    setShowRejectInput,
    error,
    status,
    canRequest,
    canReview,
    canDownload,
    handleAction,
  };
}
