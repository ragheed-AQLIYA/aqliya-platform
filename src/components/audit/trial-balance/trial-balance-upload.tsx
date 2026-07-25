"use client"

import { useTranslations } from "next-intl"
import { AlertTriangle, ArrowLeft, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import type { TrialBalanceUploadProps } from "./components/types"
import { useTrialBalanceUpload } from "./components/use-trial-balance-upload"
import { StepFileUpload } from "./components/step-file-upload"
import { StepColumnMapping } from "./components/step-column-mapping"
import { StepValidation } from "./components/step-validation"
import { StepConfirm } from "./components/step-confirm"

export function TrialBalanceUpload({ open, onClose, engagementId, onComplete }: TrialBalanceUploadProps) {
  const t = useTranslations("audit.trialBalanceUpload")
  const { state, actions } = useTrialBalanceUpload({ engagementId, onClose, onComplete })

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next) { actions.reset(); onClose() } }}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>
            {t("stepDescription", { step: state.step, label: state.step === 1 ? t("step1") : state.step === 2 ? t("step2") : state.step === 3 ? t("step3") : t("step4") })}
          </DialogDescription>
        </DialogHeader>

        {state.importError && (
          <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 mx-4">
            <AlertTriangle className="size-4 shrink-0" /><span>{state.importError}</span>
          </div>
        )}

        {state.step === 1 && (
          <StepFileUpload
            fileName={state.fileName}
            parsedRowCount={state.parsedRows.length}
            onFileSelect={actions.handleFileSelect}
          />
        )}

        {state.step === 2 && state.sourceColumns.length > 0 && (
          <StepColumnMapping
            sourceColumns={state.sourceColumns}
            mappings={state.mappings}
            targetFields={state.targetFields}
            parsedRows={state.parsedRows}
            showNetBalanceWarning={state.showNetBalanceWarning}
            onUpdateMapping={actions.updateMapping}
          />
        )}

        {state.step === 3 && state.validationChecks.length > 0 && (
          <StepValidation
            validationChecks={state.validationChecks}
            hasBalanceWarning={state.hasBalanceWarning}
          />
        )}

        {state.step === 4 && (
          <StepConfirm
            fileName={state.fileName}
            parsedRowCount={state.parsedRows.length}
            mappings={state.mappings}
            targetFieldsCount={state.targetFields.length}
            hasErrors={state.hasErrors}
            importSuccess={state.importSuccess}
          />
        )}

        <DialogFooter className="gap-2">
          {state.step > 1 && (
            <Button variant="outline" onClick={() => actions.setStep(s => s - 1)} disabled={state.importing}>
              <ArrowLeft className="size-4" /> {t("back")}
            </Button>
          )}
          {state.step < 4 ? (
            <Button
              onClick={() => actions.setStep(s => s + 1)}
              disabled={(state.step === 1 && !state.fileName) || (state.step === 2 && !state.requiredMapped) || (state.step === 3 && state.hasErrors)}
            >
              {t("next")} <ArrowRight className="size-4" />
            </Button>
          ) : (
            <Button onClick={actions.handleConfirm} disabled={state.importing || state.importSuccess}>
              {state.importing ? t("importing") : state.importSuccess ? t("done") : t("import")}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
