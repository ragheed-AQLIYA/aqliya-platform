"use client";

import type { FormData } from "./constants";
import { challenges, environments, outcomes } from "./constants";
import { SectionLabel, CheckboxGroup } from "./form-field-components";

export function ChallengesSection({
  data,
  toggleArray,
}: {
  data: FormData;
  toggleArray: (key: "challenges" | "environment" | "outcomes", id: string) => void;
}) {
  return (
    <section className="mt-6 rounded-[24px] border border-border/70 bg-background p-4 shadow-sm sm:p-6">
      <SectionLabel num="3" label="التحديات التشغيلية" />
      <CheckboxGroup
        items={challenges}
        selected={data.challenges}
        onChange={(id) => toggleArray("challenges", id)}
        label="اختر أكثر التحديات تأثيرًا على مؤسستك"
      />
    </section>
  );
}

export function EnvironmentSection({
  data,
  toggleArray,
}: {
  data: FormData;
  toggleArray: (key: "challenges" | "environment" | "outcomes", id: string) => void;
}) {
  return (
    <section className="mt-6 rounded-[24px] border border-border/70 bg-background p-4 shadow-sm sm:p-6">
      <SectionLabel num="4" label="البيئة الحالية" />
      <CheckboxGroup
        items={environments}
        selected={data.environment}
        onChange={(id) => toggleArray("environment", id)}
        label="ما الأنظمة والأدوات المستخدمة حاليًا؟"
      />
    </section>
  );
}

export function OutcomesSection({
  data,
  toggleArray,
}: {
  data: FormData;
  toggleArray: (key: "challenges" | "environment" | "outcomes", id: string) => void;
}) {
  return (
    <section className="mt-6 rounded-[24px] border border-border/70 bg-background p-4 shadow-sm sm:p-6">
      <SectionLabel num="5" label="المخرجات المستهدفة" />
      <CheckboxGroup
        items={outcomes}
        selected={data.outcomes}
        onChange={(id) => toggleArray("outcomes", id)}
        label="ماذا تريد أن يحقق النظام لمؤسستك؟"
      />
    </section>
  );
}
