import { Loader2, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import type { IndependenceState, IndependenceActions } from "./use-independence";
import { statusColor, threatLevelColor } from "./constants";

interface ConflictCheckTabProps {
  state: IndependenceState;
  actions: IndependenceActions;
}

export function ConflictCheckTab({ state, actions }: ConflictCheckTabProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">فحص تضارب المصالح</CardTitle>
          <CardDescription>أدخل اسم العميل لفحص التعارض مع جميع المسجلين</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input value={state.conflictClientName} onChange={e => actions.setConflictClientName(e.target.value)}
              placeholder="اسم العميل أو الشركة" />
            <Button onClick={actions.handleConflictCheck} disabled={state.submitting}>
              {state.submitting ? <Loader2 className="ml-1 h-3 w-3 animate-spin" /> : <Search className="ml-1 h-3 w-3" />}
              فحص
            </Button>
          </div>

          {state.conflictResult && (
            <div className="border rounded-md p-3 space-y-2">
              <div className="flex items-center justify-between">
                <Badge className={statusColor(state.conflictResult.status)}>
                  {state.conflictResult.status === "passed" ? "لا يوجد تضارب" : `تضارب (${state.conflictResult.totalConflicts})`}
                </Badge>
              </div>
              {state.conflictResult.conflicts?.map((c: any, i: number) => (
                <div key={i} className="flex items-center justify-between text-sm border-b pb-1">
                  <span>{c.personName} — {c.description}</span>
                  <Badge className={threatLevelColor(c.severity === "high" ? "significant" : "moderate")}>
                    {c.severity}
                  </Badge>
                </div>
              ))}
              {state.conflictResult.status === "passed" && (
                <p className="text-sm text-green-600">لا توجد تعارضات مع هذا العميل</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
