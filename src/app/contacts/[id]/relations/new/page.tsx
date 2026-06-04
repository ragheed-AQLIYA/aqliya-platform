import { redirect } from "next/navigation";
import { requireUserContext } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createContactRelation } from "@/actions/contact-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowRight, Link2 } from "lucide-react";
import Link from "next/link";

interface PageProps {
  params: Promise<{ id: string }>;
}

const RELATION_TYPES = [
  { value: "colleague", label: "زميل" },
  { value: "manager", label: "مدير" },
  { value: "subordinate", label: "مرؤوس" },
  { value: "partner", label: "شريك" },
  { value: "client", label: "عميل" },
  { value: "vendor", label: "مورد" },
  { value: "board_member", label: "عضو مجلس إدارة" },
  { value: "investor", label: "مستثمر" },
  { value: "other", label: "أخرى" },
];

export default async function NewRelationPage({ params }: PageProps) {
  await requireUserContext("OPERATOR");
  const { id } = await params;

  const contacts = await prisma.localContact.findMany({
    where: {
      organizationId: (await requireUserContext("OPERATOR")).organizationId,
      isActive: true,
      id: { not: id },
    },
    orderBy: { name: "asc" },
    select: { id: true, name: true, organizationName: true, position: true },
  });

  return (
    <div dir="rtl" className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <div className="flex items-center gap-3">
          <Link href={`/contacts/${id}`}>
            <Button variant="ghost" size="icon">
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
          <Link2 className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">إضافة علاقة جديدة</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>بيانات العلاقة</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={handleCreate.bind(null, id)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="targetContactId">جهة الاتصال المستهدفة *</Label>
                <select
                  id="targetContactId"
                  name="targetContactId"
                  required
                  className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                >
                  <option value="">اختر جهة اتصال...</option>
                  {contacts.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}{c.organizationName ? ` — ${c.organizationName}` : ""}{c.position ? ` (${c.position})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="relationType">نوع العلاقة *</Label>
                <select
                  id="relationType"
                  name="relationType"
                  required
                  className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                >
                  <option value="">اختر نوع العلاقة...</option>
                  {RELATION_TYPES.map((rt) => (
                    <option key={rt.value} value={rt.value}>{rt.label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">وصف العلاقة</Label>
                <Textarea
                  id="description"
                  name="description"
                  rows={3}
                  placeholder="وصف مختصر للعلاقة..."
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit">
                  <Link2 className="ml-2 h-4 w-4" />
                  حفظ العلاقة
                </Button>
                <Link href={`/contacts/${id}`}>
                  <Button type="button" variant="outline">إلغاء</Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

async function handleCreate(sourceId: string, formData: FormData) {
  "use server";

  const result = await createContactRelation(
    sourceId,
    formData.get("targetContactId") as string,
    formData.get("relationType") as string,
    (formData.get("description") as string) || undefined,
  );

  if (!result.ok) {
    throw new Error(result.error);
  }

  redirect(`/contacts/${sourceId}`);
}
