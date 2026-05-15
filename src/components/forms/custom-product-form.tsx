"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";

// ─── Data ───

const industries = [
  { value: "", label: "اختر القطاع..." },
  { value: "financial_services", label: "الخدمات المالية" },
  { value: "audit_accounting", label: "المراجعة والمحاسبة" },
  { value: "consulting", label: "الاستشارات" },
  { value: "oil_gas", label: "النفط والغاز" },
  { value: "construction", label: "الإنشاءات" },
  { value: "retail_wholesale", label: "التجزئة والجملة" },
  { value: "healthcare", label: "الرعاية الصحية" },
  { value: "technology", label: "التقنية" },
  { value: "manufacturing", label: "التصنيع" },
  { value: "logistics", label: "الخدمات اللوجستية" },
  { value: "government", label: "القطاع الحكومي" },
  { value: "education", label: "التعليم" },
  { value: "real_estate", label: "العقارات" },
  { value: "other", label: "قطاع آخر" },
];

const sizes = [
  { value: "", label: "اختر الحجم..." },
  { value: "1_10", label: "١–١٠ موظفين" },
  { value: "11_50", label: "١١–٥٠ موظفًا" },
  { value: "51_200", label: "٥١–٢٠٠ موظف" },
  { value: "201_500", label: "٢٠١–٥٠٠ موظف" },
  { value: "501_plus", label: "+٥٠٠ موظف" },
];

const countries = [
  { value: "", label: "اختر الدولة..." },
  { value: "sa", label: "المملكة العربية السعودية" },
  { value: "ae", label: "الإمارات العربية المتحدة" },
  { value: "kw", label: "الكويت" },
  { value: "qa", label: "قطر" },
  { value: "bh", label: "البحرين" },
  { value: "om", label: "عُمان" },
  { value: "eg", label: "مصر" },
  { value: "jo", label: "الأردن" },
  { value: "other", label: "دولة أخرى" },
];

const systemCategories = [
  {
    id: "decision",
    label: "أنظمة اتخاذ القرار",
    desc: "تنظيم القرارات المعقدة من المشكلة إلى التوصية والاعتماد",
  },
  {
    id: "simulation",
    label: "أنظمة المحاكاة",
    desc: "اختبار السيناريوهات قبل التنفيذ وفهم الأثر والمخاطر",
  },
  {
    id: "sales",
    label: "أنظمة المبيعات",
    desc: "تأهيل العملاء وترتيب الأولويات وتحسين الأداء",
  },
  {
    id: "audit",
    label: "أنظمة المراجعة والتدقيق",
    desc: "تنظيم المراجعة والأدلة والملاحظات والمخرجات",
  },
  {
    id: "local_content",
    label: "أنظمة المحتوى المحلي",
    desc: "إدارة الموردين والإنفاق والالتزام والمؤشرات",
  },
  {
    id: "custom",
    label: "نظام مؤسسي مخصص",
    desc: "نظام يُبنى بالكامل حسب طبيعة عمل مؤسستك",
  },
];

const challenges = [
  { id: "slow_decisions", label: "بطء في اتخاذ القرارات" },
  { id: "fragmented_workflows", label: "إجراءات متفرقة وغير مترابطة" },
  { id: "manual_audit", label: "مراجعة وتدقيق يدوية" },
  { id: "weak_traceability", label: "ضعف التتبع والمراجعة" },
  { id: "disconnected_data", label: "بيانات منفصلة غير متصلة" },
  { id: "forecasting_gaps", label: "ضعف القدرة على التنبؤ والتخطيط" },
  { id: "sales_visibility", label: "غياب رؤية واضحة لأداء المبيعات" },
  {
    id: "local_content_compliance",
    label: "صعوبة الالتزام بمتطلبات المحتوى المحلي",
  },
  { id: "reporting_burden", label: "عبء إعداد التقارير" },
  { id: "excel_dependency", label: "اعتماد مفرط على Excel والملفات اليدوية" },
  { id: "other_challenge", label: "تحديات أخرى" },
];

