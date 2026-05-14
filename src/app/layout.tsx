import type { Metadata } from "next";
import { Noto_Sans_Arabic } from "next/font/google";
import "./globals.css";

const notoSansArabic = Noto_Sans_Arabic({
  variable: "--font-sans",
  subsets: ["arabic", "latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "AQLIYA | منصة ذكاء مؤسسي خاص ومحكوم",
  description:
    "عقلية منصة ذكاء مؤسسي خاص ومحكوم، تقدم خطوط أنظمة متخصصة تربط البيانات، الإجراءات، المخرجات، والأدلة داخل بيئة واحدة قابلة للمراجعة والاعتماد.",
  icons: {
    icon: "/brand/Favicons/symbol (1).svg",
  },
  openGraph: {
    title: "AQLIYA | منصة ذكاء مؤسسي خاص ومحكوم",
    description:
      "عقلية منصة ذكاء مؤسسي خاص ومحكوم تقدم خطوط أنظمة متخصصة تبنى على AQLIYA Intelligence Core داخل بيئة واحدة قابلة للمراجعة والاعتماد.",
    url: "https://aqliya.com",
    siteName: "AQLIYA",
    locale: "ar_SA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AQLIYA | منصة ذكاء مؤسسي خاص ومحكوم",
    description:
      "عقلية منصة ذكاء مؤسسي خاص ومحكوم تقدم خطوط أنظمة متخصصة تبنى على AQLIYA Intelligence Core داخل بيئة واحدة قابلة للمراجعة والاعتماد.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
        {
          "@type": "Organization",
          "@id": "https://aqliya.com/#organization",
          "name": "AQLIYA",
          "url": "https://aqliya.com",
          "description": "عقلية منصة ذكاء مؤسسي خاص ومحكوم تقدم خطوط أنظمة متخصصة مبنية على AQLIYA Intelligence Core ضمن بيئة قابلة للمراجعة والاعتماد.",
          "email": "ragheed@aqliya.com",
        },
      {
        "@type": "WebSite",
        "@id": "https://aqliya.com/#website",
        "url": "https://aqliya.com",
        "name": "AQLIYA",
        "publisher": { "@id": "https://aqliya.com/#organization" },
        "inLanguage": "ar-SA",
      },
    ],
  }

  return (
    <html lang="ar" dir="rtl">
        <body className={`${notoSansArabic.variable} h-full font-sans antialiased`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
