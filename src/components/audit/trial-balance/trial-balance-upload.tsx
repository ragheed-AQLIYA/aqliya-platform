"use client"

import { useState, useCallback } from "react"
import { useTranslations } from "next-intl"
import { Upload, FileSpreadsheet, CheckCircle, AlertTriangle, XCircle, ArrowLeft, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table"
import { uploadTrialBalanceAction } from "@/actions/audit-actions"

interface ParsedRow {
  [key: string]: string
}

interface TrialBalanceUploadProps {
  open: boolean
  onClose: () => void
  engagementId: string
  onComplete: () => void
}

interface ColumnMapping {
  target: string
  source: string | null
  required: boolean
}

/** Parse monetary amounts: strips thousands separators, handles (negative) parentheses. */
function parseAmount(raw: string | undefined | null): number {
  if (raw == null) return 0
  let s = String(raw).trim()
  if (!s || s === "-" || s === "—") return 0

  let negative = false
  if (/^\(.*\)$/.test(s)) {
    negative = true
    s = s.slice(1, -1)
  }

  // Arabic-Indic digits → Western
  s = s.replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)))
  // Remove currency symbols and spaces; keep digits, dot, minus
  s = s.replace(/[^\d.,\-]/g, "")
  // 1,234.56 or 1.234,56 — if both separators, last one is decimal
  if (s.includes(",") && s.includes(".")) {
    if (s.lastIndexOf(",") > s.lastIndexOf(".")) {
      s = s.replace(/\./g, "").replace(",", ".")
    } else {
      s = s.replace(/,/g, "")
    }
  } else if (s.includes(",")) {
    const parts = s.split(",")
    s = parts.length === 2 && parts[1].length <= 2
      ? `${parts[0].replace(/\./g, "")}.${parts[1]}`
      : s.replace(/,/g, "")
  }

  const n = parseFloat(s)
  if (!Number.isFinite(n)) return 0
  return negative ? -Math.abs(n) : n
}

type AmountColumnMap = {
  debitCol: string | null
  creditCol: string | null
  netBalanceCol: string | null
  closingDebitCol: string | null
  closingCreditCol: string | null
}

function getAmountColumns(colMap: ColumnMapping[]): AmountColumnMap {
  const getCol = (target: string): string | null =>
    colMap.find((m) => m.target === target)?.source ?? null
  return {
    debitCol: getCol("debit"),
    creditCol: getCol("credit"),
    netBalanceCol: getCol("netBalance"),
    closingDebitCol: getCol("closingDebit"),
    closingCreditCol: getCol("closingCredit"),
  }
}

/** Movement first; if row has no movement, use closing balance columns. */
function resolveRowDebitCredit(
  row: ParsedRow,
  cols: AmountColumnMap,
): { debit: number; credit: number } {
  const movD = cols.debitCol ? parseAmount(row[cols.debitCol]) : 0
  const movC = cols.creditCol ? parseAmount(row[cols.creditCol]) : 0
  const closeD = cols.closingDebitCol ? parseAmount(row[cols.closingDebitCol]) : 0
  const closeC = cols.closingCreditCol ? parseAmount(row[cols.closingCreditCol]) : 0

  if (movD !== 0 || movC !== 0) {
    return { debit: movD, credit: movC }
  }
  if (closeD !== 0 || closeC !== 0) {
    return { debit: closeD, credit: closeC }
  }
  if (cols.netBalanceCol) {
    const balance = parseAmount(row[cols.netBalanceCol])
    return balance >= 0
      ? { debit: balance, credit: 0 }
      : { debit: 0, credit: Math.abs(balance) }
  }
  return { debit: 0, credit: 0 }
}

function sumDebitCredit(
  rows: ParsedRow[],
  cols: AmountColumnMap,
  mode: "movement" | "resolved",
): { debits: number; credits: number } {
  let debits = 0
  let credits = 0
  rows.forEach((row) => {
    if (mode === "movement" && cols.debitCol && cols.creditCol) {
      debits += parseAmount(row[cols.debitCol])
      credits += parseAmount(row[cols.creditCol])
      return
    }
    const { debit, credit } = resolveRowDebitCredit(row, cols)
    debits += debit
    credits += credit
  })
  return { debits, credits }
}

