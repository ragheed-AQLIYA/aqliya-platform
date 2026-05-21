import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

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
};

export default function OrganizationDetailPage() {
  return (
    <main className="p-8 max-w-4xl mx-auto">
      <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
        معاينة داخلية فقط. تفاصيل المؤسسة والأعضاء هنا ثابتة لأغراض العرض وليست
        سجلًا تشغيليًا معتمدًا ضمن v0.1.
      </div>

      <div className="flex items-center gap-4 mb-6">
        <Link href="/organizations">
          <Button variant="outline" size="sm">
            رجوع
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">{mockOrg.name}</h1>
        <Badge variant="outline">Prototype</Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">إجمالي الأعضاء</div>
          <div className="text-2xl font-bold">{mockOrg.members.length}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">القرارات</div>
          <div className="text-2xl font-bold">{mockOrg.decisionCount}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">تاريخ الإنشاء</div>
          <div className="text-lg font-medium">{mockOrg.createdAt}</div>
        </Card>
      </div>

      <section>
        <h2 className="text-xl font-semibold mb-4">الأعضاء</h2>
        <div className="space-y-2">
          {mockOrg.members.map((member) => (
            <Card
              key={member.email}
              className="p-3 flex items-center justify-between"
            >
              <div>
                <div className="font-medium">{member.name}</div>
                <div className="text-sm text-muted-foreground">
                  {member.email}
                </div>
              </div>
              <Badge variant="outline">{member.role}</Badge>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