const environments = [
  { id: "erp", label: "نظام ERP" },
  { id: "spreadsheets", label: "Excel / أوراق عمل" },
  { id: "legacy", label: "أنظمة قديمة (Legacy)" },
  { id: "manual", label: "إجراءات ورقية / يدوية" },
  { id: "mixed", label: "خليط من أنظمة متفرقة" },
  { id: "none", label: "لا يوجد نظام حالي" },
];

const outcomes = [
  { id: "automation", label: "أتمتة الإجراءات" },
  { id: "visibility", label: "وضوح البيانات والمؤشرات" },
  { id: "operational_control", label: "تحكم تشغيلي أفضل" },
  { id: "reporting", label: "تقارير دقيقة ومؤتمتة" },
  { id: "auditability", label: "قابلية المراجعة والتتبع" },
  { id: "simulation", label: "محاكاة السيناريوهات" },
  { id: "forecasting", label: "التنبؤ والتخطيط" },
  { id: "compliance", label: "الالتزام والامتثال" },
  { id: "traceability", label: "تتبع كامل للمخرجات" },
];

const intents = [
  { value: "", label: "اختر هدف التواصل..." },
  { value: "exploratory", label: "نقاش استكشافي — فهم الإمكانيات" },
  { value: "demo", label: "طلب عرض توضيحي — مشاهدة نظام حي" },
  { value: "pilot", label: "مشروع تجريبي — تطبيق مبدئي" },
  { value: "full_build", label: "بناء نظام كامل — جاهز للتشغيل" },
];

// ─── Types ───

type FormData = {
  orgName: string;
  industry: string;
  orgSize: string;
  country: string;
  systemCategory: string;
  challenges: string[];
  environment: string[];
  outcomes: string[];
  intent: string;
  contactName: string;
  contactRole: string;
  contactEmail: string;
  contactPhone: string;
  notes: string;
};

const initialData: FormData = {
  orgName: "",
  industry: "",
  orgSize: "",
  country: "",
  systemCategory: "",
  challenges: [],
  environment: [],
  outcomes: [],
  intent: "",
  contactName: "",
  contactRole: "",
  contactEmail: "",
  contactPhone: "",
  notes: "",
};

// ─── Helpers ───

function buildMailtoLink(data: FormData): string {
  const subject = encodeURIComponent(`طلب تصميم نظام مؤسسي | ${data.orgName}`);
  const body = encodeURIComponent(
    `طلب تصميم نظام مؤسسي من AQLIYA\n\n` +
      `المؤسسة: ${data.orgName}\nالقطاع: ${industries.find((i) => i.value === data.industry)?.label ?? data.industry}\n` +
      `الحجم: ${sizes.find((s) => s.value === data.orgSize)?.label ?? data.orgSize}\nالدولة: ${countries.find((c) => c.value === data.country)?.label ?? data.country}\n\n` +
      `نوع النظام: ${systemCategories.find((c) => c.id === data.systemCategory)?.label ?? data.systemCategory}\n\n` +
      `التحديات: ${data.challenges.map((c) => challenges.find((x) => x.id === c)?.label ?? c).join("، ")}\n` +
      `البيئة الحالية: ${data.environment.map((e) => environments.find((x) => x.id === e)?.label ?? e).join("، ")}\n` +
      `المخرجات المطلوبة: ${data.outcomes.map((o) => outcomes.find((x) => x.id === o)?.label ?? o).join("، ")}\n` +
      `هدف التواصل: ${intents.find((i) => i.value === data.intent)?.label ?? data.intent}\n\n` +
      `الاسم: ${data.contactName}\nالمنصب: ${data.contactRole}\n` +
      `البريد: ${data.contactEmail}\nالهاتف: ${data.contactPhone}\n\n` +
      `ملاحظات: ${data.notes || "لا يوجد"}\n\n` +
      `---\nمرسل من: AQLIYA Custom Product Request\nhttps://aqliya.com/custom-product`,
  );
  return `mailto:ragheed@aqliya.com?subject=${subject}&body=${body}`;
}

// ─── Components ───

