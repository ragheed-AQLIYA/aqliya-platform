import { Loader2, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { IndependenceState, IndependenceActions } from "./use-independence";

interface ConfirmationTabProps {
  state: IndependenceState;
  actions: IndependenceActions;
}

export function ConfirmationTab({ state, actions }: ConfirmationTabProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">التأكيد السنوي للاستقلالية</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <Label>السنة</Label>
              <Input value={state.confirmYear} onChange={e => actions.setConfirmYear(e.target.value)} />
            </div>
            <Button onClick={actions.handleCreateConfirmationCycle} disabled={state.submitting}>
              {state.submitting ? <Loader2 className="ml-1 h-3 w-3 animate-spin" /> : <FileText className="ml-1 h-3 w-3" />}
              إنشاء دورة التأكيد
            </Button>
          </div>

          {state.confirmStatus && (
            <div className="grid grid-cols-3 gap-2 mt-2">
              <Card><CardContent className="p-2 text-center"><p className="text-lg font-bold">{state.confirmStatus.completed}</p><p className="text-xs">مكتمل</p></CardContent></Card>
              <Card><CardContent className="p-2 text-center"><p className="text-lg font-bold text-amber-600">{state.confirmStatus.pending}</p><p className="text-xs">معلق</p></CardContent></Card>
              <Card><CardContent className="p-2 text-center"><p className="text-lg font-bold text-red-600">{state.confirmStatus.flagged}</p><p className="text-xs">ملحوظ</p></CardContent></Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
