import { Loader2, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { IndependenceState, IndependenceActions } from "./use-independence";

interface ThreatsTabProps {
  state: IndependenceState;
  actions: IndependenceActions;
}

export function ThreatsTab({ state, actions }: ThreatsTabProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">تسجيل تهديد جديد</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <Select value={state.threatRegisterId} onValueChange={actions.setThreatRegisterId}>
            <SelectTrigger><SelectValue placeholder="اختر الشخص" /></SelectTrigger>
            <SelectContent>
              {state.register.filter((r: any) => r.status === "active").map((r: any) => (
                <SelectItem key={r.id} value={r.id}>{r.entityName}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={state.threatCategory} onValueChange={actions.setThreatCategory}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {state.threatCategories.map((c: any) => (
                <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={state.threatLevel} onValueChange={actions.setThreatLevel}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="low">منخفض</SelectItem>
              <SelectItem value="moderate">متوسط</SelectItem>
              <SelectItem value="significant">كبير</SelectItem>
            </SelectContent>
          </Select>
          <div className="sm:col-span-2">
            <Textarea value={state.threatDescription} onChange={e => actions.setThreatDescription(e.target.value)}
              placeholder="وصف التهديد..." className="min-h-[60px]" />
          </div>
          <Button size="sm" onClick={actions.handleIdentifyThreat} disabled={state.submitting}>
            {state.submitting ? <Loader2 className="ml-1 h-3 w-3 animate-spin" /> : <AlertTriangle className="ml-1 h-3 w-3" />}
            تسجيل التهديد
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">التهديدات المسجلة</CardTitle>
        </CardHeader>
        <CardContent>
          {state.dashboard?.openThreats === 0 ? (
            <p className="text-sm text-muted-foreground">لا توجد تهديدات مفتوحة</p>
          ) : (
            <p className="text-sm">{state.dashboard?.openThreats ?? 0} تهديد مفتوح</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
