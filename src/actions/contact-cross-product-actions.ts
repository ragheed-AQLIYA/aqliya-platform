"use server";

import { getCurrentUser } from "@/lib/auth";
import { getCrossProductContactView } from "@/lib/localcontactos/cross-product-service";

export async function getRelationship360Action(contactId: string) {
  const user = await getCurrentUser();
  const orgId = user.organizationId;
  if (!orgId) throw new Error("Organization required");

  return getCrossProductContactView(contactId, orgId);
}
