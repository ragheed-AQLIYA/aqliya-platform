"use client";

import type { FormData, FormErrors } from "./constants";
import { intents } from "./constants";
import { SectionLabel, SelectField } from "./form-field-components";

export function IntentSection({
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
      <SectionLabel num="6" label="هدف التواصل" />
      <SelectField
        id="intent"
        label="ما الهدف من تواصلك؟"
        value={data.intent}
        options={intents}
        onChange={(v) => update("intent", v)}
        required
        error={errors.intent}
      />
    </section>
  );
}
