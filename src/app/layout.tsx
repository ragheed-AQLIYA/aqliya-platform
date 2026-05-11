import type { Metadata } from "next";
import { Noto_Sans_Arabic } from "next/font/google";
import "./globals.css";

const notoSansArabic = Noto_Sans_Arabic({
  variable: "--font-sans",
  subsets: ["arabic", "latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "AQLIYA | أنظمة برمجية وذكاء مؤسسي",
  description:
    "عقلية شركة تقنية تصنع وتعدّ أنظمة برمجية وذكاء مؤسسي حسب طبيعة عمل المؤسسات — أنظمة تشغيل، تحليل، تتبع، مراجعة، وتطوير.",
  icons: {
    icon: "/brand/Favicons/symbol (1).svg",
  },
  openGraph: {
    title: "AQLIYA | أنظمة برمجية وذكاء مؤسسي",
    description:
      "عقلية شركة تقنية تصنع وتعدّ أنظمة برمجية وذكاء مؤسسي حسب طبيعة عمل المؤسسات.",
    url: "https://aqliya.com",
    siteName: "AQLIYA",
    locale: "ar_SA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AQLIYA | أنظمة برمجية وذكاء مؤسسي",
    description:
      "عقلية شركة تقنية تصنع وتعدّ أنظمة برمجية وذكاء مؤسسي حسب طبيعة عمل المؤسسات.",
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
        "description": "شركة تقنية تصنع وتعدّ أنظمة برمجية وذكاء مؤسسي حسب طبيعة عمل المؤسسات.",
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
