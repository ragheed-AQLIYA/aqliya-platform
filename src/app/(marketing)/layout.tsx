import type { Metadata } from "next";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { TrackerProvider } from "@/components/tracking/tracker-provider";
import { OrganizationJsonLd, WebSiteJsonLd } from "@/components/marketing/structured-data";

export const metadata: Metadata = {
  metadataBase: new URL("https://aqliya.com"),
  title: {
    default: "AQLIYA | منصة ذكاء مؤسسي محكوم",
    template: "%s | AQLIYA",
  },
  description:
    "AQLIYA منصة ذكاء مؤسسي خاص ومحكوم تساعد الجهات على بناء وتشغيل أنظمة مؤسسية ذكية داخل بيئة مضبوطة مع حوكمة وأدلة وصلاحيات وسجل تدقيق. Private governed institutional intelligence platform.",
  keywords: [
    "منصة ذكاء مؤسسي",
    "حوكمة مؤسسية",
    "أنظمة تشغيل مؤسسية",
    "تدقيق مالي ذكي",
    "محتوى محلي",
    "قرارات مؤسسية",
    "AQLIYA",
    "institutional intelligence",
    "governed AI",
    "audit platform",
    "Saudi market",
  ],
  authors: [{ name: "AQLIYA" }],
  creator: "AQLIYA",
  publisher: "AQLIYA",
  formatDetection: {
    telephone: false,
    email: false,
  },
  openGraph: {
    type: "website",
    siteName: "AQLIYA",
    locale: "ar_SA",
    alternateLocale: "en_US",
    url: "https://aqliya.com",
    title: "AQLIYA | منصة ذكاء مؤسسي محكوم",
    description:
      "منصة ذكاء مؤسسي خاص ومحكوم تساعد الجهات على بناء وتشغيل أنظمة مؤسسية ذكية داخل بيئة مضبوطة مع حوكمة وأدلة وصلاحيات وسجل تدقيق.",
    images: [
      {
        url: "/og-default.png",
        width: 1200,
        height: 630,
        alt: "AQLIYA - Private Governed Institutional Intelligence Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AQLIYA | منصة ذكاء مؤسسي محكوم",
    description:
      "منصة ذكاء مؤسسي خاص ومحكوم تساعد الجهات على بناء وتشغيل أنظمة مؤسسية ذكية داخل بيئة مضبوطة مع حوكمة وأدلة وصلاحيات وسجل تدقيق.",
    images: ["/og-default.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TrackerProvider>
      <OrganizationJsonLd />
      <WebSiteJsonLd />
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main id="main-content" role="main" className="flex-1">
          {children}
        </main>
        <SiteFooter />
      </div>
    </TrackerProvider>
  );
}
