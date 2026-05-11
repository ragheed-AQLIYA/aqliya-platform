"use client"

import { useState, useCallback } from "react"
import { cn } from "@/lib/utils"

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
]

const sizes = [
  { value: "", label: "اختر الحجم..." },
  { value: "1_10", label: "١–١٠ موظفين" },
  { value: "11_50", label: "١١–٥٠ موظفًا" },
  { value: "51_200", label: "٥١–٢٠٠ موظف" },
  { value: "201_500", label: "٢٠١–٥٠٠ موظف" },
  { value: "501_plus", label: "+٥٠٠ موظف" },
]

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
]

const systemCategories = [
  { id: "decision", label: "أنظمة اتخاذ القرار", desc: "تنظيم القرارات المعقدة من المشكلة إلى التوصية والاعتماد" },
  { id: "simulation", label: "أنظمة المحاكاة", desc: "اختبار السيناريوهات قبل التنفيذ وفهم الأثر والمخاطر" },
  { id: "sales", label: "أنظمة المبيعات", desc: "تأهيل العملاء وترتيب الأولويات وتحسين الأداء" },
  { id: "audit", label: "أنظمة المراجعة والتدقيق", desc: "تنظيم المراجعة والأدلة والملاحظات والمخرجات" },
  { id: "local_content", label: "أنظمة المحتوى المحلي", desc: "إدارة الموردين والإنفاق والالتزام والمؤشرات" },
  { id: "custom", label: "نظام مؤسسي مخصص", desc: "نظام يُبنى بالكامل حسب طبيعة عمل مؤسستك" },
]

const challenges = [
  { id: "slow_decisions", label: "بطء في اتخاذ القرارات" },
  { id: "fragmented_workflows", label: "إجراءات متفرقة وغير مترابطة" },
  { id: "manual_audit", label: "مراجعة وتدقيق يدوية" },
  { id: "weak_traceability", label: "ضعف التتبع والمراجعة" },
  { id: "disconnected_data", label: "بيانات منفصلة غير متصلة" },
  { id: "forecasting_gaps", label: "ضعف القدرة على التنبؤ والتخطيط" },
  { id: "sales_visibility", label: "غياب رؤية واضحة لأداء المبيعات" },
  { id: "local_content_compliance", label: "صعوبة الالتزام بمتطلبات المحتوى المحلي" },
  { id: "reporting_burden", label: "عبء إعداد التقارير" },
  { id: "excel_dependency", label: "اعتماد مفرط على Excel والملفات اليدوية" },
  { id: "other_challenge", label: "تحديات أخرى" },
]

const environments = [
  { id: "erp", label: "نظام ERP" },
  { id: "spreadsheets", label: "Excel / أوراق عمل" },
  { id: "legacy", label: "أنظمة قديمة (Legacy)" },
  { id: "manual", label: "إجراءات ورقية / يدوية" },
  { id: "mixed", label: "خليط من أنظمة متفرقة" },
  { id: "none", label: "لا يوجد نظام حالي" },
]

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
]

const intents = [
  { value: "", label: "اختر هدف التواصل..." },
  { value: "exploratory", label: "نقاش استكشافي — فهم الإمكانيات" },
  { value: "demo", label: "طلب عرض توضيحي — مشاهدة نظام حي" },
  { value: "pilot", label: "مشروع تجريبي — تطبيق مبدئي" },
  { value: "full_build", label: "بناء نظام كامل — جاهز للتشغيل" },
]

// ─── Types ───

type FormData = {
  orgName: string
  industry: string
  orgSize: string
  country: string
  systemCategory: string
  challenges: string[]
  environment: string[]
  outcomes: string[]
  intent: string
  contactName: string
  contactRole: string
  contactEmail: string
  contactPhone: string
  notes: string
}

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
}

// ─── Helpers ───

function buildMailtoLink(data: FormData): string {
  const subject = encodeURIComponent(`طلب تصميم نظام مؤسسي | ${data.orgName}`)
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
    `---\nمرسل من: AQLIYA Custom Product Request\nhttps://aqliya.com/custom-product`
  )
  return `mailto:ragheed@aqliya.com?subject=${subject}&body=${body}`
}

// ─── Components ───

function SectionLabel({ num, label }: { num: string; label: string }) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">{num}</span>
      <h2 className="text-base font-bold">{label}</h2>
    </div>
  )
}

function SelectField({ label, value, options, onChange, required }: { label: string; value: string; options: { value: string; label: string }[]; onChange: (v: string) => void; required?: boolean }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-foreground">{label}{required ? " *" : ""}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} disabled={o.value === ""}>{o.label}</option>
        ))}
      </select>
    </div>
  )
}

