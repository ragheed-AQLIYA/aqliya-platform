import { IndependenceDashboard } from "@/components/audit/independence/independence-dashboard";

export default function IndependencePage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">الاستقلالية</h1>
        <p className="text-muted-foreground">
          إدارة سجل الاستقلالية، المصالح المالية، علاقات العمل، التهديدات، والتأكيد السنوي
        </p>
      </div>
      <IndependenceDashboard auditOrganizationId="" />
    </div>
  );
}
