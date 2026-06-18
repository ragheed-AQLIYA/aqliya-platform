import { requireUserContext } from "@/lib/auth";
import { workflow_listOrgRecords } from "@/actions/workflowos-actions";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<string, string> = {
  all: "الكل",
  pending: "معلق",
  in_progress: "قيد التنفيذ",
  completed: "مكتمل",
  rejected: "مرفوض",
  cancelled: "ملغي",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  in_progress: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  cancelled: "bg-gray-100 text-gray-800",
};

export default async function WorkflowRecordsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const { status, q } = await searchParams;
  const user = await requireUserContext();
  const result = await workflow_listOrgRecords(user.organizationId, status, q);

  const records = result.success && result.data ? result.data : [];
  const activeStatus = status ?? "all";

  return (
    <div dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">سجلات سير العمل</h1>
      </div>

      {/* Search bar */}
      <form
        method="GET"
        action="/workflowos/records"
        className="flex gap-2 mb-4"
      >
        <input
          type="search"
          name="q"
          defaultValue={q ?? ""}
          placeholder="بحث عن سجل..."
          className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
        {q && (
          <Link
            href={status ? `/workflowos/records?status=${status}` : "/workflowos/records"}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
          >
            إلغاء
          </Link>
        )}
        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
        >
          بحث
        </button>
      </form>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {Object.entries(STATUS_LABELS).map(([key, label]) => (
          <Link
            key={key}
            href={key === "all" ? (q ? `/workflowos/records?q=${q}` : "/workflowos/records") : (q ? `/workflowos/records?status=${key}&q=${q}` : `/workflowos/records?status=${key}`)}
          >
            <Badge
              variant={activeStatus === key ? "default" : "outline"}
              className="cursor-pointer whitespace-nowrap"
            >
              {label}
            </Badge>
          </Link>
        ))}
      </div>

      {records.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>لا توجد سجلات</p>
          <p className="mt-2 text-sm">
            ابدأ سير عمل جديد من قالب لظهور السجلات هنا
          </p>
          <Link
            href="/workflowos/templates"
            className={cn(buttonVariants(), "mt-4 inline-flex items-center gap-1")}
          >
            استعراض القوالب
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {records.map((record) => {
            const steps = (record.steps as unknown[] | null) ?? [];
            return (
              <Link key={record.id} href={`/workflowos/records/${record.id}`}>
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{record.title}</p>
                      <div className="flex gap-3 mt-1 text-sm text-muted-foreground">
                        <span>{record.template.name}</span>
                        {record.assignedToId && (
                          <span>مسند إلى: {record.assignedToId}</span>
                        )}
                        {record.dueDate && (
                          <span>
                            تاريخ الاستحقاق:{" "}
                            {new Date(record.dueDate).toLocaleDateString("ar-SA")}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0 mr-4">
                      <Badge className={STATUS_COLORS[record.status] ?? ""}>
                        {STATUS_LABELS[record.status] ?? record.status}
                      </Badge>
                      <Badge variant="outline">
                        {record.currentStep}/{steps.length}
                      </Badge>
                      <Badge variant="secondary">{record.priority}</Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
