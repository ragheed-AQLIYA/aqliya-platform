"use server";

import { getCurrentUser } from "@/lib/auth";
import { initSalesWorkspace } from "@/lib/sales/service";
import { updateOpportunity } from "@/lib/sales/store";

const REASON_LABELS: Record<string, string> = {
  budget_freeze: "budget_freeze",
  no_executive_sponsor: "no_executive_sponsor",
  competitor: "competitor",
  price_value: "price_value",
  pilot_success: "pilot_success",
  governance_approved: "governance_approved",
  other: "other",
};

export async function captureOpportunityWinLossDraftAction(
  opportunityId: string,
  formData: FormData,
) {
  const user = await getCurrentUser();
  await initSalesWorkspace(user);
  const reasonKey = String(formData.get("reasonKey") ?? "").trim();
  const notes = String(formData.get("reasonNotes") ?? "").trim();
  if (!reasonKey) {
    throw new Error("Win/loss reason is required");
  }

  const base = REASON_LABELS[reasonKey] ?? reasonKey;
  const winLossReason = notes.length > 0 ? `${base}: ${notes}` : base;

  const updated = updateOpportunity(user.organizationId, opportunityId, {
    winLossReason,
    updatedAt: new Date().toISOString(),
  });
  if (!updated) {
    throw new Error("Failed to update opportunity");
  }
  return { ok: true as const, winLossReason };
}
