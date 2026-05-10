"use client"

import { useState, useCallback } from "react"
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

interface ValidationCheck {
  label: string
  status: "valid" | "issue" | "error"
  detail: string
}

const targetFields = [
  { key: "accountCode", label: "Account Code", required: true },
  { key: "accountName", label: "Account Name", required: true },
  { key: "debit", label: "Debit", required: false },
  { key: "credit", label: "Credit", required: false },
  { key: "openingBalance", label: "Opening Balance", required: false },
  { key: "priorYearBalance", label: "Prior Year Balance", required: false },
]

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
        reject(new Error("Failed to parse XLSX file"))
      }
    }
    reader.onerror = () => reject(new Error("Failed to read file"))
    reader.readAsArrayBuffer(file)
  })
}

function computeValidation(rows: ParsedRow[], colMap: ColumnMapping[]): ValidationCheck[] {
  const getCol = (target: string): string | null => colMap.find(m => m.target === target)?.source ?? null
  const codeCol = getCol("accountCode")
  const nameCol = getCol("accountName")
  const debitCol = getCol("debit")
  const creditCol = getCol("credit")

  const totalDebits = rows.reduce((s, r) => s + (debitCol ? (parseFloat(r[debitCol] || "0") || 0) : 0), 0)
  const totalCredits = rows.reduce((s, r) => s + (creditCol ? (parseFloat(r[creditCol] || "0") || 0) : 0), 0)

  const codeSet = new Set<string>()
  const duplicateCodes: string[] = []
  let emptyNames = 0
  let emptyCodes = 0
  let emptyBoth = 0

  rows.forEach((row, i) => {
    const code = codeCol ? (row[codeCol] ?? "").trim() : ""
    const name = nameCol ? (row[nameCol] ?? "").trim() : ""
    if (!code && !name) { emptyBoth++ }
    if (!code) { emptyCodes++ }
    if (!name) { emptyNames++ }
    if (code) {
      if (codeSet.has(code)) duplicateCodes.push(code)
      codeSet.add(code)
    }
  })

  const isBalanced = debitCol && creditCol ? Math.abs(totalDebits - totalCredits) < 0.01 : true

  return [
    { label: "Row Count", status: rows.length > 0 ? "valid" : "error", detail: `${rows.length} rows parsed` },
    { label: "Account Codes", status: emptyCodes > 0 ? "error" : "valid", detail: emptyCodes > 0 ? `${emptyCodes} row(s) missing account code` : "All rows have codes" },
    { label: "Account Names", status: emptyNames > 0 ? "error" : "valid", detail: emptyNames > 0 ? `${emptyNames} row(s) missing account name` : "All rows have names" },
    { label: "Empty Rows", status: emptyBoth > 0 ? "issue" : "valid", detail: emptyBoth > 0 ? `${emptyBoth} completely empty row(s) found` : "No empty rows" },
    { label: "Duplicate Codes", status: duplicateCodes.length > 0 ? "issue" : "valid", detail: duplicateCodes.length > 0 ? `Duplicates: ${duplicateCodes.join(", ")}` : "No duplicates" },
    ...(debitCol && creditCol ? [{ label: "Balance", status: (isBalanced ? "valid" : "error") as "valid" | "error", detail: isBalanced ? `Debits (${totalDebits.toLocaleString()}) = Credits (${totalCredits.toLocaleString()})` : `Total debits (${totalDebits.toLocaleString()}) != total credits (${totalCredits.toLocaleString()})` }] : []),
  ]
}

