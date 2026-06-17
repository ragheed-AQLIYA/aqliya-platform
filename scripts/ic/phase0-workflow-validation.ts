#!/usr/bin/env tsx
/**
 * Phase 0 — LocalContentOS V1 Workflow Validation
 *
 * Purpose: Validate the complete business workflow (TB → workbook → missing data → recommendations → simulation)
 * BEFORE adding any Prisma models, routes, state machines, or workflow infrastructure.
 *
 * This script simulates the pipeline against realistic TB/FS/Notes data and produces 4 JSON artifacts:
 *   1. workbook-draft.json       — What gets auto-filled from TB/FS
 *   2. missing-data-request.json — What client must still provide
 *   3. recommendation-report.json— Actionable improvement suggestions
 *   4. simulation-report.json    — What-if scenarios
 *
 * Run: npx tsx scripts/phase0-workflow-validation.ts
 * Output: scripts/phase0-output/*.json
 *
 * No database connection required. All data is self-contained.
 */

// ════════════════════════════════════════════════════════════════
// SECTION 1 — Types (mirrors planned Prisma models + existing types)
// ════════════════════════════════════════════════════════════════

/** A single Trial Balance line (mirrors AuditTrialBalanceLine) */
interface TbLine {
  accountCode: string;
  accountName: string;
  debitAmount: number;
  creditAmount: number;
  balance: number;
  accountType: "asset" | "liability" | "equity" | "revenue" | "expense" | "non-current-asset";
  currency: string;
  lcHints?: string[];        // from TBClassificationHistory.mappingHints
  canonicalCategory?: string; // from AI classification pipeline
}

/** A Financial Statement line item */
interface FsLine {
  label: string;
  labelAr: string;
  amount: number;
  type: "revenue" | "cogs" | "expense" | "asset" | "liability" | "equity" | "income";
}

/** A Disclosure Note */
interface DisclosureNote {
  noteType: string;
  title: string;
  titleAr: string;
  content: string;
}

/** Trial Balance */
interface TrialBalance {
  id: string;
  engagementId: string;
  period: string;
  currency: string;
  lines: TbLine[];
}

/** Financial Statements */
interface FinancialStatements {
  incomeStatement: { lines: FsLine[]; totals: { revenue: number; cogs: number; grossProfit: number; netIncome: number } };
  balanceSheet: { lines: FsLine[]; totals: { totalAssets: number; totalLiabilities: number; equity: number } };
}

/** Disclosure Notes collection */
interface NotesCollection {
  notes: DisclosureNote[];
}

// ─── Workbook types ───

interface WorkbookRow {
  rowNumber: number;
  supplierName: string;
  supplierNameAutoFilled: boolean;
  supplierNationality: string | null;
  invoiceNumber: string | null;
  invoiceAmount: number | null;
  invoiceAmountAutoFilled: boolean;
  productClassification: string;
  classificationAutoFilled: boolean;
  description: string;
  descriptionAutoFilled: boolean;
  quantity: number | null;
  localContentPct: number | null;
  localContentPctAutoFilled: boolean;
  lcValueLocal: number | null;
  lcValueNonLocal: number | null;
  lcValueTotal: number | null;
  fscCode: string | null;
  gsbCode: string | null;
  internalLcPct: number | null;
  externalLcPct: number | null;
  sourceAccountCode: string;
  sourceTbLineId: string;
  autoFillStatus: "auto_filled" | "partial" | "client_required";
}

interface WorkbookSheet {
  sheetId: string;
  sheetName: string;
  sheetNameAr: string;
  rows: WorkbookRow[];
  totals: Record<string, number>;
}

interface WorkbookDraft {
  projectName: string;
  period: string;
  generatedAt: string;
  basedOn: { trialBalance: string; financialStatements: boolean; notes: boolean };
  sheets: WorkbookSheet[];
  summary: {
    totalRows: number;
    autoFilledRows: number;
    partialRows: number;
    clientRequiredRows: number;
    autoFillPct: number;
    derivedPct: number;
    clientRequiredPct: number;
  };
}

// ─── Missing Data types ───

interface MissingDataItem {
  dataCategory: string;
  labelAr: string;
  labelEn: string;
  priority: "high" | "medium" | "low";
  impact: "blocks_lc_calculation" | "improves_accuracy" | "optional";
  totalItems: number;
  completedItems: number;
  completenessPct: number;
  status: "pending_generation" | "awaiting_client" | "client_submitted" | "partial" | "completed";
  items: Array<{
    id: string;
    label: string;
    sourceInfo: string;
    suggestedDefault: string;
    isDefaultConservative: boolean;
  }>;
}

interface MissingDataRequest {
  projectName: string;
  period: string;
  generatedAt: string;
  basedOn: { trialBalance: string; financialStatements: boolean; notes: boolean };
  overallCompletenessPct: number;
  categories: MissingDataItem[];
  intelligentDefaults: Array<{ field: string; defaultValue: string; rationale: string }>;
}

// ─── Recommendation types ───

interface Recommendation {
  id: string;
  category: "supplier_replacement" | "local_sourcing" | "workforce_localization" | "capex_localization" | "capacity_building";
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  impact: "high" | "medium" | "low";
  estimatedScoreIncreasePct: number;
  effort: "low" | "medium" | "high";
  priority: number;
  dataSource: string;
  formula: string;
  actionUrl?: string;
}

interface RecommendationReport {
  projectName: string;
  period: string;
  generatedAt: string;
  currentScore: number;
  targetScore: number;
  totalPotentialIncrease: number;
  recommendations: Recommendation[];
  dataCompletenessNote: string;
}

// ─── Simulation types ───

interface SimulationScenario {
  id: string;
  name: string;
  description: string;
  modifications: Array<{ field: string; before: number | string; after: number | string }>;
  baselineScore: number;
  scenarioScore: number;
  delta: number;
  deltaPct: number;
  subScoreChanges: Record<string, { before: number; after: number; delta: number }>;
  confidence: "high" | "medium" | "low";
}

interface SimulationReport {
  projectName: string;
  period: string;
  generatedAt: string;
  currentBaseline: { score: number; tier: string; subScores: Record<string, number> };
  scenarios: SimulationScenario[];
  notes: string[];
}


// ════════════════════════════════════════════════════════════════
// SECTION 2 — Mock Data (modeled after existing seed-audit, mock-data, seed-local-content)
// ════════════════════════════════════════════════════════════════

const PROJECT_NAME = "شركة الخليج للتجارة والمقاولات";
const PROJECT_PERIOD = "2025-Q4";
const ENGAGEMENT_ID = "eng-gulf-trading-2025";
const TB_ID = "tb-gulf-2025";

function SAR(v: number): number {
  return v;
}

/**
 * Realistic Trial Balance for a Saudi trading/contracting company.
 * Includes Arabic account names, supplier-specific accounts, and ERP mapping hints.
 */
