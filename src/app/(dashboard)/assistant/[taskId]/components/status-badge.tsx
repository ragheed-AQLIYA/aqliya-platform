import { STATUS_LABELS } from "./constants";

const COLORS: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  generated: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200",
  needs_review:
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200",
  reviewed:
    "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200",
  approved:
    "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200",
  rejected: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${COLORS[status] || ""}`}
    >
      {STATUS_LABELS[status]?.en || status}
    </span>
  );
}