function hasImportableAmountColumns(cols: AmountColumnMap): boolean {
  return Boolean(
    (cols.debitCol && cols.creditCol) ||
      cols.netBalanceCol ||
      cols.closingDebitCol ||
      cols.closingCreditCol,
  )
}

function normalizeHeader(col: string): string {
  return col.toLowerCase().replace(/[\s_\-/\\()]/g, "")
}

/** Exact / high-confidence Arabic & bilingual column labels (Saudi TB exports). */
const COLUMN_ALIASES: Record<string, string[]> = {
  accountCode: ["رقم الحساب", "رمز الحساب", "كود الحساب", "Account Code", "AccountCode"],
  accountName: ["اسم الحساب", "اسم الحسابات", "Account Name", "AccountName"],
  debit: [
    "حركة الفترة مدين",
    "حركة مدين",
    "مدين الفترة",
    "CurrentYearDebit",
    "Period Debit",
    "Debit",
  ],
  credit: [
    "حركة الفترة دائن",
    "حركة دائن",
    "دائن الفترة",
    "CurrentYearCredit",
    "Period Credit",
    "Credit",
  ],
  openingBalance: ["صافي الرصيد الافتتاحي", "الرصيد الافتتاحي", "Opening Balance"],
  priorYearBalance: ["رصيد العام السابق", "الرصيد السابق مدين", "Prior Year Balance"],
  closingDebit: ["الرصيد الحالي مدين", "الرصيد الختامي مدين", "Closing Debit"],
  closingCredit: ["الرصيد الحالي دائن", "الرصيد الختامي دائن", "Closing Credit"],
}

/** Columns that look like balances but must NOT be used as debit/credit movement or netBalance. */
function isClosingBalanceColumn(col: string): boolean {
  const raw = col.trim()
  const compact = raw.replace(/\s/g, "")
  return (
    /الرصيد\s*الحالي\s*مدين|الرصيد\s*الحالي\s*دائن|الرصيد\s*الختامي|الرصيد\s*السابق\s*مدين|الرصيد\s*السابق\s*دائن/i.test(raw) ||
    /الرصيدالحاليمدين|الرصيدالحاليدائن|الرصيدالختامي|الرصيدالسابقمدين/.test(compact)
  )
}

function isNetBalanceColumn(col: string): boolean {
  if (isClosingBalanceColumn(col)) return false
  const raw = col.trim()
  const cl = normalizeHeader(col)
  return (
    /صافي\s*الرصيد\s*الحالي|closingbalance|currentbalance|netcurrentbalance/i.test(raw) ||
    /صافيالرصيدالحالي/.test(cl.replace(/\s/g, ""))
  )
}

function matchColumnAlias(target: string, columns: string[]): string | undefined {
  const aliases = COLUMN_ALIASES[target] ?? []
  for (const alias of aliases) {
    const found = columns.find(
      (c) => c.trim() === alias || normalizeHeader(c) === normalizeHeader(alias),
    )
    if (found) return found
  }
  return undefined
}

interface ValidationCheck {
  label: string
  status: "valid" | "issue" | "error"
  detail: string
}

