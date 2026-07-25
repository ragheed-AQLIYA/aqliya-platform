import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { IndependenceState, IndependenceActions } from "./use-independence";
import { statusColor, threatLevelColor } from "./constants";

interface RegisterTabProps {
  state: IndependenceState;
  actions: IndependenceActions;
}

export function RegisterTab({ state, actions }: RegisterTabProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">سجل الاستقلالية</h3>
      </div>
      {state.register.length === 0 ? (
        <Card><CardContent className="p-6 text-center text-muted-foreground">سجل الاستقلالية فارغ</CardContent></Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {state.register.map((entry) => (
            <Card key={entry.id} className="cursor-pointer hover:border-primary/50" onClick={() => actions.setSelectedEntry(state.selectedEntry?.id === entry.id ? null : entry)}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{entry.entityName}</p>
                    <p className="text-xs text-muted-foreground">{entry.entityRole}</p>
                  </div>
                  <Badge className={statusColor(entry.status)}>{entry.status}</Badge>
                </div>
                <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
                  <span>مصالح: {entry.financialInterests?.length ?? 0}</span>
                  <span>علاقات: {entry.employmentRelationships?.length ?? 0}</span>
                  <span>تهديدات: {entry.threats?.length ?? 0}</span>
                </div>

                {state.selectedEntry?.id === entry.id && (
                  <div className="mt-3 border-t pt-3 space-y-3">
                    <div>
                      <p className="text-xs font-medium mb-1">المصالح المالية</p>
                      <div className="space-y-1">
                        {entry.financialInterests?.map((fi: any) => (
                          <div key={fi.id} className="text-xs flex justify-between bg-gray-50 p-1 rounded">
                            <span>{fi.issuerName} ({fi.interestType})</span>
                            {fi.amount && <span>{fi.amount.toLocaleString()} {fi.currency}</span>}
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2 mt-1">
                        <Input size={20} placeholder="المصدر" value={state.fiRegisterId === entry.id ? state.fiIssuer : ""}
                          onChange={e => { actions.setFiRegisterId(entry.id); actions.setFiIssuer(e.target.value); }} className="h-7 text-xs" />
                        <Button size="xs" variant="outline" onClick={() => {
                          actions.setFiRegisterId(entry.id); actions.setFiIssuer(state.fiRegisterId === entry.id ? state.fiIssuer : "");
                          if (state.fiRegisterId === entry.id && state.fiIssuer) actions.handleDeclareInterest(entry.id);
                        }}>إضافة</Button>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-medium mb-1">علاقات العمل</p>
                      {entry.employmentRelationships?.map((er: any) => (
                        <div key={er.id} className="text-xs bg-gray-50 p-1 rounded mb-1">
                          {er.relatedEntityName} — {er.relationshipType}
                        </div>
                      ))}
                    </div>

                    <div>
                      <p className="text-xs font-medium mb-1">التهديدات</p>
                      {entry.threats?.map((t: any) => (
                        <div key={t.id} className="text-xs bg-red-50 p-1 rounded mb-1 flex justify-between">
                          <span>{t.threatDescription}</span>
                          <Badge className={threatLevelColor(t.threatLevel)}>{t.threatLevel}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
