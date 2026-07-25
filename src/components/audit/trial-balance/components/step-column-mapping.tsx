"use client"

import { useTranslations } from "next-intl"
import { AlertTriangle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table"
import type { ParsedRow, ColumnMapping } from "./types"
import { UNMAP_VALUE } from "./types"

interface StepColumnMappingProps {
  sourceColumns: string[]
  mappings: ColumnMapping[]
  targetFields: { key: string; label: string; required: boolean }[]
  parsedRows: ParsedRow[]
  showNetBalanceWarning: boolean
  onUpdateMapping: (target: string, source: string | null) => void
}

export function StepColumnMapping({
  sourceColumns,
  mappings,
  targetFields,
  parsedRows,
  showNetBalanceWarning,
  onUpdateMapping,
}: StepColumnMappingProps) {
  const t = useTranslations("audit.trialBalanceUpload")
  const previewColumns = mappings.filter(m => m.source).map(m => m.source!)

  return (
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
                          onUpdateMapping(
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
  )
}