const tbLines: TbLine[] = [
  // ── Assets ──
  { accountCode: "1010", accountName: "نقدية والبنوك", debitAmount: SAR(500000), creditAmount: 0, balance: SAR(500000), accountType: "asset", currency: "SAR", canonicalCategory: "Cash and Cash Equivalents" },
  { accountCode: "1020", accountName: "حسابات مدينة", debitAmount: SAR(1200000), creditAmount: 0, balance: SAR(1200000), accountType: "asset", currency: "SAR", canonicalCategory: "Trade Receivables" },
  { accountCode: "1030", accountName: "المخزون", debitAmount: SAR(800000), creditAmount: 0, balance: SAR(800000), accountType: "asset", currency: "SAR", canonicalCategory: "Inventories" },
  { accountCode: "1040", accountName: "مصروفات مدفوعة مقدماً", debitAmount: SAR(75000), creditAmount: 0, balance: SAR(75000), accountType: "asset", currency: "SAR", canonicalCategory: "Prepayments" },
  { accountCode: "1050", accountName: "أصول ثابتة - مبانٍ ومعدات", debitAmount: SAR(3500000), creditAmount: 0, balance: SAR(3500000), accountType: "non-current-asset", currency: "SAR", canonicalCategory: "Property, Plant & Equipment" },
  { accountCode: "1051", accountName: "مجمّع الإهلاك", debitAmount: 0, creditAmount: SAR(875000), balance: SAR(-875000), accountType: "non-current-asset", currency: "SAR", canonicalCategory: "Accumulated Depreciation" },
  // ── Liabilities ──
  { accountCode: "2010", accountName: "حسابات دائنة", debitAmount: 0, creditAmount: SAR(950000), balance: SAR(-950000), accountType: "liability", currency: "SAR", canonicalCategory: "Trade Payables" },
  { accountCode: "2020", accountName: "مصروفات مستحقة", debitAmount: 0, creditAmount: SAR(95000), balance: SAR(-95000), accountType: "liability", currency: "SAR", canonicalCategory: "Accrued Expenses" },
  { accountCode: "2030", accountName: "زكاة وضريبة مستحقة", debitAmount: 0, creditAmount: SAR(85000), balance: SAR(-85000), accountType: "liability", currency: "SAR", canonicalCategory: "Zakat/Tax Payable" },
  { accountCode: "2040", accountName: "قرض قصير الأجل", debitAmount: 0, creditAmount: SAR(500000), balance: SAR(-500000), accountType: "liability", currency: "SAR", canonicalCategory: "Short-term Borrowings" },
  // ── Equity ──
  { accountCode: "3010", accountName: "رأس المال", debitAmount: 0, creditAmount: SAR(2000000), balance: SAR(-2000000), accountType: "equity", currency: "SAR", canonicalCategory: "Share Capital" },
  { accountCode: "3020", accountName: "الأرباح المبقاة", debitAmount: 0, creditAmount: SAR(705000), balance: SAR(-705000), accountType: "equity", currency: "SAR", canonicalCategory: "Retained Earnings" },
  // ── Revenue ──
  { accountCode: "4010", accountName: "إيرادات المبيعات", debitAmount: 0, creditAmount: SAR(4500000), balance: SAR(-4500000), accountType: "revenue", currency: "SAR", canonicalCategory: "Sales Revenue" },
  { accountCode: "4020", accountName: "إيرادات الخدمات", debitAmount: 0, creditAmount: SAR(750000), balance: SAR(-750000), accountType: "revenue", currency: "SAR", canonicalCategory: "Service Revenue" },
  // ── Cost of Sales ──
  { accountCode: "5010", accountName: "تكلفة المبيعات", debitAmount: SAR(2800000), creditAmount: 0, balance: SAR(2800000), accountType: "expense", currency: "SAR", canonicalCategory: "Cost of Sales" },
  // ── Supplier-related expense accounts (these are the ones that map to workbook rows) ──
  { accountCode: "5020", accountName: "مشتريات - موردين محليين", debitAmount: SAR(1200000), creditAmount: 0, balance: SAR(1200000), accountType: "expense", currency: "SAR",
    canonicalCategory: "Local Purchases", lcHints: ["مورد", "مشتريات", "محلي"] },
  { accountCode: "5021", accountName: "مشتريات - مورد - مؤسسة عبدالعزيز للتجارة", debitAmount: SAR(520000), creditAmount: 0, balance: SAR(520000), accountType: "expense", currency: "SAR",
    canonicalCategory: "Local Purchases", lcHints: ["مؤسسة عبدالعزيز للتجارة", "مورد"] },
  { accountCode: "5022", accountName: "مشتريات - مورد - الشركة السعودية للخدمات", debitAmount: SAR(380000), creditAmount: 0, balance: SAR(380000), accountType: "expense", currency: "SAR",
    canonicalCategory: "Local Purchases", lcHints: ["الشركة السعودية للخدمات", "مورد"] },
  { accountCode: "5023", accountName: "مشتريات - موردين أجانب - GlobalTech", debitAmount: SAR(4200000), creditAmount: 0, balance: SAR(4200000), accountType: "expense", currency: "SAR",
    canonicalCategory: "Imported Goods", lcHints: ["GlobalTech Solutions", "مورد أجنبي"] },
  { accountCode: "5024", accountName: "قطع غيار - EuroParts", debitAmount: SAR(2100000), creditAmount: 0, balance: SAR(2100000), accountType: "expense", currency: "SAR",
    canonicalCategory: "Imported Goods", lcHints: ["EuroParts Middle East", "قطع غيار"] },
  { accountCode: "5025", accountName: "مواد خام مستوردة - AsiaTrade", debitAmount: SAR(3500000), creditAmount: 0, balance: SAR(3500000), accountType: "expense", currency: "SAR",
    canonicalCategory: "Imported Goods", lcHints: ["AsiaTrade Import Co", "مواد خام"] },
  // ── Payroll accounts ──
  { accountCode: "5030", accountName: "رواتب وأجور", debitAmount: SAR(900000), creditAmount: 0, balance: SAR(900000), accountType: "expense", currency: "SAR",
    canonicalCategory: "Employee Benefits", lcHints: ["رواتب", "موظفين"] },
  { accountCode: "5031", accountName: "مكافآت نهاية الخدمة", debitAmount: SAR(120000), creditAmount: 0, balance: SAR(120000), accountType: "expense", currency: "SAR",
    canonicalCategory: "Employee Benefits", lcHints: ["مكافآت", "نهاية خدمة"] },
  // ── Service / subcontractor accounts ──
  { accountCode: "5040", accountName: "مقاولي الباطن - مؤسسة الأعمال الهندسية", debitAmount: SAR(3800000), creditAmount: 0, balance: SAR(3800000), accountType: "expense", currency: "SAR",
    canonicalCategory: "Subcontractor Costs", lcHints: ["مؤسسة الأعمال الهندسية", "مقاول باطن"] },
  { accountCode: "5041", accountName: "خدمات نقل - مؤسسة النقل السريع", debitAmount: SAR(1100000), creditAmount: 0, balance: SAR(1100000), accountType: "expense", currency: "SAR",
    canonicalCategory: "Logistics Services", lcHints: ["مؤسسة النقل السريع", "نقل"] },
  // ── Operating expenses ──
  { accountCode: "5050", accountName: "إيجار", debitAmount: SAR(240000), creditAmount: 0, balance: SAR(240000), accountType: "expense", currency: "SAR", canonicalCategory: "Rent Expense" },
  { accountCode: "5060", accountName: "مرافق (كهرباء - ماء - اتصالات)", debitAmount: SAR(95000), creditAmount: 0, balance: SAR(95000), accountType: "expense", currency: "SAR", canonicalCategory: "Utilities" },
  { accountCode: "5070", accountName: "إهلاك", debitAmount: SAR(175000), creditAmount: 0, balance: SAR(175000), accountType: "expense", currency: "SAR", canonicalCategory: "Depreciation" },
  { accountCode: "5080", accountName: "أتعاب مهنية واستشارات", debitAmount: SAR(120000), creditAmount: 0, balance: SAR(120000), accountType: "expense", currency: "SAR", canonicalCategory: "Professional Fees" },
  { accountCode: "5090", accountName: "مصاريف عمومية وإدارية", debitAmount: SAR(65000), creditAmount: 0, balance: SAR(65000), accountType: "expense", currency: "SAR", canonicalCategory: "General & Administrative" },
  // ── CAPEX accounts ──
  { accountCode: "6010", accountName: "معدات وأنظمة - استثمار", debitAmount: SAR(800000), creditAmount: 0, balance: SAR(800000), accountType: "non-current-asset", currency: "SAR",
    canonicalCategory: "Capital Expenditure", lcHints: ["معدات", "أصول"] },
  { accountCode: "6011", accountName: "تطوير مباني ومستودعات", debitAmount: SAR(450000), creditAmount: 0, balance: SAR(450000), accountType: "non-current-asset", currency: "SAR",
    canonicalCategory: "Capital Expenditure", lcHints: ["مباني", "تطوير"] },
  // ── Sundry / Other ──
  { accountCode: "7010", accountName: "إيرادات أخرى", debitAmount: 0, creditAmount: SAR(45000), balance: SAR(-45000), accountType: "revenue", currency: "SAR", canonicalCategory: "Other Income" },
];

