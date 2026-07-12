import { describe, expect, it, beforeEach } from "@jest/globals";
import { resetContentRepositoryForTests, reloadContentRepositoryInstance } from "@/lib/local-content/content/repository-instance";
import { getContentRepository } from "@/lib/local-content/content/repository-instance";
import {
  createContentProject,
  createContentCampaign,
  createContentItem,
  createContentSource,
  getCommandCenterSummary,
} from "@/lib/local-content/content/services";
import { executeGovernedAI } from "@/lib/local-content/content/ai";
import {
  submitContentReview,
  submitContentApproval,
  listReviewQueue,
} from "@/lib/local-content/content/review";
import {
  createOutputPackage,
  getOutputReadiness,
  markOutputExported,
} from "@/lib/local-content/content/outputs";
import { verifySource, getSourceCoverage } from "@/lib/local-content/content/evidence";
import {
  describeContentRepositoryBackend,
  resolveContentRepositoryBackend,
} from "@/lib/local-content/content/repository-instance";
import { canTransitionCampaign } from "@/lib/local-content/content/workflow";
import {
  assertLocalContentPermission,
  hasLocalContentPermission,
} from "@/lib/local-content/content/permissions";
import {
  assertContentItemTransition,
  canTransitionContentItem,
} from "@/lib/local-content/content/workflow";
import { submitContentItemForReview } from "@/lib/local-content/content/services";

const ORG = "test-org-lcos";
const ORG_B = "test-org-other";

