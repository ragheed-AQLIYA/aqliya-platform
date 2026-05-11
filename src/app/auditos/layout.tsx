import Link from "next/link"
import { DemoSidebar } from "./demo-sidebar"

export default function AuditosLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen" dir="rtl">
      <DemoSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