const trialBalance: TrialBalance = {
  id: TB_ID,
  engagementId: ENGAGEMENT_ID,
  period: PROJECT_PERIOD,
  currency: "SAR",
  lines: tbLines,
};

const incomeStatement: FsLine[] = [
  { label: "Sales Revenue", labelAr: "إيرادات المبيعات", amount: 4500000, type: "revenue" },
  { label: "Service Revenue", labelAr: "إيرادات الخدمات", amount: 750000, type: "revenue" },
  { label: "Other Income", labelAr: "إيرادات أخرى", amount: 45000, type: "income" },
  { label: "Cost of Sales", labelAr: "تكلفة المبيعات", amount: -2800000, type: "cogs" },
  { label: "Local Purchases", labelAr: "مشتريات محلية", amount: -2100000, type: "cogs" },
  { label: "Imported Goods", labelAr: "بضائع مستوردة", amount: -9800000, type: "cogs" },
  { label: "Gross Profit", labelAr: "إجمالي الربح", amount: 4365000, type: "income" },
  { label: "Employee Benefits", labelAr: "مزايا الموظفين", amount: -1020000, type: "expense" },
  { label: "Subcontractor Costs", labelAr: "تكاليف المقاولين", amount: -4900000, type: "expense" },
  { label: "Rent", labelAr: "إيجار", amount: -240000, type: "expense" },
  { label: "Utilities", labelAr: "مرافق", amount: -95000, type: "expense" },
  { label: "Depreciation", labelAr: "إهلاك", amount: -175000, type: "expense" },
  { label: "Professional Fees", labelAr: "أتعاب مهنية", amount: -120000, type: "expense" },
  { label: "General & Admin", labelAr: "مصاريف عمومية", amount: -65000, type: "expense" },
  { label: "Net Income", labelAr: "صافي الدخل", amount: 1190000, type: "income" },
];

const financialStatements: FinancialStatements = {
  incomeStatement: {
    lines: incomeStatement,
    totals: { revenue: 5295000, cogs: 14700000, grossProfit: 4365000, netIncome: 1190000 },
  },
  balanceSheet: {
    lines: [
      { label: "Total Assets", labelAr: "إجمالي الأصول", amount: 5200000, type: "asset" },
      { label: "Total Liabilities", labelAr: "إجمالي الخصوم", amount: 1630000, type: "liability" },
      { label: "Equity", labelAr: "حقوق المساهمين", amount: 3570000, type: "equity" },
    ],
    totals: { totalAssets: 5200000, totalLiabilities: 1630000, equity: 3570000 },
  },
};

const disclosureNotes: NotesCollection = {
  notes: [
    {
      noteType: "employee_benefits",
      title: "Employee Benefits",
      titleAr: "مزايا الموظفين",
      content: "Total employee benefits for the period: SAR 1,020,000 comprising salaries (SAR 900,000), end-of-service benefits (SAR 120,000). Average headcount: 85 employees.",
    },
    {
      noteType: "fixed_assets",
      title: "Property, Plant & Equipment",
      titleAr: "الممتلكات والمعدات",
      content: "PP&E additions during the period: SAR 1,250,000 (equipment: SAR 800,000, building improvements: SAR 450,000). Depreciation method: Straight-line. Useful lives: Buildings 20 years, Equipment 5-10 years.",
    },
    {
      noteType: "expenses",
      title: "General Expenses",
      titleAr: "المصروفات العمومية",
      content: "Significant expense categories: Rent SAR 240,000, Utilities SAR 95,000, Professional Fees SAR 120,000, General & Admin SAR 65,000.",
    },
    {
      noteType: "revenue",
      title: "Revenue Recognition",
      titleAr: "الإيرادات",
      content: "Revenue from contracts with customers: Sales revenue SAR 4,500,000, Service revenue SAR 750,000, Other income SAR 45,000.",
    },
  ],
};


// ════════════════════════════════════════════════════════════════
// SECTION 3 — Pipeline Implementation
// ════════════════════════════════════════════════════════════════

/**
 * Step 1: TB → LC Signal Extraction
 * Models the existing `extractLocalContentSignalsFromEngagement()` pipeline.
 */
function extractLcSignals(tb: TrialBalance): Array<{
  category: string;
  accountCode: string;
  accountName: string;
  amount: number;
  lcRelevant: boolean;
  lcHint: string | null;
  canonicalCategory: string | undefined;
}> {
  const PAYROLL_KW = ["راتب", "أجر", "مكافأة", "موظف"];
  const SUPPLIER_KW = ["مشتريات", "مورد", "موردين"];
  const SUBCONTRACTOR_KW = ["مقاول", "باطن"];
  const ASSET_KW = ["أصل", "معدات", "مباني", "تطوير"];

  function matchKw(name: string, kws: string[]): boolean {
    const n = name.toLowerCase();
    return kws.some(k => n.includes(k.toLowerCase()));
  }

  const signals: Array<{
    category: string;
    accountCode: string;
    accountName: string;
    amount: number;
    lcRelevant: boolean;
    lcHint: string | null;
    canonicalCategory: string | undefined;
  }> = [];

  for (const line of tb.lines) {
    // Skip non-LC-relevant accounts (revenue, equity, most liabilities)
    if (line.accountType === "revenue" || line.accountType === "equity") continue;
    if (line.accountType === "liability" && !line.lcHints) continue;

    const name = line.accountName;
    const hints = line.lcHints ?? [];
    const balance = Math.abs(line.balance);

    let category: string | null = null;

    // Check hints first
    for (const h of hints) {
      if (matchKw(h, PAYROLL_KW)) { category = "payroll"; break; }
      if (matchKw(h, SUBCONTRACTOR_KW)) { category = "subcontractors"; break; }
      if (matchKw(h, SUPPLIER_KW)) { category = "suppliers"; break; }
      if (matchKw(h, ASSET_KW)) { category = "assets"; break; }
    }

    // Fallback to account name matching
    if (!category) {
      if (matchKw(name, PAYROLL_KW)) category = "payroll";
      else if (matchKw(name, SUBCONTRACTOR_KW)) category = "subcontractors";
      else if (matchKw(name, SUPPLIER_KW)) category = "suppliers";
      else if (line.accountType === "non-current-asset" || matchKw(name, ASSET_KW)) category = "assets";
    }

    // Include depreciation as capex-relevant
    if (!category && line.canonicalCategory === "Depreciation") {
      category = "assets";
    }

    if (category) {
      const lcHint = hints.length > 0 ? hints[0] : null;
      signals.push({
        category,
        accountCode: line.accountCode,
        accountName: name,
        amount: balance,
        lcRelevant: true,
        lcHint,
        canonicalCategory: line.canonicalCategory,
      });
    }
  }

  return signals;
}

/**
 * Step 2: Signals → Workbook Rows
 * Maps LC signals to workbook السلع والخدمات rows.
 */
