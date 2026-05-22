// LocalContentOS spend-records CSV import
// Parses CSV text into validated rows for bulk spend-record creation.
// Supports Arabic and English headers.

const REQUIRED_HEADERS_EN = [
  "amount",
  "supplierName",
  "category",
  "period",
] as const;

const REQUIRED_HEADERS_AR = [
  "المبلغ",
  "اسم المورد",
  "تصنيف الإنفاق",
  "الفترة",
] as const;

const OPTIONAL_HEADERS = [
  "contractReference",
  "currency",
  "description",
  "supplierRegistrationNumber",
  "invoiceNumber",
  "evidenceReference",
] as const;

const OPTIONAL_HEADERS_AR = [
  "رقم العقد",
  "العملة",
  "الوصف",
  "رقم السجل التجاري",
  "رقم الفاتورة",
  "مرجع الدليل",
] as const;

export interface ValidImportRow {
  rowNumber: number;
  supplierName: string;
  amount: number;
  category: string;
  period: string;
  currency: string;
  contractReference?: string;
  description?: string;
  supplierRegistrationNumber?: string;
}

export interface RejectedRow {
  rowNumber: number;
  reason: string;
  raw: Record<string, string>;
}

export interface ImportResult {
  validRows: ValidImportRow[];
  rejectedRows: RejectedRow[];
  summary: { total: number; valid: number; rejected: number };
}

function normalizeHeader(raw: string): string {
  const trimmed = raw.trim().toLowerCase().replace(/\s+/g, "");
  const map: Record<string, string> = {
    amount: "amount",
    suppliername: "supplierName",
    category: "category",
    period: "period",
    currency: "currency",
    contractreference: "contractReference",
    description: "description",
    supplierregistrationnumber: "supplierRegistrationNumber",
    invoicenumber: "invoiceNumber",
    evidencereference: "evidenceReference",
    المبلغ: "amount",
    اسمالمورد: "supplierName",
    تصنيفالإنفاق: "category",
    تصنيفالانفاق: "category",
    الفترة: "period",
    العملة: "currency",
    رقمالعقد: "contractReference",
    الوصف: "description",
    رقم: "description",
    رقمالسجلالتجاري: "supplierRegistrationNumber",
    رقمالفاتورة: "invoiceNumber",
    مرجعالدليل: "evidenceReference",
  };
  return map[trimmed] || trimmed;
}

function parseRow(
  raw: Record<string, string>,
  rowNumber: number,
): ValidImportRow | RejectedRow {
  const amount = parseFloat(raw.amount || "");
  if (Number.isNaN(amount) || amount <= 0) {
    return { rowNumber, reason: `Invalid amount: "${raw.amount}"`, raw };
  }

  const supplierName = (raw.supplierName || "").trim();
  if (!supplierName) {
    return { rowNumber, reason: "Missing supplier name", raw };
  }

  const category = (raw.category || "").trim().toLowerCase();
  if (!category) {
    return { rowNumber, reason: "Missing category", raw };
  }

  const period = (raw.period || "").trim();
  if (!period) {
    return { rowNumber, reason: "Missing period", raw };
  }

  return {
    rowNumber,
    supplierName,
    amount,
    category,
    period,
    currency: (raw.currency || "SAR").trim().toUpperCase() || "SAR",
    contractReference: (raw.contractReference || "").trim() || undefined,
    description: (raw.description || "").trim() || undefined,
    supplierRegistrationNumber:
      (raw.supplierRegistrationNumber || "").trim() || undefined,
  };
}

export function parseLocalContentCSV(csvText: string): ImportResult {
  const lines = csvText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length < 2) {
    return {
      validRows: [],
      rejectedRows: [
        {
          rowNumber: 0,
          reason: "CSV must have a header and at least one data row",
          raw: {},
        },
      ],
      summary: { total: 0, valid: 0, rejected: 0 },
    };
  }

  const headerLine = lines[0]!;
  const rawHeaders = headerLine
    .split(",")
    .map((h) => h.trim().replace(/^"|"$/g, ""));
  const normalizedHeaders = rawHeaders.map(normalizeHeader);
  const headerMap = new Map<string, number>();
  normalizedHeaders.forEach((h, i) => headerMap.set(h, i));

  const hasAmount =
    headerMap.has("amount") &&
    headerMap.has("supplierName") &&
    headerMap.has("category") &&
    headerMap.has("period");
  if (!hasAmount) {
    return {
      validRows: [],
      rejectedRows: [
        {
          rowNumber: 0,
          reason: `CSV must include: amount, supplierName, category, period. Found: ${normalizedHeaders.join(", ")}`,
          raw: {},
        },
      ],
      summary: { total: 0, valid: 0, rejected: 0 },
    };
  }

  const validRows: ValidImportRow[] = [];
  const rejectedRows: RejectedRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i]!.split(",").map((v) =>
      v.trim().replace(/^"|"$/g, ""),
    );
    const raw: Record<string, string> = {};
    normalizedHeaders.forEach((header, idx) => {
      raw[header] = values[idx] || "";
    });

    const result = parseRow(raw, i);
    if ("reason" in result) {
      rejectedRows.push(result as RejectedRow);
    } else {
      validRows.push(result as ValidImportRow);
    }
  }

  return {
    validRows,
    rejectedRows,
    summary: {
      total: lines.length - 1,
      valid: validRows.length,
      rejected: rejectedRows.length,
    },
  };
}
