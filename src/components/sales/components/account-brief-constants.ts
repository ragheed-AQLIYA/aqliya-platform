export const ACCOUNT_STATUS_LABELS: Record<string, string> = {
  active: "نشط",
  inactive: "غير نشط",
  archived: "مؤرشف",
};

export const DEAL_STATUS_LABELS: Record<string, string> = {
  open: "مفتوحة",
  won: "مكسوبة",
  lost: "مخسورة",
};

export const RESEARCH_STATUS_LABELS: Record<string, string> = {
  draft_pending_review: "مسودة — بانتظار المراجعة",
  reviewed: "تمت المراجعة",
};

export const SEVERITY_COLORS: Record<string, string> = {
  high: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200",
  medium: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  low: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200",
};

export function formatArDate(iso: string | Date | null | undefined): string {
  if (!iso) return "—";
  const d = iso instanceof Date ? iso : new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("ar-SA", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}

export function formatAmount(amount: number | null, currency: string): string {
  if (amount == null) return "—";
  return new Intl.NumberFormat("ar-SA", {
    style: "currency",
    currency: currency || "SAR",
    maximumFractionDigits: 0,
  }).format(amount);
}
