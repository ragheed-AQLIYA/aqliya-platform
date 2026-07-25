"use client"

import { useState, useCallback, useMemo } from "react"
import { useTranslations } from "next-intl"
import { uploadTrialBalanceAction } from "@/actions/audit-actions"
import type { ParsedRow, ColumnMapping } from "./types"
import { FIELD_KEYS, defaultMappings } from "./types"
import {
  parseCSV,
  parseXLSX,
  autoDetectColumn,
  getAmountColumns,
  hasImportableAmountColumns,
  resolveRowDebitCredit,
  extractClassificationHints,
  computeValidation,
} from "./utils"

export function useTrialBalanceUpload({
  engagementId,
  onClose,
  onComplete,
}: {
  engagementId: string
  onClose: () => void
  onComplete: () => void
}) {
  const t = useTranslations("audit.trialBalanceUpload")
  const [step, setStep] = useState(1)
  const [fileName, setFileName] = useState<string | null>(null)
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([])
  const [sourceColumns, setSourceColumns] = useState<string[]>([])
  const [mappings, setMappings] = useState<ColumnMapping[]>(defaultMappings)
  const [importing, setImporting] = useState(false)
  const [importError, setImportError] = useState<string | null>(null)
  const [importSuccess, setImportSuccess] = useState(false)

  const reset = useCallback(() => {
    setStep(1)
    setFileName(null)
    setParsedRows([])
    setSourceColumns([])
    setMappings(defaultMappings())
    setImporting(false)
    setImportError(null)
    setImportSuccess(false)
  }, [])

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setFileName(file.name)
    setImportError(null)
    try {
      let rows: ParsedRow[]
      if (file.name.endsWith(".csv")) {
        const text = await file.text()
        rows = parseCSV(text)
      } else if (file.name.endsWith(".xlsx")) {
        rows = await parseXLSX(file)
      } else {
        setImportError(t("invalidFormat"))
        return
      }
      if (rows.length === 0) {
        setImportError(t("noDataRows"))
        return
      }
      setParsedRows(rows)
      const cols = Object.keys(rows[0] ?? {})
      setSourceColumns(cols)
      const fieldDefs = FIELD_KEYS.map((key) => ({
        key,
        required: key === "accountCode" || key === "accountName",
      }))
      const autoMappings = fieldDefs.map(f => ({
        target: f.key,
        source: autoDetectColumn(f.key, cols) ?? null,
        required: f.required,
      }))
      const hasMovementColumns =
        autoMappings.find((m) => m.target === "debit")?.source &&
        autoMappings.find((m) => m.target === "credit")?.source
      if (hasMovementColumns) {
        for (const m of autoMappings) {
          if (m.target === "netBalance") m.source = null
        }
      }
      setMappings(autoMappings)
    } catch (err) {
      setImportError(err instanceof Error ? err.message : t("parseFailed"))
    }
  }, [t])

  const updateMapping = useCallback((target: string, source: string | null) => {
    setMappings(prev => prev.map(m => m.target === target ? { ...m, source } : m))
  }, [])

  const targetFields = useMemo(() => [
    { key: "accountCode", label: t("accountCode"), required: true },
    { key: "accountName", label: t("accountName"), required: true },
    { key: "debit", label: t("debit"), required: false },
    { key: "credit", label: t("credit"), required: false },
    { key: "closingDebit", label: t("closingDebit"), required: false },
    { key: "closingCredit", label: t("closingCredit"), required: false },
    { key: "netBalance", label: t("netBalance"), required: false },
    { key: "openingBalance", label: t("openingBalance"), required: false },
    { key: "priorYearBalance", label: t("priorYearBalance"), required: false },
  ], [t])

  const requiredMapped = mappings.filter(m => m.required).every(m => m.source)
  const movementMapped =
    Boolean(mappings.find(m => m.target === "debit")?.source) &&
    Boolean(mappings.find(m => m.target === "credit")?.source)
  const netBalanceMapped = Boolean(mappings.find(m => m.target === "netBalance")?.source)
  const showNetBalanceWarning = movementMapped && netBalanceMapped
  const validationChecks = parsedRows.length > 0 ? computeValidation(parsedRows, mappings, t) : []
  const hasErrors = validationChecks.some(c => c.status === "error")
  const hasBalanceWarning = validationChecks.some(
    (c) => c.label === t("balance") && c.status === "issue",
  )

  const handleConfirm = useCallback(async () => {
    if (!fileName) return
    setImporting(true)
    setImportError(null)
    try {
      const codeCol = mappings.find(m => m.target === "accountCode")?.source
      const nameCol = mappings.find(m => m.target === "accountName")?.source
      const amountCols = getAmountColumns(mappings)
      if (!codeCol || !nameCol) throw new Error(t("requiredFieldMapping"))
      if (!hasImportableAmountColumns(amountCols)) {
        throw new Error(t("balanceColumnsMissing"))
      }

      const rows = parsedRows
        .map((r) => {
          const accountCode = (r[codeCol] ?? "").trim()
          const accountName = (r[nameCol] ?? "").trim()
          if (!accountCode && !accountName) return null
          const { debit, credit } = resolveRowDebitCredit(r, amountCols)
          return {
            accountCode,
            accountName,
            debit,
            credit,
            classificationHints: extractClassificationHints(r),
          }
        })
        .filter((r): r is {
          accountCode: string;
          accountName: string;
          debit: number;
          credit: number;
          classificationHints: string[];
        } =>
          r !== null && Boolean(r.accountCode && r.accountName),
        )

      if (rows.length === 0) throw new Error(t("noValidRows"))

      await uploadTrialBalanceAction(engagementId, fileName, rows)
      setImportSuccess(true)
      setTimeout(() => { reset(); onClose(); onComplete() }, 800)
    } catch (err) {
      setImportError(err instanceof Error ? err.message : t("importFailed"))
    } finally {
      setImporting(false)
    }
  }, [fileName, mappings, parsedRows, engagementId, t, reset, onClose, onComplete])

  return {
    state: {
      step,
      fileName,
      parsedRows,
      sourceColumns,
      mappings,
      importing,
      importError,
      importSuccess,
      targetFields,
      requiredMapped,
      showNetBalanceWarning,
      validationChecks,
      hasErrors,
      hasBalanceWarning,
    },
    actions: {
      setStep,
      setFileName,
      setImportError,
      reset,
      handleFileSelect,
      updateMapping,
      handleConfirm,
    },
  }
}
