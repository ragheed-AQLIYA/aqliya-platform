// ─── LocalContentOS Workbook — Domain Types ───
// Phase 1: Workbook Population + Missing Data Collection only

import type { LcWorkbook, LcWorkbookLine, LcDataRequest, LcDataRequestItem } from "@prisma/client";

/** Workbook statuses */
export const VALID_WORKBOOK_STATUSES = [
  "draft",
  "populated",
  "partial",
  "complete",
  "exported",
] as const;
export type WorkbookStatus = (typeof VALID_WORKBOOK_STATUSES)[number];

/** Line data source */
export const VALID_LINE_SOURCES = ["tb", "manual", "formula"] as const;
export type LineSource = (typeof VALID_LINE_SOURCES)[number];

/** Confidence level */
export const VALID_CONFIDENCE = ["high", "medium", "low"] as const;
export type Confidence = (typeof VALID_CONFIDENCE)[number];

/** Data request statuses */
export const VALID_REQUEST_STATUSES = [
  "draft",
  "sent",
  "partially_received",
  "received",
  "closed",
] as const;
export type RequestStatus = (typeof VALID_REQUEST_STATUSES)[number];

/** Missing data item statuses */
export const VALID_ITEM_STATUSES = ["open", "fulfilled", "waived"] as const;
export type ItemStatus = (typeof VALID_ITEM_STATUSES)[number];

/** Missing data categories */
export const VALID_ITEM_CATEGORIES = [
  "financial_data",
  "evidence",
  "classification",
  "narrative",
] as const;
export type ItemCategory = (typeof VALID_ITEM_CATEGORIES)[number];

/** Workbook sections (from canonical template) */
export const WORKBOOK_SECTIONS = [
  "company_info",
  "revenue",
  "cost_of_sales",
  "gross_profit",
  "supplier_spend",
  "workforce",
  "assets",
  "declarations",
] as const;
export type WorkbookSection = (typeof WORKBOOK_SECTIONS)[number];

/** Account code range filter for TB matching */
export interface AccountCodeRange {
  /** Account code prefix to match (e.g., "4" for revenue, "3" for expenses) */
  prefix: string;
  /** Account code prefixes to exclude (e.g., ["1106"] to skip prepaid accounts) */
  excludePrefixes?: string[];
}

/** A single line definition for the canonical template */
export interface WorkbookTemplateLine {
  code: string;
  name: string;
  section: WorkbookSection;
  autoFillable: boolean;
  displayOrder: number;
  evidenceRequired: boolean;
  evidenceTypes?: string[];
  description?: string;
  tbAccountPatterns?: string[]; // Regex patterns to match TB account names
  /** Optional account code range filters to improve match precision */
  accountCodeRanges?: AccountCodeRange[];
  /**
   * Optional formula to derive value from other template lines.
   * Uses line codes as variables, supports +, -, *, /.
   * Example: "REV-03 - COS-03" for gross profit.
   * When set, autoFillable should also be true.
   */
  formula?: string;
}

/** Complete workbook template definition */
export interface WorkbookTemplate {
  version: string;
  lines: WorkbookTemplateLine[];
}

/** Population result */
export interface WorkbookPopulationResult {
  workbookId: string;
  totalLines: number;
  autoFilledLines: number;
  missingLines: number;
  completionPct: number;
  sectionStats: Record<string, { total: number; filled: number; pct: number }>;
}

/** Missing data detection result */
export interface MissingDataDetectionResult {
  workbookId: string;
  totalMissing: number;
  byCategory: Record<string, MissingCategoryGroup>;
  items: MissingDataItemView[];
}

export interface MissingCategoryGroup {
  category: string;
  count: number;
  label: string;
  items: MissingDataItemView[];
}

export interface MissingDataItemView {
  lineCode: string;
  lineName: string;
  section: string;
  fieldName: string;
  category: string;
  label: string;
  description: string;
  evidenceRequired: boolean;
  evidenceTypes: string[];
}

/** Workbook with lines (Prisma type alias) */
export type WorkbookWithLines = LcWorkbook & {
  lines: LcWorkbookLine[];
};

/** Data request with items */
export type DataRequestWithItems = LcDataRequest & {
  items: LcDataRequestItem[];
};

/** A single trial balance line for workbook population */
export interface TbLine {
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
}

/** Dashboard summary */
export interface WorkbookDashboardSummary {
  totalWorkbooks: number;
  byStatus: Record<string, number>;
  averageCompletion: number;
  totalMissing: number;
}

// ─── Local Content Scoring Types ───

/** Individual LC metric (e.g., Revenue Score, Workforce Score) */
export interface LcMetricResult {
  code: string;
  label: string;
  labelAr: string;
  /** The computed score as a percentage (0-100) */
  score: number | null;
  /** Numerator value used in computation */
  numerator: number | null;
  /** Denominator value used in computation */
  denominator: number | null;
  /** Factor weight for overall score (0-1) */
  weight: number;
  /** Human-readable explanation in Arabic */
  explanationAr: string;
}

/** Overall LC score result */
export interface LcScoreResult {
  /** Overall score (0-100) or null if no metrics have data */
  overallScore: number | null;
  /** Status label in Arabic */
  statusLabel: string;
  /** Individual metrics */
  metrics: LcMetricResult[];
  /** Timestamp of computation */
  computedAt: string;
  /** Human-readable summary in Arabic */
  summaryAr: string;
  /** Per-metric contribution to overall score */
  contributions?: LcMetricContribution[];
  /** Per-section data availability */
  sectionBreakdown?: LcSectionBreakdown[];
}

/** Per-metric contribution analysis */
export interface LcMetricContribution {
  code: string;
  labelAr: string;
  score: number | null;
  weight: number;
  effectiveWeight: number;
  contributionPct: number | null;
}

/** Per-section data availability */
export interface LcSectionBreakdown {
  section: string;
  labelAr: string;
  totalLines: number;
  filledLines: number;
  missingLines: number;
  fillPct: number;
}
