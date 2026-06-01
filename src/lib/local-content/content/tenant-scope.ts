// LocalContentOS Content Studio - tenant organization scope guards

import "server-only";

import { getContentRepository } from "./repository-instance";
import type { ContentItem } from "./types";

export function assertTenantOrganizationId(organizationId: string): void {
  if (!organizationId?.trim()) {
    throw new Error("organizationId is required for tenant scope");
  }
}

export async function assertContentItemInOrganization(
  contentItemId: string,
  organizationId: string,
): Promise<ContentItem> {
  assertTenantOrganizationId(organizationId);
  const id = contentItemId?.trim();
  if (!id) throw new Error("contentItemId is required");

  const item = await getContentRepository().getContentItem(id, organizationId);
  if (!item) throw new Error("Content item not found");
  return item;
}

export async function assertCampaignInOrganization(
  campaignId: string,
  organizationId: string,
): Promise<void> {
  assertTenantOrganizationId(organizationId);
  const id = campaignId?.trim();
  if (!id) throw new Error("campaignId is required");

  const campaign = await getContentRepository().getCampaign(id, organizationId);
  if (!campaign) throw new Error("Campaign not found");
}

export async function assertSourceInOrganization(
  sourceId: string,
  organizationId: string,
): Promise<void> {
  assertTenantOrganizationId(organizationId);
  const id = sourceId?.trim();
  if (!id) throw new Error("sourceId is required");

  const source = await getContentRepository().getSource(id, organizationId);
  if (!source) throw new Error("Source not found");
}
