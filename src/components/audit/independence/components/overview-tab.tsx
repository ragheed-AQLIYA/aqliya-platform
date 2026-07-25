import { Loader2, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { IndependenceState, IndependenceActions } from "./use-independence";
import { threatLevelColor } from "./constants";

interface OverviewTabProps {
  state: IndependenceState;
  actions: IndependenceActions;
}

export function OverviewTab({ state, actions }: OverviewTabProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground">إجمالي المسجلين</CardTitle>
          </CardHeader>
          <CardContent><p className="text-2xl font-bold">{state.dashboard?.totalRegistered ?? 0}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground">النشطون</CardTitle>
          </CardHeader>
          <CardContent><p className="text-2xl font-bold text-green-600">{state.dashboard?.activePersons ?? 0}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground">تهديدات مفتوحة</CardTitle>
          </CardHeader>
          <CardContent><p className="text-2xl font-bold text-amber-600">{state.dashboard?.openThreats ?? 0}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground">تأكيدات معلقة</CardTitle>
          </CardHeader>
          <CardContent><p className="text-2xl font-bold text-red-600">{state.dashboard?.pendingConfirmations ?? 0}</p></CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">تسجيل شخص جديد</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input value={state.newPersonId} onChange={e => actions.setNewPersonId(e.target.value)} placeholder="معرف المستخدم" />
            <Input value={state.newPersonName} onChange={e => actions.setNewPersonName(e.target.value)} placeholder="الاسم" />
            <Select value={state.newPersonRole} onValueChange={actions.setNewPersonRole}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="partner">شريك</SelectItem>
                <SelectItem value="manager">مدير</SelectItem>
                <SelectItem value="staff">موظف</SelectItem>
                <SelectItem value="affiliate">منتسب</SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm" onClick={actions.handleRegisterPerson} disabled={state.submitting}>
              {state.submitting ? <Loader2 className="ml-1 h-3 w-3 animate-spin" /> : <Plus className="ml-1 h-3 w-3" />}
              تسجيل
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">آخر التهديدات</CardTitle>
          </CardHeader>
          <CardContent>
            {state.dashboard?.recentThreats?.length > 0 ? (
              <div className="space-y-2">
                {state.dashboard.recentThreats.map((t: any) => (
                  <div key={t.id} className="flex items-center justify-between text-sm border-b pb-1">
                    <span className="truncate">{t.threatDescription}</span>
                    <Badge className={threatLevelColor(t.threatLevel)}>{t.threatLevel}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">لا توجد تهديدات مسجلة</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
