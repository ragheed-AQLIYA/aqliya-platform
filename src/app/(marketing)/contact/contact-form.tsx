"use client";

import { useState } from "react";
export function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <>
      <section className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
        <div className="grid gap-8 lg:grid-cols-[0.86fr_1.14fr] lg:items-start">
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
              بداية التشغيل
            </p>
            <h2 className="text-3xl font-black text-foreground">
              ابدأ المحادثة من زاوية تشغيلية واضحة
            </h2>
            <p className="text-base leading-8 text-muted-foreground">
              أفضل نقطة بداية ليست طلب عرض عام، بل تحديد نوع الفجوة التي تريد
              معالجتها: هل تحتاج خط نظام جاهز؟ هل لديك مسار خاص؟ هل تريد مشاهدة
              تطبيق فعلي قبل أي نقاش؟
            </p>
            <div className="space-y-3">
              {[
                "إذا كنت تعرف نطاق العمل، نوجّهك إلى خط النظام الأقرب.",
                "إذا كان النطاق مركبًا، نبدأ من جلسة تصميم مؤسسي محكوم.",
                "إذا أردت إثباتًا عمليًا، نوجّهك إلى AuditOS كأول تطبيق واضح.",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-3 rounded-2xl border border-border/70 bg-gradient-to-br from-background to-muted/30 p-4 shadow-sm"
                >
                  <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-aqliya-cyan" />
                  <p className="text-sm leading-7 text-foreground">{item}</p>
                </div>
              ))}
            </div>
            <div className="rounded-[24px] border border-primary/10 bg-gradient-to-br from-primary/[0.06] via-background to-aqliya-cyan/[0.04] p-6">
              <p className="text-sm font-bold text-foreground">راسلنا مباشرة</p>
              <a
                href="mailto:ragheed@aqliya.com"
                className="mt-3 block text-lg font-semibold text-primary hover:text-aqliya-cyan transition-colors"
              >
                ragheed@aqliya.com
              </a>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">
                سنرد عليك بمسار البداية الأنسب بدل رسالة عامة لا تقود إلى قرار.
              </p>
            </div>
          </div>

          <div className="rounded-[28px] border border-border/70 bg-gradient-to-br from-background via-background to-muted/30 p-6 shadow-sm sm:p-8">
            <h3 className="text-2xl font-black text-foreground text-center">
              أرسل رسالة مباشرة
            </h3>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              اذكر بإيجاز المجال، نوع البيانات، وما إذا كنت تبحث عن خط نظام جاهز
              أو مسار مخصص.
            </p>
            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div>
                <label
                  htmlFor="name"
                  className="mb-1 block text-sm font-medium text-foreground"
                >
                  الاسم
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-lg border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="الاسم الكامل"
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="mb-1 block text-sm font-medium text-foreground"
                >
                  البريد الإلكتروني
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full rounded-lg border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label
                  htmlFor="message"
                  className="mb-1 block text-sm font-medium text-foreground"
                >
                  الرسالة
                </label>
                <textarea
                  id="message"
                  required
                  rows={5}
                  value={form.message}
                  onChange={(e) =>
                    setForm({ ...form, message: e.target.value })
                  }
                  className="w-full rounded-lg border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="كيف يمكننا مساعدتك؟"
                />
              </div>
              <button
                type="submit"
                disabled={sent}
                className="btn-primary h-12 w-full disabled:opacity-50 disabled:hover:scale-100"
              >
                {sent ? "تم الإرسال ✓ سنتواصل معك قريبًا" : "إرسال الرسالة"}
              </button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
