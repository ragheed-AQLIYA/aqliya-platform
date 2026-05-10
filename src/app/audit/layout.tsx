import { AuditSidebar } from "@/components/audit/layout/audit-sidebar"
import { Header } from "@/components/layout/header"

export default function AuditLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen overflow-x-hidden" dir="rtl">
      <AuditSidebar />
      <div className="flex flex-1 min-w-0 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
