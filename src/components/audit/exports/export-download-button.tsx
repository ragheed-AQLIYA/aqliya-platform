"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2, FileText, FileSpreadsheet } from "lucide-react";

interface ExportDownloadButtonProps {
  label: string;
  filename: string;
  format: "pdf" | "xlsx";
  engagementId: string;
  disabled?: boolean;
  disabledReason?: string;
}

export function ExportDownloadButton({
  label,
  filename,
  format,
  engagementId,
  disabled,
  disabledReason,
}: ExportDownloadButtonProps) {
  const [downloading, setDownloading] = useState(false);

  async function handleDownload() {
    setDownloading(true);
    try {
      const res = await fetch(
        `/api/audit/engagements/${engagementId}/exports/${format}`,
      );
      if (!res.ok) {
        const err = await res
          .json()
          .catch(() => ({ error: "Download failed" }));
        throw new Error(err.error || "Download failed");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Download failed");
    } finally {
      setDownloading(false);
    }
  }

  const Icon = format === "pdf" ? FileText : FileSpreadsheet;

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleDownload}
      disabled={downloading || disabled}
      className="gap-2"
      title={disabledReason}
    >
      {downloading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Icon className="h-4 w-4" />
      )}
      {downloading ? "جارِ التحميل..." : label}
      <Download className="h-3.5 w-3.5 text-muted-foreground" />
    </Button>
  );
}