describe("LocalContentOS Content Studio", () => {
  beforeEach(async () => {
    await resetContentRepositoryForTests();
  });

  it("creates project → campaign → source → content item flow", async () => {
    const project = await createContentProject({
      organizationId: ORG,
      title: "Test Content Project",
      language: "ar",
    });
    expect(project.id).toMatch(/^cproj_/);

    const campaign = await createContentCampaign({
      organizationId: ORG,
      contentProjectId: project.id,
      name: "Launch Campaign",
      channels: ["linkedin"],
    });
    expect(campaign.status).toBe("draft");

    const source = await createContentSource({
      organizationId: ORG,
      campaignId: campaign.id,
      title: "Reference URL",
      type: "url",
      url: "https://example.com",
    });
    expect(source.status).toBe("proposed");

    const item = await createContentItem({
      organizationId: ORG,
      campaignId: campaign.id,
      title: "Launch post",
      format: "social_post",
      sourceRefIds: [source.id],
    });
    expect(item.status).toBe("idea");

    const summary = await getCommandCenterSummary(ORG);
    expect(summary.campaignCount).toBe(1);
    expect(summary.contentItemCount).toBe(1);
    expect(summary.sourceCount).toBe(1);
  });

  it("executeGovernedAI returns reviewRequired=true", async () => {
    const project = await createContentProject({
      organizationId: ORG,
      title: "AI Project",
    });
    const campaign = await createContentCampaign({
      organizationId: ORG,
      contentProjectId: project.id,
      name: "AI Campaign",
    });
    const item = await createContentItem({
      organizationId: ORG,
      campaignId: campaign.id,
      title: "Draft item",
      format: "article",
    });

    const result = await executeGovernedAI(item.id, {
      organizationId: ORG,
      instructions: "Write intro",
    });
    expect(result.reviewRequired).toBe(true);
    expect(result.productId).toBe("localcontentos");
    expect(result.success || result.unavailable).toBeTruthy();
  });

  it("submitContentReview records review dimensions", async () => {
    const project = await createContentProject({
      organizationId: ORG,
      title: "Review Project",
    });
    const campaign = await createContentCampaign({
      organizationId: ORG,
      contentProjectId: project.id,
      name: "Review Campaign",
    });
    const item = await createContentItem({
      organizationId: ORG,
      campaignId: campaign.id,
      title: "Review item",
      format: "article",
      status: "draft",
    });

    const review = await submitContentReview({
      contentItemId: item.id,
      organizationId: ORG,
      status: "approved",
      dimensions: { sourceGrounding: true, compliance: true },
      reviewerId: "user-1",
    });
    expect(review.status).toBe("approved");
    expect(review.dimensions.compliance).toBe(true);
    expect(review.dimensions.governance?.productId).toBe("localcontentos");
    expect(review.dimensions.governance?.action).toBe("review");
  });

  it("resolveContentRepositoryBackend defaults to file in tests", () => {
    const resolved = resolveContentRepositoryBackend();
    expect(resolved.backend).toBe("file");
    expect(describeContentRepositoryBackend().backend).toBe("file");
  });

  it("canTransitionCampaign allows same-status no-op", () => {
    expect(canTransitionCampaign("draft", "draft")).toBe(true);
  });

  it("markOutputExported rejects double export", async () => {
    const project = await createContentProject({
      organizationId: ORG,
      title: "Export Project",
    });
    const campaign = await createContentCampaign({
      organizationId: ORG,
      contentProjectId: project.id,
      name: "Export Campaign",
    });
    const pkg = await createOutputPackage({
      organizationId: ORG,
      campaignId: campaign.id,
      title: "Once",
    });
    await markOutputExported(pkg.id, ORG);
    await expect(markOutputExported(pkg.id, ORG)).rejects.toThrow(
      "already exported",
    );
  });

  it("getSourceCoverage reports verified ratio", async () => {
    const project = await createContentProject({
      organizationId: ORG,
      title: "Coverage Project",
    });
    const campaign = await createContentCampaign({
      organizationId: ORG,
      contentProjectId: project.id,
      name: "Coverage Campaign",
    });
    const source = await createContentSource({
      organizationId: ORG,
      campaignId: campaign.id,
      title: "Source A",
      type: "url",
      url: "https://example.com/cov",
    });
    await verifySource(source.id, ORG);
    const coverage = await getSourceCoverage(campaign.id, ORG);
    expect(coverage.total).toBe(1);
    expect(coverage.verified).toBe(1);
    expect(coverage.coverageRatio).toBe(1);
  });

  it("listReviewQueue returns draft/in_review items scoped to organization", async () => {
    const project = await createContentProject({
      organizationId: ORG,
      title: "Queue Project",
    });
    const campaign = await createContentCampaign({
      organizationId: ORG,
      contentProjectId: project.id,
      name: "Queue Campaign",
    });
    const draftItem = await createContentItem({
      organizationId: ORG,
      campaignId: campaign.id,
      title: "Draft item",
      format: "article",
      status: "draft",
    });
    const reviewItem = await createContentItem({
      organizationId: ORG,
      campaignId: campaign.id,
      title: "In review item",
      format: "social_post",
      status: "in_review",
    });
    await createContentItem({
      organizationId: ORG,
      campaignId: campaign.id,
      title: "Approved item",
      format: "article",
      status: "approved",
    });

    const otherProject = await createContentProject({
      organizationId: ORG_B,
      title: "Other org project",
    });
    const otherCampaign = await createContentCampaign({
      organizationId: ORG_B,
      contentProjectId: otherProject.id,
      name: "Other org campaign",
    });
    await createContentItem({
      organizationId: ORG_B,
      campaignId: otherCampaign.id,
      title: "Other org draft",
      format: "article",
      status: "draft",
    });

    const queue = await listReviewQueue(ORG);
    const ids = queue.map((i) => i.id);
    expect(ids).toContain(draftItem.id);
    expect(ids).toContain(reviewItem.id);
    expect(ids).toHaveLength(2);
    expect(queue.every((i) => i.organizationId === ORG)).toBe(true);
  });

  it("getOutputReadiness blocks on unapproved content and unverified sources", async () => {
    const project = await createContentProject({
      organizationId: ORG,
      title: "Readiness Project",
    });
    const campaign = await createContentCampaign({
      organizationId: ORG,
      contentProjectId: project.id,
      name: "Readiness Campaign",
    });
    await createContentItem({
      organizationId: ORG,
      campaignId: campaign.id,
      title: "Still draft",
      format: "article",
      status: "draft",
    });
    await createContentSource({
      organizationId: ORG,
      campaignId: campaign.id,
      title: "Unverified source",
      type: "url",
      url: "https://example.com/readiness",
    });

    const blocked = await getOutputReadiness(campaign.id, ORG);
    expect(blocked.ready).toBe(false);
    expect(blocked.blockers.length).toBeGreaterThanOrEqual(2);
    expect(
      blocked.blockers.some((b) => b.includes("not yet approved")),
    ).toBe(true);
    expect(blocked.blockers.some((b) => b.includes("not verified"))).toBe(
      true,
    );
  });

  it("getOutputReadiness is ready when content approved and sources verified", async () => {
    const project = await createContentProject({
      organizationId: ORG,
      title: "Ready Project",
    });
    const campaign = await createContentCampaign({
      organizationId: ORG,
      contentProjectId: project.id,
      name: "Ready Campaign",
    });
    await createContentItem({
      organizationId: ORG,
      campaignId: campaign.id,
      title: "Approved content",
      format: "article",
      status: "approved",
    });
    const source = await createContentSource({
      organizationId: ORG,
      campaignId: campaign.id,
      title: "Verified source",
      type: "url",
      url: "https://example.com/ready",
    });
    await verifySource(source.id, ORG, { id: "reviewer-1" });

    const ready = await getOutputReadiness(campaign.id, ORG);
    expect(ready.ready).toBe(true);
    expect(ready.blockers).toHaveLength(0);
  });
});

