/**
 * Direct PrismaContentStudioRepository integration tests against PostgreSQL.
 * Skips when DATABASE_URL is unset or points at the Jest default placeholder without a live DB.
 */
import { describe, expect, it, afterAll } from "@jest/globals";
import { PrismaContentStudioRepository } from "@/lib/local-content/content/prisma-repository";
import { prisma } from "@/lib/prisma";

const hasDatabase = Boolean(process.env.DATABASE_URL?.trim());
const isJestPlaceholder =
  process.env.DATABASE_URL === "postgresql://localhost:5432/test_db";

const describeIfDb = hasDatabase && !isJestPlaceholder ? describe : describe.skip;

describeIfDb("PrismaContentStudioRepository (PostgreSQL)", () => {
  const runId = Date.now().toString(36);
  const ORG = `lcos-prisma-integ-${runId}`;
  const ORG_OTHER = `lcos-prisma-integ-other-${runId}`;

  const repo = new PrismaContentStudioRepository();

  let projectId: string;
  let campaignId: string;
  let sourceId: string;
  let itemId: string;
  let reviewId: string;
  let approvalId: string;
  let outputId: string;

  afterAll(async () => {
    if (!hasDatabase || isJestPlaceholder) return;
    await prisma.contentStudioOutput.deleteMany({ where: { organizationId: ORG } });
    await prisma.contentStudioApproval.deleteMany({
      where: { organizationId: ORG },
    });
    await prisma.contentStudioReview.deleteMany({ where: { organizationId: ORG } });
    await prisma.contentStudioSource.deleteMany({ where: { organizationId: ORG } });
    await prisma.contentStudioItem.deleteMany({ where: { organizationId: ORG } });
    await prisma.contentStudioCampaign.deleteMany({ where: { organizationId: ORG } });
    await prisma.contentStudioProject.deleteMany({ where: { organizationId: ORG } });
    await prisma.$disconnect();
  });

  it("creates project, campaign, source, item with AI flags", async () => {
    const project = await repo.createProject({
      organizationId: ORG,
      title: `Prisma Integ Project ${runId}`,
      language: "ar",
    });
    projectId = project.id;
    expect(project.organizationId).toBe(ORG);

    const campaign = await repo.createCampaign({
      organizationId: ORG,
      contentProjectId: project.id,
      name: `Prisma Integ Campaign ${runId}`,
      channels: ["linkedin"],
    });
    campaignId = campaign.id;
    expect(campaign.contentProjectId).toBe(project.id);

    const source = await repo.createSource({
      organizationId: ORG,
      campaignId: campaign.id,
      title: "Integration Source",
      type: "url",
      url: "https://example.com/integ",
    });
    sourceId = source.id;
    expect(source.campaignId).toBe(campaign.id);

    const item = await repo.createContentItem({
      organizationId: ORG,
      campaignId: campaign.id,
      title: "Integration Item",
      format: "article",
      sourceRefIds: [source.id],
      status: "draft",
    });
    itemId = item.id;

    const updated = await repo.updateContentItem(item.id, ORG, {
      aiGenerated: true,
      reviewRequired: true,
    });
    expect(updated.aiGenerated).toBe(true);
    expect(updated.reviewRequired).toBe(true);
  });

  it("creates review and approval records", async () => {
    await repo.updateContentItemStatus(itemId, ORG, "in_review");

    const review = await repo.createReview({
      contentItemId: itemId,
      organizationId: ORG,
      status: "approved",
      dimensions: { compliance: true, sourceGrounding: true },
      reviewerId: "reviewer-integ",
    });
    reviewId = review.id;
    expect(review.dimensions.compliance).toBe(true);

    const { approval, item } = await repo.createApproval({
      contentItemId: itemId,
      organizationId: ORG,
      approved: true,
      approverId: "approver-integ",
    });
    approvalId = approval.id;
    expect(approval.approved).toBe(true);
    expect(item.status).toBe("approved");
  });

  it("creates output package", async () => {
    const output = await repo.createOutput({
      organizationId: ORG,
      campaignId,
      title: "Integration Output Pack",
    });
    outputId = output.id;
    expect(output.campaignId).toBe(campaignId);
  });

  it("scopes list queries by organizationId", async () => {
    const projects = await repo.listProjects(ORG);
    expect(projects.some((p) => p.id === projectId)).toBe(true);

    const campaigns = await repo.listCampaigns(ORG);
    expect(campaigns.some((c) => c.id === campaignId)).toBe(true);

    const sources = await repo.listSourcesForCampaign(campaignId, ORG);
    expect(sources.some((s) => s.id === sourceId)).toBe(true);

    const items = await repo.listContentItemsByCampaign(campaignId, ORG);
    expect(items.some((i) => i.id === itemId)).toBe(true);

    const reviews = await repo.listReviewsForItem(itemId, ORG);
    expect(reviews.some((r) => r.id === reviewId)).toBe(true);

    const approvals = await repo.listApprovalsForItem(itemId, ORG);
    expect(approvals.some((a) => a.id === approvalId)).toBe(true);

    const outputs = await repo.listOutputs(ORG);
    expect(outputs.some((o) => o.id === outputId)).toBe(true);
  });

  it("returns null for cross-org reads", async () => {
    expect(await repo.getProject(projectId, ORG_OTHER)).toBeNull();
    expect(await repo.getCampaign(campaignId, ORG_OTHER)).toBeNull();
    expect(await repo.getSource(sourceId, ORG_OTHER)).toBeNull();
    expect(await repo.getContentItem(itemId, ORG_OTHER)).toBeNull();
    expect(await repo.getOutput(outputId, ORG_OTHER)).toBeNull();
  });

  it("persists after repository re-instantiation", async () => {
    const fresh = new PrismaContentStudioRepository();
    const reloaded = await fresh.getContentItem(itemId, ORG);
    expect(reloaded?.aiGenerated).toBe(true);
    expect(reloaded?.reviewRequired).toBe(true);
    expect(reloaded?.status).toBe("approved");
  });
});
