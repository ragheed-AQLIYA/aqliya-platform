import {
  getMappingClosingBalance,
  isCashAccountMapping,
} from "@/lib/audit/lead-schedule/balance-utils";
import type { ReconciliationCheckResult } from "./types";

const TOLERANCE = 0.01;

export type TbLineInput = {
  accountCode: string;
  accountName: string;
  balance: number;
  debitAmount: number;
  creditAmount: number;
};

export type MappingInput = {
  id: string;
  sourceAccountCode: string;
  sourceAccountName?: string;
  status: string;
  debitAmount: number;
  creditAmount: number;
  statementClassification?: string | null;
  canonicalAccount?: {
    code?: string;
    category?: string;
    statementType?: string;
    name?: string;
  } | null;
};

export type LeadScheduleInput = {
  id: string;
  accountCode: string;
  currentYearBalance: number | null;
  lines: Array<{ amount: number; reference: string | null }>;
};

export type StatementLineInput = {
  id: string;
  label: string;
  amount: number;
  isTotal: boolean;
  linkedAccountMappings: string[];
};

export type StatementInput = {
  id: string;
  statementType: string;
  lines: StatementLineInput[];
};

function parseStatementLines(raw: unknown): StatementLineInput[] {
  let rows: unknown[] = [];
  try {
    rows =
      typeof raw === "string"
        ? JSON.parse(raw)
        : Array.isArray(raw)
          ? raw
          : [];
  } catch {
    rows = [];
  }
  return rows.map((r) => {
    const row = r as Record<string, unknown>;
    return {
      id: String(row.id ?? ""),
      label: String(row.label ?? ""),
      amount: Number(row.amount ?? 0),
      isTotal: Boolean(row.isTotal),
      linkedAccountMappings: Array.isArray(row.linkedAccountMappings)
        ? row.linkedAccountMappings.map(String)
        : [],
    };
  });
}

export { parseStatementLines };

export function checkTbToLeadScheduleTie(input: {
  mappings: MappingInput[];
  schedules: LeadScheduleInput[];
}): ReconciliationCheckResult[] {
  const confirmed = input.mappings.filter((m) => m.status === "confirmed");

  if (input.schedules.length === 0) {
    return [
      {
        code: "RC-001",
        checkType: "tb_ls_tie",
        passed: true,
        severity: "warning",
        messageAr: "لا توجد قوائم ربط للمقارنة.",
        messageEn: "No lead schedules to compare.",
      },
    ];
  }

  const lsAmountByMapping = new Map<string, number>();
  for (const schedule of input.schedules) {
    for (const line of schedule.lines) {
      if (!line.reference) continue;
      lsAmountByMapping.set(
        line.reference,
        (lsAmountByMapping.get(line.reference) ?? 0) + line.amount,
      );
    }
  }

  let mismatchCount = 0;
  let maxDiff = 0;
  let mappingTotal = 0;
  let lsTotal = 0;

  for (const m of confirmed) {
    const expected = getMappingClosingBalance({
      debitAmount: m.debitAmount,
      creditAmount: m.creditAmount,
      statementClassification: m.statementClassification,
      canonicalAccount: m.canonicalAccount,
    });
    const actual = lsAmountByMapping.get(m.id) ?? 0;
    mappingTotal += expected;
    lsTotal += actual;
    const diff = Math.abs(expected - actual);
    if (diff > TOLERANCE) {
      mismatchCount += 1;
      maxDiff = Math.max(maxDiff, diff);
    }
  }

  const passed = mismatchCount === 0;

  return [
    {
      code: "RC-001",
      checkType: "tb_ls_tie",
      passed,
      severity: passed ? "warning" : "error",
      messageAr: passed
        ? "تعيينات مؤكدة تطابق بنود قوائم الربط."
        : `${mismatchCount} تعيين(ات) لا تطابق قوائم الربط (أقصى فرق ${maxDiff.toFixed(2)}).`,
      messageEn: passed
        ? "Confirmed mappings tie to lead schedule lines."
        : `${mismatchCount} mapping(s) do not tie to lead schedules (max diff ${maxDiff.toFixed(2)}).`,
      expectedValue: mappingTotal,
      actualValue: lsTotal,
      difference: Math.abs(mappingTotal - lsTotal),
    },
  ];
}

