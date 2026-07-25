import { useState, useMemo } from "react";

export type TabKey = "scores" | "spend" | "suppliers";

export function useReports() {
  const [activeTab, setActiveTab] = useState<TabKey>("scores");

  return {
    activeTab,
    setActiveTab,
  };
}

export const TAB_OPTIONS: { key: TabKey; label: string }[] = [
  { key: "scores", label: "درجات المحتوى المحلي" },
  { key: "spend", label: "تحليل الإنفاق" },
  { key: "suppliers", label: "الموردين" },
];

export const CATEGORY_LABELS: Record<string, string> = {
  goods: "سلع",
  services: "خدمات",
  construction: "إنشاءات",
  technology: "تقنية",
  logistics: "لوجستي",
  other: "أخرى",
};

export const CLASSIFICATION_LABELS: Record<string, string> = {
  local: "محلي",
  non_local: "غير محلي",
  mixed: "مختلط",
  unclassified: "غير مصنف",
};
