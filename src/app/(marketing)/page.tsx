import type { Metadata } from "next";
import { ConversionBand } from "@/components/marketing/v2/marketing-shell";
import {
  HomeHeroSection,
  ProblemSection,
  ComparisonSection,
  PlatformLayersSection,
  SystemCardGrid,
  ProofSection,
} from "@/components/marketing/home-sections";
import { homeCopyAr } from "@/lib/marketing/copy-plain";
import { publicCapabilityNote, publicOsStatus } from "@/lib/marketing/public-status";

export const metadata: Metadata = {
  title: homeCopyAr.metadata.title,
  description: homeCopyAr.metadata.description,
};

const systems = [
  { title: "AuditOS", note: publicCapabilityNote.auditOS, status: publicOsStatus.auditOS.label, href: "/products/audit" },
  { title: "LocalContentOS", note: publicCapabilityNote.localContentOS, status: publicOsStatus.localContentOS.label, href: "/products/local-content" },
  { title: "DecisionOS", note: "بدائل، معايير، مخاطر، وتوصية — كل قرار موثّق.", status: publicOsStatus.decisionOS.label, href: "/products/decision" },
  { title: "SalesOS", note: publicCapabilityNote.salesOS, status: publicOsStatus.salesOS.label, href: "/products/sales" },
];

const platformLayers = [
  { num: "01", title: "الحوكمة", desc: "الصلاحيات، سجل التدقيق، بوابات الاعتماد — كل حدث مُوثَّق" },
  { num: "02", title: "قاعدة المعرفة", desc: "كل مخرج مرتبط بمصدره — شبكة أدلة غير قابلة للكسر" },
  { num: "03", title: "مشغّلات الذكاء", desc: "AI يُساعد ويقترح — لا يقرّر ولا يعتمد بدون الإنسان" },
  { num: "04", title: "أنظمة التشغيل", desc: "كل نظام يرث الحوكمة والذكاء — لا إعادة بناء من الصفر" },
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
      />

      <ProblemSection
        data={{ ...c.problem, pathHref: "/use-cases" }}
        arrow="←"
      />

      <ComparisonSection
        eyebrow="لماذا منصة لا أداة؟"
        heading="الأداة تحل مشكلة — المنصة تُنظّم المؤسسة"
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
              "صلاحيات وأدلة جزء من بنية المنصة — لا إدارة منفصلة",
            ],
          },
        ]}
      />

      <PlatformLayersSection
        heading="بنية المنصة — أربع طبقات متراصة"
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

      <ProofSection
        data={{ ...c.proof, ctaHref: "/proof" }}
      />

      <ConversionBand
        title={c.conversion.title}
        body={c.conversion.body}
        primaryLabel={c.conversion.primaryLabel}
        secondaryLabel={c.conversion.secondaryLabel}
      />
    </div>
  );
}
