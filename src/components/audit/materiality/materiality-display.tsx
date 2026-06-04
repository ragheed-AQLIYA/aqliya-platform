"use client";

import {
  DollarSign,
  TrendingUp,
  Percent,
  Shield,
  FileText,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import type { MaterialityResult, MaterialityBasis } from "@/lib/audit/materiality-types";
import { formatMateriality } from "@/lib/audit/materiality-types";

interface MaterialityDisplayProps {
  result: MaterialityResult;
}

const BASIS_LABELS: Record<MaterialityBasis, string> = {
  revenue: "الإيرادات",
  total_assets: "إجمالي الأصول",
  net_income: "صافي الدخل",
  custom: "أساس مخصص",
};

export function MaterialityDisplay({ result }: MaterialityDisplayProps) {
  const { currency } = result;

  return (
    <Card className="rounded-[24px] border-blue-200 bg-blue-50 shadow-sm dark:border-blue-900 dark:bg-blue-950">
      <CardHeader className="border-b border-blue-100 dark:border-blue-900">
        <CardTitle className="flex items-center gap-2 text-lg">
          <DollarSign className="h-5 w-5 text-blue-600" />
          مستويات الأهمية النسبية
        </CardTitle>
        <CardDescription className="text-xs">
          بناءً على: {BASIS_LABELS[result.basis]} | {result.methodDescription} |{" "}
          {new Date(result.calculatedAt).toLocaleDateString("ar-SA", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-blue-200 bg-white p-4 dark:border-blue-800 dark:bg-blue-950">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <TrendingUp className="h-4 w-4" />
              <span>الأساس</span>
            </div>
            <p className="text-xl font-bold">
              {formatMateriality(result.basisAmount, currency)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {result.basisDescription} ({result.percentage * 100}%)
            </p>
          </div>

          <div className="rounded-xl border border-blue-200 bg-white p-4 dark:border-blue-800 dark:bg-blue-950">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <Percent className="h-4 w-4" />
              <span>الأهمية النسبية العامة</span>
            </div>
            <p className="text-xl font-bold text-blue-700">
              {formatMateriality(result.overallMateriality, currency)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              عتبة التحريف المقبول
            </p>
          </div>

          <div className="rounded-xl border border-amber-200 bg-white p-4 dark:border-amber-800 dark:bg-amber-950">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <Shield className="h-4 w-4" />
              <span>أداء الأهمية النسبية</span>
            </div>
            <p className="text-xl font-bold text-amber-700">
              {formatMateriality(result.performanceMateriality, currency)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              75% من الأهمية النسبية العامة
            </p>
          </div>

          <div className="rounded-xl border border-green-200 bg-white p-4 dark:border-green-800 dark:bg-green-950">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <FileText className="h-4 w-4" />
              <span>عتبة التافه الواضح</span>
            </div>
            <p className="text-xl font-bold text-green-700">
              {formatMateriality(result.clearlyTrivialThreshold, currency)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              5% من أداء الأهمية النسبية
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-lg border border-blue-100 bg-blue-50/50 p-3 text-xs text-blue-700 dark:border-blue-900 dark:bg-blue-950/50 dark:text-blue-300">
          <p className="font-medium mb-1">ملاحظات التطبيق:</p>
          <ul className="list-disc list-inside space-y-0.5">
            <li>
              التحريفات التي تتجاوز{" "}
              {formatMateriality(result.overallMateriality, currency)} تعتبر
              جوهرية
            </li>
            <li>
              التحريفات بين{" "}
              {formatMateriality(result.clearlyTrivialThreshold, currency)} و{" "}
              {formatMateriality(result.overallMateriality, currency)} تتطلب
              تقييمًا مهنياً
            </li>
            <li>
              التحريفات دون{" "}
              {formatMateriality(result.clearlyTrivialThreshold, currency)} تعتبر
              تافهة بشكل واضح
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
