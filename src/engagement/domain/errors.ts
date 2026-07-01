/** Same pattern as SalesOS — inherited */
export interface DomainError { readonly code: string; readonly message: string; readonly recoverable: boolean; readonly details?: Record<string, unknown>; }
export class ValidationError extends Error implements DomainError { readonly code = "VALIDATION_ERROR"; readonly recoverable = true; constructor(message: string, public details?: Record<string, unknown>) { super(message); } }
export class BusinessRuleError extends Error implements DomainError { readonly code = "BUSINESS_RULE_FAILED"; readonly recoverable = true; constructor(message: string, public details?: Record<string, unknown>) { super(message); } }
export class GovernanceBlockedError extends Error implements DomainError { readonly code = "GOVERNANCE_BLOCKED"; readonly recoverable = true; constructor(message: string, public guardType: string, public details?: Record<string, unknown>) { super(message); } }
export class ConcurrencyError extends Error implements DomainError { readonly code = "CONFLICT"; readonly recoverable = true; constructor(message: string, public expectedVersion: number, public actualVersion: number) { super(message); } }
export class NotFoundError extends Error implements DomainError { readonly code = "NOT_FOUND"; readonly recoverable = false; constructor(message: string, public details?: Record<string, unknown>) { super(message); } }
