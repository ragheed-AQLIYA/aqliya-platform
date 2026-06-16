export const dynamic = "force-dynamic";

import { PlatformSidebar } from "@/components/platform/platform-sidebar";
import { PlatformHeader } from "@/components/platform/platform-header";
import { ProductWorkspaceNotice } from "@/components/platform/product-workspace-notice";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function DecisionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    await getCurrentUser();
  } catch {
    redirect("/login");
  }

  return (
    <div className="flex h-screen overflow-hidden" dir="rtl">
      <PlatformSidebar />
      <div className="flex flex-1 min-w-0 flex-col overflow-hidden">
        <PlatformHeader />
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8">
            <ProductWorkspaceNotice productNameAr="DecisionOS" level="prototype" />
            <nav className="flex items-center gap-1 mb-6 border-b pb-2" aria-label="التنقل الرئيسي">
              <Link href="/decision" className="px-3 py-1.5 text-sm rounded-md transition-colors hover:bg-muted">
                لوحة القرارات
              </Link>
              <Link href="/decision/gov" className="px-3 py-1.5 text-sm rounded-md transition-colors hover:bg-muted">
                الحوكمة
              </Link>
            </nav>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
