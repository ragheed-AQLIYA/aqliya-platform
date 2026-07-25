"use client";

import type { FormData, FormErrors } from "./constants";
import { industries, sizes, countries } from "./constants";
import { SectionLabel, SelectField, TextField } from "./form-field-components";

export function OrganizationInfoSection({
  data,
  errors,
  update,
}: {
  data: FormData;
  errors: FormErrors;
  update: <K extends keyof FormData>(key: K, value: FormData[K]) => void;
}) {
  return (
    <section className="rounded-[24px] border border-border/70 bg-background p-4 shadow-sm sm:p-6">
      <SectionLabel num="1" label="معلومات المؤسسة" />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          id="orgName"
          label="اسم المؤسسة"
          value={data.orgName}
          onChange={(v) => update("orgName", v)}
          placeholder="الاسم التجاري للمؤسسة"
          required
          error={errors.orgName}
        />
        <SelectField
          id="industry"
          label="القطاع"
          value={data.industry}
          options={industries}
          onChange={(v) => update("industry", v)}
          required
          error={errors.industry}
        />
        <SelectField
          id="orgSize"
          label="حجم المؤسسة"
          value={data.orgSize}
          options={sizes}
          onChange={(v) => update("orgSize", v)}
          required
          error={errors.orgSize}
        />
        <SelectField
          id="country"
          label="الدولة"
          value={data.country}
          options={countries}
          onChange={(v) => update("country", v)}
          required
          error={errors.country}
        />
      </div>
    </section>
  );
}
