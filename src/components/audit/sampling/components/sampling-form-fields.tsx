"use client";

import type { SamplingMethod } from "@/lib/audit/sampling";
import { Button } from "@/components/ui/button";

interface SamplingFormFieldsProps {
  method: SamplingMethod;
  pending: boolean;
  error: string | null;
  lineCount: number;
  onMethodChange: (method: SamplingMethod) => void;
  handleSubmit: (formData: FormData) => Promise<void>;
}

export function SamplingFormFields({
  method,
  pending,
  error,
  lineCount,
  onMethodChange,
  handleSubmit,
}: SamplingFormFieldsProps) {
  return (
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
          onChange={(e) => onMethodChange(e.target.value as SamplingMethod)}
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
      {error && (
        <p className="mt-3 text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
