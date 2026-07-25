"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";
import type { DecisionEvidenceItem } from "./use-decision-evidence";
import { FILE_TYPE_BADGES, formatFileSize, formatEvidenceDate } from "./use-decision-evidence";

interface EvidenceListItemProps {
  item: DecisionEvidenceItem;
  decisionId: string;
  deletingId: string | null;
  onDelete: (id: string) => void;
}

export function EvidenceListItem({ item, decisionId, deletingId, onDelete }: EvidenceListItemProps) {
  return (
    <div className="rounded border p-3 text-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-start gap-2">
          <FileText className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="truncate font-medium">{item.filename}</p>
              <Badge
                variant={
                  (FILE_TYPE_BADGES[item.fileType] || "outline") as
                    | "default"
                    | "secondary"
                    | "outline"
                }
              >
                {item.fileType.toUpperCase()}
              </Badge>
              <Badge variant="outline" className="bg-muted">
                مستند دعم
              </Badge>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {formatFileSize(item.fileSize)}
              {item.description ? ` — ${item.description}` : ""}
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
              <span>أضيف في {formatEvidenceDate(item.createdAt)}</span>
              {item.fileHash ? (
                <span>بصمة: {item.fileHash.slice(0, 12)}</span>
              ) : null}
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px]">
              {item.storageKey ? (
                <a
                  href={`/api/decisions/${decisionId}/evidence/${item.id}/download`}
                  className="inline-flex items-center gap-1 text-primary hover:underline"
                >
                  <Download className="h-3.5 w-3.5" />
                  تنزيل الملف
                </a>
              ) : (
                <span className="text-muted-foreground">
                  لا يوجد ملف محفوظ للتنزيل
                </span>
              )}
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="shrink-0 text-destructive"
          disabled={deletingId === item.id}
          onClick={() => onDelete(item.id)}
        >
          {deletingId === item.id ? "جارٍ الحذف..." : "حذف"}
        </Button>
      </div>
    </div>
  );
}
