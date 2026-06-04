"use client";

import { useState } from "react";
import { generateAuditSamplingAction } from "@/actions/audit-actions";
import type { SamplingMethod, SamplingResult } from "@/lib/audit/sampling";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const METHOD_LABELS: Record<SamplingMethod, string> = {
  random: "عشوائي",
  high_value: "قيمة عالية",
  monetary_unit: "وحدة نقدية",
  stratified: "طبقي",
  systematic: "نظامي",
};

interface AuditSamplingFormProps {
  engagementId: string;
  lineCount: number;
}

export function AuditSamplingForm({
  engagementId,
  lineCount,
}: AuditSamplingFormProps) {
  const [result, setResult] = useState<SamplingResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [method, setMethod] = useState<SamplingMethod>("random");

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setError(null);
    try {
      const selectedMethod =
        (formData.get("method") as SamplingMethod) ?? "random";
      const confidenceRaw = formData.get("confidenceLevel");
      const marginRaw = formData.get("marginOfError");
      const intervalRaw = formData.get("interval");
      const randomStartRaw = formData.get("randomStart");

      const generated = await generateAuditSamplingAction({
        engagementId,
        method: selectedMethod,
        sampleSize: Number(formData.get("sampleSize") ?? 10),
        seed: (formData.get("seed") as string) || undefined,
        materialityThreshold: formData.get("materialityThreshold")
          ? Number(formData.get("materialityThreshold"))
          : undefined,
        confidenceLevel: confidenceRaw
          ? Number(confidenceRaw)
          : undefined,
        marginOfError: marginRaw ? Number(marginRaw) : undefined,
        interval: intervalRaw ? Number(intervalRaw) : undefined,
        randomStart: randomStartRaw ? Number(randomStartRaw) : undefined,
      });
      setResult(generated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر توليد العينة");
      setResult(null);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">معاملات العينة</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-3 max-w-md">
            <div>
              <label htmlFor="method" className="text-sm">
                الأسلوب
              </label>
              <select
                id="method"
                name="method"
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm mt-1"
                defaultValue="random"
                onChange={(e) =>
                  setMethod(e.target.value as SamplingMethod)
                }
              >
                <option value="random">عشوائي (بذرة ثابتة)</option>
                <option value="high_value">قيمة عالية</option>
                <option value="monetary_unit">وحدة نقدية (ترتيب بالرصيد)</option>
                <option value="stratified">طبقي (توزيع نسبي)</option>
                <option value="systematic">نظامي (فترة ثابتة)</option>
              </select>
            </div>
            <div>
              <label htmlFor="sampleSize" className="text-sm">
                حجم العينة
              </label>
              <input
                id="sampleSize"
                name="sampleSize"
                type="number"
                min={1}
                max={lineCount}
                defaultValue={Math.min(10, lineCount)}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label htmlFor="confidenceLevel" className="text-sm">
                  مستوى الثقة
                </label>
                <select
                  id="confidenceLevel"
                  name="confidenceLevel"
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm mt-1"
                  defaultValue="0.95"
                >
                  <option value="0.9">90%</option>
                  <option value="0.95">95%</option>
                  <option value="0.99">99%</option>
                </select>
              </div>
              <div>
                <label htmlFor="marginOfError" className="text-sm">
                  هامش الخطأ (نسبة)
                </label>
                <input
                  id="marginOfError"
                  name="marginOfError"
                  type="number"
                  step="0.01"
                  min={0.01}
                  max={0.2}
                  defaultValue={0.05}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm mt-1"
                />
              </div>
            </div>
            <div>
              <label htmlFor="seed" className="text-sm">
                بذرة (اختياري)
              </label>
              <input
                id="seed"
                name="seed"
                type="text"
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm mt-1"
                placeholder="لإعادة نفس العينة"
              />
            </div>
            {(method === "high_value" || method === "monetary_unit") && (
              <div>
                <label htmlFor="materialityThreshold" className="text-sm">
                  عتبة الأهمية النسبية (للقيمة العالية)
                </label>
                <input
                  id="materialityThreshold"
                  name="materialityThreshold"
                  type="number"
                  min={0}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm mt-1"
                />
              </div>
            )}
            {method === "systematic" && (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label htmlFor="interval" className="text-sm">
                    الفترة (interval)
                  </label>
                  <input
                    id="interval"
                    name="interval"
                    type="number"
                    min={1}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm mt-1"
                  />
                </div>
                <div>
                  <label htmlFor="randomStart" className="text-sm">
                    بداية عشوائية
                  </label>
                  <input
                    id="randomStart"
                    name="randomStart"
                    type="number"
                    min={0}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm mt-1"
                  />
                </div>
              </div>
            )}
            <Button type="submit" size="sm" disabled={pending}>
              {pending ? "جاري التوليد…" : "توليد العينة"}
            </Button>
          </form>
          {error && (
            <p className="mt-3 text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">نتيجة العينة</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-muted-foreground">{result.disclaimer}</p>
            <div className="flex flex-wrap gap-2 text-xs">
              <Badge variant="outline">
                {METHOD_LABELS[result.method] ?? result.method}
              </Badge>
              <Badge variant="outline">n={result.sampleSize}</Badge>
              <Badge variant="outline">seed={result.seed.slice(0, 8)}…</Badge>
            </div>
            {result.statistics && (
              <div className="rounded-md border bg-muted/30 p-3 text-xs space-y-1">
                <p>
                  ثقة {(result.statistics.confidenceLevel * 100).toFixed(0)}% —
                  حجم موصى به ≥ {result.statistics.recommendedMinSampleSize}
                </p>
                <p className="text-muted-foreground">
                  هامش خطأ: {result.statistics.marginOfError.toFixed(2)} · σ=
                  {result.statistics.standardDeviation.toFixed(2)}
                </p>
              </div>
            )}
            {result.strata && result.strata.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b text-muted-foreground">
                      <th className="text-start py-1">الطبقة</th>
                      <th className="text-end py-1">عينة</th>
                      <th className="text-end py-1">رصيد</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.strata.map((s) => (
                      <tr key={s.label} className="border-b border-muted/40">
                        <td className="py-1">{s.label}</td>
                        <td className="py-1 text-end">
                          {s.sampleItems}/{s.populationItems}
                        </td>
                        <td className="py-1 text-end tabular-nums">
                          {s.totalBalance.toLocaleString("ar-SA")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground">
                    <th className="text-start py-1">الحساب</th>
                    <th className="text-end py-1">الرصيد</th>
                  </tr>
                </thead>
                <tbody>
                  {result.selectedItems.map((row) => (
                    <tr key={row.id} className="border-b border-muted/40">
                      <td className="py-1">
                        {row.accountCode} — {row.accountName}
                      </td>
                      <td className="py-1 text-end tabular-nums">
                        {row.balance.toLocaleString("ar-SA")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
