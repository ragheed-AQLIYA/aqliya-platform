import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const mockOrganizations = [
  { id: "org_1", name: "AQLIYA", memberCount: 12, decisionCount: 34, createdAt: "2025-01-15" },
]

export default function OrganizationsPage() {
  return (
    <main className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">المؤسسات</h1>
        <Button>مؤسسة جديدة</Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {mockOrganizations.map((org) => (
          <Link key={org.id} href={`/dashboard/organizations/${org.id}`}>
            <Card className="p-4 hover:border-primary transition-colors">
              <h2 className="text-lg font-semibold">{org.name}</h2>
              <div className="text-sm text-muted-foreground mt-2 space-y-1">
                <p>الأعضاء: {org.memberCount}</p>
                <p>القرارات: {org.decisionCount}</p>
                <p>تاريخ الإنشاء: {org.createdAt}</p>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </main>
  )
}
