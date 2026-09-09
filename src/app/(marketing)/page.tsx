import type { Metadata } from "next";
import { ConversionBand } from "@/components/marketing/v2/marketing-shell";
import {
  HomeHeroSection,
  ProblemSection,
  ComparisonSection,
  PlatformLayersSection,
  SystemCardGrid,
  ProofSection,
  TrustSection,
} from "@/components/marketing/home-sections";
import { FAQSection } from "@/components/marketing/faq-section";
import { PlatformArchitecture } from "@/components/marketing/platform-architecture";
import { homeCopyAr } from "@/lib/marketing/copy-plain";
import { publicCapabilityNote, publicOsStatus } from "@/lib/marketing/public-status";
import { buildAlternates } from "@/lib/marketing/seo";

const heroArchitectureAr = {
  topLabel: "المؤسسة",
  topDesc: "وثائق، أنظمة، لوائح، وخبرة متراكمة  مبعثرة اليوم",
  layers: [
    { num: "04", title: "أنظمة التشغيل", desc: "تدقيق، محتوى محلي، قرارات  ترث الحوكمة والذكاء" },
    { num: "03", title: "مشغّلات الذكاء", desc: "الذكاء يقترح ويحلّل  ضمن أدلة وصلاحيات" },
    { num: "02", title: "قاعدة المعرفة", desc: "كل مخرج مرتبط بمصدره  شبكة أدلة متماسكة" },
    { num: "01", title: "الحوكمة", desc: "صلاحيات، مراجعة، اعتماد، وسجل تدقيق" },
  ],
  bottomLabel: "النتيجة المؤسسية",
  bottomDesc: "قرارات ومخرجات قابلة للدفاع أمام كل مراجعة",
};

const heroTrustSignalsAr = [
  { label: "أدلة مرتبطة بالمصدر" },
  { label: "مراجعة واعتماد بشري" },
  { label: "سجل تدقيق كامل" },
];

export function generateMetadata(): Metadata {
  const title = homeCopyAr.metadata.title;
  const description = homeCopyAr.metadata.description;
  return {
    title,
    description,
    alternates: buildAlternates("/"),
  };
}

const systems = [
  { title: "AuditOS", note: publicCapabilityNote.auditOS, status: publicOsStatus.auditOS.label, href: "/products/audit" },
  { title: "LocalContentOS", note: publicCapabilityNote.localContentOS, status: publicOsStatus.localContentOS.label, href: "/products/local-content" },
  { title: "DecisionOS", note: "بدائل، معايير، مخاطر، وتوصية  كل قرار موثّق.", status: publicOsStatus.decisionOS.label, href: "/products/decision" },
  { title: "SalesOS", note: publicCapabilityNote.salesOS, status: publicOsStatus.salesOS.label, href: "/products/sales" },
];

const platformLayers = [
  { num: "01", title: "الحوكمة", desc: "الصلاحيات، سجل التدقيق، بوابات الاعتماد  كل حدث مُوثَّق" },
  { num: "02", title: "قاعدة المعرفة", desc: "كل مخرج مرتبط بمصدره  شبكة أدلة غير قابلة للكسر" },
  { num: "03", title: "مشغّلات الذكاء", desc: "AI يُساعد ويقترح  لا يقرّر ولا يعتمد بدون الإنسان" },
  { num: "04", title: "أنظمة التشغيل", desc: "كل نظام يرث الحوكمة والذكاء  لا إعادة بناء من الصفر" },
];



export default function HomePage() {
  const c = homeCopyAr;

  return (
    <div className="flex flex-col">
      <HomeHeroSection
        eyebrow={c.hero.eyebrow}
        title={c.hero.title}
        subtitle={c.hero.subtitle}
        primaryCta={{ label: c.ctas.contact, href: "/contact" }}
        secondaryCta={{ label: c.ctas.demo, href: "/platform" }}
        personaChips={c.personaChips.map((p) => ({ ...p }))}
        personaLabel="لِمن؟"
        trustSignals={heroTrustSignalsAr}
        visual={
          <PlatformArchitecture
            topLabel={heroArchitectureAr.topLabel}
            topDesc={heroArchitectureAr.topDesc}
            layers={heroArchitectureAr.layers}
            bottomLabel={heroArchitectureAr.bottomLabel}
            bottomDesc={heroArchitectureAr.bottomDesc}
          />
        }
      />

      <ProblemSection
        data={{ ...c.problem, pathHref: "/use-cases" }}
        arrow="←"
      />

      <ComparisonSection
        eyebrow="لماذا منصة لا أداة؟"
        heading="الأداة تحل مشكلة  المنصة تُنظّم المؤسسة"
        sides={[
          {
            title: "أداة ذكاء منفصلة",
            color: "red",
            items: [
              "مخرجات بدون مسار مراجعة أو اعتماد",
              "كل نطاق جديد يحتاج أداة جديدة من الصفر",
              "صلاحيات وأدلة تُدار خارج النظام أو لا تُدار",
            ],
          },
          {
            title: "منصة عقلية",
            color: "emerald",
            items: [
              "كل مخرج يمر بحوكمة وأدلة قبل الاعتماد",
              "كل نظام يرث الحوكمة والذكاء من منصة واحدة",
              "صلاحيات وأدلة جزء من بنية المنصة  لا إدارة منفصلة",
            ],
          },
        ]}
      />

      <PlatformLayersSection
        heading="بنية المنصة  أربع طبقات متراصة"
        subtitle="كل طبقة تخدم التي تعلوها. كل نظام تشغيل يستفيد من الثلاث طبقات تحته دون تكرار."
        layers={platformLayers}
        ctaLabel="تعمّق في بنية المنصة ←"
        ctaHref="/platform"
      />

      <SystemCardGrid
        heading={c.systems.title}
        subtitle={c.systems.subtitle}
        systems={systems}
        ctaAll={c.systems.ctaAll}
        ctaHref="/products"
      />

      <TrustSection
        eyebrow="الثقة بنية لا وعد"
        heading="لماذا تثق المؤسسات المحكومة بعقلية"
        subtitle="الخصوصية، الصلاحيات، الأدلة، والتتبّع مبادئ أساسية في تصميم المنصة  لا إضافات لاحقة."
        pillars={[
          { title: "ذكاء خاص ومحكوم", desc: "الذكاء يعمل ضمن بيئة المؤسسة وصلاحياتها  لا صندوق أسود." },
          { title: "صلاحيات وعزل مؤسسي", desc: "كل مستخدم يرى ما يخصه فقط  عزل كامل بين الجهات." },
          { title: "أدلة قابلة للتتبّع", desc: "كل مخرج مرتبط بمصدره ويصمد أمام المراجعة." },
          { title: "سجل تدقيق كامل", desc: "كل حدث مُوثَّق بالهوية والوقت  قابل للمراجعة لاحقاً." },
        ]}
        principleLabel="المبدأ المؤسسي"
        principle="الذكاء يساعد. الإنسان يقرّر. الدليل يحكم."
      />

      <ProofSection
        data={{ ...c.proof, ctaHref: "/proof" }}
      />

      <FAQSection />

      <ConversionBand
        title={c.conversion.title}
        body={c.conversion.body}
        primaryLabel={c.conversion.primaryLabel}
        secondaryLabel={c.conversion.secondaryLabel}
      />
    </div>
  );
}
