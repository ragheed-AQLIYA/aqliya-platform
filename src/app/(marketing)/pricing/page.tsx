import Link from "next/link";
import type { Metadata } from "next";
import { FAQSection } from "@/components/marketing/faq-section";

export function generateMetadata(): Metadata {
  const title = "الأسعار | AQLIYA";
  const description =
    "خطط أسعار AQLIYA للمنصات المؤسسية المحكومة  من المجاني إلى المؤسسي. تواصل معنا لتحديد الخطة المناسبة لمؤسستك.";
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: "https://aqliya.com/pricing",
      siteName: "AQLIYA",
      locale: "ar_SA",
      type: "website",
      images: [
        {
          url: "/og-pricing.png",
          width: 1200,
          height: 630,
          alt: "أسعار AQLIYA - خطط المنصة المؤسسية",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og-pricing.png"],
    },
  };
}

const tiers = [
  {
    id: "starter",
    nameAr: "ابتدائي",
    nameEn: "Starter",
    priceAr: "مجاني",
    priceEn: "Free",
    periodAr: "للتجربة",
    periodEn: "for evaluation",
    descriptionAr: "مسار تجربة محدود لفهم المنصة وأدواتها الأساسية.",
    descriptionEn: "Limited trial path to understand the platform and its core tools.",
    highlighted: false,
    featuresAr: [
      "وصول تجريبي لـ AuditOS",
      "حد أقصى 3 مستخدمين",
      "سجل تدقيق أساسي",
      "دعم عبر البريد الإلكتروني",
      "بيئة تجريبية مشتركة",
    ],
    featuresEn: [
      "Trial access to AuditOS",
      "Up to 3 users",
      "Basic audit trail",
      "Email support",
      "Shared trial environment",
    ],
  },
  {
    id: "professional",
    nameAr: "احترافي",
    nameEn: "Professional",
    priceAr: "تقديري",
    priceEn: "Custom",
    periodAr: "شهري / سنوي",
    periodEn: "monthly / annually",
    descriptionAr: "تفعيل نظام تشغيل واحد أو أكثر مع حوكمة كاملة وتدريب ودعم مخصص.",
    descriptionEn: "Activate one or more operating systems with full governance, training, and dedicated support.",
    highlighted: true,
    badgeAr: "الأكثر طلباً",
    badgeEn: "Most Popular",
    featuresAr: [
      "نظام تشغيل واحد أو أكثر من AQLIYA",
      "Hukm-kammil حوكمة كاملة (RBAC + Audit Trail + Evidence Chain)",
      "Office AI Assistant مشترك",
      "بيانات مؤسسية معزولة (Tenant Isolation)",
      "تدريب الفريق وإعداد المسارات",
      "دعم أولوية عبر البريد والمحادثة",
      "تقارير أداء دورية",
      "سجل تدقيق كامل مع إمكانية التصدير",
    ],
    featuresEn: [
      "One or more AQLIYA operating systems",
      "Full governance (RBAC + Audit Trail + Evidence Chain)",
      "Shared Office AI Assistant",
      "Isolated enterprise data (Tenant Isolation)",
      "Team training and path setup",
      "Priority support via email and chat",
      "Periodic performance reports",
      "Full audit trail with export capability",
    ],
  },
  {
    id: "enterprise",
    nameAr: "مؤسسي",
    nameEn: "Enterprise",
    priceAr: "مخصص",
    priceEn: "Tailored",
    periodAr: "حسب الاتفاق",
    periodEn: "per agreement",
    descriptionAr: "نشر كامل مع تخصيص عميق، بنية خاصة، وشراكة هندسية مستمرة.",
    descriptionEn: "Full deployment with deep customization, private infrastructure, and ongoing engineering partnership.",
    highlighted: false,
    featuresAr: [
      "جميع أنظمة التشغيل بدون حد",
      "نشر خاص (Private Deployment)",
      "تخصيص سير العمل والبيانات والواجهات",
      "دمج مع الأنظمة الخارجية (ERP, DMS, SSO)",
      "فريق دعم مخصص ومدير حساب",
      "SLA مخصص مع ضمان وقت الاستجابة",
      "استشارات أمنية ومراجعة دورية",
      "خطة تطوير مخصصة مع خارطة طريق",
    ],
    featuresEn: [
      "All operating systems, unlimited",
      "Private deployment",
      "Custom workflows, data, and interfaces",
      "External system integration (ERP, DMS, SSO)",
      "Dedicated support team and account manager",
      "Custom SLA with response time guarantees",
      "Security consulting and periodic reviews",
      "Tailored development plan with roadmap",
    ],
  },
];

