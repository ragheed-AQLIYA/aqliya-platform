"use client";

import { useState } from "react";
import {
  Calculator,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MaterialityDisplay } from "./materiality-display";
import { calculateMaterialityAction } from "@/actions/audit-materiality-actions";
import type { MaterialityResult } from "@/lib/audit/materiality-types";

interface MaterialityCalculatorFormProps {
  engagementId: string;
}

const BASIS_OPTIONS = [
  { value: "revenue", label: "نسبة من الإيرادات (0.5%)" },
  { value: "total_assets", label: "نسبة من إجمالي الأصول (1%)" },
  { value: "net_income", label: "نسبة من صافي الدخل (5%)" },
  { value: "custom", label: "نسبة مخصصة" },
] as const;

export function MaterialityCalculatorForm({
  engagementId,
}: MaterialityCalculatorFormProps) {
  const [basis, setBasis] = useState<string>("revenue");
  const [customPercentage, setCustomPercentage] = useState<string>("0.5");
  const [customBasisAmount, setCustomBasisAmount] = useState<string>("");
  const [overrideThreshold, setOverrideThreshold] = useState<string>("");
  const [result, setResult] = useState<MaterialityResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCalculate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await calculateMaterialityAction(engagementId, {
        basis: basis as MaterialityResult["basis"],
        customPercentage: basis === "custom" ? Number(customPercentage) / 100 : undefined,
        customBasisAmount: basis === "custom" ? Number(customBasisAmount) : undefined,
        overrideThreshold: overrideThreshold ? Number(overrideThreshold) : undefined,
      });
      setResult(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : "فشل حساب الأهمية النسبية");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      <Card className="rounded-[24px] border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            حاسبة الأهمية النسبية
          </CardTitle>
          <CardDescription>
            احسب مستويات الأهمية النسبية لمهمة المراجعة بناءً على أساس مالي
            محدد.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>أساس الحساب</Label>
              <Select value={basis} onValueChange={(v) => setBasis(v!)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BASIS_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {basis === "custom" && (
              <>
                <div className="space-y-2">
                  <Label>النسبة المئوية (%)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0.1"
                    max="100"
                    value={customPercentage}
                    onChange={(e) => setCustomPercentage(e.target.value)}
                    placeholder="0.5"
                  />
                </div>
                <div className="space-y-2">
                  <Label>مبلغ الأساس المخصص</Label>
                  <Input
                    type="number"
                    value={customBasisAmount}
                    onChange={(e) => setCustomBasisAmount(e.target.value)}
                    placeholder="10000000"
                  />
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label>حد يدوي (اختياري)</Label>
              <Input
                type="number"
                value={overrideThreshold}
                onChange={(e) => setOverrideThreshold(e.target.value)}
                placeholder="اترك فارغاً للحساب التلقائي"
              />
            </div>
          </div>

          {error && (
            <div className="mt-4 flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <Button
            className="mt-4"
            onClick={handleCalculate}
            disabled={loading}
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

      {result && <MaterialityDisplay result={result} />}
    </div>
  );
}
