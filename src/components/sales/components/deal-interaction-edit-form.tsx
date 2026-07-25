"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateSalesInteractionAction } from "@/actions/sales-actions";
import type { SalesInteractionView } from "@/lib/sales/interactions";
import { TYPE_OPTIONS, formatActionError, toDatetimeLocalValue } from "./use-deal-interaction-panel";

export function DealInteractionEditForm({
  item,
  onCancel,
  onSaved,
  onError,
}: {
  item: SalesInteractionView;
  onCancel: () => void;
  onSaved: () => void;
  onError: (message: string) => void;
}) {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    onError("");
    try {
      const res = await updateSalesInteractionAction(item.id, formData);
      if (res.ok) {
        onSaved();
      } else {
        onError(formatActionError(res.error, res.code));
      }
    } catch (e) {
      onError(e instanceof Error ? e.message : "تعذر تحديث التفاعل");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form action={handleSubmit} className="mt-2 space-y-2 border-t pt-2">
      <div>
        <Label htmlFor={`edit-type-${item.id}`}>النوع</Label>
        <select
          id={`edit-type-${item.id}`}
          name="type"
          defaultValue={item.type}
          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
        >
          {TYPE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <Label htmlFor={`edit-subject-${item.id}`}>الموضوع</Label>
        <Input
          id={`edit-subject-${item.id}`}
          name="subject"
          defaultValue={item.subject ?? ""}
        />
      </div>
      <div>
        <Label htmlFor={`edit-summary-${item.id}`}>ملخص</Label>
        <Input
          id={`edit-summary-${item.id}`}
          name="summary"
          defaultValue={item.summary ?? ""}
        />
      </div>
      <div>
        <Label htmlFor={`edit-occurredAt-${item.id}`}>تاريخ التفاعل</Label>
        <Input
          id={`edit-occurredAt-${item.id}`}
          name="occurredAt"
          type="datetime-local"
          defaultValue={toDatetimeLocalValue(new Date(item.occurredAt))}
        />
      </div>
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={loading}>
          {loading ? "جارٍ الحفظ..." : "حفظ"}
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={onCancel}>
          إلغاء
        </Button>
      </div>
    </form>
  );
}
