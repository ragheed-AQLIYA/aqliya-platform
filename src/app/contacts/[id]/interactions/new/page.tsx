import { redirect } from "next/navigation";
import { requireUserContext } from "@/lib/auth";
import { logContactInteraction } from "@/actions/contact-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowRight, MessageSquare } from "lucide-react";
import Link from "next/link";

interface PageProps {
  params: Promise<{ id: string }>;
}

const INTERACTION_TYPES = [
  { value: "meeting", label: "اجتماع" },
  { value: "call", label: "مكالمة" },
  { value: "email", label: "بريد إلكتروني" },
  { value: "message", label: "رسالة" },
  { value: "note", label: "ملاحظة" },
  { value: "other", label: "أخرى" },
];

export default async function NewInteractionPage({ params }: PageProps) {
  await requireUserContext("OPERATOR");
  const { id } = await params;

  return (
    <div dir="rtl" className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <div className="flex items-center gap-3">
          <Link href={`/contacts/${id}`}>
            <Button variant="ghost" size="icon">
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
          <MessageSquare className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">تسجيل تفاعل جديد</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>بيانات التفاعل</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={handleCreate.bind(null, id)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="interactionType">نوع التفاعل *</Label>
                <select
                  id="interactionType"
                  name="interactionType"
                  required
                  className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                >
                  <option value="">اختر نوع التفاعل...</option>
                  {INTERACTION_TYPES.map((it) => (
                    <option key={it.value} value={it.value}>{it.label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">الموضوع</Label>
                <Input id="subject" name="subject" placeholder="موضوع التفاعل..." />
              </div>

              <div className="space-y-2">
                <Label htmlFor="summary">ملخص / ملاحظات</Label>
                <Textarea
                  id="summary"
                  name="summary"
                  rows={4}
                  placeholder="تفاصيل التفاعل..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="occurredAt">تاريخ ووقت التفاعل *</Label>
                <Input
                  id="occurredAt"
                  name="occurredAt"
                  type="datetime-local"
                  required
                  defaultValue={new Date().toISOString().slice(0, 16)}
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit">
                  <MessageSquare className="ml-2 h-4 w-4" />
                  تسجيل التفاعل
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

async function handleCreate(contactId: string, formData: FormData) {
  "use server";

  const result = await logContactInteraction(
    contactId,
    formData.get("interactionType") as string,
    (formData.get("subject") as string) || "",
    (formData.get("summary") as string) || "",
    (formData.get("occurredAt") as string) || new Date().toISOString(),
  );

  if (!result.ok) {
    throw new Error(result.error);
  }

  redirect(`/contacts/${contactId}`);
}
