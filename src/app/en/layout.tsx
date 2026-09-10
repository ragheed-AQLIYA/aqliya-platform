import type { Metadata } from "next";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { TrackerProvider } from "@/components/tracking/tracker-provider";

export const metadata: Metadata = {
  openGraph: {
    title: "AQLIYA | Private Governed Institutional Intelligence Platform",
    description:
      "AQLIYA is a Private Governed Institutional Intelligence Platform — governed AI, evidence, review, approval, and audit trail across institutional operating systems.",
    url: "https://aqliya.com/en",
    siteName: "AQLIYA",
    locale: "en_US",
    alternateLocale: "ar_SA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AQLIYA | Private Governed Institutional Intelligence Platform",
    description:
      "AQLIYA is a Private Governed Institutional Intelligence Platform — governed AI, evidence, review, approval, and audit trail across institutional operating systems.",
  },
};

export default function EnglishMarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TrackerProvider>
      <div className="flex min-h-screen flex-col" lang="en" dir="ltr">
        <SiteHeader locale="en" />
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <SiteFooter locale="en" />
      </div>
    </TrackerProvider>
  );
}
