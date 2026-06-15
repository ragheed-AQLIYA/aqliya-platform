import "server-only";

import { prisma } from "@/lib/prisma";
import type { ResolvedPresentationContext } from "@/lib/audit/presentation/presentation-policy-types";
import { resolvePresentationContextFromParts } from "@/lib/audit/presentation/presentation-policy-resolver";

export type { ResolvedPresentationContext };

export async function loadEngagementPresentationContext(
  engagementId: string,
): Promise<ResolvedPresentationContext> {
  const engagement = await prisma.auditEngagement.findUnique({
    where: { id: engagementId },
    select: {
      presentationProfile: true,
      presentationProfileVersion: true,
      presentationPolicyId: true,
      presentationPolicy: {
        select: {
          slug: true,
          rules: true,
        },
      },
    },
  });

  return resolvePresentationContextFromParts({
    presentationProfile: engagement?.presentationProfile,
    presentationProfileVersion: engagement?.presentationProfileVersion,
    presentationPolicyId: engagement?.presentationPolicyId,
    policyRules: engagement?.presentationPolicy?.rules,
    policySlug: engagement?.presentationPolicy?.slug,
  });
}

/** @deprecated Use loadEngagementPresentationContext */
export async function loadEngagementPresentationConfig(engagementId: string) {
  const ctx = await loadEngagementPresentationContext(engagementId);
  return {
    presentationProfile: ctx.presentationProfile,
    presentationProfileVersion: ctx.presentationProfileVersion,
    policy: ctx.policy,
  };
}

export async function getPresentationPolicyById(policyId: string) {
  return prisma.auditPresentationPolicy.findUnique({
    where: { id: policyId },
  });
}

export async function listSystemPresentationPolicies() {
  return prisma.auditPresentationPolicy.findMany({
    where: { isSystem: true },
    orderBy: { slug: "asc" },
  });
}
