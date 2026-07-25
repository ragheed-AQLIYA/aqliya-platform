import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { WorkbookWithLines } from "@/lib/local-content/workbook/types";

interface Props {
  workbook: WorkbookWithLines;
}

export function CompletionBar({ workbook }: Props) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">نسبة الإنجاز</span>
          <span className="text-sm font-medium">{workbook.completionPct}%</span>
        </div>
        <Progress value={workbook.completionPct} className="h-3" />
        <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
          <span>✓ {workbook.autoFilledLines} تلقائي</span>
          <span>✎ {workbook.lines.filter((l) => l.manualValue !== null).length} يدوي</span>
          <span className="text-amber-500">⚠ {workbook.missingLines} ناقص</span>
        </div>
      </CardContent>
    </Card>
  );
}
