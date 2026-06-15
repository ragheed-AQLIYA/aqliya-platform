import { ClientAcceptanceDashboard } from "@/components/audit/acceptance/client-acceptance-dashboard";

export default function AcceptancePage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">قبول العملاء والاستمرار</h1>
        <p className="text-muted-foreground">
          إدارة العملاء المحتملين، فحص العناية الواجبة، تقييم المخاطر، وقرارات القبول
        </p>
      </div>
      <ClientAcceptanceDashboard auditOrganizationId="" />
    </div>
  );
}
