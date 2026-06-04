/**
 * S7-05 — shared Arabic-first UX copy for SalesOS core routes.
 */

import { PIPELINE_STAGE_LABELS } from "@/lib/sales/types";

export const SALES_LAYOUT_RTL = true;

export const SALES_LOADING_MESSAGE_AR = "جاري تحميل مساحة المبيعات…";
export const SALES_EMPTY_PIPELINE_AR = "لا توجد فرص في هذه المرحلة.";
export const SALES_SUBNAV_ARIA_AR = "تنقل SalesOS";

export const SALES_FORECAST_CONFIDENCE_AR: Record<string, string> = {
  low: "منخفضة",
  medium: "متوسطة",
  high: "عالية",
};

export const SALES_PRIORITY_AR: Record<string, string> = {
  high: "عالية",
  medium: "متوسطة",
  low: "منخفضة",
};

export const SALES_SEVERITY_AR: Record<string, string> = {
  high: "عالية",
  medium: "متوسطة",
  low: "منخفضة",
  info: "معلومات",
};

export function formatSalesStageLabel(stage: string): string {
  return PIPELINE_STAGE_LABELS[stage]?.ar ?? stage;
}

export function formatSalesConfidence(value: string): string {
  return SALES_FORECAST_CONFIDENCE_AR[value] ?? value;
}

export function formatSalesPriority(value: string): string {
  return SALES_PRIORITY_AR[value] ?? value;
}

export function formatSalesSeverity(value: string): string {
  return SALES_SEVERITY_AR[value] ?? value;
}

/** Core governed routes (S7-05 parity manifest). */
export const SALES_CORE_ROUTES = [
  "/sales",
  "/sales/command-center",
  "/sales/pipeline",
  "/sales/intelligence",
  "/sales/forecast",
  "/sales/revenue",
  "/sales/icp",
  "/sales/deals",
  "/sales/opportunities",
  "/sales/accounts",
  "/sales/activities",
  "/sales/outreach",
  "/sales/signals",
  "/sales/review",
  "/sales/approval",
  "/sales/audit-trail",
  "/sales/reports",
  "/sales/funnel",
  "/sales/pipeline-depth",
] as const;
