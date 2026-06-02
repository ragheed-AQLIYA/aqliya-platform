"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createSalesInteractionAction,
  deleteSalesInteractionAction,
  updateSalesInteractionAction,
} from "@/actions/sales-actions";
import type { SalesInteractionView } from "@/lib/sales/interactions";
import { MessageSquare, Pencil, RefreshCw, Trash2 } from "lucide-react";

const TYPE_OPTIONS = [
  { value: "call", label: "مكالمة" },
  { value: "email", label: "بريد" },
  { value: "meeting", label: "اجتماع" },
  { value: "note", label: "ملاحظة" },
  { value: "other", label: "أخرى" },
] as const;

const ALL_TYPES_VALUE = "all";

function formatActionError(error: string, code?: string): string {
  if (code === "FORBIDDEN" || error === "Access denied") {
    return "لا تملك صلاحية تسجيل التفاعل";
  }
  if (code === "VALIDATION") {
    return error.replace(/^SalesOS validation:\s*/i, "");
  }
  return error || "تعذر تسجيل التفاعل";
}

function formatTypeLabel(type: string): string {
  return TYPE_OPTIONS.find((o) => o.value === type)?.label ?? type;
}

function toDatetimeLocalValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function InteractionEditForm({
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

export function DealInteractionPanel({
  dealId,
  accountId,
  interactions,
}: {
  dealId: string;
  accountId: string;
  interactions: SalesInteractionView[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState(ALL_TYPES_VALUE);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredInteractions = useMemo(() => {
    if (typeFilter === ALL_TYPES_VALUE) return interactions;
    return interactions.filter((item) => item.type === typeFilter);
  }, [interactions, typeFilter]);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    formData.set("dealId", dealId);
    formData.set("accountId", accountId);

    try {
      const res = await createSalesInteractionAction(formData);
      if (res.ok) {
        router.refresh();
      } else {
        setError(formatActionError(res.error, res.code));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "تعذر تسجيل التفاعل");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(interactionId: string) {
    if (!window.confirm("حذف هذا التفاعل؟")) return;
    setDeletingId(interactionId);
    setError(null);
    try {
      const res = await deleteSalesInteractionAction(interactionId);
      if (res.ok) {
        setEditingId(null);
        router.refresh();
      } else {
        setError(formatActionError(res.error, res.code));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "تعذر حذف التفاعل");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">تصفية حسب النوع</p>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="flex h-9 min-w-[140px] rounded-md border border-input bg-background px-3 py-1 text-sm"
          aria-label="تصفية التفاعلات"
        >
          <option value={ALL_TYPES_VALUE}>الكل</option>
          {TYPE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {filteredInteractions.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {interactions.length === 0
            ? "لا تفاعلات مسجّلة لهذه الصفقة بعد."
            : "لا تفاعلات مطابقة للتصفية."}
        </p>
      ) : (
        <ul className="space-y-2">
          {filteredInteractions.map((item) => (
            <li
              key={item.id}
              className="flex flex-wrap items-start justify-between gap-2 rounded-md border p-3 text-sm"
            >
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
                {editingId === item.id ? (
                  <InteractionEditForm
                    item={item}
                    onCancel={() => setEditingId(null)}
                    onSaved={() => {
                      setEditingId(null);
                      router.refresh();
                    }}
                    onError={(message) =>
                      setError(message || "تعذر تحديث التفاعل")
                    }
                  />
                ) : null}
              </div>
              {editingId !== item.id ? (
                <div className="flex shrink-0 gap-1">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="gap-1"
                    onClick={() => setEditingId(item.id)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    تعديل
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="gap-1 text-destructive"
                    disabled={deletingId === item.id}
                    onClick={() => handleDelete(item.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    {deletingId === item.id ? "..." : "حذف"}
                  </Button>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      <form action={handleSubmit} className="space-y-3 border-t pt-4">
        <p className="text-sm font-medium">تسجيل تفاعل</p>
        <div>
          <Label htmlFor="interaction-type">النوع</Label>
          <select
            id="interaction-type"
            name="type"
            required
            defaultValue="call"
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
          <Label htmlFor="interaction-subject">الموضوع (اختياري)</Label>
          <Input id="interaction-subject" name="subject" />
        </div>
        <div>
          <Label htmlFor="interaction-summary">ملخص (اختياري)</Label>
          <Input id="interaction-summary" name="summary" />
        </div>
        <div>
          <Label htmlFor="interaction-occurredAt">تاريخ التفاعل</Label>
          <Input
            id="interaction-occurredAt"
            name="occurredAt"
            type="datetime-local"
          />
        </div>
        {error ? (
          <p className="text-xs text-destructive">{error}</p>
        ) : null}
        <Button type="submit" size="sm" disabled={loading} className="gap-1">
          <RefreshCw className="h-4 w-4" />
          {loading ? "جارٍ الحفظ..." : "تسجيل"}
        </Button>
      </form>
    </div>
  );
}
