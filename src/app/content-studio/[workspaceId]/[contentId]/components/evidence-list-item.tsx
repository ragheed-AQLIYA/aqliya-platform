"use client";

import { Download, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { ContentEvidence } from "./use-content-evidence";

const EVIDENCE_TYPE_LABELS: Record<string, string> = {
  attachment: "مرفق",
  reference: "مرجع",
  source: "مصدر",
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(fileType: string) {
  if (["pdf"].includes(fileType)) return "\u{1F4C4}";
  if (["xlsx", "xls"].includes(fileType)) return "\u{1F4CA}";
  if (["docx", "doc"].includes(fileType)) return "\u{1F4DD}";
  if (["jpg", "jpeg", "png"].includes(fileType)) return "\u{1F5BC}\uFE0F";
  if (["csv"].includes(fileType)) return "\u{1F4CB}";
  return "\u{1F4CE}";
}

export function EvidenceListItem({
  item,
  isEditing,
  editValue,
  onDelete,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onEditChange,
}: {
  item: ContentEvidence;
  isEditing: boolean;
  editValue: string;
  onDelete: (id: string) => void;
  onStartEdit: (item: ContentEvidence) => void;
  onSaveEdit: (id: string) => void;
  onCancelEdit: () => void;
  onEditChange: (value: string) => void;
}) {
  return (
    <div className="rounded-lg border p-2.5 text-xs space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span className="text-base" aria-hidden="true">
            {getFileIcon(item.fileType)}
          </span>
          <div className="min-w-0 flex-1">
            <div className="font-medium truncate">{item.filename}</div>
            <div className="text-muted-foreground">
              {formatFileSize(item.fileSize)} ·{" "}
              {EVIDENCE_TYPE_LABELS[item.evidenceType] ?? item.evidenceType}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {item.storageKey && (
            <a
              href={`/api/storage/download?key=${encodeURIComponent(item.storageKey)}&filename=${encodeURIComponent(item.filename)}`}
              className="inline-flex items-center justify-center h-7 w-7 rounded-md hover:bg-accent"
              title="تحميل"
            >
              <Download className="h-3.5 w-3.5" />
            </a>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-destructive"
            title="حذف"
            onClick={() => onDelete(item.id)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {isEditing ? (
        <div className="space-y-1 pr-7">
          <Textarea
            value={editValue}
            onChange={(e) => onEditChange(e.target.value)}
            rows={2}
            className="text-xs"
            placeholder="وصف المستند..."
          />
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="default"
              className="h-6 text-xs"
              onClick={() => onSaveEdit(item.id)}
            >
              حفظ
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 text-xs"
              onClick={onCancelEdit}
            >
              إلغاء
            </Button>
          </div>
        </div>
      ) : item.description ? (
        <div
          className="pr-7 text-muted-foreground cursor-pointer hover:text-foreground"
          onClick={() => onStartEdit(item)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") onStartEdit(item);
          }}
        >
          {item.description}
        </div>
      ) : (
        <div
          className="pr-7 text-muted-foreground/50 italic cursor-pointer hover:text-foreground"
          onClick={() => onStartEdit(item)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") onStartEdit(item);
          }}
        >
          أضف وصفاً...
        </div>
      )}
    </div>
  );
}
