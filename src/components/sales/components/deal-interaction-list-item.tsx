"use client";

import { MessageSquare, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SalesInteractionView } from "@/lib/sales/interactions";
import { formatTypeLabel } from "./use-deal-interaction-panel";
import { DealInteractionEditForm } from "./deal-interaction-edit-form";

export function DealInteractionListItem({
  item,
  isEditing,
  isDeleting,
  onEdit,
  onCancelEdit,
  onSavedEdit,
  onErrorEdit,
  onDelete,
}: {
  item: SalesInteractionView;
  isEditing: boolean;
  isDeleting: boolean;
  onEdit: () => void;
  onCancelEdit: () => void;
  onSavedEdit: () => void;
  onErrorEdit: (message: string) => void;
  onDelete: () => void;
}) {
  return (
    <li className="flex flex-wrap items-start justify-between gap-2 rounded-md border p-3 text-sm">
      <div className="min-w-0 flex-1">
        <p className="font-medium flex items-center gap-1">
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
          {item.subject || formatTypeLabel(item.type)}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {formatTypeLabel(item.type)} ·{" "}
          {new Date(item.occurredAt).toLocaleString("ar-SA")}
        </p>
        {item.summary ? (
          <p className="text-muted-foreground mt-1">{item.summary}</p>
        ) : null}
        {isEditing ? (
          <DealInteractionEditForm
            item={item}
            onCancel={onCancelEdit}
            onSaved={onSavedEdit}
            onError={onErrorEdit}
          />
        ) : null}
      </div>
      {!isEditing ? (
        <div className="flex shrink-0 gap-1">
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="gap-1"
            onClick={onEdit}
          >
            <Pencil className="h-3.5 w-3.5" />
            تعديل
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="gap-1 text-destructive"
            disabled={isDeleting}
            onClick={onDelete}
          >
            <Trash2 className="h-3.5 w-3.5" />
            {isDeleting ? "..." : "حذف"}
          </Button>
        </div>
      ) : null}
    </li>
  );
}
