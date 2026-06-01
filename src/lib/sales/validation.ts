export interface CreateSalesDealInput {
  title: string;
  accountId: string;
  stageId?: string | null;
  amount?: number | null;
  currency?: string;
  probability?: number | null;
  expectedCloseDate?: Date | null;
  status?: string;
  metadata?: Record<string, unknown>;
}

export interface UpdateSalesDealInput {
  title?: string;
  accountId?: string;
  stageId?: string | null;
  amount?: number | null;
  currency?: string;
  probability?: number | null;
  expectedCloseDate?: Date | null;
  status?: string;
  metadata?: Record<string, unknown>;
}

export interface SalesStageTransitionInput {
  stageId: string | null;
}

const VALID_DEAL_STATUSES = ["open", "won", "lost", "archived"] as const;

export const OPEN_DEAL_STATUSES = ["open"] as const;

const VALID_INTERACTION_TYPES = [
  "call",
  "email",
  "meeting",
  "note",
  "demo",
  "proposal",
  "other",
] as const;

export interface CreateSalesInteractionInput {
  accountId: string;
  dealId?: string | null;
  type: string;
  subject?: string | null;
  summary?: string | null;
  occurredAt?: Date | null;
}

export interface UpdateSalesInteractionInput {
  type?: string;
  subject?: string | null;
  summary?: string | null;
  occurredAt?: Date | null;
}

export function validateInteractionType(type: string): string {
  const normalized = type.trim().toLowerCase();
  if (
    !VALID_INTERACTION_TYPES.includes(
      normalized as (typeof VALID_INTERACTION_TYPES)[number],
    )
  ) {
    throw new SalesValidationError(
      `interaction type must be one of: ${VALID_INTERACTION_TYPES.join(", ")}`,
      "type",
    );
  }
  return normalized;
}

export function validateCreateSalesInteractionInput(
  input: CreateSalesInteractionInput,
): CreateSalesInteractionInput & { type: string } {
  if (!input.accountId?.trim()) {
    throw new SalesValidationError("accountId is required", "accountId");
  }
  const type = validateInteractionType(input.type);
  return {
    accountId: input.accountId.trim(),
    dealId: input.dealId ?? null,
    type,
    subject: input.subject?.trim() || null,
    summary: input.summary?.trim() || null,
    occurredAt: input.occurredAt ?? null,
  };
}

export function validateUpdateSalesInteractionInput(
  input: UpdateSalesInteractionInput,
): UpdateSalesInteractionInput & { type?: string } {
  const keys = Object.keys(input).filter(
    (k) => input[k as keyof UpdateSalesInteractionInput] !== undefined,
  );
  if (keys.length === 0) {
    throw new SalesValidationError(
      "at least one field is required for update",
      "input",
    );
  }
  const next: UpdateSalesInteractionInput & { type?: string } = {};
  if (input.type !== undefined) {
    next.type = validateInteractionType(input.type);
  }
  if (input.subject !== undefined) {
    next.subject = input.subject?.trim() || null;
  }
  if (input.summary !== undefined) {
    next.summary = input.summary?.trim() || null;
  }
  if (input.occurredAt !== undefined) {
    next.occurredAt = input.occurredAt;
  }
  return next;
}

export class SalesValidationError extends Error {
  field: string;
  constructor(message: string, field: string) {
    super(message);
    this.name = "SalesValidationError";
    this.field = field;
  }
}

function requireNonEmpty(value: string, field: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    throw new SalesValidationError(`${field} is required`, field);
  }
  return trimmed;
}

