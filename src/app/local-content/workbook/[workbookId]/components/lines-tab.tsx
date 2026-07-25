import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SECTION_LABELS, CONFIDENCE_BADGES } from "./constants";
import type { WorkbookDetailActions, WorkbookDetailState } from "../use-workbook-detail";

interface Props {
  state: WorkbookDetailState;
  actions: WorkbookDetailActions;
}

export function LinesTab({ state, actions }: Props) {
  const { sections, editingLine, editValue, isLoading, isEditable } = state;

  return (
    <div className="space-y-6">
      {Object.entries(sections).map(([section, lines]) => (
        <div key={section}>
          <h3 className="text-sm font-semibold mb-2">
            {SECTION_LABELS[section] || section}
          </h3>
          <div className="space-y-1">
            {lines.map((line) => (
              <div
                key={line.id}
                className="flex items-center gap-3 p-2 border rounded text-sm hover:bg-muted/30"
              >
                <div className="w-16 text-xs text-muted-foreground font-mono">
                  {line.code}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate">{line.name}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {line.autoFilled && (
                      <Badge variant="secondary" className="text-[10px] px-1">
                        تلقائي
                      </Badge>
                    )}
                    {line.autoFillValue !== null && (
                      <span>
                        تلقائي: {line.autoFillValue.toLocaleString("ar-SA")}
                      </span>
                    )}
                    {line.manualValue !== null && (
                      <span className="text-green-600">
                        يدوي: {line.manualValue.toLocaleString("ar-SA")}
                      </span>
                    )}
                    {!line.autoFilled && line.manualValue === null && (
                      <span className="text-amber-500">ناقص</span>
                    )}
                    <Badge variant={CONFIDENCE_BADGES[line.confidence] || "outline"} className="text-[10px] px-1">
                      {line.confidence}
                    </Badge>
                    {line.evidenceRequired && (
                      <span className="text-blue-500">مطلوب إثبات</span>
                    )}
                  </div>
                </div>
                {editingLine === line.id ? (
                  <div className="flex items-center gap-2 shrink-0">
                    <Input
                      type="number"
                      value={editValue}
                      onChange={(e) => actions.setEditValue(e.target.value)}
                      className="w-28 h-8 text-sm"
                      placeholder="القيمة"
                    />
                    <Button
                      size="sm"
                      onClick={() => actions.handleSave(line.id)}
                      disabled={isLoading === line.id}
                    >
                      حفظ
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => actions.setEditingLine(null)}
                    >
                      إلغاء
                    </Button>
                  </div>
                ) : isEditable ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      actions.handleEdit(line.id, line.manualValue ?? line.autoFillValue)
                    }
                  >
                    إدخال
                  </Button>
                ) : (
                  <span className="text-xs text-muted-foreground px-2">
                    مقفل
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
