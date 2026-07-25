"use client";

import type { ContentEvidence } from "./use-content-evidence";
import { EvidenceListItem } from "./evidence-list-item";

export function EvidenceList({
  evidence,
  loading,
  error,
  editingDescription,
  editDescriptionValue,
  onDelete,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onEditChange,
}: {
  evidence: ContentEvidence[];
  loading: boolean;
  error: string | null;
  editingDescription: string | null;
  editDescriptionValue: string;
  onDelete: (id: string) => void;
  onStartEdit: (item: ContentEvidence) => void;
  onSaveEdit: (id: string) => void;
  onCancelEdit: () => void;
  onEditChange: (value: string) => void;
}) {
  if (error) {
    return (
      <div className="rounded-md bg-destructive/10 p-2 text-xs text-destructive">
        {error}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-xs text-muted-foreground text-center py-4">
        جاري التحميل...
      </div>
    );
  }

  if (evidence.length === 0) {
    return (
      <div className="text-xs text-muted-foreground text-center py-4">
        لا توجد مستندات مرفوعة. أضف مستندات داعمة لهذا المحتوى.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {evidence.map((item) => (
        <EvidenceListItem
          key={item.id}
          item={item}
          isEditing={editingDescription === item.id}
          editValue={editDescriptionValue}
          onDelete={onDelete}
          onStartEdit={onStartEdit}
          onSaveEdit={onSaveEdit}
          onCancelEdit={onCancelEdit}
          onEditChange={onEditChange}
        />
      ))}
    </div>
  );
}
