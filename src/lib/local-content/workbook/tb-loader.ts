// ─── LocalContentOS — Trial Balance XLSX Loader ───
// Thin adapter: reads real client TB XLSX files and returns TbLine[].
// No schema changes, no new dependencies.
// Reuses existing `xlsx` package already in the dependency tree.
//
// Expected format (Arabic headers, two sheets):
//   Sheet "ميزان المراجعة (2)" — Balance Sheet accounts
//   Sheet "ميزان المراجعة (3)" — Income Statement accounts
//
// Column mapping:
//   Col 0: رقم الحساب     — accountCode
//   Col 1: اسم الحساب     — accountName
//   Col 7: الرصيد الحالي مدين  — current period debit
//   Col 8: الرصيد الحالي دائن  — current period credit
//
// P0: Source file is the authority. No synthetic data.

import { readFileSync } from "fs";
import * as XLSX from "xlsx";
import type { TbLine } from "./types";

// ─── Column Index Constants ───

const COL_ACCOUNT_CODE = 0;
const COL_ACCOUNT_NAME = 1;
const COL_DEBIT = 7;
const COL_CREDIT = 8;

// ─── Public API ───

/**
 * Parse a real trial balance XLSX file into TbLine[].
 *
 * Handles:
 * - Multiple sheets (BS + IS are both parsed)
 * - Row deduplication (same code + name → merge debit/credit)
 * - Arabic/RTL headers
 * - Empty rows, string-formatted numbers, edge cases
 *
 * @param filePath - Absolute or relative path to the .xlsx file
 * @returns TbLine[] — array of trial balance lines ready for workbook population
 */
export function parseTbXlsx(filePath: string): TbLine[] {
  const buffer = readFileSync(filePath);
  const workbook = XLSX.read(buffer, { type: "buffer", cellDates: false });

  const allLines: TbLine[] = [];
  const seenKeys = new Set<string>();

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    if (!sheet) continue;

    const rows = XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      defval: "",
    }) as unknown[][];

    if (rows.length < 2) continue; // Need header + at least 1 data row

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row || !isNonEmptyCell(row[COL_ACCOUNT_CODE])) {
        continue; // Skip empty rows and subtotal rows with no account code
      }

      const accountCode = String(row[COL_ACCOUNT_CODE]).trim();
      const accountName = String(row[COL_ACCOUNT_NAME] || "").trim();

      // Parse numeric values — handle both raw numbers and formatted strings
      const debit = parseNumericCell(row[COL_DEBIT]);
      const credit = parseNumericCell(row[COL_CREDIT]);

      // Skip truly empty rows (no code, no name, zero balance)
      if (!accountCode && !accountName && debit === 0 && credit === 0) {
        continue;
      }

      // Deduplicate: same account code + name = same logical line
      const key = `${accountCode}::${accountName}`;
      if (seenKeys.has(key)) {
        const existing = allLines.find(
          (l) => l.accountCode === accountCode && l.accountName === accountName,
        );
        if (existing) {
          existing.debit += debit;
          existing.credit += credit;
        }
        continue;
      }
      seenKeys.add(key);

      allLines.push({ accountCode, accountName, debit, credit });
    }
  }

  return allLines;
}

// ─── Helpers ───

/** Safely parse a cell value that could be number, string, or empty */
function parseNumericCell(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const cleaned = value.replace(/[,\s]/g, "").trim();
    if (cleaned === "" || cleaned === "-") return 0;
    const parsed = parseFloat(cleaned);
    return isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

/** Cell is non-empty (not undefined, null, empty string, or dash-only) */
function isNonEmptyCell(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === "number") return true;
  if (typeof value === "string") return value.trim() !== "" && value.trim() !== "-";
  return false;
}

// ─── Statistics (for reporting) ───

export interface TbParseStats {
  totalAccounts: number;
  totalRows: number; // total before dedup
  balanceSheetCount: number;
  incomeStatementCount: number;
  totalDebit: number;
  totalCredit: number;
  sheetsFound: string[];
}

/**
 * Parse XLSX and return both TbLine[] and parsing statistics.
 * Useful for rehearsal reports and validation.
 */
export function parseTbXlsxWithStats(filePath: string): {
  lines: TbLine[];
  stats: TbParseStats;
} {
  const buffer = readFileSync(filePath);
  const workbook = XLSX.read(buffer, { type: "buffer", cellDates: false });

  const allLines: TbLine[] = [];
  const seenKeys = new Set<string>();
  let totalRawRows = 0;
  let bsCount = 0;
  let isCount = 0;
  let totalDebit = 0;
  let totalCredit = 0;
  const sheetsFound: string[] = [];

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    if (!sheet) continue;
    sheetsFound.push(sheetName);

    const rows = XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      defval: "",
    }) as unknown[][];

    if (rows.length < 2) continue;

    // Classify sheet by name patterns
    const isBalanceSheet =
      sheetName.includes("(2)") || sheetName.includes("ميزان المراجعة (2)");
    const isIncomeStmt = !isBalanceSheet;

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row || !isNonEmptyCell(row[COL_ACCOUNT_CODE])) continue;

      totalRawRows++;

      const accountCode = String(row[COL_ACCOUNT_CODE]).trim();
      const accountName = String(row[COL_ACCOUNT_NAME] || "").trim();
      const debit = parseNumericCell(row[COL_DEBIT]);
      const credit = parseNumericCell(row[COL_CREDIT]);

      if (!accountCode && !accountName && debit === 0 && credit === 0) continue;

      const key = `${accountCode}::${accountName}`;
      if (seenKeys.has(key)) {
        const existing = allLines.find(
          (l) => l.accountCode === accountCode && l.accountName === accountName,
        );
        if (existing) {
          existing.debit += debit;
          existing.credit += credit;
        }
        // Don't double-count stats for duplicates
        continue;
      }
      seenKeys.add(key);

      if (isBalanceSheet) bsCount++;
      else isCount++;

      totalDebit += debit;
      totalCredit += credit;

      allLines.push({ accountCode, accountName, debit, credit });
    }
  }

  return {
    lines: allLines,
    stats: {
      totalAccounts: allLines.length,
      totalRows: totalRawRows,
      balanceSheetCount: bsCount,
      incomeStatementCount: isCount,
      totalDebit,
      totalCredit,
      sheetsFound,
    },
  };
}
