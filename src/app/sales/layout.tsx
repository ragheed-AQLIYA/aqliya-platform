import { PlatformSidebar } from "@/components/platform/platform-sidebar"
import { PlatformHeader } from "@/components/platform/platform-header"

export default function SalesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen overflow-hidden" dir="rtl">
      <PlatformSidebar />
      <div className="flex flex-1 min-w-0 flex-col overflow-hidden">
        <PlatformHeader />
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
