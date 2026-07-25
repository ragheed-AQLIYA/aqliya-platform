import { prisma } from "@/lib/prisma";
import { createLogger } from "@/lib/observability/logger";
import type { Prisma } from "@prisma/client";
import type { Engagement } from "@/types/audit";
import type { PresentationProfile } from "@/lib/audit/presentation/presentation-profile";

const logger = createLogger({ product: "platform", action: "lib-audit-db-engagement-db-crud" });

export async function createClient(data: {
  organizationId: string;
  name: string;
  industry: string;
  reportingFramework?: string;
  currencyCode?: string;
}): Promise<import("@/types/audit").Client> {
  const { toClient } = await import("../types");
  const client = await prisma.auditClient.create({
    data: {
      organizationId: data.organizationId,
      name: data.name,
      industry: data.industry,
      reportingFramework: data.reportingFramework ?? "ifrs_for_smes",
      currencyCode: data.currencyCode ?? "SAR",
      fiscalPeriodEnd: "12-31",
    },
  });
  return toClient(client);
}

export async function createEngagement(data: {
  organizationId: string;
  clientId: string;
  fiscalPeriod: string;
  engagementType: string;
  team?: Array<Record<string, unknown>>;
  status?: string;
  presentationProfile?: string;
  presentationProfileVersion?: string;
  presentationPolicyId?: string;
}): Promise<Engagement> {
  const { toEngagement: toE } = await import("../types");
  const { policyIdForProfile } = await import(
    "@/lib/audit/presentation/presentation-policy-resolver"
  );
  const profile = data.presentationProfile ?? "generic";
  const engagement = await prisma.auditEngagement.create({
    data: {
      organizationId: data.organizationId,
      clientId: data.clientId,
      fiscalPeriod: data.fiscalPeriod,
      engagementType: data.engagementType as Prisma.AuditEngagementCreateInput["engagementType"],
      status: data.status ?? "setup",
      team: (data.team ?? []) as unknown as Prisma.InputJsonValue,
      presentationProfile: profile,
      presentationProfileVersion:
        data.presentationProfileVersion ?? "generic-v1",
      presentationPolicyId:
        data.presentationPolicyId ?? policyIdForProfile(profile as PresentationProfile),
    },
    include: { client: true },
  });
  return toE(engagement as unknown as Parameters<typeof toE>[0]);
}

export async function updateEngagementPresentationProfile(
  engagementId: string,
  params: {
    presentationProfile: string;
    presentationProfileVersion: string;
    presentationPolicyId: string;
  },
): Promise<Engagement> {
  const { toEngagement: toE } = await import("../types");
  const engagement = await prisma.auditEngagement.update({
    where: { id: engagementId },
    data: {
      presentationProfile: params.presentationProfile,
      presentationProfileVersion: params.presentationProfileVersion,
      presentationPolicyId: params.presentationPolicyId,
    },
    include: { client: true, presentationPolicy: true },
  });

  return toE(engagement as unknown as Parameters<typeof toE>[0]);
}

export async function updateEngagementStatus(
  id: string,
  status: string,
): Promise<void> {
  await prisma.auditEngagement.update({ where: { id }, data: { status } });
}

export async function getCanonicalAccounts(
  limit?: number,
): Promise<Array<{ id: string; code: string; name: string }>> {
  try {
    const accounts = await prisma.auditCanonicalAccount.findMany({
      orderBy: { displayOrder: "asc" },
      take: limit ?? 100,
    });
    return accounts.map((a) => ({ id: a.id, code: a.code, name: a.name }));
  } catch (error) {
    logger.warn("[AuditDB] getCanonicalAccounts error, returning empty", { detail: error, });
    return [];
  }
}
