import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import {
  recordSalesAuditEvent,
  SalesAuditActions,
} from "./audit-events";
import {
  validateCreateSalesInteractionInput,
  validateUpdateSalesInteractionInput,
  validateInteractionType,
  type CreateSalesInteractionInput,
  type UpdateSalesInteractionInput,
} from "./validation";
import type { SalesActor, SalesOrgScope } from "./services";

export interface SalesInteractionView {
  id: string;
  type: string;
  subject: string | null;
  summary: string | null;
  occurredAt: Date;
  dealId: string | null;
  accountId: string;
  createdById: string | null;
  createdAt: Date;
}

export interface ListInteractionsOptions {
  type?: string;
}

const interactionSelect = {
  id: true,
  type: true,
  subject: true,
  summary: true,
  occurredAt: true,
  dealId: true,
  accountId: true,
  createdById: true,
  createdAt: true,
} as const;

const interactionListSelect = {
  ...interactionSelect,
  metadata: true,
} as const;

type InteractionListRow = {
  id: string;
  type: string;
  subject: string | null;
  summary: string | null;
  occurredAt: Date;
  dealId: string | null;
  accountId: string;
  createdById: string | null;
  createdAt: Date;
  metadata: unknown;
};

function parseMetadata(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
}

function isInteractionSoftDeleted(metadata: unknown): boolean {
  const deletedAt = parseMetadata(metadata).deletedAt;
  return typeof deletedAt === "string" && deletedAt.length > 0;
}

function toInteractionView(row: InteractionListRow): SalesInteractionView {
  const { metadata: _metadata, ...view } = row;
  return view;
}

function resolveTypeFilter(type?: string): string | undefined {
  if (!type?.trim()) return undefined;
  return validateInteractionType(type.trim().toLowerCase());
}

async function assertDealInOrg(dealId: string, organizationId: string) {
  const deal = await prisma.salesDeal.findFirst({
    where: { id: dealId, organizationId },
    select: { id: true, accountId: true },
  });
  if (!deal) {
    throw new Error("SalesOS: deal not found in organization");
  }
  return deal;
}

async function assertAccountInOrg(accountId: string, organizationId: string) {
  const account = await prisma.salesAccount.findFirst({
    where: { id: accountId, organizationId },
    select: { id: true },
  });
  if (!account) {
    throw new Error("SalesOS: account not found in organization");
  }
  return account;
}

async function getInteractionInOrg(
  interactionId: string,
  organizationId: string,
) {
  const interaction = await prisma.salesInteraction.findFirst({
    where: { id: interactionId, organizationId },
    select: {
      ...interactionListSelect,
    },
  });

  if (!interaction) {
    throw new Error("SalesOS: interaction not found");
  }

  if (isInteractionSoftDeleted(interaction.metadata)) {
    throw new Error("SalesOS: interaction not found");
  }

  return interaction;
}

function filterInteractionRows(
  rows: InteractionListRow[],
  options?: ListInteractionsOptions,
): SalesInteractionView[] {
  const typeFilter = options?.type
    ? resolveTypeFilter(options.type)
    : undefined;

  return rows
    .filter((row) => !isInteractionSoftDeleted(row.metadata))
    .filter((row) => (typeFilter ? row.type === typeFilter : true))
    .map(toInteractionView);
}

export async function listInteractionsForDeal(
  scope: SalesOrgScope,
  dealId: string,
  options?: ListInteractionsOptions,
): Promise<SalesInteractionView[]> {
  await assertDealInOrg(dealId, scope.organizationId);

  const rows = await prisma.salesInteraction.findMany({
    where: {
      organizationId: scope.organizationId,
      dealId,
    },
    select: interactionListSelect,
    orderBy: { occurredAt: "desc" },
  });

  return filterInteractionRows(rows, options);
}

export async function listInteractionsForAccount(
  scope: SalesOrgScope,
  accountId: string,
  options?: ListInteractionsOptions,
): Promise<SalesInteractionView[]> {
  await assertAccountInOrg(accountId, scope.organizationId);

  const rows = await prisma.salesInteraction.findMany({
    where: {
      organizationId: scope.organizationId,
      accountId,
    },
    select: interactionListSelect,
    orderBy: { occurredAt: "desc" },
  });

  return filterInteractionRows(rows, options);
}

