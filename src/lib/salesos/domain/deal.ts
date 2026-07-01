/**
 * Deal Aggregate — SPEC-01a §1
 *
 * Root aggregate for Opportunity Management.
 * Enforces all invariants (DI-01 to DI-07).
 * Owns: stage, review decisions, evidence count, version.
 *
 * Evidence links live in Platform Evidence Network.
 * Deal only stores evidenceCount (computed on read, synced on link/unlink).
 */

import { Amount } from "./value-objects/amount";
import { Probability } from "./value-objects/probability";
import { Currency } from "./value-objects/currency";
import { Stage } from "./value-objects/stage";
import { BusinessRuleError, ValidationError } from "./errors";

// ─── Aggregrate Lifecycle (SPEC-01a §1) ───

export type AggregateLifecycleStage = "created" | "active" | "closed" | "archived";

// ─── Review ───

export type ReviewStatus = "draft" | "in_review" | "approved" | "rejected";

export interface ReviewDecision {
  id: string;
  decision: "approved" | "rejected";
  actorId: string;
  actorName?: string;
  reason: string;
  stageSlug?: string;
  createdAt: string;
}

// ─── Deal Metadata ───

export interface DealMetadata {
  reviewDecisions?: ReviewDecision[];
  riskFlags?: string[];
  signals?: string[];
  [key: string]: unknown;
}

export interface CreateDealProps {
  accountId: string;
  name: string;
  amount: Amount;
  currency: Currency;
  probability: Probability;
  expectedCloseDate?: string;
  ownerId: string;
  organizationId: string;
  createdById: string;
}

export interface DealProps extends CreateDealProps {
  id: string;
  updatedById?: string;
  stage: Stage;
  previousStage?: Stage;
  reviewStatus: ReviewStatus;
  reviewDecisions: ReviewDecision[];
  evidenceCount: number;
  version: number;
  createdAt: string;
  updatedAt: string;
  lifecycle: AggregateLifecycleStage;
  closedAt?: string;
  lossReason?: string;
  competitor?: string;
  metadata?: DealMetadata;
}

export class Deal {
  private constructor(private readonly props: DealProps) {}

  // ─── Factory (DI-01, DI-02, DI-03 enforced via value objects) ───

  static create(props: CreateDealProps): Deal {
    const now = new Date().toISOString();
    return new Deal({
      ...props,
      id: "", // assigned by repository/infra
      stage: Stage.DRAFT,
      reviewStatus: "draft",
      reviewDecisions: [],
      evidenceCount: 0,
      version: 1,
      createdAt: now,
      updatedAt: now,
      lifecycle: "created",
    });
  }

  // ─── Reconstitute from persistence (handles serialized value objects) ───

  static reconstitute(raw: Record<string, unknown>): Deal {
    const props: DealProps = {
      id: raw.id as string,
      accountId: raw.accountId as string,
      name: raw.name as string,
      organizationId: raw.organizationId as string,
      createdById: raw.createdById as string,
      ownerId: raw.ownerId as string,
      updatedById: raw.updatedById as string | undefined,

      // Rehydrate value objects from serialized form
      amount: typeof raw.amount === "object" && raw.amount !== null
        ? Amount.create((raw.amount as { value: number }).value, (raw.amount as { currency: string }).currency)
        : Amount.create(raw.amount as number),
      currency: typeof raw.currency === "string" ? Currency.create(raw.currency) : raw.currency as Currency,
      probability: typeof raw.probability === "number" ? Probability.create(raw.probability) : raw.probability as Probability,
      stage: typeof raw.stage === "string" ? Stage.create(raw.stage) : raw.stage as Stage,
      previousStage: raw.previousStage ? (typeof raw.previousStage === "string" ? Stage.create(raw.previousStage) : raw.previousStage as Stage) : undefined,

      expectedCloseDate: raw.expectedCloseDate as string | undefined,
      reviewStatus: (raw.reviewStatus as ReviewStatus) ?? "draft",
      reviewDecisions: (raw.reviewDecisions as ReviewDecision[]) ?? [],
      evidenceCount: (raw.evidenceCount as number) ?? 0,
      version: (raw.version as number) ?? 1,
      createdAt: (raw.createdAt as string) ?? new Date().toISOString(),
      updatedAt: (raw.updatedAt as string) ?? new Date().toISOString(),
      lifecycle: (raw.lifecycle as AggregateLifecycleStage) ?? "created",
      closedAt: raw.closedAt as string | undefined,
      lossReason: raw.lossReason as string | undefined,
      competitor: raw.competitor as string | undefined,
      metadata: raw.metadata as DealMetadata | undefined,
    };
    return new Deal(props);
  }

