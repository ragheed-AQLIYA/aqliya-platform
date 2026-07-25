export interface ParsedRow {
  [key: string]: string
}

export interface ColumnMapping {
  target: string
  source: string | null
  required: boolean
}

export interface AmountColumnMap {
  debitCol: string | null
  creditCol: string | null
  netBalanceCol: string | null
  closingDebitCol: string | null
  closingCreditCol: string | null
}

export interface ValidationCheck {
  label: string
  status: "valid" | "issue" | "error"
  detail: string
}

export interface TrialBalanceUploadProps {
  open: boolean
  onClose: () => void
  engagementId: string
  onComplete: () => void
}

export const FIELD_KEYS = [
  "accountCode",
  "accountName",
  "debit",
  "credit",
  "closingDebit",
  "closingCredit",
  "netBalance",
  "openingBalance",
  "priorYearBalance",
] as const

export const UNMAP_VALUE = "__unmap__"

export function defaultMappings(): ColumnMapping[] {
  return FIELD_KEYS.map((key) => ({
    target: key,
    source: null,
    required: key === "accountCode" || key === "accountName",
  }))
}