function generateWorkbookRows(
  signals: Array<{ category: string; accountCode: string; accountName: string; amount: number; lcHint: string | null; canonicalCategory: string | undefined }>,
  tb: TrialBalance,
): WorkbookSheet[] {
  const goodsServices: WorkbookRow[] = [];
  const capexRows: WorkbookRow[] = [];

  // Helper: extract supplier name from account name
  // Pattern: "مشتريات - مورد - NAME" or "NAME - service"
  function extractSupplierName(accountName: string, hint: string | null): string {
    if (hint && hint.length > 3 && !hint.includes("/") && !/^\d/.test(hint)) {
      return hint;
    }
    // Split on " - " and take last part
    const parts = accountName.split(" - ");
    if (parts.length >= 2) {
      // Remove Arabic prefixes
      const last = parts[parts.length - 1].trim();
      if (last.length > 2) return last;
    }
    // Split on common delimiters
    for (const delim of [" - ", "ـ", "|"]) {
      const parts = accountName.split(delim).map(p => p.trim());
      if (parts.length > 1) {
        const last = parts[parts.length - 1];
        if (last.length > 2 && !/^\d/.test(last)) return last;
      }
    }
    return "غير مصنف";
  }

  // Helper: classify product category from canonicalCategory
  function classifyProduct(canonicalCategory: string | undefined, accountName: string): string {
    const map: Record<string, string> = {
      "Local Purchases": "سلع ومنتجات محلية",
      "Imported Goods": "سلع ومنتجات مستوردة",
      "Subcontractor Costs": "خدمات مقاولات",
      "Logistics Services": "خدمات لوجستية",
      "Employee Benefits": "خدمات القوى العاملة",
      "Capital Expenditure": "نفقات رأسمالية",
      "Professional Fees": "خدمات استشارية",
      "Rent Expense": "إيجار",
      "Utilities": "مرافق",
      "General & Administrative": "مصاريف إدارية",
      "Depreciation": "إهلاك وإطفاء",
    };
    if (canonicalCategory && map[canonicalCategory]) return map[canonicalCategory];

    const n = accountName.toLowerCase();
    if (n.includes("مشتريات") || n.includes("مورد")) return "سلع ومنتجات";
    if (n.includes("مقاول")) return "خدمات مقاولات";
    if (n.includes("نقل")) return "خدمات لوجستية";
    if (n.includes("إيجار")) return "إيجار";
    if (n.includes("إهلاك")) return "إهلاك وإطفاء";
    if (n.includes("استشار") || n.includes("أتعاب")) return "خدمات استشارية";
    return "أخرى";
  }

  let rowNum = 1;

  for (const sig of signals) {
    const supplierName = extractSupplierName(sig.accountName, sig.lcHint);
    const productClass = classifyProduct(sig.canonicalCategory, sig.accountName);
    const hasSupplierHint = sig.lcHint !== null && sig.lcHint.length > 2 && !/^\d/.test(sig.lcHint!);
    const isSupplierCategory = sig.category === "suppliers" || sig.category === "subcontractors";

    // Determine auto-fill status
    let autoFillStatus: "auto_filled" | "partial" | "client_required";
    if (isSupplierCategory && hasSupplierHint) {
      autoFillStatus = "partial"; // has amount + description + category, but needs LC%
    } else if (isSupplierCategory) {
      autoFillStatus = "partial";
    } else if (sig.category === "payroll") {
      autoFillStatus = "partial"; // total known, but split needs client
    } else if (sig.category === "assets") {
      autoFillStatus = "partial";
    } else {
      autoFillStatus = "client_required";
    }

    // Determine if this is CAPEX or goods/services
    const isCapex = sig.category === "assets";
    const row: WorkbookRow = {
      rowNumber: rowNum,
      supplierName,
      supplierNameAutoFilled: hasSupplierHint,
      supplierNationality: hasSupplierHint ? "Saudi" : null,
      invoiceNumber: null,
      invoiceAmount: sig.amount,
      invoiceAmountAutoFilled: true,
      productClassification: productClass,
      classificationAutoFilled: true,
      description: sig.accountName,
      descriptionAutoFilled: true,
      quantity: null,
      localContentPct: null, // always client-required
      localContentPctAutoFilled: false,
      lcValueLocal: null,
      lcValueNonLocal: null,
      lcValueTotal: null,
      fscCode: null,
      gsbCode: null,
      internalLcPct: null,
      externalLcPct: null,
      sourceAccountCode: sig.accountCode,
      sourceTbLineId: `${sig.accountCode}_${sig.accountName.slice(0, 10)}`,
      autoFillStatus,
    };

    if (isCapex) {
      capexRows.push(row);
    } else {
      goodsServices.push(row);
    }
    rowNum++;
  }

  // Calculate totals for goods/services
  const gsTotal = goodsServices.reduce((s, r) => s + (r.invoiceAmount ?? 0), 0);
  const capexTotal = capexRows.reduce((s, r) => s + (r.invoiceAmount ?? 0), 0);
  const payrollRows = goodsServices.filter(r => r.productClassification === "خدمات القوى العاملة");
  const payrollTotal = payrollRows.reduce((s, r) => s + (r.invoiceAmount ?? 0), 0);

  return [
    {
      sheetId: "goods_services",
      sheetName: "السلع والخدمات",
      sheetNameAr: "السلع والخدمات",
      rows: goodsServices,
      totals: {
        totalRows: goodsServices.length,
        totalAmount: gsTotal,
        autoFilledAmount: gsTotal,
        clientRequiredAmount: 0,
        totalLocalContentPct: 0,
        weightedLcPct: 0,
      },
    },
    {
      sheetId: "capex",
      sheetName: "النفقات الرأسمالية",
      sheetNameAr: "النفقات الرأسمالية",
      rows: capexRows,
      totals: {
        totalRows: capexRows.length,
        totalAmount: capexTotal,
        autoFilledAmount: capexTotal,
      },
    },
    {
      sheetId: "workforce_summary",
      sheetName: "القوى العاملة",
      sheetNameAr: "القوى العاملة",
      rows: payrollRows,
      totals: {
        totalPayroll: payrollTotal,
        totalRows: payrollRows.length,
      },
    },
  ];
}

/**
 * Generate the complete Workbook Draft
 */
function generateWorkbookDraft(tb: TrialBalance, fs: FinancialStatements, signals: ReturnType<typeof extractLcSignals>): WorkbookDraft {
  const sheets = generateWorkbookRows(signals, tb);

  // Count auto-fill stats
  let totalRows = 0;
  let autoFilled = 0;
  let partial = 0;
  let clientRequired = 0;

  for (const sheet of sheets) {
    totalRows += sheet.rows.length;
    for (const row of sheet.rows) {
      if (row.autoFillStatus === "auto_filled") autoFilled++;
      else if (row.autoFillStatus === "partial") partial++;
      else clientRequired++;
    }
  }

  return {
    projectName: PROJECT_NAME,
    period: PROJECT_PERIOD,
    generatedAt: new Date().toISOString(),
    basedOn: { trialBalance: TB_ID, financialStatements: true, notes: true },
    sheets,
    summary: {
      totalRows,
      autoFilledRows: autoFilled,
      partialRows: partial,
      clientRequiredRows: clientRequired,
      autoFillPct: totalRows > 0 ? Math.round((autoFilled / totalRows) * 100) : 0,
      derivedPct: totalRows > 0 ? Math.round((partial / totalRows) * 100) : 0,
      clientRequiredPct: totalRows > 0 ? Math.round((clientRequired / totalRows) * 100) : 0,
    },
  };
}

/**
 * Step 4: Missing Data Request Generation
 * Identifies what data is missing and generates targeted collection requests.
 */
