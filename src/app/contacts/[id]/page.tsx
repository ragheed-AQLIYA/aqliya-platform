import { unstable_noStore as noStore } from "next/cache";
import { notFound, redirect } from "next/navigation";
import { requireUserContext } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getContact } from "@/actions/contact-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
} from "lucide-react";

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
          </div>
        </div>
      </div>
    </div>
  );
}

async function deleteAction(id: string) {
  "use server";
  const { deleteContact } = await import("@/actions/contact-actions");
  await deleteContact(id);
  redirect("/contacts");
}
