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
