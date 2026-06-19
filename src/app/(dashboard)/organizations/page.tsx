import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import Link from "next/link";
import { Building2, Users, FileSpreadsheet, ArrowLeft } from "lucide-react";
import { CreateOrganizationButton } from "./create-button";

export const dynamic = "force-dynamic";

export default async function OrganizationsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const orgs = await prisma.organization.findMany({
    where: user.organizationId
      ? { platformOrganizationId: user.organizationId }
      : {},
    include: {
      _count: {
        select: { users: true, decisions: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-8 max-w-6xl mx-auto" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
            <Building2 className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-foreground">المؤسسات</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              إدارة المؤسسات والمساحات التشغيلية على المنصة
            </p>
          </div>
        </div>
        <CreateOrganizationButton />
      </div>

      {/* Org Cards */}
      {orgs.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4 rounded-lg border-2 border-dashed">
          <Building2 className="h-12 w-12 text-muted-foreground/40" />
          <div className="text-center">
            <p className="text-lg font-medium text-muted-foreground">
              لا توجد مؤسسات بعد
            </p>
            <p className="text-sm text-muted-foreground/60 mt-1">
              أنشئ أول مؤسسة لبدء استخدام المنصة
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {orgs.map((org) => (
            <Link
              key={org.id}
              href={`/organizations/${org.id}`}
              className="group rounded-lg border bg-card p-5 hover:border-primary hover:shadow-sm transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <ArrowLeft className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

              <h2 className="text-lg font-semibold mb-3">{org.name}</h2>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5" />
                  {org._count.users}
                </span>
                <span className="flex items-center gap-1.5">
                  <FileSpreadsheet className="h-3.5 w-3.5" />
                  {org._count.decisions} قرارات
                </span>
              </div>

              <div className="mt-3 text-xs text-muted-foreground/60">
                تاريخ الإنشاء: {new Date(org.createdAt).toLocaleDateString("ar-SA")}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
