export const STATUS_LABELS: Record<string, string> = {
  draft: "مسودة",
  submitted: "مُرسَل للتسليم",
  decided: "قرار مسجّل",
};

export const STATUS_COLORS: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  submitted:
    "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  decided:
    "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
};

export function formatActionError(error: string, code?: string): string {
  if (code === "FORBIDDEN" || error === "Access denied") {
    return "لا تملك صلاحية تعديل مذكرة التحويل";
  }
  if (code === "VALIDATION") {
    return error.replace(/^SalesOS validation:\s*/i, "");
  }
  return error || "تعذر تحديث مذكرة التحويل";
}
