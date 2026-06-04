"use client";

import { useState } from "react";
import { generateAuditSamplingAction } from "@/actions/audit-actions";
import type { SamplingResult } from "@/lib/audit/sampling";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setError(null);
    try {
      const generated = await generateAuditSamplingAction({
        engagementId,
        method:
          (formData.get("method") as "random" | "high_value" | "monetary_unit") ??
          "random",
        sampleSize: Number(formData.get("sampleSize") ?? 10),
        seed: (formData.get("seed") as string) || undefined,
        materialityThreshold: formData.get("materialityThreshold")
          ? Number(formData.get("materialityThreshold"))
          : undefined,
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
              >
                <option value="random">عشوائي (بذرة ثابتة)</option>
                <option value="high_value">قيمة عالية</option>
                <option value="monetary_unit">وحدة نقدية (ترتيب بالرصيد)</option>
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
              <Badge variant="outline">{result.method}</Badge>
              <Badge variant="outline">n={result.sampleSize}</Badge>
              <Badge variant="outline">seed={result.seed}</Badge>
            </div>
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
