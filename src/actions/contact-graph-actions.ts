"use server";

import { getCurrentUser } from "@/lib/auth";
import { getRelationshipGraphData, getGraphStats } from "@/lib/localcontactos/relationship-graph";

export async function getContactGraphDataAction(
  sensitivityLevel?: string,
  relationType?: string,
) {
  const user = await getCurrentUser();
  const orgId = user.organizationId;
  if (!orgId) throw new Error("Organization required");

  const [graphData, stats] = await Promise.all([
    getRelationshipGraphData({ organizationId: orgId, sensitivityLevel, relationType }),
    getGraphStats(orgId),
  ]);

  return { graphData, stats };
}
