export const CATEGORY_LABELS: Record<string, { ar: string; en: string }> = {
  "Current Assets": { ar: "الأصول المتداولة", en: "Current Assets" },
  "Non-Current Assets": { ar: "الأصول غير المتداولة", en: "Non-Current Assets" },
  "Current Liabilities": { ar: "الخصوم المتداولة", en: "Current Liabilities" },
  "Non-Current Liabilities": {
    ar: "الخصوم غير المتداولة",
    en: "Non-Current Liabilities",
  },
  Equity: { ar: "حقوق الملكية", en: "Equity" },
  Revenue: { ar: "الإيرادات", en: "Revenue" },
  Expenses: { ar: "المصروفات", en: "Expenses" },
  Other: { ar: "أخرى", en: "Other" },
};

export function categoryToPaperNumber(category: string): string {
  const slug =
    category.toUpperCase().replace(/[^A-Z0-9]/gi, "").slice(0, 12) || "OTHER";
  return `LS-${slug}`;
}

export function resolveCategoryLabel(category: string): {
  ar: string;
  en: string;
} {
  return (
    CATEGORY_LABELS[category] ?? {
      ar: category,
      en: category,
    }
  );
}
