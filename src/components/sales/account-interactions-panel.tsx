"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createSalesInteractionAction } from "@/actions/sales-actions";
import type { SalesInteractionView } from "@/lib/sales/interactions";
import { MessageSquare, RefreshCw } from "lucide-react";

const TYPE_OPTIONS = [
  { value: "call", label: "مكالمة" },
  { value: "email", label: "بريد" },
  { value: "meeting", label: "اجتماع" },
  { value: "note", label: "ملاحظة" },
  { value: "other", label: "أخرى" },
] as const;

function formatTypeLabel(type: string): string {
  return TYPE_OPTIONS.find((o) => o.value === type)?.label ?? type;
}

function formatActionError(error: string, code?: string): string {
  if (code === "FORBIDDEN" || error === "Access denied") {
    return "لا تملك صلاحية تسجيل التفاعل";
  }
  if (code === "VALIDATION") {
    return error.replace(/^SalesOS validation:\s*/i, "");
  }
  return error || "تعذر تسجيل التفاعل";
}

export function AccountInteractionsPanel({
  accountId,
  interactions,
  allowCreate = true,
}: {
  accountId: string;
  interactions: SalesInteractionView[];
  allowCreate?: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
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

  return (
    <div className="space-y-4">
      {interactions.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          لا تفاعلات مسجّلة لهذا الحساب بعد.
        </p>
      ) : (
        <ul className="space-y-2">
          {interactions.map((item) => (
            <li
              key={item.id}
              className="rounded-md border p-3 text-sm"
            >
              <p className="font-medium flex items-center gap-1">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                {item.subject || formatTypeLabel(item.type)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {formatTypeLabel(item.type)}
                {item.dealId ? " · مرتبط بصفقة" : ""} ·{" "}
                {new Date(item.occurredAt).toLocaleString("ar-SA")}
              </p>
              {item.summary ? (
                <p className="text-muted-foreground mt-1">{item.summary}</p>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      {allowCreate ? (
        <form action={handleSubmit} className="space-y-3 border-t pt-4">
          <p className="text-sm font-medium">تسجيل تفاعل على الحساب</p>
          <div>
            <Label htmlFor="acct-interaction-type">النوع</Label>
            <select
              id="acct-interaction-type"
              name="type"
              required
              defaultValue="note"
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
            <Label htmlFor="acct-interaction-subject">الموضوع</Label>
            <Input id="acct-interaction-subject" name="subject" />
          </div>
          <div>
            <Label htmlFor="acct-interaction-summary">ملخص</Label>
            <Input id="acct-interaction-summary" name="summary" />
          </div>
          {error ? <p className="text-xs text-destructive">{error}</p> : null}
          <Button type="submit" size="sm" disabled={loading} className="gap-1">
            <RefreshCw className="h-4 w-4" />
            {loading ? "جارٍ الحفظ..." : "تسجيل"}
          </Button>
        </form>
      ) : null}
    </div>
  );
}
