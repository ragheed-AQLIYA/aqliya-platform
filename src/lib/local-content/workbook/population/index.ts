// ─── LocalContentOS Workbook — Population Engine Barrel ───

export {
  isAccountInCodeRange,
  deduplicateTbAccounts,
  aggregateTbValues,
  evaluateFormula,
  buildLinesData,
  computeSectionStatsFromLines,
  type LineValueMap,
  type BuildLinesDataResult,
  type SectionStatInput,
} from "./common";

export { populateWorkbookFromProject } from "./from-project";

export { populateWorkbookFromTb } from "./from-tb";

export {
  recalculateWorkbookStats,
  getWorkbookWithLines,
  updateWorkbookLineValue,
  listProjectWorkbooks,
  listOrganizationWorkbooks,
  deleteWorkbook,
} from "./crud";
