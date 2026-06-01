// LocalContentOS Content Studio — output package engine (repository-backed)

import type { Campaign, ContentItem, OutputPackage } from "./types";
import type { CreateOutputPackageInput } from "./contracts";
import { getContentRepository } from "./repository-instance";
import { assertOutputTransition } from "./workflow";
import {
  assertCampaignInOrganization,
  assertTenantOrganizationId,
} from "./tenant-scope";

export interface OutputPackagePayload {
  package: OutputPackage;
  campaign: Campaign;
  approvedContent: ContentItem[];
  contentCalendar: Array<{ title: string; format: string; status: string }>;
  complianceMemo: string;
}

export async function createOutputPackage(
  input: CreateOutputPackageInput,
): Promise<OutputPackage> {
  assertTenantOrganizationId(input.organizationId);
  await assertCampaignInOrganization(input.campaignId, input.organizationId);
  return getContentRepository().createOutput(input);
}

export async function buildOutputPackagePayload(
  packageId: string,
  organizationId: string,
): Promise<OutputPackagePayload> {
  assertTenantOrganizationId(organizationId);
  const repo = getContentRepository();
  const pkg = await repo.getOutput(packageId, organizationId);
  if (!pkg) throw new Error("Output package not found");

  const campaign = await repo.getCampaign(pkg.campaignId, organizationId);
  if (!campaign) throw new Error("Campaign not found");

  const items = await repo.listContentItemsByCampaign(
    campaign.id,
    organizationId,
  );
  const sources = await repo.listSourcesForCampaign(campaign.id, organizationId);

  const approvedContent = items.filter(
    (c) =>
      c.status === "approved" ||
      c.status === "ready_to_publish" ||
      c.status === "published",
  );

  const contentCalendar = items.map((c) => ({
    title: c.title,
    format: c.format,
    status: c.status,
  }));

  const complianceMemo = [
    "# Compliance Memo — LocalContentOS Content Studio",
    "",
    `Campaign: ${campaign.name}`,
    `Status: ${campaign.status}`,
    "",
    "## Approved content count",
    String(approvedContent.length),
    "",
    "## Source coverage",
    `Total sources: ${sources.length}`,
    "",
    "_Human approval required before external distribution. AI assists; humans decide._",
  ].join("\n");

  return {
    package: pkg,
    campaign,
    approvedContent,
    contentCalendar,
    complianceMemo,
  };
}

export async function markOutputExported(
  packageId: string,
  organizationId: string,
  metadata?: Record<string, unknown>,
): Promise<OutputPackage> {
  assertTenantOrganizationId(organizationId);
  const repo = getContentRepository();
  const existing = await repo.getOutput(packageId, organizationId);
  if (!existing) throw new Error("Output package not found");
  if (existing.status === "exported") {
    throw new Error("Output package already exported");
  }

  // Packages are created as draft; workflow requires approved before exported.
  let status = existing.status;
  if (status === "draft" || status === "ready") {
    assertOutputTransition(status, "approved");
    await repo.updateOutput(packageId, organizationId, { status: "approved" });
    status = "approved";
  }

  assertOutputTransition(status, "exported");
  return repo.updateOutput(packageId, organizationId, {
    status: "exported",
    exportedAt: new Date().toISOString(),
    exportMetadata: {
      ...metadata,
      productId: "localcontentos",
      exportedAt: new Date().toISOString(),
    },
  });
}

export async function listOutputPackages(
  organizationId: string,
): Promise<OutputPackage[]> {
  assertTenantOrganizationId(organizationId);
  return getContentRepository().listOutputs(organizationId);
}

export async function getOutputReadiness(
  campaignId: string,
  organizationId: string,
): Promise<{ ready: boolean; blockers: string[] }> {
  assertTenantOrganizationId(organizationId);
  await assertCampaignInOrganization(campaignId, organizationId);
  const repo = getContentRepository();
  const items = await repo.listContentItemsByCampaign(
    campaignId,
    organizationId,
  );
  const blockers: string[] = [];

  const inReview = items.filter(
    (c) => c.status === "in_review" || c.status === "draft",
  );
  if (inReview.length > 0) {
    blockers.push(`${inReview.length} content item(s) not yet approved`);
  }

  const sources = await repo.listSourcesForCampaign(campaignId, organizationId);
  const unverified = sources.filter((s) => s.status === "proposed");
  if (unverified.length > 0) {
    blockers.push(`${unverified.length} source(s) not verified`);
  }

  return { ready: blockers.length === 0, blockers };
}
