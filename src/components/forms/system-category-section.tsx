"use client";

import type { FormData, FormErrors } from "./constants";
import { systemCategories } from "./constants";
import { SectionLabel, CardSelect } from "./form-field-components";

export function SystemCategorySection({
  data,
  errors,
  update,
}: {
  data: FormData;
  errors: FormErrors;
  update: <K extends keyof FormData>(key: K, value: FormData[K]) => void;
}) {
  return (
    <section className="mt-6 rounded-[24px] border border-border/70 bg-background p-4 shadow-sm sm:p-6">
      <SectionLabel num="2" label="نوع النظام" />
      {errors.systemCategory && (
        <p className="mb-3 text-xs text-destructive">
          {errors.systemCategory}
        </p>
      )}
      <CardSelect
        items={systemCategories}
        selected={data.systemCategory}
        onChange={(id) => update("systemCategory", id)}
      />
    </section>
  );
}
