import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { buildOrganizationContentCalendar } from "@/lib/local-content/command-center";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function LocalContentCalendarPage() {
  const user = await getCurrentUser();
  const months = await buildOrganizationContentCalendar(user.organizationId);

  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <Link
          href="/local-content"
          className="text-sm text-muted-foreground hover:underline"
        >
          ← LocalContentOS
        </Link>
        <h1 className="mt-2 text-h2 font-black">التقويم التحريري</h1>
        <p className="text-sm text-muted-foreground">
          ملكية ومواعيد وحالة سير العمل — مسودة تشغيلية
        </p>
      </div>

      {months.length === 0 ? (
        <p className="text-sm text-muted-foreground">لا توجد عناصر مجدولة</p>
      ) : (
        months.map((m) => (
          <Card key={`${m.year}-${m.month}`} className="rounded-[24px]">
            <CardHeader>
              <CardTitle className="text-base">
                {m.year}/{m.month} — متأخر: {m.overdueCount} — مراجعة:{" "}
                {m.upcomingReviewCount}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {m.entries.map((e) => (
                  <li key={e.id} className="flex justify-between rounded-lg border px-3 py-2">
                    <Link
                      href={`/local-content/projects/${e.projectId}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {e.titleAr}
                    </Link>
                    <span className="text-xs text-muted-foreground">{e.status}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
