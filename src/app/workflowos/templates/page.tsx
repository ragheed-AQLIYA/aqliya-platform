import { requireUserContext } from "@/lib/auth";
import { listWorkflowTemplates } from "@/actions/workflowos-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function WorkflowTemplatesPage() {
  const user = await requireUserContext();
  const result = await listWorkflowTemplates(user.organizationId);

  const templates = result.success && result.data ? result.data : [];

  return (
    <div dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">قوالب سير العمل</h1>
        <Link
          href="/workflowos/templates/new"
          className={cn(buttonVariants(), "inline-flex items-center gap-1")}
        >
          إنشاء قالب جديد
        </Link>
      </div>

      {templates.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>لا توجد قوالب بعد</p>
          <p className="mt-2 text-sm">أنشئ أول قالب لبدء استخدام سير العمل</p>
          <Link
            href="/workflowos/templates/new"
            className={cn(buttonVariants(), "mt-4 inline-flex items-center gap-1")}
          >
            إنشاء قالب جديد
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => {
            const steps = (template.steps as unknown[] | null) ?? [];
            return (
              <Link key={template.id} href={`/workflowos/templates/${template.id}`}>
                <Card className="h-full hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <Badge variant="outline">{template.category}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {template.description && (
                      <p className="text-sm text-muted-foreground mb-3">
                        {template.description}
                      </p>
                    )}
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span>{steps.length} خطوة</span>
                      <span>{template._count.records} سجل</span>
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
