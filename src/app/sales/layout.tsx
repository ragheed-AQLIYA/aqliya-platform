import { PlatformSidebar } from "@/components/platform/platform-sidebar";
import { PlatformHeader } from "@/components/platform/platform-header";
import { ProductWorkspaceNotice } from "@/components/platform/product-workspace-notice";
import { SalesNav } from "@/components/sales/sales-nav";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function SalesLayout({
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
            <ProductWorkspaceNotice productNameAr="SalesOS" level="prototype" />
            <SalesNav />
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
