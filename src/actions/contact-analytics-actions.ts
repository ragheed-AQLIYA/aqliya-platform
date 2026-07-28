"use server";

import { getCurrentUser } from "@/lib/auth";
import { getContactAnalytics } from "@/lib/localcontactos/analytics-service";

export async function getContactAnalyticsAction() {
  const user = await getCurrentUser();
  const orgId = user.organizationId;
  if (!orgId) throw new Error("Organization required");

  return getContactAnalytics(orgId);
}
