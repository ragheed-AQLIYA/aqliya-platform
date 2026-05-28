"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Download,
  Loader2,
  FileText,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

interface ExportDownloadButtonProps {
  label: string;
  filename: string;
  format: "pdf" | "xlsx";
  engagementId: string;
  disabled?: boolean;
  disabledReason?: string;
  isDraft?: boolean;
}

function formatExportError(status: number, message: string): string {
  if (status === 401) {
    return "يلزم تسجيل الدخول لتصدير الملف.";
  }
  if (status === 403) {
    return "لا تملك صلاحية التصدير لهذا التكليف.";
  }
  if (status === 404) {
    return "التصدير غير متاح — تحقق من وجود القوائم المالية.";
  }
  if (status >= 500) {
    return "خطأ في الخادم أثناء التصدير. حاول مرة أخرى لاحقاً.";
  }
  return message || "تعذر تنزيل الملف. تحقق من اكتمال البيانات وحاول مرة أخرى.";
}

export function ExportDownloadButton({
  label,
  filename,
  format,
  engagementId,
  disabled,
  disabledReason,
  isDraft = false,
}: ExportDownloadButtonProps) {
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleDownload() {
    setDownloading(true);
    setError(null);
    setSuccess(false);
    try {
      const res = await fetch(
        `/api/audit/engagements/${engagementId}/exports/${format}`,
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Export failed" }));
        throw new Error(formatExportError(res.status, err.error || ""));
      }
      const blob = await res.blob();
      if (blob.size === 0) {
        throw new Error(
          "الملف المُصدَّر فارغ — تحقق من اكتمال القوائم المالية.",
        );
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setSuccess(true);
      window.setTimeout(() => setSuccess(false), 5000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "تعذر تنزيل الملف.");
    } finally {
      setDownloading(false);
    }
  }

  const Icon = format === "pdf" ? FileText : FileSpreadsheet;

  return (
    <div className="flex flex-col items-end gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleDownload}
        disabled={downloading || disabled}
        className="gap-2"
        title={disabled ? disabledReason : undefined}
      >
        {downloading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Icon className="h-4 w-4" />
        )}
        {downloading ? "جارِ التصدير..." : isDraft ? `${label} (مسودة)` : label}
        <Download className="h-3.5 w-3.5 text-muted-foreground" />
      </Button>
      {success && (
        <div className="flex max-w-xs items-start gap-1.5 text-xs text-green-700">
          <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>تم تنزيل الملف بنجاح — تحقق من مجلد التنزيلات.</span>
        </div>
      )}
      {error && (
        <div className="flex max-w-xs items-start gap-1.5 text-xs text-red-600">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