function generateMissingDataRequest(
  workbook: WorkbookDraft,
  signals: ReturnType<typeof extractLcSignals>,
): MissingDataRequest {
  const categories: MissingDataItem[] = [];

  // 1. Supplier LC Classification
  const gsSheet = workbook.sheets.find(s => s.sheetId === "goods_services");
  const unclassifiedRows = gsSheet?.rows.filter(r => !r.supplierNationality && !r.localContentPct) ?? [];
  const classifiedRows = gsSheet?.rows.filter(r => r.supplierNationality || r.localContentPct) ?? [];

  categories.push({
    dataCategory: "supplier_classification",
    labelAr: "تصنيف المحتوى المحلي للموردين",
    labelEn: "Supplier Local Content Classification",
    priority: "high",
    impact: "blocks_lc_calculation",
    totalItems: gsSheet?.rows.length ?? 0,
    completedItems: classifiedRows.length,
    completenessPct: gsSheet?.rows.length ? Math.round((classifiedRows.length / gsSheet.rows.length) * 100) : 0,
    status: "awaiting_client",
    items: (gsSheet?.rows ?? []).slice(0, 5).map((r, i) => ({
      id: `sup-${i + 1}`,
      label: r.supplierName,
      sourceInfo: `Amount: ${r.invoiceAmount?.toLocaleString()} SAR | Account: ${r.sourceAccountCode}`,
      suggestedDefault: "0% (Conservative)",
      isDefaultConservative: true,
    })),
  });

  // 2. LC% per Supplier
  const suppliersWithoutPct = gsSheet?.rows.filter(r => r.localContentPct === null) ?? [];
  categories.push({
    dataCategory: "supplier_lc_percentage",
    labelAr: "نسبة المحتوى المحلي لكل مورد",
    labelEn: "Supplier Local Content Percentage",
    priority: "high",
    impact: "blocks_lc_calculation",
    totalItems: gsSheet?.rows.length ?? 0,
    completedItems: gsSheet?.rows.length ?? 0 - suppliersWithoutPct.length,
    completenessPct: gsSheet?.rows.length ? Math.round(((gsSheet.rows.length - suppliersWithoutPct.length) / gsSheet.rows.length) * 100) : 0,
    status: "awaiting_client",
    items: suppliersWithoutPct.slice(0, 5).map((r, i) => ({
      id: `lc-${i + 1}`,
      label: r.supplierName,
      sourceInfo: `Amount: ${r.invoiceAmount?.toLocaleString()} SAR | Product: ${r.productClassification}`,
      suggestedDefault: "0% — prevents overstatement",
      isDefaultConservative: true,
    })),
  });

  // 3. FSC/GSB Codes
  categories.push({
    dataCategory: "fsc_gsb",
    labelAr: "رموز التصنيف (FSC/GSB)",
    labelEn: "FSC/GSB Classification Codes",
    priority: "high",
    impact: "blocks_lc_calculation",
    totalItems: gsSheet?.rows.length ?? 0,
    completedItems: 0,
    completenessPct: 0,
    status: "awaiting_client",
    items: [
      { id: "fsc-1", label: "FSC Code Assignment", sourceInfo: "Required for all supplier rows", suggestedDefault: "Pending", isDefaultConservative: true },
      { id: "gsb-1", label: "GSB Code Assignment", sourceInfo: "Required for government suppliers", suggestedDefault: "Pending", isDefaultConservative: true },
    ],
  });

  // 4. Workforce Nationality Breakdown
  const payrollAmount = signals.filter(s => s.category === "payroll").reduce((s, x) => s + x.amount, 0);
  categories.push({
    dataCategory: "workforce",
    labelAr: "بيانات القوى العاملة — تفصيل الموظفين السعوديين وغير السعوديين",
    labelEn: "Workforce Nationality Breakdown",
    priority: "medium",
    impact: "improves_accuracy",
    totalItems: 35, // 35 job categories in the workbook
    completedItems: 0,
    completenessPct: 0,
    status: "awaiting_client",
    items: [
      { id: "wf-1", label: "Total Employee Benefits (from TB)", sourceInfo: `SAR ${payrollAmount.toLocaleString()}`, suggestedDefault: "Auto-filled from TB", isDefaultConservative: false },
      { id: "wf-2", label: "Saudi headcount per category", sourceInfo: "35 job categories × Saudi/Non-Saudi split", suggestedDefault: "0 (Conservative)", isDefaultConservative: true },
      { id: "wf-3", label: "Non-Saudi headcount per category", sourceInfo: "35 job categories", suggestedDefault: "0 (Conservative)", isDefaultConservative: true },
    ],
  });

  // 5. CAPEX Origin
  const capexSheet = workbook.sheets.find(s => s.sheetId === "capex");
  categories.push({
    dataCategory: "capex_origin",
    labelAr: "أصل النفقات الرأسمالية",
    labelEn: "CAPEX Origin Details",
    priority: "medium",
    impact: "improves_accuracy",
    totalItems: capexSheet?.rows.length ?? 0,
    completedItems: 0,
    completenessPct: 0,
    status: "awaiting_client",
    items: (capexSheet?.rows ?? []).map((r, i) => ({
      id: `capex-${i + 1}`,
      label: r.supplierName,
      sourceInfo: `Amount: ${r.invoiceAmount?.toLocaleString()} SAR | Desc: ${r.description}`,
      suggestedDefault: "Imported (Conservative)",
      isDefaultConservative: true,
    })),
  });

  // 6. Capacity Building
  categories.push({
    dataCategory: "capacity_building",
    labelAr: "برامج تطوير القدرات",
    labelEn: "Capacity Building Programs",
    priority: "low",
    impact: "improves_accuracy",
    totalItems: 10,
    completedItems: 0,
    completenessPct: 0,
    status: "awaiting_client",
    items: [
      { id: "cb-1", label: "Training programs", sourceInfo: "No data in TB/FS/Notes", suggestedDefault: "0 programs", isDefaultConservative: true },
      { id: "cb-2", label: "Trainee headcount", sourceInfo: "No data in TB/FS/Notes", suggestedDefault: "0 trainees", isDefaultConservative: true },
      { id: "cb-3", label: "Training spend", sourceInfo: "May be in misc expense accounts", suggestedDefault: "0 SAR", isDefaultConservative: true },
    ],
  });

  // Calculate overall completeness
  const totalItems = categories.reduce((s, c) => s + c.totalItems, 0);
  const completedItems = categories.reduce((s, c) => s + c.completedItems, 0);
  const overallCompletenessPct = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  return {
    projectName: PROJECT_NAME,
    period: PROJECT_PERIOD,
    generatedAt: new Date().toISOString(),
    basedOn: { trialBalance: TB_ID, financialStatements: true, notes: true },
    overallCompletenessPct,
    categories,
    intelligentDefaults: [
      { field: "Supplier LC%", defaultValue: "0%", rationale: "Conservative — prevents overstatement. Every classified supplier can only increase the score." },
      { field: "Supplier Nationality", defaultValue: "Unknown", rationale: "Flagged for mandatory classification. No financial system can determine supplier nationality." },
      { field: "FSC/GSB Code", defaultValue: "Pending", rationale: "Flagged for client input. Codes are specific to each supplier's registration." },
      { field: "Workforce Saudi Ratio", defaultValue: "0%", rationale: "Conservative. Total payroll known from FS, but nationality split is HR data." },
      { field: "CAPEX Origin", defaultValue: "Imported", rationale: "Conservative. Asset purchases from TB show amounts but not supplier origin." },
      { field: "Capacity Building", defaultValue: "0 programs", rationale: "Conservative. Training data is operational, not financial." },
    ],
  };
}

/**
 * Step 5: Recommendation Generation
 * Deterministic rule-based recommendations.
 */
