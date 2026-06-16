import { unstable_noStore as noStore } from "next/cache";
import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { listTemplatesAction } from "../actions";
import { TemplateCreateForm } from "./template-create-form";

export const dynamic = "force-dynamic";

export default async function TemplatesPage() {
  noStore();
  const res = await listTemplatesAction();
  const templates = res.ok ? res.data : [];

  return (
    <div dir="rtl" className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      <Link
        href="/content-studio"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowRight className="h-4 w-4" />
        العودة إلى Content Studio
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">القوالب</h1>
          <p className="text-sm text-muted-foreground">
            قوالب المحتوى لإعادة الاستخدام — استخدم{" "}
            <code className="text-xs bg-muted px-1 rounded">{`{{variable}}`}</code> للمتغيرات
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {!res.ok ? (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
              تعذر تحميل القوالب: {res.error}
            </div>
          ) : null}

          {res.ok && templates.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <FileText className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">لا توجد قوالب بعد</p>
            </div>
          ) : null}

          {res.ok && templates.length > 0
            ? templates.map((t) => (
                <Card key={t.id}>
                  <CardHeader>
                    <CardTitle>{t.name}</CardTitle>
                    {t.description ? (
                      <p className="text-xs text-muted-foreground">
                        {t.description}
                      </p>
                    ) : null}
                  </CardHeader>
                  <CardContent>
                    <pre className="rounded-lg bg-muted p-3 text-xs overflow-x-auto whitespace-pre-wrap">
                      {t.bodyTemplate.slice(0, 200)}
                      {t.bodyTemplate.length > 200 ? "..." : null}
                    </pre>
                    <div className="flex items-center gap-2 mt-3">
                      {t.category ? (
                        <Badge variant="outline">{t.category}</Badge>
                      ) : null}
                      {t.defaultReviewRoles.length > 0 ? (
                        <Badge variant="secondary">
                          {t.defaultReviewRoles.length} دور مراجعة
                        </Badge>
                      ) : null}
                    </div>
                  </CardContent>
                </Card>
              ))
            : null}
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>قالب جديد</CardTitle>
            </CardHeader>
            <CardContent>
              <TemplateCreateForm />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
