import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import {
  recordSalesAuditEvent,
  SalesAuditActions,
} from "./audit-events";
import { SALES_EVIDENCE_TARGETS } from "./evidence-links";
import type { SalesActor, SalesOrgScope } from "./services";

export const CONVERSION_MEMO_STATUSES = [
  "draft",
  "submitted",
  "decided",
] as const;

export type ConversionMemoStatus = (typeof CONVERSION_MEMO_STATUSES)[number];

export interface ConversionMemo {
  draft: string;
  status: ConversionMemoStatus;
  pilotCriteria: string;
  evidenceRefs: string[];
  decidedAt: string | null;
  updatedById: string;
  updatedByName: string | null;
  updatedAt: string;
  submittedAt: string | null;
}

export interface UpdateConversionMemoInput {
  draft?: string;
  pilotCriteria?: string;
  evidenceRefs?: string[];
}

export interface SubmitConversionMemoInput {
  /** When true, marks memo as decided (pilot handoff complete). */
  markDecided?: boolean;
}

function parseDealMetadata(metadata: unknown): Record<string, unknown> {
  if (metadata && typeof metadata === "object" && !Array.isArray(metadata)) {
    return metadata as Record<string, unknown>;
  }
  return {};
}

function isConversionMemoStatus(
  value: unknown,
): value is ConversionMemoStatus {
  return (
    typeof value === "string" &&
    (CONVERSION_MEMO_STATUSES as readonly string[]).includes(value)
  );
}

function parseStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === "string" && item.trim())
    .map((item) => item.trim());
}

export function parseConversionMemo(raw: unknown): ConversionMemo | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const m = raw as Record<string, unknown>;
  if (typeof m.draft !== "string") return null;
  if (!isConversionMemoStatus(m.status)) return null;
  if (typeof m.updatedById !== "string" || typeof m.updatedAt !== "string") {
    return null;
  }

  return {
    draft: m.draft,
    status: m.status,
    pilotCriteria:
      typeof m.pilotCriteria === "string" ? m.pilotCriteria : "",
    evidenceRefs: parseStringArray(m.evidenceRefs),
    decidedAt: typeof m.decidedAt === "string" ? m.decidedAt : null,
    updatedById: m.updatedById,
    updatedByName:
      typeof m.updatedByName === "string" ? m.updatedByName : null,
    updatedAt: m.updatedAt,
    submittedAt: typeof m.submittedAt === "string" ? m.submittedAt : null,
  };
}

export function readConversionMemo(metadata: unknown): ConversionMemo | null {
  const root = parseDealMetadata(metadata);
  return parseConversionMemo(root.conversionMemo);
}

function mergeConversionMemoIntoMetadata(
  existing: Record<string, unknown>,
  memo: ConversionMemo,
): Record<string, unknown> {
  return { ...existing, conversionMemo: memo };
}

export function validateUpdateConversionMemoInput(
  input: UpdateConversionMemoInput,
): UpdateConversionMemoInput {
  const draft =
    input.draft !== undefined ? input.draft.trim() : undefined;
  const pilotCriteria =
    input.pilotCriteria !== undefined
      ? input.pilotCriteria.trim()
      : undefined;
  const evidenceRefs =
    input.evidenceRefs !== undefined
      ? input.evidenceRefs
          .map((ref) => ref.trim())
          .filter(Boolean)
      : undefined;

  if (draft !== undefined && !draft) {
    throw new Error("SalesOS validation: conversion memo draft is required");
  }
  if (pilotCriteria !== undefined && !pilotCriteria) {
    throw new Error(
      "SalesOS validation: conversion memo pilot criteria is required",
    );
  }

  return { draft, pilotCriteria, evidenceRefs };
}

async function loadDealWithMetadata(dealId: string, organizationId: string) {
  const deal = await prisma.salesDeal.findFirst({
    where: { id: dealId, organizationId },
    select: {
      id: true,
      title: true,
      organizationId: true,
      metadata: true,
    },
  });
  if (!deal) {
    throw new Error("SalesOS: deal not found in organization");
  }
  return deal;
}

async function countDealEvidenceLinks(
  organizationId: string,
  dealId: string,
): Promise<number> {
  return prisma.salesEvidenceLink.count({
    where: {
      organizationId,
      targetType: SALES_EVIDENCE_TARGETS.DEAL,
      targetId: dealId,
    },
  });
}

async function listDealEvidenceLinkIds(
  organizationId: string,
  dealId: string,
): Promise<Set<string>> {
  const links = await prisma.salesEvidenceLink.findMany({
    where: {
      organizationId,
      targetType: SALES_EVIDENCE_TARGETS.DEAL,
      targetId: dealId,
    },
    select: { id: true, evidenceId: true },
  });
  const ids = new Set<string>();
  for (const link of links) {
    ids.add(link.id);
    ids.add(link.evidenceId);
  }
  return ids;
}

