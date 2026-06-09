import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { TrackerProvider } from "@/components/tracking/tracker-provider";

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
