import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  RefreshCw,
  Download,
  PlusCircle,
} from "lucide-react";
import { TbImportDialog } from "../tb-import-dialog";
import type { WorkbookWithLines } from "@/lib/local-content/workbook/types";
import type { WorkbookDetailActions, WorkbookDetailState } from "../use-workbook-detail";
import { STATUS_LABELS } from "./constants";

interface Props {
  workbook: WorkbookWithLines;
  state: WorkbookDetailState;
  actions: WorkbookDetailActions;
}

export function WorkbookHeader({ workbook, state, actions }: Props) {
  const { isLoading, isEditable, canExport, canImportTb } = state;

  return (
    <div className="flex items-center justify-between flex-wrap gap-2">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">{workbook.title}</h1>
          <Badge>{STATUS_LABELS[workbook.status] || workbook.status}</Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          الفترة: {workbook.reportingPeriod} | إجمالي البنود:{" "}
          {workbook.totalLines}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={actions.handleRecalculate}
          disabled={isLoading === "recalc" || !isEditable}
        >
          <RefreshCw
            className={`h-4 w-4 ml-1 ${isLoading === "recalc" ? "animate-spin" : ""}`}
          />
          إعادة احتساب
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={actions.handleExport}
          disabled={isLoading === "export" || !canExport}
          title={!canExport ? "يجب إكمال الدفتر أولاً" : undefined}
        >
          <Download className="h-4 w-4 ml-1" />
          تصدير
        </Button>
        {workbook.status !== "exported" && (
          <Button
            variant="default"
            size="sm"
            onClick={actions.handleFinalizeExport}
            disabled={isLoading === "finalize" || !canExport}
            title={!canExport ? "يجب إكمال الدفتر أولاً" : "إنهاء التصدير ومنع التعديل"}
          >
            إنهاء التصدير
          </Button>
        )}
        <TbImportDialog
          workbookId={workbook.id}
          projectId={workbook.projectId}
          disabled={!canImportTb}
        />
        <Button
          size="sm"
          onClick={actions.handleGenerateRequest}
          disabled={isLoading === "gen-request" || !isEditable}
        >
          <PlusCircle className="h-4 w-4 ml-1" />
          إنشاء طلب بيانات
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={actions.handleComputeScore}
          disabled={isLoading === "score"}
        >
          احتساب النتيجة
        </Button>
      </div>
    </div>
  );
}
