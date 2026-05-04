import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

const mockOrg = {
  id: "org_1",
  name: "AQLIYA",
  createdAt: "2025-01-15",
  members: [
    { name: "Ahmed Al-Mansouri", email: "ahmed@aqliya.com", role: "ADMIN" },
    { name: "Sara Al-Otaibi", email: "sara@aqliya.com", role: "MEMBER" },
    { name: "Mohammad Al-Harbi", email: "mohammad@aqliya.com", role: "ADMIN" },
  ],
  decisionCount: 34,
}

export default function OrganizationDetailPage() {
  return (
    <main className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/organizations">
          <Button variant="outline" size="sm">Back</Button>
        </Link>
        <h1 className="text-2xl font-bold">{mockOrg.name}</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Total Members</div>
          <div className="text-2xl font-bold">{mockOrg.members.length}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Decisions</div>
          <div className="text-2xl font-bold">{mockOrg.decisionCount}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Created</div>
          <div className="text-lg font-medium">{mockOrg.createdAt}</div>
        </Card>
      </div>

      <section>
        <h2 className="text-xl font-semibold mb-4">Members</h2>
        <div className="space-y-2">
          {mockOrg.members.map((member, i) => (
            <Card key={i} className="p-3 flex items-center justify-between">
              <div>
                <div className="font-medium">{member.name}</div>
                <div className="text-sm text-muted-foreground">{member.email}</div>
              </div>
              <Badge variant="outline">{member.role}</Badge>
            </Card>
          ))}
        </div>
      </section>
    </main>
  )
}
