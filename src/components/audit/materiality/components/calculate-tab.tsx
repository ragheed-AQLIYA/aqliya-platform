"use client";

import { Calculator, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TabsContent } from "@/components/ui/tabs";

interface CalculateTabProps {
  loading: boolean;
  error: string | null;
  success: string | null;
  methodologies: { benchmarkType: string; label: string; description: string; percentageDefault: number; percentageMin: number; percentageMax: number }[];
  selectedMethodology: string;
  percentage: string;
  benchmarkValue: string;
  currency: string;
  rationale: string;
  onMethodologyChange: (value: string) => void;
  onPercentageChange: (value: string) => void;
  onBenchmarkValueChange: (value: string) => void;
  onCurrencyChange: (value: string) => void;
  onRationaleChange: (value: string) => void;
  onCalculate: () => void;
}

export function CalculateTab({
  loading,
  error,
  success,
  methodologies,
  selectedMethodology,
  percentage,
  benchmarkValue,
  currency,
  rationale,
  onMethodologyChange,
  onPercentageChange,
  onBenchmarkValueChange,
  onCurrencyChange,
  onRationaleChange,
  onCalculate,
}: CalculateTabProps) {
  const activeMethod = methodologies.find((m) => m.benchmarkType === selectedMethodology);

  return (
    <TabsContent value="calculate" className="space-y-4">
      <Card className="rounded-[24px] border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            حاسبة الأهمية النسبية
          </CardTitle>
          <CardDescription>
            احسب مستويات الأهمية النسبية لمهمة المراجعة وفقاً لـ ISA 320
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>المنهجية</Label>
              <Select value={selectedMethodology} onValueChange={onMethodologyChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {methodologies.map((m) => (
                    <SelectItem key={m.benchmarkType} value={m.benchmarkType}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {activeMethod && (
                <p className="text-xs text-muted-foreground">{activeMethod.description}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>النسبة المئوية (%)</Label>
              <Input
                type="number"
                step="0.1"
                min="0.1"
                max="100"
                value={percentage}
                onChange={(e) => onPercentageChange(e.target.value)}
              />
              {activeMethod && (
                <p className="text-xs text-muted-foreground">
                  المدى: {(activeMethod.percentageMin * 100).toFixed(1)}% – {(activeMethod.percentageMax * 100).toFixed(1)}%
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>قيمة الأساس</Label>
              <Input
                type="number"
                value={benchmarkValue}
                onChange={(e) => onBenchmarkValueChange(e.target.value)}
                placeholder="10000000"
              />
            </div>

            <div className="space-y-2">
              <Label>العملة</Label>
              <Input
                value={currency}
                onChange={(e) => onCurrencyChange(e.target.value)}
                placeholder="SAR"
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label>مبررات الاختيار (اختياري)</Label>
              <Input
                value={rationale}
                onChange={(e) => onRationaleChange(e.target.value)}
                placeholder="سبب اختيار هذا الأساس والنسبة"
              />
            </div>
          </div>

          {error && (
            <div className="mt-4 flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {success && (
            <div className="mt-4 flex items-center gap-2 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              {success}
            </div>
          )}

          <Button
            className="mt-4"
            onClick={onCalculate}
            disabled={loading || !benchmarkValue}
          >
            {loading ? (
              <Loader2 className="ml-2 h-4 w-4 animate-spin" />
            ) : (
              <Calculator className="ml-2 h-4 w-4" />
            )}
            {loading ? "جارٍ الحساب..." : "احسب الأهمية النسبية"}
          </Button>
        </CardContent>
      </Card>
    </TabsContent>
  );
}
