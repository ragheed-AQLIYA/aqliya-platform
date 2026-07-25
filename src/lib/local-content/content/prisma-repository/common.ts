import "server-only";

import type { Prisma } from "@prisma/client";
import type {
  Campaign,
  ContentApprovalRecord,
  ContentItem,
  ContentProject,
  ContentReviewRecord,
  ContentSource,
  OutputPackage,
  SourceStatus,
} from "../types";

export function toIso(d: Date): string {
  return d.toISOString();
}

export function asStringArray(value: Prisma.JsonValue): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is string => typeof v === "string");
}

export function asRecord(value: Prisma.JsonValue | null | undefined): Record<string, unknown> | undefined {
  if (value === null || value === undefined) return undefined;
  if (typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return undefined;
}

export function asDimensions(value: Prisma.JsonValue): ContentReviewRecord["dimensions"] {
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

export function asIncludes(value: Prisma.JsonValue): OutputPackage["includes"] {
  const rec = asRecord(value);
  return {
    campaignSummary: (rec?.campaignSummary as boolean | undefined) ?? true,
    contentCalendar: (rec?.contentCalendar as boolean | undefined) ?? true,
    approvedContent: (rec?.approvedContent as boolean | undefined) ?? true,
    complianceMemo: (rec?.complianceMemo as boolean | undefined) ?? true,
  };
}

export function asDraftAssistMetadata(
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

export function mapProject(row: {
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

export function mapCampaign(row: {
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
    status: row.status as Campaign["status"],
    createdById: row.createdById ?? undefined,
    createdByName: row.createdByName ?? undefined,
    createdAt: toIso(row.createdAt),
    updatedAt: toIso(row.updatedAt),
  };
}

export function mapSource(row: {
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

export function mapContentItem(row: {
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
    status: row.status as ContentItem["status"],
    aiGenerated: row.aiGenerated,
    reviewRequired: row.reviewRequired,
    draftAssistMetadata: asDraftAssistMetadata(row.draftAssistMetadata),
    createdById: row.createdById ?? undefined,
    createdByName: row.createdByName ?? undefined,
    createdAt: toIso(row.createdAt),
    updatedAt: toIso(row.updatedAt),
  };
}

export function mapReview(row: {
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

export function mapApproval(row: {
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

export function mapOutput(row: {
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
