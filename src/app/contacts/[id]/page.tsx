import { unstable_noStore as noStore } from "next/cache";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getContact } from "@/actions/contact-actions";
import { AuditTrailViewer } from "@/components/contacts/audit-trail-viewer";
import { ContactHeader } from "./components/contact-header";
import { ContactInfoCard } from "./components/contact-info-card";
import { RelationsCard } from "./components/relations-card";
import { InteractionsCard } from "./components/interactions-card";
import { ContactSidebarActions } from "./components/contact-sidebar-actions";
import { EvidenceSection } from "./components/sections/evidence-section";
import { ReviewsSection } from "./components/sections/reviews-section";
import { RiskFlagsSection } from "./components/sections/risk-flags-section";
import { ComplianceSection } from "./components/sections/compliance-section";
import { ExportApprovalSection } from "./components/sections/export-approval-section";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function deleteAction(id: string) {
  "use server";
  const { deleteContact } = await import("@/actions/contact-actions");
  await deleteContact(id);
  redirect("/contacts");
}

export default async function ContactDetailPage({ params }: PageProps) {
  noStore();
  const user = await getCurrentUser();
  const { id } = await params;
  const result = await getContact(id);
  if (!result.ok) notFound();
  const contact = result.data;
  const handleDelete = deleteAction.bind(null, id);

  return (
    <div dir="rtl" className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <ContactHeader name={contact.name} sensitivityLevel={contact.sensitivityLevel} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <ContactInfoCard contact={contact} />
            <RelationsCard
              contactId={contact.id}
              outgoingRelations={contact.outgoingRelations}
              incomingRelations={contact.incomingRelations}
            />
            <InteractionsCard contactId={contact.id} interactions={contact.interactions} />
            <EvidenceSection contactId={contact.id} orgId={user.organizationId} />
            <ReviewsSection
              contactId={contact.id}
              orgId={user.organizationId}
              userId={user.id}
              userRole={user.role}
            />
            <AuditTrailViewer contactId={contact.id} />
          </div>
          <div className="space-y-4">
            <ContactSidebarActions contactId={contact.id} userRole={user.role} handleDelete={handleDelete} />
            <RiskFlagsSection contactId={contact.id} metadata={contact.metadata} />
            <ComplianceSection contactId={contact.id} orgId={user.organizationId} userId={user.id} />
            <ExportApprovalSection
              contactId={contact.id}
              orgId={user.organizationId}
              userId={user.id}
              userRole={user.role}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