export async function createSalesInteraction(
  scope: SalesOrgScope,
  input: CreateSalesInteractionInput,
  actor: SalesActor,
): Promise<SalesInteractionView> {
  const validated = validateCreateSalesInteractionInput(input);

  await assertAccountInOrg(validated.accountId, scope.organizationId);

  if (validated.dealId) {
    const deal = await assertDealInOrg(validated.dealId, scope.organizationId);
    if (deal.accountId !== validated.accountId) {
      throw new Error(
        "SalesOS validation: deal does not belong to the specified account",
      );
    }
  }

  const interaction = await prisma.salesInteraction.create({
    data: {
      organizationId: scope.organizationId,
      platformOrganizationId: scope.platformOrganizationId ?? null,
      accountId: validated.accountId,
      dealId: validated.dealId ?? null,
      type: validated.type,
      subject: validated.subject ?? null,
      summary: validated.summary ?? null,
      occurredAt: validated.occurredAt ?? new Date(),
      metadata: (validated.metadata ?? undefined) as
        | Prisma.InputJsonValue
        | undefined,
      createdById: actor.id,
    },
    select: interactionSelect,
  });

  await recordSalesAuditEvent({
    organizationId: scope.organizationId,
    platformOrganizationId: scope.platformOrganizationId,
    actorId: actor.id,
    actorName: actor.name ?? undefined,
    action: SalesAuditActions.INTERACTION_CREATED,
    targetType: validated.dealId ? "SalesDeal" : "SalesAccount",
    targetId: validated.dealId ?? validated.accountId,
    metadata: {
      interactionId: interaction.id,
      type: interaction.type,
      accountId: validated.accountId,
      dealId: validated.dealId ?? null,
    },
  });

  return interaction;
}

export async function updateSalesInteraction(
  interactionId: string,
  scope: SalesOrgScope,
  input: UpdateSalesInteractionInput,
  actor: SalesActor,
): Promise<SalesInteractionView> {
  const validated = validateUpdateSalesInteractionInput(input);
  const existing = await getInteractionInOrg(
    interactionId,
    scope.organizationId,
  );

  const existingMetadata = parseMetadata(existing.metadata);
  const metadata =
    validated.metadata !== undefined
      ? validated.metadata
      : existingMetadata;

  const interaction = await prisma.salesInteraction.update({
    where: { id: interactionId },
    data: {
      ...(validated.type !== undefined ? { type: validated.type } : {}),
      ...(validated.subject !== undefined
        ? { subject: validated.subject }
        : {}),
      ...(validated.summary !== undefined
        ? { summary: validated.summary }
        : {}),
      ...(validated.occurredAt !== undefined
        ? { occurredAt: validated.occurredAt as Date }
        : {}),
      ...(validated.metadata !== undefined
        ? { metadata: metadata as Prisma.InputJsonValue }
        : {}),
    },
    select: interactionSelect,
  });

  await recordSalesAuditEvent({
    organizationId: scope.organizationId,
    platformOrganizationId: scope.platformOrganizationId,
    actorId: actor.id,
    actorName: actor.name ?? undefined,
    action: SalesAuditActions.INTERACTION_UPDATED,
    targetType: existing.dealId ? "SalesDeal" : "SalesAccount",
    targetId: existing.dealId ?? existing.accountId,
    metadata: {
      interactionId: interaction.id,
      type: interaction.type,
      accountId: existing.accountId,
      dealId: existing.dealId,
    },
  });

  return interaction;
}

export async function deleteSalesInteraction(
  interactionId: string,
  scope: SalesOrgScope,
  actor: SalesActor,
): Promise<SalesInteractionView> {
  const existing = await getInteractionInOrg(
    interactionId,
    scope.organizationId,
  );

  const metadata = {
    ...parseMetadata(existing.metadata),
    deletedAt: new Date().toISOString(),
    deletedById: actor.id,
  };

  const interaction = await prisma.salesInteraction.update({
    where: { id: interactionId },
    data: {
      metadata: metadata as Prisma.InputJsonValue,
    },
    select: interactionSelect,
  });

  await recordSalesAuditEvent({
    organizationId: scope.organizationId,
    platformOrganizationId: scope.platformOrganizationId,
    actorId: actor.id,
    actorName: actor.name ?? undefined,
    action: SalesAuditActions.INTERACTION_DELETED,
    targetType: existing.dealId ? "SalesDeal" : "SalesAccount",
    targetId: existing.dealId ?? existing.accountId,
    metadata: {
      interactionId: interaction.id,
      type: existing.type,
      accountId: existing.accountId,
      dealId: existing.dealId,
    },
  });

  return interaction;
}

export async function listInteractionsForOrganization(
  scope: SalesOrgScope,
  options?: ListInteractionsOptions & { limit?: number },
): Promise<SalesInteractionView[]> {
  const limit = Math.min(options?.limit ?? 100, 200);
  const rows = await prisma.salesInteraction.findMany({
    where: { organizationId: scope.organizationId },
    select: interactionListSelect,
    orderBy: { occurredAt: "desc" },
    take: limit,
  });
  return filterInteractionRows(rows, options);
}