export default function PricingPage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="hero-gradient relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:28px_28px]" />
        <div className="relative mx-auto max-w-7xl px-6 py-20 sm:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-aqliya-cyan">
              <span className="h-1.5 w-1.5 rounded-full bg-aqliya-cyan" />
              Pricing / الأسعار
            </span>
            <h1 className="mt-5 text-4xl font-black leading-[1.08] tracking-tight text-white sm:text-5xl">
              خطط تناسب نطاق مؤسستك
            </h1>
            <p className="mt-5 text-lg leading-8 text-white/62">
              ابدأ مجاناً واكتشف، ثم اختر الخطة التي تناسب تشغيل مؤسستك. كل
              خطة تتضمن حوكمة وأدلة وسجل تدقيق كامل.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="mx-auto w-full max-w-7xl px-6 py-16 sm:py-20">
        <div className="grid gap-6 lg:grid-cols-3">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              className={`relative flex flex-col rounded-2xl border p-8 ${
                tier.highlighted
                  ? "border-primary/30 bg-gradient-to-br from-primary/[0.06] via-background to-muted/20 shadow-md"
                  : "border-border/60 bg-gradient-to-br from-background to-muted/10"
              }`}
            >
              {tier.badgeAr && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full border border-primary/25 bg-primary px-4 py-1 text-[10px] font-bold text-white">
                  {tier.badgeAr}
                </span>
              )}

              <div className="mb-6">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  {tier.nameEn}
                </p>
                <h2 className="mt-1 text-2xl font-black text-foreground">
                  {tier.nameAr}
                </h2>
              </div>

              <div className="mb-6">
                <p className="text-3xl font-black text-foreground">
                  {tier.priceAr}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {tier.periodAr}
                </p>
              </div>

              <p className="mb-8 text-sm leading-7 text-muted-foreground">
                {tier.descriptionAr}
              </p>

              <ul className="mb-8 flex-1 space-y-3">
                {tier.featuresAr.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2.5 text-sm text-muted-foreground"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Link
                href="/contact"
                className={`flex h-12 items-center justify-center rounded-xl text-sm font-bold transition-colors ${
                  tier.highlighted
                    ? "bg-primary text-white hover:bg-primary/90"
                    : "border border-border/60 bg-background text-foreground hover:border-primary/30 hover:text-primary"
                }`}
              >
                تواصل معنا
              </Link>
            </div>
          ))}
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          جميع الأسعار بالريال السعودي (SAR). الأسعار الاحترافية والمؤسسية
          تقديرية وقابلة للتفاوض حسب نطاق المؤسسة.{" "}
          <Link
            href="/contact"
            className="text-primary underline underline-offset-4"
          >
            احصل على عرض سعر مخصص
          </Link>
        </p>
      </section>

      {/* Feature Comparison */}
      <section className="border-t bg-muted/10">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
              مقارنة الميزات
            </p>
            <h2 className="mt-4 text-3xl font-black text-foreground">
              ما الذي يتضمنه كل خطط؟
            </h2>
          </div>

          <div className="mt-12 overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-border/60">
                  <th className="pb-4 text-right font-semibold text-foreground">
                    الميزة
                  </th>
                  {tiers.map((tier) => (
                    <th
                      key={tier.id}
                      className={`pb-4 text-center font-semibold ${
                        tier.highlighted ? "text-primary" : "text-foreground"
                      }`}
                    >
                      {tier.nameAr}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    feature: "نظام تشغيل واحد",
                    starter: true,
                    professional: true,
                    enterprise: true,
                  },
                  {
                    feature: "بيئة تجريبية مشتركة",
                    starter: true,
                    professional: false,
                    enterprise: false,
                  },
                  {
                    feature: "بيانات مؤسسية معزولة",
                    starter: false,
                    professional: true,
                    enterprise: true,
                  },
                  {
                    feature: "حوكمة كاملة (RBAC + Audit Trail)",
                    starter: "محدود",
                    professional: true,
                    enterprise: true,
                  },
                  {
                    feature: "Office AI Assistant",
                    starter: false,
                    professional: true,
                    enterprise: true,
                  },
                  {
                    feature: "عدد الأنظمة",
                    starter: "1",
                    professional: "1+",
                    enterprise: "بلا حد",
                  },
                  {
                    feature: "تخصيص سير العمل",
                    starter: false,
                    professional: "أساسي",
                    enterprise: true,
                  },
                  {
                    feature: "دمج مع أنظمة خارجية",
                    starter: false,
                    professional: false,
                    enterprise: true,
                  },
                  {
                    feature: "نشر خاص (Private)",
                    starter: false,
                    professional: false,
                    enterprise: true,
                  },
                  {
                    feature: "تدريب الفريق",
                    starter: false,
                    professional: true,
                    enterprise: true,
                  },
                  {
                    feature: "دعم أولوية",
                    starter: false,
                    professional: true,
                    enterprise: true,
                  },
                  {
                    feature: "مدير حساب مخصص",
                    starter: false,
                    professional: false,
                    enterprise: true,
                  },
                  {
                    feature: "SLA مخصص",
                    starter: false,
                    professional: false,
                    enterprise: true,
                  },
                  {
                    feature: "استشارات أمنية دورية",
                    starter: false,
                    professional: false,
                    enterprise: true,
                  },
                ].map((row) => (
                  <tr key={row.feature} className="border-b border-border/40">
                    <td className="py-3.5 text-foreground">{row.feature}</td>
                    <td className="py-3.5 text-center">
                      <CellValue value={row.starter} />
                    </td>
                    <td className="py-3.5 text-center">
                      <CellValue value={row.professional} />
                    </td>
                    <td className="py-3.5 text-center">
                      <CellValue value={row.enterprise} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Deployment Models */}
      <section className="border-t">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
              نماذج النشر
            </p>
            <h2 className="mt-4 text-3xl font-black text-foreground">
              كيف تريد تشغيل المنصة؟
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted-foreground">
              كل نموذج نشر يحافظ على نفس مكونات المنصة. الفرق هو موقع التشغيل
              ودرجة السيادة على البيانات.
            </p>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-3">
            <div className="rounded-2xl border border-status-success/25 bg-gradient-to-br from-status-success/[0.05] to-background p-6">
              <h3 className="text-base font-black text-foreground">
                سحابة عقلية
              </h3>
              <p className="mt-1 text-[11px] font-medium text-muted-foreground">
                AQLIYA Cloud
              </p>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                نشر فوري بدون بنية تحتية. مُدار بالكامل مع تحديثات تلقائية.
              </p>
              <span className="mt-3 inline-block rounded-full bg-status-success/15 px-2.5 py-1 text-[9px] font-bold text-status-success">
                متاح الآن
              </span>
            </div>
            <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/[0.04] to-background p-6">
              <h3 className="text-base font-black text-foreground">
                خوادم خاصة
              </h3>
              <p className="mt-1 text-[11px] font-medium text-muted-foreground">
                AQLIYA Private
              </p>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                داخل بنية تحتية المؤسسة مع تحكم كامل في البيانات.
              </p>
              <span className="mt-3 inline-block rounded-full bg-amber-500/15 px-2.5 py-1 text-[9px] font-bold text-amber-600">
                خاص بعملاء مختارين
              </span>
            </div>
            <div className="rounded-2xl border border-border/40 bg-muted/10 p-6">
              <h3 className="text-base font-black text-foreground">
                بيئة معزولة
              </h3>
              <p className="mt-1 text-[11px] font-medium text-muted-foreground">
                AQLIYA Air-Gapped
              </p>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                نشر كامل داخل بيئة معزولة مع معالجة محلية. للمتطلبات الأمنية
                القصوى.
              </p>
              <span className="mt-3 inline-block rounded-full bg-muted px-2.5 py-1 text-[9px] font-bold text-muted-foreground">
                استراتيجي
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <FAQSection faqNamespace="faq.pricing" />

      {/* CTA */}
      <section className="border-t">
        <div className="mx-auto max-w-4xl px-6 py-16 sm:py-20 text-center">
          <div className="rounded-[24px] border border-border/70 bg-gradient-to-br from-muted/40 via-background to-primary/[0.03] p-8 shadow-sm sm:p-12">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-primary">
              ابدأ اليوم
            </p>
            <h2 className="mt-4 text-3xl font-black text-foreground">
              لا تعرف أي خطة تناسبك؟
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-muted-foreground">
              مكالمة مجانية لنفهم وضع مؤسستك ونقترح المسار المناسب. بدون عرض
              مبيعات.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                href="/contact"
                className="btn-primary h-12 px-10 text-base font-bold"
              >
                احجز جلسة تشخيص
              </Link>
              <Link href="/proof" className="btn-outline h-12 px-10 text-base">
                مواد الإثبات
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function CellValue({ value }: { value: boolean | string }) {
  if (value === true) {
    return (
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/15 text-primary">
        <svg
          className="h-3.5 w-3.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={3}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </span>
    );
  }
  if (value === false) {
    return (
      <span className="text-muted-foreground/30">—</span>
    );
  }
  return (
    <span className="text-xs font-medium text-muted-foreground">{value}</span>
  );
}