export function validateCreateSalesDealInput(
  input: CreateSalesDealInput,
): CreateSalesDealInput {
  const title = requireNonEmpty(input.title, "title");
  if (!input.accountId?.trim()) {
    throw new SalesValidationError("accountId is required", "accountId");
  }
  if (input.amount != null && (!Number.isFinite(input.amount) || input.amount < 0)) {
    throw new SalesValidationError("amount must be a non-negative number", "amount");
  }
  if (
    input.probability != null &&
    (!Number.isFinite(input.probability) ||
      input.probability < 0 ||
      input.probability > 100)
  ) {
    throw new SalesValidationError(
      "probability must be between 0 and 100",
      "probability",
    );
  }
  if (input.status) {
    validateDealStatus(input.status);
  }
  return {
    ...input,
    title,
    accountId: input.accountId.trim(),
    currency: input.currency?.trim() || "SAR",
  };
}

export function validateUpdateSalesDealInput(
  input: UpdateSalesDealInput,
): UpdateSalesDealInput {
  if (input.title !== undefined) {
    requireNonEmpty(input.title, "title");
  }
  if (input.amount != null && (!Number.isFinite(input.amount) || input.amount < 0)) {
    throw new SalesValidationError("amount must be a non-negative number", "amount");
  }
  if (
    input.probability != null &&
    (!Number.isFinite(input.probability) ||
      input.probability < 0 ||
      input.probability > 100)
  ) {
    throw new SalesValidationError(
      "probability must be between 0 and 100",
      "probability",
    );
  }
  if (input.status) {
    validateDealStatus(input.status);
  }
  return input;
}

export function validateSalesStageTransitionInput(
  input: SalesStageTransitionInput,
): SalesStageTransitionInput {
  return input;
}

export function validateDealStatus(status: string): void {
  if (!VALID_DEAL_STATUSES.includes(status as (typeof VALID_DEAL_STATUSES)[number])) {
    throw new SalesValidationError(
      `status must be one of: ${VALID_DEAL_STATUSES.join(", ")}`,
      "status",
    );
  }
}

const VALID_SIGNAL_TYPES = ["intent", "engagement", "risk", "news", "other"] as const;
const VALID_SIGNAL_SEVERITIES = ["low", "medium", "high"] as const;

export interface CreateSalesSignalInput {
  accountId: string;
  type: string;
  title: string;
  summary?: string | null;
  severity?: string | null;
  source?: string | null;
  detectedAt?: Date;
}

export function validateCreateSalesSignalInput(
  input: CreateSalesSignalInput,
): CreateSalesSignalInput & {
  type: (typeof VALID_SIGNAL_TYPES)[number];
  severity?: (typeof VALID_SIGNAL_SEVERITIES)[number] | null;
} {
  const accountId = input.accountId?.trim();
  if (!accountId) {
    throw new SalesValidationError("accountId is required", "accountId");
  }
  const normalizedType = input.type?.trim().toLowerCase();
  if (
    !normalizedType ||
    !VALID_SIGNAL_TYPES.includes(normalizedType as (typeof VALID_SIGNAL_TYPES)[number])
  ) {
    throw new SalesValidationError(
      `signal type must be one of: ${VALID_SIGNAL_TYPES.join(", ")}`,
      "type",
    );
  }
  const title = requireNonEmpty(input.title, "title");
  let severity: (typeof VALID_SIGNAL_SEVERITIES)[number] | null | undefined;
  if (input.severity != null && String(input.severity).trim()) {
    const normalizedSeverity = String(input.severity).trim().toLowerCase();
    if (
      !VALID_SIGNAL_SEVERITIES.includes(
        normalizedSeverity as (typeof VALID_SIGNAL_SEVERITIES)[number],
      )
    ) {
      throw new SalesValidationError(
        `severity must be one of: ${VALID_SIGNAL_SEVERITIES.join(", ")}`,
        "severity",
      );
    }
    severity = normalizedSeverity as (typeof VALID_SIGNAL_SEVERITIES)[number];
  }
  return {
    accountId,
    type: normalizedType as (typeof VALID_SIGNAL_TYPES)[number],
    title,
    summary: input.summary?.trim() || null,
    severity: severity ?? null,
    source: input.source?.trim() || null,
    detectedAt: input.detectedAt,
  };
}
