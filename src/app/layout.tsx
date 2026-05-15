import type { Metadata } from "next";
import { Noto_Sans_Arabic } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { WebVitals } from "@/components/platform/web-vitals";
import { Analytics } from "@/components/platform/analytics";
import { jsonLd } from "@/components/platform/json-ld";
import { SkipToContent } from "@/components/platform/skip-to-content";
import { ServiceWorkerRegister } from "@/components/platform/service-worker-register";
import { A11yProvider } from "@/components/platform/a11y-provider";
import "./globals.css";

const notoSansArabic = Noto_Sans_Arabic({
  variable: "--font-sans",
  subsets: ["arabic", "latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "AQLIYA | منصة ذكاء مؤسسي خاص ومحكوم",
  description:
    "عقلية منصة ذكاء مؤسسي خاص ومحكوم: تقدم خطوط أنظمة مؤسسية ذكية مع حوكمة القرار، ربط الأدلة، المراجعة البشرية، سير العمل، الصلاحيات، وسجل التدقيق. الذكاء يساعد. الإنسان يقرر. الدليل يحكم.",
  icons: {
    icon: "/brand/Favicons/symbol (1).svg",
  },
  openGraph: {
    title: "AQLIYA | منصة ذكاء مؤسسي خاص ومحكوم",
    description:
      "عقلية منصة ذكاء مؤسسي خاص ومحكوم مع حوكمة مدمجة، ربط الأدلة، مراجعة بشرية، وسير عمل مؤسسي. الذكاء يساعد. الإنسان يقرر. الدليل يحكم.",
    url: "https://aqliya.com",
    siteName: "AQLIYA",
    locale: "ar_SA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AQLIYA | منصة ذكاء مؤسسي خاص ومحكوم",
    description:
      "عقلية منصة ذكاء مؤسسي خاص ومحكوم مع حوكمة مدمجة، ربط الأدلة، مراجعة بشرية، وسير عمل مؤسسي. الذكاء يساعد. الإنسان يقرر. الدليل يحكم.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();
  return (
    <html lang={locale} dir={locale === "ar" ? "rtl" : "ltr"}>
      <body
        className={`${notoSansArabic.variable} h-full font-sans antialiased`}
      >
        <SkipToContent />
        <ServiceWorkerRegister />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": jsonLd,
            }),
          }}
        />
        <NextIntlClientProvider messages={messages}>
          <A11yProvider>
            <WebVitals />
            <Analytics />
            {children}
          </A11yProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
