// LocalContentOS Content Studio — source/evidence (repository-backed)

import type { ContentSource, SourceStatus } from "./types";
import { getContentRepository } from "./repository-instance";
import {
  assertSourceInOrganization,
  assertTenantOrganizationId,
} from "./tenant-scope";

export async function verifySource(
  sourceId: string,
  organizationId: string,
  actor?: { id?: string; name?: string },
): Promise<ContentSource> {
  assertTenantOrganizationId(organizationId);
  await assertSourceInOrganization(sourceId, organizationId);
  const verified = await getContentRepository().verifySource(
    sourceId,
    organizationId,
    actor,
  );
  return {
    ...verified,
    evidenceMetadata: {
      ...(verified.evidenceMetadata ?? {}),
      productId: "localcontentos",
      verificationAction: "source_verify",
    },
  };
}

export async function rejectSource(
  sourceId: string,
  organizationId: string,
  reason?: string,
): Promise<ContentSource> {
  assertTenantOrganizationId(organizationId);
  await assertSourceInOrganization(sourceId, organizationId);
  return getContentRepository().rejectSource(sourceId, organizationId, reason);
}

export async function listSourcesForCampaign(
  campaignId: string,
  organizationId: string,
): Promise<ContentSource[]> {
  assertTenantOrganizationId(organizationId);
  return getContentRepository().listSourcesForCampaign(
    campaignId,
    organizationId,
  );
}

export async function listSourcesForContentItem(
  contentItemId: string,
  organizationId: string,
): Promise<ContentSource[]> {
  assertTenantOrganizationId(organizationId);
  const repo = getContentRepository();
  const item = await repo.getContentItem(contentItemId, organizationId);
  if (!item) throw new Error("Content item not found");

  const campaignSources = await repo.listSourcesForCampaign(
    item.campaignId,
    organizationId,
  );
  return campaignSources.filter(
    (s) => s.contentItemId === contentItemId || item.sourceRefIds.includes(s.id),
  );
}

export async function getSourceCoverage(
  campaignId: string,
  organizationId: string,
): Promise<{
  total: number;
  verified: number;
  proposed: number;
  rejected: number;
  expired: number;
  coverageRatio: number;
}> {
  const sources = await listSourcesForCampaign(campaignId, organizationId);
  const total = sources.length;
  const verified = sources.filter((s) => s.status === "verified").length;
  const proposed = sources.filter((s) => s.status === "proposed").length;
  const rejected = sources.filter((s) => s.status === "rejected").length;
  const expired = sources.filter((s) => s.status === "expired").length;
  return {
    total,
    verified,
    proposed,
    rejected,
    expired,
    coverageRatio: total > 0 ? verified / total : 0,
  };
}

export async function updateSourceStatus(
  sourceId: string,
  organizationId: string,
  status: SourceStatus,
): Promise<ContentSource> {
  assertTenantOrganizationId(organizationId);
  await assertSourceInOrganization(sourceId, organizationId);
  return getContentRepository().updateSourceStatus(
    sourceId,
    organizationId,
    status,
  );
}
