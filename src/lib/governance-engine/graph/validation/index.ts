// ENG-001B: Relationship Validator — Module Barrel
export { aggregateValidations } from './aggregator';
export { referenceValidator } from './reference-validator';
export { cardinalityValidator } from './cardinality-validator';
export { chainValidator } from './chain-validator';
export { authorityValidator } from './authority-validator';
export { reportToJson, reportToMarkdown, reportToCli } from './reporter';
export type { RelationshipValidator } from './types/validator-interface';
export type { ValidationIssue, ValidationCode, ValidationSummary, ValidationSeverity } from './types/validation-issues';
export { VALIDATION_CODES } from './types/validation-issues';
