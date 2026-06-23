import Link from "next/link";
import type { Metadata } from "next";
import { publicOsStatus, publicCapabilityNote } from "@/lib/marketing/public-status";
import { ConversionBand } from "@/components/marketing/v2/marketing-shell";

export const metadata: Metadata = {
  title: "AQLIYA | منصة تشغيل مؤسسية للقرارات والامتثال والأدلة",
  description:
    "منصة تشغيل مؤسسية تساعد المؤسسات على قرارات أسرع، مراجعة أقوى، امتثال أوضح، ومعرفة محكومة. الذكاء يساعد. الإنسان يقرر. الدليل يحكم.",
};

const problemTools = [
  { name: "Excel", line: "يحسب. لا يحكم." },
  { name: "البريد / واتساب", line: "يوصّل. لا يوثّق." },
  { name: "ذكاء اصطناعي عام", line: "يُنتج. لا يُراجَع." },
];

const operatingChain = [
  "البيانات",
  "المراجعة",
  "الاعتماد",
  "الأدلة",
  "القرار",
];

const systems = [
  {
    title: "AuditOS",
    note: publicCapabilityNote.auditOS,
    status: publicOsStatus.auditOS.label,
    href: "/products/audit",
  },
  {
    title: "DecisionOS",
    note: publicCapabilityNote.decisionOS,
    status: publicOsStatus.decisionOS.label,
    href: "/products/decision",
  },
  {
    title: "LocalContentOS",
    note: publicCapabilityNote.localContentOS,
    status: publicOsStatus.localContentOS.label,
    href: "/products/local-content",
  },
];

const proofQuick = [
  {
    title: "الديمو التفاعلي",
    body: "مسار تشغيلي كامل — ١٠–١٣ دقيقة، بدون تسجيل.",
    href: "/demo",
  },
  {
    title: "الملخص التنفيذي",
    body: "٥ دقائق للقيادة: المنصة ومسار التعاون.",
    href: "/proof#executive-brief",
  },
  {
    title: "حزمة المشتريات",
    body: "Brief، أمن، SOW — PDF جاهز للجنة الترسية.",
    href: "/procurement-pack",
  },
];

const personaChips = [
  { label: "قيادة تنفيذية", href: "/start#executive" },
  { label: "مدير مالي", href: "/start#cfo" },
  { label: "مقاولات / محتوى محلي", href: "/start#contracting" },
  { label: "تدقيق", href: "/start#audit" },
  { label: "مشتريات", href: "/start#procurement" },
  { label: "حكومة", href: "/start#government" },
];

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Block 1 — Hero */}
      <section className="hero-gradient relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:28px_28px]" />
        <div className="relative mx-auto max-w-7xl px-6 py-18 sm:py-24">
          <div className="mx-auto max-w-4xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-aqliya-cyan">
              <span className="h-1.5 w-1.5 rounded-full bg-aqliya-cyan" />
              منصة تشغيل مؤسسية
            </span>
            <h1 className="mt-6 text-4xl font-black leading-[1.08] text-white sm:text-5xl">
              مسارات مراجعة وقرار وامتثال — لا تضيع في Excel والبريد
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-white/65">
              ليس chatbot. ليس ERP. منصة تشغيل تربط البيانات والمراجعة
              والاعتماد في مسار واحد قابل للمساءلة.
            </p>
            <p className="mt-4 text-sm font-bold text-aqliya-cyan">
              الذكاء يساعد. الإنسان يقرر. الدليل يحكم.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/start" className="btn-primary h-12 px-8 text-base font-bold">
                من أين تبدأ؟
              </Link>
              <Link
                href="/demo"
                className="btn-outline border-white/15 text-white/70 h-12 px-8 text-base hover:bg-white/5"
              >
                شاهد الديمو
              </Link>
              <Link
                href="/contact"
                className="btn-outline border-white/15 text-white/70 h-12 px-8 text-base hover:bg-white/5"
              >
                احجز تشخيص
              </Link>
            </div>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {personaChips.map((chip) => (
                <Link
                  key={chip.href}
                  href={chip.href}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/55 hover:border-aqliya-cyan/30 hover:text-white/80"
                >
                  {chip.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Block 2 — المشكلة → الحل */}
      <section className="border-t bg-muted/10">
        <div className="mx-auto max-w-7xl px-6 py-14 sm:py-18">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-black text-foreground sm:text-3xl">
              الأدوات الحالية لا تبني مساءلة
            </h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              قرارات بلا سجل، مخرجات بلا مصدر، معرفة تضيع بمغادرة الأشخاص.
            </p>
          </div>
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <ul className="space-y-3 rounded-2xl border border-border/60 bg-background p-6">
              {problemTools.map((t) => (
                <li key={t.name} className="text-sm">
                  <span className="font-semibold text-foreground">{t.name}</span>
                  <span className="text-muted-foreground"> — {t.line}</span>
                </li>
              ))}
            </ul>
            <div className="rounded-2xl border border-primary/15 bg-primary/[0.03] p-6">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">
                مسار عقلية
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {operatingChain.map((step, i) => (
                  <span key={step} className="flex items-center gap-2 text-sm font-medium">
                    {i > 0 && <span className="text-muted-foreground/40">←</span>}
                    {step}
                  </span>
                ))}
              </div>
              <Link href="/use-cases" className="mt-5 inline-block text-sm font-medium text-primary hover:underline">
                استكشف حالات الاستخدام ←
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Block 3 — أنظمة التشغيل */}
      <section className="section-gradient-light border-t">
        <div className="mx-auto max-w-7xl px-6 py-14 sm:py-18">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-black text-foreground sm:text-3xl">
              أنظمة التشغيل على منصة واحدة
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              تدقيق، قرارات، محتوى محلي — حوكمة وأدلة مشتركة.
            </p>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {systems.map((sys) => (
              <Link
                key={sys.title}
                href={sys.href}
                className="group rounded-2xl border border-border/60 bg-background p-6 transition-colors hover:border-primary/30"
              >
                <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">
                  {sys.status}
                </p>
                <h3 className="mt-2 text-lg font-black group-hover:text-primary">
                  {sys.title}
                </h3>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                  {sys.note}
                </p>
              </Link>
            ))}
          </div>
          <div className="mt-6 text-center">
            <Link href="/products" className="btn-outline h-10 px-6 text-sm">
              كل أنظمة التشغيل
            </Link>
          </div>
        </div>
      </section>

      {/* Block 4 — إثبات + تحويل */}
      <section className="mx-auto max-w-7xl border-t px-6 py-14 sm:py-18">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-black text-foreground sm:text-3xl">
            أثبت قبل أن تلتزم
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">
            ديمو، وثائق، وحزمة مشتريات — في مركز إثبات واحد.
          </p>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {proofQuick.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-2xl border border-border/60 p-5 transition-colors hover:border-primary/25"
            >
              <h3 className="text-sm font-bold text-foreground">{item.title}</h3>
              <p className="mt-2 text-xs leading-6 text-muted-foreground">
                {item.body}
              </p>
            </Link>
          ))}
        </div>
        <div className="mt-6 text-center">
          <Link href="/proof" className="text-sm font-medium text-primary hover:underline">
            مركز الإثبات الكامل ←
          </Link>
        </div>
      </section>

      <ConversionBand />
    </div>
  );
}