export function TrialBalanceUpload({ open, onClose, engagementId, onComplete }: TrialBalanceUploadProps) {
  const [step, setStep] = useState(1)
  const [fileName, setFileName] = useState<string | null>(null)
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([])
  const [sourceColumns, setSourceColumns] = useState<string[]>([])
  const [mappings, setMappings] = useState<ColumnMapping[]>(
    targetFields.map(f => ({ target: f.key, source: null, required: f.required }))
  )
  const [importing, setImporting] = useState(false)
  const [importError, setImportError] = useState<string | null>(null)
  const [importSuccess, setImportSuccess] = useState(false)

  const reset = useCallback(() => {
    setStep(1)
    setFileName(null)
    setParsedRows([])
    setSourceColumns([])
    setMappings(targetFields.map(f => ({ target: f.key, source: null, required: f.required })))
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
        setImportError("Unsupported file format. Use .csv or .xlsx")
        return
      }
      if (rows.length === 0) {
        setImportError("No data rows found in file")
        return
      }
      setParsedRows(rows)
      const cols = Object.keys(rows[0] ?? {})
      setSourceColumns(cols)
      const autoMappings = targetFields.map(f => ({
        target: f.key,
        source: autoDetectColumn(f.key, cols) ?? null,
        required: f.required,
      }))
      setMappings(autoMappings)
    } catch (err) {
      setImportError(err instanceof Error ? err.message : "Failed to parse file")
    }
  }

  const autoDetectColumn = (target: string, columns: string[]): string | undefined => {
    for (const col of columns) {
      const cl = col.toLowerCase().replace(/[\s_-]/g, "")
      if (target === "accountCode" && (cl.includes("accountcode") || cl.includes("code") || cl.includes("acctcode"))) return col
      if (target === "accountName" && (cl.includes("accountname") || cl.includes("name") || cl.includes("account"))) return col
      if (target === "debit" && (cl === "debit" || cl === "dr" || cl.includes("debitamount"))) return col
      if (target === "credit" && (cl === "credit" || cl === "cr" || cl.includes("creditamount"))) return col
      if (target === "openingBalance" && (cl.includes("opening") || cl.includes("openbal"))) return col
      if (target === "priorYearBalance" && (cl.includes("prioryear") || cl.includes("prior") || cl.includes("previous"))) return col
    }
    return undefined
  }

  const updateMapping = (target: string, source: string | null) => {
    setMappings(prev => prev.map(m => m.target === target ? { ...m, source } : m))
  }

  const requiredMapped = mappings.filter(m => m.required).every(m => m.source)
  const validationChecks = parsedRows.length > 0 ? computeValidation(parsedRows, mappings) : []
  const hasErrors = validationChecks.some(c => c.status === "error")

  const handleConfirm = async () => {
    if (!fileName) return
    setImporting(true)
    setImportError(null)
    try {
      const codeCol = mappings.find(m => m.target === "accountCode")?.source
      const nameCol = mappings.find(m => m.target === "accountName")?.source
      const debitCol = mappings.find(m => m.target === "debit")?.source
      const creditCol = mappings.find(m => m.target === "credit")?.source
      if (!codeCol || !nameCol) throw new Error("Account Code and Name mappings are required")

      const rows = parsedRows.map(r => ({
        accountCode: (r[codeCol] ?? "").trim(),
        accountName: (r[nameCol] ?? "").trim(),
        debit: debitCol ? (parseFloat(r[debitCol] || "0") || 0) : 0,
        credit: creditCol ? (parseFloat(r[creditCol] || "0") || 0) : 0,
      })).filter(r => r.accountCode && r.accountName)

      if (rows.length === 0) throw new Error("No valid rows after filtering")

      await uploadTrialBalanceAction(engagementId, fileName, rows)
      setImportSuccess(true)
      setTimeout(() => { reset(); onClose(); onComplete() }, 800)
    } catch (err) {
      setImportError(err instanceof Error ? err.message : "Import failed")
    } finally {
      setImporting(false)
    }
  }

  const previewColumns = mappings.filter(m => m.source).map(m => m.source!)

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next) { reset(); onClose() } }}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Trial Balance</DialogTitle>
          <DialogDescription>
            Step {step} of 4: {step === 1 ? "Upload" : step === 2 ? "Column Mapping" : step === 3 ? "Validation" : "Confirm"}
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
              <p className="text-sm font-medium mb-1">Drop your file here or click to browse</p>
              <p className="text-xs text-muted-foreground mb-4">CSV or XLSX files only</p>
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
                    <TableHead className="bg-muted/50">Target Field</TableHead>
                    <TableHead className="bg-muted/50">Source Column</TableHead>
                    <TableHead className="bg-muted/50">Required</TableHead>
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
                          <Select
                            value={mapping.source || ""}
                            onValueChange={(val) => updateMapping(field.key, val || null)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="-- Select column --" />
                            </SelectTrigger>
                            <SelectContent>
                              {sourceColumns.map(col => (
                                <SelectItem key={col} value={col}>{col}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          {field.required
                            ? <Badge variant="destructive">Required</Badge>
                            : <Badge variant="outline">Optional</Badge>
                          }
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>

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
                  Showing 5 of {parsedRows.length} rows
                </div>
              </div>
            )}
          </div>
        )}

        {step === 3 && validationChecks.length > 0 && (
          <div className="space-y-4 py-4 px-4">
            <div className="grid gap-2">
              {validationChecks.map((check, i) => (
                <div key={i} className="flex items-start gap-3 rounded-md border px-4 py-3">
                  <div className="mt-0.5">{statusIcon[check.status]}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-medium">{check.label}</span>
                      <Badge className={statusBadge[check.status]}>
                        {check.status === "valid" ? "VALID" : check.status === "issue" ? "ISSUE" : "ERROR"}
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
                <span className="text-muted-foreground">Source File</span>
                <span className="font-medium">{fileName}</span>
              </div>
              <div className="flex items-center justify-between px-4 py-2.5 text-sm">
                <span className="text-muted-foreground">Rows Detected</span>
                <span className="font-medium">{parsedRows.length}</span>
              </div>
              <div className="flex items-center justify-between px-4 py-2.5 text-sm">
                <span className="text-muted-foreground">Mapped Columns</span>
                <span className="font-medium">{mappings.filter(m => m.source).length} / {targetFields.length}</span>
              </div>
              <div className="flex items-center justify-between px-4 py-2.5 text-sm">
                <span className="text-muted-foreground">Validation</span>
                <span className="font-medium">
                  {hasErrors ? (
                    <span className="text-red-600 flex items-center gap-1"><XCircle className="size-3.5" />Issues found</span>
                  ) : (
                    <span className="text-green-600 flex items-center gap-1"><CheckCircle className="size-3.5" />All passed</span>
                  )}
                </span>
              </div>
            </div>
            {importSuccess && (
              <div className="flex items-center gap-2 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
                <CheckCircle className="size-4 shrink-0" /><span>Trial balance imported successfully</span>
              </div>
            )}
          </div>
        )}

        <DialogFooter className="gap-2">
          {step > 1 && (
            <Button variant="outline" onClick={() => setStep(s => s - 1)} disabled={importing}>
              <ArrowLeft className="size-4" /> Back
            </Button>
          )}
          {step < 4 ? (
            <Button
              onClick={() => setStep(s => s + 1)}
              disabled={(step === 1 && !fileName) || (step === 2 && !requiredMapped) || (step === 3 && hasErrors)}
            >
              Next <ArrowRight className="size-4" />
            </Button>
          ) : (
            <Button onClick={handleConfirm} disabled={importing || importSuccess}>
              {importing ? "Importing..." : importSuccess ? "Done" : "Import Trial Balance"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