  // ─── Getters ───

  get id(): string { return this.props.id; }
  get organizationId(): string { return this.props.organizationId; }
  get accountId(): string { return this.props.accountId; }
  get name(): string { return this.props.name; }
  get amount(): Amount { return this.props.amount; }
  get currency(): Currency { return this.props.currency; }
  get probability(): Probability { return this.props.probability; }
  get expectedCloseDate(): string | undefined { return this.props.expectedCloseDate; }
  get ownerId(): string { return this.props.ownerId; }
  get createdById(): string { return this.props.createdById; }
  get updatedById(): string | undefined { return this.props.updatedById; }
  get stage(): Stage { return this.props.stage; }
  get previousStage(): Stage | undefined { return this.props.previousStage; }
  get reviewStatus(): ReviewStatus { return this.props.reviewStatus; }
  get reviewDecisions(): ReviewDecision[] { return this.props.reviewDecisions; }
  get evidenceCount(): number { return this.props.evidenceCount; }
  get version(): number { return this.props.version; }
  get createdAt(): string { return this.props.createdAt; }
  get updatedAt(): string { return this.props.updatedAt; }
  get lifecycle(): AggregateLifecycleStage { return this.props.lifecycle; }
  get closedAt(): string | undefined { return this.props.closedAt; }
  get lossReason(): string | undefined { return this.props.lossReason; }
  get competitor(): string | undefined { return this.props.competitor; }
  get metadata(): DealMetadata | undefined { return this.props.metadata; }

  // ─── Mutations ───

  updateField(field: string, value: unknown, updatedById: string): Deal {
    // DI-05: closed deals are immutable
    if (this.props.stage.isClosed) {
      throw new BusinessRuleError("Cannot update a closed deal", {
        dealId: this.props.id,
        stage: this.props.stage.name,
      });
    }
    const updates: Partial<DealProps> = { updatedAt: new Date().toISOString(), updatedById };
    switch (field) {
      case "name":
        updates.name = String(value);
        break;
      case "expectedCloseDate":
        updates.expectedCloseDate = String(value);
        break;
      case "ownerId":
        updates.ownerId = String(value);
        break;
      default:
        throw new ValidationError(`Cannot update field: ${field}`, { field, value });
    }
    return Deal.reconstitute({ ...this.props, ...updates });
  }

  // ─── Stage transitions ───

  applyStageTransition(
    toStage: Stage,
    action: string,
    actorId: string,
    options?: { reason?: string; reviewDecision?: ReviewDecision },
  ): Deal {
    // DI-05: cannot transition from closed
    if (this.props.stage.isClosed) {
      throw new BusinessRuleError("Cannot transition from a closed stage", {
        fromStage: this.props.stage.name,
        toStage: toStage.name,
      });
    }

    const now = new Date().toISOString();
    let lifecycle: AggregateLifecycleStage = "active";

    // Set lifecycle
    if (toStage.isClosed) {
      lifecycle = "closed";
    }

    const props: Partial<DealProps> = {
      previousStage: this.props.stage,
      stage: toStage,
      reviewStatus: this.props.reviewStatus,
      updatedAt: now,
      lifecycle,
    };

    // Review/approval state
    if (action === "submit_for_review") {
      props.reviewStatus = "in_review";
    } else if (action === "approve" && options?.reviewDecision) {
      props.reviewStatus = "approved";
      props.reviewDecisions = [...this.props.reviewDecisions, options.reviewDecision];
    } else if (action === "reject" && options?.reviewDecision) {
      props.reviewStatus = "rejected";
      props.reviewDecisions = [...this.props.reviewDecisions, options.reviewDecision];
    }

    // Close capture
    if (toStage.name === "Closed Won" || toStage.name === "Closed Lost") {
      props.closedAt = now;
      if (toStage.name === "Closed Lost") {
        props.lossReason = options?.reason;
      }
    }

    return Deal.reconstitute({ ...this.props, ...props });
  }

  // ─── Evidence ───

  syncEvidenceCount(actualCount: number): Deal {
    return Deal.reconstitute({
      ...this.props,
      evidenceCount: actualCount,
      updatedAt: new Date().toISOString(),
    });
  }

  // ─── Archive ───

  archive(): Deal {
    return Deal.reconstitute({
      ...this.props,
      lifecycle: "archived",
      updatedAt: new Date().toISOString(),
    });
  }

  // ─── Snapshot ───

  toJSON(): DealProps {
    return { ...this.props };
  }
}