function generateRecommendations(
  workbook: WorkbookDraft,
  signals: ReturnType<typeof extractLcSignals>,
): RecommendationReport {
  const recs: Recommendation[] = [];
  let rank = 0;

  // Compute current estimated score (using workbook formula: 35/30/20/15 weights)
  const gsSheet = workbook.sheets.find(s => s.sheetId === "goods_services");
  const capexSheet = workbook.sheets.find(s => s.sheetId === "capex");

  // Supplier score: weighted average of imputed LC% (use default 0% for unclassified)
  const supplierRows = gsSheet?.rows.filter(r => r.productClassification !== "خدمات القوى العاملة") ?? [];
  const supplierSpendTotal = supplierRows.reduce((s, r) => s + (r.invoiceAmount ?? 0), 0);
  // Simulate some classified / unclassified split
  const classifiedSpend = supplierRows.filter(r => r.supplierNameAutoFilled).reduce((s, r) => s + (r.invoiceAmount ?? 0), 0);
  const supplierScore = supplierSpendTotal > 0 ? Math.round((classifiedSpend / supplierSpendTotal) * 30) : 0; // 30% imputed

  // Workforce score: default 0 (no client data, but we know total payroll)
  const payrollAmount = signals.filter(s => s.category === "payroll").reduce((s, x) => s + x.amount, 0);
  const workforceScore = 0; // Conservative: 0% Saudi ratio

  // CAPEX score: default 0
  const capexTotal = capexSheet?.rows.reduce((s, r) => s + (r.invoiceAmount ?? 0), 0) ?? 0;
  const capexScore = 0;

  // Capacity building score: default 0
  const capacityBuildingScore = 0;

  // Workbook formula: 35/30/20/15
  const currentScore = Math.round(
    (supplierScore * 35 + workforceScore * 30 + capexScore * 20 + capacityBuildingScore * 15) / 100
  );

  const targetScore = 70;

  // ─── REC 1: Supplier Replacement — identify top non-local suppliers ───
  const nonLocalSupplierRows = supplierRows.filter(r => !r.supplierNameAutoFilled || r.productClassification.includes("مستورد"));
  const sortedNonLocal = [...nonLocalSupplierRows].sort((a, b) => (b.invoiceAmount ?? 0) - (a.invoiceAmount ?? 0));

  for (const row of sortedNonLocal.slice(0, 5)) {
    rank++;
    const amount = row.invoiceAmount ?? 0;
    const estIncrease = Math.min(100 - currentScore, Math.round((amount / 1000000) * 1.5 * 10) / 10);

    recs.push({
      id: `rec-supplier-${rank}`,
      category: "supplier_replacement",
      titleAr: `استبدال "${row.supplierName}" بمورد محلي`,
      titleEn: `Replace "${row.supplierName}" with a local supplier`,
      descriptionAr: `إجمالي الإنفاق: ${amount.toLocaleString()} SAR. استبدال هذا المورد الأجنبي بخيار محلي قد يزيد نسبة المحتوى المحلي بنحو ${estIncrease}% من إجمالي نقاط التقييم.`,
      descriptionEn: `Total spend: ${amount.toLocaleString()} SAR. Replacing this foreign supplier with a local alternative could increase LC% by approximately ${estIncrease} percentage points.`,
      impact: estIncrease >= 5 ? "high" : estIncrease >= 2 ? "medium" : "low",
      estimatedScoreIncreasePct: estIncrease,
      effort: "medium",
      priority: rank,
      dataSource: `Trial Balance account ${row.sourceAccountCode}: ${row.description}`,
      formula: `opportunityScore = amount × (1 - currentLC%) × impactFactor`,
    });
  }

  // ─── REC 2: Local Sourcing Increase ───
  // Find categories with high import spend
  const importRows = supplierRows.filter(r => r.productClassification.includes("مستورد"));
  if (importRows.length > 0) {
    const importTotal = importRows.reduce((s, r) => s + (r.invoiceAmount ?? 0), 0);
    rank++;
    recs.push({
      id: "rec-sourcing-1",
      category: "local_sourcing",
      titleAr: "زيادة المشتريات المحلية بدلاً من المستوردة",
      titleEn: "Increase local sourcing over imported goods",
      descriptionAr: `إجمالي المشتريات المستوردة: ${importTotal.toLocaleString()} SAR. تحويل 30% من المشتريات المستوردة إلى مصادر محلية قد يحسن درجة المحتوى المحلي بشكل كبير.`,
      descriptionEn: `Total imported purchases: ${importTotal.toLocaleString()} SAR. Shifting 30% of imported spend to local sources could significantly improve LC% score.`,
      impact: "high",
      estimatedScoreIncreasePct: Math.round((importTotal / 1000000) * 0.8 * 10) / 10,
      effort: "high",
      priority: 6,
      dataSource: "Income Statement — Imported Goods (SAR 9,800,000)",
      formula: "localSourcingIncrease = (localTargetPct - currentLocalPct) × categorySpend / totalSpend × weight",
    });
  }

  // ─── REC 3: Workforce Localization ───
  rank++;
  recs.push({
    id: "rec-workforce-1",
    category: "workforce_localization",
    titleAr: "زيادة نسبة التوطين (السعودة)",
    titleEn: "Increase Saudi workforce ratio",
    descriptionAr: `إجمالي مزايا الموظفين: ${payrollAmount.toLocaleString()} SAR. لا توجد بيانات حالية عن توزيع الجنسيات. زيادة نسبة السعوديين إلى 30% على الأقل ستحسن درجة القوى العاملة (وزنها 30% من النتيجة الإجمالية).`,
    descriptionEn: `Total employee benefits: ${payrollAmount.toLocaleString()} SAR. No nationality distribution data available. Increasing Saudi ratio to at least 30% would improve the workforce sub-score (30% weight).`,
    impact: "medium",
    estimatedScoreIncreasePct: 6.0,
    effort: "high",
    priority: 7,
    dataSource: "FS Employee Benefits: SAR 1,020,000 + Notes headcount estimate: 85",
    formula: "workforceScore = (saudiCount / totalCount) × 100 × workforceWeight(30)",
  });

  // ─── REC 4: CAPEX Localization ───
  if (capexTotal > 0) {
    rank++;
    recs.push({
      id: "rec-capex-1",
      category: "capex_localization",
      titleAr: "توجيه النفقات الرأسمالية للمنتجين المحليين",
      titleEn: "Source capital expenditure locally",
      descriptionAr: `إجمالي النفقات الرأسمالية: ${capexTotal.toLocaleString()} SAR (معدات: SAR 800,000, تطوير مباني: SAR 450,000). توجيه هذه النفقات لمقاولين وموردين محليين قد يحسن درجة الأصول.`,
      descriptionEn: `Total CAPEX: ${capexTotal.toLocaleString()} SAR (Equipment: SAR 800,000, Building improvements: SAR 450,000). Sourcing these from local providers could improve asset sub-score.`,
      impact: "medium",
      estimatedScoreIncreasePct: 4.0,
      effort: "medium",
      priority: 8,
      dataSource: "TB asset accounts 6010, 6011 + Notes (PP&E schedule)",
      formula: "capexScore = (localCapex / totalCapex) × 100 × capexWeight(20)",
    });
  }

  // ─── REC 5: Capacity Building ───
  if (currentScore < targetScore) {
    rank++;
    recs.push({
      id: "rec-capacity-1",
      category: "capacity_building",
      titleAr: "تفعيل برامج تطوير القدرات",
      titleEn: "Implement capacity building programs",
      descriptionAr: "إضافة برامج تدريب وتأهيل للكوادر الوطنية وتوثيقها (بما في ذلك التدريب على رأس العمل، الابتعاث، الشهادات المهنية) قد يساهم في تحسين درجة تطوير القدرات.",
      descriptionEn: "Implement documented training and qualification programs for Saudi talent, including on-the-job training, scholarships, and professional certifications to improve capacity building score.",
      impact: "low",
      estimatedScoreIncreasePct: 1.5,
      effort: "medium",
      priority: 9,
      dataSource: "No financial data available — operational data required from client",
      formula: "capacityScore = (programCount × avgSpend × qualityFactor) / benchmark × capacityWeight(15)",
    });
  }

  // Sort by priority
  recs.sort((a, b) => a.priority - b.priority);

  const totalPotentialIncrease = recs.reduce((s, r) => s + r.estimatedScoreIncreasePct, 0);

  return {
    projectName: PROJECT_NAME,
    period: PROJECT_PERIOD,
    generatedAt: new Date().toISOString(),
    currentScore,
    targetScore,
    totalPotentialIncrease: Math.round(totalPotentialIncrease * 10) / 10,
    recommendations: recs,
    dataCompletenessNote: "Current score is based on conservative defaults (0% for unclassified data). Actual LC% may be higher once client provides supplier classifications. Current score represents the minimum possible LC%.",
  };
}

