// ERP Field Mapping Service
// Maps ERP source fields to LocalContentOS spend record fields.
// Provides default mapping configs for SAP, Oracle, and CSV sources.

import type { ErpSpendRecord, ErpSupplier, ErpProcurementLine } from "./types";

export interface FieldMappingConfig {
  sourceField: string;
  targetField: string;
  transform?: "uppercase" | "lowercase" | "trim" | "parseFloat" | "parseInt";
  defaultValue?: string | number;
  required: boolean;
}

export const DEFAULT_SAP_FIELD_MAPPINGS: FieldMappingConfig[] = [
  { sourceField: "amount", targetField: "amount", transform: "parseFloat", required: true },
  { sourceField: "currency", targetField: "currency", defaultValue: "SAR", required: false },
  { sourceField: "category", targetField: "category", required: true },
  { sourceField: "supplierName", targetField: "supplierName", required: true },
  { sourceField: "supplierRegistrationNumber", targetField: "supplierRegistrationNumber", required: false },
  { sourceField: "contractReference", targetField: "contractReference", required: false },
  { sourceField: "period", targetField: "period", required: true },
  { sourceField: "description", targetField: "description", required: false },
  { sourceField: "costCenter", targetField: "costCenter", required: false },
  { sourceField: "invoiceNumber", targetField: "invoiceNumber", required: false },
];

export const DEFAULT_ORACLE_FIELD_MAPPINGS: FieldMappingConfig[] = [
  { sourceField: "amount", targetField: "amount", transform: "parseFloat", required: true },
  { sourceField: "currency", targetField: "currency", defaultValue: "SAR", required: false },
  { sourceField: "category", targetField: "category", required: true },
  { sourceField: "supplierName", targetField: "supplierName", required: true },
  { sourceField: "supplierRegistrationNumber", targetField: "supplierRegistrationNumber", required: false },
  { sourceField: "vendor_name", targetField: "vendor_name", required: false },
  { sourceField: "contractReference", targetField: "contractReference", required: false },
  { sourceField: "period", targetField: "period", required: true },
  { sourceField: "description", targetField: "description", required: false },
  { sourceField: "costCenter", targetField: "costCenter", required: false },
  { sourceField: "invoiceNumber", targetField: "invoiceNumber", required: false },
];

export const DEFAULT_CSV_FIELD_MAPPINGS: FieldMappingConfig[] = [
  { sourceField: "amount", targetField: "amount", transform: "parseFloat", required: true },
  { sourceField: "currency", targetField: "currency", defaultValue: "SAR", required: false },
  { sourceField: "category", targetField: "category", required: true },
  { sourceField: "supplierName", targetField: "supplierName", required: true },
  { sourceField: "supplierRegistrationNumber", targetField: "supplierRegistrationNumber", required: false },
  { sourceField: "contractReference", targetField: "contractReference", required: false },
  { sourceField: "period", targetField: "period", required: true },
  { sourceField: "description", targetField: "description", required: false },
  { sourceField: "invoiceNumber", targetField: "invoiceNumber", required: false },
];

export const PROVIDER_DEFAULTS: Record<
  string,
  { mappings: FieldMappingConfig[]; categoryMap: Record<string, string> }
> = {
  sap: {
    mappings: DEFAULT_SAP_FIELD_MAPPINGS,
    categoryMap: {
      "ROH": "goods",
      "FERT": "goods",
      "DIEN": "services",
      "LEER": "services",
    },
  },
  oracle: {
    mappings: DEFAULT_ORACLE_FIELD_MAPPINGS,
    categoryMap: {
      "GOODS": "goods",
      "SERVICES": "services",
      "CONSTRUCTION": "construction",
      "TECHNOLOGY": "technology",
    },
  },
  "csv-upload": {
    mappings: DEFAULT_CSV_FIELD_MAPPINGS,
    categoryMap: {},
  },
};

export function getDefaultMappingsForProvider(
  provider: string,
): FieldMappingConfig[] {
  return PROVIDER_DEFAULTS[provider]?.mappings ?? DEFAULT_CSV_FIELD_MAPPINGS;
}