const FIELD_KEYS = [
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

const UNMAP_VALUE = "__unmap__"

function defaultMappings(): ColumnMapping[] {
  return FIELD_KEYS.map((key) => ({
    target: key,
    source: null,
    required: key === "accountCode" || key === "accountName",
  }))
}

const statusIcon = {
  valid: <CheckCircle className="size-3.5 text-green-600" />,
  issue: <AlertTriangle className="size-3.5 text-amber-600" />,
  error: <XCircle className="size-3.5 text-red-600" />,
}

const statusBadge: Record<string, string> = {
  valid: "bg-green-100 text-green-800 border-green-300",
  issue: "bg-amber-100 text-amber-800 border-amber-300",
  error: "bg-red-100 text-red-800 border-red-300",
}

function parseCSV(text: string): ParsedRow[] {
  const lines = text.split(/\r?\n/).filter(l => l.trim())
  if (lines.length < 2) return []
  const parseLine = (line: string): string[] => {
    const result: string[] = []
    let current = ""
    let inQuotes = false
    for (let i = 0; i < line.length; i++) {
      const ch = line[i]
      if (ch === '"') {
        if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
          current += '"'; i++
        } else {
          inQuotes = !inQuotes
        }
      } else if (ch === ',' && !inQuotes) {
        result.push(current.trim()); current = ""
      } else {
        current += ch
      }
    }
    result.push(current.trim())
    return result
  }
  const headers = parseLine(lines[0]).map(h => h.replace(/^"|"$/g, ""))
  const rows: ParsedRow[] = []
  for (let i = 1; i < lines.length; i++) {
    const values = parseLine(lines[i]).map(v => v.replace(/^"|"$/g, ""))
    if (values.length === 0 || (values.length === 1 && values[0] === "")) continue
    const row: ParsedRow = {}
    headers.forEach((h, idx) => { row[h] = values[idx] ?? "" })
    rows.push(row)
  }
  return rows
}

function parseXLSX(file: File): Promise<ParsedRow[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const XLSX = require("xlsx")
        const workbook = XLSX.read(data, { type: "array" })
        const sheet = workbook.Sheets[workbook.SheetNames[0]]
        const json: Record<string, string>[] = XLSX.utils.sheet_to_json(sheet, { defval: "" })
        const headers = Object.keys(json[0] ?? {})
        const rows: ParsedRow[] = json.map((row: Record<string, string>) => {
          const parsed: ParsedRow = {}
          headers.forEach(h => { parsed[h] = String(row[h] ?? "") })
          return parsed
        })
        resolve(rows)
      } catch (err) {
        reject(new Error("فشل في تحليل ملف XLSX"))
      }
    }
    reader.onerror = () => reject(new Error("فشل في قراءة الملف"))
    reader.readAsArrayBuffer(file)
  })
}

function computeValidation(rows: ParsedRow[], colMap: ColumnMapping[], t: (key: string, values?: Record<string, string | number | Date>) => string): ValidationCheck[] {
  const cols = getAmountColumns(colMap)
  const codeCol = colMap.find(m => m.target === "accountCode")?.source ?? null
  const nameCol = colMap.find(m => m.target === "accountName")?.source ?? null

  const dataRows = rows.filter((row) => {
    const code = codeCol ? (row[codeCol] ?? "").trim() : ""
    const name = nameCol ? (row[nameCol] ?? "").trim() : ""
    return code || name
  })

  const movementTotals =
    cols.debitCol && cols.creditCol
      ? sumDebitCredit(dataRows, cols, "movement")
      : null
  const resolvedTotals = sumDebitCredit(dataRows, cols, "resolved")

  const codeSet = new Set<string>()
  const duplicateCodes: string[] = []
  let emptyNames = 0
  let emptyCodes = 0
  let emptyBoth = 0

  rows.forEach((row) => {
    const code = codeCol ? (row[codeCol] ?? "").trim() : ""
    const name = nameCol ? (row[nameCol] ?? "").trim() : ""
    if (!code && !name) {
      emptyBoth++
      return
    }
    if (!code) emptyCodes++
    if (!name) emptyNames++
    if (code) {
      if (codeSet.has(code)) duplicateCodes.push(code)
      codeSet.add(code)
    }
  })

  const checks: ValidationCheck[] = [
    { label: t("rowCount"), status: rows.length > 0 ? "valid" : "error", detail: t("rowsParsed", { count: rows.length }) },
    { label: t("accountCodes"), status: emptyCodes > 0 ? "error" : "valid", detail: emptyCodes > 0 ? t("missingCode", { count: emptyCodes }) : t("allHaveCodes") },
    { label: t("accountNames"), status: emptyNames > 0 ? "error" : "valid", detail: emptyNames > 0 ? t("missingName", { count: emptyNames }) : t("allHaveNames") },
    { label: t("emptyRows"), status: emptyBoth > 0 ? "issue" : "valid", detail: emptyBoth > 0 ? t("emptyRowsDetail", { count: emptyBoth }) : t("noEmptyRows") },
    { label: t("duplicateCodes"), status: duplicateCodes.length > 0 ? "issue" : "valid", detail: duplicateCodes.length > 0 ? t("duplicateDetail", { codes: duplicateCodes.join("، ") }) : t("noDuplicates") },
  ]

  if (!hasImportableAmountColumns(cols)) {
    checks.push({ label: t("balance"), status: "error", detail: t("balanceColumnsMissing") })
    return checks
  }

  const resolvedVariance = resolvedTotals.debits - resolvedTotals.credits
  const resolvedBalanced = Math.abs(resolvedVariance) < 0.01

  if (movementTotals) {
    const movVar = movementTotals.debits - movementTotals.credits
    if (Math.abs(movVar) >= 0.01) {
      checks.push({
        label: t("balanceMovement"),
        status: "issue",
        detail: t("unbalancedDetail", {
          debits: movementTotals.debits.toLocaleString(),
          credits: movementTotals.credits.toLocaleString(),
          variance: Math.abs(movVar).toLocaleString(),
        }),
      })
    }
  }

  checks.push({
    label: t("balance"),
    status: resolvedBalanced ? "valid" : "issue",
    detail: resolvedBalanced
      ? t("balancedDetail", {
          debits: resolvedTotals.debits.toLocaleString(),
          credits: resolvedTotals.credits.toLocaleString(),
        })
      : `${t("unbalancedDetail", {
          debits: resolvedTotals.debits.toLocaleString(),
          credits: resolvedTotals.credits.toLocaleString(),
          variance: Math.abs(resolvedVariance).toLocaleString(),
        })} — ${t("balanceProceedHint")}`,
  })

  return checks
}