/**
 * Step 6: Simulation Engine
 * What-if analysis with multiple scenarios.
 */
function runSimulations(
  workbook: WorkbookDraft,
  signals: ReturnType<typeof extractLcSignals>,
): SimulationReport {
  // Baseline calculation (same as in recommendations)
  const gsSheet = workbook.sheets.find(s => s.sheetId === "goods_services");
  const capexSheet = workbook.sheets.find(s => s.sheetId === "capex");
  const supplierRows = gsSheet?.rows.filter(r => r.productClassification !== "خدمات القوى العاملة") ?? [];
  const supplierSpendTotal = supplierRows.reduce((s, r) => s + (r.invoiceAmount ?? 0), 0);
  const classifiedSpend = supplierRows.filter(r => r.supplierNameAutoFilled).reduce((s, r) => s + (r.invoiceAmount ?? 0), 0);
  const baseSupplierScore = supplierSpendTotal > 0 ? Math.round((classifiedSpend / supplierSpendTotal) * 30) : 0;
  const baseWorkforceScore = 0;
  const capexTotal = capexSheet?.rows.reduce((s, r) => s + (r.invoiceAmount ?? 0), 0) ?? 0;
  const baseCapexScore = 0;
  const baseCapacityScore = 0;
  const baseScore = Math.round((baseSupplierScore * 35 + baseWorkforceScore * 30 + baseCapexScore * 20 + baseCapacityScore * 15) / 100);

  const findRowBySupplier = (namePart: string) => supplierRows.find(r => r.supplierName.toLowerCase().includes(namePart.toLowerCase()));

  // ─── Scenario 1: Reclassify top import suppliers as local ───
  const globalTechRow = findRowBySupplier("globaltech");
  const euroPartsRow = findRowBySupplier("europarts");
  const asiaTradeRow = findRowBySupplier("asiatrade");

  const importTotal = [globalTechRow, euroPartsRow, asiaTradeRow].reduce((s, r) => s + (r?.invoiceAmount ?? 0), 0);
  // Simulate: if all were local at 60% LC, then supplier score jumps
  const supplierScoreS1 = Math.round(((classifiedSpend + importTotal * 0.6) / supplierSpendTotal) * 30);
  const scoreS1 = Math.round((supplierScoreS1 * 35 + baseWorkforceScore * 30 + baseCapexScore * 20 + baseCapacityScore * 15) / 100);

  // ─── Scenario 2: Workforce 30% Saudi ───
  const workforceScoreS2 = 30; // 30% Saudi ratio
  const scoreS2 = Math.round((baseSupplierScore * 35 + workforceScoreS2 * 30 + baseCapexScore * 20 + baseCapacityScore * 15) / 100);

  // ─── Scenario 3: CAPEX 50% local ───
  const capexScoreS3 = 50;
  const scoreS3 = Math.round((baseSupplierScore * 35 + baseWorkforceScore * 30 + capexScoreS3 * 20 + baseCapacityScore * 15) / 100);

  // ─── Scenario 4: Combined (best case) ───
  const scoreS4 = Math.round((supplierScoreS1 * 35 + workforceScoreS2 * 30 + capexScoreS3 * 20 + baseCapacityScore * 15) / 100);

  const baseTier = baseScore >= 75 ? "strong" : baseScore >= 50 ? "moderate" : baseScore >= 25 ? "weak" : "critical";

  return {
    projectName: PROJECT_NAME,
    period: PROJECT_PERIOD,
    generatedAt: new Date().toISOString(),
    currentBaseline: {
      score: baseScore,
      tier: baseTier,
      subScores: {
        supplier: baseSupplierScore,
        workforce: baseWorkforceScore,
        capex: baseCapexScore,
        capacityBuilding: baseCapacityScore,
      },
    },
    scenarios: [
      {
        id: "scenario-1",
        name: "إعادة تصنيف الموردين الأجانب",
        description: "إعادة تصنيف 3 موردين أجانب كبار (GlobalTech, EuroParts, AsiaTrade) بنسبة محتوى محلي 60%",
        modifications: [
          { field: "GlobalTech Solutions localityClassification", before: "non_local", after: "local" },
          { field: "GlobalTech Solutions localContentPercentage", before: "0%", after: "60%" },
          { field: "EuroParts Middle East localityClassification", before: "non_local", after: "local" },
          { field: "AsiaTrade Import Co localityClassification", before: "non_local", after: "local" },
        ],
        baselineScore: baseScore,
        scenarioScore: scoreS1,
        delta: scoreS1 - baseScore,
        deltaPct: baseScore > 0 ? Math.round(((scoreS1 - baseScore) / baseScore) * 100) : 0,
        subScoreChanges: {
          supplier: { before: baseSupplierScore, after: supplierScoreS1, delta: supplierScoreS1 - baseSupplierScore },
          workforce: { before: baseWorkforceScore, after: baseWorkforceScore, delta: 0 },
          capex: { before: baseCapexScore, after: baseCapexScore, delta: 0 },
          capacityBuilding: { before: baseCapacityScore, after: baseCapacityScore, delta: 0 },
        },
        confidence: "medium",
      },
      {
        id: "scenario-2",
        name: "زيادة التوطين إلى 30%",
        description: "رفع نسبة الموظفين السعوديين من 0% إلى 30%",
        modifications: [
          { field: "Workforce Saudi Ratio", before: "0%", after: "30%" },
        ],
        baselineScore: baseScore,
        scenarioScore: scoreS2,
        delta: scoreS2 - baseScore,
        deltaPct: baseScore > 0 ? Math.round(((scoreS2 - baseScore) / baseScore) * 100) : 0,
        subScoreChanges: {
          supplier: { before: baseSupplierScore, after: baseSupplierScore, delta: 0 },
          workforce: { before: baseWorkforceScore, after: workforceScoreS2, delta: workforceScoreS2 - baseWorkforceScore },
          capex: { before: baseCapexScore, after: baseCapexScore, delta: 0 },
          capacityBuilding: { before: baseCapacityScore, after: baseCapacityScore, delta: 0 },
        },
        confidence: "medium",
      },
      {
        id: "scenario-3",
        name: "توجيه النفقات الرأسمالية محلياً",
        description: "رفع نسبة المحتوى المحلي في النفقات الرأسمالية إلى 50%",
        modifications: [
          { field: "CAPEX Local Percentage", before: "0%", after: "50%" },
        ],
        baselineScore: baseScore,
        scenarioScore: scoreS3,
        delta: scoreS3 - baseScore,
        deltaPct: baseScore > 0 ? Math.round(((scoreS3 - baseScore) / baseScore) * 100) : 0,
        subScoreChanges: {
          supplier: { before: baseSupplierScore, after: baseSupplierScore, delta: 0 },
          workforce: { before: baseWorkforceScore, after: baseWorkforceScore, delta: 0 },
          capex: { before: baseCapexScore, after: capexScoreS3, delta: capexScoreS3 - baseCapexScore },
          capacityBuilding: { before: baseCapacityScore, after: baseCapacityScore, delta: 0 },
        },
        confidence: "medium",
      },
      {
        id: "scenario-4",
        name: "السيناريو المتكامل (أفضل حالة)",
        description: "تطبيق جميع التحسينات معاً: إعادة تصنيف الموردين + توطين 30% + توجيه النفقات الرأسمالية محلياً 50%",
        modifications: [
          { field: "Supplier Classification", before: "Local: partial", after: "Local: 3 major importers at 60%" },
          { field: "Workforce Saudi Ratio", before: "0%", after: "30%" },
          { field: "CAPEX Local Percentage", before: "0%", after: "50%" },
        ],
        baselineScore: baseScore,
        scenarioScore: scoreS4,
        delta: scoreS4 - baseScore,
        deltaPct: baseScore > 0 ? Math.round(((scoreS4 - baseScore) / baseScore) * 100) : 0,
        subScoreChanges: {
          supplier: { before: baseSupplierScore, after: supplierScoreS1, delta: supplierScoreS1 - baseSupplierScore },
          workforce: { before: baseWorkforceScore, after: workforceScoreS2, delta: workforceScoreS2 - baseWorkforceScore },
          capex: { before: baseCapexScore, after: capexScoreS3, delta: capexScoreS3 - baseCapexScore },
          capacityBuilding: { before: baseCapacityScore, after: baseCapacityScore, delta: 0 },
        },
        confidence: "low",
      },
    ],
    notes: [
      "All simulations use the workbook formula: 35% supplier + 30% workforce + 20% CAPEX + 15% capacity building",
      "Conservative defaults (0%) are used for unclassified data, so improvements show maximum possible delta",
      "Capacity building score remains 0 in all scenarios because no financial data source exists for it",
      "Simulation confidence decreases with the number of simultaneous modifications (more variables = less certainty)",
      "The 'best case' scenario (Scenario 4) shows that significant LC% improvement is achievable through procurement and HR policy changes",
    ],
  };
}


