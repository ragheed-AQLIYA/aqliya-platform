import { QualityDashboard } from "@/components/audit/quality/quality-dashboard";
import { QualityObjectivesCrud } from "@/components/audit/quality/quality-objectives-crud";

export default function QualityPage() {
  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold">نظام إدارة الجودة ISQM1</h1>
        <p className="text-muted-foreground">
          إدارة أهداف الجودة، المخاطر، الاستجابات، أنشطة المراقبة، النتائج، والمعالجات
        </p>
      </div>
      <QualityDashboard auditOrganizationId="" />
      <div className="border-t pt-6">
        <QualityObjectivesCrud auditOrganizationId="" />
      </div>
    </div>
  );
}
