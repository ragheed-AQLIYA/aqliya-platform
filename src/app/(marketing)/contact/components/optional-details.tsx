"use client";

import { productOptions, dataOptions } from "./use-contact-form";

type Props = {
  isAr: boolean;
  form: Record<string, string>;
  handleChange: (field: string, value: string) => void;
};

export function OptionalDetails({ isAr, form, handleChange }: Props) {
  return (
    <div className="space-y-5 border-t border-white/10 pt-5">
      <div>
        <label htmlFor="role" className="mb-1 block text-sm font-medium text-white">
          {isAr ? "الدور / المنصب" : "Role"}
        </label>
        <input
          id="role"
          type="text"
          value={form.role}
          onChange={(e) => handleChange("role", e.target.value)}
          className="w-full rounded-lg border border-white/10 bg-white/[0.06] px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-aqliya-cyan/50"
        />
      </div>
      <div>
        <label htmlFor="product" className="mb-1 block text-sm font-medium text-white">
          {isAr ? "الحل المهتم به" : "Solution of interest"}
        </label>
        <select
          id="product"
          value={form.product}
          onChange={(e) => handleChange("product", e.target.value)}
          className="w-full rounded-lg border border-white/10 bg-white/[0.06] px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-aqliya-cyan/50"
        >
          <option value="" className="bg-gray-900">
            {isAr ? "غير متأكد  أحتاج توجيهًا" : "Not sure  need guidance"}
          </option>
          {productOptions.map((opt) => (
            <option key={opt} value={opt} className="bg-gray-900">
              {opt}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="dataType" className="mb-1 block text-sm font-medium text-white">
          {isAr ? "نوع البيانات" : "Data type"}
        </label>
        <select
          id="dataType"
          value={form.dataType}
          onChange={(e) => handleChange("dataType", e.target.value)}
          className="w-full rounded-lg border border-white/10 bg-white/[0.06] px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-aqliya-cyan/50"
        >
          <option value="" className="bg-gray-900">
            {isAr ? "غير محدد" : "Not specified"}
          </option>
          {dataOptions.map((opt) => (
            <option key={opt} value={opt} className="bg-gray-900">
              {opt}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="goal" className="mb-1 block text-sm font-medium text-white">
          {isAr ? "الهدف من التجربة" : "Trial goal"}
        </label>
        <textarea
          id="goal"
          rows={2}
          value={form.goal}
          onChange={(e) => handleChange("goal", e.target.value)}
          className="w-full rounded-lg border border-white/10 bg-white/[0.06] px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-aqliya-cyan/50"
        />
      </div>
    </div>
  );
}
