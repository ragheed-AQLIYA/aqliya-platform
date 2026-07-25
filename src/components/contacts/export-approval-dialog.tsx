"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download } from "lucide-react";
import { useExportApproval } from "./components/use-export-approval";
import type { ExportRequest } from "./components/use-export-approval";
import { ExportRequestForm } from "./components/export-request-form";
import { ExportPendingApproval } from "./components/export-pending-approval";
import { ExportApproved } from "./components/export-approved";
import { ExportRejected } from "./components/export-rejected";
import { ExportExported } from "./components/export-exported";
import { ExportDirect } from "./components/export-direct";
import { ExportHistory } from "./components/export-history";

interface ExportApprovalDialogProps {
  contactId: string;
  exportStatus: string;
  sensitivityLevel: string;
  canExport: boolean;
  hasPendingRequest: boolean;
  requiresExportApproval: boolean;
  requiresLegalReview: boolean;
  exportRequests: ExportRequest[];
}

export function ExportApprovalDialog({
  contactId,
  exportStatus,
  sensitivityLevel,
  hasPendingRequest,
  requiresExportApproval,
  requiresLegalReview,
  exportRequests,
}: ExportApprovalDialogProps) {
  const {
    loading,
    reason,
    setReason,
    handleRequest,
    handleApprove,
    handleReject,
    handleLegalClear,
    handleExport,
    pendingRequest,
  } = useExportApproval(contactId, exportRequests);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          تصدير جهة الاتصال
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {requiresExportApproval && !hasPendingRequest && exportStatus === "none" && (
          <ExportRequestForm
            reason={reason}
            onReasonChange={setReason}
            loading={loading}
            requiresLegalReview={requiresLegalReview}
            sensitivityLevel={sensitivityLevel}
            onRequest={handleRequest}
          />
        )}

        {hasPendingRequest && pendingRequest && (
          <ExportPendingApproval
            pendingRequest={pendingRequest}
            reason={reason}
            onReasonChange={setReason}
            loading={loading}
            requiresLegalReview={requiresLegalReview}
            onApprove={handleApprove}
            onReject={handleReject}
            onLegalClear={handleLegalClear}
          />
        )}

        {exportStatus === "approved" && (
          <ExportApproved
            reviewedByName={pendingRequest?.reviewedByName ?? null}
            loading={loading}
            onExport={handleExport}
          />
        )}

        {exportStatus === "rejected" && (
          <ExportRejected
            reviewNote={pendingRequest?.reviewNote ?? null}
            loading={loading}
            onRetry={handleRequest}
          />
        )}

        {exportStatus === "exported" && <ExportExported />}

        {!requiresExportApproval && exportStatus === "none" && (
          <ExportDirect loading={loading} onExport={handleExport} />
        )}

        {exportRequests.length > 0 && (
          <ExportHistory requests={exportRequests} />
        )}
      </CardContent>
    </Card>
  );
}
