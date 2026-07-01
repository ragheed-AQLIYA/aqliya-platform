import { prisma } from "@/lib/prisma";
import { requireUserContext } from "@/lib/auth";

export default async function LcosHealthPage() {
  await requireUserContext();

  const checks = await getHealthChecks();

  return (
    <div className="space-y-6 p-6" dir="rtl">
      <h1 className="text-2xl font-bold">صحة نظام المحتوى المحلي</h1>
      <h2 className="text-lg text-muted-foreground">LocalContentOS Health</h2>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {checks.map((check) => (
          <div key={check.name} className="rounded-lg border p-4">
            <div className="flex items-center gap-2">
              <span className={`h-3 w-3 rounded-full ${check.status === "healthy" ? "bg-green-500" : "bg-red-500"}`} />
              <span className="font-medium">{check.label}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">{check.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

async function getHealthChecks() {
  try {
    const projectCount = await prisma.localContentProject.count();
    const workbookCount = await prisma.lcWorkbook.count();

    return [
      { name: "db", label: "قاعدة البيانات / Database", status: "healthy", message: `${projectCount} مشروع, ${workbookCount} كشاف` },
      { name: "projects", label: "المشاريع / Projects", status: projectCount > 0 ? "healthy" : "degraded", message: `${projectCount} مشروع` },
      { name: "workbooks", label: "الكشوف / Workbooks", status: workbookCount > 0 ? "healthy" : "degraded", message: `${workbookCount} كشاف` },
    ];
  } catch {
    return [{ name: "db", label: "قاعدة البيانات / Database", status: "unhealthy", message: "تعذر الاتصال / Connection failed" }];
  }
}
