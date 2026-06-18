import { unstable_noStore as noStore } from "next/cache";
import { notFound, redirect } from "next/navigation";
import { requireUserContext } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getContact } from "@/actions/contact-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import {
  ArrowRight,
  Mail,
  Phone,
  Briefcase,
  Building2,
  FileText,
  Tags,
  Edit,
  Trash2,
  Link2,
  MessageSquare,
  Calendar,
  Upload,
  CheckCircle,
  XCircle,
  Shield,
  Download,
  Eye,
  AlertTriangle,
  Scale,
} from "lucide-react";
import { CompliancePanel } from "@/components/contacts/compliance-panel";
import { ExportApprovalBadge } from "@/components/contacts/export-approval-badge";
import { ExportApprovalDialog } from "@/components/contacts/export-approval-dialog";
import { ContactExportButton } from "@/components/contacts/contact-export-button";
import { ReviewAssignmentPanel } from "@/components/contacts/review-assignment-panel";
import { RiskFlagsPanel } from "@/components/contacts/risk-flags-panel";
import { AuditTrailViewer } from "@/components/contacts/audit-trail-viewer";

interface PageProps {
  params: Promise<{ id: string }>;
}

function sensitivityBadge(sensitivityLevel: string) {
  const map: Record<string, { label: string; className: string }> = {
    normal: { label: "عادي", className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100" },
    sensitive: { label: "حساس", className: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100" },
    confidential: { label: "سري", className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100" },
  };
  const entry = map[sensitivityLevel] || map.normal;
  return <Badge className={entry.className}>{entry.label}</Badge>;
}

function interactionTypeIcon(type: string) {
  const map: Record<string, string> = {
    meeting: "📅",
    call: "📞",
    email: "📧",
    message: "💬",
    note: "📝",
    other: "📌",
  };
  return map[type] || "📌";
}

function interactionTypeLabel(type: string) {
  const map: Record<string, string> = {
    meeting: "اجتماع",
    call: "مكالمة",
    email: "بريد إلكتروني",
    message: "رسالة",
    note: "ملاحظة",
    other: "أخرى",
  };
  return map[type] || type;
}

export default async function ContactDetailPage({ params }: PageProps) {
  noStore();
  const user = await requireUserContext("VIEWER");
  const { id } = await params;

  const result = await getContact(id);
  if (!result.ok) {
    notFound();
  }

  const contact = result.data;

  const handleDelete = deleteAction.bind(null, id);

  return (
    <div dir="rtl" className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/contacts">
            <Button variant="ghost" size="icon">
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold flex-1">{contact.name}</h1>
          {sensitivityBadge(contact.sensitivityLevel)}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>معلومات الاتصال</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {contact.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <span dir="ltr">{contact.email}</span>
                  </div>
                )}
                {contact.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <span dir="ltr">{contact.phone}</span>
                  </div>
                )}
                {contact.position && (
                  <div className="flex items-center gap-3">
                    <Briefcase className="h-5 w-5 text-muted-foreground" />
                    <span>{contact.position}</span>
                  </div>
                )}
                {contact.department && (
                  <div className="flex items-center gap-3">
                    <Building2 className="h-5 w-5 text-muted-foreground" />
                    <span>{contact.department}</span>
                  </div>
                )}
                {contact.organizationName && (
                  <div className="flex items-center gap-3">
                    <Building2 className="h-5 w-5 text-muted-foreground" />
                    <span>{contact.organizationName}</span>
                  </div>
                )}
                {contact.notes && (
                  <div className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <span className="whitespace-pre-wrap">{contact.notes}</span>
                  </div>
                )}
                {Array.isArray(contact.tags) && contact.tags.length > 0 && (
                  <div className="flex items-start gap-3">
                    <Tags className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="flex flex-wrap gap-1">
                      {contact.tags.map((tag: string) => (
                        <Badge key={tag} variant="outline">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Link2 className="h-5 w-5" />
                  العلاقات
                </CardTitle>
                <Link href={`/contacts/${contact.id}/relations/new`}>
                  <Button size="sm" variant="outline">
                    إضافة علاقة
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {(contact.outgoingRelations?.length ?? 0) === 0 &&
                (contact.incomingRelations?.length ?? 0) === 0 ? (
                  <p className="text-muted-foreground text-sm">لا توجد علاقات مسجلة</p>
                ) : (
                  <div className="space-y-3">
                    {contact.outgoingRelations?.map((rel) => (
                      <div key={rel.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{rel.relationType}</Badge>
                          <span>→</span>
                          <Link href={`/contacts/${rel.targetContact.id}`} className="hover:underline font-medium">
                            {rel.targetContact.name}
                          </Link>
                        </div>
                        {rel.description && (
                          <span className="text-sm text-muted-foreground">{rel.description}</span>
                        )}
                      </div>
                    ))}
                    {contact.incomingRelations?.map((rel) => (
                      <div key={rel.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-2">
                          <Link href={`/contacts/${rel.sourceContact.id}`} className="hover:underline font-medium">
                            {rel.sourceContact.name}
                          </Link>
                          <span>→</span>
                          <Badge variant="secondary">{rel.relationType}</Badge>
                        </div>
                        {rel.description && (
                          <span className="text-sm text-muted-foreground">{rel.description}</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  التفاعلات
                </CardTitle>
                <Link href={`/contacts/${contact.id}/interactions/new`}>
                  <Button size="sm" variant="outline">
                    تسجيل تفاعل
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {!contact.interactions || contact.interactions.length === 0 ? (
                  <p className="text-muted-foreground text-sm">لا توجد تفاعلات مسجلة</p>
                ) : (
                  <div className="space-y-4">
                    {contact.interactions.map((interaction) => (
                      <div key={interaction.id} className="border-r-4 border-primary pr-4 py-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                          <span>{interactionTypeIcon(interaction.interactionType)}</span>
                          <Badge variant="outline" className="text-xs">
                            {interactionTypeLabel(interaction.interactionType)}
                          </Badge>
                          <span>•</span>
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(interaction.occurredAt).toLocaleDateString("ar-SA")}</span>
                        </div>
                        {interaction.subject && (
                          <p className="font-medium">{interaction.subject}</p>
                        )}
                        {interaction.summary && (
                          <p className="text-sm text-muted-foreground mt-1">{interaction.summary}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Evidence Section */}
            <EvidenceSection contactId={contact.id} orgId={user.organizationId} />

            {/* Reviews Section */}
            <ReviewsSection contactId={contact.id} orgId={user.organizationId} userId={user.id} userRole={user.role} />

            {/* Audit Trail Section */}
            <AuditTrailViewer contactId={contact.id} />
          </div>

          <div className="space-y-4">
            {user.role === "ADMIN" || user.role === "OPERATOR" ? (
              <>
                <Link href={`/contacts/${contact.id}/edit`}>
                  <Button variant="outline" className="w-full">
                    <Edit className="ml-2 h-4 w-4" />
                    تعديل
                  </Button>
                </Link>
                <form action={handleDelete}>
                  <Button type="submit" variant="destructive" className="w-full">
                    <Trash2 className="ml-2 h-4 w-4" />
                    حذف
                  </Button>
                </form>
              </>
            ) : null}
            <RiskFlagsSidebarSection contactId={contact.id} metadata={contact.metadata} />
            <ComplianceSidebarSection contactId={contact.id} orgId={user.organizationId} userId={user.id} />
            <ExportApprovalSidebarSection contactId={contact.id} orgId={user.organizationId} userId={user.id} userRole={user.role} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Evidence Section ──────────────────────────────────

async function EvidenceSection({
  contactId,
  orgId,
}: {
  contactId: string;
  orgId: string;
}) {
  const evidence = await prisma.contactEvidence.findMany({
    where: { organizationId: orgId, contactId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          الأدلة والملفات
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <details className="border rounded-lg p-3">
          <summary className="cursor-pointer font-medium text-sm text-muted-foreground hover:text-foreground">
            رفع دليل جديد
          </summary>
          <form action={uploadEvidenceAction} className="mt-3 space-y-3">
            <input type="hidden" name="contactId" value={contactId} />
            <div>
              <label className="text-sm font-medium">اسم الملف</label>
              <Input name="filename" required placeholder="اسم الملف" />
            </div>
            <div>
              <label className="text-sm font-medium">نوع الملف</label>
              <Input name="fileType" required placeholder="pdf, docx, xlsx, image..." />
            </div>
            <div>
              <label className="text-sm font-medium">نوع الدليل</label>
              <select
                name="evidenceType"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                defaultValue="document"
              >
                <option value="document">مستند</option>
                <option value="note">ملاحظة</option>
                <option value="reference">مرجع</option>
                <option value="attachment">مرفق</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">وصف</label>
              <Textarea name="description" placeholder="وصف الملف" />
            </div>
            <Button type="submit" size="sm">
              <Upload className="ml-1 h-4 w-4" />
              رفع
            </Button>
          </form>
        </details>

        {evidence.length === 0 ? (
          <p className="text-muted-foreground text-sm">لا توجد أدلة مرفوعة</p>
        ) : (
          <div className="space-y-2">
            {evidence.map((e) => (
              <div
                key={e.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm">{e.filename}</p>
                    <p className="text-xs text-muted-foreground">
                      {e.evidenceType} • {e.fileType}
                      {e.sizeBytes && ` • ${(e.sizeBytes / 1024).toFixed(1)} KB`}
                    </p>
                    {e.description && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {e.description}
                      </p>
                    )}
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">
                  {new Date(e.createdAt).toLocaleDateString("ar-SA")}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Reviews Section (Enhanced L5) ─────────────────────

async function ReviewsSection({
  contactId,
  orgId,
  userId,
  userRole,
}: {
  contactId: string;
  orgId: string;
  userId: string;
  userRole: string;
}) {
  const [reviews, availableReviewers] = await Promise.all([
    prisma.contactReview.findMany({
      where: { organizationId: orgId, contactId },
      include: { approvals: true },
      orderBy: { createdAt: "desc" },
    }),
    userRole === "ADMIN" || userRole === "OPERATOR"
      ? prisma.user.findMany({
          where: { organizationId: orgId, role: { in: ["ADMIN", "OPERATOR"] } },
          select: { id: true, name: true, email: true, role: true },
          orderBy: { name: "asc" },
        })
      : [],
  ]);

  const serializedReviews = reviews.map((r) => ({
    ...r,
    reviewDueDate: r.reviewDueDate?.toISOString() ?? null,
    completedAt: r.completedAt?.toISOString() ?? null,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
    approvals: r.approvals.map((a) => ({
      ...a,
      createdAt: a.createdAt.toISOString(),
    })),
  }));

  return (
    <ReviewAssignmentPanel
      contactId={contactId}
      organizationId={orgId}
      reviews={serializedReviews}
      availableReviewers={availableReviewers}
      userRole={userRole}
    />
  );
}

// ─── Risk Flags Sidebar Section ─────────────────────────

async function RiskFlagsSidebarSection({
  contactId,
  metadata,
}: {
  contactId: string;
  metadata: unknown;
}) {
  const riskFlags = extractRiskFlags(metadata);
  return <RiskFlagsPanel key={contactId} contactId={contactId} initialFlags={riskFlags} />;
}

function extractRiskFlags(metadata: unknown): import("@/actions/contact-actions").RiskFlag[] {
  if (!metadata || typeof metadata !== "object") return [];
  const meta = metadata as Record<string, unknown>;
  return (meta.riskFlags as import("@/actions/contact-actions").RiskFlag[]) || [];
}

// ─── Compliance Sidebar Section ─────────────────────────

async function ComplianceSidebarSection({
  contactId,
  orgId,
  userId,
}: {
  contactId: string;
  orgId: string;
  userId: string;
}) {
  const { getExportComplianceSummary } = await import("@/lib/localcontactos/compliance-service");
  const user = await requireUserContext("VIEWER");
  const summary = await getExportComplianceSummary(contactId, user);

  return <CompliancePanel summary={summary} />;
}

// ─── Export Approval Sidebar Section ────────────────────

async function ExportApprovalSidebarSection({
  contactId,
  orgId,
  userId,
  userRole,
}: {
  contactId: string;
  orgId: string;
  userId: string;
  userRole: string;
}) {
  const contact = await prisma.localContact.findUnique({
    where: { id: contactId },
    select: { sensitivityLevel: true, exportStatus: true },
  });
  if (!contact) return null;

  const exportRequests = await prisma.contactExportRequest.findMany({
    where: { organizationId: orgId, contactId },
    orderBy: { createdAt: "desc" },
  });

  const serializedRequests = exportRequests.map((r) => ({
    ...r,
    reviewedAt: r.reviewedAt?.toISOString() ?? null,
    exportedAt: r.exportedAt?.toISOString() ?? null,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
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
        exportRequests={serializedRequests}
      />
      {contact.exportStatus === "approved" && (
        <ContactExportButton contactId={contactId} />
      )}
    </>
  );
}

async function deleteAction(id: string) {
  "use server";
  const { deleteContact } = await import("@/actions/contact-actions");
  await deleteContact(id);
  redirect("/contacts");
}

async function uploadEvidenceAction(formData: FormData) {
  "use server";
  const { uploadContactEvidence } = await import("@/actions/contact-actions");
  const contactId = formData.get("contactId") as string;
  const filename = formData.get("filename") as string;
  const fileType = formData.get("fileType") as string;
  const description = formData.get("description") as string;
  const evidenceType = formData.get("evidenceType") as string;

  await uploadContactEvidence({
    contactId,
    filename,
    fileType,
    description: description || undefined,
    evidenceType: evidenceType || "document",
  });
}

async function createReviewAction(formData: FormData) {
  "use server";
  const { createContactReview } = await import("@/actions/contact-actions");
  const { getCurrentUser } = await import("@/lib/auth");
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");

  const contactId = formData.get("contactId") as string;
  const reviewType = formData.get("reviewType") as string;

  await createContactReview({
    contactId,
    reviewType: reviewType || "sensitivity",
    reviewerId: formData.get("reviewerId") as string || user.id,
    reviewerName: user.name,
    reason: (formData.get("reason") as string) || undefined,
  });
  redirect(`/contacts/${contactId}`);
}

async function approveReviewAction(formData: FormData) {
  "use server";
  const { approveContactReview } = await import("@/actions/contact-actions");
  const reviewId = formData.get("reviewId") as string;
  const note = formData.get("note") as string;
  await approveContactReview(reviewId, note || undefined);
  redirect(`/contacts/${formData.get("contactId") as string}`);
}

async function rejectReviewAction(formData: FormData) {
  "use server";
  const { rejectContactReview } = await import("@/actions/contact-actions");
  const reviewId = formData.get("reviewId") as string;
  const note = formData.get("note") as string;
  await rejectContactReview(reviewId, note || undefined);
  redirect(`/contacts/${formData.get("contactId") as string}`);
}
