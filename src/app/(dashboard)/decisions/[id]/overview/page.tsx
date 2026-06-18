import { generateExecutiveOverviewAction } from "@/actions/decision-intelligence";
import { DecisionTabs } from "@/components/decisions/decision-tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LinkToInstMem } from "@/components/institutional-memory/link-button";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ExecutiveOverviewPage({ params }: PageProps) {
  const { id } = await params;
  const result = await generateExecutiveOverviewAction(id);

  if (!result.success) {
    return (
      <div className="space-y-6">
        <DecisionTabs decisionId={id} />
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle>الوصول محظور</CardTitle>
            <CardDescription>
              {result.error}
              {result.missing && (
                <ul className="mt-2 list-disc pl-5">
                  {result.missing.map((m) => (
                    <li key={m}>{m.replace(/_/g, " ")}</li>
                  ))}
                </ul>
              )}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const overview = result.data!;

  return (
    <div className="space-y-6">
      <DecisionTabs decisionId={id} />
      <Card className="rounded-[24px] border-border/70 shadow-sm">
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-xl font-black">
                نظرة تنفيذية على القرار
              </CardTitle>
              <CardDescription>
                تُحسَب عند الطلب من مراحل أ-١. موجّهة للجهات التنفيذية.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <LinkToInstMem
                sourceProduct="decision"
                sourceEntityId={id}
                sourceEntityName={"قرار رقم " + id.slice(0, 8)}
              />
              <Badge
                variant={
                  overview.decisionQuality >= 80
                    ? "default"
                    : overview.decisionQuality >= 60
                      ? "secondary"
                      : "destructive"
                }
              >
                الجودة: {overview.decisionQuality}%
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="mb-2 font-bold">الملخص التنفيذي</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {overview.executiveSummary}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="mb-2 font-bold">الملاءمة الاستراتيجية</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {overview.strategicFit}
              </p>
            </div>

            <div>
              <h3 className="mb-2 font-bold">الموقف المخاطري</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {overview.riskPosture}
              </p>
            </div>
          </div>

          <div>
            <h3 className="mb-2 font-bold">التوصية</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {overview.recommendation}
            </p>
          </div>

          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              تُحسَب هذه النظرة عند الطلب من بيانات أ-١. درجة الجودة:{" "}
              {overview.decisionQuality}/100.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
