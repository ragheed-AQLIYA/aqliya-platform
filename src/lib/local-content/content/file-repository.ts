// LocalContentOS Content Studio — file-backed repository (default adapter)

import "server-only";

import type { ContentStudioRepository } from "./repository-interface";
import type {
  Campaign,
  CampaignStatus,
  ContentApprovalRecord,
  ContentItem,
  ContentItemStatus,
  ContentProject,
  ContentReviewRecord,
  ContentSource,
  OutputPackage,
  SourceStatus,
} from "./types";
import type {
  CreateCampaignInput,
  CreateContentItemInput,
  CreateContentProjectInput,
  CreateOutputPackageInput,
  CreateSourceInput,
  SubmitApprovalInput,
  SubmitReviewInput,
} from "./contracts";
import { readStore, writeStore, newId, nowIso } from "./store";
import {
  assertCampaignTransition,
  assertContentItemTransition,
  canTransitionOutput,
  canTransitionSource,
} from "./workflow";

function scoped<T extends { organizationId: string }>(
  entity: T | undefined,
  organizationId: string,
): T | null {
  if (!entity || entity.organizationId !== organizationId) return null;
  return entity;
}

export class FileContentStudioRepository implements ContentStudioRepository {
  async createProject(
    input: CreateContentProjectInput,
  ): Promise<ContentProject> {
    const store = await readStore();
    const project: ContentProject = {
      id: newId("cproj"),
      organizationId: input.organizationId,
      platformOrganizationId: input.platformOrganizationId,
      title: input.title,
      objective: input.objective,
      audience: input.audience,
      language: input.language ?? "ar",
      status: input.status ?? "draft",
      createdById: input.createdById,
      createdByName: input.createdByName,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    store.projects.push(project);
    await writeStore(store);
    return project;
  }

  async listProjects(organizationId: string): Promise<ContentProject[]> {
    const store = await readStore();
    return store.projects.filter((p) => p.organizationId === organizationId);
  }

  async getProject(
    id: string,
    organizationId: string,
  ): Promise<ContentProject | null> {
    const store = await readStore();
    return scoped(
      store.projects.find((p) => p.id === id),
      organizationId,
    );
  }

  async createCampaign(input: CreateCampaignInput): Promise<Campaign> {
    const store = await readStore();
    const project = store.projects.find(
      (p) =>
        p.id === input.contentProjectId &&
        p.organizationId === input.organizationId,
    );
    if (!project) throw new Error("Content project not found");

    const campaign: Campaign = {
      id: newId("camp"),
      contentProjectId: input.contentProjectId,
      organizationId: input.organizationId,
      name: input.name,
      objective: input.objective,
      audience: input.audience,
      channels: input.channels ?? [],
      startDate: input.startDate,
      endDate: input.endDate,
      status: input.status ?? "draft",
      createdById: input.createdById,
      createdByName: input.createdByName,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    store.campaigns.push(campaign);
    await writeStore(store);
    return campaign;
  }

  async listCampaigns(organizationId: string): Promise<Campaign[]> {
    const store = await readStore();
    return store.campaigns.filter((c) => c.organizationId === organizationId);
  }

  async getCampaign(
    id: string,
    organizationId: string,
  ): Promise<Campaign | null> {
    const store = await readStore();
    return scoped(
      store.campaigns.find((c) => c.id === id),
      organizationId,
    );
  }

  async updateCampaignState(
    id: string,
    organizationId: string,
    status: CampaignStatus,
  ): Promise<Campaign> {
    const store = await readStore();
    const idx = store.campaigns.findIndex((c) => c.id === id);
    if (idx < 0) throw new Error("Campaign not found");
    if (store.campaigns[idx].organizationId !== organizationId) {
      throw new Error("Campaign not found");
    }
    assertCampaignTransition(store.campaigns[idx].status, status);
    store.campaigns[idx] = {
      ...store.campaigns[idx],
      status,
      updatedAt: nowIso(),
    };
    await writeStore(store);
    return store.campaigns[idx];
  }

  async createSource(input: CreateSourceInput): Promise<ContentSource> {
    const store = await readStore();
    if (input.campaignId) {
      const campaign = scoped(
        store.campaigns.find((c) => c.id === input.campaignId),
        input.organizationId,
      );
      if (!campaign) throw new Error("Campaign not found");
    }
    const source: ContentSource = {
      id: newId("src"),
      organizationId: input.organizationId,
      campaignId: input.campaignId,
      contentItemId: input.contentItemId,
      title: input.title,
      type: input.type,
      url: input.url,
      note: input.note,
      fileRef: input.fileRef,
      credibility: input.credibility ?? "unverified",
      status: input.status ?? "proposed",
      evidenceMetadata: input.evidenceMetadata,
      createdById: input.createdById,
      createdByName: input.createdByName,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    store.sources.push(source);
    await writeStore(store);
    return source;
  }

  async listSources(organizationId: string): Promise<ContentSource[]> {
    const store = await readStore();
    return store.sources.filter((s) => s.organizationId === organizationId);
  }

  async listSourcesForCampaign(
    campaignId: string,
    organizationId: string,
  ): Promise<ContentSource[]> {
    const store = await readStore();
    return store.sources.filter(
      (s) => s.campaignId === campaignId && s.organizationId === organizationId,
    );
  }

  async getSource(
    id: string,
    organizationId: string,
  ): Promise<ContentSource | null> {
    const store = await readStore();
    return scoped(
      store.sources.find((s) => s.id === id),
      organizationId,
    );
  }

  async verifySource(
    sourceId: string,
    organizationId: string,
    actor?: { id?: string; name?: string },
  ): Promise<ContentSource> {
    const store = await readStore();
    const idx = store.sources.findIndex((s) => s.id === sourceId);
    if (idx < 0 || store.sources[idx].organizationId !== organizationId) {
      throw new Error("Source not found");
    }
    const source = store.sources[idx];
    if (!canTransitionSource(source.status, "verified")) {
      throw new Error(`Cannot verify source in status: ${source.status}`);
    }
    const updated: ContentSource = {
      ...source,
      status: "verified",
      updatedAt: nowIso(),
      evidenceMetadata: {
        ...(source.evidenceMetadata ?? {}),
        verifiedAt: nowIso(),
        verifiedById: actor?.id,
        verifiedBy: actor?.name ?? actor?.id,
      },
    };
    store.sources[idx] = updated;
    await writeStore(store);
    return updated;
  }

  async rejectSource(
    sourceId: string,
    organizationId: string,
    reason?: string,
  ): Promise<ContentSource> {
    const store = await readStore();
    const idx = store.sources.findIndex((s) => s.id === sourceId);
    if (idx < 0 || store.sources[idx].organizationId !== organizationId) {
      throw new Error("Source not found");
    }
    const source = store.sources[idx];
    if (!canTransitionSource(source.status, "rejected")) {
      throw new Error(`Cannot reject source in status: ${source.status}`);
    }
    const updated: ContentSource = {
      ...source,
      status: "rejected",
      updatedAt: nowIso(),
      evidenceMetadata: {
        ...(source.evidenceMetadata ?? {}),
        rejectionReason: reason,
        rejectedAt: nowIso(),
      },
    };
    store.sources[idx] = updated;
    await writeStore(store);
    return updated;
  }

  async updateSourceStatus(
    sourceId: string,
    organizationId: string,
    status: SourceStatus,
  ): Promise<ContentSource> {
    const store = await readStore();
    const idx = store.sources.findIndex((s) => s.id === sourceId);
    if (idx < 0 || store.sources[idx].organizationId !== organizationId) {
      throw new Error("Source not found");
    }
    const source = store.sources[idx];
    if (!canTransitionSource(source.status, status)) {
      throw new Error(`Invalid source transition: ${source.status} → ${status}`);
    }
    store.sources[idx] = { ...source, status, updatedAt: nowIso() };
    await writeStore(store);
    return store.sources[idx];
  }

  async createContentItem(
    input: CreateContentItemInput,
  ): Promise<ContentItem> {
    const store = await readStore();
    const campaign = scoped(
      store.campaigns.find((c) => c.id === input.campaignId),
      input.organizationId,
    );
    if (!campaign) throw new Error("Campaign not found");

    const item: ContentItem = {
      id: newId("citem"),
      campaignId: input.campaignId,
      organizationId: input.organizationId,
      title: input.title,
      format: input.format,
      body: input.body,
      sourceRefIds: input.sourceRefIds ?? [],
      status: input.status ?? "idea",
      aiGenerated: false,
      reviewRequired: false,
      createdById: input.createdById,
      createdByName: input.createdByName,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    store.contentItems.push(item);
    await writeStore(store);
    return item;
  }

  async listContentItems(organizationId: string): Promise<ContentItem[]> {
    const store = await readStore();
    return store.contentItems.filter(
      (c) => c.organizationId === organizationId,
    );
  }

  async listContentItemsByCampaign(
    campaignId: string,
    organizationId: string,
  ): Promise<ContentItem[]> {
    const store = await readStore();
    return store.contentItems.filter(
      (c) => c.campaignId === campaignId && c.organizationId === organizationId,
    );
  }

  async getContentItem(
    id: string,
    organizationId: string,
  ): Promise<ContentItem | null> {
    const store = await readStore();
    return scoped(
      store.contentItems.find((c) => c.id === id),
      organizationId,
    );
  }

  async updateContentItemStatus(
    id: string,
    organizationId: string,
    status: ContentItemStatus,
  ): Promise<ContentItem> {
    const store = await readStore();
    const idx = store.contentItems.findIndex((c) => c.id === id);
    if (idx < 0 || store.contentItems[idx].organizationId !== organizationId) {
      throw new Error("Content item not found");
    }
    assertContentItemTransition(store.contentItems[idx].status, status);
    store.contentItems[idx] = {
      ...store.contentItems[idx],
      status,
      updatedAt: nowIso(),
    };
    await writeStore(store);
    return store.contentItems[idx];
  }

  async updateContentItem(
    id: string,
    organizationId: string,
    patch: Partial<
      Pick<
        ContentItem,
        "body" | "status" | "draftAssistMetadata" | "sourceRefIds" | "aiGenerated" | "reviewRequired"
      >
    >,
  ): Promise<ContentItem> {
    const store = await readStore();
    const idx = store.contentItems.findIndex((c) => c.id === id);
    if (idx < 0 || store.contentItems[idx].organizationId !== organizationId) {
      throw new Error("Content item not found");
    }
    if (patch.status) {
      assertContentItemTransition(store.contentItems[idx].status, patch.status);
    }
    store.contentItems[idx] = {
      ...store.contentItems[idx],
      ...patch,
      updatedAt: nowIso(),
    };
    await writeStore(store);
    return store.contentItems[idx];
  }

  async createReview(input: SubmitReviewInput): Promise<ContentReviewRecord> {
    const store = await readStore();
    const itemIdx = store.contentItems.findIndex(
      (c) => c.id === input.contentItemId,
    );
    if (itemIdx < 0 || store.contentItems[itemIdx].organizationId !== input.organizationId) {
      throw new Error("Content item not found");
    }

    const item = store.contentItems[itemIdx];
    if (
      input.status === "approved" ||
      input.status === "changes_requested" ||
      input.status === "rejected"
    ) {
      if (item.status === "draft") {
        assertContentItemTransition("draft", "in_review");
        store.contentItems[itemIdx] = {
          ...item,
          status: "in_review",
          updatedAt: nowIso(),
        };
      }
    }

    const record: ContentReviewRecord = {
      id: newId("crev"),
      contentItemId: input.contentItemId,
      organizationId: input.organizationId,
      status: input.status,
      dimensions: input.dimensions ?? {},
      notes: input.notes,
      reviewerId: input.reviewerId,
      reviewerName: input.reviewerName,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };

    if (input.status === "changes_requested") {
      const current = store.contentItems[itemIdx];
      assertContentItemTransition(current.status, "changes_requested");
      store.contentItems[itemIdx] = {
        ...current,
        status: "changes_requested",
        updatedAt: nowIso(),
      };
    }

    store.reviews.push(record);
    await writeStore(store);
    return record;
  }

  async listReviews(organizationId: string): Promise<ContentReviewRecord[]> {
    const store = await readStore();
    return store.reviews.filter((r) => r.organizationId === organizationId);
  }

  async listReviewsForItem(
    contentItemId: string,
    organizationId: string,
  ): Promise<ContentReviewRecord[]> {
    const store = await readStore();
    return store.reviews.filter(
      (r) =>
        r.contentItemId === contentItemId &&
        r.organizationId === organizationId,
    );
  }

  async createApproval(
    input: SubmitApprovalInput,
  ): Promise<{ approval: ContentApprovalRecord; item: ContentItem }> {
    const store = await readStore();
    const itemIdx = store.contentItems.findIndex(
      (c) => c.id === input.contentItemId,
    );
    if (itemIdx < 0 || store.contentItems[itemIdx].organizationId !== input.organizationId) {
      throw new Error("Content item not found");
    }

    if (input.approved) {
      if (store.contentItems[itemIdx].status !== "in_review") {
        throw new Error("Content must be in_review before approval");
      }
      assertContentItemTransition("in_review", "approved");
      store.contentItems[itemIdx] = {
        ...store.contentItems[itemIdx],
        status: "approved",
        updatedAt: nowIso(),
      };
    } else if (store.contentItems[itemIdx].status === "in_review") {
      assertContentItemTransition("in_review", "changes_requested");
      store.contentItems[itemIdx] = {
        ...store.contentItems[itemIdx],
        status: "changes_requested",
        updatedAt: nowIso(),
      };
    }

    const approval: ContentApprovalRecord = {
      id: newId("cappr"),
      contentItemId: input.contentItemId,
      organizationId: input.organizationId,
      approved: input.approved,
      notes: input.notes,
      approverId: input.approverId,
      approverName: input.approverName,
      createdAt: nowIso(),
    };

    store.approvals.push(approval);
    await writeStore(store);
    return { approval, item: store.contentItems[itemIdx] };
  }

  async listApprovals(
    organizationId: string,
  ): Promise<ContentApprovalRecord[]> {
    const store = await readStore();
    return store.approvals.filter((a) => a.organizationId === organizationId);
  }

  async listApprovalsForItem(
    contentItemId: string,
    organizationId: string,
  ): Promise<ContentApprovalRecord[]> {
    const store = await readStore();
    return store.approvals.filter(
      (a) =>
        a.contentItemId === contentItemId &&
        a.organizationId === organizationId,
    );
  }

  async createOutput(input: CreateOutputPackageInput): Promise<OutputPackage> {
    const store = await readStore();
    const campaign = scoped(
      store.campaigns.find((c) => c.id === input.campaignId),
      input.organizationId,
    );
    if (!campaign) throw new Error("Campaign not found");

    const pkg: OutputPackage = {
      id: newId("out"),
      campaignId: input.campaignId,
      organizationId: input.organizationId,
      title: input.title,
      status: input.status ?? "draft",
      includes: {
        campaignSummary: input.includes?.campaignSummary ?? true,
        contentCalendar: input.includes?.contentCalendar ?? true,
        approvedContent: input.includes?.approvedContent ?? true,
        complianceMemo: input.includes?.complianceMemo ?? true,
      },
      createdById: input.createdById,
      createdByName: input.createdByName,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    store.outputs.push(pkg);
    await writeStore(store);
    return pkg;
  }

  async listOutputs(organizationId: string): Promise<OutputPackage[]> {
    const store = await readStore();
    return store.outputs.filter((o) => o.organizationId === organizationId);
  }

  async getOutput(
    id: string,
    organizationId: string,
  ): Promise<OutputPackage | null> {
    const store = await readStore();
    return scoped(
      store.outputs.find((o) => o.id === id),
      organizationId,
    );
  }

  async updateOutput(
    id: string,
    organizationId: string,
    patch: Partial<
      Pick<OutputPackage, "status" | "exportMetadata" | "exportedAt">
    >,
  ): Promise<OutputPackage> {
    const store = await readStore();
    const idx = store.outputs.findIndex((o) => o.id === id);
    if (idx < 0 || store.outputs[idx].organizationId !== organizationId) {
      throw new Error("Output package not found");
    }
    if (patch.status && !canTransitionOutput(store.outputs[idx].status, patch.status)) {
      throw new Error(`Cannot transition output to ${patch.status}`);
    }
    store.outputs[idx] = {
      ...store.outputs[idx],
      ...patch,
      updatedAt: nowIso(),
    };
    await writeStore(store);
    return store.outputs[idx];
  }

  async listReviewQueue(organizationId: string): Promise<ContentItem[]> {
    const store = await readStore();
    return store.contentItems.filter(
      (c) =>
        c.organizationId === organizationId &&
        (c.status === "in_review" || c.status === "draft"),
    );
  }

  async listApprovalQueue(organizationId: string): Promise<ContentItem[]> {
    const store = await readStore();
    return store.contentItems.filter(
      (c) => c.organizationId === organizationId && c.status === "in_review",
    );
  }
}
