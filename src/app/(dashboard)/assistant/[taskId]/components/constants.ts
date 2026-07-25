export const STATUS_STEPS = ["draft", "generated", "needs_review", "approved"];

export const STATUS_LABELS: Record<string, { ar: string; en: string }> = {
  draft: { ar: "مسودة", en: "Draft" },
  generated: { ar: "تم التوليد", en: "Generated" },
  needs_review: { ar: "بانتظار المراجعة", en: "Needs Review" },
  reviewed: { ar: "تمت المراجعة", en: "Reviewed" },
  approved: { ar: "معتمد", en: "Approved" },
  rejected: { ar: "مرفوض", en: "Rejected" },
  archived: { ar: "مؤرشف", en: "Archived" },
};
