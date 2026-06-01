import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { listCampaignOperations } from "@/lib/local-content/campaign-operations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function LocalContentCampaignsPage() {
  const user = await getCurrentUser();
  const campaigns = await listCampaignOperations(user.organizationId);

  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <Link
          href="/local-content/command-center"
          className="text-sm text-muted-foreground hover:underline"
        >
          ← مركز القيادة
        </Link>
        <h1 className="mt-2 text-h2 font-black">عمليات الحملات</h1>
        <p className="text-sm text-muted-foreground">
          تنسيق دورة الحملة — مسودة تشغيلية، المراجعة البشرية مطلوبة
        </p>
      </div>

      <Card className="rounded-[24px]">
        <CardHeader>
          <CardTitle className="text-base">
            الحملات ({campaigns.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {campaigns.length === 0 ? (
            <p className="text-sm text-muted-foreground">لا حملات</p>
          ) : (
            campaigns.map((c) => (
              <div
                key={c.projectId}
                className="rounded-lg border px-3 py-2 text-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Link
                    href={c.href}
                    className="font-medium text-primary hover:underline"
                  >
                    {c.projectName}
                  </Link>
                  <Badge variant="outline">{c.status}</Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  مرحلة: {c.orchestration.currentStage}
                  {c.orchestration.nextStage
                    ? ` → ${c.orchestration.nextStage}`
                    : ""}
                </p>
                {c.orchestration.blockers.length > 0 && (
                  <ul className="mt-1 list-inside list-disc text-xs text-amber-600">
                    {c.orchestration.blockers.map((b) => (
                      <li key={b}>{b}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