export function TrialBalanceUpload({ open, onClose, engagementId, onComplete }: TrialBalanceUploadProps) {
  const t = useTranslations("audit.trialBalanceUpload")
  const targetFields = [
    { key: "accountCode", label: t("accountCode"), required: true },
    { key: "accountName", label: t("accountName"), required: true },
    { key: "debit", label: t("debit"), required: false },
    { key: "credit", label: t("credit"), required: false },
    { key: "closingDebit", label: t("closingDebit"), required: false },
    { key: "closingCredit", label: t("closingCredit"), required: false },
    { key: "netBalance", label: t("netBalance"), required: false },
    { key: "openingBalance", label: t("openingBalance"), required: false },
    { key: "priorYearBalance", label: t("priorYearBalance"), required: false },
  ]
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

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
  }

  const autoDetectColumn = (target: string, columns: string[]): string | undefined => {
    const aliasMatch = matchColumnAlias(target, columns)
    if (aliasMatch) return aliasMatch

    for (const col of columns) {
      const cl = normalizeHeader(col)
      const raw = col.trim()

      if (target === "accountCode") {
        if (/accountcode|acctcode|glcode|ledgercode/.test(cl)) return col
        if (/^(code|codigo|kod)$/.test(cl)) return col
        if (/^رقمالحساب$/.test(cl.replace(/\s/g, ""))) return col
      }
      if (target === "accountName") {
        if (/accountname|acctname|glname|ledgername/.test(cl)) return col
        if (/^(name|description|desc)$/.test(cl)) return col
        if (/^اسمالحساب/.test(cl.replace(/\s/g, ""))) return col
      }
      if (target === "debit") {
        if (isClosingBalanceColumn(col) || isNetBalanceColumn(col)) continue
        if (/حركة.*مدين|مدين.*الفترة|period.*debit|debit.*period/.test(raw.replace(/\s/g, ""))) return col
        if (/^dr$/.test(cl) || cl.endsWith("debit") || cl.includes("debitamount")) return col
        if (/currentyeardebit|perioddebit/.test(cl)) return col
        if (/مدين/.test(raw) && !/دائن/.test(raw)) return col
      }
      if (target === "credit") {
        if (isClosingBalanceColumn(col) || isNetBalanceColumn(col)) continue
        if (/حركة.*دائن|دائن.*الفترة|period.*credit|credit.*period/.test(raw.replace(/\s/g, ""))) return col
        if (/^cr$/.test(cl) || cl.endsWith("credit") || cl.includes("creditamount")) return col
        if (/currentyearcredit|periodcredit/.test(cl)) return col
        if (/دائن/.test(raw) && !/مدين/.test(raw)) return col
      }
      if (target === "netBalance") {
        if (isNetBalanceColumn(col)) return col
        if (/^(balance|netbalance|amount|saldo)$/.test(cl)) return col
      }
      if (target === "closingDebit") {
        if (/الرصيد\s*الحالي\s*مدين|الرصيد\s*الختامي\s*مدين|closingdebit|currentdebit/i.test(raw)) return col
      }
      if (target === "closingCredit") {
        if (/الرصيد\s*الحالي\s*دائن|الرصيد\s*الختامي\s*دائن|closingcredit|currentcredit/i.test(raw)) return col
      }
      if (target === "openingBalance") {
        if (/opening|openbal|beginning/.test(cl)) return col
        if (/افتتاح/.test(raw) && !/حالي|ختام/i.test(raw)) return col
      }
      if (target === "priorYearBalance") {
        if (/prioryear|previousyear|lastyear|comparative/.test(cl)) return col
        if (/سابق|مقارن|العامالسابق/.test(raw.replace(/\s/g, ""))) return col
      }
    }
    return undefined
  }

  const updateMapping = (target: string, source: string | null) => {
    setMappings(prev => prev.map(m => m.target === target ? { ...m, source } : m))
  }

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