export function getCategoryMapForProvider(
  provider: string,
): Record<string, string> {
  return PROVIDER_DEFAULTS[provider]?.categoryMap ?? {};
}

function applyTransform(
  value: string,
  transform?: string,
): string | number {
  if (!value) return value;
  switch (transform) {
    case "uppercase":
      return value.toUpperCase();
    case "lowercase":
      return value.toLowerCase();
    case "trim":
      return value.trim();
    case "parseFloat": {
      const parsed = parseFloat(value);
      return Number.isNaN(parsed) ? 0 : parsed;
    }
    case "parseInt": {
      const parsed = parseInt(value, 10);
      return Number.isNaN(parsed) ? 0 : parsed;
    }
    default:
      return value;
  }
}

function mapErpCategory(
  erpCategory: string,
  provider: string,
): string {
  const catMap = getCategoryMapForProvider(provider);
  const mapped = catMap[erpCategory.toUpperCase()];
  return mapped ?? erpCategory.toLowerCase();
}

export interface SpendRecordInputFromErp {
  supplierName: string;
  supplierRegistrationNumber?: string;
  amount: number;
  currency: string;
  category: string;
  period: string;
  contractReference?: string;
  description?: string;
  invoiceNumber?: string;
  costCenter?: string;
  sourceId: string;
  sourceSystem?: string;
}

export async function mapErpSpendToLocalContent(
  record: ErpSpendRecord,
  provider: string,
  customMapping?: Record<string, string>,
): Promise<SpendRecordInputFromErp> {
  const mapping = customMapping
    ? mergeCustomMapping(getDefaultMappingsForProvider(provider), customMapping)
    : getDefaultMappingsForProvider(provider);

  const mapped: Record<string, string | number> = {};

  for (const config of mapping) {
    const sourceValue = (record as unknown as Record<string, unknown>)[config.sourceField];
    const strValue = sourceValue !== null && sourceValue !== undefined
      ? String(sourceValue)
      : "";

    let finalValue: string | number = strValue;
    if (!strValue && config.defaultValue !== undefined) {
      finalValue = config.defaultValue;
    }
    if (config.transform && strValue) {
      finalValue = applyTransform(strValue, config.transform);
    }
    mapped[config.targetField] = finalValue;
  }

  const mappedAmount = typeof mapped.amount === "number"
    ? mapped.amount
    : parseFloat(String(mapped.amount ?? "0"));

  const resolvedSupplierName = String(mapped.supplierName || record.supplierName);
  const resolvedCurrency = String(mapped.currency || record.currency || "SAR");
  const resolvedCategory = String(mapped.category || record.category || "other");
  const resolvedPeriod = String(mapped.period || record.period || "");

  return {
    supplierName: resolvedSupplierName,
    supplierRegistrationNumber: String(
      mapped.supplierRegistrationNumber || record.supplierRegistrationNumber || "",
    ) || undefined,
    amount: Number.isNaN(mappedAmount) ? 0 : mappedAmount,
    currency: resolvedCurrency,
    category: mapErpCategory(resolvedCategory, provider),
    period: resolvedPeriod,
    contractReference:
      String(mapped.contractReference || record.contractReference || "") ||
      undefined,
    description:
      String(mapped.description || record.description || "") || undefined,
    invoiceNumber:
      String(mapped.invoiceNumber || record.invoiceNumber || "") || undefined,
    costCenter:
      String(mapped.costCenter || record.costCenter || "") || undefined,
    sourceId: record.sourceId,
    sourceSystem: provider,
  };
}

function mergeCustomMapping(
  defaults: FieldMappingConfig[],
  custom: Record<string, string>,
): FieldMappingConfig[] {
  const merged = [...defaults];
  for (const [targetField, sourceField] of Object.entries(custom)) {
    const existing = merged.find((m) => m.targetField === targetField);
    if (existing) {
      existing.sourceField = sourceField;
    } else {
      merged.push({
        sourceField,
        targetField,
        required: false,
      });
    }
  }
  return merged;
}
