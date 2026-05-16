import type { Organization, WebSite, WithContext } from "schema-dts";

const jsonLd: WithContext<Organization | WebSite>[] = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": "https://aqliya.com/#organization",
    name: "AQLIYA",
    url: "https://aqliya.com",
    description:
      "منصة ذكاء مؤسسي خاص ومحكوم تقدم خطوط أنظمة متخصصة مبنية على AQLIYA Intelligence Core ضمن بيئة قابلة للمراجعة والاعتماد.",
    email: "ragheed@aqliya.com",
    foundingDate: "2025",
    knowsLanguage: ["ar-SA", "en-US", "tr-TR"],
    slogan: "منصة ذكاء مؤسسي خاص ومحكوم",
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": "https://aqliya.com/#website",
    name: "AQLIYA",
    url: "https://aqliya.com",
    publisher: { "@id": "https://aqliya.com/#organization" },
    inLanguage: "ar-SA",
  },
];

export { jsonLd };
