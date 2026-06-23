"use client";

import { useState, useRef } from "react";
import { trackEvent } from "@/lib/tracking";
import { contactFormCopyAr } from "@/lib/marketing/copy-contact";
import { contactFormCopyEn } from "@/lib/marketing/copy-contact-en";

const productOptions = [
  "AuditOS",
  "LocalContentOS",
  "DecisionOS",
  "Office AI Assistant",
  "غير متأكد — أحتاج توجيهًا",
];

const dataOptions = [
  "بيانات مالية (ميزان مراجعة، قوائم)",
  "بيانات محتوى محلي (موردين، عقود)",
  "بيانات قرارات مؤسسية",
  "بيانات معرفة داخلية ووثائق",
  "غير محدد — سأناقشه مع الفريق",
];

type Props = {
  locale?: "ar" | "en";
};

export function ContactForm({ locale = "ar" }: Props) {
  const copy = locale === "en" ? contactFormCopyEn : contactFormCopyAr;
  const interestOptions = copy.interestOptions;

  const [form, setForm] = useState({
    name: "",
    email: "",
    organization: "",
    role: "",
    interest: "",
    message: "",
    product: "",
    dataType: "",
    currentWorkflow: "",
    goal: "",
  });
  const [showDetails, setShowDetails] = useState(false);
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const started = useRef(false);

  const handleChange = (field: string, value: string) => {
    if (!started.current) {
      started.current = true;
      trackEvent("start_pilot_review_form");
    }
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setError(null);
    setSubmitting(true);
    trackEvent("submit_pilot_review_form");

    try {
      const res = await fetch("/api/pilot-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          organization: form.organization,
          role: form.role,
          productInterest: form.product || "غير متأكد — أحتاج توجيهًا",
          interest: form.interest,
          useCase: form.message,
          dataType: form.dataType || "غير محدد — سأناقشه مع الفريق",
          currentWorkflow: form.currentWorkflow,
          goal: form.goal || copy.form.defaultGoal,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Request failed.");
      }

      setSent(true);
      trackEvent("pilot_review_form_success");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "حدث خطأ غير متوقع.";
      setError(msg);
      trackEvent("pilot_review_form_error");
    } finally {
      setSubmitting(false);
    }
  };

  const isAr = locale === "ar";

  return (
    <section className="mx-auto max-w-7xl px-6 py-16 sm:py-20 border-b border-white/5">
      <div className="grid gap-8 lg:grid-cols-[0.86fr_1.14fr] lg:items-start">
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-aqliya-cyan">
            {copy.sidebar.eyebrow}
          </p>
          <h2 className="text-3xl font-black text-white">{copy.sidebar.title}</h2>
          <p className="text-base leading-8 text-white/62">{copy.sidebar.body}</p>
          <div className="space-y-3">
            {copy.sidebar.hints.map((item) => (
              <div
                key={item}
                className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4"
              >
                <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-aqliya-cyan" />
                <p className="text-sm leading-7 text-white/62">{item}</p>
              </div>
            ))}
          </div>
          <div className="rounded-[24px] border border-aqliya-cyan/10 bg-gradient-to-br from-aqliya-cyan/[0.06] via-transparent to-aqliya-cyan/[0.04] p-6">
            <p className="text-sm font-bold text-white">{copy.sidebar.directEmailTitle}</p>
            <a
              href="mailto:ragheed@aqliya.com"
              className="mt-3 block text-lg font-semibold text-aqliya-cyan hover:text-cyan-300 transition-colors"
            >
              ragheed@aqliya.com
            </a>
          </div>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 sm:p-8">
          <h3 className="text-2xl font-black text-white text-center">{copy.form.title}</h3>
          <p className="mt-2 text-center text-sm text-white/62">{copy.form.subtitle}</p>

          {sent ? (
            <div className="mt-8 text-center py-12">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-aqliya-cyan/10">
                <span className="text-3xl text-aqliya-cyan">✓</span>
              </div>
              <p className="text-xl font-bold text-white">{copy.form.successTitle}</p>
              <p className="mt-2 text-sm text-white/62">{copy.form.successBody}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className="mb-1 block text-sm font-medium text-white">
                    {isAr ? "الاسم الكامل" : "Full name"}
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-white/[0.06] px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-aqliya-cyan/50"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="mb-1 block text-sm font-medium text-white">
                    {isAr ? "البريد الإلكتروني" : "Email"}
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-white/[0.06] px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-aqliya-cyan/50"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="organization"
                  className="mb-1 block text-sm font-medium text-white"
                >
                  {isAr ? "الجهة / المؤسسة" : "Organization"}
                </label>
                <input
                  id="organization"
                  type="text"
                  required
                  value={form.organization}
                  onChange={(e) => handleChange("organization", e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-white/[0.06] px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-aqliya-cyan/50"
                />
              </div>

              <div>
                <label htmlFor="interest" className="mb-1 block text-sm font-medium text-white">
                  {isAr ? "نوع الطلب" : "Request type"}
                </label>
                <select
                  id="interest"
                  required
                  value={form.interest}
                  onChange={(e) => handleChange("interest", e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-white/[0.06] px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-aqliya-cyan/50"
                >
                  <option value="" disabled className="bg-gray-900">
                    {isAr ? "اختر نوع الطلب..." : "Select request type..."}
                  </option>
                  {interestOptions.map((opt) => (
                    <option key={opt} value={opt} className="bg-gray-900">
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="message" className="mb-1 block text-sm font-medium text-white">
                  {isAr ? "رسالة مختصرة — ما الذي تريد تقييمه؟" : "Short message — what do you want to evaluate?"}
                </label>
                <textarea
                  id="message"
                  required
                  rows={3}
                  value={form.message}
                  onChange={(e) => handleChange("message", e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-white/[0.06] px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-aqliya-cyan/50"
                  placeholder={
                    isAr
                      ? "مثال: مكتب مراجعة — تدقيق IFRS على ارتباط واحد..."
                      : "Example: audit firm — IFRS review on one engagement..."
                  }
                />
              </div>

              <button
                type="button"
                onClick={() => setShowDetails((v) => !v)}
                className="text-sm font-medium text-aqliya-cyan hover:text-cyan-300 transition-colors"
              >
                {showDetails
                  ? isAr
                    ? "− إخفاء التفاصيل الإضافية"
                    : "− Hide optional details"
                  : isAr
                    ? "+ تفاصيل إضافية (اختياري)"
                    : "+ Optional details"}
              </button>

              {showDetails && (
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
                        {isAr ? "غير متأكد — أحتاج توجيهًا" : "Not sure — need guidance"}
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
              )}

              {error && (
                <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400 text-center">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={sent || submitting}
                className="btn-primary h-12 w-full disabled:opacity-50"
              >
                {submitting ? copy.form.submitting : copy.form.submit}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
