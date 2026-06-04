// CSV/Excel file importer for ERP data
// Parses CSV with configurable delimiter and encoding.
// Parses Excel (.xlsx, .xls) files via SheetJS.
// Validates rows, reports errors, computes SHA-256 evidence hash.

import "server-only";

import crypto from "crypto";
import { parse as parseCsv } from "csv-parse/sync";
import * as XLSX from "xlsx";
import type {
  ParsedImportRow,
  FileImportResult,
  ColumnMapping,
} from "./types";

export interface FileImporterOptions {
  delimiter?: string;
  encoding?: BufferEncoding;
  requiredFields?: string[];
  columnMapping?: ColumnMapping[];
  maxRows?: number;
}

const DEFAULT_OPTIONS: Required<FileImporterOptions> = {
  delimiter: ",",
  encoding: "utf-8",
  requiredFields: ["amount", "supplierName", "category", "period"],
  columnMapping: [],
  maxRows: 100_000,
};

function computeSha256(buffer: Buffer): string {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

function normalizeValue(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

function normalizeHeader(raw: string): string {
  const trimmed = raw.trim().toLowerCase().replace(/\s+/g, "");
  const map: Record<string, string> = {
    amount: "amount",
    suppliername: "supplierName",
    supplier_name: "supplierName",
    اسمالمورد: "supplierName",
    المبلغ: "amount",
    category: "category",
    تصنيف_الإنفاق: "category",
    تصنيفالإنفاق: "category",
    تصنيف_الانفاق: "category",
    period: "period",
    الفترة: "period",
    currency: "currency",
    العملة: "currency",
    contractreference: "contractReference",
    contract_reference: "contractReference",
    رقمالعقد: "contractReference",
    description: "description",
    الوصف: "description",
    invoicenumber: "invoiceNumber",
    invoice_number: "invoiceNumber",
    رقمالفاتورة: "invoiceNumber",
    supplierregistrationnumber: "supplierRegistrationNumber",
    supplier_registration_number: "supplierRegistrationNumber",
    رقمالسجلالتجاري: "supplierRegistrationNumber",
    evidencereference: "evidenceReference",
    مرجعالدليل: "evidenceReference",
    transactiondate: "transactionDate",
    transaction_date: "transactionDate",
    تاريخالمعاملة: "transactionDate",
    costcenter: "costCenter",
    cost_center: "costCenter",
    مركزالتكلفة: "costCenter",
  };
  return map[trimmed] ?? trimmed;
}

function applyColumnMapping(
  rawRecord: Record<string, string>,
  mapping: ColumnMapping[],
): Record<string, string> {
  const result = { ...rawRecord };
  for (const m of mapping) {
    const value = rawRecord[m.sourceField];
    if (value !== undefined && value !== "") {
      result[m.targetField] = value;
    } else if (m.required && m.defaultValue !== undefined) {
      result[m.targetField] = m.defaultValue;
    }
  }
  return result;
}

function validateRow(
  data: Record<string, string>,
  rowNumber: number,
  requiredFields: string[],
): ParsedImportRow {
  const errors: string[] = [];
  const warnings: string[] = [];

  for (const field of requiredFields) {
    const value = (data[field] ?? "").trim();
    if (!value) {
      errors.push(`الحقل "${field}" مطلوب (row ${rowNumber})`);
    }
  }

  const amountRaw = (data.amount ?? "").trim();
  if (amountRaw) {
    const amount = parseFloat(amountRaw);
    if (Number.isNaN(amount) || amount < 0) {
      errors.push(`المبلغ غير صالح: "${amountRaw}" (row ${rowNumber})`);
    } else if (amount > 1_000_000_000) {
      warnings.push(
        `المبلغ كبير جداً: ${amount} (row ${rowNumber}) — يرجى التحقق`,
      );
    }
  }

  const periodRaw = (data.period ?? "").trim();
  if (periodRaw && !/^\d{4}(-Q[1-4]|-\d{2})?$/.test(periodRaw)) {
    warnings.push(
      `صيغة الفترة غير معتادة: "${periodRaw}" (row ${rowNumber}) — متوقعة: 2024-Q1 أو 2024-01`,
    );
  }

  return { rowNumber, data, errors, warnings };
}

function buildColumnMapping(
  headers: string[],
  options: Required<FileImporterOptions>,
): ColumnMapping[] {
  const normalizedHeaders = headers.map(normalizeHeader);
  const result: ColumnMapping[] = normalizedHeaders.map((h, i) => ({
    sourceField: headers[i]!,
    targetField: h,
  }));

  for (const custom of options.columnMapping) {
    const idx = normalizedHeaders.indexOf(custom.targetField);
    if (idx === -1) {
      result.push(custom);
    }
  }

  return result;
}

export async function parseCsvFile(
  buffer: Buffer,
  options?: FileImporterOptions,
): Promise<FileImportResult> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  const fileHash = computeSha256(buffer);

  const raw: string = buffer.toString(opts.encoding);

  let records: Record<string, string>[];
  try {
    records = parseCsv(raw, {
      delimiter: opts.delimiter,
      columns: true,
      skip_empty_lines: true,
      relax_column_count: true,
      bom: true,
    }) as Record<string, string>[];
  } catch (err) {
    const msg = err instanceof Error ? err.message : "CSV parse failed";
    return {
      totalRows: 0,
      validRows: [],
      errorRows: [
        {
          rowNumber: 0,
          data: {},
          errors: [msg],
          warnings: [],
        },
      ],
      fileHash,
      headers: [],
      columnMapping: [],
    };
  }

  if (records.length === 0) {
    return {
      totalRows: 0,
      validRows: [],
      errorRows: [
        {
          rowNumber: 0,
          data: {},
          errors: ["الملف لا يحتوي على بيانات"],
          warnings: [],
        },
      ],
      fileHash,
      headers: [],
      columnMapping: [],
    };
  }

  if (records.length > opts.maxRows) {
    return {
      totalRows: 0,
      validRows: [],
      errorRows: [
        {
          rowNumber: 0,
          data: {},
          errors: [
            `الملف يحتوي على ${records.length} صف، الحد الأقصى ${opts.maxRows}`,
          ],
          warnings: [],
        },
      ],
      fileHash,
      headers: [],
      columnMapping: [],
    };
  }

  const headers = Object.keys(records[0]!);
  const columnMapping = buildColumnMapping(headers, opts);

  const validRows: ParsedImportRow[] = [];
  const errorRows: ParsedImportRow[] = [];

  for (let i = 0; i < records.length; i++) {
    const rawRecord = records[i]!;
    const mapped: Record<string, string> = {};
    for (const [key, value] of Object.entries(rawRecord)) {
      const target = columnMapping.find(
        (m) => m.sourceField === key,
      )?.targetField;
      mapped[target ?? normalizeHeader(key)] = normalizeValue(value);
    }

    const applied = applyColumnMapping(mapped, opts.columnMapping);
    const result = validateRow(applied, i + 1, opts.requiredFields);

    if (result.errors.length > 0) {
      errorRows.push(result);
    } else {
      validRows.push(result);
    }
  }

  return {
    totalRows: records.length,
    validRows,
    errorRows,
    fileHash,
    headers,
    columnMapping,
  };
}

export async function parseExcelFile(
  buffer: Buffer,
  options?: FileImporterOptions,
): Promise<FileImportResult> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const fileHash = computeSha256(buffer);

  let workbook: XLSX.WorkBook;
  try {
    workbook = XLSX.read(buffer, { type: "buffer" });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Excel parse failed";
    return {
      totalRows: 0,
      validRows: [],
      errorRows: [
        { rowNumber: 0, data: {}, errors: [msg], warnings: [] },
      ],
      fileHash,
      headers: [],
      columnMapping: [],
    };
  }

  const firstSheet = workbook.Sheets[workbook.SheetNames[0]!];
  if (!firstSheet) {
    return {
      totalRows: 0,
      validRows: [],
      errorRows: [
        { rowNumber: 0, data: {}, errors: ["الملف لا يحتوي على أوراق عمل"], warnings: [] },
      ],
      fileHash,
      headers: [],
      columnMapping: [],
    };
  }

  const jsonData = XLSX.utils.sheet_to_json<Record<string, unknown>>(
    firstSheet,
    { defval: "" },
  );

  if (jsonData.length === 0) {
    return {
      totalRows: 0,
      validRows: [],
      errorRows: [
        { rowNumber: 0, data: {}, errors: ["ورقة العمل فارغة"], warnings: [] },
      ],
      fileHash,
      headers: [],
      columnMapping: [],
    };
  }

  if (jsonData.length > opts.maxRows) {
    return {
      totalRows: 0,
      validRows: [],
      errorRows: [
        {
          rowNumber: 0,
          data: {},
          errors: [
            `الملف يحتوي على ${jsonData.length} صف، الحد الأقصى ${opts.maxRows}`,
          ],
          warnings: [],
        },
      ],
      fileHash,
      headers: [],
      columnMapping: [],
    };
  }

  const headers = Object.keys(jsonData[0]!);
  const columnMapping = buildColumnMapping(headers, opts);

  const validRows: ParsedImportRow[] = [];
  const errorRows: ParsedImportRow[] = [];

  for (let i = 0; i < jsonData.length; i++) {
    const rawRecord = jsonData[i]!;
    const mapped: Record<string, string> = {};
    for (const [key, value] of Object.entries(rawRecord)) {
      const target = columnMapping.find((m) => m.sourceField === key)
        ?.targetField;
      mapped[target ?? normalizeHeader(key)] = normalizeValue(value);
    }

    const applied = applyColumnMapping(mapped, opts.columnMapping);
    const result = validateRow(applied, i + 1, opts.requiredFields);

    if (result.errors.length > 0) {
      errorRows.push(result);
    } else {
      validRows.push(result);
    }
  }

  return {
    totalRows: jsonData.length,
    validRows,
    errorRows,
    fileHash,
    headers,
    columnMapping,
  };
}

export function detectFileFormat(
  filename: string,
): "csv" | "excel" | "unknown" {
  const ext = filename.toLowerCase().split(".").pop() ?? "";
  if (ext === "csv") return "csv";
  if (["xlsx", "xls"].includes(ext)) return "excel";
  return "unknown";
}
