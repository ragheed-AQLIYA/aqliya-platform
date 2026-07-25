"use client"

import { useTranslations } from "next-intl"
import { CheckCircle, XCircle } from "lucide-react"
import type { ColumnMapping } from "./types"

interface StepConfirmProps {
  fileName: string | null
  parsedRowCount: number
  mappings: ColumnMapping[]
  targetFieldsCount: number
  hasErrors: boolean
  importSuccess: boolean
}

export function StepConfirm({
  fileName,
  parsedRowCount,
  mappings,
  targetFieldsCount,
  hasErrors,
  importSuccess,
}: StepConfirmProps) {
  const t = useTranslations("audit.trialBalanceUpload")

  return (
    <div className="space-y-4 py-4 px-4">
      <div className="rounded-md border divide-y">
        <div className="flex items-center justify-between px-4 py-2.5 text-sm">
          <span className="text-muted-foreground">{t("sourceFile")}</span>
          <span className="font-medium">{fileName}</span>
        </div>
        <div className="flex items-center justify-between px-4 py-2.5 text-sm">
          <span className="text-muted-foreground">{t("rowCount")}</span>
          <span className="font-medium">{parsedRowCount}</span>
        </div>
        <div className="flex items-center justify-between px-4 py-2.5 text-sm">
          <span className="text-muted-foreground">{t("mappedColumns")}</span>
          <span className="font-medium">{mappings.filter(m => m.source).length} / {targetFieldsCount}</span>
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
  )
}
