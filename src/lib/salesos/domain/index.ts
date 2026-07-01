/**
 * SalesOS v2 — Domain Public API
 * Opportunity Management (EPIC-01)
 *
 * SPEC-01a v1.0 (FROZEN)
 */

// Value Objects
export { Amount } from "./value-objects/amount";
export { Probability } from "./value-objects/probability";
export { Currency } from "./value-objects/currency";
export { Stage } from "./value-objects/stage";
export type { StageName } from "./value-objects/stage";

// Aggregate
export { Deal } from "./deal";
export type { CreateDealProps, DealProps, ReviewDecision, DealMetadata, ReviewStatus, AggregateLifecycleStage } from "./deal";

// Domain Errors
export {
  ValidationError,
  BusinessRuleError,
  GovernanceBlockedError,
  ConcurrencyError,
  NotFoundError,
} from "./errors";
export type { DomainError } from "./errors";

// Domain Events
export type {
  DealCreatedEvent,
  DealStageChangedEvent,
  DealSubmittedForReviewEvent,
  DealApprovedEvent,
  DealRejectedEvent,
  DealClosedWonEvent,
  DealClosedLostEvent,
  DealEvent,
  DomainEvent,
} from "./events";
export { EVENT_VERSION_V1 } from "./events";

// Domain Services
export type { DealTransitionService, EvidenceGateService, TransitionOptions } from "./services";

// Repository
export type { DealRepository, DealFilter } from "./repository";

// Event Publisher
export type { DomainEventPublisher } from "./publisher";
