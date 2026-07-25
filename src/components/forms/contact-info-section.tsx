"use client";

import type { FormData, FormErrors } from "./constants";
import { SectionLabel, TextField } from "./form-field-components";

export function ContactInfoSection({
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
      <SectionLabel num="7" label="معلومات التواصل" />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          id="contactName"
          label="الاسم"
          value={data.contactName}
          onChange={(v) => update("contactName", v)}
          placeholder="الاسم الكامل"
          required
          error={errors.contactName}
        />
        <TextField
          id="contactRole"
          label="المنصب"
          value={data.contactRole}
          onChange={(v) => update("contactRole", v)}
          placeholder="المسمى الوظيفي"
        />
        <TextField
          id="contactEmail"
          label="البريد الإلكتروني"
          value={data.contactEmail}
          onChange={(v) => update("contactEmail", v)}
          placeholder="email@organization.com"
          type="email"
          required
          error={errors.contactEmail}
          dir="ltr"
        />
        <TextField
          id="contactPhone"
          label="رقم الهاتف"
          value={data.contactPhone}
          onChange={(v) => update("contactPhone", v)}
          placeholder="+966 5X XXX XXXX"
          type="tel"
          required
          error={errors.contactPhone}
          dir="ltr"
        />
      </div>
      <div className="mt-4 space-y-1.5">
        <label className="text-sm font-medium">ملاحظات إضافية</label>
        <textarea
          value={data.notes}
          onChange={(e) => update("notes", e.target.value)}
          placeholder="أي تفاصيل إضافية عن احتياجك أو مشروعك..."
          rows={3}
          className="w-full resize-none rounded-lg border border-border/70 bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>
    </section>
  );
}
