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
    icon: "/favicon.svg",
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
  return (
    <html lang="ar" dir="rtl">
        <body className={`${notoSansArabic.variable} h-full font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