function SectionLabel({ num, label }: { num: string; label: string }) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
        {num}
      </span>
      <h2 className="text-base font-black">{label}</h2>
    </div>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
  required,
  id,
  error,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
  required?: boolean;
  id: string;
  error?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
        {required ? " *" : ""}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-border/70 bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        aria-invalid={error ? "true" : "false"}
        aria-describedby={error ? `${id}-error` : undefined}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} disabled={o.value === ""}>
            {o.label}
          </option>
        ))}
      </select>
      {error && (
        <p id={`${id}-error`} className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

function CardSelect({
  items,
  selected,
  onChange,
}: {
  items: { id: string; label: string; desc: string }[];
  selected: string;
  onChange: (id: string) => void;
}) {
  return (
    <div
      className="grid gap-3 sm:grid-cols-2"
      role="radiogroup"
      aria-label="نوع النظام"
    >
      {items.map((item) => {
        const active = selected === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onChange(active ? "" : item.id)}
            className={cn(
              "rounded-2xl border border-border/70 p-4 text-right transition-all sm:p-5",
              active
                ? "border-primary/40 bg-primary/[0.04] ring-1 ring-primary/20"
                : "bg-background hover:border-muted-foreground/20 hover:bg-muted/30",
            )}
            aria-pressed={active}
          >
            <div className="flex items-start justify-between gap-3">
              <span
                className={cn(
                  "text-sm font-semibold",
                  active && "text-primary",
                )}
              >
                {item.label}
              </span>
              <span
                className={cn(
                  "mt-0.5 h-4 w-4 shrink-0 rounded-full border-2",
                  active
                    ? "border-primary bg-primary"
                    : "border-muted-foreground/30",
                )}
              />
            </div>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              {item.desc}
            </p>
          </button>
        );
      })}
    </div>
  );
}

