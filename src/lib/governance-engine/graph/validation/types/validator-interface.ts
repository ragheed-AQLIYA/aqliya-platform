// ENG-001B: Relationship Validator — Validator Interface
//
// All validators implement this interface.
// Each validator is a pure function: ExtractedRegistries → ValidationIssue[]
// No side effects. No I/O. No mutation.
//
// Architecture Baseline: M2 v1.2 (Frozen)
// RV-01: Validator MUST NOT re-parse Markdown — input is always ExtractedRegistries JSON.

import type { ExtractedRegistries } from '../../types/extracted-registries';
import type { ValidationIssue } from './validation-issues';

/**
 * A specialized relationship validator.
 * Pure function — reads input, returns issues, no side effects.
 */
export type RelationshipValidator = (
  registries: ExtractedRegistries,
) => ValidationIssue[];