function CardSelect({ items, selected, onChange }: { items: { id: string; label: string; desc: string }[]; selected: string; onChange: (id: string) => void }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {items.map((item) => {
        const active = selected === item.id
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onChange(active ? "" : item.id)}
            className={cn(
              "rounded-xl border p-5 text-right transition-colors",
              active
                ? "border-primary/40 bg-primary/[0.04] ring-1 ring-primary/20"
                : "border bg-background hover:border-muted-foreground/20 hover:bg-muted/30"
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <span className={cn("text-sm font-semibold", active && "text-primary")}>{item.label}</span>
              <span className={cn("mt-0.5 h-4 w-4 shrink-0 rounded-full border-2", active ? "border-primary bg-primary" : "border-muted-foreground/30")} />
            </div>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">{item.desc}</p>
          </button>
        )
      })}
    </div>
  )
}

function CheckboxGroup({ items, selected, onChange, label }: { items: { id: string; label: string }[]; selected: string[]; onChange: (id: string) => void; label: string }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">{label}</label>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => {
          const active = selected.includes(item.id)
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                onChange(item.id)
              }}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-sm transition-colors",
                active
                  ? "border-primary/30 bg-primary/10 text-primary"
                  : "border bg-background text-muted-foreground hover:border-muted-foreground/30 hover:text-foreground"
              )}
            >
              {item.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Main Form ───

export function CustomProductForm() {
  const [data, setData] = useState<FormData>(initialData)
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle")
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})

  const update = useCallback(<K extends keyof FormData>(key: K, value: FormData[K]) => {
    setData((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }, [])

  const toggleArray = useCallback((key: "challenges" | "environment" | "outcomes", id: string) => {
    setData((prev) => ({
      ...prev,
      [key]: prev[key].includes(id) ? prev[key].filter((x) => x !== id) : [...prev[key], id],
    }))
  }, [])

  function validate(): boolean {
    const e: Partial<Record<keyof FormData, string>> = {}
    if (!data.orgName.trim()) e.orgName = "مطلوب"
    if (!data.industry) e.industry = "مطلوب"
    if (!data.orgSize) e.orgSize = "مطلوب"
    if (!data.country) e.country = "مطلوب"
    if (!data.systemCategory) e.systemCategory = "اختر نوع النظام"
    if (!data.intent) e.intent = "مطلوب"
    if (!data.contactName.trim()) e.contactName = "مطلوب"
    if (!data.contactEmail.trim()) e.contactEmail = "مطلوب"
    if (!data.contactPhone.trim()) e.contactPhone = "مطلوب"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    setStatus("submitting")

    try {
      const res = await fetch("/api/custom-product-submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (res.ok) {
        setStatus("success")
        window.scrollTo({ top: 0, behavior: "smooth" })
      } else {
        throw new Error("Submission failed")
      }
    } catch {
      setStatus("error")
    }
  }

  function handleMailtoFallback() {
    window.location.href = buildMailtoLink(data)
  }

  if (status === "success") {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16 text-center">
        <div className="rounded-2xl border bg-background p-10">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <span className="text-2xl">✓</span>
          </div>
          <h2 className="text-2xl font-bold">تم استلام طلبك</h2>
          <p className="mt-3 text-muted-foreground">
            شكرًا لتواصلك مع عقلية. فريقنا سيراجع طلب تصميم النظام لـ {data.orgName} ويتواصل معك خلال يومي عمل.
          </p>
          <p className="mt-2 text-sm text-muted-foreground/80">
            سيتم إرسال نسخة إلى {data.contactEmail}
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <a href="/products" className="inline-flex h-10 items-center justify-center rounded-md border px-5 text-sm font-medium transition-colors hover:bg-muted">
              استكشف خطوط حلول عقلية
            </a>
            <a href="/auditos" className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
              جرب العرض التوضيحي
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-3xl px-6 py-12">
      {/* 1. Organization Info */}
      <section className="rounded-xl border bg-background p-6">
        <SectionLabel num="1" label="معلومات المؤسسة" />
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">اسم المؤسسة *</label>
            <input
              type="text"
              value={data.orgName}
              onChange={(e) => update("orgName", e.target.value)}
              placeholder="الاسم التجاري للمؤسسة"
              className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            {errors.orgName && <p className="text-xs text-destructive">{errors.orgName}</p>}
          </div>
          <SelectField label="القطاع" value={data.industry} options={industries} onChange={(v) => update("industry", v)} required />
          <SelectField label="حجم المؤسسة" value={data.orgSize} options={sizes} onChange={(v) => update("orgSize", v)} required />
          <SelectField label="الدولة" value={data.country} options={countries} onChange={(v) => update("country", v)} required />
        </div>
      </section>

      {/* 2. System Category */}
      <section className="mt-6 rounded-xl border bg-background p-6">
        <SectionLabel num="2" label="نوع النظام" />
        {errors.systemCategory && <p className="mb-3 text-xs text-destructive">{errors.systemCategory}</p>}
        <CardSelect items={systemCategories} selected={data.systemCategory} onChange={(id) => update("systemCategory", id)} />
      </section>

      {/* 3. Challenges */}
      <section className="mt-6 rounded-xl border bg-background p-6">
        <SectionLabel num="3" label="التحديات التشغيلية" />
        <CheckboxGroup items={challenges} selected={data.challenges} onChange={(id) => toggleArray("challenges", id)} label="اختر أكثر التحديات تأثيرًا على مؤسستك" />
      </section>

      {/* 4. Environment */}
      <section className="mt-6 rounded-xl border bg-background p-6">
        <SectionLabel num="4" label="البيئة الحالية" />
        <CheckboxGroup items={environments} selected={data.environment} onChange={(id) => toggleArray("environment", id)} label="ما الأنظمة والأدوات المستخدمة حاليًا؟" />
      </section>

      {/* 5. Outcomes */}
      <section className="mt-6 rounded-xl border bg-background p-6">
        <SectionLabel num="5" label="المخرجات المستهدفة" />
        <CheckboxGroup items={outcomes} selected={data.outcomes} onChange={(id) => toggleArray("outcomes", id)} label="ماذا تريد أن يحقق النظام لمؤسستك؟" />
      </section>

      {/* 6. Intent */}
      <section className="mt-6 rounded-xl border bg-background p-6">
        <SectionLabel num="6" label="هدف التواصل" />
        <SelectField label="ما الهدف من تواصلك؟" value={data.intent} options={intents} onChange={(v) => update("intent", v)} required />
      </section>

      {/* 7. Contact Info */}
      <section className="mt-6 rounded-xl border bg-background p-6">
        <SectionLabel num="7" label="معلومات التواصل" />
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">الاسم *</label>
            <input type="text" value={data.contactName} onChange={(e) => update("contactName", e.target.value)} placeholder="الاسم الكامل" className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
            {errors.contactName && <p className="text-xs text-destructive">{errors.contactName}</p>}
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">المنصب</label>
            <input type="text" value={data.contactRole} onChange={(e) => update("contactRole", e.target.value)} placeholder="المسمى الوظيفي" className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">البريد الإلكتروني *</label>
            <input type="email" value={data.contactEmail} onChange={(e) => update("contactEmail", e.target.value)} placeholder="email@organization.com" className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" dir="ltr" />
            {errors.contactEmail && <p className="text-xs text-destructive">{errors.contactEmail}</p>}
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">رقم الهاتف *</label>
            <input type="tel" value={data.contactPhone} onChange={(e) => update("contactPhone", e.target.value)} placeholder="+966 5X XXX XXXX" className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" dir="ltr" />
            {errors.contactPhone && <p className="text-xs text-destructive">{errors.contactPhone}</p>}
          </div>
        </div>
        <div className="mt-4 space-y-1.5">
          <label className="text-sm font-medium">ملاحظات إضافية</label>
          <textarea
            value={data.notes}
            onChange={(e) => update("notes", e.target.value)}
            placeholder="أي تفاصيل إضافية عن احتياجك أو مشروعك..."
            rows={3}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none"
          />
        </div>
      </section>

      {/* Submit */}
      <div className="mt-8">
        {status === "error" && (
          <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            تعذر الإرسال مؤقتًا.{" "}
            <button type="button" onClick={handleMailtoFallback} className="font-medium underline">
              اضغط هنا للإرسال عبر البريد الإلكتروني
            </button>
          </div>
        )}

        <button
          type="submit"
          disabled={status === "submitting"}
          className="inline-flex h-12 w-full items-center justify-center rounded-md bg-primary text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
        >
          {status === "submitting" ? "جاري الإرسال..." : "إرسال طلب تصميم النظام"}
        </button>

        <p className="mt-3 text-center text-xs text-muted-foreground">
          بالضغط على إرسال، أنت توافق على تواصل فريق عقلية معك بخصوص هذا الطلب.
        </p>
      </div>
    </form>
  )
}
