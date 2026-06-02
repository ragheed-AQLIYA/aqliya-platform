import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import {
  recordSalesAuditEvent,
  SalesAuditActions,
} from "./audit-events";
import type { SalesActor, SalesOrgScope } from "./services";
import {
  validateCreateSalesSignalInput,
  type CreateSalesSignalInput,
} from "./validation";

/** Phase 2 stub — signals stored in SalesAccount.metadata.signals[] (max 50, no dedicated table). */

export const MAX_SIGNALS_PER_ACCOUNT = 50;

export const VALID_SIGNAL_TYPES = [
  "intent",
  "engagement",
  "risk",
  "news",
  "other",
] as const;

export type SalesSignalType = (typeof VALID_SIGNAL_TYPES)[number];

export const VALID_SIGNAL_SEVERITIES = ["low", "medium", "high"] as const;

export type SalesSignalSeverity = (typeof VALID_SIGNAL_SEVERITIES)[number];

export interface SalesSignal {
  id: string;
  type: SalesSignalType;
  title: string;
  summary?: string | null;
  severity?: SalesSignalSeverity | null;
  source?: string | null;
  detectedAt: string;
  createdById?: string | null;
  createdAt: string;
}

export interface SalesSignalView extends SalesSignal {
  accountId: string;
}

export interface SalesSignalWithAccount extends SalesSignalView {
  accountName: string;
}

export interface ListSignalsOptions {
  type?: string;
  accountId?: string;
}

function parseMetadata(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
}

function parseSeverity(value: unknown): SalesSignalSeverity | null {
  if (
    value === "low" ||
    value === "medium" ||
    value === "high"
  ) {
    return value;
  }
  return null;
}

function parseSignalType(value: unknown): SalesSignalType | null {
  if (
    typeof value === "string" &&
    VALID_SIGNAL_TYPES.includes(value as SalesSignalType)
  ) {
    return value as SalesSignalType;
  }
  return null;
}

function parseSignalRow(value: unknown): SalesSignal | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const row = value as Record<string, unknown>;
  const id = typeof row.id === "string" && row.id.trim() ? row.id.trim() : null;
  const type = parseSignalType(row.type);
  const title =
    typeof row.title === "string" && row.title.trim() ? row.title.trim() : null;
  const detectedAt =
    typeof row.detectedAt === "string" && row.detectedAt.trim()
      ? row.detectedAt.trim()
      : null;
  const createdAt =
    typeof row.createdAt === "string" && row.createdAt.trim()
      ? row.createdAt.trim()
      : detectedAt;

  if (!id || !type || !title || !detectedAt || !createdAt) {
    return null;
  }

  return {
    id,
    type,
    title,
    summary:
      typeof row.summary === "string" && row.summary.trim()
        ? row.summary.trim()
        : null,
    severity: parseSeverity(row.severity),
    source:
      typeof row.source === "string" && row.source.trim()
        ? row.source.trim()
        : null,
    detectedAt,
    createdById:
      typeof row.createdById === "string" && row.createdById.trim()
        ? row.createdById.trim()
        : null,
    createdAt,
  };
}

export function readSignalsFromMetadata(metadata: unknown): SalesSignal[] {
  const raw = parseMetadata(metadata).signals;
  if (!Array.isArray(raw)) return [];

  return raw
    .map(parseSignalRow)
    .filter((signal): signal is SalesSignal => signal != null)
    .sort(
      (a, b) =>
        new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime(),
    );
}

function resolveTypeFilter(type?: string): SalesSignalType | undefined {
  if (!type?.trim()) return undefined;
  const normalized = type.trim().toLowerCase();
  if (
    VALID_SIGNAL_TYPES.includes(normalized as SalesSignalType)
  ) {
    return normalized as SalesSignalType;
  }
  return undefined;
}

function filterSignals<T extends SalesSignal>(
  signals: T[],
  options?: ListSignalsOptions,
): T[] {
  const typeFilter = options?.type ? resolveTypeFilter(options.type) : undefined;

  return signals.filter((signal) =>
    typeFilter ? signal.type === typeFilter : true,
  );
}

