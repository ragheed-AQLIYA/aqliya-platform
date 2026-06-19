"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2 } from "lucide-react";
import { createOrganizationAction } from "@/actions/organization-actions";

export function CreateOrganizationButton() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || name.trim().length < 2) {
      setError("اسم المؤسسة يجب أن يكون حرفين على الأقل");
      return;
    }
    setLoading(true);
    setError(null);

    const result = await createOrganizationAction({ name: name.trim() });
    setLoading(false);

    if (!result.ok) {
      setError(result.error || null);
      return;
    }

    setName("");
    setOpen(false);
    if (result.data) {
      router.push(`/organizations/${result.data.id}`);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        <Plus className="h-4 w-4" />
        إنشاء مؤسسة
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl bg-background p-6 shadow-lg" dir="rtl">
            <h2 className="text-lg font-semibold mb-4">إنشاء مؤسسة جديدة</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="org-name"
                  className="block text-sm font-medium mb-1.5"
                >
                  اسم المؤسسة
                </label>
                <input
                  id="org-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: مؤسسة التقنية المتقدمة"
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  autoFocus
                />
              </div>

              {error && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    setError(null);
                    setName("");
                  }}
                  className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={loading || !name.trim()}
                  className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  إنشاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
