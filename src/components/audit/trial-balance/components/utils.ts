import type { ParsedRow, ColumnMapping, AmountColumnMap, ValidationCheck } from "./types"

export function parseAmount(raw: string | undefined | null): number {
  if (raw == null) return 0
  let s = String(raw).trim()
  if (!s || s === "-" || s === "—") return 0

  let negative = false
  if (/^\(.*\)$/.test(s)) {
    negative = true
    s = s.slice(1, -1)
  }

  s = s.replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)))
  s = s.replace(/[^\d.,\-]/g, "")
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

export function getAmountColumns(colMap: ColumnMapping[]): AmountColumnMap {
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

export function resolveRowDebitCredit(
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

export function sumDebitCredit(
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

export function hasImportableAmountColumns(cols: AmountColumnMap): boolean {
  return Boolean(
    (cols.debitCol && cols.creditCol) ||
      cols.netBalanceCol ||
      cols.closingDebitCol ||
      cols.closingCreditCol,
  )
}

export function normalizeHeader(col: string): string {
  return col.toLowerCase().replace(/[\s_\-/\\()]/g, "")
}

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

export function isClosingBalanceColumn(col: string): boolean {
  const raw = col.trim()
  const compact = raw.replace(/\s/g, "")
  return (
    /الرصيد\s*الحالي\s*مدين|الرصيد\s*الحالي\s*دائن|الرصيد\s*الختامي|الرصيد\s*السابق\s*مدين|الرصيد\s*السابق\s*دائن/i.test(raw) ||
    /الرصيدالحاليمدين|الرصيدالحاليدائن|الرصيدالختامي|الرصيدالسابقمدين/.test(compact)
  )
}

export function isNetBalanceColumn(col: string): boolean {
  if (isClosingBalanceColumn(col)) return false
  const raw = col.trim()
  const cl = normalizeHeader(col)
  return (
    /صافي\s*الرصيد\s*الحالي|closingbalance|currentbalance|netcurrentbalance/i.test(raw) ||
    /صافيالرصيدالحالي/.test(cl.replace(/\s/g, ""))
  )
}

export function matchColumnAlias(target: string, columns: string[]): string | undefined {
  const aliases = COLUMN_ALIASES[target] ?? []
  for (const alias of aliases) {
    const found = columns.find(
      (c) => c.trim() === alias || normalizeHeader(c) === normalizeHeader(alias),
    )
    if (found) return found
  }
  return undefined
}

export function autoDetectColumn(target: string, columns: string[]): string | undefined {
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

export function parseCSV(text: string): ParsedRow[] {
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

export function parseXLSX(file: File): Promise<ParsedRow[]> {
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
      } catch {
        reject(new Error("فشل في تحليل ملف XLSX"))
      }
    }
    reader.onerror = () => reject(new Error("فشل في قراءة الملف"))
    reader.readAsArrayBuffer(file)
  })
}

export function extractClassificationHints(row: ParsedRow): string[] {
  const hints: string[] = [];
  for (const [key, value] of Object.entries(row)) {
    const label = key.trim();
    if (!/^mapping\s*\d/i.test(label)) continue;
    const text = String(value ?? "").trim();
    if (text) hints.push(text);
  }
  return hints;
}

export function computeValidation(rows: ParsedRow[], colMap: ColumnMapping[], t: (key: string, values?: Record<string, string | number | Date>) => string): ValidationCheck[] {
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
