"use client";

import { CheckCircle2, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const EVIDENCE_TYPE_LABELS: Record<string, string> = {
  certificate: "شهادة محتوى محلي",
  contract: "عقد",
  attestation: "إقرار",
  invoice: "فاتورة",
  registration: "سجل تجاري",
  other: "أخرى",
};

interface UploadResultCardProps {
  filename: string;
  mimeType?: string;
  sizeBytes?: number;
  evidenceType: string;
}

export function UploadResultCard({
  filename,
  mimeType,
  sizeBytes,
  evidenceType,
}: UploadResultCardProps) {
  return (
    <div className="rounded-md bg-green-50 dark:bg-green-950 p-3 text-xs space-y-2">
      <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
        <CheckCircle2 className="h-4 w-4" />
        تم رفع الملف بنجاح
      </div>
      <div className="space-y-1 text-muted-foreground">
        <div className="flex items-center gap-2">
          <FileText className="h-3.5 w-3.5" />
          <span className="font-mono">{filename}</span>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {mimeType && (
            <Badge variant="outline" className="text-[10px]">
              {mimeType}
            </Badge>
          )}
          {sizeBytes != null && (
            <Badge variant="outline" className="text-[10px]">
              {(sizeBytes / 1024).toFixed(1)}KB
            </Badge>
          )}
          <Badge variant="outline" className="text-[10px] bg-muted">
            {EVIDENCE_TYPE_LABELS[evidenceType] || evidenceType}
          </Badge>
          <Badge
            variant="outline"
            className="text-[10px] bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-200"
          >
            مخزن بأمان
          </Badge>
        </div>
      </div>
    </div>
  );
}
