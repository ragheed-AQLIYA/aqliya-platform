import {
  listAccounts,
  listAllInteractions,
  listContactsForAccount,
  listICPInsights,
  listOpportunities,
  listWinLossInsights,
} from "@/lib/sales/store";

export const EXECUTIVE_COMMERCIAL_DISCLAIMER_AR =
  "لوحة ذكاء تجاري تنفيذي — DRAFT v0.2. مبنية على بيانات SalesOS التشغيلية؛ ليست CRM ولا قرارات آلية. المراجعة البشرية مطلوبة.";

export type ExecutiveSectionStatus = "ok" | "fallback" | "empty";

export interface ExecutiveCommercialSection<T> {
  status: ExecutiveSectionStatus;
  fallbackMessageAr?: string;
  data: T | null;
}

export function pct(n: number): number {
  return Math.round(n * 100);
}

export function loadOrgSalesData(orgId: string) {
  const accounts = listAccounts(orgId);
  const opportunities = listOpportunities(orgId);
  const interactions = listAllInteractions(orgId);
  const icpInsights = listICPInsights(orgId);
  const winLossInsights = listWinLossInsights(orgId);
  const contacts = accounts.flatMap((account) =>
    listContactsForAccount(orgId, account.id),
  );
  return {
    accounts,
    opportunities,
    interactions,
    icpInsights,
    winLossInsights,
    contacts,
  };
}
