"use client"

import { useTranslations } from "next-intl"
import { CheckCircle, AlertTriangle, XCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { ValidationCheck } from "./types"

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

interface StepValidationProps {
  validationChecks: ValidationCheck[]
  hasBalanceWarning: boolean
}

export function StepValidation({ validationChecks, hasBalanceWarning }: StepValidationProps) {
  const t = useTranslations("audit.trialBalanceUpload")

  return (
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
  )
}
