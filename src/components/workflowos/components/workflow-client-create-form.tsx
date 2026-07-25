"use client";

export function WorkflowClientCreateForm({
  newName,
  newSlug,
  creating,
  error,
  onNameChange,
  onSlugChange,
  onSubmit,
  onCancel,
}: {
  newName: string;
  newSlug: string;
  creating: boolean;
  error: string | null;
  onNameChange: (name: string) => void;
  onSlugChange: (slug: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}) {
  return (
    <form
      onSubmit={onSubmit}
      className="rounded-lg border bg-card p-4 space-y-3"
    >
      <div>
        <label className="block text-[10px] font-medium text-muted-foreground mb-1">
          اسم العميل *
        </label>
        <input
          value={newName}
          onChange={(e) => {
            onNameChange(e.target.value);
            onSlugChange(
              e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
            );
          }}
          placeholder="مثال: شركة الأمل"
          className="w-full rounded-md border bg-background px-2 py-1.5 text-xs"
          required
        />
      </div>
      <div>
        <label className="block text-[10px] font-medium text-muted-foreground mb-1">
          الرابط المختصر *
        </label>
        <input
          value={newSlug}
          onChange={(e) =>
            onSlugChange(
              e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
            )
          }
          placeholder="al-amal"
          className="w-full rounded-md border bg-background px-2 py-1.5 text-xs font-mono"
          required
          dir="ltr"
        />
      </div>
      {error && (
        <div className="rounded-md bg-status-error/10 p-2 text-[10px] text-status-error">
          {error}
        </div>
      )}
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="text-[10px] text-muted-foreground hover:text-foreground"
        >
          إلغاء
        </button>
        <button
          type="submit"
          disabled={creating || !newName.trim() || !newSlug.trim()}
          className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {creating ? "جاري..." : "إنشاء"}
        </button>
      </div>
    </form>
  );
}