export function checkLeadScheduleToFsTie(input: {
  schedules: LeadScheduleInput[];
  statements: StatementInput[];
}): ReconciliationCheckResult[] {
  const fsLines = input.statements.flatMap((s) =>
    s.lines.filter((l) => !l.isTotal),
  );
  const fsByMapping = new Map<string, number>();

  for (const line of fsLines) {
    if (line.linkedAccountMappings.length !== 1) continue;
    const mapId = line.linkedAccountMappings[0]!;
    fsByMapping.set(mapId, line.amount);
  }

  if (input.schedules.length === 0 || fsLines.length === 0) {
    return [
      {
        code: "RC-002",
        checkType: "ls_fs_tie",
        passed: true,
        severity: "warning",
        messageAr: "لا توجد بيانات كافية لربط قوائم الربط بالقوائم المالية.",
        messageEn: "Insufficient data for lead schedule to FS tie.",
      },
    ];
  }

  let mismatchCount = 0;
  let maxDiff = 0;
  let compared = 0;

  for (const schedule of input.schedules) {
    for (const line of schedule.lines) {
      if (!line.reference) continue;
      compared += 1;
      const lsAmount = line.amount;
      const fsAmount = fsByMapping.get(line.reference);
      if (fsAmount === undefined) {
        mismatchCount += 1;
        maxDiff = Math.max(maxDiff, Math.abs(lsAmount));
        continue;
      }
      const diff = Math.abs(lsAmount - fsAmount);
      if (diff > TOLERANCE) {
        mismatchCount += 1;
        maxDiff = Math.max(maxDiff, diff);
      }
    }
  }

  if (compared === 0) {
    return [
      {
        code: "RC-002",
        checkType: "ls_fs_tie",
        passed: true,
        severity: "warning",
        messageAr: "لا توجد بنود مرتبطة في قوائم الربط.",
        messageEn: "No referenced lead schedule lines to compare.",
      },
    ];
  }

  const passed = mismatchCount === 0;

  return [
    {
      code: "RC-002",
      checkType: "ls_fs_tie",
      passed,
      severity: passed ? "warning" : "error",
      messageAr: passed
        ? "بنود قوائم الربط تطابق بنود القوائم المالية المرتبطة."
        : `${mismatchCount} بند(اً) لا يطابق FS (أقصى فرق ${maxDiff.toFixed(2)}).`,
      messageEn: passed
        ? "Lead schedule lines tie to linked FS amounts."
        : `${mismatchCount} line(s) do not tie to FS (max diff ${maxDiff.toFixed(2)}).`,
      actualValue: mismatchCount,
      difference: maxDiff,
    },
  ];
}

export function checkBalanceSheetEquation(input: {
  statements: StatementInput[];
}): ReconciliationCheckResult[] {
  const bs = input.statements.find((s) => s.statementType === "balance_sheet");
  if (!bs) {
    return [
      {
        code: "RC-003",
        checkType: "balance_sheet_equation",
        passed: false,
        severity: "warning",
        messageAr: "لا توجد قائمة مركز مالي.",
        messageEn: "No balance sheet statement found.",
      },
    ];
  }

  const totalAssets = bs.lines.find((l) =>
    l.label.toUpperCase().includes("TOTAL ASSETS"),
  );
  const totalLe = bs.lines.find((l) =>
    l.label.toUpperCase().includes("TOTAL LIABILITIES AND EQUITY"),
  );

  if (!totalAssets || !totalLe) {
    return [
      {
        code: "RC-003",
        checkType: "balance_sheet_equation",
        passed: false,
        severity: "warning",
        messageAr: "بنود الإجمالي غير موجودة في قائمة المركز المالي.",
        messageEn: "Balance sheet total lines not found.",
      },
    ];
  }

  const diff = Math.abs(totalAssets.amount - totalLe.amount);
  const passed = diff <= TOLERANCE;

  return [
    {
      code: "RC-003",
      checkType: "balance_sheet_equation",
      passed,
      severity: passed ? "warning" : "error",
      messageAr: passed
        ? "معادلة الميزانية متوازنة."
        : `الميزانية غير متوازنة — فرق ${diff.toFixed(2)}`,
      messageEn: passed
        ? "Balance sheet equation balances."
        : `Balance sheet out of balance by ${diff.toFixed(2)}`,
      expectedValue: totalAssets.amount,
      actualValue: totalLe.amount,
      difference: diff,
    },
  ];
}

