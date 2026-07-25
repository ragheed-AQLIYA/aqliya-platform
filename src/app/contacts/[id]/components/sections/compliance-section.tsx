import { getCurrentUser } from "@/lib/auth";
import { CompliancePanel } from "@/components/contacts/compliance-panel";

interface ComplianceSectionProps {
  contactId: string;
  orgId: string;
  userId: string;
}

export async function ComplianceSection({ contactId }: ComplianceSectionProps) {
  const { getExportComplianceSummary } = await import("@/lib/localcontactos/compliance-service");
  const user = await getCurrentUser();
  const summary = await getExportComplianceSummary(contactId, user);

  return <CompliancePanel summary={summary} />;
}