describe("LocalContentOS persistence boundary", () => {
  beforeEach(async () => {
    await resetContentRepositoryForTests();
  });

  it("scopes reads by organizationId", async () => {
    const project = await createContentProject({
      organizationId: ORG,
      title: "Org A Project",
    });
    const cross = await getContentRepository().getProject(project.id, ORG_B);
    expect(cross).toBeNull();
  });

  it("persists reviewRequired after repository reinitialization", async () => {
    const campaign = await createContentCampaign({
      organizationId: ORG,
      contentProjectId: (
        await createContentProject({ organizationId: ORG, title: "P" })
      ).id,
      name: "C",
    });
    const item = await createContentItem({
      organizationId: ORG,
      campaignId: campaign.id,
      title: "Item",
      format: "article",
    });
    await executeGovernedAI(item.id, { organizationId: ORG });
    reloadContentRepositoryInstance();
    const reloaded = await getContentRepository().getContentItem(item.id, ORG);
    expect(reloaded?.reviewRequired).toBe(true);
    expect(reloaded?.aiGenerated).toBe(true);
  });

  it("output metadata persists across reload", async () => {
    const project = await createContentProject({ organizationId: ORG, title: "P" });
    const campaign = await createContentCampaign({
      organizationId: ORG,
      contentProjectId: project.id,
      name: "C",
    });
    const pkg = await createOutputPackage({
      organizationId: ORG,
      campaignId: campaign.id,
      title: "Export Pack",
    });
    reloadContentRepositoryInstance();
    const found = await getContentRepository().getOutput(pkg.id, ORG);
    expect(found?.title).toBe("Export Pack");
  });

  it("campaign is scoped by organizationId", async () => {
    const project = await createContentProject({
      organizationId: ORG,
      title: "Scoped Project",
    });
    const campaign = await createContentCampaign({
      organizationId: ORG,
      contentProjectId: project.id,
      name: "Scoped Campaign",
    });
    const cross = await getContentRepository().getCampaign(campaign.id, ORG_B);
    expect(cross).toBeNull();
  });

  it("source links to campaign", async () => {
    const project = await createContentProject({ organizationId: ORG, title: "P" });
    const campaign = await createContentCampaign({
      organizationId: ORG,
      contentProjectId: project.id,
      name: "C",
    });
    const source = await createContentSource({
      organizationId: ORG,
      campaignId: campaign.id,
      title: "Linked Source",
      type: "url",
      url: "https://example.com/source",
    });
    expect(source.campaignId).toBe(campaign.id);
    const listed = await getContentRepository().listSourcesForCampaign(
      campaign.id,
      ORG,
    );
    expect(listed.some((s) => s.id === source.id)).toBe(true);
  });

  it("approval persists with item status transition", async () => {
    const project = await createContentProject({ organizationId: ORG, title: "P" });
    const campaign = await createContentCampaign({
      organizationId: ORG,
      contentProjectId: project.id,
      name: "C",
    });
    const item = await createContentItem({
      organizationId: ORG,
      campaignId: campaign.id,
      title: "Approval item",
      format: "article",
      status: "in_review",
    });
    const { approval, item: approvedItem } = await submitContentApproval({
      contentItemId: item.id,
      organizationId: ORG,
      approved: true,
      approverId: "admin-1",
    });
    expect(approval.approved).toBe(true);
    expect(approvedItem.status).toBe("approved");
    reloadContentRepositoryInstance();
    const approvals = await getContentRepository().listApprovalsForItem(
      item.id,
      ORG,
    );
    expect(approvals.some((a) => a.id === approval.id)).toBe(true);
  });

  it("content item is scoped by organizationId", async () => {
    const project = await createContentProject({
      organizationId: ORG,
      title: "Item scope project",
    });
    const campaign = await createContentCampaign({
      organizationId: ORG,
      contentProjectId: project.id,
      name: "Item scope campaign",
    });
    const item = await createContentItem({
      organizationId: ORG,
      campaignId: campaign.id,
      title: "Scoped item",
      format: "article",
    });
    const cross = await getContentRepository().getContentItem(item.id, ORG_B);
    expect(cross).toBeNull();
  });

  it("markOutputExported persists export audit metadata", async () => {
    const project = await createContentProject({
      organizationId: ORG,
      title: "Export metadata project",
    });
    const campaign = await createContentCampaign({
      organizationId: ORG,
      contentProjectId: project.id,
      name: "Export metadata campaign",
    });
    const pkg = await createOutputPackage({
      organizationId: ORG,
      campaignId: campaign.id,
      title: "Metadata Pack",
    });
    const metadata = {
      productId: "localcontentos",
      exportedBy: "admin-1",
    };

    const exported = await markOutputExported(pkg.id, ORG, metadata);
    expect(exported.status).toBe("exported");
    expect(exported.exportMetadata).toMatchObject(metadata);
    expect(exported.exportedAt).toBeTruthy();

    reloadContentRepositoryInstance();
    const reloaded = await getContentRepository().getOutput(pkg.id, ORG);
    expect(reloaded?.exportMetadata).toMatchObject(metadata);
  });

  it("output package is scoped by organizationId", async () => {
    const project = await createContentProject({
      organizationId: ORG,
      title: "Output scope project",
    });
    const campaign = await createContentCampaign({
      organizationId: ORG,
      contentProjectId: project.id,
      name: "Output scope campaign",
    });
    const pkg = await createOutputPackage({
      organizationId: ORG,
      campaignId: campaign.id,
      title: "Scoped output",
    });
    const cross = await getContentRepository().getOutput(pkg.id, ORG_B);
    expect(cross).toBeNull();
  });
});

