"use client";

import { useState, useRef } from "react";
import { trackEvent } from "@/lib/tracking";

const productOptions = [
  "AuditOS",
  "LocalContentOS",
  "DecisionOS",
  "Office AI Assistant",
  "غير متأكد — أحتاج توجيهًا",
];

const interestOptions = [
  "Pilot Review — تقييم المنتج على بيانات فعلية",
  "Product Demo — مشاهدة تفاعلية للمنتج",
  "Partnership — تعاون أو توزيع",
  "General Inquiry — استفسار عام",
];

const dataOptions = [
  "بيانات مالية (ميزان مراجعة، قوائم)",
  "بيانات محتوى محلي (موردين، عقود)",
  "بيانات قرارات مؤسسية",
  "بيانات معرفة داخلية ووثائق",
  "غير محدد — سأناقشه مع الفريق",
];

export function ContactForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    organization: "",
    role: "",
    product: "",
    interest: "",
    useCase: "",
    dataType: "",
    currentWorkflow: "",
    goal: "",
  });
  const [sent, setSent] = useState(false);
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
    trackEvent("submit_pilot_review_form");
    try {
      setSent(true);
      trackEvent("pilot_review_form_success");
    } catch {
      trackEvent("pilot_review_form_error");
    }
  };

  return (
    <>
      <section className="mx-auto max-w-7xl px-6 py-16 sm:py-20 border-b border-white/5">
        <div className="grid gap-8 lg:grid-cols-[0.86fr_1.14fr] lg:items-start">
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-aqliya-cyan">
              طلب البايلوت
            </p>
            <h2 className="text-3xl font-black text-white">
              قدّم طلب مراجعة Pilot
            </h2>
            <p className="text-base leading-8 text-white/62">
              املأ الحقول أدناه. سنراجع طلبك خلال ٢-٣ أيام عمل ونتواصل معك
              لتحديد الخطوة التالية — سواء كانت جلسة تنفيذية أو بدء بايلوت
              مباشر.
            </p>
            <div className="space-y-3">
              {[
                "سنقيّم ملاءمة المنتج لسير عملك قبل أي التزام.",
                "إذا كان النطاق غير واضح، نبدأ بجلسة تشخيص قصيرة.",
                "يمكنك دائمًا مراسلتنا مباشرة على ragheed@aqliya.com.",
              ].map((item) => (
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
              <p className="text-sm font-bold text-white">راسلنا مباشرة</p>
              <a
                href="mailto:ragheed@aqliya.com"
                className="mt-3 block text-lg font-semibold text-aqliya-cyan hover:text-cyan-300 transition-colors"
              >
                ragheed@aqliya.com
              </a>
              <p className="mt-2 text-sm leading-7 text-white/62">
                نرد بمسار محدد، ليس برسالة عامة.
              </p>
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 sm:p-8">
            <h3 className="text-2xl font-black text-white text-center">
              طلب مراجعة Pilot
            </h3>
            <p className="mt-2 text-center text-sm text-white/62">
              المعلومات تساعدنا في تقييم النطاق قبل التواصل معك.
            </p>

            {sent ? (
              <div className="mt-8 text-center py-12">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-aqliya-cyan/10">
                  <span className="text-3xl text-aqliya-cyan">✓</span>
                </div>
                <p className="text-xl font-bold text-white">تم استلام طلبك</p>
                <p className="mt-2 text-sm text-white/62">
                  سنراجع طلبك خلال ٢-٣ أيام عمل ونتواصل معك على البريد
                  الإلكتروني المقدم. إذا كان طلبك عاجلاً، راسلنا مباشرة على
                  ragheed@aqliya.com.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="name"
                      className="mb-1 block text-sm font-medium text-white"
                    >
                      الاسم الكامل
                    </label>
                    <input
                      id="name"
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      className="w-full rounded-lg border border-white/10 bg-white/[0.06] px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-aqliya-cyan/50"
                      placeholder="الاسم الكامل"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="email"
                      className="mb-1 block text-sm font-medium text-white"
                    >
                      البريد الإلكتروني
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      className="w-full rounded-lg border border-white/10 bg-white/[0.06] px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-aqliya-cyan/50"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="organization"
                      className="mb-1 block text-sm font-medium text-white"
                    >
                      الجهة / المؤسسة
                    </label>
                    <input
                      id="organization"
                      type="text"
                      required
                      value={form.organization}
                      onChange={(e) =>
                        handleChange("organization", e.target.value)
                      }
                      className="w-full rounded-lg border border-white/10 bg-white/[0.06] px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-aqliya-cyan/50"
                      placeholder="اسم الجهة"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="role"
                      className="mb-1 block text-sm font-medium text-white"
                    >
                      الدور / المنصب
                    </label>
                    <input
                      id="role"
                      type="text"
                      value={form.role}
                      onChange={(e) => handleChange("role", e.target.value)}
                      className="w-full rounded-lg border border-white/10 bg-white/[0.06] px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-aqliya-cyan/50"
                      placeholder="مدير مالي، مدقق، CIO..."
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="product"
                    className="mb-1 block text-sm font-medium text-white"
                  >
                    المنتج المهتم به
                  </label>
                  <select
                    id="product"
                    required
                    value={form.product}
                    onChange={(e) => handleChange("product", e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-white/[0.06] px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-aqliya-cyan/50"
                  >
                    <option
                      value=""
                      disabled
                      className="bg-gray-900 text-white/50"
                    >
                      اختر المنتج...
                    </option>
                    {productOptions.map((opt) => (
                      <option
                        key={opt}
                        value={opt}
                        className="bg-gray-900 text-white"
                      >
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="interest"
                    className="mb-1 block text-sm font-medium text-white"
                  >
                    نوع الطلب
                  </label>
                  <select
                    id="interest"
                    required
                    value={form.interest}
                    onChange={(e) => handleChange("interest", e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-white/[0.06] px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-aqliya-cyan/50"
                  >
                    <option
                      value=""
                      disabled
                      className="bg-gray-900 text-white/50"
                    >
                      اختر نوع الطلب...
                    </option>
                    {interestOptions.map((opt) => (
                      <option
                        key={opt}
                        value={opt}
                        className="bg-gray-900 text-white"
                      >
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="useCase"
                    className="mb-1 block text-sm font-medium text-white"
                  >
                    وصف use case
                  </label>
                  <textarea
                    id="useCase"
                    required
                    rows={3}
                    value={form.useCase}
                    onChange={(e) => handleChange("useCase", e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-white/[0.06] px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-aqliya-cyan/50"
                    placeholder="ما سير العمل الذي تريد تفعيله؟ صف بإيجاز..."
                  />
                </div>

                <div>
                  <label
                    htmlFor="dataType"
                    className="mb-1 block text-sm font-medium text-white"
                  >
                    نوع البيانات
                  </label>
                  <select
                    id="dataType"
                    required
                    value={form.dataType}
                    onChange={(e) => handleChange("dataType", e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-white/[0.06] px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-aqliya-cyan/50"
                  >
                    <option
                      value=""
                      disabled
                      className="bg-gray-900 text-white/50"
                    >
                      اختر نوع البيانات...
                    </option>
                    {dataOptions.map((opt) => (
                      <option
                        key={opt}
                        value={opt}
                        className="bg-gray-900 text-white"
                      >
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="currentWorkflow"
                    className="mb-1 block text-sm font-medium text-white"
                  >
                    سير العمل الحالي{" "}
                    <span className="text-white/40">(اختياري)</span>
                  </label>
                  <select
                    id="currentWorkflow"
                    value={form.currentWorkflow}
                    onChange={(e) =>
                      handleChange("currentWorkflow", e.target.value)
                    }
                    className="w-full rounded-lg border border-white/10 bg-white/[0.06] px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-aqliya-cyan/50"
                  >
                    <option value="" className="bg-gray-900 text-white/50">
                      اختر... (إن وجد)
                    </option>
                    <option value="excel" className="bg-gray-900 text-white">
                      Excel / جداول يدوية
                    </option>
                    <option
                      value="audit_software"
                      className="bg-gray-900 text-white"
                    >
                      برنامج تدقيق متخصص
                    </option>
                    <option value="erp" className="bg-gray-900 text-white">
                      ERP / نظام محاسبي
                    </option>
                    <option value="manual" className="bg-gray-900 text-white">
                      يدوي بالكامل
                    </option>
                    <option value="mixed" className="bg-gray-900 text-white">
                      خليط من الأدوات
                    </option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="goal"
                    className="mb-1 block text-sm font-medium text-white"
                  >
                    الهدف من البايلوت
                  </label>
                  <textarea
                    id="goal"
                    rows={2}
                    value={form.goal}
                    onChange={(e) => handleChange("goal", e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-white/[0.06] px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-aqliya-cyan/50"
                    placeholder="ماذا تريد أن تختبر أو تثبت؟"
                  />
                </div>

                <button
                  type="submit"
                  disabled={sent}
                  className="btn-primary h-12 w-full disabled:opacity-50 disabled:hover:scale-100"
                >
                  {sent ? "تم الإرسال ✓" : "إرسال طلب مراجعة Pilot"}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