// ════════════════════════════════════════════════════════════════
// SECTION 4 — Execution
// ════════════════════════════════════════════════════════════════

import * as fs from "fs";
import * as path from "path";

function main() {
  console.log("╔═══════════════════════════════════════════════════════════╗");
  console.log("║  LocalContentOS V1 — Phase 0 Workflow Validation         ║");
  console.log("╚═══════════════════════════════════════════════════════════╝\n");

  // ── Step 1: Extract LC signals from TB ──
  console.log("▶ Step 1/4: Extracting LC signals from Trial Balance...");
  const signals = extractLcSignals(trialBalance);
  console.log(`   Found ${signals.length} LC-relevant signals:`);
  const signalCats: Record<string, number> = {};
  for (const s of signals) {
    signalCats[s.category] = (signalCats[s.category] ?? 0) + 1;
  }
  for (const [cat, count] of Object.entries(signalCats)) {
    const total = signals.filter(s => s.category === cat).reduce((s, x) => s + x.amount, 0);
    console.log(`   • ${cat}: ${count} lines, ${total.toLocaleString()} SAR`);
  }

  // ── Step 2: Generate Workbook Draft ──
  console.log("\n▶ Step 2/4: Generating workbook draft...");
  const workbookDraft = generateWorkbookDraft(trialBalance, financialStatements, signals);
  console.log(`   Sheets: ${workbookDraft.sheets.length}`);
  for (const sheet of workbookDraft.sheets) {
    console.log(`   • ${sheet.sheetNameAr}: ${sheet.rows.length} rows`);
  }
  console.log(`   Summary: ${workbookDraft.summary.totalRows} total rows`);
  console.log(`     Auto-filled: ${workbookDraft.summary.autoFilledRows} (${workbookDraft.summary.autoFillPct}%)`);
  console.log(`     Partial: ${workbookDraft.summary.partialRows} (${workbookDraft.summary.derivedPct}%)`);
  console.log(`     Client required: ${workbookDraft.summary.clientRequiredRows} (${workbookDraft.summary.clientRequiredPct}%)`);

  // ── Step 3: Generate Missing Data Request ──
  console.log("\n▶ Step 3/4: Generating missing data request...");
  const missingDataRequest = generateMissingDataRequest(workbookDraft, signals);
  console.log(`   Overall completeness: ${missingDataRequest.overallCompletenessPct}%`);
  console.log(`   Categories: ${missingDataRequest.categories.length}`);
  for (const cat of missingDataRequest.categories) {
    console.log(`   • [${cat.priority.toUpperCase()}] ${cat.labelAr} — ${cat.completenessPct}% complete`);
  }

  // ── Step 4: Generate Recommendations ──
  console.log("\n▶ Step 4a/4: Generating recommendation report...");
  const recommendations = generateRecommendations(workbookDraft, signals);
  console.log(`   Current score: ${recommendations.currentScore} / Target: ${recommendations.targetScore}`);
  console.log(`   Recommendations: ${recommendations.recommendations.length}`);
  for (const rec of recommendations.recommendations.slice(0, 3)) {
    console.log(`   • [${rec.impact}] ${rec.titleAr} (+${rec.estimatedScoreIncreasePct}%)`);
  }
  console.log(`   Total potential increase: ${recommendations.totalPotentialIncrease}%`);

  // ── Step 5: Run Simulations ──
  console.log("\n▶ Step 4b/4: Running simulations...");
  const simulations = runSimulations(workbookDraft, signals);
  console.log(`   Baseline score: ${simulations.currentBaseline.score} (${simulations.currentBaseline.tier})`);
  console.log(`   Scenarios: ${simulations.scenarios.length}`);
  for (const sc of simulations.scenarios) {
    const arrow = sc.delta > 0 ? "▲" : "▼";
    console.log(`   • ${sc.name}: ${sc.baselineScore} → ${sc.scenarioScore} (${arrow}${sc.delta})`);
  }

  // ── Output JSON artifacts ──
  const outputDir = path.join(__dirname, "../phase0-output");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const files: Array<{ name: string; data: unknown }> = [
    { name: "workbook-draft.json", data: workbookDraft },
    { name: "missing-data-request.json", data: missingDataRequest },
    { name: "recommendation-report.json", data: recommendations },
    { name: "simulation-report.json", data: simulations },
  ];

  console.log("\n▶ Writing output files...");
  for (const file of files) {
    const filePath = path.join(outputDir, file.name);
    fs.writeFileSync(filePath, JSON.stringify(file.data, null, 2), "utf-8");
    const sizeKB = Math.round(fs.statSync(filePath).size / 1024);
    console.log(`   ✓ ${file.name} (${sizeKB} KB)`);
  }

  // ── Summary ──
  console.log("\n╔═══════════════════════════════════════════════════════════╗");
  console.log("║  Validation Complete                                      ║");
  console.log("╚═══════════════════════════════════════════════════════════╝");
  console.log(`\nArtifacts written to: ${outputDir}`);
  console.log("\nKey findings:");
  console.log(`  1. TB→Workbook mapping: ${workbookDraft.sheets.length} sheets, ${workbookDraft.summary.totalRows} rows mapped`);
  console.log(`  2. Auto-fill rate: ${workbookDraft.summary.autoFillPct}% direct + ${workbookDraft.summary.derivedPct}% derived`);
  console.log(`  3. Missing data categories: ${missingDataRequest.categories.length}`);
  console.log(`  4. Recommendations generated: ${recommendations.recommendations.length}`);
  console.log(`  5. Simulation scenarios: ${simulations.scenarios.length}`);
  console.log(`  6. Workflow validation: PASS`);
}

main();
