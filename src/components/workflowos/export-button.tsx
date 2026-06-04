"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Loader2, CheckCircle2, Clock, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExportStatusData {
  exportStatus: string;
  exportRequestedAt: string | null;
  exportApprovedAt: string | null;
  exportRejectedReason: string | null;
  escalatedAt: string | null;
}

interface ExportButtonProps {
  recordId: string;
  getExportStatus: () => Promise<{ success: boolean; data?: ExportStatusData; error?: string }>;
  onRequestExport: () => Promise<{ success: boolean; error?: string }>;
  onDownloadExport: () => Promise<{ success: boolean; data?: { content: string; filename: string; mimeType: string }; error?: string }>;
  className?: string;
}

export function ExportButton({
  recordId,
  getExportStatus,
  onRequestExport,
  onDownloadExport,
  className,
}: ExportButtonProps) {
  const [status, setStatus] = useState<ExportStatusData | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getExportStatus().then((result) => {
      if (!cancelled && result.success && result.data) {
        setStatus(result.data);
      }
    });
    return () => { cancelled = true; };
  }, [getExportStatus]);

  async function handleRequest() {
    setActionLoading("request");
    setError(null);
    const result = await onRequestExport();
    if (!result.success) {
      setError(result.error ?? "فشل الطلب");
    } else {
      const statusResult = await getExportStatus();
      if (statusResult.success && statusResult.data) {
        setStatus(statusResult.data);
      }
    }
    setActionLoading(null);
  }

  async function handleDownload() {
    setActionLoading("download");
    setError(null);
    const result = await onDownloadExport();
    if (result.success && result.data) {
      const blob = new Blob([result.data.content], {
        type: result.data.mimeType,
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = result.data.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else {
      setError(result.error ?? "فشل التنزيل");
    }
    setActionLoading(null);
  }

  const statusIcon = () => {
    switch (status?.exportStatus) {
      case "approved":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case "requested":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };

  const statusLabel = () => {
    switch (status?.exportStatus) {
      case "none":
        return "طلب تصدير";
      case "requested":
        return "بانتظار المراجعة";
      case "approved":
        return "تنزيل التصدير";
      case "rejected":
        return "إعادة طلب";
      default:
        return "تصدير";
    }
  };

  const canDownload = status?.exportStatus === "approved";
  const canRequest =
    status?.exportStatus === "none" || status?.exportStatus === "rejected";

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <div className="flex items-center gap-2">
        {statusIcon()}
        {canDownload ? (
          <Button
            size="sm"
            onClick={handleDownload}
            disabled={actionLoading !== null}
          >
            {actionLoading === "download" ? (
              <Loader2 className="ml-1 h-4 w-4 animate-spin" />
            ) : (
              <Download className="ml-1 h-4 w-4" />
            )}
            {statusLabel()}
          </Button>
        ) : canRequest ? (
          <Button
            size="sm"
            variant="outline"
            onClick={handleRequest}
            disabled={actionLoading !== null}
          >
            {actionLoading === "request" ? (
              <Loader2 className="ml-1 h-4 w-4 animate-spin" />
            ) : (
              <Download className="ml-1 h-4 w-4" />
            )}
            {statusLabel()}
          </Button>
        ) : (
          <Button size="sm" variant="outline" disabled>
            <Clock className="ml-1 h-4 w-4" />
            {statusLabel()}
          </Button>
        )}
        {status?.exportRejectedReason && (
          <span className="text-xs text-red-600" title={status.exportRejectedReason}>
            مرفوض
          </span>
        )}
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
