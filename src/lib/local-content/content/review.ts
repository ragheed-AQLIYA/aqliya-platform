// LocalContentOS Content Studio — review and approval (repository-backed)

import type {
  ContentApprovalRecord,
  ContentGovernanceAudit,
  ContentItem,
  ContentReviewRecord,
} from "./types";
import type { SubmitApprovalInput, SubmitReviewInput } from "./contracts";
import { getContentRepository } from "./repository-instance";
import {
  assertContentItemInOrganization,
  assertTenantOrganizationId,
} from "./tenant-scope";

function governanceAudit(
  action: ContentGovernanceAudit["action"],
  input: { reviewerId?: string; reviewerName?: string; approverId?: string; approverName?: string },
): ContentGovernanceAudit {
  return {
    productId: "localcontentos",
    action,
    recordedAt: new Date().toISOString(),
    actorId: input.reviewerId ?? input.approverId,
    actorName: input.reviewerName ?? input.approverName,
  };
}

function withReviewGovernance(input: SubmitReviewInput): SubmitReviewInput {
  return {
    ...input,
    dimensions: {
      ...input.dimensions,
      governance: governanceAudit("review", input),
    },
  };
}

function assertReviewableItem(item: ContentItem): void {
  if (item.status === "archived") {
    throw new Error("Cannot review archived content");
  }
  if (item.status === "published") {
    throw new Error("Cannot review published content");
  }
}

export async function submitContentReview(
  input: SubmitReviewInput,
): Promise<ContentReviewRecord> {
  assertTenantOrganizationId(input.organizationId);
  const item = await assertContentItemInOrganization(
    input.contentItemId,
    input.organizationId,
  );
  assertReviewableItem(item);

  if (
    input.status === "changes_requested" &&
    item.status !== "in_review" &&
    item.status !== "draft"
  ) {
    throw new Error("changes_requested requires content in draft or in_review");
  }

  return getContentRepository().createReview(withReviewGovernance(input));
}

export async function submitContentApproval(
  input: SubmitApprovalInput,
): Promise<{ approval: ContentApprovalRecord; item: ContentItem }> {
  assertTenantOrganizationId(input.organizationId);
  const item = await assertContentItemInOrganization(
    input.contentItemId,
    input.organizationId,
  );
  assertReviewableItem(item);

  if (input.approved && item.status !== "in_review") {
    throw new Error("Content must be in_review before approval");
  }

  const governance = governanceAudit("approval", input);
  const result = await getContentRepository().createApproval(input);
  return {
    approval: {
      ...result.approval,
      governance,
    },
    item: result.item,
  };
}

export async function listReviewQueue(
  organizationId: string,
): Promise<ContentItem[]> {
  assertTenantOrganizationId(organizationId);
  return getContentRepository().listReviewQueue(organizationId);
}

export async function listApprovalQueue(
  organizationId: string,
): Promise<ContentItem[]> {
  assertTenantOrganizationId(organizationId);
  return getContentRepository().listApprovalQueue(organizationId);
}

export async function listReviewsForItem(
  contentItemId: string,
  organizationId: string,
): Promise<ContentReviewRecord[]> {
  assertTenantOrganizationId(organizationId);
  await assertContentItemInOrganization(contentItemId, organizationId);
  return getContentRepository().listReviewsForItem(
    contentItemId,
    organizationId,
  );
}

export async function listApprovalsForItem(
  contentItemId: string,
  organizationId: string,
): Promise<ContentApprovalRecord[]> {
  assertTenantOrganizationId(organizationId);
  await assertContentItemInOrganization(contentItemId, organizationId);
  return getContentRepository().listApprovalsForItem(
    contentItemId,
    organizationId,
  );
}
