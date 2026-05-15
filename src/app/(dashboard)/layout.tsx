import { PlatformSidebar } from "@/components/platform/platform-sidebar"
import { PlatformHeader } from "@/components/platform/platform-header"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen" dir="rtl">
      <PlatformSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <PlatformHeader />
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
