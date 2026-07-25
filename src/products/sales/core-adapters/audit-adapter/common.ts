import "server-only";

export function normalizeSalesEventType(eventType: string): string {
  if (eventType === "sales.opportunity.submitted_for_review")
    return "sales.review.submitted";
  if (eventType === "sales.opportunity.approved")
    return "sales.approval.approved";
  if (eventType === "sales.evidence.linked") return "sales.proof.linked";
  if (eventType === "evidence.linked") return "sales.proof.linked";
  if (eventType.startsWith("sales.")) return eventType;
  return eventType;
}

export function resolveSalesTenantId(user: {
  organizationId: string;
  platformOrganizationId?: string;
}): string {
  return user.platformOrganizationId ?? user.organizationId;
}