function extractClassificationHints(row: ParsedRow): string[] {
  const hints: string[] = [];
  for (const [key, value] of Object.entries(row)) {
    const label = key.trim();
    if (!/^mapping\s*\d/i.test(label)) continue;
    const text = String(value ?? "").trim();
    if (text) hints.push(text);
  }
  return hints;
}

  const handleConfirm = async () => {
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
  }

  const previewColumns = mappings.filter(m => m.source).map(m => m.source!)

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next) { reset(); onClose() } }}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>
            {t("stepDescription", { step, label: step === 1 ? t("step1") : step === 2 ? t("step2") : step === 3 ? t("step3") : t("step4") })}
          </DialogDescription>
        </DialogHeader>

        {importError && (
          <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 mx-4">
            <AlertTriangle className="size-4 shrink-0" /><span>{importError}</span>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4 py-4 px-4">
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 p-10 text-center hover:border-muted-foreground/50 transition-colors">
              <Upload className="size-8 text-muted-foreground mb-3" />
              <p className="text-sm font-medium mb-1">{t("dropFile")}</p>
              <p className="text-xs text-muted-foreground mb-4">{t("csvOnly")}</p>
              <Input
                type="file"
                accept=".csv,.xlsx"
                onChange={handleFileSelect}
                className="max-w-xs cursor-pointer"
              />
            </div>
            {fileName && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-3 py-2 rounded-md">
                <FileSpreadsheet className="size-4" />
                <span>{fileName}</span>
                {parsedRows.length > 0 && <Badge variant="outline">{parsedRows.length} rows</Badge>}
              </div>
            )}
          </div>
        )}

        {step === 2 && sourceColumns.length > 0 && (
          <div className="space-y-4 py-4 px-4">
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="bg-muted/50">{t("targetField")}</TableHead>
                    <TableHead className="bg-muted/50">{t("sourceColumn")}</TableHead>
                    <TableHead className="bg-muted/50">{t("required")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {targetFields.map(field => {
                    const mapping = mappings.find(m => m.target === field.key)!
                    return (
                      <TableRow key={field.key}>
                        <TableCell className="font-medium">
                          {field.label}
                          {field.required && <span className="text-destructive ml-1">*</span>}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Select
                              value={
                                mapping.source ??
                                (field.required ? undefined : UNMAP_VALUE)
                              }
                              onValueChange={(val) =>
                                updateMapping(
                                  field.key,
                                  val === UNMAP_VALUE ? null : val,
                                )
                              }
                            >
                              <SelectTrigger className="flex-1">
                                <SelectValue placeholder={t("selectColumn")} />
                              </SelectTrigger>
                              <SelectContent>
                                {!field.required && (
                                  <SelectItem value={UNMAP_VALUE}>
                                    {t("clearMapping")}
                                  </SelectItem>
                                )}
                                {sourceColumns.map((col) => (
                                  <SelectItem key={col} value={col}>
                                    {col}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </TableCell>
                        <TableCell>
                          {field.required
                            ? <Badge variant="destructive">{t("required")}</Badge>
                            : <Badge variant="outline">{t("optional")}</Badge>
                          }
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>

            {showNetBalanceWarning && (
              <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                <AlertTriangle className="size-4 shrink-0 mt-0.5" />
                <span>{t("netBalanceConflictHint")}</span>
              </div>
            )}

            {previewColumns.length > 0 && (
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {previewColumns.map(col => (
                        <TableHead key={col}>{col}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsedRows.slice(0, 5).map((row, i) => (
                      <TableRow key={i}>
                        {previewColumns.map(col => (
                          <TableCell key={col}>{row[col] || "-"}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="px-3 py-2 text-xs text-muted-foreground border-t bg-muted/30">
                  {t("showingRows", { total: parsedRows.length })}
                </div>
              </div>
            )}
          </div>
        )}

        {step === 3 && validationChecks.length > 0 && (
          <div className="space-y-4 py-4 px-4">
            {hasBalanceWarning && (
              <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                <AlertTriangle className="size-4 shrink-0 mt-0.5" />
                <span>{t("balanceProceedHint")}</span>
              </div>
            )}
            <div className="grid gap-2">
              {validationChecks.map((check, i) => (
                <div key={i} className="flex items-start gap-3 rounded-md border px-4 py-3">
                  <div className="mt-0.5">{statusIcon[check.status]}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-medium">{check.label}</span>
                      <Badge className={statusBadge[check.status]}>
                        {check.status === "valid" ? t("statusValid") : check.status === "issue" ? t("statusIssue") : t("statusError")}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{check.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4 py-4 px-4">
            <div className="rounded-md border divide-y">
              <div className="flex items-center justify-between px-4 py-2.5 text-sm">
                <span className="text-muted-foreground">{t("sourceFile")}</span>
                <span className="font-medium">{fileName}</span>
              </div>
              <div className="flex items-center justify-between px-4 py-2.5 text-sm">
                <span className="text-muted-foreground">{t("rowCount")}</span>
                <span className="font-medium">{parsedRows.length}</span>
              </div>
              <div className="flex items-center justify-between px-4 py-2.5 text-sm">
                <span className="text-muted-foreground">{t("mappedColumns")}</span>
                <span className="font-medium">{mappings.filter(m => m.source).length} / {targetFields.length}</span>
              </div>
              <div className="flex items-center justify-between px-4 py-2.5 text-sm">
                <span className="text-muted-foreground">{t("validation")}</span>
                <span className="font-medium">
                  {hasErrors ? (
                    <span className="text-red-600 flex items-center gap-1"><XCircle className="size-3.5" />{t("issuesFound")}</span>
                  ) : (
                    <span className="text-green-600 flex items-center gap-1"><CheckCircle className="size-3.5" />{t("allPassed")}</span>
                  )}
                </span>
              </div>
            </div>
            {importSuccess && (
              <div className="flex items-center gap-2 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
                <CheckCircle className="size-4 shrink-0" /><span>{t("importSuccess")}</span>
              </div>
            )}
          </div>
        )}

        <DialogFooter className="gap-2">
          {step > 1 && (
            <Button variant="outline" onClick={() => setStep(s => s - 1)} disabled={importing}>
              <ArrowLeft className="size-4" /> {t("back")}
            </Button>
          )}
          {step < 4 ? (
            <Button
              onClick={() => setStep(s => s + 1)}
              disabled={(step === 1 && !fileName) || (step === 2 && !requiredMapped) || (step === 3 && hasErrors)}
            >
              {t("next")} <ArrowRight className="size-4" />
            </Button>
          ) : (
            <Button onClick={handleConfirm} disabled={importing || importSuccess}>
              {importing ? t("importing") : importSuccess ? t("done") : t("import")}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
