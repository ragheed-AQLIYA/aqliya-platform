"use client";

import { Loader2, CheckCircle2, TrendingUp, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TabsContent } from "@/components/ui/tabs";
import type { MaterialitySet } from "../use-materiality";

interface CurrentMaterialityTabProps {
  current: MaterialitySet | null;
  loading: boolean;
  formatAmount: (value: number) => string;
  onApprove: () => void;
  onGenerateWorkingPaper: () => void;
}

export function CurrentMaterialityTab({
  current,
  loading,
  formatAmount,
  onApprove,
  onGenerateWorkingPaper,
}: CurrentMaterialityTabProps) {
  return (
    <TabsContent value="current" className="space-y-4">
      <Card className="rounded-[24px] border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            مستويات الأهمية النسبية الحالية
          </CardTitle>
          <CardDescription>
            آخر حساب للأهمية النسبية لهذه المهمة
          </CardDescription>
        </CardHeader>
        <CardContent>
          {current ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <Badge
                  className={
                    current.status === "approved"
                      ? "bg-green-100 text-green-800"
                      : "bg-amber-100 text-amber-800"
                  }
                >
                  {current.status === "approved" ? "معتمد" : "مسودة"}
                </Badge>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                  <p className="text-sm text-blue-600 mb-1 font-medium">
                    الأهمية النسبية العامة
                  </p>
                  <p className="text-2xl font-bold text-blue-700">
                    {formatAmount(current.planningMateriality)}
                  </p>
                  <p className="text-xs text-blue-500 mt-1">
                    {(current.percentage * 100).toFixed(1)}% من الأساس
                  </p>
                </div>
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <p className="text-sm text-amber-600 mb-1 font-medium">
                    أداء الأهمية النسبية
                  </p>
                  <p className="text-2xl font-bold text-amber-700">
                    {formatAmount(current.performanceMateriality)}
                  </p>
                  <p className="text-xs text-amber-500 mt-1">
                    {(current.performancePercentage * 100).toFixed(0)}% من العامة
                  </p>
                </div>
                <div className="rounded-xl border border-green-200 bg-green-50 p-4">
                  <p className="text-sm text-green-600 mb-1 font-medium">
                    عتبة التافه الواضح
                  </p>
                  <p className="text-2xl font-bold text-green-700">
                    {formatAmount(current.trivialThreshold)}
                  </p>
                  <p className="text-xs text-green-500 mt-1">
                    {(current.trivialPercentage * 100).toFixed(0)}% من العامة
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                {current.status !== "approved" && (
                  <Button onClick={onApprove} disabled={loading}>
                    {loading ? (
                      <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="ml-2 h-4 w-4" />
                    )}
                    اعتماد الأهمية النسبية
                  </Button>
                )}
                <Button variant="outline" onClick={onGenerateWorkingPaper} disabled={loading}>
                  <FileText className="ml-2 h-4 w-4" />
                  إنشاء ورقة العمل
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">
              لم يتم حساب الأهمية النسبية بعد. استخدم تبويب "حساب" لبدء الحساب.
            </p>
          )}
        </CardContent>
      </Card>
    </TabsContent>
  );
}
