"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { ExportStatusBadge } from "./components/export-status-badge";
import { ExportStatusInfo } from "./components/export-status-info";
import { ExportActionButtons } from "./components/export-action-buttons";
import { useExportApproval } from "./components/use-export-approval";

import type { ExportStatus } from "./components/use-export-approval";

export type { ExportStatus };

interface ExportApprovalDialogProps {
  recordId: string;
  exportStatus: ExportStatus | null;
  userRole: string | null;
  userId: string;
  onRequestExport: () => Promise<void>;
  onApproveExport: () => Promise<void>;
  onRejectExport: (reason: string) => Promise<void>;
  onDownloadExport: () => Promise<void>;
}

export function ExportApprovalDialog({
  recordId,
  exportStatus,
  userRole,
  userId,
  onRequestExport,
  onApproveExport,
  onRejectExport,
  onDownloadExport,
}: ExportApprovalDialogProps) {
  const {
    open, setOpen, loading, rejectReason, setRejectReason,
    showRejectInput, setShowRejectInput, error, status,
    canRequest, canReview, canDownload, handleAction,
  } = useExportApproval(exportStatus, userId);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" aria-label="فتح نافذة طلب تصدير السجل">
          <Download className="ms-1 h-4 w-4" />
          تصدير
          <ExportStatusBadge status={status} />
        </Button>
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-md"
        role="dialog"
        aria-modal="true"
        aria-labelledby="export-dialog-title"
        aria-describedby="export-dialog-description"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle id="export-dialog-title">طلب تصدير السجل</DialogTitle>
          <DialogDescription id="export-dialog-description">
            إدارة طلب تصدير السجل بصيغة JSON مع الأدلة وسجل التدقيق
          </DialogDescription>
        </DialogHeader>
        <ExportStatusInfo
          status={status}
          exportStatus={exportStatus}
          canRequest={canRequest}
          showRejectInput={showRejectInput}
          rejectReason={rejectReason}
          onRejectReasonChange={setRejectReason}
          error={error}
        />
        <ExportActionButtons
          status={status}
          canRequest={canRequest}
          canReview={canReview}
          canDownload={canDownload}
          showRejectInput={showRejectInput}
          loading={loading}
          rejectReason={rejectReason}
          onAction={handleAction}
          onShowRejectInput={() => setShowRejectInput(true)}
          onCancelReject={() => { setShowRejectInput(false); setRejectReason(""); }}
          onRequestExport={onRequestExport}
          onApproveExport={onApproveExport}
          onRejectExport={onRejectExport}
          onDownloadExport={onDownloadExport}
        />
      </DialogContent>
    </Dialog>
  );
}
