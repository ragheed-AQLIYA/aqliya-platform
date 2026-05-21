import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

const mockOrganizations = [
  {
    id: "org_1",
    name: "AQLIYA",
    memberCount: 12,
    decisionCount: 34,
    createdAt: "2025-01-15",
  },
];

export default function OrganizationsPage() {
  return (
    <main className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">المؤسسات</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            واجهة داخلية تجريبية ببيانات ثابتة وليست جزءًا من إصدار v0.1.
          </p>
        </div>
        <Button disabled variant="outline">
          إنشاء مؤسسة غير متاح في v0.1
        </Button>
      </div>

      <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
        هذه الصفحة نموذج أولي داخلي. البيانات المعروضة توضيحية فقط ولا توجد لها
        طبقة حفظ أو إدارة مؤسسات مكتملة بعد.
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {mockOrganizations.map((org) => (
          <Link key={org.id} href={`/organizations/${org.id}`}>
            <Card className="p-4 hover:border-primary transition-colors">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold">{org.name}</h2>
                <Badge variant="outline">Prototype</Badge>
              </div>
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
  );
}
