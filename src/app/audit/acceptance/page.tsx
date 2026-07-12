import { Suspense } from "react";
import { ClientAcceptanceDashboard } from "@/components/audit/acceptance/client-acceptance-dashboard";
import { LoadingState } from "@/components/ui/loading-state";

export default function AcceptancePage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">قبول العملاء والاستمرار</h1>
        <p className="text-muted-foreground">
          إدارة العملاء المحتملين، فحص العناية الواجبة، تقييم المخاطر، وقرارات القبول
        </p>
      </div>
      <Suspense fallback={<LoadingState message="جاري تحميل نظام القبول..." />}>
        <ClientAcceptanceDashboard auditOrganizationId="" />
      </Suspense>
    </div>
  );
}
