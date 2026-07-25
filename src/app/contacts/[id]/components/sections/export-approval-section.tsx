import { getContactExportData } from "@/actions/contact-detail-read-actions";
import { ExportApprovalDialog } from "@/components/contacts/export-approval-dialog";
import { ContactExportButton } from "@/components/contacts/contact-export-button";
import type { ExportRequest } from "@/components/contacts/components/use-export-approval";

interface ExportApprovalSectionProps {
  contactId: string;
  orgId: string;
  userId: string;
  userRole: string;
}

export async function ExportApprovalSection({ contactId, orgId }: ExportApprovalSectionProps) {
  const { contact, exportRequests } = await getContactExportData(contactId, orgId);
  if (!contact) return null;

  const serializedRequests = exportRequests.map((r) => ({
    ...r,
    reviewedAt: (r as { reviewedAt?: Date | null }).reviewedAt?.toISOString() ?? null,
    exportedAt: (r as { exportedAt?: Date | null }).exportedAt?.toISOString() ?? null,
    createdAt: (r as { createdAt: Date }).createdAt.toISOString(),
    updatedAt: (r as { updatedAt: Date }).updatedAt.toISOString(),
  }));

  const requiresApproval = contact.sensitivityLevel === "confidential" || contact.sensitivityLevel === "sensitive";
  const requiresLegal = contact.sensitivityLevel === "confidential";

  return (
    <>
      <ExportApprovalDialog
        contactId={contactId}
        exportStatus={contact.exportStatus}
        sensitivityLevel={contact.sensitivityLevel}
        canExport={contact.exportStatus === "approved" || (!requiresApproval && contact.exportStatus === "none")}
        hasPendingRequest={exportRequests.some((r) => r.status === "pending")}
        requiresExportApproval={requiresApproval}
        requiresLegalReview={requiresLegal}
        exportRequests={serializedRequests as ExportRequest[]}
      />
      {contact.exportStatus === "approved" && (
        <ContactExportButton contactId={contactId} />
      )}
    </>
  );
}
