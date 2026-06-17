import { notFound, redirect } from "next/navigation";
import { requireUserContext } from "@/lib/auth";
import { getContact, updateContact } from "@/actions/contact-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowRight, Save } from "lucide-react";
import Link from "next/link";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditContactPage({ params }: PageProps) {
  await requireUserContext("OPERATOR");
  const { id } = await params;

  const result = await getContact(id);
  if (!result.ok) {
    notFound();
  }

  const contact = result.data;
  const tagsValue = Array.isArray(contact.tags) ? contact.tags.join(", ") : "";

  return (
    <div dir="rtl" className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <div className="flex items-center gap-3">
          <Link href={`/contacts/${id}`}>
            <Button variant="ghost" size="icon">
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
          <Save className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">تعديل جهة الاتصال</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>معلومات جهة الاتصال</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={handleUpdate.bind(null, id)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">الاسم *</Label>
                <Input id="name" name="name" required defaultValue={contact.name} placeholder="أدخل الاسم الكامل" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">البريد الإلكتروني</Label>
                  <Input id="email" name="email" type="email" defaultValue={contact.email ?? ""} placeholder="example@domain.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">رقم الهاتف</Label>
                  <Input id="phone" name="phone" type="tel" defaultValue={contact.phone ?? ""} placeholder="+966 5X XXX XXXX" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="position">المسمى الوظيفي</Label>
                  <Input id="position" name="position" defaultValue={contact.position ?? ""} placeholder="مثال: مدير مالي" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">القسم</Label>
                  <Input id="department" name="department" defaultValue={contact.department ?? ""} placeholder="مثال: المالية" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="organizationName">المنظمة / الشركة</Label>
                <Input id="organizationName" name="organizationName" defaultValue={contact.organizationName ?? ""} placeholder="اسم المنظمة" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sensitivityLevel">مستوى الحساسية</Label>
                <select
                  id="sensitivityLevel"
                  name="sensitivityLevel"
                  defaultValue={contact.sensitivityLevel}
                  className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                >
                  <option value="normal">عادي</option>
                  <option value="sensitive">حساس</option>
                  <option value="confidential">سري</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">الوسوم (مفصولة بفواصل)</Label>
                <Input id="tags" name="tags" defaultValue={tagsValue} placeholder="مثال: عميل, مورد, شريك" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">ملاحظات</Label>
                <Textarea id="notes" name="notes" rows={4} defaultValue={contact.notes ?? ""} placeholder="ملاحظات إضافية عن جهة الاتصال..." />
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit">
                  <Save className="ml-2 h-4 w-4" />
                  حفظ التغييرات
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

async function handleUpdate(id: string, formData: FormData) {
  "use server";

  const result = await updateContact(id, {
    name: formData.get("name") as string,
    email: (formData.get("email") as string) || undefined,
    phone: (formData.get("phone") as string) || undefined,
    position: (formData.get("position") as string) || undefined,
    department: (formData.get("department") as string) || undefined,
    organizationName: (formData.get("organizationName") as string) || undefined,
    sensitivityLevel: (formData.get("sensitivityLevel") as string) || "normal",
    notes: (formData.get("notes") as string) || undefined,
    tags: (formData.get("tags") as string) || undefined,
  });

  if (!result.ok) {
    throw new Error(result.error);
  }

  redirect(`/contacts/${id}`);
}
