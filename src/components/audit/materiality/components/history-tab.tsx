"use client";

import { History } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TabsContent } from "@/components/ui/tabs";
import type { MaterialitySet } from "../use-materiality";

interface HistoryTabProps {
  history: MaterialitySet[];
  formatAmount: (value: number) => string;
  onLoadHistory: () => void;
}

export function HistoryTab({ history, formatAmount, onLoadHistory }: HistoryTabProps) {
  return (
    <TabsContent value="history" className="space-y-4">
      <Card className="rounded-[24px] border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            سجل الأهمية النسبية
          </CardTitle>
          <CardDescription>جميع إصدارات حساب الأهمية النسبية</CardDescription>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <p className="text-muted-foreground">لا يوجد سجل سابق</p>
          ) : (
            <div className="space-y-3">
              {history.map((h, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="font-medium">الإصدار {history.length - i}</p>
                    <p className="text-sm text-muted-foreground">
                      العامة: {formatAmount(h.planningMateriality)} | الأداء:{" "}
                      {formatAmount(h.performanceMateriality)}
                    </p>
                  </div>
                  <Badge
                    className={
                      h.status === "approved"
                        ? "bg-green-100 text-green-800"
                        : "bg-amber-100 text-amber-800"
                    }
                  >
                    {h.status === "approved" ? "معتمد" : "مسودة"}
                  </Badge>
                </div>
              ))}
            </div>
          )}
          <Button variant="outline" className="mt-4" onClick={onLoadHistory}>
            <History className="ml-2 h-4 w-4" />
            تحميل السجل
          </Button>
        </CardContent>
      </Card>
    </TabsContent>
  );
}
