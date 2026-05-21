"use client";

import { useState } from "react";
import { sunbul_createRecord } from "@/actions/sunbul-actions";
import { Loader2, Plus } from "lucide-react";

export function SunbulCreateRecordForm({
  clientId,
  onCreated,
}: {
  clientId: string | null;
  onCreated: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!clientId) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    setError(null);

    const result = await sunbul_createRecord(clientId!, {
      title: title.trim(),
      description: description.trim() || undefined,
    });

    setSubmitting(false);

    if (result.success) {
      setTitle("");
      setDescription("");
      setOpen(false);
      onCreated();
    } else {
      setError(result.error ?? "فشل إنشاء القضية");
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        <Plus className="h-4 w-4" />
        إنشاء قضية
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border bg-card p-4 space-y-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">قضية جديدة</h3>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          إلغاء
        </button>
      </div>
      <div>
        <label
          htmlFor="sb-title"
          className="block text-xs font-medium text-muted-foreground mb-1"
        >
          العنوان *
        </label>
        <input
          id="sb-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="أدخل عنوان القضية"
          className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          required
        />
      </div>
      <div>
        <label
          htmlFor="sb-desc"
          className="block text-xs font-medium text-muted-foreground mb-1"
        >
          الوصف
        </label>
        <textarea
          id="sb-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="وصف القضية (اختياري)"
          rows={3}
          className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
        />
      </div>
      {error && (
        <div className="rounded-md bg-status-error/10 p-3 text-xs text-status-error">
          {error}
        </div>
      )}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={submitting || !title.trim()}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          {submitting ? "جاري الإنشاء..." : "إنشاء"}
        </button>
      </div>
    </form>
  );
}
