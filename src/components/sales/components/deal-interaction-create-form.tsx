"use client";

import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TYPE_OPTIONS } from "./use-deal-interaction-panel";

export function DealInteractionCreateForm({
  loading,
  error,
  onSubmit,
}: {
  loading: boolean;
  error: string | null;
  onSubmit: (formData: FormData) => void;
}) {
  return (
    <form action={onSubmit} className="space-y-3 border-t pt-4">
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
  );
}