async function assertAccountInOrg(accountId: string, organizationId: string) {
  const account = await prisma.salesAccount.findFirst({
    where: { id: accountId, organizationId },
    select: { id: true, name: true, metadata: true },
  });
  if (!account) {
    throw new Error("SalesOS: account not found in organization");
  }
  return account;
}

export async function listSignalsForAccount(
  scope: SalesOrgScope,
  accountId: string,
  options?: ListSignalsOptions,
): Promise<SalesSignalView[]> {
  const account = await assertAccountInOrg(accountId, scope.organizationId);
  const signals = readSignalsFromMetadata(account.metadata).map((signal) => ({
    ...signal,
    accountId,
  }));
  return filterSignals(signals, options);
}

export async function listSignalsForOrganization(
  scope: SalesOrgScope,
  options?: ListSignalsOptions,
): Promise<SalesSignalWithAccount[]> {
  const where: Prisma.SalesAccountWhereInput = {
    organizationId: scope.organizationId,
  };
  if (options?.accountId) {
    where.id = options.accountId;
  }

  const accounts = await prisma.salesAccount.findMany({
    where,
    select: { id: true, name: true, metadata: true },
    orderBy: { updatedAt: "desc" },
  });

  const flattened: SalesSignalWithAccount[] = [];
  for (const account of accounts) {
    const signals = readSignalsFromMetadata(account.metadata).map((signal) => ({
      ...signal,
      accountId: account.id,
      accountName: account.name,
    }));
    flattened.push(...filterSignals(signals, options));
  }

  return flattened.sort(
    (a, b) =>
      new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime(),
  );
}

export async function createSalesSignal(
  scope: SalesOrgScope,
  input: CreateSalesSignalInput,
  actor: SalesActor,
): Promise<SalesSignalView> {
  const validated = validateCreateSalesSignalInput(input);
  const account = await assertAccountInOrg(
    validated.accountId,
    scope.organizationId,
  );

  const existing = readSignalsFromMetadata(account.metadata);
  if (existing.length >= MAX_SIGNALS_PER_ACCOUNT) {
    throw new Error(
      `SalesOS validation: account signal limit reached (${MAX_SIGNALS_PER_ACCOUNT})`,
    );
  }

  const detectedAt = validated.detectedAt ?? new Date();
  const nowIso = new Date().toISOString();
  const signal: SalesSignal = {
    id: crypto.randomUUID(),
    type: validated.type,
    title: validated.title,
    summary: validated.summary ?? null,
    severity: validated.severity ?? null,
    source: validated.source ?? null,
    detectedAt: detectedAt.toISOString(),
    createdById: actor.id,
    createdAt: nowIso,
  };

  const metadata = parseMetadata(account.metadata);
  const nextMetadata = {
    ...metadata,
    signals: [...existing, signal],
  };

  await prisma.salesAccount.update({
    where: { id: account.id },
    data: {
      metadata: nextMetadata as unknown as Prisma.InputJsonValue,
    },
  });

  await recordSalesAuditEvent({
    organizationId: scope.organizationId,
    platformOrganizationId: scope.platformOrganizationId,
    actorId: actor.id,
    actorName: actor.name ?? undefined,
    action: SalesAuditActions.SIGNAL_CREATED,
    targetType: "SalesAccount",
    targetId: account.id,
    metadata: {
      signalId: signal.id,
      signalType: signal.type,
      title: signal.title,
    },
  });

  return { ...signal, accountId: account.id };
}

export function signalTypeLabelAr(type: SalesSignalType): string {
  switch (type) {
    case "intent":
      return "نية شراء";
    case "engagement":
      return "تفاعل";
    case "risk":
      return "مخاطر";
    case "news":
      return "أخبار";
    default:
      return "أخرى";
  }
}

export function signalSeverityLabelAr(
  severity: SalesSignalSeverity | null | undefined,
): string {
  switch (severity) {
    case "high":
      return "مرتفع";
    case "medium":
      return "متوسط";
    case "low":
      return "منخفض";
    default:
      return "—";
  }
}
