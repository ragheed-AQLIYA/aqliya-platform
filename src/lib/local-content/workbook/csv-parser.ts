// ─── LocalContentOS Workbook — CSV Trial Balance Parser ───
// Parses CSV/TSV trial balance exports from common Saudi ERPs into TbLine[].
// Supports Arabic and English column headers, flexible delimiter detection.

import type { TbLine } from "./types";

/** Result of a CSV parse attempt */
export interface CsvParseResult {
  lines: TbLine[];
  errors: string[];
  totalRows: number;
  parsedRows: number;
}

/** Column header aliases for auto-detection */
const HEADER_ALIASES: Record<string, string[]> = {
  accountCode: [
    "account code",
    "accountcode",
    "code",
    "account",
    "رقم الحساب",
    "رقم حساب",
    "الحساب",
    "الرمز",
    "كود الحساب",
    "كود",
    "account number",
    "accountno",
    "account no",
  ],
  accountName: [
    "account name",
    "accountname",
    "name",
    "description",
    "account description",
    "اسم الحساب",
    "اسم حساب",
    "الاسم",
    "البيان",
    "وصف الحساب",
    "التفصيل",
  ],
  debit: [
    "debit",
    "debit amount",
    "مدين",
    "مدينة",
    "قيمة مدينة",
    "قيمة مدين",
    "المدين",
    "debit (sar)",
    "debit (drs)",
    "drs",
    "debit balance",
  ],
  credit: [
    "credit",
    "credit amount",
    "دائن",
    "دائنة",
    "قيمة دائنة",
    "قيمة دائن",
    "الدائن",
    "credit (sar)",
    "credit (crs)",
    "crs",
    "credit balance",
  ],
};

/** Detect common delimiters: comma, semicolon, tab */
function detectDelimiter(firstLine: string): string {
  const commaCount = (firstLine.match(/,/g) || []).length;
  const semicolonCount = (firstLine.match(/;/g) || []).length;
  const tabCount = (firstLine.match(/\t/g) || []).length;

  if (semicolonCount > commaCount && semicolonCount > tabCount) return ";";
  if (tabCount > commaCount && tabCount > semicolonCount) return "\t";
  return ",";
}

/** Parse a CSV line into cells, respecting quoted values */
function parseCsvLine(line: string, delimiter: string): string[] {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === delimiter && !inQuotes) {
      cells.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  cells.push(current.trim());
  return cells;
}

/** Normalize a header cell for comparison */
function normalizeHeader(cell: string): string {
  return cell
    .toLowerCase()
    .replace(/[_\s-]+/g, " ")
    .replace(/[^\w\s\u0600-\u06FF]/g, "")
    .trim();
}

/** Try to convert a string to a number, handling Arabic numerals and formats */
function parseNumeric(value: string): number | null {
  if (!value || value.trim() === "") return null;

  // Remove currency symbols, spaces, and parentheses (negative)
  let cleaned = value
    .trim()
    .replace(/[,$\s]/g, "")
    .replace(/^\((.+)\)$/, "-$1")
    .replace(/[،]/g, ""); // Arabic comma

  // Handle Arabic-Indic numerals (٠١٢٣٤٥٦٧٨٩) — map to ASCII '0'-'9'
  cleaned = cleaned.replace(/[٠-٩]/g, (d) =>
    String.fromCharCode(48 + (d.charCodeAt(0) - 1632)),
  );

  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

/**
 * Parse CSV/TSV trial balance text into TbLine[].
 * Auto-detects header row, column mapping, and delimiter.
 */
export function parseCsvTrialBalance(csvText: string): CsvParseResult {
  const result: CsvParseResult = {
    lines: [],
    errors: [],
    totalRows: 0,
    parsedRows: 0,
  };

  if (!csvText || csvText.trim().length === 0) {
    result.errors.push("CSV data is empty");
    return result;
  }

  // Split into lines, handling both \r\n and \n
  const rawLines = csvText.trim().split(/\r?\n/);
  if (rawLines.length < 2) {
    result.errors.push("CSV must have a header row and at least one data row");
    return result;
  }

  const delimiter = detectDelimiter(rawLines[0]);

  // Parse header row
  const headers = parseCsvLine(rawLines[0], delimiter).map(normalizeHeader);

  // Find column indices by alias matching
  let codeIdx = -1;
  let nameIdx = -1;
  let debitIdx = -1;
  let creditIdx = -1;

  for (let i = 0; i < headers.length; i++) {
    const h = headers[i];
    if (codeIdx === -1 && HEADER_ALIASES.accountCode.some((a) => h.includes(a))) {
      codeIdx = i;
    }
    if (nameIdx === -1 && HEADER_ALIASES.accountName.some((a) => h.includes(a))) {
      nameIdx = i;
    }
    if (debitIdx === -1 && HEADER_ALIASES.debit.some((a) => h.includes(a))) {
      debitIdx = i;
    }
    if (creditIdx === -1 && HEADER_ALIASES.credit.some((a) => h.includes(a))) {
      creditIdx = i;
    }
  }

  // Fallback: try positional (columns 0,1,2,3)
  if (codeIdx === -1 && headers.length >= 2) codeIdx = 0;
  if (nameIdx === -1 && headers.length >= 2) nameIdx = 1;
  if (debitIdx === -1 && headers.length >= 3) debitIdx = 2;
  if (creditIdx === -1 && headers.length >= 4) creditIdx = 3;

  if (codeIdx === -1 || nameIdx === -1) {
    result.errors.push(
      `Cannot detect required columns. Headers found: [${headers.join(", ")}]. Expected: account code and account name columns.`,
    );
    return result;
  }

  result.totalRows = rawLines.length - 1;

  // Parse data rows
  for (let rowIdx = 1; rowIdx < rawLines.length; rowIdx++) {
    const raw = rawLines[rowIdx].trim();
    if (!raw) continue; // skip empty lines

    const cells = parseCsvLine(raw, delimiter);

    const accountCode = cells[codeIdx] || "";
    const accountName = cells[nameIdx] || "";
    const debitRaw = debitIdx >= 0 && debitIdx < cells.length ? cells[debitIdx] : "";
    const creditRaw = creditIdx >= 0 && creditIdx < cells.length ? cells[creditIdx] : "";

    // Skip empty rows
    if (!accountCode && !accountName) continue;

    // Parse numeric values
    const debit = parseNumeric(debitRaw) ?? 0;
    const credit = parseNumeric(creditRaw) ?? 0;

    result.lines.push({ accountCode, accountName, debit, credit });
    result.parsedRows++;
  }

  if (result.parsedRows === 0) {
    result.errors.push("No data rows were parsed. Check CSV format and column headers.");
  }

  return result;
}
