import "server-only"

import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { listUsers } from "@/actions/admin-actions"
import { UsersTable } from "@/components/admin/users-table"

export const dynamic = "force-dynamic"

export default async function AdminUsersPage() {
  const user = await getCurrentUser()
  if (!user || user.role !== "ADMIN") redirect("/access-denied")

  const { users } = await listUsers(user.organizationId)

  return (
    <main className="p-8 max-w-4xl mx-auto" dir="rtl">
      <div className="mb-6">
        <Link
          href="/admin"
          className="text-sm text-muted-foreground hover:text-foreground mb-2 inline-block"
        >
          ← العودة إلى لوحة الإدارة
        </Link>
        <h1 className="text-2xl font-bold">إدارة المستخدمين</h1>
        <p className="text-muted-foreground">
          عرض وإدارة صلاحيات المستخدمين في المؤسسة
        </p>
      </div>

      <UsersTable users={users} organizationId={user.organizationId} />
    </main>
  )
}
