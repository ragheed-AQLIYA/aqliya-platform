/**
 * Persisted reporting graph constants — maps factory pipeline to Prisma entities.
 */

export const REPORTING_GRAPH_NODE_TYPES = {
  TB_ACCOUNT: "tb_account",
  CANONICAL_ACCOUNT: "canonical_account",
  MAPPING: "mapping",
  FS_STATEMENT: "fs_statement",
  FS_LINE: "fs_line",
  LEAD_SCHEDULE: "lead_schedule",
  LEAD_SCHEDULE_LINE: "lead_schedule_line",
  DISCLOSURE_NOTE: "disclosure_note",
  RECONCILIATION_CHECK: "reconciliation_check",
} as const;

export type PersistedGraphNodeType =
  (typeof REPORTING_GRAPH_NODE_TYPES)[keyof typeof REPORTING_GRAPH_NODE_TYPES];

export const REPORTING_GRAPH_EDGE_TYPES = {
  MAPS_TO: "MAPS_TO",
  ROLLS_UP_TO: "ROLLS_UP_TO",
  PRESENTS_AS: "PRESENTS_AS",
  SUPPORTS: "SUPPORTS",
  DISCLOSES: "DISCLOSES",
  RECONCILES: "RECONCILES",
} as const;

export type PersistedGraphEdgeType =
  (typeof REPORTING_GRAPH_EDGE_TYPES)[keyof typeof REPORTING_GRAPH_EDGE_TYPES];

export const REPORTING_GRAPH_ENTITY_TYPES = {
  TRIAL_BALANCE_LINE: "AuditTrialBalanceLine",
  CANONICAL_ACCOUNT: "AuditCanonicalAccount",
  ACCOUNT_MAPPING: "AuditAccountMapping",
  FINANCIAL_STATEMENT: "AuditFinancialStatement",
  FS_LINE: "FinancialStatementLine",
  LEAD_SCHEDULE: "LeadSchedule",
  LEAD_SCHEDULE_LINE: "LeadScheduleLine",
  DISCLOSURE_NOTE: "AuditDisclosureNote",
} as const;

export type PersistedGraphEntityType =
  (typeof REPORTING_GRAPH_ENTITY_TYPES)[keyof typeof REPORTING_GRAPH_ENTITY_TYPES];

/** Layer order for mind-map columns when reading persisted graph */
export const PERSISTED_NODE_LAYER: Record<string, number> = {
  tb_account: 2,
  mapping: 3,
  canonical_account: 3,
  fs_statement: 4,
  fs_line: 5,
  lead_schedule: 4,
  lead_schedule_line: 5,
  disclosure_note: 6,
  reconciliation_check: 5,
};