function CheckboxGroup({
  items,
  selected,
  onChange,
  label,
}: {
  items: { id: string; label: string }[];
  selected: string[];
  onChange: (id: string) => void;
  label: string;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">{label}</label>
      <div className="flex flex-wrap gap-2" role="group" aria-label={label}>
        {items.map((item) => {
          const active = selected.includes(item.id);
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                onChange(item.id);
              }}
              className={cn(
                "rounded-full border px-3.5 py-2 text-sm transition-colors",
                active
                  ? "border-primary/30 bg-primary/10 text-primary"
                  : "border-border/70 bg-background text-muted-foreground hover:border-muted-foreground/30 hover:text-foreground",
              )}
              aria-pressed={active}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Form ───

export function CustomProductForm() {
  const [data, setData] = useState<FormData>(initialData);
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>(
    {},
  );

  const update = useCallback(
    <K extends keyof FormData>(key: K, value: FormData[K]) => {
      setData((prev) => ({ ...prev, [key]: value }));
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    },
    [],
  );

  const toggleArray = useCallback(
    (key: "challenges" | "environment" | "outcomes", id: string) => {
      setData((prev) => ({
        ...prev,
        [key]: prev[key].includes(id)
          ? prev[key].filter((x) => x !== id)
          : [...prev[key], id],
      }));
    },
    [],
  );

  function validate(): boolean {
    const e: Partial<Record<keyof FormData, string>> = {};
    if (!data.orgName.trim()) e.orgName = "مطلوب";
    if (!data.industry) e.industry = "مطلوب";
    if (!data.orgSize) e.orgSize = "مطلوب";
    if (!data.country) e.country = "مطلوب";
    if (!data.systemCategory) e.systemCategory = "اختر نوع النظام";
    if (!data.intent) e.intent = "مطلوب";
    if (!data.contactName.trim()) e.contactName = "مطلوب";
    if (!data.contactEmail.trim()) e.contactEmail = "مطلوب";
    if (!data.contactPhone.trim()) e.contactPhone = "مطلوب";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setStatus("submitting");

    try {
      const res = await fetch("/api/custom-product-submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        setStatus("success");
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        throw new Error("Submission failed");
      }
    } catch {
      setStatus("error");
    }
  }

  function handleMailtoFallback() {
    window.location.href = buildMailtoLink(data);
  }

  if (status === "success") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 text-center sm:px-6 sm:py-16">
        <div className="rounded-[28px] border border-border/70 bg-gradient-to-br from-background via-background to-primary/[0.03] p-8 shadow-sm sm:p-10">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <span className="text-2xl">✓</span>
          </div>
          <h2 className="text-2xl font-black">تم استلام طلبك</h2>
          <p className="mt-3 leading-7 text-muted-foreground">
            سنراجع طبيعة العمل ونقترح المسار الأنسب:
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-sm text-muted-foreground">
            <span className="rounded-full bg-muted px-3 py-1.5">جلسة فهم</span>
            <span>→</span>
            <span className="rounded-full bg-muted px-3 py-1.5">تصور أولي</span>
            <span>→</span>
            <span className="rounded-full bg-muted px-3 py-1.5">
              ديمو أو Pilot
            </span>
            <span>→</span>
            <span className="rounded-full bg-muted px-3 py-1.5">
              بناء النظام
            </span>
          </div>
          <p className="mt-6 text-sm text-muted-foreground/80">
            سيتم إرسال نسخة إلى {data.contactEmail}
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <a href="/products" className="btn-outline h-10 px-5 text-sm">
              استكشف خطوط حلول عقلية
            </a>
            <a href="/contact" className="btn-primary h-10 px-5 text-sm">
              تواصل معنا
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto max-w-3xl px-0 py-4 sm:py-6"
    >
      {/* 1. Organization Info */}
      <section className="rounded-[24px] border border-border/70 bg-background p-4 shadow-sm sm:p-6">
        <SectionLabel num="1" label="معلومات المؤسسة" />
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="orgName" className="text-sm font-medium">
              اسم المؤسسة *
            </label>
            <input
              id="orgName"
              type="text"
              value={data.orgName}
              onChange={(e) => update("orgName", e.target.value)}
              placeholder="الاسم التجاري للمؤسسة"
              className="w-full rounded-lg border border-border/70 bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              aria-invalid={errors.orgName ? "true" : "false"}
              aria-describedby={errors.orgName ? "orgName-error" : undefined}
            />
            {errors.orgName && (
              <p id="orgName-error" className="text-xs text-destructive">
                {errors.orgName}
              </p>
            )}
          </div>
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

      {/* 2. System Category */}
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

      {/* 3. Challenges */}
      <section className="mt-6 rounded-[24px] border border-border/70 bg-background p-4 shadow-sm sm:p-6">
        <SectionLabel num="3" label="التحديات التشغيلية" />
        <CheckboxGroup
          items={challenges}
          selected={data.challenges}
          onChange={(id) => toggleArray("challenges", id)}
          label="اختر أكثر التحديات تأثيرًا على مؤسستك"
        />
      </section>

      {/* 4. Environment */}
      <section className="mt-6 rounded-[24px] border border-border/70 bg-background p-4 shadow-sm sm:p-6">
        <SectionLabel num="4" label="البيئة الحالية" />
        <CheckboxGroup
          items={environments}
          selected={data.environment}
          onChange={(id) => toggleArray("environment", id)}
          label="ما الأنظمة والأدوات المستخدمة حاليًا؟"
        />
      </section>

      {/* 5. Outcomes */}
      <section className="mt-6 rounded-[24px] border border-border/70 bg-background p-4 shadow-sm sm:p-6">
        <SectionLabel num="5" label="المخرجات المستهدفة" />
        <CheckboxGroup
          items={outcomes}
          selected={data.outcomes}
          onChange={(id) => toggleArray("outcomes", id)}
          label="ماذا تريد أن يحقق النظام لمؤسستك؟"
        />
      </section>

      {/* 6. Intent */}
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

      {/* 7. Contact Info */}
      <section className="mt-6 rounded-[24px] border border-border/70 bg-background p-4 shadow-sm sm:p-6">
        <SectionLabel num="7" label="معلومات التواصل" />
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="contactName" className="text-sm font-medium">
              الاسم *
            </label>
            <input
              id="contactName"
              type="text"
              value={data.contactName}
              onChange={(e) => update("contactName", e.target.value)}
              placeholder="الاسم الكامل"
              className="w-full rounded-lg border border-border/70 bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              aria-invalid={errors.contactName ? "true" : "false"}
              aria-describedby={
                errors.contactName ? "contactName-error" : undefined
              }
            />
            {errors.contactName && (
              <p id="contactName-error" className="text-xs text-destructive">
                {errors.contactName}
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <label htmlFor="contactRole" className="text-sm font-medium">
              المنصب
            </label>
            <input
              id="contactRole"
              type="text"
              value={data.contactRole}
              onChange={(e) => update("contactRole", e.target.value)}
              placeholder="المسمى الوظيفي"
              className="w-full rounded-lg border border-border/70 bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="contactEmail" className="text-sm font-medium">
              البريد الإلكتروني *
            </label>
            <input
              id="contactEmail"
              type="email"
              value={data.contactEmail}
              onChange={(e) => update("contactEmail", e.target.value)}
              placeholder="email@organization.com"
              className="w-full rounded-lg border border-border/70 bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              dir="ltr"
              aria-invalid={errors.contactEmail ? "true" : "false"}
              aria-describedby={
                errors.contactEmail ? "contactEmail-error" : undefined
              }
            />
            {errors.contactEmail && (
              <p id="contactEmail-error" className="text-xs text-destructive">
                {errors.contactEmail}
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <label htmlFor="contactPhone" className="text-sm font-medium">
              رقم الهاتف *
            </label>
            <input
              id="contactPhone"
              type="tel"
              value={data.contactPhone}
              onChange={(e) => update("contactPhone", e.target.value)}
              placeholder="+966 5X XXX XXXX"
              className="w-full rounded-lg border border-border/70 bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              dir="ltr"
              aria-invalid={errors.contactPhone ? "true" : "false"}
              aria-describedby={
                errors.contactPhone ? "contactPhone-error" : undefined
              }
            />
            {errors.contactPhone && (
              <p id="contactPhone-error" className="text-xs text-destructive">
                {errors.contactPhone}
              </p>
            )}
          </div>
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

      {/* Summary Before Submit */}
      {data.orgName && data.systemCategory && (
        <section className="mt-6 rounded-[24px] border border-border/70 bg-gradient-to-br from-muted/30 to-background p-4 shadow-sm sm:p-6">
          <h3 className="mb-4 text-base font-bold">ملخص الطلب</h3>
          <div className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <span className="text-muted-foreground">المؤسسة:</span>{" "}
              <span className="font-medium">{data.orgName}</span>
            </div>
            <div>
              <span className="text-muted-foreground">القطاع:</span>{" "}
              <span className="font-medium">
                {industries.find((i) => i.value === data.industry)?.label ??
                  "-"}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">النظام:</span>{" "}
              <span className="font-medium">
                {systemCategories.find((c) => c.id === data.systemCategory)
                  ?.label ?? "-"}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">الهدف:</span>{" "}
              <span className="font-medium">
                {intents.find((i) => i.value === data.intent)?.label ?? "-"}
              </span>
            </div>
            {data.challenges.length > 0 && (
              <div className="sm:col-span-2">
                <span className="text-muted-foreground">التحديات:</span>{" "}
                <span className="font-medium">
                  {data.challenges
                    .map((c) => challenges.find((x) => x.id === c)?.label)
                    .join("، ")}
                </span>
              </div>
            )}
            {data.outcomes.length > 0 && (
              <div className="sm:col-span-2">
                <span className="text-muted-foreground">المخرجات:</span>{" "}
                <span className="font-medium">
                  {data.outcomes
                    .map((o) => outcomes.find((x) => x.id === o)?.label)
                    .join("، ")}
                </span>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Submit */}
      <div className="mt-8">
        {status === "error" && (
          <div
            className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 shadow-sm"
            role="alert"
          >
            تعذر الإرسال مؤقتًا.{" "}
            <button
              type="button"
              onClick={handleMailtoFallback}
              className="font-medium underline"
            >
              اضغط هنا للإرسال عبر البريد الإلكتروني
            </button>
          </div>
        )}

        <button
          type="submit"
          disabled={status === "submitting"}
          className="btn-primary h-12 w-full text-base disabled:opacity-60 disabled:hover:scale-100"
        >
          {status === "submitting"
            ? "جاري الإرسال..."
            : "إرسال طلب تصميم النظام"}
        </button>

        <p className="mt-3 text-center text-xs text-muted-foreground">
          بالضغط على إرسال، أنت توافق على تواصل فريق عقلية معك بخصوص هذا الطلب.
        </p>
      </div>
    </form>
  );
}
