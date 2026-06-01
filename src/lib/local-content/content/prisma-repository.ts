// LocalContentOS Content Studio — Prisma repository (PostgreSQL persistence)

import "server-only";

import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
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
import { newId } from "./store";
import {
  assertCampaignTransition,
  assertContentItemTransition,
  canTransitionOutput,
  canTransitionSource,
} from "./workflow";

function toIso(d: Date): string {
  return d.toISOString();
}

function asStringArray(value: Prisma.JsonValue): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is string => typeof v === "string");
}

function asRecord(value: Prisma.JsonValue | null | undefined): Record<string, unknown> | undefined {
  if (value === null || value === undefined) return undefined;
  if (typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return undefined;
}

function asDimensions(value: Prisma.JsonValue): ContentReviewRecord["dimensions"] {
  const rec = asRecord(value);
  if (!rec) return {};
  const governance = rec.governance;
  return {
    sourceGrounding: rec.sourceGrounding as boolean | undefined,
    brand: rec.brand as boolean | undefined,
    compliance: rec.compliance as boolean | undefined,
    factualClaims: rec.factualClaims as boolean | undefined,
    languageQuality: rec.languageQuality as boolean | undefined,
    governance:
      governance && typeof governance === "object" && !Array.isArray(governance)
        ? (governance as ContentReviewRecord["dimensions"]["governance"])
        : undefined,
  };
}

function asIncludes(value: Prisma.JsonValue): OutputPackage["includes"] {
  const rec = asRecord(value);
  return {
    campaignSummary: (rec?.campaignSummary as boolean | undefined) ?? true,
    contentCalendar: (rec?.contentCalendar as boolean | undefined) ?? true,
    approvedContent: (rec?.approvedContent as boolean | undefined) ?? true,
    complianceMemo: (rec?.complianceMemo as boolean | undefined) ?? true,
  };
}

function asDraftAssistMetadata(
  value: Prisma.JsonValue | null | undefined,
): ContentItem["draftAssistMetadata"] {
  const rec = asRecord(value);
  if (!rec) return undefined;
  return {
    promptHash: rec.promptHash as string | undefined,
    generatedAt: rec.generatedAt as string | undefined,
    reviewRequired: Boolean(rec.reviewRequired),
    productId: "localcontentos",
  };
}

function mapProject(row: {
  id: string;
  organizationId: string;
  platformOrganizationId: string | null;
  title: string;
  objective: string | null;
  audience: string | null;
  language: string;
  status: string;
  createdById: string | null;
  createdByName: string | null;
  createdAt: Date;
  updatedAt: Date;
}): ContentProject {
  return {
    id: row.id,
    organizationId: row.organizationId,
    platformOrganizationId: row.platformOrganizationId ?? undefined,
    title: row.title,
    objective: row.objective ?? undefined,
    audience: row.audience ?? undefined,
    language: row.language,
    status: row.status as ContentProject["status"],
    createdById: row.createdById ?? undefined,
    createdByName: row.createdByName ?? undefined,
    createdAt: toIso(row.createdAt),
    updatedAt: toIso(row.updatedAt),
  };
}

function mapCampaign(row: {
  id: string;
  contentProjectId: string;
  organizationId: string;
  name: string;
  objective: string | null;
  audience: string | null;
  channels: Prisma.JsonValue;
  startDate: string | null;
  endDate: string | null;
  status: string;
  createdById: string | null;
  createdByName: string | null;
  createdAt: Date;
  updatedAt: Date;
}): Campaign {
  return {
    id: row.id,
    contentProjectId: row.contentProjectId,
    organizationId: row.organizationId,
    name: row.name,
    objective: row.objective ?? undefined,
    audience: row.audience ?? undefined,
    channels: asStringArray(row.channels),
    startDate: row.startDate ?? undefined,
    endDate: row.endDate ?? undefined,
    status: row.status as CampaignStatus,
    createdById: row.createdById ?? undefined,
    createdByName: row.createdByName ?? undefined,
    createdAt: toIso(row.createdAt),
    updatedAt: toIso(row.updatedAt),
  };
}

function mapSource(row: {
  id: string;
  organizationId: string;
  campaignId: string | null;
  contentItemId: string | null;
  title: string;
  type: string;
  url: string | null;
  note: string | null;
  fileRef: string | null;
  credibility: string;
  status: string;
  evidenceMetadata: Prisma.JsonValue | null;
  createdById: string | null;
  createdByName: string | null;
  createdAt: Date;
  updatedAt: Date;
}): ContentSource {
  return {
    id: row.id,
    organizationId: row.organizationId,
    campaignId: row.campaignId ?? undefined,
    contentItemId: row.contentItemId ?? undefined,
    title: row.title,
    type: row.type as ContentSource["type"],
    url: row.url ?? undefined,
    note: row.note ?? undefined,
    fileRef: row.fileRef ?? undefined,
    credibility: row.credibility as ContentSource["credibility"],
    status: row.status as SourceStatus,
    evidenceMetadata: asRecord(row.evidenceMetadata),
    createdById: row.createdById ?? undefined,
    createdByName: row.createdByName ?? undefined,
    createdAt: toIso(row.createdAt),
    updatedAt: toIso(row.updatedAt),
  };
}

function mapContentItem(row: {
  id: string;
  campaignId: string;
  organizationId: string;
  title: string;
  format: string;
  body: string | null;
  sourceRefIds: Prisma.JsonValue;
  status: string;
  aiGenerated: boolean;
  reviewRequired: boolean;
  draftAssistMetadata: Prisma.JsonValue | null;
  createdById: string | null;
  createdByName: string | null;
  createdAt: Date;
  updatedAt: Date;
}): ContentItem {
  return {
    id: row.id,
    campaignId: row.campaignId,
    organizationId: row.organizationId,
    title: row.title,
    format: row.format as ContentItem["format"],
    body: row.body ?? undefined,
    sourceRefIds: asStringArray(row.sourceRefIds),
    status: row.status as ContentItemStatus,
    aiGenerated: row.aiGenerated,
    reviewRequired: row.reviewRequired,
    draftAssistMetadata: asDraftAssistMetadata(row.draftAssistMetadata),
    createdById: row.createdById ?? undefined,
    createdByName: row.createdByName ?? undefined,
    createdAt: toIso(row.createdAt),
    updatedAt: toIso(row.updatedAt),
  };
}

function mapReview(row: {
  id: string;
  contentItemId: string;
  organizationId: string;
  status: string;
  dimensions: Prisma.JsonValue;
  notes: string | null;
  reviewerId: string | null;
  reviewerName: string | null;
  createdAt: Date;
  updatedAt: Date;
}): ContentReviewRecord {
  return {
    id: row.id,
    contentItemId: row.contentItemId,
    organizationId: row.organizationId,
    status: row.status as ContentReviewRecord["status"],
    dimensions: asDimensions(row.dimensions),
    notes: row.notes ?? undefined,
    reviewerId: row.reviewerId ?? undefined,
    reviewerName: row.reviewerName ?? undefined,
    createdAt: toIso(row.createdAt),
    updatedAt: toIso(row.updatedAt),
  };
}

function mapApproval(row: {
  id: string;
  contentItemId: string;
  organizationId: string;
  approved: boolean;
  notes: string | null;
  approverId: string | null;
  approverName: string | null;
  createdAt: Date;
}): ContentApprovalRecord {
  return {
    id: row.id,
    contentItemId: row.contentItemId,
    organizationId: row.organizationId,
    approved: row.approved,
    notes: row.notes ?? undefined,
    approverId: row.approverId ?? undefined,
    approverName: row.approverName ?? undefined,
    createdAt: toIso(row.createdAt),
  };
}

function mapOutput(row: {
  id: string;
  campaignId: string;
  organizationId: string;
  title: string;
  status: string;
  includes: Prisma.JsonValue;
  exportMetadata: Prisma.JsonValue | null;
  exportedAt: Date | null;
  createdById: string | null;
  createdByName: string | null;
  createdAt: Date;
  updatedAt: Date;
}): OutputPackage {
  return {
    id: row.id,
    campaignId: row.campaignId,
    organizationId: row.organizationId,
    title: row.title,
    status: row.status as OutputPackage["status"],
    includes: asIncludes(row.includes),
    exportMetadata: asRecord(row.exportMetadata),
    exportedAt: row.exportedAt ? toIso(row.exportedAt) : undefined,
    createdById: row.createdById ?? undefined,
    createdByName: row.createdByName ?? undefined,
    createdAt: toIso(row.createdAt),
    updatedAt: toIso(row.updatedAt),
  };
}

export class PrismaContentStudioRepository implements ContentStudioRepository {
  async createProject(
    input: CreateContentProjectInput,
  ): Promise<ContentProject> {
    const row = await prisma.contentStudioProject.create({
      data: {
        id: newId("cproj"),
        organizationId: input.organizationId,
        platformOrganizationId: input.platformOrganizationId ?? null,
        title: input.title,
        objective: input.objective ?? null,
        audience: input.audience ?? null,
        language: input.language ?? "ar",
        status: input.status ?? "draft",
        createdById: input.createdById ?? null,
        createdByName: input.createdByName ?? null,
      },
    });
    return mapProject(row);
  }

  async listProjects(organizationId: string): Promise<ContentProject[]> {
    const rows = await prisma.contentStudioProject.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
    });
    return rows.map(mapProject);
  }

  async getProject(
    id: string,
    organizationId: string,
  ): Promise<ContentProject | null> {
    const row = await prisma.contentStudioProject.findFirst({
      where: { id, organizationId },
    });
    return row ? mapProject(row) : null;
  }

  async createCampaign(input: CreateCampaignInput): Promise<Campaign> {
    const project = await prisma.contentStudioProject.findFirst({
      where: {
        id: input.contentProjectId,
        organizationId: input.organizationId,
      },
    });
    if (!project) throw new Error("Content project not found");

    const row = await prisma.contentStudioCampaign.create({
      data: {
        id: newId("camp"),
        contentProjectId: input.contentProjectId,
        organizationId: input.organizationId,
        name: input.name,
        objective: input.objective ?? null,
        audience: input.audience ?? null,
        channels: (input.channels ?? []) as Prisma.InputJsonValue,
        startDate: input.startDate ?? null,
        endDate: input.endDate ?? null,
        status: input.status ?? "draft",
        createdById: input.createdById ?? null,
        createdByName: input.createdByName ?? null,
      },
    });
    return mapCampaign(row);
  }

  async listCampaigns(organizationId: string): Promise<Campaign[]> {
    const rows = await prisma.contentStudioCampaign.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
    });
    return rows.map(mapCampaign);
  }

  async getCampaign(
    id: string,
    organizationId: string,
  ): Promise<Campaign | null> {
    const row = await prisma.contentStudioCampaign.findFirst({
      where: { id, organizationId },
    });
    return row ? mapCampaign(row) : null;
  }

  async updateCampaignState(
    id: string,
    organizationId: string,
    status: CampaignStatus,
  ): Promise<Campaign> {
    const existing = await prisma.contentStudioCampaign.findFirst({
      where: { id, organizationId },
    });
    if (!existing) throw new Error("Campaign not found");
    assertCampaignTransition(existing.status as CampaignStatus, status);
    const row = await prisma.contentStudioCampaign.update({
      where: { id },
      data: { status },
    });
    return mapCampaign(row);
  }

  async createSource(input: CreateSourceInput): Promise<ContentSource> {
    if (input.campaignId) {
      const campaign = await prisma.contentStudioCampaign.findFirst({
        where: { id: input.campaignId, organizationId: input.organizationId },
      });
      if (!campaign) throw new Error("Campaign not found");
    }
    if (input.contentItemId) {
      const item = await prisma.contentStudioItem.findFirst({
        where: {
          id: input.contentItemId,
          organizationId: input.organizationId,
        },
      });
      if (!item) throw new Error("Content item not found");
    }

    const row = await prisma.contentStudioSource.create({
      data: {
        id: newId("src"),
        organizationId: input.organizationId,
        campaignId: input.campaignId ?? null,
        contentItemId: input.contentItemId ?? null,
        title: input.title,
        type: input.type,
        url: input.url ?? null,
        note: input.note ?? null,
        fileRef: input.fileRef ?? null,
        credibility: input.credibility ?? "unverified",
        status: input.status ?? "proposed",
        evidenceMetadata: (input.evidenceMetadata ?? undefined) as
          | Prisma.InputJsonValue
          | undefined,
        createdById: input.createdById ?? null,
        createdByName: input.createdByName ?? null,
      },
    });
    return mapSource(row);
  }

  async listSources(organizationId: string): Promise<ContentSource[]> {
    const rows = await prisma.contentStudioSource.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
    });
    return rows.map(mapSource);
  }

  async listSourcesForCampaign(
    campaignId: string,
    organizationId: string,
  ): Promise<ContentSource[]> {
    const rows = await prisma.contentStudioSource.findMany({
      where: { campaignId, organizationId },
      orderBy: { createdAt: "desc" },
    });
    return rows.map(mapSource);
  }

  async getSource(
    id: string,
    organizationId: string,
  ): Promise<ContentSource | null> {
    const row = await prisma.contentStudioSource.findFirst({
      where: { id, organizationId },
    });
    return row ? mapSource(row) : null;
  }

  async verifySource(
    sourceId: string,
    organizationId: string,
    actor?: { id?: string; name?: string },
  ): Promise<ContentSource> {
    const existing = await prisma.contentStudioSource.findFirst({
      where: { id: sourceId, organizationId },
    });
    if (!existing) throw new Error("Source not found");
    if (!canTransitionSource(existing.status as SourceStatus, "verified")) {
      throw new Error(`Cannot verify source in status: ${existing.status}`);
    }
    const evidenceMetadata = {
      ...(asRecord(existing.evidenceMetadata) ?? {}),
      verifiedAt: new Date().toISOString(),
      verifiedById: actor?.id,
      verifiedBy: actor?.name ?? actor?.id,
    };
    const row = await prisma.contentStudioSource.update({
      where: { id: sourceId },
      data: {
        status: "verified",
        evidenceMetadata: evidenceMetadata as Prisma.InputJsonValue,
      },
    });
    return mapSource(row);
  }

  async rejectSource(
    sourceId: string,
    organizationId: string,
    reason?: string,
  ): Promise<ContentSource> {
    const existing = await prisma.contentStudioSource.findFirst({
      where: { id: sourceId, organizationId },
    });
    if (!existing) throw new Error("Source not found");
    if (!canTransitionSource(existing.status as SourceStatus, "rejected")) {
      throw new Error(`Cannot reject source in status: ${existing.status}`);
    }
    const evidenceMetadata = {
      ...(asRecord(existing.evidenceMetadata) ?? {}),
      rejectionReason: reason,
      rejectedAt: new Date().toISOString(),
    };
    const row = await prisma.contentStudioSource.update({
      where: { id: sourceId },
      data: {
        status: "rejected",
        evidenceMetadata: evidenceMetadata as Prisma.InputJsonValue,
      },
    });
    return mapSource(row);
  }

  async updateSourceStatus(
    sourceId: string,
    organizationId: string,
    status: SourceStatus,
  ): Promise<ContentSource> {
    const existing = await prisma.contentStudioSource.findFirst({
      where: { id: sourceId, organizationId },
    });
    if (!existing) throw new Error("Source not found");
    if (!canTransitionSource(existing.status as SourceStatus, status)) {
      throw new Error(`Invalid source transition: ${existing.status} → ${status}`);
    }
    const row = await prisma.contentStudioSource.update({
      where: { id: sourceId },
      data: { status },
    });
    return mapSource(row);
  }

  async createContentItem(
    input: CreateContentItemInput,
  ): Promise<ContentItem> {
    const campaign = await prisma.contentStudioCampaign.findFirst({
      where: { id: input.campaignId, organizationId: input.organizationId },
    });
    if (!campaign) throw new Error("Campaign not found");

    const row = await prisma.contentStudioItem.create({
      data: {
        id: newId("citem"),
        campaignId: input.campaignId,
        organizationId: input.organizationId,
        title: input.title,
        format: input.format,
        body: input.body ?? null,
        sourceRefIds: (input.sourceRefIds ?? []) as Prisma.InputJsonValue,
        status: input.status ?? "idea",
        aiGenerated: false,
        reviewRequired: false,
        createdById: input.createdById ?? null,
        createdByName: input.createdByName ?? null,
      },
    });
    return mapContentItem(row);
  }

  async listContentItems(organizationId: string): Promise<ContentItem[]> {
    const rows = await prisma.contentStudioItem.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
    });
    return rows.map(mapContentItem);
  }

  async listContentItemsByCampaign(
    campaignId: string,
    organizationId: string,
  ): Promise<ContentItem[]> {
    const rows = await prisma.contentStudioItem.findMany({
      where: { campaignId, organizationId },
      orderBy: { createdAt: "desc" },
    });
    return rows.map(mapContentItem);
  }

  async getContentItem(
    id: string,
    organizationId: string,
  ): Promise<ContentItem | null> {
    const row = await prisma.contentStudioItem.findFirst({
      where: { id, organizationId },
    });
    return row ? mapContentItem(row) : null;
  }

  async updateContentItemStatus(
    id: string,
    organizationId: string,
    status: ContentItemStatus,
  ): Promise<ContentItem> {
    const existing = await prisma.contentStudioItem.findFirst({
      where: { id, organizationId },
    });
    if (!existing) throw new Error("Content item not found");
    assertContentItemTransition(existing.status as ContentItemStatus, status);
    const row = await prisma.contentStudioItem.update({
      where: { id },
      data: { status },
    });
    return mapContentItem(row);
  }

  async updateContentItem(
    id: string,
    organizationId: string,
    patch: Partial<
      Pick<
        ContentItem,
        | "body"
        | "status"
        | "draftAssistMetadata"
        | "sourceRefIds"
        | "aiGenerated"
        | "reviewRequired"
      >
    >,
  ): Promise<ContentItem> {
    const existing = await prisma.contentStudioItem.findFirst({
      where: { id, organizationId },
    });
    if (!existing) throw new Error("Content item not found");
    if (patch.status) {
      assertContentItemTransition(
        existing.status as ContentItemStatus,
        patch.status,
      );
    }
    const row = await prisma.contentStudioItem.update({
      where: { id },
      data: {
        body: patch.body !== undefined ? patch.body ?? null : undefined,
        status: patch.status,
        draftAssistMetadata:
          patch.draftAssistMetadata !== undefined
            ? (patch.draftAssistMetadata as Prisma.InputJsonValue)
            : undefined,
        sourceRefIds:
          patch.sourceRefIds !== undefined
            ? (patch.sourceRefIds as Prisma.InputJsonValue)
            : undefined,
        aiGenerated: patch.aiGenerated,
        reviewRequired: patch.reviewRequired,
      },
    });
    return mapContentItem(row);
  }

  async createReview(input: SubmitReviewInput): Promise<ContentReviewRecord> {
    return prisma.$transaction(async (tx) => {
      const item = await tx.contentStudioItem.findFirst({
        where: {
          id: input.contentItemId,
          organizationId: input.organizationId,
        },
      });
      if (!item) throw new Error("Content item not found");

      if (
        input.status === "approved" ||
        input.status === "changes_requested" ||
        input.status === "rejected"
      ) {
        if (item.status === "draft") {
          assertContentItemTransition("draft", "in_review");
          await tx.contentStudioItem.update({
            where: { id: item.id },
            data: { status: "in_review" },
          });
        }
      }

      if (input.status === "changes_requested") {
        const current = await tx.contentStudioItem.findUniqueOrThrow({
          where: { id: item.id },
        });
        assertContentItemTransition(
          current.status as ContentItemStatus,
          "changes_requested",
        );
        await tx.contentStudioItem.update({
          where: { id: item.id },
          data: { status: "changes_requested" },
        });
      }

      const row = await tx.contentStudioReview.create({
        data: {
          id: newId("crev"),
          contentItemId: input.contentItemId,
          organizationId: input.organizationId,
          status: input.status,
          dimensions: (input.dimensions ?? {}) as Prisma.InputJsonValue,
          notes: input.notes ?? null,
          reviewerId: input.reviewerId ?? null,
          reviewerName: input.reviewerName ?? null,
        },
      });
      return mapReview(row);
    });
  }

  async listReviews(organizationId: string): Promise<ContentReviewRecord[]> {
    const rows = await prisma.contentStudioReview.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
    });
    return rows.map(mapReview);
  }

  async listReviewsForItem(
    contentItemId: string,
    organizationId: string,
  ): Promise<ContentReviewRecord[]> {
    const rows = await prisma.contentStudioReview.findMany({
      where: { contentItemId, organizationId },
      orderBy: { createdAt: "desc" },
    });
    return rows.map(mapReview);
  }

  async createApproval(
    input: SubmitApprovalInput,
  ): Promise<{ approval: ContentApprovalRecord; item: ContentItem }> {
    return prisma.$transaction(async (tx) => {
      const item = await tx.contentStudioItem.findFirst({
        where: {
          id: input.contentItemId,
          organizationId: input.organizationId,
        },
      });
      if (!item) throw new Error("Content item not found");

      let updatedItem = item;
      if (input.approved) {
        if (item.status !== "in_review") {
          throw new Error("Content must be in_review before approval");
        }
        assertContentItemTransition("in_review", "approved");
        updatedItem = await tx.contentStudioItem.update({
          where: { id: item.id },
          data: { status: "approved" },
        });
      } else if (item.status === "in_review") {
        assertContentItemTransition("in_review", "changes_requested");
        updatedItem = await tx.contentStudioItem.update({
          where: { id: item.id },
          data: { status: "changes_requested" },
        });
      }

      const approvalRow = await tx.contentStudioApproval.create({
        data: {
          id: newId("cappr"),
          contentItemId: input.contentItemId,
          organizationId: input.organizationId,
          approved: input.approved,
          notes: input.notes ?? null,
          approverId: input.approverId ?? null,
          approverName: input.approverName ?? null,
        },
      });

      return {
        approval: mapApproval(approvalRow),
        item: mapContentItem(updatedItem),
      };
    });
  }

  async listApprovals(
    organizationId: string,
  ): Promise<ContentApprovalRecord[]> {
    const rows = await prisma.contentStudioApproval.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
    });
    return rows.map(mapApproval);
  }

  async listApprovalsForItem(
    contentItemId: string,
    organizationId: string,
  ): Promise<ContentApprovalRecord[]> {
    const rows = await prisma.contentStudioApproval.findMany({
      where: { contentItemId, organizationId },
      orderBy: { createdAt: "desc" },
    });
    return rows.map(mapApproval);
  }

  async createOutput(input: CreateOutputPackageInput): Promise<OutputPackage> {
    const campaign = await prisma.contentStudioCampaign.findFirst({
      where: { id: input.campaignId, organizationId: input.organizationId },
    });
    if (!campaign) throw new Error("Campaign not found");

    const includes = {
      campaignSummary: input.includes?.campaignSummary ?? true,
      contentCalendar: input.includes?.contentCalendar ?? true,
      approvedContent: input.includes?.approvedContent ?? true,
      complianceMemo: input.includes?.complianceMemo ?? true,
    };

    const row = await prisma.contentStudioOutput.create({
      data: {
        id: newId("out"),
        campaignId: input.campaignId,
        organizationId: input.organizationId,
        title: input.title,
        status: input.status ?? "draft",
        includes: includes as Prisma.InputJsonValue,
        createdById: input.createdById ?? null,
        createdByName: input.createdByName ?? null,
      },
    });
    return mapOutput(row);
  }

  async listOutputs(organizationId: string): Promise<OutputPackage[]> {
    const rows = await prisma.contentStudioOutput.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
    });
    return rows.map(mapOutput);
  }

  async getOutput(
    id: string,
    organizationId: string,
  ): Promise<OutputPackage | null> {
    const row = await prisma.contentStudioOutput.findFirst({
      where: { id, organizationId },
    });
    return row ? mapOutput(row) : null;
  }

  async updateOutput(
    id: string,
    organizationId: string,
    patch: Partial<
      Pick<OutputPackage, "status" | "exportMetadata" | "exportedAt">
    >,
  ): Promise<OutputPackage> {
    const existing = await prisma.contentStudioOutput.findFirst({
      where: { id, organizationId },
    });
    if (!existing) throw new Error("Output package not found");
    if (
      patch.status &&
      !canTransitionOutput(existing.status as OutputPackage["status"], patch.status)
    ) {
      throw new Error(`Cannot transition output to ${patch.status}`);
    }
    const row = await prisma.contentStudioOutput.update({
      where: { id },
      data: {
        status: patch.status,
        exportMetadata:
          patch.exportMetadata !== undefined
            ? (patch.exportMetadata as Prisma.InputJsonValue)
            : undefined,
        exportedAt: patch.exportedAt ? new Date(patch.exportedAt) : undefined,
      },
    });
    return mapOutput(row);
  }

  async listReviewQueue(organizationId: string): Promise<ContentItem[]> {
    const rows = await prisma.contentStudioItem.findMany({
      where: {
        organizationId,
        status: { in: ["in_review", "draft"] },
      },
      orderBy: { updatedAt: "desc" },
    });
    return rows.map(mapContentItem);
  }

  async listApprovalQueue(organizationId: string): Promise<ContentItem[]> {
    const rows = await prisma.contentStudioItem.findMany({
      where: { organizationId, status: "in_review" },
      orderBy: { updatedAt: "desc" },
    });
    return rows.map(mapContentItem);
  }
}
