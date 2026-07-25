"use client"

import { useTranslations } from "next-intl"
import { Upload, FileSpreadsheet } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

interface StepFileUploadProps {
  fileName: string | null
  parsedRowCount: number
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export function StepFileUpload({ fileName, parsedRowCount, onFileSelect }: StepFileUploadProps) {
  const t = useTranslations("audit.trialBalanceUpload")

  return (
    <div className="space-y-4 py-4 px-4">
      <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 p-10 text-center hover:border-muted-foreground/50 transition-colors">
        <Upload className="size-8 text-muted-foreground mb-3" />
        <p className="text-sm font-medium mb-1">{t("dropFile")}</p>
        <p className="text-xs text-muted-foreground mb-4">{t("csvOnly")}</p>
        <Input
          type="file"
          accept=".csv,.xlsx"
          onChange={onFileSelect}
          className="max-w-xs cursor-pointer"
        />
      </div>
      {fileName && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-3 py-2 rounded-md">
          <FileSpreadsheet className="size-4" />
          <span>{fileName}</span>
          {parsedRowCount > 0 && <Badge variant="outline">{parsedRowCount} rows</Badge>}
        </div>
      )}
    </div>
  )
}