export function checkIncomeToEquityFlow(input: {
  statements: StatementInput[];
}): ReconciliationCheckResult[] {
  const is = input.statements.find((s) => s.statementType === "income_statement");
  const eq = input.statements.find((s) => s.statementType === "equity");

  if (!is || !eq) {
    return [
      {
        code: "RC-004",
        checkType: "is_equity_flow",
        passed: true,
        severity: "warning",
        messageAr: "قوائم الدخل/حقوق الملكية غير متوفرة للمقارنة.",
        messageEn: "IS/equity statements not available for flow check.",
      },
    ];
  }

  const profitLine =
    is.lines.find((l) => l.label.toLowerCase() === "net profit") ??
    is.lines.find((l) => l.isTotal && l.label.toLowerCase().includes("net profit"));

  const equityProfit = eq.lines.find((l) =>
    l.label.toLowerCase().includes("current year profit"),
  );

  if (!profitLine || !equityProfit) {
    return [
      {
        code: "RC-004",
        checkType: "is_equity_flow",
        passed: true,
        severity: "warning",
        messageAr: "بنود الربح غير موجودة للمقارنة.",
        messageEn: "Profit lines not found for flow check.",
      },
    ];
  }

  const diff = Math.abs(profitLine.amount - equityProfit.amount);
  const passed = diff <= TOLERANCE;

  return [
    {
      code: "RC-004",
      checkType: "is_equity_flow",
      passed,
      severity: passed ? "warning" : "error",
      messageAr: passed
        ? "ربح العام يتطابق بين قائمة الدخل وحقوق الملكية."
        : `فرق ربح العام: ${diff.toFixed(2)}`,
      messageEn: passed
        ? "Current year profit flows to equity."
        : `Current year profit mismatch: ${diff.toFixed(2)}`,
      expectedValue: profitLine.amount,
      actualValue: equityProfit.amount,
      difference: diff,
    },
  ];
}

export function checkMappingCoverage(input: {
  mappings: MappingInput[];
  schedules: LeadScheduleInput[];
}): ReconciliationCheckResult[] {
  const confirmedIds = new Set(
    input.mappings.filter((m) => m.status === "confirmed").map((m) => m.id),
  );

  const referenced = new Set<string>();
  for (const schedule of input.schedules) {
    for (const line of schedule.lines) {
      if (line.reference) referenced.add(line.reference);
    }
  }

  const missing = [...confirmedIds].filter((id) => !referenced.has(id));

  return [
    {
      code: "RC-005",
      checkType: "reconciliation_coverage",
      passed: missing.length === 0,
      severity: missing.length === 0 ? "warning" : "error",
      messageAr:
        missing.length === 0
          ? "جميع التعيينات المؤكدة موجودة في قوائم الربط."
          : `${missing.length} تعيين(ات) مؤكدة غير موجودة في قوائم الربط.`,
      messageEn:
        missing.length === 0
          ? "All confirmed mappings appear in lead schedules."
          : `${missing.length} confirmed mapping(s) missing from lead schedules.`,
      actualValue: missing.length,
    },
  ];
}

export function checkCashFlowTie(input: {
  statements: StatementInput[];
  mappings: MappingInput[];
}): ReconciliationCheckResult[] {
  const cf = input.statements.find((s) => s.statementType === "cash_flow");
  if (!cf) {
    return [
      {
        code: "RC-006",
        checkType: "cash_flow_tie",
        passed: true,
        severity: "warning",
        messageAr: "لا توجد قائمة تدفقات نقدية — RC-006 متخطى.",
        messageEn: "No cash flow statement — RC-006 skipped.",
      },
    ];
  }

  const { cashAtEnd, tbCashTotal } = (() => {
    const cashLine = cf.lines.find((l) =>
      l.label.toLowerCase().includes("cash at end"),
    );
    const cashAtEndAmount = cashLine?.amount ?? 0;

    const tbCash = input.mappings
      .filter((m) => m.status === "confirmed" && isCashAccountMapping(m))
      .reduce(
        (sum, m) =>
          sum +
          getMappingClosingBalance({
            debitAmount: m.debitAmount,
            creditAmount: m.creditAmount,
            statementClassification: m.statementClassification,
            canonicalAccount: m.canonicalAccount,
          }),
        0,
      );

    return { cashAtEnd: cashAtEndAmount, tbCashTotal: tbCash };
  })();

  const diff = Math.abs(cashAtEnd - tbCashTotal);
  const passed = diff <= TOLERANCE;

  return [
    {
      code: "RC-006",
      checkType: "cash_flow_tie",
      passed,
      severity: passed ? "warning" : "error",
      messageAr: passed
        ? "نقدية نهاية الفترة تطابق حسابات النقد في ميزان المراجعة."
        : `فرق النقدية: ${diff.toFixed(2)}`,
      messageEn: passed
        ? "Cash at end ties to trial balance cash accounts."
        : `Cash tie difference: ${diff.toFixed(2)}`,
      expectedValue: tbCashTotal,
      actualValue: cashAtEnd,
      difference: diff,
    },
  ];
}
