// ENG-001B: Integrity Aggregator
//
// Collects results from all specialized validators and produces
// a unified ValidationSummary. Pure aggregation — no I/O, no CLI.
//
// Architecture: Aggregator knows nothing about presentation.
// It produces structured data; the Reporter layer handles formatting.
//
// Pure function — no I/O, no mutation, no side effects.

import type { ExtractedRegistries } from '../types/extracted-registries';
import type { ValidationIssue, ValidationCode, ValidationSummary } from './types/validation-issues';
import { referenceValidator } from './reference-validator';
import { cardinalityValidator } from './cardinality-validator';
import { chainValidator } from './chain-validator';
import { authorityValidator } from './authority-validator';

/**
 * All registered relationship validators.
 * Add new validators here to include them in the aggregation.
 */
const VALIDATORS = [
  referenceValidator,
  cardinalityValidator,
  chainValidator,
  authorityValidator,
] as const;

/**
 * Sorter: errors first, then warnings, then infos; within each group by code.
 */
function sortIssues(a: ValidationIssue, b: ValidationIssue): number {
  const severityOrder = { error: 0, warning: 1, info: 2 };
  const sevDiff = severityOrder[a.severity] - severityOrder[b.severity];
  if (sevDiff !== 0) return sevDiff;
  return a.code.localeCompare(b.code);
}

/**
 * Aggregate all validation results into a summary.
 *
 * Input: ExtractedRegistries (from Registry Extractor)
 * Output: ValidationSummary (pure data)
 *
 * Pure function — no I/O, no side effects.
 */
export function aggregateValidations(
  registries: ExtractedRegistries,
): ValidationSummary {
  // Run all validators
  const allIssues: ValidationIssue[] = [];
  for (const validator of VALIDATORS) {
    const issues = validator(registries);
    allIssues.push(...issues);
  }

  // Sort: errors first, then warnings, then infos
  allIssues.sort(sortIssues);

  // Compute counts
  let errors = 0;
  let warnings = 0;
  let infos = 0;
  const byCode: Record<string, number> = {};

  for (const issue of allIssues) {
    if (issue.severity === 'error') errors++;
    else if (issue.severity === 'warning') warnings++;
    else infos++;

    byCode[issue.code] = (byCode[issue.code] || 0) + 1;
  }

  return {
    validatedAt: new Date().toISOString(),
    totalIssues: allIssues.length,
    counts: { errors, warnings, infos },
    byCode: byCode as Record<ValidationCode, number>,
    issues: allIssues,
    passed: errors === 0,
  };
}