describe("LocalContentOS L6 quality gates", () => {
  beforeEach(async () => {
    await resetContentRepositoryForTests();
  });

  it("denies VIEWER approve/export and OPERATOR export permissions", () => {
    expect(hasLocalContentPermission("VIEWER", "localcontentos:read")).toBe(true);
    expect(hasLocalContentPermission("VIEWER", "localcontentos:approve")).toBe(
      false,
    );
    expect(hasLocalContentPermission("VIEWER", "localcontentos:export")).toBe(
      false,
    );
    expect(() =>
      assertLocalContentPermission("VIEWER", "localcontentos:approve"),
    ).toThrow(/Missing permission: localcontentos:approve/);
    expect(hasLocalContentPermission("OPERATOR", "localcontentos:export")).toBe(
      false,
    );
    expect(() =>
      assertLocalContentPermission("OPERATOR", "localcontentos:export"),
    ).toThrow(/Missing permission: localcontentos:export/);
  });

  it("grants ADMIN approve and export permissions", () => {
    expect(hasLocalContentPermission("ADMIN", "localcontentos:approve")).toBe(
      true,
    );
    expect(hasLocalContentPermission("ADMIN", "localcontentos:export")).toBe(
      true,
    );
  });

  it("submitContentItemForReview transitions draft to in_review", async () => {
    const project = await createContentProject({
      organizationId: ORG,
      title: "Workflow project",
    });
    const campaign = await createContentCampaign({
      organizationId: ORG,
      contentProjectId: project.id,
      name: "Workflow campaign",
    });
    const item = await createContentItem({
      organizationId: ORG,
      campaignId: campaign.id,
      title: "Draft for review",
      format: "article",
      status: "draft",
    });

    const inReview = await submitContentItemForReview(item.id, ORG);
    expect(inReview.status).toBe("in_review");
  });

  it("rejects invalid content item transitions", () => {
    expect(canTransitionContentItem("idea", "approved")).toBe(false);
    expect(canTransitionContentItem("approved", "draft")).toBe(false);
    expect(() => assertContentItemTransition("idea", "approved")).toThrow(
      /Invalid content item transition: idea → approved/,
    );
    expect(() => assertContentItemTransition("approved", "draft")).toThrow(
      /Invalid content item transition: approved → draft/,
    );
  });

  it("approval rejection moves item to changes_requested", async () => {
    const project = await createContentProject({
      organizationId: ORG,
      title: "Rejection project",
    });
    const campaign = await createContentCampaign({
      organizationId: ORG,
      contentProjectId: project.id,
      name: "Rejection campaign",
    });
    const item = await createContentItem({
      organizationId: ORG,
      campaignId: campaign.id,
      title: "Reject me",
      format: "article",
      status: "in_review",
    });

    const { approval, item: rejectedItem } = await submitContentApproval({
      contentItemId: item.id,
      organizationId: ORG,
      approved: false,
      approverId: "admin-1",
      notes: "Needs source grounding",
    });
    expect(approval.approved).toBe(false);
    expect(rejectedItem.status).toBe("changes_requested");
  });

  it("persists draftAssistMetadata after governed AI assist", async () => {
    const campaign = await createContentCampaign({
      organizationId: ORG,
      contentProjectId: (
        await createContentProject({ organizationId: ORG, title: "Audit P" })
      ).id,
      name: "Audit C",
    });
    const item = await createContentItem({
      organizationId: ORG,
      campaignId: campaign.id,
      title: "Metadata item",
      format: "article",
    });

    await executeGovernedAI(item.id, { organizationId: ORG });
    const updated = await getContentRepository().getContentItem(item.id, ORG);
    expect(updated?.draftAssistMetadata).toMatchObject({
      reviewRequired: true,
      productId: "localcontentos",
    });
    expect(updated?.draftAssistMetadata?.promptHash).toMatch(/^[a-f0-9]{16}$/);
    expect(updated?.draftAssistMetadata?.generatedAt).toBeTruthy();
  });
});
