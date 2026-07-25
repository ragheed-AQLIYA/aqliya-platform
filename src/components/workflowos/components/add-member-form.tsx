"use client";

export function AddMemberForm({
  email,
  role,
  adding,
  error,
  onEmailChange,
  onRoleChange,
  onCancel,
  onSubmit,
}: {
  email: string;
  role: string;
  adding: boolean;
  error: string | null;
  onEmailChange: (value: string) => void;
  onRoleChange: (value: string) => void;
  onCancel: () => void;
  onSubmit: (e: React.FormEvent) => void;
}) {
  const roleLabels: Record<string, string> = {
    PlatformAdmin: "مدير منصة",
    Operator: "مشغل",
    Reviewer: "مراجع",
  };

  return (
    <form onSubmit={onSubmit} className="rounded-lg border bg-card p-4 space-y-3">
      <div>
        <label className="block text-[10px] font-medium text-muted-foreground mb-1">
          البريد الإلكتروني *
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          placeholder="user@example.com"
          className="w-full rounded-md border bg-background px-2 py-1.5 text-xs"
          required
          dir="ltr"
        />
      </div>
      <div>
        <label className="block text-[10px] font-medium text-muted-foreground mb-1">
          الدور
        </label>
        <select
          value={role}
          onChange={(e) => onRoleChange(e.target.value)}
          className="w-full rounded-md border bg-background px-2 py-1.5 text-xs"
        >
          {Object.entries(roleLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
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
          disabled={adding || !email.trim()}
          className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {adding ? "جاري..." : "إضافة"}
        </button>
      </div>
    </form>
  );
}