async function assertEvidenceRefsOnDeal(
  organizationId: string,
  dealId: string,
  evidenceRefs: string[],
): Promise<void> {
  if (evidenceRefs.length === 0) {
    throw new Error(
      "SalesOS validation: at least one evidence reference is required to submit conversion memo",
    );
  }
  const allowed = await listDealEvidenceLinkIds(organizationId, dealId);
  for (const ref of evidenceRefs) {
    if (!allowed.has(ref)) {
      throw new Error(
        "SalesOS validation: evidence reference must link to this deal",
      );
    }
  }
}

async function persistConversionMemo(
  dealId: string,
  metadata: Record<string, unknown>,
  memo: ConversionMemo,
  actor: SalesActor,
  scope: SalesOrgScope,
  auditMetadata: Record<string, unknown>,
) {
  await prisma.salesDeal.update({
    where: { id: dealId },
    data: {
      metadata: mergeConversionMemoIntoMetadata(
        metadata,
        memo,
      ) as Prisma.InputJsonValue,
      updatedById: actor.id,
    },
  });

  await recordSalesAuditEvent({
    organizationId: scope.organizationId,
    platformOrganizationId: scope.platformOrganizationId,
    actorId: actor.id,
    actorName: actor.name,
    action: SalesAuditActions.CONVERSION_MEMO_UPDATED,
    targetType: "SalesDeal",
    targetId: dealId,
    metadata: auditMetadata,
  });
}

function buildInitialMemo(
  validated: UpdateConversionMemoInput,
  actor: SalesActor,
  now: string,
): ConversionMemo {
  return {
    draft: validated.draft ?? "",
    status: "draft",
    pilotCriteria: validated.pilotCriteria ?? "",
    evidenceRefs: validated.evidenceRefs ?? [],
    decidedAt: null,
    updatedById: actor.id,
    updatedByName: actor.name ?? null,
    updatedAt: now,
    submittedAt: null,
  };
}

export async function getConversionMemoForDeal(
  scope: SalesOrgScope,
  dealId: string,
): Promise<ConversionMemo | null> {
  const deal = await loadDealWithMetadata(dealId, scope.organizationId);
  return readConversionMemo(deal.metadata);
}

export async function upsertConversionMemo(
  scope: SalesOrgScope,
  dealId: string,
  input: UpdateConversionMemoInput,
  actor: SalesActor,
): Promise<ConversionMemo> {
  const validated = validateUpdateConversionMemoInput(input);
  const deal = await loadDealWithMetadata(dealId, scope.organizationId);
  const existingMeta = parseDealMetadata(deal.metadata);
  const existing = readConversionMemo(deal.metadata);
  const now = new Date().toISOString();

  if (existing && existing.status !== "draft") {
    throw new Error(
      "SalesOS: conversion memo can only be edited while in draft status",
    );
  }

  const memo: ConversionMemo = existing
    ? {
        ...existing,
        draft: validated.draft ?? existing.draft,
        pilotCriteria: validated.pilotCriteria ?? existing.pilotCriteria,
        evidenceRefs: validated.evidenceRefs ?? existing.evidenceRefs,
        updatedById: actor.id,
        updatedByName: actor.name ?? null,
        updatedAt: now,
      }
    : buildInitialMemo(validated, actor, now);

  await persistConversionMemo(dealId, existingMeta, memo, actor, scope, {
    status: memo.status,
    operation: existing ? "update" : "create",
    evidenceRefCount: memo.evidenceRefs.length,
  });

  return memo;
}

export async function submitConversionMemo(
  scope: SalesOrgScope,
  dealId: string,
  input: SubmitConversionMemoInput,
  actor: SalesActor,
): Promise<ConversionMemo> {
  const deal = await loadDealWithMetadata(dealId, scope.organizationId);
  const existingMeta = parseDealMetadata(deal.metadata);
  const existing = readConversionMemo(deal.metadata);
  if (!existing) {
    throw new Error("SalesOS: conversion memo not found — save a draft first");
  }
  if (existing.status !== "draft") {
    throw new Error(
      "SalesOS: only draft conversion memos can be submitted for handoff",
    );
  }
  if (!existing.draft.trim()) {
    throw new Error("SalesOS validation: conversion memo draft is required");
  }
  if (!existing.pilotCriteria.trim()) {
    throw new Error(
      "SalesOS validation: conversion memo pilot criteria is required",
    );
  }

  const evidenceLinkCount = await countDealEvidenceLinks(
    scope.organizationId,
    dealId,
  );
  if (evidenceLinkCount < 1) {
    throw new Error(
      "SalesOS validation: at least one linked evidence item is required to submit conversion memo",
    );
  }

  await assertEvidenceRefsOnDeal(
    scope.organizationId,
    dealId,
    existing.evidenceRefs,
  );

  const now = new Date().toISOString();
  const markDecided = Boolean(input.markDecided);
  const memo: ConversionMemo = {
    ...existing,
    status: markDecided ? "decided" : "submitted",
    submittedAt: now,
    decidedAt: markDecided ? now : existing.decidedAt,
    updatedById: actor.id,
    updatedByName: actor.name ?? null,
    updatedAt: now,
  };

  await persistConversionMemo(dealId, existingMeta, memo, actor, scope, {
    status: memo.status,
    operation: "submit",
    evidenceRefCount: memo.evidenceRefs.length,
    evidenceLinkCount,
    decided: markDecided,
  });

  return memo;
}
