import { unstable_noStore as noStore } from "next/cache";
import { requireUserContext } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, Search, Users } from "lucide-react";

export const dynamic = "force-dynamic";

function sensitivityBadge(sensitivityLevel: string) {
  const map: Record<string, { label: string; className: string }> = {
    normal: { label: "عادي", className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100" },
    sensitive: { label: "حساس", className: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100" },
    confidential: { label: "سري", className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100" },
  };
  const entry = map[sensitivityLevel] || map.normal;
  return <Badge className={entry.className}>{entry.label}</Badge>;
}

interface PageProps {
  searchParams: Promise<{ search?: string; sensitivity?: string }>;
}

export default async function ContactsPage({ searchParams }: PageProps) {
  noStore();
  const user = await requireUserContext("VIEWER");
  const params = await searchParams;

  const where: Record<string, unknown> = {
    organizationId: user.organizationId,
    isActive: true,
  };

  if (params.sensitivity) {
    where.sensitivityLevel = params.sensitivity;
  }

  if (params.search) {
    where.OR = [
      { name: { contains: params.search } },
      { email: { contains: params.search } },
      { organizationName: { contains: params.search } },
      { position: { contains: params.search } },
    ];
  }

  const contacts = await prisma.localContact.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  const parsed = contacts.map((c) => ({
    ...c,
    tags: typeof c.tags === "string" ? JSON.parse(c.tags) : c.tags,
  }));

  return (
    <div dir="rtl" className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">جهات الاتصال المؤسسية</h1>
          </div>
          <Link href="/contacts/new">
            <Button>
              <Plus className="ml-2 h-4 w-4" />
              إضافة جهة اتصال
            </Button>
          </Link>
        </div>

        <form method="GET" className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              name="search"
              placeholder="بحث بالاسم أو البريد الإلكتروني أو المنظمة..."
              defaultValue={params.search || ""}
              className="pr-10"
            />
          </div>
          <select
            name="sensitivity"
            defaultValue={params.sensitivity || ""}
            className="border rounded-md px-3 py-2 text-sm bg-background"
          >
            <option value="">جميع المستويات</option>
            <option value="normal">عادي</option>
            <option value="sensitive">حساس</option>
            <option value="confidential">سري</option>
          </select>
          <Button type="submit" variant="outline">بحث</Button>
        </form>

        {parsed.length === 0 ? (
          <div className="text-center py-16">
            <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">لا توجد جهات اتصال</h2>
            <p className="text-muted-foreground mb-6">
              أضف أول جهة اتصال مؤسسية للبدء في بناء سجل العلاقات.
            </p>
            <Link href="/contacts/new">
              <Button>
                <Plus className="ml-2 h-4 w-4" />
                إضافة جهة اتصال
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {parsed.map((contact) => (
              <Link key={contact.id} href={`/contacts/${contact.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{contact.name}</CardTitle>
                      {sensitivityBadge(contact.sensitivityLevel)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {contact.position && (
                      <p className="text-sm text-muted-foreground">{contact.position}</p>
                    )}
                    {contact.organizationName && (
                      <p className="text-sm text-muted-foreground">{contact.organizationName}</p>
                    )}
                    {contact.email && (
                      <p className="text-sm text-muted-foreground direction-ltr">{contact.email}</p>
                    )}
                    {Array.isArray(contact.tags) && contact.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {contact.tags.map((tag: string) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
